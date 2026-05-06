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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '56px',
            height: '56px',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: '#10b981',
            borderRadius: '16px',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            animation: 'pulse 2s ease-in-out infinite',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
          }} />
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      backgroundColor: 'var(--bg-primary)'
    }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '600px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>System Settings</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Configure platform parameters and security policies
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: activeTab === tab.id 
                    ? `1px solid ${tab.id === 'general' ? 'rgba(59, 130, 246, 0.5)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`
                    : '1px solid var(--border-primary)',
                  background: activeTab === tab.id 
                    ? `${tab.id === 'general' ? 'rgba(59, 130, 246, 0.15)' : tab.id === 'security' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`
                    : 'var(--bg-button)',
                  color: activeTab === tab.id 
                    ? (tab.id === 'general' ? '#60a5fa' : tab.id === 'security' ? '#c084fc' : '#34d399') 
                    : 'var(--text-muted)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <tab.icon style={{ fontSize: '18px' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{tab.label}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>{tab.description}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Content Card */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
          {activeTab === 'general' && (
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {/* Platform Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="siteName" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)'
                    }}>
                      <FiGlobe style={{ fontSize: '12px', color: '#60a5fa' }} />
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
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                  />
                </motion.div>

                {/* Support Email */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="supportEmail" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)'
                    }}>
                      <FiBell style={{ fontSize: '12px', color: '#c084fc' }} />
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
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                  />
                </motion.div>

                {/* Platform Fee */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="platformFee" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)'
                    }}>
                      <FiDatabase style={{ fontSize: '12px', color: '#fbbf24' }} />
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
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                  />
                </motion.div>

                {/* Maintenance Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: settings.general.maintenanceMode
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
                      : 'var(--bg-button)',
                    border: settings.general.maintenanceMode
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid var(--border-primary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: settings.general.maintenanceMode
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                        : 'var(--bg-button)',
                      border: settings.general.maintenanceMode
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid var(--border-secondary)'
                    }}>
                      <FiSettings style={{ color: settings.general.maintenanceMode ? '#f87171' : 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>Maintenance Mode</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Disable platform for users</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      background: settings.general.maintenanceMode
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'var(--bg-button)',
                      boxShadow: settings.general.maintenanceMode ? '0 4px 16px rgba(239, 68, 68, 0.4)' : 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <motion.div
                      animate={{ x: settings.general.maintenanceMode ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        width: '24px',
                        height: '24px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                    />
                  </button>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {/* Session Timeout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="sessionTimeout" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)'
                    }}>
                      <FiShield style={{ fontSize: '12px', color: '#c084fc' }} />
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
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                  />
                </motion.div>

                {/* Min Password Length */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="minPasswordLength" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.1) 100%)'
                    }}>
                      <FiShield style={{ fontSize: '12px', color: '#fb923c' }} />
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
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                  />
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div style={{ padding: '32px' }}>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: '24px',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: message.type === 'success' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)',
                    border: message.type === 'success' 
                      ? '1px solid rgba(16, 185, 129, 0.2)' 
                      : '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <FiCheck style={{ color: message.type === 'success' ? '#34d399' : '#f87171' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: message.type === 'success' ? '#34d399' : '#f87171' }}>
                    {message.text}
                  </span>
                </motion.div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <FiShield style={{ fontSize: '20px', color: '#34d399' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Two-Factor Authentication</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Add an extra layer of security</p>
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
            <div style={{
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              borderTop: '1px solid var(--border-primary)',
              background: 'var(--bg-card)'
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiRefreshCw style={{ animation: saving ? 'spin 1s linear infinite' : 'none' }} />
                <span>Reset</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                {saving ? <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> : <FiSave />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
          </motion.div>
        </motion.div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
