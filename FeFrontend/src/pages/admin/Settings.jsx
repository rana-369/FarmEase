import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiShield, FiGlobe, FiBell, FiSave, FiRefreshCw, FiDatabase, FiUser } from 'react-icons/fi';
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
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'account', label: 'Account', icon: FiUser },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>System Settings</h1>
          <p className="text-lg" style={{ color: '#a1a1a1' }}>Configure global platform parameters and security policies</p>
        </motion.div>

        <div className="flex gap-4 border-b pb-1" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all relative ${
                activeTab === tab.id ? '' : 'hover:text-white'
              }`}
              style={{ color: activeTab === tab.id ? '#22c55e' : '#666666' }}
            >
              <tab.icon className="text-xl" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: '#22c55e' }}
                />
              )}
            </button>
          ))}
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="siteName" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Platform Name</label>
                <input
                  id="siteName"
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="supportEmail" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Support Email</label>
                <input
                  id="supportEmail"
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                  className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="platformFee" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Platform Fee (%)</label>
                <input
                  id="platformFee"
                  type="number"
                  value={settings.general.platformFee}
                  onChange={(e) => handleChange('general', 'platformFee', parseInt(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                />
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <p className="font-bold" style={{ color: '#ffffff' }}>Maintenance Mode</p>
                  <p className="text-sm" style={{ color: '#666666' }}>Disable platform for users</p>
                </div>
                <button
                  onClick={() => handleChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                  className="w-14 h-7 rounded-full transition-all relative"
                  style={{ backgroundColor: settings.general.maintenanceMode ? '#ef4444' : '#333333' }}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                    settings.general.maintenanceMode ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="sessionTimeout" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Session Timeout (minutes)</label>
                <input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="minPasswordLength" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Min Password Length</label>
                <input
                  id="minPasswordLength"
                  type="number"
                  value={settings.security.minPasswordLength}
                  onChange={(e) => handleChange('security', 'minPasswordLength', parseInt(e.target.value))}
                  className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Two-Factor Authentication</h3>
                <p className="text-sm mb-6" style={{ color: '#666666' }}>
                  Add an extra layer of security to your admin account by enabling two-factor authentication.
                </p>
                <TwoFactorSetup 
                  currentSettings={twoFASettings}
                  onUpdate={handle2FAUpdate}
                />
              </div>
            </div>
          )}

          {activeTab !== 'account' && (
            <div className="mt-12 pt-8 border-t flex justify-end gap-5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button 
                className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#a1a1a1' }}
              >
                <FiRefreshCw className={saving ? 'animate-spin' : ''} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"
                style={{ backgroundColor: '#22c55e', color: '#000000' }}
              >
                {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
