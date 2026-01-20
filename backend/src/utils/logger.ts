import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    env: process.env.NODE_ENV,
    service: 'prolific-api',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      '*.password',
      '*.passwordHash',
      '*.apiKey',
      '*.credentials',
      '*.encryptedData',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});

// Child loggers for specific contexts
export const createLogger = (context: string) => logger.child({ context });

export const httpLogger = createLogger('http');
export const dbLogger = createLogger('database');
export const jobLogger = createLogger('jobs');
export const platformLogger = createLogger('platform');
export const authLogger = createLogger('auth');
