import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { encryptionService } from '../utils/encryption.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import { createPlatformAdapter } from '../adapters/factory.js';
import { syncQueue, JobNames } from '../jobs/queues/index.js';
import type {
  ListClientsQuery,
  CreateClientInput,
  UpdateClientInput,
} from '../validators/client.validator.js';
import { Prisma } from '@prisma/client';

export class ClientsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, platform, accountManagerId, search, page, limit, sortBy, sortOrder } = req.query as unknown as ListClientsQuery;

      const where: Prisma.ClientWhereInput = {};

      if (status) where.status = status;
      if (platform) where.platform = platform;
      if (accountManagerId) where.accountManagerId = accountManagerId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            accountManager: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            _count: {
              select: {
                campaigns: true,
                lists: true,
                alerts: { where: { isRead: false } },
              },
            },
          },
        }),
        prisma.client.count({ where }),
      ]);

      sendPaginated(res, clients, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          accountManager: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          credentials: {
            select: {
              isValid: true,
              lastVerifiedAt: true,
              verifyError: true,
            },
          },
          contextSnippets: true,
          _count: {
            select: {
              campaigns: true,
              lists: true,
              assets: true,
              cadences: true,
              alerts: { where: { isRead: false } },
            },
          },
        },
      });

      if (!client) {
        throw new NotFoundError('Client', id);
      }

      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credentials, ...data } = req.body as CreateClientInput;

      const client = await prisma.client.create({
        data: {
          ...data,
          status: 'ONBOARDING',
        },
      });

      // If credentials provided, encrypt and store them
      if (credentials && Object.keys(credentials).length > 0) {
        const encrypted = encryptionService.encryptCredentials(credentials);
        await prisma.clientCredential.create({
          data: {
            clientId: client.id,
            encryptedData: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
          },
        });
      }

      sendCreated(res, client);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { credentials, ...data } = req.body as UpdateClientInput;

      // Check client exists
      const existing = await prisma.client.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Client', id);
      }

      // Update client
      const client = await prisma.client.update({
        where: { id },
        data,
      });

      // If credentials provided, update them
      if (credentials && Object.keys(credentials).length > 0) {
        const encrypted = encryptionService.encryptCredentials(credentials);
        await prisma.clientCredential.upsert({
          where: { clientId: id },
          create: {
            clientId: id,
            encryptedData: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
          },
          update: {
            encryptedData: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            isValid: true,
            verifyError: null,
          },
        });
      }

      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.client.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Client', id);
      }

      // Soft delete by setting status to CHURNED
      await prisma.client.update({
        where: { id },
        data: { status: 'CHURNED' },
      });

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
        include: { credentials: true },
      });

      if (!client) {
        throw new NotFoundError('Client', id);
      }

      if (!client.credentials) {
        sendSuccess(res, {
          success: false,
          error: 'No credentials configured for this client',
        });
        return;
      }

      // Decrypt credentials
      const credentials = encryptionService.decryptCredentials({
        ciphertext: client.credentials.encryptedData,
        iv: client.credentials.iv,
        authTag: client.credentials.authTag,
      });

      // Create adapter and test connection
      const adapter = createPlatformAdapter(client.platform, id, credentials);
      const result = await adapter.testConnection();

      // Update credential validity
      await prisma.clientCredential.update({
        where: { clientId: id },
        data: {
          isValid: result.success,
          lastVerifiedAt: new Date(),
          verifyError: result.error || null,
        },
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async triggerSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({ where: { id } });
      if (!client) {
        throw new NotFoundError('Client', id);
      }

      // Add sync job to queue
      await syncQueue.add(JobNames.SYNC_CAMPAIGNS, { clientId: id });

      sendSuccess(res, { message: 'Sync job queued successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
        select: {
          id: true,
          contextMarkdown: true,
          contextSnippets: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!client) {
        throw new NotFoundError('Client', id);
      }

      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  }

  async listAccountManagers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const managers = await prisma.user.findMany({
        where: {
          isActive: true,
          role: { in: ['ADMIN', 'MANAGER'] },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: { firstName: 'asc' },
      });

      sendSuccess(res, managers);
    } catch (error) {
      next(error);
    }
  }

  async updateContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { contextMarkdown, snippets } = req.body;

      const client = await prisma.client.findUnique({ where: { id } });
      if (!client) {
        throw new NotFoundError('Client', id);
      }

      // Update context markdown
      if (contextMarkdown !== undefined) {
        await prisma.client.update({
          where: { id },
          data: { contextMarkdown },
        });
      }

      // Update snippets if provided
      if (snippets && Array.isArray(snippets)) {
        // Delete existing snippets and recreate
        await prisma.contextSnippet.deleteMany({ where: { clientId: id } });
        await prisma.contextSnippet.createMany({
          data: snippets.map((s: any) => ({
            clientId: id,
            type: s.type,
            title: s.title,
            content: s.content,
          })),
        });
      }

      sendSuccess(res, { message: 'Context updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}
