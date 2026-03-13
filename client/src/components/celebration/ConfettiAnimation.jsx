import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ConfettiAnimation({ show, onDone }) {
  useEffect(() => {
    if (!show) return;

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'],
    });

    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, 2000);

    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="celebration-toast"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <span className="celebration-emoji">🎉</span>
          <div>
            <strong>Habit completed!</strong>
            <span className="celebration-sub">+1 day added to your streak</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
