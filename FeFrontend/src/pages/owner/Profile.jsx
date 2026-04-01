import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiRefreshCw, FiBriefcase, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TwoFactorSetup from '../../components/TwoFactorSetup';

const OwnerProfile = () => {
  const { get2FASettings, update2FASettings } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    companyName: '',
    profileImageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [twoFASettings, setTwoFASettings] = useState({ enabled: false, method: 'email' });

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
      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        location: data.location || '',
        companyName: data.companyName || '',
        profileImageUrl: data.profileImageUrl || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.put('/profile', profile);
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiBriefcase className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Owner Profile</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Manage your personal details and business identity</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div 
              className="p-6 rounded-2xl text-center"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div 
                  className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center mx-auto"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.3)'
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
                    <FiUser className="text-5xl" style={{ color: '#3b82f6' }} />
                  )}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <FiCamera className="text-white text-sm" />
                </motion.button>
              </div>

              {/* User Info */}
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>
                {profile.fullName || 'Fleet Owner'}
              </h3>
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}
              >
                <FiCheck className="text-xs" />
                Enterprise Owner
              </span>

              {/* Quick Stats */}
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>Company</p>
                    <p className="text-sm font-semibold truncate" style={{ color: '#ffffff' }}>
                      {profile.companyName || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>Location</p>
                    <p className="text-sm font-semibold truncate" style={{ color: '#ffffff' }}>
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
              className="rounded-2xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mx-6 mt-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-500'
                  }`}
                >
                  <FiCheck />
                  <span className="text-sm font-medium">{message.text}</span>
                </motion.div>
              )}

              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                      <FiUser className="text-blue-500" />
                      Full Name
                    </label>
                    <input 
                      id="fullName"
                      name="fullName" 
                      value={profile.fullName} 
                      onChange={handleChange} 
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                      <FiMail className="text-purple-500" />
                      Email Address
                    </label>
                    <input 
                      id="email"
                      name="email"
                      disabled 
                      value={profile.email} 
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl outline-none cursor-not-allowed"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                        color: '#666666'
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                      <FiPhone className="text-green-500" />
                      Phone Number
                    </label>
                    <input 
                      id="phoneNumber"
                      name="phoneNumber" 
                      value={profile.phoneNumber} 
                      onChange={handleChange} 
                      autoComplete="tel"
                      className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                      <FiMapPin className="text-red-500" />
                      Location
                    </label>
                    <input 
                      id="location"
                      name="location" 
                      value={profile.location} 
                      onChange={handleChange} 
                      autoComplete="address-level2"
                      className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                      <FiBriefcase className="text-yellow-500" />
                      Company Name
                    </label>
                    <input 
                      id="companyName"
                      name="companyName" 
                      value={profile.companyName} 
                      onChange={handleChange} 
                      placeholder="e.g. Green Acres Rentals"
                      autoComplete="organization"
                      className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div 
                  className="flex justify-end gap-3 mt-6 pt-6"
                  style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
                >
                  <motion.button 
                    type="button"
                    onClick={fetchProfile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      color: '#a1a1a1'
                    }}
                  >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    <span>Reset</span>
                  </motion.button>
                  <motion.button 
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </motion.button>
                </div>
              </form>

              {/* 2FA Section */}
              <div 
                className="px-6 pb-6"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <div className="pt-6">
                  <TwoFactorSetup
                    currentSettings={twoFASettings}
                    onUpdate={handle2FAUpdate}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
