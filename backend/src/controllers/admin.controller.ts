import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';
import { syncQueue, verificationQueue, analyticsQueue, maintenanceQueue, JobNames } from '../jobs/queues/index.js';

export class AdminController {
  async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { queue, status, page = 1, limit = 50 } = req.query as any;

      const where: any = {};
      if (queue) where.queueName = queue;
      if (status) where.status = status.toUpperCase();

      const [jobs, total] = await Promise.all([
        prisma.jobRun.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.jobRun.count({ where }),
      ]);

      sendPaginated(res, jobs, Number(page), Number(limit), total);
    } catch (error) {
      next(error);
    }
  }

  async triggerJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.params;
      const { clientId, ...params } = req.body || {};

      let queue;
      let jobData: Record<string, any> = {};

      switch (name) {
        case 'sync:campaigns':
          queue = syncQueue;
          if (!clientId) throw new ValidationError('clientId is required');
          jobData = { clientId };
          break;

        case 'sync:all-campaigns':
          queue = syncQueue;
          break;

        case 'sync:lists':
          queue = syncQueue;
          if (!clientId) throw new ValidationError('clientId is required');
          jobData = { clientId };
          break;

        case 'verify:credentials':
          queue = verificationQueue;
          if (!clientId) throw new ValidationError('clientId is required');
          jobData = { clientId };
          break;

        case 'verify:all-credentials':
          queue = verificationQueue;
          break;

        case 'calculate:benchmarks':
          queue = analyticsQueue;
          jobData = { period: params.period || 'weekly' };
          break;

        case 'cleanup:old-alerts':
          queue = maintenanceQueue;
          jobData = { olderThanDays: params.olderThanDays || 30, onlyResolved: true };
          break;

        default:
          throw new ValidationError(`Unknown job name: ${name}`);
      }

      const job = await queue.add(name as any, jobData);

      sendSuccess(res, {
        message: 'Job triggered successfully',
        jobId: job.id,
        jobName: name,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        syncQueueCounts,
        verificationQueueCounts,
        analyticsQueueCounts,
        maintenanceQueueCounts,
      ] = await Promise.all([
        syncQueue.getJobCounts(),
        verificationQueue.getJobCounts(),
        analyticsQueue.getJobCounts(),
        maintenanceQueue.getJobCounts(),
      ]);

      const [
        clientCount,
        campaignCount,
        alertCount,
        recentJobRuns,
      ] = await Promise.all([
        prisma.client.count(),
        prisma.campaign.count(),
        prisma.alert.count({ where: { isRead: false } }),
        prisma.jobRun.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      sendSuccess(res, {
        database: {
          clients: clientCount,
          campaigns: campaignCount,
          unreadAlerts: alertCount,
        },
        queues: {
          sync: syncQueueCounts,
          verification: verificationQueueCounts,
          analytics: analyticsQueueCounts,
          maintenance: maintenanceQueueCounts,
        },
        recentJobs: recentJobRuns,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, clientId, entityType, page = 1, limit = 50 } = req.query as any;

      const where: any = {};
      if (userId) where.userId = userId;
      if (clientId) where.clientId = clientId;
      if (entityType) where.entityType = entityType;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            client: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      sendPaginated(res, logs, Number(page), Number(limit), total);
    } catch (error) {
      next(error);
    }
  }
}
