import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export class AlertsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, type, severity, isRead, isDismissed, page = 1, limit = 50 } = req.query as any;

      const where: any = { isDismissed: false };
      if (clientId) where.clientId = clientId;
      if (type) where.type = type;
      if (severity) where.severity = severity;
      if (isRead !== undefined) where.isRead = isRead === 'true';
      if (isDismissed !== undefined) where.isDismissed = isDismissed === 'true';

      const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            client: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.alert.count({ where }),
      ]);

      sendPaginated(res, alerts, Number(page), Number(limit), total);
    } catch (error) {
      next(error);
    }
  }

  async getUnread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          isRead: false,
          isDismissed: false,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      const count = await prisma.alert.count({
        where: { isRead: false, isDismissed: false },
      });

      sendSuccess(res, { alerts, count });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!alert) {
        throw new NotFoundError('Alert', id);
      }

      sendSuccess(res, alert);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.update({
        where: { id },
        data: { isRead: true },
      });

      sendSuccess(res, alert);
    } catch (error) {
      next(error);
    }
  }

  async dismiss(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const alert = await prisma.alert.update({
        where: { id },
        data: { isDismissed: true, isRead: true, resolvedAt: new Date() },
      });

      sendSuccess(res, alert);
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.alert.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });

      sendSuccess(res, { message: 'All alerts marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
