import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import { completeOwnerOnboarding } from '../../services/paymentService';

const PaymentOnboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: '',
    ifscCode: '',
    accountNumber: '',
    confirmAccountNumber: '',
    phoneNumber: ''
  });

  const refId = searchParams.get('ref');
  const userId = searchParams.get('user_id');
  const isUpdate = searchParams.get('update') === 'true';

  useEffect(() => {
    if (!refId || !userId) {
      setError('Invalid onboarding link. Please try again from Payment Settings.');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [refId, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }

    if (!formData.ifscCode || formData.ifscCode.length < 11) {
      setError('Please enter a valid IFSC code');
      return;
    }

    setCompleting(true);
    setError(null);

    try {
      const result = await completeOwnerOnboarding(refId);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/owner/payment-settings');
        }, 3000);
      } else {
        setError(result.message || 'Failed to complete onboarding');
      }
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
      console.error(err);
    } finally {
      setCompleting(false);
    }
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

  if (error && !refId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <FiAlertCircle style={{ width: '32px', height: '32px', color: '#f87171' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Invalid Link</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>{error}</p>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/owner/payment-settings')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Go to Payment Settings
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <FiCheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            {isUpdate ? 'Account Updated!' : 'Setup Complete!'}
          </h2>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            {isUpdate 
              ? 'Your payout account details have been updated successfully.'
              : 'Your payout account has been configured. You\'ll now receive payments directly to your bank account.'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Redirecting to Payment Settings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '32px 16px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
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
            <FiCreditCard style={{ width: '28px', height: '28px', color: '#ffffff', position: 'relative', zIndex: 10 }} />
          </motion.div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isUpdate ? 'Update Payout Account' : 'Setup Payout Account'}
          </h1>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
            {isUpdate 
              ? 'Enter your new bank details to update your payout account'
              : 'Enter your bank details to receive payments directly'}
          </p>
        </motion.div>

        {/* Form Card */}
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
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Account Holder Name */}
              <div>
                <label htmlFor="account-holder-name" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)'
                  }}>
                    <FiUser style={{ fontSize: '10px', color: '#10b981' }} />
                  </div>
                  Account Holder Name
                </label>
                <input
                  id="account-holder-name"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                  placeholder="As per bank records"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label htmlFor="ifsc-code" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  IFSC Code
                </label>
                <input
                  id="ifsc-code"
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  required
                  maxLength={11}
                  autoComplete="off"
                  placeholder="SBIN0001234"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="account-number" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  Account Number
                </label>
                <input
                  id="account-number"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  placeholder="Enter account number"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Confirm Account Number */}
              <div>
                <label htmlFor="confirm-account-number" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  Confirm Account Number
                </label>
                <input
                  id="confirm-account-number"
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  placeholder="Re-enter account number"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone-number" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)'
                  }}>
                    <FiPhone style={{ fontSize: '10px', color: '#c084fc' }} />
                  </div>
                  Phone Number (for OTP verification)
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#f87171' }}>{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={completing}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: completing ? 0.7 : 1
                }}
              >
                {completing ? (
                  <>
                    <FiLoader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  isUpdate ? 'Update Account' : 'Complete Setup'
                )}
              </motion.button>
            </div>
          </form>

          {/* Security Info */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)'
          }}>
            <p style={{ fontSize: '13px', color: '#3b82f6', lineHeight: 1.5 }}>
              <strong>Secure:</strong> Your bank details are encrypted and stored securely with Razorpay. 
              FarmEase never sees or stores your actual bank information.
            </p>
          </div>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
          By continuing, you agree to Razorpay's terms and conditions
        </p>
      </div>
    </div>
  );
};

export default PaymentOnboarding;
