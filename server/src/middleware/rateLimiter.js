const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('../config');
const AppError = require('../utils/AppError');

const defaultLimiter = new RateLimiterMemory({
  points: config.rateLimit.maxRequests,
  duration: config.rateLimit.windowSec,
});

const authLimiter = new RateLimiterMemory({
  points: config.rateLimit.authMaxRequests,
  duration: config.rateLimit.windowSec,
});

const createMiddleware = (limiter) => async (req, _res, next) => {
  const key = req.user?.id || req.ip;
  try {
    await limiter.consume(key);
    next();
  } catch {
    next(new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'));
  }
};

module.exports = {
  rateLimiter: createMiddleware(defaultLimiter),
  authRateLimiter: createMiddleware(authLimiter),
};
