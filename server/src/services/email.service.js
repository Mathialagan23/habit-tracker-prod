const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter = null;
let smtpVerified = false;

/**
 * Lazily create and verify the SMTP transporter.
 * Returns null if email credentials are not configured.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (!config.email.user || !config.email.pass) {
    logger.warn(
      {
        hasUser: !!config.email.user,
        hasPass: !!config.email.pass,
        service: config.email.service,
      },
      'Email not configured — EMAIL_USER and/or EMAIL_PASS missing'
    );
    return null;
  }

  logger.info(
    {
      service: config.email.service,
      user: config.email.user,
      from: config.email.from,
    },
    'Creating SMTP transporter'
  );

  transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // Verify SMTP connection — await instead of fire-and-forget
  try {
    await transporter.verify();
    smtpVerified = true;
    logger.info('SMTP connection verified — ready to send emails');
  } catch (err) {
    logger.error(
      {
        err,
        service: config.email.service,
        user: config.email.user,
      },
      'SMTP verification failed — emails will likely fail. Check EMAIL_USER and EMAIL_PASS (use Gmail App Password, not account password).'
    );
    // Don't null out transporter — allow retry attempts that will produce
    // actionable error messages per send call
  }

  return transporter;
};

class EmailService {
  async sendReminder(to, habitName) {
    const transport = await getTransporter();
    if (!transport) {
      logger.warn({ to, habitName }, 'Email not configured — skipping reminder');
      return;
    }

    await transport.sendMail({
      from: config.email.from,
      to,
      subject: 'Habit Reminder',
      text: `Time to complete your habit: ${habitName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>⏰ Habit Reminder</h2>
          <p>Time to complete your habit: <strong>${habitName}</strong>
          Keep your streak going 🔥</p>
        </div>
      `,
    });
    logger.info({ to, habitName }, 'Reminder email sent');
  }

  async sendWeeklyReport(to, name, stats) {
    const transport = await getTransporter();
    if (!transport) {
      logger.warn({ to }, 'Email not configured — skipping weekly report');
      return;
    }

    await transport.sendMail({
      from: config.email.from,
      to,
      subject: 'Your Weekly Habit Report',
      text: `Hi ${name}, you completed ${stats.habitsCompleted} habits this week. Best streak: ${stats.bestStreak} days. Top habit: ${stats.topHabit}.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
          <h2>📊 Weekly Habit Report</h2>
          <p>Hi <strong>${name}</strong>, here's your weekly summary:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Habits completed</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">${stats.habitsCompleted}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Best streak</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">🔥 ${stats.bestStreak} days</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Top habit</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">⭐ ${stats.topHabit}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Active habits</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">${stats.totalHabits}</td>
            </tr>
          </table>
          <p style="color: #64748b; font-size: 14px;">Keep building great habits! 💪</p>
        </div>
      `,
    });
    logger.info({ to }, 'Weekly report email sent');
  }
}

module.exports = new EmailService();
