import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
      // In production, this would send data to Razorpay
      // For now, we simulate completion
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <FiLoader className="w-8 h-8 animate-spin" style={{ color: 'var(--success-color, #10b981)' }} />
      </div>
    );
  }

  if (error && !refId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="table-container-new p-6 max-w-md w-full text-center">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--error-color, #ef4444)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Invalid Link</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={() => navigate('/owner/payment-settings')}
            className="px-4 py-2 rounded-lg"
            style={{ background: 'var(--success-color, #10b981)', color: '#fff' }}
          >
            Go to Payment Settings
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="table-container-new p-6 max-w-md w-full text-center">
          <FiCheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--success-color, #10b981)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {isUpdate ? 'Account Updated!' : 'Setup Complete!'}
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {isUpdate 
              ? 'Your payout account details have been updated successfully.'
              : 'Your payout account has been configured. You\'ll now receive payments directly to your bank account.'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting to Payment Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
            <FiCreditCard className="w-8 h-8" style={{ color: 'var(--success-color, #10b981)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isUpdate ? 'Update Payout Account' : 'Setup Payout Account'}
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            {isUpdate 
              ? 'Enter your new bank details to update your payout account'
              : 'Enter your bank details to receive payments directly'}
          </p>
        </div>

        <div className="table-container-new p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                <FiUser className="inline w-4 h-4 mr-1" />
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="As per bank records"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                required
                maxLength={11}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 uppercase"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="SBIN0001234"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter account number"
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Confirm Account Number
              </label>
              <input
                type="text"
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Re-enter account number"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                <FiPhone className="inline w-4 h-4 mr-1" />
                Phone Number (for OTP verification)
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                maxLength={10}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="10-digit mobile number"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <p className="text-sm" style={{ color: 'var(--error-color, #ef4444)' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={completing}
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--success-color, #10b981)', color: '#fff' }}
            >
              {completing ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                isUpdate ? 'Update Account' : 'Complete Setup'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <p className="text-xs" style={{ color: 'var(--info-color, #3b82f6)' }}>
              <strong>Secure:</strong> Your bank details are encrypted and stored securely with Razorpay. 
              FarmEase never sees or stores your actual bank information.
            </p>
          </div>
        </div>

        <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          By continuing, you agree to Razorpay's terms and conditions
        </p>
      </div>
    </div>
  );
};

export default PaymentOnboarding;
