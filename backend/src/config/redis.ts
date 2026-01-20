import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error({ error }, '❌ Redis connection error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// For BullMQ - it needs a separate connection
export const redisConnection = {
  host: new URL(config.REDIS_URL).hostname || 'localhost',
  port: parseInt(new URL(config.REDIS_URL).port || '6379', 10),
};

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
