import { Router } from 'express';
import { CampaignsController } from '../controllers/campaigns.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdParamsSchema,
  listCampaignsQuerySchema,
  scheduleCampaignSchema,
  approveCampaignSchema,
} from '../validators/campaign.validator.js';

export const campaignsRoutes = Router();
const controller = new CampaignsController();

// Apply audit middleware
campaignsRoutes.use(auditMiddleware('campaign'));

// GET /api/campaigns
campaignsRoutes.get(
  '/',
  validateQuery(listCampaignsQuerySchema),
  controller.list
);

// GET /api/campaigns/:id
campaignsRoutes.get(
  '/:id',
  validateParams(campaignIdParamsSchema),
  controller.get
);

// POST /api/campaigns
campaignsRoutes.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validateBody(createCampaignSchema),
  controller.create
);

// PATCH /api/campaigns/:id
campaignsRoutes.patch(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(campaignIdParamsSchema),
  validateBody(updateCampaignSchema),
  controller.update
);

// DELETE /api/campaigns/:id
campaignsRoutes.delete(
  '/:id',
  requireRole('ADMIN'),
  validateParams(campaignIdParamsSchema),
  controller.delete
);

// POST /api/campaigns/:id/schedule
campaignsRoutes.post(
  '/:id/schedule',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(campaignIdParamsSchema),
  validateBody(scheduleCampaignSchema),
  controller.schedule
);

// POST /api/campaigns/:id/approve
campaignsRoutes.post(
  '/:id/approve',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(campaignIdParamsSchema),
  validateBody(approveCampaignSchema),
  controller.approve
);

// POST /api/campaigns/:id/request-changes
campaignsRoutes.post(
  '/:id/request-changes',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(campaignIdParamsSchema),
  controller.requestChanges
);

// GET /api/campaigns/:id/versions
campaignsRoutes.get(
  '/:id/versions',
  validateParams(campaignIdParamsSchema),
  controller.getVersions
);
