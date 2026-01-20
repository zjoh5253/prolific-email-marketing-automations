import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export interface AuditContext {
  userId?: string;
  clientId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export async function createAuditLog(
  context: AuditContext,
  req?: Request
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: context.userId,
        clientId: context.clientId,
        action: context.action,
        entityType: context.entityType,
        entityId: context.entityId,
        oldValues: context.oldValues,
        newValues: context.newValues,
        ipAddress: req?.ip || req?.socket.remoteAddress,
        userAgent: req?.headers['user-agent'],
      },
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    logger.error({ error, context }, 'Failed to create audit log');
  }
}

// Middleware for automatic audit logging on write operations
export function auditMiddleware(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store the original json method
    const originalJson = res.json.bind(res);

    // Override json to capture response and log audit
    res.json = function (body: any) {
      // Only audit successful write operations
      if (
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
        res.statusCode >= 200 &&
        res.statusCode < 300
      ) {
        const action = getActionFromMethod(req.method);
        const entityId = req.params.id || body?.data?.id;

        createAuditLog(
          {
            userId: req.user?.id,
            clientId: req.params.clientId,
            action: `${entityType}.${action}`,
            entityType,
            entityId,
            newValues: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
          },
          req
        );
      }

      return originalJson(body);
    };

    next();
  };
}

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST':
      return 'created';
    case 'PUT':
    case 'PATCH':
      return 'updated';
    case 'DELETE':
      return 'deleted';
    default:
      return 'accessed';
  }
}
