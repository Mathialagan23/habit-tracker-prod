const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

const authenticate = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
  }
};

module.exports = authenticate;
