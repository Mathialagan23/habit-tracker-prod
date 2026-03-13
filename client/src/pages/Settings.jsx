import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Camera, Upload, User, Mail, Link, Lock, Trash2 } from 'lucide-react';

function isValidImageUrl(url) {
  if (!url) return true;
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
}

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [avatarError, setAvatarError] = useState(false);
  const [avatarValidation, setAvatarValidation] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || 'User')}`;
  const displayAvatar = (!profile.avatar || avatarError) ? generatedAvatar : profile.avatar;

  const handleAvatarUrlChange = (e) => {
    const url = e.target.value;
    setProfile({ ...profile, avatar: url });
    setAvatarError(false);
    if (url && !isValidImageUrl(url)) {
      setAvatarValidation('Please enter a valid image URL (.jpg, .png, .webp, .gif)');
    } else {
      setAvatarValidation('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProfile({ ...profile, avatar: preview });
    setAvatarError(false);
    setAvatarValidation('');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (profile.avatar && !isValidImageUrl(profile.avatar)) {
      toast.error('Please enter a valid image URL');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await usersApi.updateProfile(profile);
      useAuthStore.setState({ user: data.data });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
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

      <div className="settings-section">
        <h2>Profile</h2>

        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <img
              className="profile-avatar"
              src={displayAvatar}
              alt="Avatar"
              onError={() => setAvatarError(true)}
            />
            <button
              type="button"
              className="profile-avatar-edit"
              onClick={() => fileInputRef.current?.click()}
              title="Upload avatar"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              hidden
            />
          </div>
          <div className="profile-header-info">
            <span className="profile-header-name">{profile.name || 'Your Name'}</span>
            <span className="profile-header-email">{profile.email || 'your@email.com'}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="settings-form">
          <div className="form-group">
            <label><User size={14} className="form-label-icon" /> Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label><Mail size={14} className="form-label-icon" /> Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label><Link size={14} className="form-label-icon" /> Avatar URL</label>
            <input
              value={profile.avatar}
              onChange={handleAvatarUrlChange}
              placeholder="https://example.com/avatar.jpg"
              maxLength={500}
            />
            {avatarValidation && (
              <span className="form-validation-msg">{avatarValidation}</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> Upload Avatar
          </button>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2><Lock size={16} className="form-label-icon" /> Change Password</h2>
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
