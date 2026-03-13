import { useState, useRef } from 'react';
import { usersApi } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Camera, Upload, User, Mail, Link } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function isValidImageUrl(url) {
  if (!url) return true;
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [avatarError, setAvatarError] = useState(false);
  const [avatarValidation, setAvatarValidation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || 'User')}`;

  const resolveAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;
    return `${API_BASE}${avatar}`;
  };

  const resolved = resolveAvatarUrl(profile.avatar);
  const displayAvatar = (!resolved || avatarError) ? generatedAvatar : resolved;

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await usersApi.uploadAvatar(formData);
      useAuthStore.setState({ user: data.data });
      setProfile((prev) => ({ ...prev, avatar: data.data.avatar }));
      setAvatarError(false);
      setAvatarValidation('');
      toast.success('Avatar uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (profile.avatar && !isValidImageUrl(profile.avatar) && !profile.avatar.startsWith('/uploads')) {
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

  return (
    <div className="page">
      <h1>Profile</h1>

      <div className="settings-section">
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
              disabled={uploadingAvatar}
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
            disabled={uploadingAvatar}
          >
            <Upload size={14} /> {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
