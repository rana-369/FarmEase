import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiRefreshCw, FiGrid, FiCheck, FiEdit2, FiX, FiStar, FiMessageSquare } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TwoFactorSetup from '../../components/TwoFactorSetup';
import SubmitTestimonial from '../../components/SubmitTestimonial';

const FarmerProfile = () => {
  const { get2FASettings, update2FASettings } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    farmSize: '',
    profileImageUrl: ''
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [twoFASettings, setTwoFASettings] = useState({ enabled: false, method: 'email' });
  const [showTestimonial, setShowTestimonial] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetch2FASettings();
  }, []);

  const fetch2FASettings = async () => {
    const result = await get2FASettings();
    if (result.success && result.settings) {
      setTwoFASettings(result.settings);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const data = response.data || {};
      const profileData = {
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        location: data.location || '',
        farmSize: data.farmSize || '',
        profileImageUrl: data.profileImageUrl || ''
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfile(prev => ({
        ...prev,
        profileImageUrl: response.data.profileImageUrl || response.data.url
      }));
      setMessage({ type: 'success', text: 'Profile image updated!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.put('/profile', profile);
      setOriginalProfile(profile);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handle2FAUpdate = async (settings) => {
    const result = await update2FASettings(settings);
    if (result.success) {
      setTwoFASettings(settings);
      setMessage({ type: 'success', text: `Two-factor authentication ${settings.enabled ? 'enabled' : 'disabled'} successfully!` });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update 2FA settings' });
    }
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiUser className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Manage your personal information and farm details</p>
            </div>
          </div>
          
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                color: '#ffffff'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiEdit2 className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Edit Profile</span>
            </motion.button>
          )}
        </motion.div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl flex items-center gap-3"
            style={{ 
              background: message.type === 'success' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: message.type === 'success' 
                ? '1px solid rgba(16, 185, 129, 0.25)'
                : '1px solid rgba(239, 68, 68, 0.25)',
              color: message.type === 'success' ? '#10b981' : '#f87171'
            }}
          >
            {message.type === 'success' ? <FiCheck /> : <FiX />}
            <span className="text-sm font-semibold">{message.text}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div 
              className="p-6 rounded-3xl text-center relative overflow-hidden"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)' }} />
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div 
                  className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center mx-auto relative"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {profile.profileImageUrl ? (
                    <img 
                      src={profile.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <FiUser className="text-5xl" style={{ color: '#10b981' }} />
                  )}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleImageClick}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                    opacity: uploading ? 0.7 : 1
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  {uploading ? (
                    <FiRefreshCw className="text-white text-sm animate-spin relative z-10" />
                  ) : (
                    <FiCamera className="text-white text-sm relative z-10" />
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  id="profile-image"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <h3 className="text-lg font-bold mb-1 relative" style={{ color: 'var(--text-primary)' }}>
                {profile.fullName || 'User Name'}
              </h3>
              <span 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold relative"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <FiCheck className="text-xs" />
                Farmer
              </span>

              {/* Quick Stats */}
              <div className="mt-6 pt-4 relative" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className="p-4 rounded-2xl"
                    style={{ 
                      background: 'var(--bg-button)',
                      border: '1px solid var(--border-tertiary)'
                    }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Farm Size</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {profile.farmSize || '0'} Acres
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-2xl"
                    style={{ 
                      background: 'var(--bg-button)',
                      border: '1px solid var(--border-tertiary)'
                    }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Location</p>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {profile.location || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div 
              className="rounded-3xl overflow-hidden relative"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)' }} />
              <form onSubmit={handleSave} className="p-6 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <FiUser style={{ color: '#10b981' }} />
                      Full Name
                    </label>
                    <input 
                      id="fullName"
                      name="fullName" 
                      value={profile.fullName} 
                      onChange={handleChange}
                      disabled={!isEditing}
                      autoComplete="name"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 font-medium"
                      style={{ 
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)', 
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <FiMail style={{ color: '#3b82f6' }} />
                      Email Address
                    </label>
                    <input 
                      id="email"
                      name="email"
                      disabled 
                      value={profile.email} 
                      autoComplete="email"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none cursor-not-allowed font-medium"
                      style={{ 
                        background: 'var(--bg-button)', 
                        border: '1px solid var(--border-tertiary)', 
                        color: 'var(--text-muted)'
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <FiPhone style={{ color: '#a855f7' }} />
                      Phone Number
                    </label>
                    <input 
                      id="phoneNumber"
                      name="phoneNumber" 
                      value={profile.phoneNumber} 
                      onChange={handleChange}
                      disabled={!isEditing}
                      autoComplete="tel"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 font-medium"
                      style={{ 
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)', 
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <FiMapPin style={{ color: '#ef4444' }} />
                      Location
                    </label>
                    <input 
                      id="location"
                      name="location" 
                      value={profile.location} 
                      onChange={handleChange}
                      disabled={!isEditing}
                      autoComplete="address-level2"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 font-medium"
                      style={{ 
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)', 
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>

                  {/* Farm Size */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="farmSize" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <FiGrid style={{ color: '#f59e0b' }} />
                      Farm Size (Acres)
                    </label>
                    <input 
                      id="farmSize"
                      name="farmSize" 
                      value={profile.farmSize} 
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. 50"
                      autoComplete="off"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 font-medium"
                      style={{ 
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)', 
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div 
                    className="flex justify-end gap-3 mt-6 pt-6 relative"
                    style={{ borderTop: '1px solid var(--border-secondary)' }}
                  >
                    <motion.button 
                      type="button"
                      onClick={handleCancel}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                      style={{ 
                        backgroundColor: 'var(--bg-button)', 
                        border: '1px solid var(--border-primary)', 
                        color: 'var(--text-muted)'
                      }}
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </motion.button>
                    <motion.button 
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all relative overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        color: '#ffffff'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      {saving ? <FiRefreshCw className="w-4 h-4 animate-spin relative z-10" /> : <FiSave className="w-4 h-4 relative z-10" />}
                      <span className="relative z-10">{saving ? 'Saving...' : 'Save Changes'}</span>
                    </motion.button>
                  </div>
                )}
              </form>

              {/* 2FA Section */}
              <div 
                className="px-6 pb-6 relative"
                style={{ borderTop: '1px solid var(--border-secondary)' }}
              >
                <div className="pt-6">
                  <TwoFactorSetup
                    currentSettings={twoFASettings}
                    onUpdate={handle2FAUpdate}
                  />
                </div>
              </div>

              {/* Write a Review Section */}
              <div 
                className="px-6 pb-6 relative"
                style={{ borderTop: '1px solid var(--border-secondary)' }}
              >
                <div className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(245, 158, 11, 0.15)' }}
                      >
                        <FiStar className="w-5 h-5" style={{ color: '#f59e0b' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Share Your Experience
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Write a review about FarmEase platform
                        </p>
                      </div>
                    </div>
                    {!showTestimonial && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTestimonial(true)}
                        className="px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                        style={{ 
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: '#fff'
                        }}
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Write a Review
                      </motion.button>
                    )}
                  </div>

                  {showTestimonial && (
                    <SubmitTestimonial 
                      onClose={() => setShowTestimonial(false)}
                      onSubmitSuccess={() => {
                        setShowTestimonial(false);
                        setMessage({ type: 'success', text: 'Thank you for your review!' });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
