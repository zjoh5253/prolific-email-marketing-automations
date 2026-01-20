import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

export const authRoutes = Router();
const controller = new AuthController();

// POST /api/auth/register
authRoutes.post('/register', validateBody(registerSchema), controller.register);

// POST /api/auth/login
authRoutes.post('/login', validateBody(loginSchema), controller.login);

// POST /api/auth/logout
authRoutes.post('/logout', authMiddleware, controller.logout);

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, controller.me);

// POST /api/auth/refresh
authRoutes.post('/refresh', controller.refresh);
