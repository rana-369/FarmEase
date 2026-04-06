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
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #050505 0%, #080808 50%, #050505 100%)'
      }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)
          `
        }} />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/forgot-password')}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors px-4 py-2 rounded-xl"
            style={{ 
              color: '#10b981',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <FiArrowLeft />
            <span>Back</span>
          </motion.button>

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiLock className="text-white text-3xl relative z-10" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: '#ffffff' }}>Reset Password</h1>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>Enter the code sent to your email</p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden" style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <FiCheck className="text-3xl" style={{ color: '#10b981' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Password Reset!</h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Your password has been successfully reset. You can now login with your new password.
                </p>
                <motion.button
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 text-base font-semibold rounded-2xl transition-all relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10">Go to Login</span>
                </motion.button>
              </div>
            ) : (
              <>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl flex items-center gap-3"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171'
                    }}
                  >
                    <FiAlertCircle className="text-xl flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* OTP Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Enter 6-digit code
                    </label>
                    <div className="flex justify-between gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <motion.input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={formData.otp[index] || ''}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          whileFocus={{ scale: 1.05 }}
                          className="w-12 h-14 text-center text-xl font-bold rounded-2xl transition-all duration-200 outline-none"
                          style={{ 
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      Code sent to: <span className="font-medium" style={{ color: '#10b981' }}>{formData.email}</span>
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <FiLock style={{ color: '#10b981' }} />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="modern-input pr-12"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      Must have uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <FiLock style={{ color: '#3b82f6' }} />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="modern-input pr-12"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 text-base font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden mt-6"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      color: '#ffffff',
                      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                        <span className="relative z-10">Resetting...</span>
                      </>
                    ) : (
                      <span className="relative z-10">Reset Password</span>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Didn't receive the code?{' '}
                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="font-semibold animated-underline"
                      style={{ color: '#10b981' }}
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
