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
      siteName: 'AgriConnect',
      supportEmail: 'support@agriconnect.com',
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
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe, description: 'Platform configuration' },
    { id: 'security', label: 'Security', icon: FiShield, description: 'Security policies' },
    { id: 'account', label: 'Account', icon: FiUser, description: 'Account settings' },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <FiSettings className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>System Settings</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Configure platform parameters and security policies</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all flex-shrink-0"
              style={{ 
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === tab.id 
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                color: activeTab === tab.id ? '#22c55e' : '#888888'
              }}
            >
              <tab.icon className="text-lg" />
              <div className="text-left">
                <div className="font-semibold text-sm">{tab.label}</div>
                <div className="text-xs opacity-70">{tab.description}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          {activeTab === 'general' && (
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Name */}
                <div className="space-y-2">
                  <label htmlFor="siteName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                    <FiGlobe className="text-green-500" />
                    Platform Name
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>

                {/* Support Email */}
                <div className="space-y-2">
                  <label htmlFor="supportEmail" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                    <FiBell className="text-blue-500" />
                    Support Email
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>

                {/* Platform Fee */}
                <div className="space-y-2">
                  <label htmlFor="platformFee" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                    <FiDatabase className="text-yellow-500" />
                    Platform Fee (%)
                  </label>
                  <input
                    id="platformFee"
                    type="number"
                    value={settings.general.platformFee}
                    onChange={(e) => handleChange('general', 'platformFee', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>

                {/* Maintenance Mode */}
                <div 
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{ 
                    background: settings.general.maintenanceMode 
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: settings.general.maintenanceMode 
                      ? '1px solid rgba(239, 68, 68, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: settings.general.maintenanceMode 
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <FiSettings style={{ color: settings.general.maintenanceMode ? '#ef4444' : '#666666' }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#ffffff' }}>Maintenance Mode</p>
                      <p className="text-xs" style={{ color: '#666666' }}>Disable platform for users</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                    className="w-14 h-7 rounded-full transition-all duration-300 relative"
                    style={{ 
                      background: settings.general.maintenanceMode 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: settings.general.maintenanceMode ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                  >
                    <motion.div
                      animate={{ x: settings.general.maintenanceMode ? 28 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Session Timeout */}
                <div className="space-y-2">
                  <label htmlFor="sessionTimeout" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                    <FiShield className="text-purple-500" />
                    Session Timeout (minutes)
                  </label>
                  <input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>

                {/* Min Password Length */}
                <div className="space-y-2">
                  <label htmlFor="minPasswordLength" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#a1a1a1' }}>
                    <FiShield className="text-orange-500" />
                    Min Password Length
                  </label>
                  <input
                    id="minPasswordLength"
                    type="number"
                    value={settings.security.minPasswordLength}
                    onChange={(e) => handleChange('security', 'minPasswordLength', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-6 lg:p-8">
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-500'
                  }`}
                >
                  <FiCheck />
                  <span className="text-sm font-medium">{message.text}</span>
                </motion.div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <FiShield className="text-lg" style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#ffffff' }}>Two-Factor Authentication</h3>
                    <p className="text-xs" style={{ color: '#666666' }}>Add an extra layer of security</p>
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
              className="px-6 lg:px-8 py-4 flex justify-end gap-3"
              style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#a1a1a1' 
                }}
              >
                <FiRefreshCw className={saving ? 'animate-spin' : ''} />
                <span>Reset</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
