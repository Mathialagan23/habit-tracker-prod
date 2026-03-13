import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Flame, LogOut, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import ThemeToggle from './ThemeToggle';
import InstallPWA from './InstallPWA';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function resolveAvatar(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${API_BASE}${avatar}`;
}

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`;
  const resolved = resolveAvatar(user?.avatar);
  const avatarSrc = (!resolved || avatarError) ? generatedAvatar : resolved;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <nav className="navbar">
      <span className="navbar-brand">Habit Tracker</span>
      <div className="navbar-links">
        <NavLink to="/" end>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/streaks">
          <Flame size={16} /> Streaks
        </NavLink>
      </div>
      <div className="navbar-right">
        <InstallPWA />
        <ThemeToggle />
        <div className="navbar-avatar-container" ref={dropdownRef}>
          <button
            className="navbar-avatar-btn"
            onClick={() => setOpen((prev) => !prev)}
            title="Account menu"
          >
            <div className="navbar-avatar-wrapper">
              <img
                className="navbar-avatar"
                src={avatarSrc}
                alt={user?.name || 'User'}
                onError={() => setAvatarError(true)}
              />
              <span className="navbar-avatar-indicator" />
            </div>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                className="avatar-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="avatar-dropdown-header">
                  <img
                    className="avatar-dropdown-img"
                    src={avatarSrc}
                    alt={user?.name || 'User'}
                    onError={(e) => { e.target.src = generatedAvatar; }}
                  />
                  <div className="avatar-dropdown-info">
                    <span className="avatar-dropdown-name">{user?.name}</span>
                    <span className="avatar-dropdown-email">{user?.email}</span>
                  </div>
                </div>

                <div className="avatar-dropdown-divider" />

                <button
                  className="avatar-dropdown-item"
                  onClick={() => { setOpen(false); navigate('/profile'); }}
                >
                  <User size={15} /> Profile
                </button>
                <button
                  className="avatar-dropdown-item"
                  onClick={() => { setOpen(false); navigate('/settings'); }}
                >
                  <Settings size={15} /> Settings
                </button>

                <div className="avatar-dropdown-divider" />

                <button
                  className="avatar-dropdown-item avatar-dropdown-logout"
                  onClick={() => { setOpen(false); logout(); }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
