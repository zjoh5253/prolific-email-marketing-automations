import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';

export class CadencesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, isActive, page = 1, limit = 50 } = req.query as any;

      const where: any = {};
      if (clientId) where.clientId = clientId;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [cadences, total] = await Promise.all([
        prisma.cadence.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { name: 'asc' },
          include: {
            client: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.cadence.count({ where }),
      ]);

      sendPaginated(res, cadences, Number(page), Number(limit), total);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const cadence = await prisma.cadence.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!cadence) {
        throw new NotFoundError('Cadence', id);
      }

      sendSuccess(res, cadence);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;

      // Verify client exists
      const client = await prisma.client.findUnique({ where: { id: data.clientId } });
      if (!client) {
        throw new NotFoundError('Client', data.clientId);
      }

      const cadence = await prisma.cadence.create({
        data,
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      sendCreated(res, cadence);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await prisma.cadence.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Cadence', id);
      }

      const cadence = await prisma.cadence.update({
        where: { id },
        data,
        include: {
          client: { select: { id: true, name: true, slug: true } },
        },
      });

      sendSuccess(res, cadence);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.cadence.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Cadence', id);
      }

      await prisma.cadence.delete({ where: { id } });

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}
