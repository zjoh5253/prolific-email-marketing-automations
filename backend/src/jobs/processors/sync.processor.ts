import { Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { createPlatformAdapter } from '../../adapters/factory.js';
import { EncryptionService } from '../../utils/encryption.js';
import { logger } from '../../utils/logger.js';
import {
  JobNames,
  SyncCampaignsJobData,
  SyncAllCampaignsJobData,
  SyncListsJobData,
  SyncMetricsJobData,
} from '../queues/index.js';

const encryption = new EncryptionService();

type SyncJobData = SyncCampaignsJobData | SyncAllCampaignsJobData | SyncListsJobData | SyncMetricsJobData;

export async function processSyncJob(job: Job<SyncJobData>): Promise<void> {
  const startTime = Date.now();

  // Create job run record
  const jobRun = await prisma.jobRun.create({
    data: {
      jobId: job.id || '',
      jobName: job.name,
      queueName: 'sync',
      status: 'RUNNING',
      input: job.data as any,
      startedAt: new Date(),
    },
  });

  try {
    switch (job.name) {
      case JobNames.SYNC_CAMPAIGNS:
        await syncCampaigns(job as Job<SyncCampaignsJobData>);
        break;

      case JobNames.SYNC_ALL_CAMPAIGNS:
        await syncAllCampaigns(job as Job<SyncAllCampaignsJobData>);
        break;

      case JobNames.SYNC_LISTS:
        await syncLists(job as Job<SyncListsJobData>);
        break;

      case JobNames.SYNC_METRICS:
        await syncMetrics(job as Job<SyncMetricsJobData>);
        break;

      default:
        throw new Error(`Unknown sync job: ${job.name}`);
    }

    // Update job run as completed
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        duration: Date.now() - startTime,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update job run as failed
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

async function syncCampaigns(job: Job<SyncCampaignsJobData>): Promise<void> {
  const { clientId } = job.data;

  logger.info({ clientId, jobId: job.id }, 'Starting campaign sync');

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { credentials: true },
  });

  if (!client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  if (!client.credentials) {
    throw new Error(`Client has no credentials: ${clientId}`);
  }

  // Decrypt credentials
  const decryptedCreds = encryption.decrypt(
    client.credentials.ciphertext,
    client.credentials.iv,
    client.credentials.authTag
  );
  const credentials = JSON.parse(decryptedCreds);

  // Create adapter and fetch campaigns
  const adapter = createPlatformAdapter(clientId, client.platform, credentials);
  const result = await adapter.getCampaigns({ limit: 100 });

  let syncedCount = 0;
  let errorCount = 0;

  for (const platformCampaign of result.items) {
    try {
      // Upsert campaign
      await prisma.campaign.upsert({
        where: {
          clientId_externalId: {
            clientId,
            externalId: platformCampaign.externalId,
          },
        },
        update: {
          name: platformCampaign.name,
          subjectLine: platformCampaign.subjectLine || null,
          previewText: platformCampaign.previewText || null,
          fromName: platformCampaign.fromName || null,
          fromEmail: platformCampaign.fromEmail || null,
          status: platformCampaign.status as any,
          contentHtml: platformCampaign.contentHtml || null,
          contentText: platformCampaign.contentText || null,
          scheduledAt: platformCampaign.scheduledAt || null,
          sentAt: platformCampaign.sentAt || null,
          syncedAt: new Date(),
          metadata: platformCampaign.metadata || {},
        },
        create: {
          clientId,
          externalId: platformCampaign.externalId,
          name: platformCampaign.name,
          subjectLine: platformCampaign.subjectLine || null,
          previewText: platformCampaign.previewText || null,
          fromName: platformCampaign.fromName || null,
          fromEmail: platformCampaign.fromEmail || null,
          status: platformCampaign.status as any,
          contentHtml: platformCampaign.contentHtml || null,
          contentText: platformCampaign.contentText || null,
          scheduledAt: platformCampaign.scheduledAt || null,
          sentAt: platformCampaign.sentAt || null,
          syncedAt: new Date(),
          metadata: platformCampaign.metadata || {},
        },
      });

      syncedCount++;
    } catch (error) {
      errorCount++;
      logger.error(
        { clientId, campaignId: platformCampaign.externalId, error },
        'Failed to sync campaign'
      );
    }
  }

  // Update client sync status
  await prisma.client.update({
    where: { id: clientId },
    data: {
      lastSyncAt: new Date(),
      syncStatus: errorCount === 0 ? 'SYNCED' : 'PARTIAL',
    },
  });

  logger.info(
    { clientId, syncedCount, errorCount, total: result.items.length },
    'Campaign sync completed'
  );
}

async function syncAllCampaigns(_job: Job<SyncAllCampaignsJobData>): Promise<void> {
  logger.info('Starting sync for all active clients');

  const activeClients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  for (const client of activeClients) {
    try {
      await syncCampaigns({ data: { clientId: client.id } } as Job<SyncCampaignsJobData>);
    } catch (error) {
      logger.error({ clientId: client.id, error }, 'Failed to sync client campaigns');
    }
  }

  logger.info({ clientCount: activeClients.length }, 'All campaigns sync completed');
}

async function syncLists(job: Job<SyncListsJobData>): Promise<void> {
  const { clientId } = job.data;

  logger.info({ clientId, jobId: job.id }, 'Starting list sync');

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { credentials: true },
  });

  if (!client || !client.credentials) {
    throw new Error(`Client or credentials not found: ${clientId}`);
  }

  // Decrypt credentials
  const decryptedCreds = encryption.decrypt(
    client.credentials.ciphertext,
    client.credentials.iv,
    client.credentials.authTag
  );
  const credentials = JSON.parse(decryptedCreds);

  // Create adapter and fetch lists
  const adapter = createPlatformAdapter(clientId, client.platform, credentials);
  const lists = await adapter.getLists();

  let syncedCount = 0;

  for (const platformList of lists) {
    await prisma.audienceList.upsert({
      where: {
        clientId_externalId: {
          clientId,
          externalId: platformList.externalId,
        },
      },
      update: {
        name: platformList.name,
        memberCount: platformList.memberCount,
        unsubscribeCount: platformList.unsubscribeCount || 0,
        cleanedCount: platformList.cleanedCount || 0,
        avgOpenRate: platformList.stats?.openRate || null,
        avgClickRate: platformList.stats?.clickRate || null,
        syncedAt: new Date(),
        metadata: platformList.metadata || {},
      },
      create: {
        clientId,
        externalId: platformList.externalId,
        name: platformList.name,
        memberCount: platformList.memberCount,
        unsubscribeCount: platformList.unsubscribeCount || 0,
        cleanedCount: platformList.cleanedCount || 0,
        avgOpenRate: platformList.stats?.openRate || null,
        avgClickRate: platformList.stats?.clickRate || null,
        syncedAt: new Date(),
        metadata: platformList.metadata || {},
      },
    });

    syncedCount++;
  }

  logger.info({ clientId, syncedCount }, 'List sync completed');
}

async function syncMetrics(job: Job<SyncMetricsJobData>): Promise<void> {
  const { clientId, campaignId } = job.data;

  logger.info({ clientId, campaignId, jobId: job.id }, 'Starting metrics sync');

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { credentials: true },
  });

  if (!client || !client.credentials) {
    throw new Error(`Client or credentials not found: ${clientId}`);
  }

  // Decrypt credentials
  const decryptedCreds = encryption.decrypt(
    client.credentials.ciphertext,
    client.credentials.iv,
    client.credentials.authTag
  );
  const credentials = JSON.parse(decryptedCreds);

  const adapter = createPlatformAdapter(clientId, client.platform, credentials);

  // Get campaigns to sync metrics for
  const whereClause: any = {
    clientId,
    status: 'SENT',
  };

  if (campaignId) {
    whereClause.id = campaignId;
  }

  const campaigns = await prisma.campaign.findMany({
    where: whereClause,
    select: { id: true, externalId: true },
  });

  for (const campaign of campaigns) {
    try {
      const metrics = await adapter.getCampaignMetrics(campaign.externalId);

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          metrics: metrics as any,
          syncedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error({ clientId, campaignId: campaign.id, error }, 'Failed to sync campaign metrics');
    }
  }

  logger.info({ clientId, campaignCount: campaigns.length }, 'Metrics sync completed');
}
