import { Router } from 'express';
import { CadencesController } from '../controllers/cadences.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const cadencesRoutes = Router();
const controller = new CadencesController();

const cadenceIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const listCadencesQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const createCadenceSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']),
  campaignType: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  isActive: z.boolean().default(true),
});

const updateCadenceSchema = createCadenceSchema.partial().omit({ clientId: true });

// GET /api/cadences
cadencesRoutes.get(
  '/',
  validateQuery(listCadencesQuerySchema),
  controller.list
);

// GET /api/cadences/:id
cadencesRoutes.get(
  '/:id',
  validateParams(cadenceIdParamsSchema),
  controller.get
);

// POST /api/cadences
cadencesRoutes.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validateBody(createCadenceSchema),
  controller.create
);

// PATCH /api/cadences/:id
cadencesRoutes.patch(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(cadenceIdParamsSchema),
  validateBody(updateCadenceSchema),
  controller.update
);

// DELETE /api/cadences/:id
cadencesRoutes.delete(
  '/:id',
  requireRole('ADMIN'),
  validateParams(cadenceIdParamsSchema),
  controller.delete
);
