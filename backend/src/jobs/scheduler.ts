import { logger } from '../utils/logger.js';
import {
  syncQueue,
  verificationQueue,
  analyticsQueue,
  maintenanceQueue,
  JobNames,
} from './queues/index.js';

/**
 * Set up scheduled/repeatable jobs using BullMQ
 */
export async function setupScheduledJobs(): Promise<void> {
  logger.info('Setting up scheduled jobs...');

  // Clear existing repeatable jobs to avoid duplicates
  const queues = [syncQueue, verificationQueue, analyticsQueue, maintenanceQueue];

  for (const queue of queues) {
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  // Sync all campaigns - Every 4 hours
  await syncQueue.add(
    JobNames.SYNC_ALL_CAMPAIGNS,
    {},
    {
      repeat: {
        pattern: '0 */4 * * *', // Every 4 hours
      },
      jobId: 'sync-all-campaigns-scheduled',
    }
  );
  logger.info('Scheduled: sync:all-campaigns (every 4 hours)');

  // Verify all credentials - Daily at 6 AM UTC
  await verificationQueue.add(
    JobNames.VERIFY_ALL_CREDENTIALS,
    {},
    {
      repeat: {
        pattern: '0 6 * * *', // 6 AM UTC daily
      },
      jobId: 'verify-all-credentials-scheduled',
    }
  );
  logger.info('Scheduled: verify:all-credentials (daily at 6 AM UTC)');

  // Calculate benchmarks - Weekly on Sunday at 2 AM UTC
  await analyticsQueue.add(
    JobNames.CALCULATE_BENCHMARKS,
    { period: 'weekly' },
    {
      repeat: {
        pattern: '0 2 * * 0', // Sunday at 2 AM UTC
      },
      jobId: 'calculate-benchmarks-scheduled',
    }
  );
  logger.info('Scheduled: calculate:benchmarks (weekly on Sunday)');

  // Detect anomalies - Every hour
  await analyticsQueue.add(
    JobNames.DETECT_ANOMALIES,
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
      jobId: 'detect-anomalies-scheduled',
    }
  );
  logger.info('Scheduled: detect:anomalies (hourly)');

  // Cleanup old alerts - Daily at 2 AM UTC
  await maintenanceQueue.add(
    JobNames.CLEANUP_OLD_ALERTS,
    { olderThanDays: 30, onlyResolved: true },
    {
      repeat: {
        pattern: '0 2 * * *', // 2 AM UTC daily
      },
      jobId: 'cleanup-old-alerts-scheduled',
    }
  );
  logger.info('Scheduled: cleanup:old-alerts (daily at 2 AM UTC)');

  // Cleanup old job runs - Weekly on Saturday at 3 AM UTC
  await maintenanceQueue.add(
    JobNames.CLEANUP_OLD_JOBS,
    { olderThanDays: 30 },
    {
      repeat: {
        pattern: '0 3 * * 6', // Saturday at 3 AM UTC
      },
      jobId: 'cleanup-old-jobs-scheduled',
    }
  );
  logger.info('Scheduled: cleanup:old-jobs (weekly on Saturday)');

  // Cleanup old sessions - Daily at 4 AM UTC
  await maintenanceQueue.add(
    JobNames.CLEANUP_OLD_SESSIONS,
    { olderThanDays: 7 },
    {
      repeat: {
        pattern: '0 4 * * *', // 4 AM UTC daily
      },
      jobId: 'cleanup-old-sessions-scheduled',
    }
  );
  logger.info('Scheduled: cleanup:old-sessions (daily at 4 AM UTC)');

  logger.info('All scheduled jobs configured');
}

/**
 * List all scheduled jobs
 */
export async function listScheduledJobs(): Promise<
  Array<{ queue: string; name: string; pattern: string; next: Date | undefined }>
> {
  const scheduled: Array<{
    queue: string;
    name: string;
    pattern: string;
    next: Date | undefined;
  }> = [];

  const queues = [
    { queue: syncQueue, name: 'sync' },
    { queue: verificationQueue, name: 'verification' },
    { queue: analyticsQueue, name: 'analytics' },
    { queue: maintenanceQueue, name: 'maintenance' },
  ];

  for (const { queue, name } of queues) {
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      scheduled.push({
        queue: name,
        name: job.name,
        pattern: job.pattern || '',
        next: job.next ? new Date(job.next) : undefined,
      });
    }
  }

  return scheduled;
}
