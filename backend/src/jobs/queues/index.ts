import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from '../../config/redis.js';

const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
};

// Queue names as constants
export const QueueNames = {
  SYNC: 'sync',
  VERIFICATION: 'verification',
  ANALYTICS: 'analytics',
  MAINTENANCE: 'maintenance',
} as const;

// Job names for each queue
export const JobNames = {
  // Sync queue jobs
  SYNC_CAMPAIGNS: 'sync:campaigns',
  SYNC_ALL_CAMPAIGNS: 'sync:all-campaigns',
  SYNC_LISTS: 'sync:lists',
  SYNC_METRICS: 'sync:metrics',

  // Verification queue jobs
  VERIFY_CREDENTIALS: 'verify:credentials',
  VERIFY_ALL_CREDENTIALS: 'verify:all-credentials',

  // Analytics queue jobs
  CALCULATE_BENCHMARKS: 'calculate:benchmarks',
  DETECT_ANOMALIES: 'detect:anomalies',
  GENERATE_REPORT: 'generate:report',

  // Maintenance queue jobs
  CLEANUP_OLD_ALERTS: 'cleanup:old-alerts',
  CLEANUP_OLD_JOBS: 'cleanup:old-jobs',
  CLEANUP_OLD_SESSIONS: 'cleanup:old-sessions',
} as const;

// Type definitions for job data
export interface SyncCampaignsJobData {
  clientId: string;
}

export interface SyncAllCampaignsJobData {
  // No data needed
}

export interface SyncListsJobData {
  clientId: string;
}

export interface SyncMetricsJobData {
  clientId: string;
  campaignId?: string;
}

export interface VerifyCredentialsJobData {
  clientId: string;
}

export interface VerifyAllCredentialsJobData {
  // No data needed
}

export interface CalculateBenchmarksJobData {
  period?: 'weekly' | 'monthly' | 'quarterly';
}

export interface DetectAnomaliesJobData {
  clientId?: string;
}

export interface GenerateReportJobData {
  clientId: string;
  reportType: 'performance' | 'health' | 'comparison';
  startDate: string;
  endDate: string;
}

export interface CleanupOldAlertsJobData {
  olderThanDays: number;
  onlyResolved?: boolean;
}

export interface CleanupOldJobsJobData {
  olderThanDays: number;
}

export interface CleanupOldSessionsJobData {
  olderThanDays: number;
}

// Create queues
export const syncQueue = new Queue<
  SyncCampaignsJobData | SyncAllCampaignsJobData | SyncListsJobData | SyncMetricsJobData
>(QueueNames.SYNC, defaultQueueOptions);

export const verificationQueue = new Queue<
  VerifyCredentialsJobData | VerifyAllCredentialsJobData
>(QueueNames.VERIFICATION, defaultQueueOptions);

export const analyticsQueue = new Queue<
  CalculateBenchmarksJobData | DetectAnomaliesJobData | GenerateReportJobData
>(QueueNames.ANALYTICS, defaultQueueOptions);

export const maintenanceQueue = new Queue<
  CleanupOldAlertsJobData | CleanupOldJobsJobData | CleanupOldSessionsJobData
>(QueueNames.MAINTENANCE, defaultQueueOptions);

// All queues for easy iteration
export const allQueues = [syncQueue, verificationQueue, analyticsQueue, maintenanceQueue];

// Helper to close all queue connections
export async function closeAllQueues(): Promise<void> {
  await Promise.all(allQueues.map((q) => q.close()));
}
