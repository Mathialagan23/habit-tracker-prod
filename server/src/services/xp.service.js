const User = require('../models/User');
const XpLog = require('../models/XpLog');
const logger = require('../utils/logger');

class XpService {
  /**
   * Add XP to a user, update level atomically, and write an XP log entry.
   *
   * Uses atomic $inc for XP and a targeted $set for level to prevent the
   * full-document-save race condition where a concurrent $inc would be
   * overwritten by user.save().
   *
   * @param {string} userId
   * @param {number} amount
   * @param {'habit_completion'|'achievement_unlock'|'weekly_streak'} source
   * @returns {{ xp: number, level: number, leveledUp: boolean } | null}
   */
  async addXP(userId, amount, source = 'unknown') {
    if (amount <= 0) return null;

    // Step 1: atomically increment XP, retrieve updated document
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: amount } },
      { new: true }
    );
    if (!user) return null;

    // Step 2: recalculate level from new XP total
    const newLevel = this.calculateLevel(user.xp);
    const leveledUp = newLevel > user.level;

    // Step 3: update level with a targeted $set — never user.save() —
    // so we never overwrite the xp field with a stale in-memory value.
    if (newLevel !== user.level) {
      await User.findByIdAndUpdate(userId, { $set: { level: newLevel } });
    }

    // Step 4: persist XP history entry
    try {
      await XpLog.create({ userId, amount, source });
    } catch (err) {
      // Non-critical: log the error but don't fail the whole XP grant
      logger.warn({ userId, amount, source, err: err.message }, 'Failed to write XpLog entry');
    }

    logger.info(
      { userId, amount, source, totalXp: user.xp, level: newLevel, leveledUp },
      `XP awarded: +${amount} (${source})`
    );

    if (leveledUp) {
      logger.info({ userId, newLevel, xp: user.xp }, 'User leveled up');
    }

    return { xp: user.xp, level: newLevel, leveledUp };
  }

  /**
   * Deterministic level formula.
   *
   * level = floor(sqrt(xp / 100)) + 1
   *
   * Progression:
   *   Level 1  →    0 XP
   *   Level 2  →  100 XP
   *   Level 3  →  300 XP
   *   Level 4  →  600 XP
   *   Level 5  → 1000 XP
   */
  calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
}

module.exports = new XpService();
