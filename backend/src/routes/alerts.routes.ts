import { Router } from 'express';
import { AlertsController } from '../controllers/alerts.controller.js';
import { validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const alertsRoutes = Router();
const controller = new AlertsController();

const alertIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const listAlertsQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  type: z.enum([
    'CREDENTIAL_FAILURE',
    'CREDENTIAL_EXPIRING',
    'DELIVERABILITY_DROP',
    'HIGH_UNSUBSCRIBES',
    'HIGH_SPAM_COMPLAINTS',
    'MISSED_SEND',
    'SEND_LIMIT_WARNING',
    'SYNC_FAILURE',
    'ANOMALY_DETECTED',
    'SYSTEM_ERROR',
  ]).optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
  isRead: z.coerce.boolean().optional(),
  isDismissed: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// GET /api/alerts
alertsRoutes.get(
  '/',
  validateQuery(listAlertsQuerySchema),
  controller.list
);

// GET /api/alerts/unread
alertsRoutes.get(
  '/unread',
  controller.getUnread
);

// GET /api/alerts/:id
alertsRoutes.get(
  '/:id',
  validateParams(alertIdParamsSchema),
  controller.get
);

// PATCH /api/alerts/:id/read
alertsRoutes.patch(
  '/:id/read',
  validateParams(alertIdParamsSchema),
  controller.markRead
);

// PATCH /api/alerts/:id/dismiss
alertsRoutes.patch(
  '/:id/dismiss',
  validateParams(alertIdParamsSchema),
  controller.dismiss
);

// POST /api/alerts/mark-all-read
alertsRoutes.post(
  '/mark-all-read',
  controller.markAllRead
);
