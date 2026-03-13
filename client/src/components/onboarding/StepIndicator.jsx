import { motion } from 'framer-motion';

const STEPS = ['Welcome', 'Goals', 'First Habit'];

export default function StepIndicator({ current, total = 3 }) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="step-indicator">
      <div className="step-indicator-bar">
        <motion.div
          className="step-indicator-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
      <div className="step-indicator-labels">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`step-indicator-item ${i <= current ? 'active' : ''} ${i === current ? 'current' : ''}`}
          >
            <div className="step-indicator-dot">
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="step-indicator-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
