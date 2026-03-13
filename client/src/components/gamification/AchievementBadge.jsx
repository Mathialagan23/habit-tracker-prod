import { motion } from 'framer-motion';
import { Star, Target, Flame, Award, Trophy } from 'lucide-react';

const ICON_MAP = {
  star: Star,
  target: Target,
  flame: Flame,
  award: Award,
  trophy: Trophy,
};

export default function AchievementBadge({ achievement, unlocked }) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;

  return (
    <motion.div
      className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}
      whileHover={unlocked ? { scale: 1.05 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="achievement-badge-icon">
        <Icon size={20} />
      </div>
      <div className="achievement-badge-info">
        <span className="achievement-badge-name">{achievement.name}</span>
        <span className="achievement-badge-desc">{achievement.description}</span>
      </div>
      {achievement.xpReward > 0 && unlocked && (
        <span className="achievement-badge-xp">+{achievement.xpReward} XP</span>
      )}
    </motion.div>
  );
}
