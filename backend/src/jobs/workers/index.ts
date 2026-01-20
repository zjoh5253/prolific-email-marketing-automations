import { Worker, WorkerOptions } from 'bullmq';
import { redisConnection } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { QueueNames } from '../queues/index.js';
import {
  processSyncJob,
  processVerificationJob,
  processAnalyticsJob,
  processMaintenanceJob,
} from '../processors/index.js';

const defaultWorkerOptions: Partial<WorkerOptions> = {
  connection: redisConnection,
  concurrency: 5,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

// Create workers for each queue
export function createWorkers(): Worker[] {
  const workers: Worker[] = [];

  // Sync worker
  const syncWorker = new Worker(
    QueueNames.SYNC,
    processSyncJob,
    {
      ...defaultWorkerOptions,
      concurrency: 3, // Limit concurrency for API calls
    }
  );

  syncWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Sync job completed');
  });

  syncWorker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, jobName: job?.name, error: error.message }, 'Sync job failed');
  });

  workers.push(syncWorker);

  // Verification worker
  const verificationWorker = new Worker(
    QueueNames.VERIFICATION,
    processVerificationJob,
    {
      ...defaultWorkerOptions,
      concurrency: 2, // Limit to avoid rate limits
    }
  );

  verificationWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Verification job completed');
  });

  verificationWorker.on('failed', (job, error) => {
    logger.error(
      { jobId: job?.id, jobName: job?.name, error: error.message },
      'Verification job failed'
    );
  });

  workers.push(verificationWorker);

  // Analytics worker
  const analyticsWorker = new Worker(
    QueueNames.ANALYTICS,
    processAnalyticsJob,
    defaultWorkerOptions
  );

  analyticsWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Analytics job completed');
  });

  analyticsWorker.on('failed', (job, error) => {
    logger.error(
      { jobId: job?.id, jobName: job?.name, error: error.message },
      'Analytics job failed'
    );
  });

  workers.push(analyticsWorker);

  // Maintenance worker
  const maintenanceWorker = new Worker(
    QueueNames.MAINTENANCE,
    processMaintenanceJob,
    {
      ...defaultWorkerOptions,
      concurrency: 1, // Run maintenance jobs sequentially
    }
  );

  maintenanceWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Maintenance job completed');
  });

  maintenanceWorker.on('failed', (job, error) => {
    logger.error(
      { jobId: job?.id, jobName: job?.name, error: error.message },
      'Maintenance job failed'
    );
  });

  workers.push(maintenanceWorker);

  logger.info('All workers created and listening');

  return workers;
}

// Helper to gracefully close all workers
export async function closeAllWorkers(workers: Worker[]): Promise<void> {
  logger.info('Closing all workers...');
  await Promise.all(workers.map((w) => w.close()));
  logger.info('All workers closed');
}

// Global workers reference for cleanup
let _workers: Worker[] = [];

// Setup workers and store reference
export async function setupWorkers(): Promise<void> {
  _workers = createWorkers();
}

// Close workers using stored reference
export async function closeWorkers(): Promise<void> {
  await closeAllWorkers(_workers);
  _workers = [];
}
