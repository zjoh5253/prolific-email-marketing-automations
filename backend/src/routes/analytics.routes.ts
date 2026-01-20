import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const analyticsRoutes = Router();
const controller = new AnalyticsController();

const clientIdParamsSchema = z.object({
  clientId: z.string().uuid(),
});

const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const benchmarksQuerySchema = z.object({
  industry: z.string().optional(),
});

// GET /api/analytics/overview
analyticsRoutes.get(
  '/overview',
  validateQuery(dateRangeQuerySchema),
  controller.getOverview
);

// GET /api/analytics/client/:clientId
analyticsRoutes.get(
  '/client/:clientId',
  validateParams(clientIdParamsSchema),
  validateQuery(dateRangeQuerySchema),
  controller.getClientAnalytics
);

// GET /api/analytics/benchmarks
analyticsRoutes.get(
  '/benchmarks',
  validateQuery(benchmarksQuerySchema),
  controller.getBenchmarks
);

// GET /api/analytics/send-times
analyticsRoutes.get(
  '/send-times',
  validateQuery(dateRangeQuerySchema),
  controller.getSendTimeAnalysis
);
