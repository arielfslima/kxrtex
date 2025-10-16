const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'ID inválido';
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Este ${field} já está em uso`;
    error = new AppError(message, 400, 'DUPLICATE_KEY');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    const message = errors.join('. ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    const message = errors.join('. ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `Este ${field} já está em uso`;
    error = new AppError(message, 400, 'DUPLICATE_KEY');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referência inválida';
    error = new AppError(message, 400, 'INVALID_REFERENCE');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Arquivo muito grande';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Campo de arquivo inesperado';
    error = new AppError(message, 400, 'UNEXPECTED_FILE');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    }
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;