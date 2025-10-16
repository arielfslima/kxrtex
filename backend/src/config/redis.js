const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
};

const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('close', () => {
  logger.info('Redis connection closed');
});

// Cache helper functions
const cache = {
  // Get cached data
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  },

  // Set cache with expiration
  async set(key, value, ttlSeconds = 3600) {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setex(key, ttlSeconds, data);
      } else {
        await redisClient.set(key, data);
      }
      return true;
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  },

  // Delete cached data
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  },

  // Clear cache by pattern
  async clearPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Error clearing cache pattern ${pattern}:`, error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Error checking existence for key ${key}:`, error);
      return false;
    }
  },

  // Set expiration time
  async expire(key, seconds) {
    try {
      await redisClient.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error(`Error setting expiration for key ${key}:`, error);
      return false;
    }
  }
};

module.exports = redisClient;
module.exports.cache = cache;