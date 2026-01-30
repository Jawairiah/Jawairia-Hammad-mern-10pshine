import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

const ProfileModal = ({ user, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user.username || '',
    email: user.email || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clear message after 5 seconds
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileForm.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileForm.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileForm.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    try {
      setLoading(true);
      setMessage(null);
      
      const data = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      onUpdate(data.user);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      setLoading(true);
      setMessage(null);

      await apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const Alert = ({ type, children }) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    const icons = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
    };

    return (
      <div className={`flex gap-3 p-4 border rounded-lg ${styles[type]} mb-4`}>
        {icons[type]}
        <div>{children}</div>
      </div>
    );
  };

  const Input = ({ icon: Icon, error, type = 'text', ...props }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          {...props}
          type={type}
          className={`w-full ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  const PasswordInput = ({ icon: Icon, error, showPassword, toggleShow, ...props }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`w-full ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-blue-100 text-sm">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {message && <Alert type={message.type}>{message.text}</Alert>}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>

              <Input
                icon={User}
                label="Username"
                placeholder="Enter username"
                value={profileForm.username}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: '' });
                }}
                error={errors.username}
              />

              <Input
                icon={Mail}
                label="Email Address"
                type="email"
                placeholder="Enter email"
                value={profileForm.email}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
              />

              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Security Note:</strong> Choose a strong password with at least 6 characters.
                </p>
              </div>

              <PasswordInput
                icon={Lock}
                label="Current Password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                  if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
                }}
                showPassword={showCurrentPassword}
                toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                error={errors.currentPassword}
              />

              <PasswordInput
                icon={Lock}
                label="New Password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                showPassword={showNewPassword}
                toggleShow={() => setShowNewPassword(!showNewPassword)}
                error={errors.newPassword}
              />

              <PasswordInput
                icon={Lock}
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                showPassword={showConfirmPassword}
                toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                error={errors.confirmPassword}
              />

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;