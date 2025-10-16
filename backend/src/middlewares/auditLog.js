const logger = require('../utils/logger');
const { cache } = require('../config/redis');

/**
 * Middleware to log important user actions for audit purposes
 */
const auditLog = (action, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Store original res.json to intercept response
    const originalJson = res.json;
    let responseData = null;
    let statusCode = null;

    res.json = function(body) {
      responseData = body;
      statusCode = res.statusCode;
      return originalJson.call(this, body);
    };

    // Continue with the request
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const auditData = {
          timestamp: new Date().toISOString(),
          action,
          userId: req.user?.id,
          userType: req.user?.tipo,
          userEmail: req.user?.email,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          query: req.query,
          body: sanitizeForLog(req.body, options.sensitiveFields),
          statusCode,
          success: statusCode < 400,
          duration,
          resourceId: req.params.id || req.body?.id,
          resourceType: options.resourceType,
          metadata: options.metadata || {}
        };

        // Add response data if configured
        if (options.includeResponse && responseData) {
          auditData.response = sanitizeForLog(responseData, options.responseSensitiveFields);
        }

        // Log the audit entry
        logger.info('AUDIT', auditData);

        // Store in Redis for recent activity (optional)
        if (options.storeInCache && req.user?.id) {
          const cacheKey = `audit:user:${req.user.id}`;
          const recentActions = await cache.get(cacheKey) || [];

          recentActions.unshift({
            action,
            timestamp: auditData.timestamp,
            statusCode,
            duration,
            resourceId: auditData.resourceId
          });

          // Keep only last 50 actions
          const trimmedActions = recentActions.slice(0, 50);
          await cache.setex(cacheKey, 86400, JSON.stringify(trimmedActions)); // 24 hours
        }

        // Alert on suspicious activity
        if (options.alertOnFailure && !auditData.success) {
          await checkSuspiciousActivity(req.user?.id, action, auditData);
        }

      } catch (error) {
        logger.error('Error in audit logging:', error);
      }
    });

    next();
  };
};

/**
 * Sanitize sensitive data for logging
 */
const sanitizeForLog = (data, sensitiveFields = []) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const defaultSensitiveFields = [
    'senha', 'password', 'token', 'cartao_numero', 'cartao_cvv',
    'cartao_nome', 'cpf', 'cpf_cnpj', 'access_token', 'refresh_token'
  ];

  const allSensitiveFields = [...defaultSensitiveFields, ...(sensitiveFields || [])];

  const sanitized = JSON.parse(JSON.stringify(data));

  const sanitizeRecursive = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeRecursive(item));
    } else if (obj && typeof obj === 'object') {
      const sanitizedObj = {};
      for (const [key, value] of Object.entries(obj)) {
        if (allSensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          sanitizedObj[key] = '[REDACTED]';
        } else {
          sanitizedObj[key] = sanitizeRecursive(value);
        }
      }
      return sanitizedObj;
    }
    return obj;
  };

  return sanitizeRecursive(sanitized);
};

/**
 * Check for suspicious activity patterns
 */
const checkSuspiciousActivity = async (userId, action, auditData) => {
  if (!userId) return;

  try {
    const suspiciousKey = `suspicious:${userId}:${action}`;
    const failureCount = await cache.get(suspiciousKey) || 0;
    const newCount = parseInt(failureCount) + 1;

    // Set threshold based on action type
    const thresholds = {
      'login': 5,
      'payment_creation': 3,
      'booking_creation': 10,
      'default': 10
    };

    const threshold = thresholds[action] || thresholds.default;

    if (newCount >= threshold) {
      logger.warn('SUSPICIOUS_ACTIVITY', {
        userId,
        action,
        failureCount: newCount,
        threshold,
        recentAudit: auditData
      });

      // TODO: Implement alerting system (email, Slack, etc.)
      // TODO: Consider temporary account restrictions
    }

    // Store failure count with 1-hour expiry
    await cache.setex(suspiciousKey, 3600, newCount);

  } catch (error) {
    logger.error('Error checking suspicious activity:', error);
  }
};

/**
 * Predefined audit configurations for common actions
 */
const auditConfigs = {
  // Authentication actions
  login: auditLog('login', {
    sensitiveFields: ['senha', 'password'],
    alertOnFailure: true,
    storeInCache: true
  }),

  register: auditLog('register', {
    sensitiveFields: ['senha', 'password', 'cpf_cnpj'],
    storeInCache: true
  }),

  logout: auditLog('logout', {
    storeInCache: true
  }),

  passwordChange: auditLog('password_change', {
    sensitiveFields: ['senha_atual', 'nova_senha', 'confirmar_nova_senha'],
    storeInCache: true
  }),

  // Booking actions
  bookingCreate: auditLog('booking_creation', {
    resourceType: 'booking',
    storeInCache: true,
    alertOnFailure: true
  }),

  bookingAccept: auditLog('booking_accept', {
    resourceType: 'booking',
    storeInCache: true
  }),

  bookingReject: auditLog('booking_reject', {
    resourceType: 'booking',
    storeInCache: true
  }),

  bookingCancel: auditLog('booking_cancel', {
    resourceType: 'booking',
    storeInCache: true
  }),

  // Payment actions
  paymentCreate: auditLog('payment_creation', {
    resourceType: 'payment',
    sensitiveFields: ['cartao_numero', 'cartao_cvv', 'cartao_nome'],
    storeInCache: true,
    alertOnFailure: true
  }),

  // Profile actions
  profileUpdate: auditLog('profile_update', {
    resourceType: 'profile',
    sensitiveFields: ['cpf_cnpj'],
    storeInCache: true
  }),

  // File upload actions
  fileUpload: auditLog('file_upload', {
    resourceType: 'file',
    includeResponse: true,
    storeInCache: true
  }),

  // Admin actions
  adminAction: auditLog('admin_action', {
    includeResponse: true,
    storeInCache: true,
    alertOnFailure: true
  })
};

/**
 * Get user's recent audit logs
 */
const getUserAuditLogs = async (userId, limit = 20) => {
  try {
    const cacheKey = `audit:user:${userId}`;
    const recentActions = await cache.get(cacheKey);

    if (recentActions) {
      const actions = JSON.parse(recentActions);
      return actions.slice(0, limit);
    }

    return [];
  } catch (error) {
    logger.error('Error getting user audit logs:', error);
    return [];
  }
};

module.exports = {
  auditLog,
  auditConfigs,
  sanitizeForLog,
  getUserAuditLogs,
  checkSuspiciousActivity
};