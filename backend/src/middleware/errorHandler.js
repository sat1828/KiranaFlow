const logger = require('../config/logger');
const config = require('../config');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, _next) {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl} | ${err.stack}`);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Resource already exists', code: 'DUPLICATE' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
    }
    return res.status(400).json({ error: 'Database error', code: 'DB_ERROR' });
  }

  if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || 500;
  const message = config.env === 'production' ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

module.exports = { AppError, errorHandler, notFoundHandler };
