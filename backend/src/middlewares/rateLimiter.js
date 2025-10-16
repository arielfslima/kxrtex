const rateLimit = require('express-rate-limit');
const { cache } = require('../config/redis');

// Store for rate limit using Redis
const RedisStore = {
  async increment(key) {
    const current = await cache.get(key) || 0;
    const next = current + 1;
    await cache.set(key, next, 900); // 15 minutes
    return next;
  },

  async decrement(key) {
    const current = await cache.get(key) || 0;
    if (current > 0) {
      const next = current - 1;
      await cache.set(key, next, 900);
      return next;
    }
    return 0;
  },

  async resetKey(key) {
    await cache.del(key);
  }
};

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Por favor, tente novamente mais tarde.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisStore,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Muitas tentativas. Por favor, aguarde 15 minutos.'
    }
  },
  skipSuccessfulRequests: true,
  store: RedisStore,
  keyGenerator: (req) => {
    return `auth_${req.ip || req.connection.remoteAddress}_${req.body.email || ''}`;
  }
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Limite de uploads excedido. Tente novamente em 1 hora.'
    }
  },
  store: RedisStore,
  keyGenerator: (req) => {
    return `upload_${req.user?.id || req.ip}`;
  }
});

// API rate limiter for external integrations
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'Limite de API excedido. Máximo 30 requisições por minuto.'
    }
  },
  store: RedisStore,
  keyGenerator: (req) => {
    return `api_${req.headers['x-api-key'] || req.ip}`;
  }
});

module.exports = generalLimiter;
module.exports.authLimiter = authLimiter;
module.exports.uploadLimiter = uploadLimiter;
module.exports.apiLimiter = apiLimiter;