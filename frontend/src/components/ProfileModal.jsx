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
  Leaf,
  Shield,
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
      success: 'bg-sage-50 border-sage-300 text-sage-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    const icons = {
      success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    };

    return (
      <div className={`flex gap-3 p-4 border-2 rounded-2xl ${styles[type]} mb-4 fade-in`}>
        {icons[type]}
        <div className="text-sm">{children}</div>
      </div>
    );
  };

  const Input = ({ icon: Icon, error, type = 'text', ...props }) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-sage-800 px-1">
        {props.label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
        )}
        <input
          {...props}
          type={type}
          className={`w-full ${
            Icon ? 'pl-12' : 'pl-4'
          } pr-4 py-3.5 bg-warm-white border-2 rounded-2xl focus:ring-2 focus:ring-sage-300 focus:border-sage-500 outline-none ${
            error ? 'border-red-300' : 'border-sage-200'
          } placeholder:text-sage-300`}
        />
      </div>
      {error && <p className="text-sm text-red-600 px-1">{error}</p>}
    </div>
  );

  const PasswordInput = ({ icon: Icon, error, showPassword, toggleShow, ...props }) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-sage-800 px-1">
        {props.label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
        )}
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`w-full ${
            Icon ? 'pl-12' : 'pl-4'
          } pr-12 py-3.5 bg-warm-white border-2 rounded-2xl focus:ring-2 focus:ring-sage-300 focus:border-sage-500 outline-none ${
            error ? 'border-red-300' : 'border-sage-200'
          } placeholder:text-sage-300`}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 px-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-sage-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-warm-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-sage-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-sage-600 to-sage-700 text-white p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-10">
            <Leaf className="w-20 h-20 transform rotate-12" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <Leaf className="w-16 h-16 transform -rotate-45" />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {user.username}
                </h2>
                <p className="text-sage-100 text-sm">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2.5 rounded-2xl transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-sage-100 bg-sage-50/30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'text-sage-700 border-b-2 border-sage-600 bg-warm-white'
                  : 'text-sage-500 hover:text-sage-700 hover:bg-sage-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                Profile Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'password'
                  ? 'text-sage-700 border-b-2 border-sage-600 bg-warm-white'
                  : 'text-sage-500 hover:text-sage-700 hover:bg-sage-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {message && <Alert type={message.type}>{message.text}</Alert>}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 fade-in">
              <div className="bg-sage-50 border-2 border-sage-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="bg-sage-100 p-3 rounded-2xl">
                  <Calendar className="w-6 h-6 text-sage-700" />
                </div>
                <div>
                  <p className="text-sm text-sage-600 font-medium">Member since</p>
                  <p className="font-semibold text-sage-800" style={{ fontFamily: 'Crimson Pro, serif' }}>
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
                className="w-full bg-sage-600 hover:bg-sage-700 disabled:bg-sage-300 text-white font-semibold px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
            <div className="space-y-6 fade-in">
              <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-sky-100 p-2 rounded-xl flex-shrink-0">
                  <Shield className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sky-800 mb-1">
                    Security Note
                  </p>
                  <p className="text-sm text-sky-700">
                    Choose a strong password with at least 6 characters to keep your account secure.
                  </p>
                </div>
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
                className="w-full bg-sage-600 hover:bg-sage-700 disabled:bg-sage-300 text-white font-semibold px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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