import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Flame, PlusCircle, Settings, User } from 'lucide-react';

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink to="/" end className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/streaks" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <Flame size={20} />
        <span>Streaks</span>
      </NavLink>
      <NavLink to="/habits/new" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <PlusCircle size={20} />
        <span>New</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
