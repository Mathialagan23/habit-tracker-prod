import { motion } from 'framer-motion';
import { Heart, Zap, BookOpen, Brain, ArrowRight } from 'lucide-react';

const GOALS = [
  { id: 'health', label: 'Health', desc: 'Exercise, diet, sleep', icon: Heart, color: '#10b981' },
  { id: 'productivity', label: 'Productivity', desc: 'Focus, routines, work', icon: Zap, color: '#f59e0b' },
  { id: 'learning', label: 'Learning', desc: 'Reading, skills, growth', icon: BookOpen, color: '#3b82f6' },
  { id: 'mindfulness', label: 'Mindfulness', desc: 'Meditation, journaling', icon: Brain, color: '#8b5cf6' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
};

export default function GoalSelectionStep({ selected, onToggle, onNext, onBack }) {
  return (
    <motion.div
      className="onboarding-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>What are your goals?</h2>
      <p className="onboarding-subtitle">Select the areas you want to focus on. This helps us suggest habits.</p>
      <div className="goal-grid">
        {GOALS.map(({ id, label, desc, icon: Icon, color }, i) => (
          <motion.button
            key={id}
            type="button"
            className={`goal-card ${selected.includes(id) ? 'active' : ''}`}
            onClick={() => onToggle(id)}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="goal-card-icon" style={{ background: `${color}18` }}>
              <Icon size={24} style={{ color }} />
            </div>
            <span className="goal-card-label">{label}</span>
            <span className="goal-card-desc">{desc}</span>
          </motion.button>
        ))}
      </div>
      <div className="onboarding-actions">
        <button className="btn btn-back" onClick={onBack}>Back</button>
        <div className="onboarding-actions-right">
          <button className="btn btn-gradient onboarding-btn" onClick={onNext}>
            {selected.length === 0 ? 'Skip' : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
