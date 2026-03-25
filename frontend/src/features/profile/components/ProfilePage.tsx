import { useEffect, useRef, useState } from 'react';
import { Camera, Lock, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { useAuthStore } from '@/store/auth.store';
import { useGetProfile, useUpdateProfile, useChangePassword, useUploadAvatar } from '../hooks';

const getInitials = (name: string): string =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const PASSWORD_REGEX = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const ProfilePage = () => {
  const { updateUser } = useAuthStore();
  const { profileQuery } = useGetProfile();
  const { updateMutation } = useUpdateProfile();
  const { changePasswordMutation } = useChangePassword();
  const { uploadAvatarMutation } = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profileQuery.data) {
      setFullName(profileQuery.data.fullName || '');
      setBio(profileQuery.data.bio || '');
      setPhone(profileQuery.data.phone || '');
    }
  }, [profileQuery.data]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { fullName, bio, phone },
      {
        onSuccess: () => {
          updateUser({ fullName });
        },
      },
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning('All fields are required', { toastId: 'password-validation' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Passwords do not match', { toastId: 'password-match' });
      return;
    }
    if (newPassword.length < 6 || !PASSWORD_REGEX.test(newPassword)) {
      toast.warning(
        'Password must be at least 6 characters with one uppercase, one lowercase, and one number',
        { toastId: 'password-strength' },
      );
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatarMutation.mutate(file, {
      onSuccess: (data) => {
        updateUser({ avatar: data.avatar });
      },
    });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">My Profile</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your personal information and password
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Personal Information</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold border-2 border-border">
                  {profile?.fullName ? getInitials(profile.fullName) : '?'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadAvatarMutation.isPending ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium">{profile?.fullName}</p>
              <p className="text-text-muted text-sm">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input-field opacity-60 cursor-not-allowed"
                  value={profile?.email || ''}
                  disabled
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-text-muted text-xs mt-1 text-right">{bio.length}/500</p>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary flex items-center gap-2 mt-6"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card h-fit">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-text-muted text-xs mt-1">
                  At least 6 characters, one uppercase, one lowercase, and one number
                </p>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary flex items-center gap-2 mt-6"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
