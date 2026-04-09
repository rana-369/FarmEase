import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCheck, FiX, FiAlertCircle, FiSmartphone, FiMail, FiLock, FiRefreshCw } from 'react-icons/fi';

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
      className="p-5 rounded-2xl"
      style={{ 
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: isEnabled ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'var(--bg-button)',
              boxShadow: isEnabled ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none'
            }}
          >
            <FiShield className="text-lg" style={{ color: isEnabled ? '#ffffff' : 'var(--text-muted)' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Two-Factor Authentication
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        
        {isEnabled && (
          <span 
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e'
            }}
          >
            Active
          </span>
        )}
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl flex items-center gap-2"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <FiAlertCircle className="flex-shrink-0" style={{ color: '#ef4444' }} />
          <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl flex items-center gap-2"
          style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <FiCheck className="flex-shrink-0" style={{ color: '#22c55e' }} />
          <span className="text-sm" style={{ color: '#22c55e' }}>{success}</span>
        </motion.div>
      )}

      {/* Method Selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Verification Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleMethodChange('email')}
            disabled={isEnabled}
            className="p-4 rounded-xl transition-all text-center"
            style={{
              backgroundColor: method === 'email' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-button)',
              border: method === 'email' ? '2px solid #22c55e' : '1px solid var(--border-primary)',
              cursor: isEnabled ? 'not-allowed' : 'pointer',
              opacity: isEnabled && method !== 'email' ? 0.5 : 1
            }}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: method === 'email' ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-button)' }}
            >
              <FiMail className="text-lg" style={{ color: method === 'email' ? '#22c55e' : 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: method === 'email' ? '#22c55e' : 'var(--text-primary)' }}>
              Email OTP
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Receive code via email
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleMethodChange('authenticator')}
            disabled={isEnabled}
            className="p-4 rounded-xl transition-all text-center"
            style={{
              backgroundColor: method === 'authenticator' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-button)',
              border: method === 'authenticator' ? '2px solid #3b82f6' : '1px solid var(--border-primary)',
              cursor: isEnabled ? 'not-allowed' : 'pointer',
              opacity: isEnabled && method !== 'authenticator' ? 0.5 : 1
            }}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: method === 'authenticator' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-button)' }}
            >
              <FiSmartphone className="text-lg" style={{ color: method === 'authenticator' ? '#3b82f6' : 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: method === 'authenticator' ? '#3b82f6' : 'var(--text-primary)' }}>
              Authenticator App
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Google/Microsoft Auth
            </p>
          </motion.button>
        </div>
      </div>

      {/* QR Code Display */}
      {showQRCode && qrCodeUrl && (
        <div className="mb-5 p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-button)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Scan this QR code with your authenticator app
          </p>
          <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-3" />
          {backupCodes.length > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Save these backup codes:
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs font-mono" style={{ color: '#22c55e' }}>
                {backupCodes.map((code, i) => (
                  <span key={i}>{code}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
        <div className="flex items-start gap-3">
          <FiLock className="text-base mt-0.5" style={{ color: '#22c55e' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Enhanced Security
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
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
          className="mb-5 p-4 rounded-xl"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleDisable}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{ 
                backgroundColor: '#ef4444',
                color: '#ffffff'
              }}
            >
              {loading ? 'Disabling...' : 'Yes, Disable 2FA'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowConfirmDisable(false)}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{ 
                backgroundColor: 'var(--bg-button)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-primary)'
              }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!showConfirmDisable && (
        <div className="flex gap-3">
          {isEnabled ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowConfirmDisable(true)}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <FiX />
              Disable 2FA
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-xl font-medium transition-all"
              style={{ 
                backgroundColor: 'var(--bg-button)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-primary)'
              }}
            >
              Close
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TwoFactorSetup;
