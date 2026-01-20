import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { redis } from './config/redis.js';
import { logger, jobLogger } from './utils/logger.js';
import { setupWorkers, closeWorkers } from './jobs/workers/index.js';
import { setupScheduledJobs } from './jobs/scheduler.js';

async function start(): Promise<void> {
  try {
    logger.info('🔧 Starting worker process...');

    // Connect to database
    await connectDatabase();

    // Setup workers
    await setupWorkers();

    // Setup scheduled jobs
    await setupScheduledJobs();

    logger.info(`👷 Worker running with concurrency: ${config.WORKER_CONCURRENCY}`);
    logger.info(`📊 Environment: ${config.NODE_ENV}`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      jobLogger.info(`${signal} received. Shutting down workers gracefully...`);

      await closeWorkers();
      await redis.quit();
      await disconnectDatabase();

      logger.info('Worker shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

start();
