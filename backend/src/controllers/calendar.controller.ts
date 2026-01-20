import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export class CalendarController {
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, clientIds } = req.query as any;

      const where: any = {
        OR: [
          {
            scheduledAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          {
            sentAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        ],
      };

      if (clientIds && clientIds.length > 0) {
        where.clientId = { in: clientIds };
      }

      const campaigns = await prisma.campaign.findMany({
        where,
        select: {
          id: true,
          name: true,
          subjectLine: true,
          status: true,
          scheduledAt: true,
          sentAt: true,
          client: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { scheduledAt: 'asc' },
          { sentAt: 'asc' },
        ],
      });

      // Transform to calendar events
      const events = campaigns.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.subjectLine,
        start: c.scheduledAt || c.sentAt,
        end: c.scheduledAt || c.sentAt,
        status: c.status,
        clientId: c.client.id,
        clientName: c.client.name,
        clientSlug: c.client.slug,
      }));

      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  async getConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, clientIds } = req.query as any;

      // Find campaigns scheduled within 4 hours of each other for the same client
      const campaigns = await prisma.campaign.findMany({
        where: {
          scheduledAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          status: { in: ['SCHEDULED', 'APPROVED'] },
          ...(clientIds && clientIds.length > 0 ? { clientId: { in: clientIds } } : {}),
        },
        select: {
          id: true,
          name: true,
          scheduledAt: true,
          clientId: true,
          client: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      const conflicts: Array<{
        campaign1: typeof campaigns[0];
        campaign2: typeof campaigns[0];
        hoursDifference: number;
      }> = [];

      // Check each pair of campaigns for the same client
      for (let i = 0; i < campaigns.length; i++) {
        for (let j = i + 1; j < campaigns.length; j++) {
          const c1 = campaigns[i];
          const c2 = campaigns[j];

          if (c1.clientId === c2.clientId && c1.scheduledAt && c2.scheduledAt) {
            const hoursDiff = Math.abs(
              (c2.scheduledAt.getTime() - c1.scheduledAt.getTime()) / (1000 * 60 * 60)
            );

            if (hoursDiff < 4) {
              conflicts.push({
                campaign1: c1,
                campaign2: c2,
                hoursDifference: Math.round(hoursDiff * 10) / 10,
              });
            }
          }
        }
      }

      sendSuccess(res, conflicts);
    } catch (error) {
      next(error);
    }
  }
}
