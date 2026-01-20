import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { subDays } from 'date-fns';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
      const end = endDate ? new Date(endDate) : new Date();

      const [
        totalClients,
        activeClients,
        totalCampaigns,
        sentCampaigns,
        scheduledCampaigns,
        unreadAlerts,
      ] = await Promise.all([
        prisma.client.count(),
        prisma.client.count({ where: { status: 'ACTIVE' } }),
        prisma.campaign.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.campaign.count({
          where: { sentAt: { gte: start, lte: end }, status: 'SENT' },
        }),
        prisma.campaign.count({
          where: { status: 'SCHEDULED' },
        }),
        prisma.alert.count({
          where: { isRead: false, isDismissed: false },
        }),
      ]);

      sendSuccess(res, {
        period: { start, end },
        clients: {
          total: totalClients,
          active: activeClients,
        },
        campaigns: {
          total: totalCampaigns,
          sent: sentCampaigns,
          scheduled: scheduledCampaigns,
        },
        alerts: {
          unread: unreadAlerts,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getClientAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.params;
      const { startDate, endDate } = req.query as any;

      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundError('Client', clientId);
      }

      const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
      const end = endDate ? new Date(endDate) : new Date();

      const campaigns = await prisma.campaign.findMany({
        where: {
          clientId,
          sentAt: { gte: start, lte: end },
          status: 'SENT',
        },
        select: {
          id: true,
          name: true,
          sentAt: true,
          metrics: true,
        },
      });

      // Aggregate metrics
      let totalSent = 0;
      let totalOpens = 0;
      let totalClicks = 0;
      let totalBounces = 0;
      let totalUnsubscribes = 0;

      campaigns.forEach((c) => {
        if (c.metrics && typeof c.metrics === 'object') {
          const m = c.metrics as any;
          totalSent += m.sent || 0;
          totalOpens += m.uniqueOpens || 0;
          totalClicks += m.uniqueClicks || 0;
          totalBounces += m.bounces || 0;
          totalUnsubscribes += m.unsubscribes || 0;
        }
      });

      sendSuccess(res, {
        client: { id: client.id, name: client.name },
        period: { start, end },
        campaigns: {
          count: campaigns.length,
          list: campaigns,
        },
        metrics: {
          totalSent,
          totalOpens,
          totalClicks,
          totalBounces,
          totalUnsubscribes,
          openRate: totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(2) : '0.00',
          clickRate: totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(2) : '0.00',
          bounceRate: totalSent > 0 ? ((totalBounces / totalSent) * 100).toFixed(2) : '0.00',
          unsubscribeRate: totalSent > 0 ? ((totalUnsubscribes / totalSent) * 100).toFixed(2) : '0.00',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBenchmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { industry } = req.query as any;

      const where = industry ? { industry } : {};

      const benchmarks = await prisma.industryBenchmark.findMany({
        where,
        orderBy: [{ industry: 'asc' }, { metric: 'asc' }],
      });

      // Group by industry
      const grouped = benchmarks.reduce((acc, b) => {
        if (!acc[b.industry]) {
          acc[b.industry] = {};
        }
        acc[b.industry][b.metric] = b.value;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      sendSuccess(res, grouped);
    } catch (error) {
      next(error);
    }
  }

  async getSendTimeAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate) : subDays(new Date(), 90);
      const end = endDate ? new Date(endDate) : new Date();

      const campaigns = await prisma.campaign.findMany({
        where: {
          sentAt: { gte: start, lte: end },
          status: 'SENT',
          metrics: { not: null },
        },
        select: {
          sentAt: true,
          metrics: true,
        },
      });

      // Analyze by hour of day and day of week
      const hourlyPerformance: Record<number, { opens: number; clicks: number; count: number }> = {};
      const dailyPerformance: Record<number, { opens: number; clicks: number; count: number }> = {};

      campaigns.forEach((c) => {
        if (c.sentAt && c.metrics) {
          const hour = c.sentAt.getUTCHours();
          const day = c.sentAt.getUTCDay();
          const m = c.metrics as any;

          if (!hourlyPerformance[hour]) {
            hourlyPerformance[hour] = { opens: 0, clicks: 0, count: 0 };
          }
          hourlyPerformance[hour].opens += m.uniqueOpens || 0;
          hourlyPerformance[hour].clicks += m.uniqueClicks || 0;
          hourlyPerformance[hour].count += 1;

          if (!dailyPerformance[day]) {
            dailyPerformance[day] = { opens: 0, clicks: 0, count: 0 };
          }
          dailyPerformance[day].opens += m.uniqueOpens || 0;
          dailyPerformance[day].clicks += m.uniqueClicks || 0;
          dailyPerformance[day].count += 1;
        }
      });

      sendSuccess(res, {
        period: { start, end },
        campaignsAnalyzed: campaigns.length,
        byHour: hourlyPerformance,
        byDay: dailyPerformance,
      });
    } catch (error) {
      next(error);
    }
  }
}
