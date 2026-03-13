import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// ── Early PWA install capture ──────────────────────────────────────
// beforeinstallprompt often fires before React mounts (the auth
// check blocks Navbar rendering).  Capture the event on a global so
// usePWAInstall can pick it up whenever it first mounts.
window.__pwaInstallEvent = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaInstallEvent = e;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
