import { Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { subDays } from 'date-fns';
import {
  JobNames,
  CalculateBenchmarksJobData,
  DetectAnomaliesJobData,
  GenerateReportJobData,
} from '../queues/index.js';

type AnalyticsJobData = CalculateBenchmarksJobData | DetectAnomaliesJobData | GenerateReportJobData;

export async function processAnalyticsJob(job: Job<AnalyticsJobData>): Promise<void> {
  const startTime = Date.now();

  const jobRun = await prisma.jobRun.create({
    data: {
      jobId: job.id || '',
      jobName: job.name,
      queueName: 'analytics',
      status: 'RUNNING',
      input: job.data as any,
      startedAt: new Date(),
    },
  });

  try {
    switch (job.name) {
      case JobNames.CALCULATE_BENCHMARKS:
        await calculateBenchmarks(job as Job<CalculateBenchmarksJobData>);
        break;

      case JobNames.DETECT_ANOMALIES:
        await detectAnomalies(job as Job<DetectAnomaliesJobData>);
        break;

      case JobNames.GENERATE_REPORT:
        await generateReport(job as Job<GenerateReportJobData>);
        break;

      default:
        throw new Error(`Unknown analytics job: ${job.name}`);
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

async function calculateBenchmarks(job: Job<CalculateBenchmarksJobData>): Promise<void> {
  const period = job.data.period || 'weekly';

  logger.info({ period, jobId: job.id }, 'Starting benchmark calculation');

  // Determine date range
  let daysBack = 7;
  if (period === 'monthly') daysBack = 30;
  if (period === 'quarterly') daysBack = 90;

  const startDate = subDays(new Date(), daysBack);

  // Get all clients with their industries
  const clients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, industry: true },
  });

  // Group clients by industry
  const clientsByIndustry: Record<string, string[]> = {};
  for (const client of clients) {
    const industry = client.industry || 'OTHER';
    if (!clientsByIndustry[industry]) {
      clientsByIndustry[industry] = [];
    }
    clientsByIndustry[industry].push(client.id);
  }

  // Calculate benchmarks for each industry
  for (const [industry, clientIds] of Object.entries(clientsByIndustry)) {
    const campaigns = await prisma.campaign.findMany({
      where: {
        clientId: { in: clientIds },
        status: 'SENT',
        sentAt: { gte: startDate },
        metrics: { not: null },
      },
      select: { metrics: true },
    });

    if (campaigns.length === 0) continue;

    // Aggregate metrics
    let totalSent = 0;
    let totalOpens = 0;
    let totalClicks = 0;
    let totalBounces = 0;
    let totalUnsubscribes = 0;

    for (const campaign of campaigns) {
      const m = campaign.metrics as any;
      if (m) {
        totalSent += m.sent || 0;
        totalOpens += m.uniqueOpens || 0;
        totalClicks += m.uniqueClicks || 0;
        totalBounces += m.bounces || 0;
        totalUnsubscribes += m.unsubscribes || 0;
      }
    }

    // Calculate rates
    const openRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;
    const unsubscribeRate = totalSent > 0 ? (totalUnsubscribes / totalSent) * 100 : 0;

    // Upsert benchmarks
    const metrics = [
      { metric: 'open_rate', value: openRate },
      { metric: 'click_rate', value: clickRate },
      { metric: 'bounce_rate', value: bounceRate },
      { metric: 'unsubscribe_rate', value: unsubscribeRate },
    ];

    for (const { metric, value } of metrics) {
      await prisma.industryBenchmark.upsert({
        where: {
          industry_metric: { industry, metric },
        },
        update: {
          value,
          sampleSize: campaigns.length,
          updatedAt: new Date(),
        },
        create: {
          industry,
          metric,
          value,
          sampleSize: campaigns.length,
        },
      });
    }
  }

  logger.info(
    { period, industriesProcessed: Object.keys(clientsByIndustry).length },
    'Benchmark calculation completed'
  );
}

async function detectAnomalies(job: Job<DetectAnomaliesJobData>): Promise<void> {
  const { clientId } = job.data;

  logger.info({ clientId, jobId: job.id }, 'Starting anomaly detection');

  // Get clients to check
  const whereClause: any = { status: 'ACTIVE' };
  if (clientId) whereClause.id = clientId;

  const clients = await prisma.client.findMany({
    where: whereClause,
    include: {
      campaigns: {
        where: {
          status: 'SENT',
          sentAt: { gte: subDays(new Date(), 30) },
          metrics: { not: null },
        },
        orderBy: { sentAt: 'desc' },
        take: 10,
      },
    },
  });

  for (const client of clients) {
    if (client.campaigns.length < 3) continue; // Need enough data

    // Get industry benchmarks
    const benchmarks = await prisma.industryBenchmark.findMany({
      where: { industry: client.industry || 'OTHER' },
    });

    const benchmarkMap: Record<string, number> = {};
    for (const b of benchmarks) {
      benchmarkMap[b.metric] = b.value;
    }

    // Calculate average metrics for this client
    let totalSent = 0;
    let totalOpens = 0;
    let totalBounces = 0;

    for (const campaign of client.campaigns) {
      const m = campaign.metrics as any;
      if (m) {
        totalSent += m.sent || 0;
        totalOpens += m.uniqueOpens || 0;
        totalBounces += m.bounces || 0;
      }
    }

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgBounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;

    // Check for anomalies
    const benchmarkOpenRate = benchmarkMap['open_rate'] || 20;
    const benchmarkBounceRate = benchmarkMap['bounce_rate'] || 2;

    // Alert if open rate is significantly below benchmark
    if (avgOpenRate < benchmarkOpenRate * 0.5) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          clientId: client.id,
          type: 'PERFORMANCE_ANOMALY',
          resolvedAt: null,
          metadata: {
            path: ['metric'],
            equals: 'open_rate',
          },
        },
      });

      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            clientId: client.id,
            type: 'PERFORMANCE_ANOMALY',
            severity: 'MEDIUM',
            title: 'Low Open Rate Detected',
            message: `Open rate (${avgOpenRate.toFixed(1)}%) is significantly below industry benchmark (${benchmarkOpenRate.toFixed(1)}%)`,
            metadata: {
              metric: 'open_rate',
              value: avgOpenRate,
              benchmark: benchmarkOpenRate,
            },
          },
        });
      }
    }

    // Alert if bounce rate is significantly above benchmark
    if (avgBounceRate > benchmarkBounceRate * 2) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          clientId: client.id,
          type: 'PERFORMANCE_ANOMALY',
          resolvedAt: null,
          metadata: {
            path: ['metric'],
            equals: 'bounce_rate',
          },
        },
      });

      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            clientId: client.id,
            type: 'PERFORMANCE_ANOMALY',
            severity: 'HIGH',
            title: 'High Bounce Rate Detected',
            message: `Bounce rate (${avgBounceRate.toFixed(1)}%) is significantly above industry benchmark (${benchmarkBounceRate.toFixed(1)}%)`,
            metadata: {
              metric: 'bounce_rate',
              value: avgBounceRate,
              benchmark: benchmarkBounceRate,
            },
          },
        });
      }
    }
  }

  logger.info({ clientsChecked: clients.length }, 'Anomaly detection completed');
}

async function generateReport(job: Job<GenerateReportJobData>): Promise<void> {
  const { clientId, reportType, startDate, endDate } = job.data;

  logger.info({ clientId, reportType, startDate, endDate, jobId: job.id }, 'Starting report generation');

  // Report generation is a placeholder - in production this would
  // generate PDFs/CSVs and store them as assets

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      campaigns: {
        where: {
          status: 'SENT',
          sentAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      },
    },
  });

  if (!client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  // Log what report would contain
  logger.info(
    {
      clientId,
      clientName: client.name,
      reportType,
      campaignCount: client.campaigns.length,
      period: { startDate, endDate },
    },
    'Report generated (stub)'
  );

  // In a full implementation, this would:
  // 1. Generate report data based on reportType
  // 2. Create PDF/CSV file
  // 3. Store in assets table
  // 4. Optionally send via email
}
