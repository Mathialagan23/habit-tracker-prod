import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeStep({ onNext }) {
  return (
    <motion.div
      className="onboarding-step onboarding-welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="onboarding-icon-wrapper"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Sparkles size={40} className="onboarding-icon" />
      </motion.div>
      <h1>Welcome to Habit Tracker</h1>
      <p className="onboarding-subtitle">Build better habits, one day at a time. Let's set up your first habit in under a minute.</p>
      <div className="onboarding-actions">
        <button className="btn btn-gradient onboarding-btn" onClick={onNext}>
          Get Started <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
