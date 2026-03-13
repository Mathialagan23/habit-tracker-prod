const Habit = require('../models/Habit');
const emailService = require('./email.service');
const logger = require('../utils/logger');

const REMINDER_TIMEZONE = 'Asia/Kolkata';
const SEND_BATCH_SIZE = 25;

const getZonedTimeParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    hhmm: `${map.hour}:${map.minute}`,
    minuteKey: `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`,
  };
};

const sendBatch = async (habits, minuteStartUtc) => {
  const sentHabitIds = [];
  let missingEmailCount = 0;
  let failedCount = 0;
  let duplicateSkippedCount = 0;
  let claimedCount = 0;

  for (const habit of habits) {
    const claimResult = await Habit.updateOne(
      {
        _id: habit._id,
        $or: [
          { lastReminderSent: { $exists: false } },
          { lastReminderSent: null },
          { lastReminderSent: { $lt: minuteStartUtc } },
        ],
      },
      { $set: { lastReminderSent: minuteStartUtc } }
    );

    if (claimResult.modifiedCount === 0) {
      duplicateSkippedCount += 1;
      continue;
    }
    claimedCount += 1;

    const userEmail = habit.userId?.email;

    if (!userEmail) {
      missingEmailCount += 1;
      logger.warn(
        { habitId: habit._id, userId: habit.userId?._id || null },
        'Skipping reminder: missing user email'
      );
      continue;
    }

    try {
      await emailService.sendReminder(userEmail, habit.name);
      sentHabitIds.push(habit._id);
    } catch (err) {
      failedCount += 1;
      logger.error(
        { err, habitId: habit._id, userId: habit.userId?._id || null, email: userEmail },
        'Failed to send reminder'
      );
    }
  }

  return { sentHabitIds, missingEmailCount, failedCount, duplicateSkippedCount, claimedCount };
};

/**
 * Process all pending reminders for the current minute.
 * Returns the total number of reminders successfully sent.
 */
const processReminders = async () => {
  const now = new Date();
  const zoned = getZonedTimeParts(now, REMINDER_TIMEZONE);
  const currentTime = zoned.hhmm;
  const minuteStartUtc = new Date(now);
  minuteStartUtc.setSeconds(0, 0);

  logger.info(
    {
      event: 'reminder_tick_start',
      timezone: REMINDER_TIMEZONE,
      serverTimeIso: now.toISOString(),
      localMinute: zoned.minuteKey,
      hhmm: currentTime,
    },
    'Reminder processing started'
  );

  const habits = await Habit.find({
    reminderEnabled: true,
    isArchived: false,
    $and: [
      { $or: [{ reminderTime: currentTime }, { schedule: currentTime }] },
      {
        $or: [
          { lastReminderSent: { $exists: false } },
          { lastReminderSent: null },
          { lastReminderSent: { $lt: minuteStartUtc } },
        ],
      },
    ],
  })
    .select('_id name reminderTime schedule lastReminderSent userId')
    .populate('userId', 'email name')
    .lean();

  logger.info(
    {
      event: 'reminder_candidates_fetched',
      hhmm: currentTime,
      candidateCount: habits.length,
    },
    'Fetched reminder candidates'
  );

  let sentCount = 0;
  let missingEmailCount = 0;
  let failedCount = 0;
  let duplicateSkippedCount = 0;
  let claimedCount = 0;
  const sentHabitIds = [];

  for (let i = 0; i < habits.length; i += SEND_BATCH_SIZE) {
    const batch = habits.slice(i, i + SEND_BATCH_SIZE);
    const result = await sendBatch(batch, minuteStartUtc);

    sentCount += result.sentHabitIds.length;
    missingEmailCount += result.missingEmailCount;
    failedCount += result.failedCount;
    duplicateSkippedCount += result.duplicateSkippedCount;
    claimedCount += result.claimedCount;
    sentHabitIds.push(...result.sentHabitIds);
  }

  logger.info(
    {
      event: 'reminder_tick_complete',
      hhmm: currentTime,
      candidateCount: habits.length,
      sentCount,
      claimedCount,
      missingEmailCount,
      failedCount,
      duplicateSkippedCount,
      updatedLastSentCount: claimedCount,
    },
    'Reminder processing completed'
  );

  return sentCount;
};

module.exports = { processReminders };
