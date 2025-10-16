const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Middleware to handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation errors:', {
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      errors: errorMessages
    });

    // Return detailed validation errors
    throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', {
      errors: errorMessages
    });
  }

  next();
};

/**
 * Middleware to sanitize request body
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potentially harmful characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return sanitizeValue(obj);
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Middleware to validate file uploads
 */
const validateFileUpload = (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        throw new AppError(
          `Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`,
          400,
          'FILE_TOO_LARGE'
        );
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        throw new AppError(
          `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`,
          400,
          'INVALID_FILE_TYPE'
        );
      }

      // Check for potentially dangerous file extensions
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
      const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

      if (dangerousExtensions.includes(fileExtension)) {
        throw new AppError(
          'Tipo de arquivo não permitido por motivos de segurança',
          400,
          'DANGEROUS_FILE_TYPE'
        );
      }
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;

      let resource;
      let hasAccess = false;

      switch (resourceType) {
        case 'booking':
          const { Booking, Profissional } = require('../models');
          resource = await Booking.findByPk(resourceId, {
            include: [{
              model: Profissional,
              as: 'profissional',
              attributes: ['usuario_id']
            }]
          });

          if (resource) {
            hasAccess = resource.contratante_id === userId ||
                       resource.profissional?.usuario_id === userId ||
                       req.user.tipo === 'admin';
          }
          break;

        case 'payment':
          const { Pagamento } = require('../models');
          resource = await Pagamento.findByPk(resourceId, {
            include: [{
              model: Booking,
              as: 'booking',
              include: [{
                model: Profissional,
                as: 'profissional',
                attributes: ['usuario_id']
              }]
            }]
          });

          if (resource) {
            hasAccess = resource.booking.contratante_id === userId ||
                       resource.booking.profissional?.usuario_id === userId ||
                       req.user.tipo === 'admin';
          }
          break;

        case 'portfolio':
          const { Portfolio } = require('../models');
          resource = await Portfolio.findByPk(resourceId, {
            include: [{
              model: Profissional,
              as: 'profissional',
              attributes: ['usuario_id']
            }]
          });

          if (resource) {
            hasAccess = resource.profissional?.usuario_id === userId ||
                       req.user.tipo === 'admin';
          }
          break;

        case 'notification':
          const { Notificacao } = require('../models');
          resource = await Notificacao.findByPk(resourceId);

          if (resource) {
            hasAccess = resource.usuario_id === userId ||
                       req.user.tipo === 'admin';
          }
          break;

        default:
          throw new AppError('Tipo de recurso não suportado', 500, 'UNSUPPORTED_RESOURCE_TYPE');
      }

      if (!resource) {
        throw new AppError('Recurso não encontrado', 404, 'RESOURCE_NOT_FOUND');
      }

      if (!hasAccess) {
        throw new AppError('Acesso negado a este recurso', 403, 'ACCESS_DENIED');
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is a professional
 */
const requireProfessional = async (req, res, next) => {
  try {
    if (req.user.tipo !== 'artista') {
      throw new AppError('Acesso restrito a artistas', 403, 'PROFESSIONAL_REQUIRED');
    }

    const { Profissional } = require('../models');
    const professional = await Profissional.findOne({
      where: { usuario_id: req.user.id }
    });

    if (!professional) {
      throw new AppError('Perfil profissional não encontrado', 404, 'PROFESSIONAL_PROFILE_NOT_FOUND');
    }

    req.professional = professional;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is a contractor
 */
const requireContractor = (req, res, next) => {
  if (req.user.tipo !== 'contratante') {
    throw new AppError('Acesso restrito a contratantes', 403, 'CONTRACTOR_REQUIRED');
  }
  next();
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    throw new AppError('Acesso restrito a administradores', 403, 'ADMIN_REQUIRED');
  }
  next();
};

/**
 * Middleware to log request details for debugging
 */
const logRequestDetails = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Request details:', {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      userId: req.user?.id,
      userType: req.user?.tipo
    });
  }
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateFileUpload,
  checkResourceOwnership,
  requireProfessional,
  requireContractor,
  requireAdmin,
  logRequestDetails
};