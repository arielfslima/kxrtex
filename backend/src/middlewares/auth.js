const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const blacklisted = await cache.exists(`blacklist_${token}`);
    if (blacklisted) {
      throw new AppError('Token inválido', 401, 'BLACKLISTED_TOKEN');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from cache or database
    const cachedUser = await cache.get(`user_${decoded.id}`);

    if (cachedUser) {
      req.user = cachedUser;
    } else {
      // TODO: Fetch user from database when models are ready
      req.user = decoded;
    }

    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Token inválido', 401, 'INVALID_TOKEN'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expirado', 401, 'TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const blacklisted = await cache.exists(`blacklist_${token}`);
    if (blacklisted) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from cache
    const cachedUser = await cache.get(`user_${decoded.id}`);

    if (cachedUser) {
      req.user = cachedUser;
    } else {
      req.user = decoded;
    }

    req.token = token;
  } catch (error) {
    logger.debug('Optional auth token invalid:', error.message);
  }

  next();
};

// Check user role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Não autorizado', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.tipo)) {
      return next(new AppError('Acesso negado', 403, 'ACCESS_DENIED'));
    }

    next();
  };
};

// Check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Não autorizado', 401, 'UNAUTHORIZED'));
  }

  if (!req.user.verificado) {
    return next(new AppError('Conta não verificada', 403, 'ACCOUNT_NOT_VERIFIED'));
  }

  next();
};

// Check if user owns the resource
const requireOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Não autorizado', 401, 'UNAUTHORIZED'));
    }

    const resourceId = req.params[paramName];

    // Admin can access everything
    if (req.user.tipo === 'admin') {
      return next();
    }

    // Check ownership
    if (req.user.id !== resourceId) {
      return next(new AppError('Acesso negado', 403, 'ACCESS_DENIED'));
    }

    next();
  };
};

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    tipo: user.tipo,
    verificado: user.verificado
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireVerified,
  requireOwnership,
  generateTokens,
  verifyRefreshToken
};