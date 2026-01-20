import { Router } from 'express';
import { ListsController } from '../controllers/lists.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const listsRoutes = Router();
const controller = new ListsController();

const listIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const listQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// GET /api/lists
listsRoutes.get(
  '/',
  validateQuery(listQuerySchema),
  controller.list
);

// GET /api/lists/:id
listsRoutes.get(
  '/:id',
  validateParams(listIdParamsSchema),
  controller.get
);

// GET /api/lists/:id/health
listsRoutes.get(
  '/:id/health',
  validateParams(listIdParamsSchema),
  controller.getHealth
);

// POST /api/lists/sync/:clientId
listsRoutes.post(
  '/sync/:clientId',
  requireRole('ADMIN', 'MANAGER'),
  controller.syncForClient
);
