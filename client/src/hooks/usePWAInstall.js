import { useState, useEffect, useCallback } from 'react';

// ── Module-level shared state ──────────────────────────────────────
// The browser fires beforeinstallprompt ONCE early in page load.
// React components (Navbar → InstallPWA) mount much later because
// auth initialization blocks ProtectedRoute.
//
// Solution: two layers of capture.
//
// 1. main.jsx registers a global listener before createRoot() and
//    stores the event on window.__pwaInstallEvent.
//
// 2. This module also registers a listener at evaluation time as a
//    backup (covers the case where this module loads before main.jsx
//    in a different bundling scenario).
//
// When any hook instance mounts, it reads whichever captured event
// exists and syncs React state.

let deferredPrompt = null;
let installed = typeof window !== 'undefined'
  ? localStorage.getItem('pwaInstalled') === '1'
  : false;
let subscribers = new Set();

function notify() {
  subscribers.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  // Module-level listener — runs when the JS bundle evaluates
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Also keep the global in sync
    window.__pwaInstallEvent = e;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__pwaInstallEvent = null;
    installed = true;
    localStorage.setItem('pwaInstalled', '1');
    notify();
  });
}

// ── Hook ───────────────────────────────────────────────────────────
export default function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(() => {
    // On first render, check if an event was already captured
    if (deferredPrompt) return true;
    if (typeof window !== 'undefined' && window.__pwaInstallEvent) {
      deferredPrompt = window.__pwaInstallEvent;
      return true;
    }
    return false;
  });

  const [isInstalled, setIsInstalled] = useState(() => installed);

  useEffect(() => {
    // Pick up any prompt captured before this component mounted
    if (!deferredPrompt && window.__pwaInstallEvent) {
      deferredPrompt = window.__pwaInstallEvent;
    }

    const sync = () => {
      setCanInstall(!!deferredPrompt);
      setIsInstalled(installed);
    };

    // Run initial sync in case state changed between render and effect
    sync();

    subscribers.add(sync);
    return () => { subscribers.delete(sync); };
  }, []);

  const install = useCallback(async () => {
    const prompt = deferredPrompt;
    if (!prompt) return false;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;

    // Prompt is single-use
    deferredPrompt = null;
    window.__pwaInstallEvent = null;

    if (outcome === 'accepted') {
      installed = true;
      localStorage.setItem('pwaInstalled', '1');
    }

    notify();
    return outcome === 'accepted';
  }, []);

  return { canInstall: canInstall && !isInstalled, isInstalled, install };
}
