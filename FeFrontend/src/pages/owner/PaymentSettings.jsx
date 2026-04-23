import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiExternalLink,
  FiShield,
  FiEdit,
  FiMail
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
  
  // Update verification state
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
          // Extract the path from the full URL and navigate within the app
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

  // Send OTP for verification before update
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

  // Verify OTP and proceed to update
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
        // Proceed to update after verification
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
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 animate-spin" style={{ color: 'var(--success-color, #10b981)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <RupeeIcon className="w-7 h-7" style={{ color: 'var(--success-color, #10b981)' }} />
          Payment Settings
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Set up your payout account to receive payments directly when farmers book your equipment.
        </p>
      </div>

      {/* Status Banner */}
      {settings?.canReceivePayments ? (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-6 h-6" style={{ color: 'var(--success-color, #10b981)' }} />
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--success-color, #10b981)' }}>Payment Account Active</h3>
              <p className="text-sm" style={{ color: 'var(--success-color, #10b981)', opacity: 0.8 }}>
                You're all set to receive payments directly to your linked bank account.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6" style={{ color: 'var(--warning-color, #f59e0b)' }} />
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--warning-color, #f59e0b)' }}>Payment Setup Required</h3>
              <p className="text-sm" style={{ color: 'var(--warning-color, #f59e0b)', opacity: 0.8 }}>
                Complete your payment setup to receive earnings directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p style={{ color: 'var(--error-color, #ef4444)' }}>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <p style={{ color: 'var(--success-color, #10b981)' }}>{success}</p>
        </div>
      )}

      {/* How It Works */}
      <div className="table-container-new p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>How Direct Payments Work</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <span className="font-bold" style={{ color: 'var(--success-color, #10b981)' }}>1</span>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Farmer Pays</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                When a farmer books your equipment, they pay via Razorpay checkout.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <span className="font-bold" style={{ color: 'var(--success-color, #10b981)' }}>2</span>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Automatic Split</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Payment is automatically split - your share goes to your bank, platform fee stays separate.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <span className="font-bold" style={{ color: 'var(--success-color, #10b981)' }}>3</span>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Instant Transfer</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your earnings are transferred instantly to your linked bank account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="flex gap-3">
          <FiShield className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--info-color, #3b82f6)' }} />
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--info-color, #3b82f6)' }}>Secure & Private</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--info-color, #3b82f6)', opacity: 0.85 }}>
              Your bank details are stored securely with Razorpay - we never see or store your actual 
              account information. Only Razorpay handles your financial data with bank-grade security.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Card */}
      <div className="table-container-new p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <FiCreditCard className="w-6 h-6" style={{ color: 'var(--success-color, #10b981)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payout Account</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {settings?.canReceivePayments 
                  ? `Active since ${new Date(settings.onboardingCompletedAt).toLocaleDateString()}`
                  : 'Link your bank account to receive payments directly'}
              </p>
              {settings?.accountStatus && (
                <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                  background: settings.accountStatus === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: settings.accountStatus === 'active' ? 'var(--success-color, #10b981)' : 'var(--warning-color, #f59e0b)'
                }}>
                  {settings.accountStatus.charAt(0).toUpperCase() + settings.accountStatus.slice(1)}
                </span>
              )}
            </div>
          </div>
          
          {!settings?.canReceivePayments ? (
            <button
              onClick={handleStartOnboarding}
              disabled={onboardingLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ background: 'var(--success-color, #10b981)', color: '#fff' }}
            >
              {onboardingLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Setup Payout Account
                  <FiExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSendUpdateOtp}
              disabled={sendingOtp}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{ 
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)'
              }}
            >
              {sendingOtp ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <FiEdit className="w-4 h-4" />
                  Update Account
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                <FiMail className="w-6 h-6" style={{ color: 'var(--info-color, #3b82f6)' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Verify Your Identity</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Enter the OTP sent to your email to update payment details
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="verify-otp" className="sr-only">Enter 6-digit OTP</label>
              <input
                id="verify-otp"
                name="verifyOtp"
                type="text"
                value={verifyOtp}
                onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                autoComplete="one-time-code"
                className="w-full px-4 py-3 text-center text-xl tracking-widest rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-center mb-4" style={{ color: 'var(--error-color, #ef4444)' }}>{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerifyOtp('');
                  setError(null);
                }}
                className="flex-1 py-3 rounded-lg font-medium transition-colors"
                style={{ 
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || verifyOtp.length !== 6}
                className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                style={{ background: 'var(--success-color, #10b981)', color: '#fff' }}
              >
                {verifyingOtp ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Proceed'
                )}
              </button>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              Didn't receive OTP? <button onClick={handleSendUpdateOtp} className="underline" style={{ color: 'var(--info-color, #3b82f6)' }}>Resend</button>
            </p>
          </div>
        </div>
      )}

      {/* Current Status Details */}
      {settings?.isOnboardingComplete && (
        <div className="mt-6 rounded-lg p-4" style={{ background: 'var(--bg-secondary)' }}>
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Account Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span className="ml-2 font-medium" style={{ color: 'var(--success-color, #10b981)' }}>Verified</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Setup Date:</span>
              <span className="ml-2" style={{ color: 'var(--text-primary)' }}>
                {new Date(settings.onboardingCompletedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;
