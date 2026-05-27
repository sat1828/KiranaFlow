const jwt = require('jsonwebtoken');
const config = require('../config');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

function authenticate(roles = []) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      logger.error(`Auth error: ${error.message}`);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, config.jwt.secret);
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuth };
