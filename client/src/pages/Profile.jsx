import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await authService.updateProfile({ name, phone, avatar });
      updateUser(res.data);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        {/* Profile Card */}
        <div className="col-lg-6">
          <div className="card glass-panel border-secondary p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-50">
              <img
                src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                alt="Profile"
                className="rounded-circle border border-danger p-1"
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
              />
              <div>
                <h4 className="text-white fw-bold mb-0">{user?.name}</h4>
                <p className="text-secondary small mb-1">{user?.email}</p>
                <span className="badge bg-danger text-uppercase" style={{ fontSize: '0.65rem' }}>
                  {user?.role} Account
                </span>
              </div>
            </div>

            <h5 className="text-white fw-bold mb-3">Update Information</h5>
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email (Read Only)</label>
                <input
                  type="email"
                  className="form-control bg-black border-secondary text-secondary"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Phone Number</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Avatar Image URL</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-cinema btn-sm w-100"
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-lg-5">
          <div className="card glass-panel border-secondary p-4 h-100">
            <h5 className="text-white fw-bold mb-2">Change Password</h5>
            <p className="text-secondary small mb-4">Ensure your account remains safe with a strong password.</p>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control bg-dark border-secondary text-white"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control bg-dark border-secondary text-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control bg-dark border-secondary text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-cinema-outline btn-sm w-100"
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
