import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft, FiAlertCircle, FiCheck, FiEye, FiEyeOff, FiTruck } from 'react-icons/fi';
import { resetPassword } from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!emailFromUrl) {
      navigate('/forgot-password');
    }
  }, [emailFromUrl, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Handle OTP input - auto-focus next digit
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) return; // Only single digit
    
    const otpArray = formData.otp.split('');
    otpArray[index] = value;
    const newOtp = otpArray.join('').slice(0, 6);
    
    setFormData(prev => ({ ...prev, otp: newOtp }));
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace - focus previous input
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(formData.email, formData.otp, formData.newPassword);
      
      if (result.message) {
        setSuccess(true);
      } else {
        setError(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #16a34a 100%)',
        position: 'relative'
      }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)', 
          backgroundSize: '100% 100%'
        }}></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back Button */}
          <div className="mb-6">
            <motion.button
              onClick={() => navigate('/forgot-password')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#a1a1a1'
              }}
            >
              <FiArrowLeft />
              <span>Back</span>
            </motion.button>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ 
              backgroundColor: '#22c55e',
              boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)'
            }}>
              <FiLock className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Reset Password</h1>
            <p className="text-lg" style={{ color: '#a1a1a1' }}>Enter the code sent to your email</p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <FiCheck className="text-3xl" style={{ color: '#22c55e' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Password Reset!</h3>
                <p className="text-sm mb-6" style={{ color: '#a1a1a1' }}>
                  Your password has been successfully reset. You can now login with your new password.
                </p>
                <motion.button
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 text-lg font-semibold rounded-lg transition-all"
                  style={{ 
                    backgroundColor: '#22c55e', 
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  Go to Login
                </motion.button>
              </div>
            ) : (
              <>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg flex items-center gap-3"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444'
                    }}
                  >
                    <FiAlertCircle className="text-xl flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
                      Enter 6-digit code
                    </label>
                    <div className="flex justify-between gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={formData.otp[index] || ''}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 h-12 text-center text-xl font-bold rounded-lg transition-all duration-200"
                          style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#666666' }}>
                      Code sent to: <span style={{ color: '#22c55e' }}>{formData.email}</span>
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock style={{ color: '#a1a1a1' }} />
                      </div>
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 rounded-lg transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        style={{ color: '#a1a1a1' }}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>
                      Must have uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock style={{ color: '#a1a1a1' }} />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontSize: '1rem'
                        }}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#22c55e', 
                      color: '#ffffff',
                      boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <p style={{ color: '#a1a1a1' }}>
                    Didn't receive the code?{' '}
                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="font-medium hover:text-green-400 transition-colors"
                      style={{ color: '#22c55e' }}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
