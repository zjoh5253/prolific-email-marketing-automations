import { Router } from 'express';
import { AssetsController } from '../controllers/assets.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const assetsRoutes = Router();
const controller = new AssetsController();

const assetIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const listAssetsQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  type: z.enum(['LOGO', 'HEADER_IMAGE', 'PRODUCT_IMAGE', 'BRAND_COLORS', 'EMAIL_TEMPLATE', 'SIGNATURE']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const createAssetSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['LOGO', 'HEADER_IMAGE', 'PRODUCT_IMAGE', 'BRAND_COLORS', 'EMAIL_TEMPLATE', 'SIGNATURE']),
  url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/assets
assetsRoutes.get(
  '/',
  validateQuery(listAssetsQuerySchema),
  controller.list
);

// GET /api/assets/:id
assetsRoutes.get(
  '/:id',
  validateParams(assetIdParamsSchema),
  controller.get
);

// POST /api/assets
assetsRoutes.post(
  '/',
  requireRole('ADMIN', 'MANAGER'),
  validateBody(createAssetSchema),
  controller.create
);

// DELETE /api/assets/:id
assetsRoutes.delete(
  '/:id',
  requireRole('ADMIN'),
  validateParams(assetIdParamsSchema),
  controller.delete
);
