const { cache } = require('../config/redis');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Create a throttling middleware for specific actions
 * @param {string} action - Action identifier
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} keyGenerator - Function to generate cache key
 */
const createActionThrottle = (action, maxAttempts = 5, windowMs = 60000, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.ip;
      const key = keyGenerator ? keyGenerator(req) : `throttle:${action}:${userId}`;

      // Get current attempt count
      const attempts = await cache.get(key);
      const currentAttempts = parseInt(attempts) || 0;

      if (currentAttempts >= maxAttempts) {
        const ttl = await cache.ttl(key);
        const remainingTime = Math.ceil(ttl / 60);

        logger.warn(`Action throttled: ${action}`, {
          userId,
          attempts: currentAttempts,
          maxAttempts,
          remainingTime
        });

        throw new AppError(
          `Muitas tentativas para ${action}. Tente novamente em ${remainingTime} minutos.`,
          429,
          'TOO_MANY_ATTEMPTS',
          { remainingTime, maxAttempts }
        );
      }

      // Increment attempt count
      await cache.setex(key, Math.ceil(windowMs / 1000), currentAttempts + 1);

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Throttling for booking creation
 */
const bookingCreationThrottle = createActionThrottle(
  'criar_booking',
  3, // 3 bookings
  5 * 60 * 1000, // per 5 minutes
  (req) => `throttle:booking_creation:${req.user.id}`
);

/**
 * Throttling for payment attempts
 */
const paymentAttemptThrottle = createActionThrottle(
  'tentativa_pagamento',
  5, // 5 attempts
  15 * 60 * 1000, // per 15 minutes
  (req) => `throttle:payment:${req.user.id}:${req.params.booking_id}`
);

/**
 * Throttling for password reset requests
 */
const passwordResetThrottle = createActionThrottle(
  'reset_senha',
  3, // 3 attempts
  60 * 60 * 1000, // per hour
  (req) => `throttle:password_reset:${req.body.email}`
);

/**
 * Throttling for login attempts
 */
const loginAttemptThrottle = createActionThrottle(
  'tentativa_login',
  5, // 5 attempts
  15 * 60 * 1000, // per 15 minutes
  (req) => `throttle:login:${req.body.email}`
);

/**
 * Throttling for registration attempts
 */
const registrationThrottle = createActionThrottle(
  'registro',
  3, // 3 registrations
  60 * 60 * 1000, // per hour
  (req) => `throttle:registration:${req.ip}`
);

/**
 * Throttling for profile updates
 */
const profileUpdateThrottle = createActionThrottle(
  'atualizar_perfil',
  10, // 10 updates
  60 * 60 * 1000, // per hour
  (req) => `throttle:profile_update:${req.user.id}`
);

/**
 * Throttling for message sending
 */
const messageSendThrottle = createActionThrottle(
  'enviar_mensagem',
  50, // 50 messages
  60 * 60 * 1000, // per hour
  (req) => `throttle:message:${req.user.id}`
);

/**
 * Throttling for file uploads
 */
const fileUploadThrottle = createActionThrottle(
  'upload_arquivo',
  20, // 20 uploads
  60 * 60 * 1000, // per hour
  (req) => `throttle:upload:${req.user.id}`
);

/**
 * Throttling for search requests
 */
const searchThrottle = createActionThrottle(
  'busca',
  100, // 100 searches
  60 * 60 * 1000, // per hour
  (req) => `throttle:search:${req.user?.id || req.ip}`
);

/**
 * Throttling for booking responses (accept/reject)
 */
const bookingResponseThrottle = createActionThrottle(
  'resposta_booking',
  10, // 10 responses
  60 * 60 * 1000, // per hour
  (req) => `throttle:booking_response:${req.user.id}`
);

/**
 * Clear throttling for a specific action and user
 */
const clearThrottle = async (action, identifier) => {
  try {
    const key = `throttle:${action}:${identifier}`;
    await cache.del(key);
    logger.info(`Throttle cleared for action: ${action}, identifier: ${identifier}`);
  } catch (error) {
    logger.error('Error clearing throttle:', error);
  }
};

/**
 * Get remaining attempts for a specific action
 */
const getRemainingAttempts = async (action, identifier, maxAttempts) => {
  try {
    const key = `throttle:${action}:${identifier}`;
    const attempts = await cache.get(key);
    const currentAttempts = parseInt(attempts) || 0;
    return Math.max(0, maxAttempts - currentAttempts);
  } catch (error) {
    logger.error('Error getting remaining attempts:', error);
    return maxAttempts;
  }
};

/**
 * Middleware to add throttling info to response headers
 */
const addThrottlingHeaders = (action, maxAttempts) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.ip;
      const remaining = await getRemainingAttempts(action, userId, maxAttempts);

      res.set({
        'X-RateLimit-Limit': maxAttempts,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
      });

      next();
    } catch (error) {
      next();
    }
  };
};

/**
 * Advanced throttling with different limits for different user types
 */
const createTieredThrottle = (action, limits, windowMs = 60000) => {
  return async (req, res, next) => {
    try {
      const userType = req.user?.tipo || 'guest';
      const userId = req.user?.id || req.ip;
      const maxAttempts = limits[userType] || limits.default || 5;

      const key = `throttle:${action}:${userId}`;
      const attempts = await cache.get(key);
      const currentAttempts = parseInt(attempts) || 0;

      if (currentAttempts >= maxAttempts) {
        const ttl = await cache.ttl(key);
        const remainingTime = Math.ceil(ttl / 60);

        throw new AppError(
          `Limite de ${action} excedido para usuário ${userType}. Tente novamente em ${remainingTime} minutos.`,
          429,
          'TOO_MANY_ATTEMPTS',
          { remainingTime, maxAttempts, userType }
        );
      }

      await cache.setex(key, Math.ceil(windowMs / 1000), currentAttempts + 1);
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  createActionThrottle,
  bookingCreationThrottle,
  paymentAttemptThrottle,
  passwordResetThrottle,
  loginAttemptThrottle,
  registrationThrottle,
  profileUpdateThrottle,
  messageSendThrottle,
  fileUploadThrottle,
  searchThrottle,
  bookingResponseThrottle,
  clearThrottle,
  getRemainingAttempts,
  addThrottlingHeaders,
  createTieredThrottle
};