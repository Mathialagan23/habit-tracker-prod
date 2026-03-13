const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.isOperational ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error({ err, requestId: req.id }, message);
  } else {
    logger.warn({ requestId: req.id, code }, message);
  }

  const response = {
    error: {
      code,
      message,
    },
  };

  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
