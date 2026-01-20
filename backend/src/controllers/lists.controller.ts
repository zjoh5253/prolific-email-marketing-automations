import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { syncQueue, JobNames } from '../jobs/queues/index.js';

export class ListsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, page = 1, limit = 50 } = req.query as any;

      const where = clientId ? { clientId } : {};

      const [lists, total] = await Promise.all([
        prisma.audienceList.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { name: 'asc' },
          include: {
            client: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.audienceList.count({ where }),
      ]);

      sendPaginated(res, lists, Number(page), Number(limit), total);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const list = await prisma.audienceList.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, slug: true, platform: true } },
          campaigns: {
            include: {
              campaign: { select: { id: true, name: true, status: true, sentAt: true } },
            },
            orderBy: { campaign: { sentAt: 'desc' } },
            take: 10,
          },
        },
      });

      if (!list) {
        throw new NotFoundError('List', id);
      }

      sendSuccess(res, list);
    } catch (error) {
      next(error);
    }
  }

  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const list = await prisma.audienceList.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          memberCount: true,
          growthRate30d: true,
          churnRate30d: true,
          engagementTier: true,
          syncedAt: true,
        },
      });

      if (!list) {
        throw new NotFoundError('List', id);
      }

      sendSuccess(res, {
        ...list,
        healthScore: calculateHealthScore(list),
      });
    } catch (error) {
      next(error);
    }
  }

  async syncForClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.params;

      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundError('Client', clientId);
      }

      await syncQueue.add(JobNames.SYNC_LISTS, { clientId });

      sendSuccess(res, { message: 'List sync job queued successfully' });
    } catch (error) {
      next(error);
    }
  }
}

function calculateHealthScore(list: {
  memberCount: number;
  growthRate30d: number | null;
  churnRate30d: number | null;
}): number {
  let score = 50; // Base score

  // Growth rate impact (+/- 20 points)
  if (list.growthRate30d !== null) {
    score += Math.min(20, Math.max(-20, list.growthRate30d * 10));
  }

  // Churn rate impact (-0 to -30 points)
  if (list.churnRate30d !== null) {
    score -= Math.min(30, list.churnRate30d * 15);
  }

  // Size bonus (up to 10 points)
  if (list.memberCount > 10000) score += 10;
  else if (list.memberCount > 5000) score += 7;
  else if (list.memberCount > 1000) score += 5;
  else if (list.memberCount > 100) score += 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}
