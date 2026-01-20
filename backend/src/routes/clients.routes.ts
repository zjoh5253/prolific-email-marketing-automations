import { Router } from 'express';
import { ClientsController } from '../controllers/clients.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import {
  createClientSchema,
  updateClientSchema,
  clientIdParamsSchema,
  listClientsQuerySchema,
} from '../validators/client.validator.js';

export const clientsRoutes = Router();
const controller = new ClientsController();

// Apply audit middleware to all client routes
clientsRoutes.use(auditMiddleware('client'));

// GET /api/clients
clientsRoutes.get(
  '/',
  validateQuery(listClientsQuerySchema),
  controller.list
);

// GET /api/clients/:id
clientsRoutes.get(
  '/:id',
  validateParams(clientIdParamsSchema),
  controller.get
);

// POST /api/clients
clientsRoutes.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validateBody(createClientSchema),
  controller.create
);

// PATCH /api/clients/:id
clientsRoutes.patch(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(clientIdParamsSchema),
  validateBody(updateClientSchema),
  controller.update
);

// DELETE /api/clients/:id
clientsRoutes.delete(
  '/:id',
  requireRole('ADMIN'),
  validateParams(clientIdParamsSchema),
  controller.delete
);

// POST /api/clients/:id/test-connection
clientsRoutes.post(
  '/:id/test-connection',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(clientIdParamsSchema),
  controller.testConnection
);

// POST /api/clients/:id/sync
clientsRoutes.post(
  '/:id/sync',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(clientIdParamsSchema),
  controller.triggerSync
);

// GET /api/clients/:id/context
clientsRoutes.get(
  '/:id/context',
  validateParams(clientIdParamsSchema),
  controller.getContext
);

// PATCH /api/clients/:id/context
clientsRoutes.patch(
  '/:id/context',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(clientIdParamsSchema),
  controller.updateContext
);
