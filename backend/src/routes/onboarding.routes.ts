import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import {
  createOnboardingSubmissionSchema,
  listOnboardingSubmissionsQuerySchema,
  updateOnboardingStatusSchema,
  onboardingIdParamsSchema,
} from '../validators/onboarding.validator.js';

const controller = new OnboardingController();

// Public routes (no auth required)
export const onboardingPublicRoutes = Router();

// POST /api/onboarding
onboardingPublicRoutes.post(
  '/',
  validateBody(createOnboardingSubmissionSchema),
  controller.create
);

// Admin routes (auth required)
export const onboardingAdminRoutes = Router();

// GET /api/onboarding/submissions
onboardingAdminRoutes.get(
  '/',
  validateQuery(listOnboardingSubmissionsQuerySchema),
  controller.list
);

// GET /api/onboarding/submissions/:id
onboardingAdminRoutes.get(
  '/:id',
  validateParams(onboardingIdParamsSchema),
  controller.get
);

// PATCH /api/onboarding/submissions/:id/status
onboardingAdminRoutes.patch(
  '/:id/status',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(onboardingIdParamsSchema),
  validateBody(updateOnboardingStatusSchema),
  controller.updateStatus
);
