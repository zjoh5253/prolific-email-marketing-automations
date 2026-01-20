import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { authLogger } from '../utils/logger.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import type { JwtPayload } from '../middleware/auth.middleware.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body as RegisterInput;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      authLogger.info({ userId: user.id, email }, 'User registered');

      sendCreated(res, { user });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate JWT
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      authLogger.info({ userId: user.id, email }, 'User logged in');

      sendSuccess(res, {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (token) {
        await prisma.session.deleteMany({
          where: { token },
        });
      }

      authLogger.info({ userId: req.user?.id }, 'User logged out');

      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const oldToken = authHeader.substring(7);

      // Find session
      const session = await prisma.session.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Generate new JWT
      const payload: JwtPayload = {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      };

      const newToken = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
      });

      // Update session with new token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.session.update({
        where: { id: session.id },
        data: { token: newToken, expiresAt },
      });

      sendSuccess(res, { token: newToken });
    } catch (error) {
      next(error);
    }
  }
}
