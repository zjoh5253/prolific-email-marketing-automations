import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import type {
  CreateOnboardingSubmissionInput,
  ListOnboardingSubmissionsQuery,
  UpdateOnboardingStatusInput,
} from '../validators/onboarding.validator.js';
import { Prisma } from '@prisma/client';

export class OnboardingController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateOnboardingSubmissionInput;

      const submission = await prisma.onboardingSubmission.create({
        data: {
          ...data,
          ipAddress: req.ip || req.socket.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null,
        },
      });

      sendCreated(res, submission);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, page, limit, sortBy, sortOrder } =
        req.query as unknown as ListOnboardingSubmissionsQuery;

      const where: Prisma.OnboardingSubmissionWhereInput = {};

      if (status) where.status = status;
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [submissions, total] = await Promise.all([
        prisma.onboardingSubmission.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.onboardingSubmission.count({ where }),
      ]);

      sendPaginated(res, submissions, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await prisma.onboardingSubmission.findUnique({
        where: { id },
        include: {
          convertedClient: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      if (!submission) {
        throw new NotFoundError('Onboarding submission', id);
      }

      sendSuccess(res, submission);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateOnboardingStatusInput;

      const existing = await prisma.onboardingSubmission.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Onboarding submission', id);
      }

      const submission = await prisma.onboardingSubmission.update({
        where: { id },
        data: { status },
      });

      sendSuccess(res, submission);
    } catch (error) {
      next(error);
    }
  }
}
