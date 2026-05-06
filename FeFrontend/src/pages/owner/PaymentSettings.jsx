import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiExternalLink,
  FiShield,
  FiEdit,
  FiMail,
  FiDollarSign
} from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import {
  getOwnerPaymentSettings,
  initiateOwnerOnboarding,
  completeOwnerOnboarding
} from '../../services/paymentService';
import api from '../../services/api';

const PaymentSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getOwnerPaymentSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load payment settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setOnboardingLoading(true);
      setError(null);
      
      console.log('Starting onboarding...');
      const result = await initiateOwnerOnboarding();
      console.log('Onboarding result:', result);
      
      if (result.success) {
        if (result.data?.onboardingUrl) {
          console.log('Navigating to:', result.data.onboardingUrl);
          const url = new URL(result.data.onboardingUrl);
          const path = url.pathname + url.search;
          console.log('Path:', path);
          navigate(path);
        } else if (result.data?.accountId) {
          setSuccess(result.message);
          fetchSettings();
        }
      } else {
        console.error('Onboarding failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to initiate onboarding: ' + (err.message || 'Unknown error'));
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleSendUpdateOtp = async () => {
    try {
      setSendingOtp(true);
      setError(null);
      
      const { data } = await api.post('/auth/send-otp', { purpose: 'payment_update' });
      
      if (data.success) {
        setShowVerifyModal(true);
        setSuccess(`OTP sent to your email. Please verify to update payment details.`);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send verification OTP');
      console.error(err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setVerifyingOtp(true);
      setError(null);
      
      const { data } = await api.post('/auth/verify-otp', { 
        otp: verifyOtp, 
        purpose: 'payment_update' 
      });
      
      if (data.success) {
        setShowVerifyModal(false);
        setVerifyOtp('');
        setSuccess('Identity verified! Redirecting to update form...');
        setTimeout(() => {
          handleStartOnboarding();
        }, 500);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
      console.error(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCompleteOnboarding = async (accountId) => {
    try {
      setOnboardingLoading(true);
      const result = await completeOwnerOnboarding(accountId);
      
      if (result.success) {
        setSuccess(result.message);
        fetchSettings();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to complete onboarding');
      console.error(err);
    } finally {
      setOnboardingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
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

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
            }} />
            <FiDollarSign style={{ fontSize: '24px', color: '#ffffff', position: 'relative', zIndex: 10 }} />
          </motion.div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)'
            }}>Payment Settings</h1>
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>Set up your payout account to receive payments directly</p>
          </div>
        </motion.div>

        {/* Status Banner */}
        {settings?.canReceivePayments ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(16, 185, 129, 0.2)'
              }}>
                <FiCheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: '#10b981', marginBottom: '4px' }}>Payment Account Active</h3>
                <p style={{ fontSize: '14px', color: '#10b981', opacity: 0.85 }}>
                  You're all set to receive payments directly to your linked bank account.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(245, 158, 11, 0.2)'
              }}>
                <FiAlertCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}>Payment Setup Required</h3>
                <p style={{ fontSize: '14px', color: '#f59e0b', opacity: 0.85 }}>
                  Complete your payment setup to receive earnings directly to your bank account.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <p style={{ color: '#f87171', fontWeight: 500 }}>{error}</p>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <p style={{ color: '#10b981', fontWeight: 500 }}>{success}</p>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '20px',
            color: 'var(--text-primary)'
          }}>How Direct Payments Work</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {[
              { step: '1', title: 'Farmer Pays', desc: 'When a farmer books your equipment, they pay via Razorpay checkout.' },
              { step: '2', title: 'Automatic Split', desc: 'Payment is automatically split - your share goes to your bank, platform fee stays separate.' },
              { step: '3', title: 'Instant Transfer', desc: 'Your earnings are transferred instantly to your linked bank account.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ display: 'flex', gap: '12px' }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{item.step}</span>
                </div>
                <div>
                  <h3 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)'
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(59, 130, 246, 0.2)',
              flexShrink: 0
            }}>
              <FiShield style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, color: '#3b82f6', marginBottom: '4px' }}>Secure & Private</h3>
              <p style={{ fontSize: '14px', color: '#3b82f6', opacity: 0.85, lineHeight: 1.5 }}>
                Your bank details are stored securely with Razorpay - we never see or store your actual 
                account information. Only Razorpay handles your financial data with bank-grade security.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <FiCreditCard style={{ width: '24px', height: '24px', color: '#10b981' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Payout Account</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {settings?.canReceivePayments 
                    ? `Active since ${new Date(settings.onboardingCompletedAt).toLocaleDateString()}`
                    : 'Link your bank account to receive payments directly'}
                </p>
                {settings?.accountStatus && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginTop: '8px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: settings.accountStatus === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: settings.accountStatus === 'active' ? '#10b981' : '#f59e0b',
                    border: settings.accountStatus === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {settings.accountStatus.charAt(0).toUpperCase() + settings.accountStatus.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
            {!settings?.canReceivePayments ? (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartOnboarding}
                disabled={onboardingLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: onboardingLoading ? 0.7 : 1
                }}
              >
                {onboardingLoading ? (
                  <>
                    <FiLoader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    Setup Payout Account
                    <FiExternalLink style={{ width: '16px', height: '16px' }} />
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendUpdateOtp}
                disabled={sendingOtp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 500,
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  opacity: sendingOtp ? 0.7 : 1
                }}
              >
                {sendingOtp ? (
                  <>
                    <FiLoader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <FiEdit style={{ width: '16px', height: '16px' }} />
                    Update Account
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* OTP Verification Modal */}
        {showVerifyModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <FiMail style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Verify Your Identity</h3>
                <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                  Enter the OTP sent to your email to update payment details
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  id="verify-otp"
                  name="verifyOtp"
                  type="text"
                  value={verifyOtp}
                  onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  autoComplete="one-time-code"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontSize: '20px',
                    letterSpacing: '0.3em',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '14px', textAlign: 'center', marginBottom: '16px', color: '#f87171' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerifyOtp('');
                    setError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    background: 'var(--bg-button)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || verifyOtp.length !== 6}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: (verifyingOtp || verifyOtp.length !== 6) ? 0.7 : 1
                  }}
                >
                  {verifyingOtp ? (
                    <>
                      <FiLoader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Proceed'
                  )}
                </motion.button>
              </div>

              <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)' }}>
                Didn't receive OTP?{' '}
                <button
                  onClick={handleSendUpdateOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Resend
                </button>
              </p>
            </motion.div>
          </div>
        )}

        {/* Current Status Details */}
        {settings?.isOnboardingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-secondary)' }}>Account Details</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ marginLeft: '8px', fontWeight: 500, color: '#10b981' }}>Verified</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Setup Date:</span>
                <span style={{ marginLeft: '8px', color: 'var(--text-primary)' }}>
                  {new Date(settings.onboardingCompletedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentSettings;
