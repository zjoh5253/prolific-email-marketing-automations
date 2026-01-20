import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { clientsRoutes } from './clients.routes.js';
import { campaignsRoutes } from './campaigns.routes.js';
import { listsRoutes } from './lists.routes.js';
import { assetsRoutes } from './assets.routes.js';
import { cadencesRoutes } from './cadences.routes.js';
import { alertsRoutes } from './alerts.routes.js';
import { calendarRoutes } from './calendar.routes.js';
import { analyticsRoutes } from './analytics.routes.js';
import { adminRoutes } from './admin.routes.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/clients', authMiddleware, clientsRoutes);
router.use('/campaigns', authMiddleware, campaignsRoutes);
router.use('/lists', authMiddleware, listsRoutes);
router.use('/assets', authMiddleware, assetsRoutes);
router.use('/cadences', authMiddleware, cadencesRoutes);
router.use('/alerts', authMiddleware, alertsRoutes);
router.use('/calendar', authMiddleware, calendarRoutes);
router.use('/analytics', authMiddleware, analyticsRoutes);
router.use('/admin', authMiddleware, adminRoutes);
