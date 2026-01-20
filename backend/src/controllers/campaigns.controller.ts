import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import type {
  ListCampaignsQuery,
  CreateCampaignInput,
  UpdateCampaignInput,
  ScheduleCampaignInput,
  ApproveCampaignInput,
} from '../validators/campaign.validator.js';
import { Prisma } from '@prisma/client';

export class CampaignsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        clientId,
        clientIds,
        status,
        approvalStatus,
        search,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query as unknown as ListCampaignsQuery;

      const where: Prisma.CampaignWhereInput = {};

      if (clientId) where.clientId = clientId;
      if (clientIds && clientIds.length > 0) {
        where.clientId = { in: clientIds };
      }
      if (status) where.status = status;
      if (approvalStatus) where.approvalStatus = approvalStatus;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subjectLine: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (startDate || endDate) {
        where.scheduledAt = {};
        if (startDate) where.scheduledAt.gte = startDate;
        if (endDate) where.scheduledAt.lte = endDate;
      }

      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            client: {
              select: { id: true, name: true, slug: true, platform: true },
            },
            lists: {
              include: {
                list: { select: { id: true, name: true, memberCount: true } },
              },
            },
            _count: {
              select: { versions: true, approvals: true },
            },
          },
        }),
        prisma.campaign.count({ where }),
      ]);

      sendPaginated(res, campaigns, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, slug: true, platform: true },
          },
          lists: {
            include: {
              list: { select: { id: true, name: true, memberCount: true } },
            },
          },
          versions: {
            orderBy: { versionNum: 'desc' },
            take: 10,
          },
          approvals: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      if (!campaign) {
        throw new NotFoundError('Campaign', id);
      }

      sendSuccess(res, campaign);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listIds, ...data } = req.body as CreateCampaignInput;

      // Verify client exists
      const client = await prisma.client.findUnique({ where: { id: data.clientId } });
      if (!client) {
        throw new NotFoundError('Client', data.clientId);
      }

      const campaign = await prisma.campaign.create({
        data: {
          ...data,
          lists: listIds
            ? {
                create: listIds.map((listId) => ({ listId })),
              }
            : undefined,
        },
        include: {
          client: { select: { id: true, name: true, slug: true, platform: true } },
          lists: { include: { list: true } },
        },
      });

      // Create initial version
      await prisma.campaignVersion.create({
        data: {
          campaignId: campaign.id,
          versionNum: 1,
          subjectLine: campaign.subjectLine,
          previewText: campaign.previewText,
          bodyCopyHtml: campaign.bodyCopyHtml,
          bodyCopyPlain: campaign.bodyCopyPlain,
          createdById: req.user?.id,
        },
      });

      sendCreated(res, campaign);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { listIds, ...data } = req.body as UpdateCampaignInput;

      const existing = await prisma.campaign.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Campaign', id);
      }

      // Check if content changed to create new version
      const contentChanged =
        data.subjectLine !== undefined ||
        data.previewText !== undefined ||
        data.bodyCopyHtml !== undefined ||
        data.bodyCopyPlain !== undefined;

      const campaign = await prisma.campaign.update({
        where: { id },
        data: {
          ...data,
          version: contentChanged ? { increment: 1 } : undefined,
        },
        include: {
          client: { select: { id: true, name: true, slug: true, platform: true } },
          lists: { include: { list: true } },
        },
      });

      // Update list associations if provided
      if (listIds !== undefined) {
        await prisma.campaignList.deleteMany({ where: { campaignId: id } });
        if (listIds.length > 0) {
          await prisma.campaignList.createMany({
            data: listIds.map((listId) => ({ campaignId: id, listId })),
          });
        }
      }

      // Create new version if content changed
      if (contentChanged) {
        await prisma.campaignVersion.create({
          data: {
            campaignId: id,
            versionNum: campaign.version,
            subjectLine: campaign.subjectLine,
            previewText: campaign.previewText,
            bodyCopyHtml: campaign.bodyCopyHtml,
            bodyCopyPlain: campaign.bodyCopyPlain,
            createdById: req.user?.id,
          },
        });
      }

      sendSuccess(res, campaign);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.campaign.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Campaign', id);
      }

      // Archive instead of hard delete
      await prisma.campaign.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async schedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body as ScheduleCampaignInput;

      const campaign = await prisma.campaign.findUnique({ where: { id } });
      if (!campaign) {
        throw new NotFoundError('Campaign', id);
      }

      if (campaign.approvalStatus !== 'INTERNAL_APPROVED' && campaign.approvalStatus !== 'CLIENT_APPROVED') {
        throw new ValidationError('Campaign must be approved before scheduling');
      }

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          scheduledAt,
          status: 'SCHEDULED',
        },
      });

      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { comment } = req.body as ApproveCampaignInput;

      const campaign = await prisma.campaign.findUnique({ where: { id } });
      if (!campaign) {
        throw new NotFoundError('Campaign', id);
      }

      // Create approval record
      await prisma.campaignApproval.create({
        data: {
          campaignId: id,
          userId: req.user!.id,
          action: 'APPROVED',
          comments: comment,
        },
      });

      // Update campaign approval status
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          approvalStatus: 'INTERNAL_APPROVED',
          status: campaign.status === 'IN_REVIEW' ? 'APPROVED' : campaign.status,
        },
      });

      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async requestChanges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const campaign = await prisma.campaign.findUnique({ where: { id } });
      if (!campaign) {
        throw new NotFoundError('Campaign', id);
      }

      // Create approval record
      await prisma.campaignApproval.create({
        data: {
          campaignId: id,
          userId: req.user!.id,
          action: 'CHANGES_REQUESTED',
          comments: reason,
        },
      });

      // Update campaign approval status
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          approvalStatus: 'CHANGES_REQUESTED',
          status: 'DRAFT',
        },
      });

      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async getVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await prisma.campaign.findUnique({ where: { id } });
      if (!campaign) {
        throw new NotFoundError('Campaign', id);
      }

      const versions = await prisma.campaignVersion.findMany({
        where: { campaignId: id },
        orderBy: { versionNum: 'desc' },
      });

      sendSuccess(res, versions);
    } catch (error) {
      next(error);
    }
  }
}
