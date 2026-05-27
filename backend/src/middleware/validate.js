const logger = require('../config/logger');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, ''));
      logger.warn(`Validation failed: ${messages.join(', ')}`);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    req.body = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, ''));
      return res.status(400).json({ error: 'Invalid query parameters', details: messages });
    }
    req.query = value;
    next();
  };
}

module.exports = { validate, validateQuery };
