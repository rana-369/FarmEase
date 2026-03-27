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

  // Sync state when currentSettings prop changes (e.g., after API fetch)
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
      className="p-6 rounded-2xl"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: isEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${isEnabled ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'}`
            }}
          >
            <FiShield className="text-xl" style={{ color: isEnabled ? '#22c55e' : '#a1a1a1' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              Two-Factor Authentication
            </h3>
            <p className="text-sm" style={{ color: '#a1a1a1' }}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        
        {isEnabled && (
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)'
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
          className="mb-4 p-3 rounded-lg flex items-center gap-2"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          <FiAlertCircle className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg flex items-center gap-2"
          style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#22c55e'
          }}
        >
          <FiCheck className="flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </motion.div>
      )}

      {/* Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
          Verification Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleMethodChange('email')}
            disabled={isEnabled}
            className={`p-4 rounded-lg transition-all ${method === 'email' ? '' : 'opacity-60'}`}
            style={{
              backgroundColor: method === 'email' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: method === 'email' ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.1)',
              cursor: isEnabled ? 'not-allowed' : 'pointer'
            }}
          >
            <FiMail className="text-2xl mb-2 mx-auto" style={{ color: method === 'email' ? '#22c55e' : '#a1a1a1' }} />
            <p className="text-sm font-medium" style={{ color: method === 'email' ? '#22c55e' : '#a1a1a1' }}>
              Email OTP
            </p>
            <p className="text-xs mt-1" style={{ color: '#a1a1a1' }}>
              Receive code via email
            </p>
          </button>

          <button
            onClick={() => handleMethodChange('authenticator')}
            disabled={isEnabled}
            className={`p-4 rounded-lg transition-all ${method === 'authenticator' ? '' : 'opacity-60'}`}
            style={{
              backgroundColor: method === 'authenticator' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: method === 'authenticator' ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.1)',
              cursor: isEnabled ? 'not-allowed' : 'pointer'
            }}
          >
            <FiSmartphone className="text-2xl mb-2 mx-auto" style={{ color: method === 'authenticator' ? '#22c55e' : '#a1a1a1' }} />
            <p className="text-sm font-medium" style={{ color: method === 'authenticator' ? '#22c55e' : '#a1a1a1' }}>
              Authenticator App
            </p>
            <p className="text-xs mt-1" style={{ color: '#a1a1a1' }}>
              Google/Microsoft Authenticator
            </p>
          </button>
        </div>
      </div>

      {/* QR Code Display (for authenticator setup) */}
      {showQRCode && qrCodeUrl && (
        <div className="mb-6 p-4 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <p className="text-sm mb-3" style={{ color: '#a1a1a1' }}>
            Scan this QR code with your authenticator app
          </p>
          <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-3" />
          {backupCodes.length > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: '#a1a1a1' }}>
                Save these backup codes in a safe place:
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
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
        <div className="flex items-start gap-3">
          <FiLock className="text-lg mt-0.5" style={{ color: '#22c55e' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
              Enhanced Security
            </p>
            <p className="text-xs mt-1" style={{ color: '#a1a1a1' }}>
              Two-factor authentication adds an extra layer of security to your account. 
              Even if someone knows your password, they won't be able to access your account without the verification code.
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Disable Dialog */}
      {showConfirmDisable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-lg"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <p className="text-sm mb-4" style={{ color: '#ffffff' }}>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDisable}
              disabled={loading}
              className="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
              style={{ 
                backgroundColor: '#ef4444',
                color: '#ffffff'
              }}
            >
              {loading ? 'Disabling...' : 'Yes, Disable 2FA'}
            </button>
            <button
              onClick={() => setShowConfirmDisable(false)}
              className="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#a1a1a1',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!showConfirmDisable && (
        <div className="flex gap-3">
          {isEnabled ? (
            <button
              onClick={() => setShowConfirmDisable(true)}
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <FiX />
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#22c55e',
                color: '#ffffff'
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
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#a1a1a1',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              Close
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TwoFactorSetup;
