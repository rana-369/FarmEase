import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheck, FiX, FiAlertCircle, FiSmartphone, FiMail, FiLock } from 'react-icons/fi';

const TwoFactorSetup = ({ currentSettings, onUpdate, onClose }) => {
  const [method, setMethod] = useState(currentSettings?.method || 'email');
  const [isEnabled, setIsEnabled] = useState(currentSettings?.enabled || false);
  const [showConfirmDisable, setShowConfirmDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    if (currentSettings) {
      console.log('TwoFactorSetup received settings:', currentSettings);
      setIsEnabled(currentSettings.enabled || false);
      setMethod(currentSettings.method || 'email');
    }
  }, [currentSettings]);

  useEffect(() => {
    if (method === 'authenticator' && isEnabled && !currentSettings?.enabled) {
      handleSetupAuthenticator();
    }
  }, [method, isEnabled]);

  const handleSetupAuthenticator = async () => {
    setLoading(true);
    setError('');
    try {
      setShowQRCode(true);
    } catch (err) {
      setError('Failed to setup authenticator. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await onUpdate({ enabled: true, method });
      setIsEnabled(true);
      setSuccess('Two-factor authentication has been enabled successfully!');
      
      if (method === 'authenticator') {
        setShowQRCode(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to enable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await onUpdate({ enabled: false, method: null });
      setIsEnabled(false);
      setShowQRCode(false);
      setBackupCodes([]);
      setShowConfirmDisable(false);
      setSuccess('Two-factor authentication has been disabled.');
    } catch (err) {
      setError(err.message || 'Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = async (newMethod) => {
    if (isEnabled) {
      setError('Please disable 2FA before changing the method.');
      return;
    }
    setMethod(newMethod);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)'
      }}
    >
      {/* Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isEnabled 
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
              : 'var(--bg-button)',
            boxShadow: isEnabled ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none'
          }}>
            <FiShield style={{ fontSize: '18px', color: isEnabled ? '#ffffff' : 'var(--text-muted)' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {isEnabled ? 'Your account is protected' : 'Enable for extra security'}
            </p>
          </div>
        </div>
        
        {isEnabled && (
          <span style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e'
          }}>
            Active
          </span>
        )}
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <FiAlertCircle style={{ color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#f87171' }}>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <FiCheck style={{ color: '#34d399', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#34d399' }}>{success}</span>
        </motion.div>
      )}

      {/* Method Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '12px'
        }}>
          Verification Method
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleMethodChange('email')}
            disabled={isEnabled}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: method === 'email' ? '2px solid #22c55e' : '1px solid var(--border-primary)',
              background: method === 'email' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-button)',
              cursor: isEnabled ? 'not-allowed' : 'pointer',
              opacity: isEnabled && method !== 'email' ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              background: method === 'email' ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-input)'
            }}>
              <FiMail style={{ fontSize: '16px', color: method === 'email' ? '#22c55e' : 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: method === 'email' ? '#22c55e' : 'var(--text-primary)', margin: 0 }}>
              Email OTP
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Receive code via email
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleMethodChange('authenticator')}
            disabled={isEnabled}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: method === 'authenticator' ? '2px solid #3b82f6' : '1px solid var(--border-primary)',
              background: method === 'authenticator' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-button)',
              cursor: isEnabled ? 'not-allowed' : 'pointer',
              opacity: isEnabled && method !== 'authenticator' ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              background: method === 'authenticator' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-input)'
            }}>
              <FiSmartphone style={{ fontSize: '16px', color: method === 'authenticator' ? '#3b82f6' : 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: method === 'authenticator' ? '#3b82f6' : 'var(--text-primary)', margin: 0 }}>
              Authenticator App
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Google/Microsoft Auth
            </p>
          </motion.button>
        </div>
      </div>

      {/* QR Code Display */}
      {showQRCode && qrCodeUrl && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          background: 'var(--bg-button)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Scan this QR code with your authenticator app
          </p>
          <img src={qrCodeUrl} alt="2FA QR Code" style={{ margin: '0 auto 12px', display: 'block' }} />
          {backupCodes.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Save these backup codes:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#22c55e' }}>
                {backupCodes.map((code, i) => (
                  <span key={i}>{code}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(34, 197, 94, 0.05)',
        border: '1px solid rgba(34, 197, 94, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <FiLock style={{ fontSize: '16px', color: '#22c55e', marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Enhanced Security
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: '1.5' }}>
              Two-factor authentication adds an extra layer of security. Even if someone knows your password, they won't be able to access your account.
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Disable Dialog */}
      {showConfirmDisable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDisable}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                background: '#ef4444',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Disabling...' : 'Yes, Disable 2FA'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConfirmDisable(false)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-button)',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!showConfirmDisable && (
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEnabled ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConfirmDisable(true)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                cursor: 'pointer'
              }}
            >
              <FiX />
              Disable 2FA
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnable}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Enabling...
                </>
              ) : (
                <>
                  <FiCheck />
                  Enable 2FA
                </>
              )}
            </motion.button>
          )}
          
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-button)',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Close
            </motion.button>
          )}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default TwoFactorSetup;
