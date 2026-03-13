const { Router } = require('express');
const authCtrl = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema, refreshSchema } = require('../utils/schemas');

const router = Router();

router.use(authRateLimiter);

router.post('/register', validate(registerSchema), authCtrl.register);
router.post('/login', validate(loginSchema), authCtrl.login);
router.post('/refresh', validate(refreshSchema), authCtrl.refresh);
router.post('/logout', authenticate, authCtrl.logout);
router.get('/me', authenticate, authCtrl.me);

module.exports = router;
