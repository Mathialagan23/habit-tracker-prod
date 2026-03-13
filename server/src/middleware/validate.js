const AppError = require('../utils/AppError');

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return next(new AppError(messages, 400, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
