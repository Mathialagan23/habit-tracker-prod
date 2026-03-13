const { Router } = require('express');
const config = require('../config');
const logger = require('../utils/logger');
const { runReminders, runWeeklyReports } = require('../controllers/jobs.controller');

const router = Router();

/**
 * Middleware to authenticate Cloud Scheduler requests.
 * Validates the shared secret sent in the X-Jobs-Secret header.
 */
const authenticateJob = (req, res, next) => {
  const secret = req.headers['x-jobs-secret'];

  if (!config.jobsSecret) {
    logger.warn('JOBS_SECRET is not configured — job endpoints are unprotected');
    return next();
  }

  if (secret !== config.jobsSecret) {
    logger.warn(
      { event: 'job_auth_failed', ip: req.ip, path: req.path },
      'Unauthorized job request'
    );
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid job secret' },
    });
  }

  next();
};

router.use(authenticateJob);

router.post('/reminders', runReminders);
router.post('/weekly-reports', runWeeklyReports);

module.exports = router;
