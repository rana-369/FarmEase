import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiRefreshCw, FiBriefcase } from 'react-icons/fi';
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
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Owner Profile</h1>
          <p className="text-lg" style={{ color: '#a1a1a1' }}>Manage your personal details and business identity</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 flex flex-col items-center p-8 rounded-3xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', height: 'fit-content' }}
          >
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500/30 flex items-center justify-center bg-gray-800">
                {profile.profileImageUrl ? (
                  <img 
                    src={profile.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
                <FiUser className="text-6xl text-gray-600" style={{ display: profile.profileImageUrl ? 'none' : 'block' }} />
              </div>
              <button className="absolute bottom-2 right-2 p-3 rounded-full bg-blue-500 text-white hover:scale-110 transition-all shadow-lg">
                <FiCamera className="text-xl" />
              </button>
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">{profile.fullName || 'Fleet Owner'}</h3>
            <p className="text-blue-500 font-medium uppercase tracking-widest text-xs mt-1">Enterprise Owner</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 p-10 rounded-3xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#a1a1a1' }}>Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#22c55e' }} />
                    <input 
                      id="fullName"
                      name="fullName" 
                      value={profile.fullName} 
                      onChange={handleChange} 
                      autoComplete="name"
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all" 
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#a1a1a1' }}>Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#666666' }} />
                    <input 
                      id="email"
                      name="email"
                      disabled 
                      value={profile.email} 
                      autoComplete="email"
                      className="w-full pl-12 pr-4 py-4 rounded-xl outline-none cursor-not-allowed" 
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#666666' }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#a1a1a1' }}>Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#22c55e' }} />
                    <input 
                      id="phoneNumber"
                      name="phoneNumber" 
                      value={profile.phoneNumber} 
                      onChange={handleChange} 
                      autoComplete="tel"
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all" 
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#a1a1a1' }}>Location</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#22c55e' }} />
                    <input 
                      id="location"
                      name="location" 
                      value={profile.location} 
                      onChange={handleChange} 
                      autoComplete="address-level2"
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all" 
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="companyName" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#a1a1a1' }}>Company Name</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#22c55e' }} />
                    <input 
                      id="companyName"
                      name="companyName" 
                      value={profile.companyName} 
                      onChange={handleChange} 
                      placeholder="e.g. Green Acres Rentals"
                      autoComplete="organization"
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all" 
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex justify-end gap-4">
                <button type="button" onClick={fetchProfile} className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all bg-white/5 text-gray-400 hover:text-white border border-white/10">
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Reset
                </button>
                <button type="submit" disabled={saving} className="px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all bg-blue-500 text-white hover:bg-blue-400">
                  {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Two-Factor Authentication Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <TwoFactorSetup
                currentSettings={twoFASettings}
                onUpdate={handle2FAUpdate}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
