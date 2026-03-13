/**
 * DEPRECATED: Reminder scheduling has been migrated to Cloud Scheduler.
 *
 * Reminders are now triggered via HTTP: POST /jobs/reminders
 * Core logic lives in: services/reminder.service.js
 *
 * This file is kept for reference only.
 * The startReminderJob export is a no-op to prevent breakage if
 * anything still imports it.
 */
const logger = require('../utils/logger');

const startReminderJob = () => {
  logger.info(
    'startReminderJob() is deprecated — reminders are now triggered via POST /jobs/reminders (Cloud Scheduler)'
  );
};

module.exports = { startReminderJob };
