const logger = require('../utils/logger');

class NotificationService {
  async sendReminder(userId, habitNames) {
    logger.info({ userId, habitNames }, 'Sending reminder (stub)');
    return { sent: true };
  }

  async sendWeeklyDigest(userId, stats) {
    logger.info({ userId, stats }, 'Sending weekly digest (stub)');
    return { sent: true };
  }
}

module.exports = new NotificationService();
