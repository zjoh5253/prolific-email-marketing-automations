import { Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { subDays } from 'date-fns';
import {
  JobNames,
  CleanupOldAlertsJobData,
  CleanupOldJobsJobData,
  CleanupOldSessionsJobData,
} from '../queues/index.js';

type MaintenanceJobData = CleanupOldAlertsJobData | CleanupOldJobsJobData | CleanupOldSessionsJobData;

export async function processMaintenanceJob(job: Job<MaintenanceJobData>): Promise<void> {
  const startTime = Date.now();

  const jobRun = await prisma.jobRun.create({
    data: {
      jobId: job.id || '',
      jobName: job.name,
      queueName: 'maintenance',
      status: 'RUNNING',
      input: job.data as any,
      startedAt: new Date(),
    },
  });

  try {
    let result: { deleted: number };

    switch (job.name) {
      case JobNames.CLEANUP_OLD_ALERTS:
        result = await cleanupOldAlerts(job as Job<CleanupOldAlertsJobData>);
        break;

      case JobNames.CLEANUP_OLD_JOBS:
        result = await cleanupOldJobs(job as Job<CleanupOldJobsJobData>);
        break;

      case JobNames.CLEANUP_OLD_SESSIONS:
        result = await cleanupOldSessions(job as Job<CleanupOldSessionsJobData>);
        break;

      default:
        throw new Error(`Unknown maintenance job: ${job.name}`);
    }

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        duration: Date.now() - startTime,
        output: result as any,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        duration: Date.now() - startTime,
        error: errorMessage,
      },
    });

    throw error;
  }
}

async function cleanupOldAlerts(job: Job<CleanupOldAlertsJobData>): Promise<{ deleted: number }> {
  const { olderThanDays, onlyResolved = false } = job.data;

  logger.info({ olderThanDays, onlyResolved, jobId: job.id }, 'Starting alert cleanup');

  const cutoffDate = subDays(new Date(), olderThanDays);

  const whereClause: any = {
    createdAt: { lt: cutoffDate },
  };

  if (onlyResolved) {
    whereClause.resolvedAt = { not: null };
  }

  const result = await prisma.alert.deleteMany({
    where: whereClause,
  });

  logger.info(
    { deletedCount: result.count, olderThanDays, onlyResolved },
    'Alert cleanup completed'
  );

  return { deleted: result.count };
}

async function cleanupOldJobs(job: Job<CleanupOldJobsJobData>): Promise<{ deleted: number }> {
  const { olderThanDays } = job.data;

  logger.info({ olderThanDays, jobId: job.id }, 'Starting job run cleanup');

  const cutoffDate = subDays(new Date(), olderThanDays);

  const result = await prisma.jobRun.deleteMany({
    where: {
      completedAt: { lt: cutoffDate },
      status: { in: ['COMPLETED', 'FAILED'] },
    },
  });

  logger.info({ deletedCount: result.count, olderThanDays }, 'Job run cleanup completed');

  return { deleted: result.count };
}

async function cleanupOldSessions(job: Job<CleanupOldSessionsJobData>): Promise<{ deleted: number }> {
  const { olderThanDays } = job.data;

  logger.info({ olderThanDays, jobId: job.id }, 'Starting session cleanup');

  const cutoffDate = subDays(new Date(), olderThanDays);

  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // Expired sessions
        { createdAt: { lt: cutoffDate } }, // Old sessions
      ],
    },
  });

  logger.info({ deletedCount: result.count, olderThanDays }, 'Session cleanup completed');

  return { deleted: result.count };
}
