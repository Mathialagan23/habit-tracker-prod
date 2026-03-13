import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePWAInstall from '../hooks/usePWAInstall';

export default function InstallPWA() {
  const { canInstall, install } = usePWAInstall();

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.button
          className="btn btn-primary btn-sm install-navbar-btn"
          onClick={install}
          title="Install Habit Tracker"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2 }}
        >
          <Download size={14} />
          <span className="install-navbar-label">Install App</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
