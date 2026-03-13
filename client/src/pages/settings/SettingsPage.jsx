import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../api';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';
import { Bell, Volume2, Mail, Moon, Calendar, Lock, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const dark = useThemeStore((s) => s.dark);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const [prefs, setPrefs] = useState({
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    reminderSounds: user?.preferences?.reminderSounds ?? false,
    emailDigest: user?.preferences?.emailDigest ?? false,
    weekStartsMonday: user?.preferences?.weekStartsMonday ?? false,
  });
  const [savingPref, setSavingPref] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleToggle = async (key) => {
    const newValue = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    setSavingPref(key);
    try {
      const { data } = await usersApi.updatePreferences({ [key]: newValue });
      useAuthStore.setState({ user: data.data });
    } catch (err) {
      setPrefs((prev) => ({ ...prev, [key]: !newValue }));
      toast.error('Failed to update preference');
    } finally {
      setSavingPref(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await usersApi.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? All data will be permanently removed.')) return;
    try {
      await usersApi.deleteAccount();
      await logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="page">
      <h1>Settings</h1>

      {/* Notifications */}
      <div className="settings-section">
        <h2><Bell size={16} className="form-label-icon" /> Notifications</h2>
        <div className="settings-toggle-list">
          <ToggleRow
            icon={<Bell size={15} />}
            label="Push Notifications"
            description="Receive browser reminders for habits"
            checked={prefs.pushNotifications}
            loading={savingPref === 'pushNotifications'}
            onToggle={() => handleToggle('pushNotifications')}
          />
          <ToggleRow
            icon={<Volume2 size={15} />}
            label="Reminder Sounds"
            description="Play a sound with habit reminders"
            checked={prefs.reminderSounds}
            loading={savingPref === 'reminderSounds'}
            onToggle={() => handleToggle('reminderSounds')}
          />
          <ToggleRow
            icon={<Mail size={15} />}
            label="Weekly Email Summary"
            description="Receive a weekly progress report via email"
            checked={prefs.emailDigest}
            loading={savingPref === 'emailDigest'}
            onToggle={() => handleToggle('emailDigest')}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-toggle-list">
          <ToggleRow
            icon={<Moon size={15} />}
            label="Dark Mode"
            description="Use dark theme across the app"
            checked={dark}
            onToggle={toggleTheme}
          />
          <ToggleRow
            icon={<Calendar size={15} />}
            label="Week Starts Monday"
            description="Set Monday as the first day of the week"
            checked={prefs.weekStartsMonday}
            loading={savingPref === 'weekStartsMonday'}
            onToggle={() => handleToggle('weekStartsMonday')}
          />
        </div>
      </div>

      {/* Security */}
      <div className="settings-section">
        <h2><Lock size={16} className="form-label-icon" /> Security</h2>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="settings-section settings-danger">
        <h2><Trash2 size={16} className="form-label-icon" /> Danger Zone</h2>
        <p className="text-muted">Permanently delete your account and all associated data.</p>
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, description, checked, loading, onToggle }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-info">
        <span className="settings-toggle-icon">{icon}</span>
        <div>
          <span className="settings-toggle-label">{label}</span>
          <span className="settings-toggle-desc">{description}</span>
        </div>
      </div>
      <button
        type="button"
        className={`toggle-switch ${checked ? 'toggle-on' : ''}`}
        onClick={onToggle}
        disabled={loading}
        aria-label={`Toggle ${label}`}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}
