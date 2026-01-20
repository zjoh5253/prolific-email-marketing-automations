import { Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { createPlatformAdapter } from '../../adapters/factory.js';
import { EncryptionService } from '../../utils/encryption.js';
import { logger } from '../../utils/logger.js';
import { JobNames, VerifyCredentialsJobData, VerifyAllCredentialsJobData } from '../queues/index.js';

const encryption = new EncryptionService();

type VerificationJobData = VerifyCredentialsJobData | VerifyAllCredentialsJobData;

export async function processVerificationJob(job: Job<VerificationJobData>): Promise<void> {
  const startTime = Date.now();

  const jobRun = await prisma.jobRun.create({
    data: {
      jobId: job.id || '',
      jobName: job.name,
      queueName: 'verification',
      status: 'RUNNING',
      input: job.data as any,
      startedAt: new Date(),
    },
  });

  try {
    switch (job.name) {
      case JobNames.VERIFY_CREDENTIALS:
        await verifyCredentials(job as Job<VerifyCredentialsJobData>);
        break;

      case JobNames.VERIFY_ALL_CREDENTIALS:
        await verifyAllCredentials(job as Job<VerifyAllCredentialsJobData>);
        break;

      default:
        throw new Error(`Unknown verification job: ${job.name}`);
    }

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

async function verifyCredentials(job: Job<VerifyCredentialsJobData>): Promise<void> {
  const { clientId } = job.data;

  logger.info({ clientId, jobId: job.id }, 'Starting credential verification');

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { credentials: true },
  });

  if (!client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  if (!client.credentials) {
    // Create alert for missing credentials
    await prisma.alert.create({
      data: {
        clientId,
        type: 'CREDENTIAL_ISSUE',
        severity: 'HIGH',
        title: 'Missing Credentials',
        message: `Client "${client.name}" has no credentials configured`,
      },
    });

    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'PENDING' },
    });

    return;
  }

  try {
    // Decrypt credentials
    const decryptedCreds = encryption.decrypt(
      client.credentials.ciphertext,
      client.credentials.iv,
      client.credentials.authTag
    );
    const credentials = JSON.parse(decryptedCreds);

    // Create adapter and test connection
    const adapter = createPlatformAdapter(clientId, client.platform, credentials);
    const result = await adapter.testConnection();

    if (result.success) {
      // Update credential status
      await prisma.clientCredential.update({
        where: { id: client.credentials.id },
        data: {
          lastVerifiedAt: new Date(),
          isValid: true,
        },
      });

      // Ensure client is active
      if (client.status !== 'ACTIVE') {
        await prisma.client.update({
          where: { id: clientId },
          data: { status: 'ACTIVE' },
        });
      }

      // Resolve any existing credential alerts
      await prisma.alert.updateMany({
        where: {
          clientId,
          type: 'CREDENTIAL_ISSUE',
          resolvedAt: null,
        },
        data: {
          resolvedAt: new Date(),
        },
      });

      logger.info({ clientId }, 'Credential verification successful');
    } else {
      // Mark credentials as invalid
      await prisma.clientCredential.update({
        where: { id: client.credentials.id },
        data: {
          lastVerifiedAt: new Date(),
          isValid: false,
        },
      });

      // Create alert
      await prisma.alert.create({
        data: {
          clientId,
          type: 'CREDENTIAL_ISSUE',
          severity: 'HIGH',
          title: 'Credential Verification Failed',
          message: result.message || `Unable to verify credentials for ${client.platform}`,
          metadata: { error: result.error },
        },
      });

      logger.warn({ clientId, error: result.error }, 'Credential verification failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Mark credentials as invalid
    if (client.credentials) {
      await prisma.clientCredential.update({
        where: { id: client.credentials.id },
        data: {
          lastVerifiedAt: new Date(),
          isValid: false,
        },
      });
    }

    // Create alert
    await prisma.alert.create({
      data: {
        clientId,
        type: 'CREDENTIAL_ISSUE',
        severity: 'HIGH',
        title: 'Credential Verification Error',
        message: `Error verifying credentials: ${errorMessage}`,
      },
    });

    logger.error({ clientId, error }, 'Credential verification error');
  }
}

async function verifyAllCredentials(_job: Job<VerifyAllCredentialsJobData>): Promise<void> {
  logger.info('Starting credential verification for all clients');

  const clients = await prisma.client.findMany({
    where: { status: { in: ['ACTIVE', 'PENDING'] } },
    select: { id: true },
  });

  let successCount = 0;
  let failureCount = 0;

  for (const client of clients) {
    try {
      await verifyCredentials({ data: { clientId: client.id } } as Job<VerifyCredentialsJobData>);
      successCount++;
    } catch (error) {
      failureCount++;
      logger.error({ clientId: client.id, error }, 'Failed to verify client credentials');
    }
  }

  logger.info(
    { clientCount: clients.length, successCount, failureCount },
    'All credentials verification completed'
  );
}
