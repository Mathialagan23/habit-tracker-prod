const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const xpService = require('./xp.service');
const logger = require('../utils/logger');

const DEFAULT_ACHIEVEMENTS = [
  {
    name: 'First Habit',
    description: 'Create your first habit',
    icon: 'star',
    condition: { type: 'habits_created', value: 1 },
    xpReward: 20,
  },
  {
    name: 'Consistency Starter',
    description: 'Complete 5 habits',
    icon: 'target',
    condition: { type: 'habits_completed', value: 5 },
    xpReward: 30,
  },
  {
    name: 'Streak Hero',
    description: 'Reach a 7 day streak',
    icon: 'flame',
    condition: { type: 'streak', value: 7 },
    xpReward: 50,
  },
  {
    name: 'Discipline Master',
    description: 'Reach a 30 day streak',
    icon: 'award',
    condition: { type: 'streak', value: 30 },
    xpReward: 100,
  },
  {
    name: 'Habit Veteran',
    description: 'Complete 100 habits',
    icon: 'trophy',
    condition: { type: 'habits_completed', value: 100 },
    xpReward: 150,
  },
];

class AchievementService {
  async seed() {
    for (const data of DEFAULT_ACHIEVEMENTS) {
      await Achievement.findOneAndUpdate(
        { name: data.name },
        { $setOnInsert: data },
        { upsert: true }
      );
    }
  }

  async checkAchievements(userId) {
    const user = await User.findById(userId);
    if (!user) return [];

    const allAchievements = await Achievement.find().lean();
    const unlockedSet = new Set(user.achievements.map((a) => a.toString()));
    const newlyUnlocked = [];

    const [habitCount, logCount, maxStreak] = await Promise.all([
      Habit.countDocuments({ userId }),
      HabitLog.countDocuments({ userId }),
      Habit.find({ userId }).select('bestStreak').lean().then((habits) =>
        Math.max(0, ...habits.map((h) => h.bestStreak || 0))
      ),
    ]);

    for (const achievement of allAchievements) {
      const achievementId = achievement._id.toString();
      if (unlockedSet.has(achievementId)) continue;

      let earned = false;
      switch (achievement.condition.type) {
        case 'habits_created':
          earned = habitCount >= achievement.condition.value;
          break;
        case 'habits_completed':
          earned = logCount >= achievement.condition.value;
          break;
        case 'streak':
          earned = maxStreak >= achievement.condition.value;
          break;
      }

      if (earned) {
        // Atomically add to achievements — $addToSet prevents duplicates even
        // if checkAchievements() runs concurrently for the same user.
        const result = await User.updateOne(
          { _id: userId, achievements: { $ne: achievement._id } },
          { $addToSet: { achievements: achievement._id } }
        );

        // If modifiedCount is 0, another call already unlocked this achievement
        if (result.modifiedCount === 0) {
          logger.debug(
            { userId, achievement: achievement.name },
            'Achievement already unlocked by concurrent call — skipping XP'
          );
          unlockedSet.add(achievementId);
          continue;
        }

        // Update in-memory set immediately to prevent duplicates within this loop
        unlockedSet.add(achievementId);
        newlyUnlocked.push(achievement);

        if (achievement.xpReward > 0) {
          await xpService.addXP(userId, achievement.xpReward, 'achievement_unlock');
        }

        logger.info({ userId, achievement: achievement.name, xp: achievement.xpReward }, 'Achievement unlocked');
      }
    }

    return newlyUnlocked;
  }
}

module.exports = new AchievementService();
