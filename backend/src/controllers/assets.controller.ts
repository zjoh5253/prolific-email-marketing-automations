import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

export class AssetsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, type, page = 1, limit = 50 } = req.query as any;

      const where: any = {};
      if (clientId) where.clientId = clientId;
      if (type) where.type = type;

      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            client: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.asset.count({ where }),
      ]);

      sendPaginated(res, assets, Number(page), Number(limit), total);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const asset = await prisma.asset.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!asset) {
        throw new NotFoundError('Asset', id);
      }

      sendSuccess(res, asset);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, name, type, url, metadata } = req.body;

      // Verify client exists
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundError('Client', clientId);
      }

      const asset = await prisma.asset.create({
        data: {
          clientId,
          name,
          type,
          url,
          metadata,
        },
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      sendCreated(res, asset);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.asset.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Asset', id);
      }

      await prisma.asset.delete({ where: { id } });

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}
