import { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePWAInstall from '../hooks/usePWAInstall';

const DISMISSED_KEY = 'installPromptDismissed';
const DELAY_MS = 45_000; // 45 seconds of engagement

export default function InstallPrompt() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Never show if already installed or previously dismissed
    if (isInstalled) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Wait for the browser to make install available, then start delay
    if (!canInstall) return;

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [canInstall, isInstalled]);

  // Auto-hide if app gets installed while prompt is visible
  useEffect(() => {
    if (isInstalled && visible) {
      setVisible(false);
    }
  }, [isInstalled, visible]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (!accepted) {
      // User declined — treat same as dismiss
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && canInstall && (
        <motion.div
          className="install-prompt"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          <button
            className="install-prompt-close"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
          >
            <X size={14} />
          </button>

          <div className="install-prompt-icon">
            <Smartphone size={22} />
          </div>

          <div className="install-prompt-body">
            <span className="install-prompt-title">Install Habit Tracker</span>
            <span className="install-prompt-desc">
              Add to your home screen for quick access to your habits.
            </span>
          </div>

          <button className="btn btn-gradient btn-sm" onClick={handleInstall}>
            <Download size={14} />
            Install
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
