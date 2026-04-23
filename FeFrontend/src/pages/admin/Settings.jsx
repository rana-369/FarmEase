import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiShield, FiGlobe, FiBell, FiSave, FiRefreshCw, FiDatabase, FiUser, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TwoFactorSetup from '../../components/TwoFactorSetup';

const SettingsPage = () => {
  const { get2FASettings, update2FASettings } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      siteName: 'FarmEase',
      supportEmail: 'support@farmease.com',
      platformFee: 10,
      maintenanceMode: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 60,
      minPasswordLength: 8
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [twoFASettings, setTwoFASettings] = useState({ enabled: false, method: 'email' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
    fetch2FASettings();
  }, []);

  const fetch2FASettings = async () => {
    const result = await get2FASettings();
    if (result.success && result.settings) {
      setTwoFASettings(result.settings);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [generalRes, securityRes] = await Promise.all([
        api.get('/settings/by-category/general'),
        api.get('/settings/by-category/security')
      ]);
      
      setSettings({
        general: { ...settings.general, ...generalRes.data },
        security: { ...settings.security, ...securityRes.data }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post(`/settings/by-category/${activeTab}`, settings[activeTab]);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe, description: 'Platform configuration' },
    { id: 'security', label: 'Security', icon: FiShield, description: 'Security policies' },
    { id: 'account', label: 'Account', icon: FiUser, description: 'Account settings' },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiSettings className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>System Settings</h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Configure platform parameters and security policies</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all flex-shrink-0 relative overflow-hidden group"
              style={{ 
                background: activeTab === tab.id 
                  ? `linear-gradient(135deg, ${tab.id === 'general' ? 'rgba(59, 130, 246, 0.2)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(16, 185, 129, 0.2)'} 0%, ${tab.id === 'general' ? 'rgba(59, 130, 246, 0.05)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.05)' : 'rgba(16, 185, 129, 0.05)'} 100%)`
                  : 'var(--bg-button)',
                border: activeTab === tab.id 
                  ? `1px solid ${tab.id === 'general' ? 'rgba(59, 130, 246, 0.4)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                  : '1px solid var(--border-primary)',
                boxShadow: activeTab === tab.id 
                  ? `0 4px 20px ${tab.id === 'general' ? 'rgba(59, 130, 246, 0.2)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                  : 'none',
                color: activeTab === tab.id 
                  ? (tab.id === 'general' ? '#60a5fa' : tab.id === 'security' ? '#c084fc' : '#34d399') 
                  : 'var(--text-muted)'
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${tab.id === 'general' ? 'rgba(59, 130, 246, 0.15)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)'} 0%, transparent 70%)`
                }}
              />
              <tab.icon className="text-lg relative z-10" />
              <div className="text-left relative z-10">
                <div className="font-bold text-sm">{tab.label}</div>
                <div className="text-xs opacity-60">{tab.description}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden relative"
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)' }} />
          {activeTab === 'general' && (
            <div className="p-6 lg:p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Name */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="siteName" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)' }}
                    >
                      <FiGlobe className="text-xs" style={{ color: '#60a5fa' }} />
                    </div>
                    Platform Name
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    name="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    autoComplete="organization"
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 font-medium focus:ring-2 focus:ring-blue-500/30"
                    style={{ 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </motion.div>

                {/* Support Email */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="supportEmail" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)' }}
                    >
                      <FiBell className="text-xs" style={{ color: '#c084fc' }} />
                    </div>
                    Support Email
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    name="supportEmail"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 font-medium focus:ring-2 focus:ring-purple-500/30"
                    style={{ 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </motion.div>

                {/* Platform Fee */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="platformFee" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)' }}
                    >
                      <FiDatabase className="text-xs" style={{ color: '#fbbf24' }} />
                    </div>
                    Platform Fee (%)
                  </label>
                  <input
                    id="platformFee"
                    type="number"
                    name="platformFee"
                    value={settings.general.platformFee}
                    onChange={(e) => handleChange('general', 'platformFee', parseInt(e.target.value))}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 font-medium focus:ring-2 focus:ring-amber-500/30"
                    style={{ 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </motion.div>

                {/* Maintenance Mode */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group"
                  style={{ 
                    background: settings.general.maintenanceMode 
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
                      : 'var(--bg-button)',
                    border: settings.general.maintenanceMode 
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid var(--border-secondary)'
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.1) 0%, transparent 70%)' }}
                  />
                  <div className="flex items-center gap-3 relative z-10">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ 
                        background: settings.general.maintenanceMode 
                          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                          : 'var(--bg-input)',
                        border: settings.general.maintenanceMode 
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid var(--border-tertiary)'
                      }}
                    >
                      <FiSettings style={{ color: settings.general.maintenanceMode ? '#f87171' : 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Maintenance Mode</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Disable platform for users</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                    className="w-14 h-7 rounded-full transition-all duration-300 relative"
                    style={{ 
                      background: settings.general.maintenanceMode 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'var(--bg-input)',
                      boxShadow: settings.general.maintenanceMode ? '0 4px 16px rgba(239, 68, 68, 0.4)' : 'none'
                    }}
                  >
                    <motion.div
                      animate={{ x: settings.general.maintenanceMode ? 28 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                  </button>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 lg:p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Session Timeout */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="sessionTimeout" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)' }}
                    >
                      <FiShield className="text-xs" style={{ color: '#c084fc' }} />
                    </div>
                    Session Timeout (minutes)
                  </label>
                  <input
                    id="sessionTimeout"
                    type="number"
                    name="sessionTimeout"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 font-medium focus:ring-2 focus:ring-purple-500/30"
                    style={{ 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </motion.div>

                {/* Min Password Length */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="minPasswordLength" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.1) 100%)' }}
                    >
                      <FiShield className="text-xs" style={{ color: '#fb923c' }} />
                    </div>
                    Min Password Length
                  </label>
                  <input
                    id="minPasswordLength"
                    type="number"
                    name="minPasswordLength"
                    value={settings.security.minPasswordLength}
                    onChange={(e) => handleChange('security', 'minPasswordLength', parseInt(e.target.value))}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-300 font-medium focus:ring-2 focus:ring-orange-500/30"
                    style={{ 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-6 lg:p-8 relative">
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  <FiCheck />
                  <span className="text-sm font-semibold">{message.text}</span>
                </motion.div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <FiShield className="text-lg" style={{ color: '#34d399' }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</h3>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security</p>
                  </div>
                </div>
                <TwoFactorSetup 
                  currentSettings={twoFASettings}
                  onUpdate={handle2FAUpdate}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {activeTab !== 'account' && (
            <div 
              className="px-6 lg:px-8 py-5 flex justify-end gap-4 relative"
              style={{ 
                borderTop: '1px solid var(--border-secondary)',
                background: 'var(--bg-button)'
              }}
            >
              <motion.button 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all relative overflow-hidden group"
                style={{ 
                  background: 'var(--bg-button)', 
                  border: '1px solid var(--border-primary)', 
                  color: 'var(--text-muted)'
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)' }}
                />
                <FiRefreshCw className={`relative z-10 ${saving ? 'animate-spin' : ''}`} />
                <span className="relative z-10">Reset</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                {saving ? <FiRefreshCw className="animate-spin relative z-10" /> : <FiSave className="relative z-10" />}
                <span className="relative z-10">{saving ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
