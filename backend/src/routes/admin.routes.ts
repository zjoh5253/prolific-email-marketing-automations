import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const adminRoutes = Router();
const controller = new AdminController();

// All admin routes require ADMIN role
adminRoutes.use(requireRole('ADMIN'));

const jobQuerySchema = z.object({
  queue: z.string().optional(),
  status: z.enum(['waiting', 'active', 'completed', 'failed', 'delayed']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const jobNameParamsSchema = z.object({
  name: z.string(),
});

// GET /api/admin/jobs
adminRoutes.get(
  '/jobs',
  validateQuery(jobQuerySchema),
  controller.listJobs
);

// POST /api/admin/jobs/:name/trigger
adminRoutes.post(
  '/jobs/:name/trigger',
  validateParams(jobNameParamsSchema),
  controller.triggerJob
);

// GET /api/admin/stats
adminRoutes.get(
  '/stats',
  controller.getSystemStats
);

// GET /api/admin/audit-logs
adminRoutes.get(
  '/audit-logs',
  controller.getAuditLogs
);
