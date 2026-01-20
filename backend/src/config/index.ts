import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Encryption
  ENCRYPTION_KEY: z.string().length(64),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Worker
  WORKER_CONCURRENCY: z.string().transform(Number).default('5'),

  // Asset Storage
  ASSET_STORAGE_PATH: z.string().default('./uploads'),

  // Notifications
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().optional(),
  SLACK_CHANNEL: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();

export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
