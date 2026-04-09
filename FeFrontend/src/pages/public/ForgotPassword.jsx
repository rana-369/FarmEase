import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheck, FiTruck, FiSun, FiMoon } from 'react-icons/fi';
import { forgotPassword } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      
      if (result.message) {
        // Store the message which contains OTP in dev mode
        setSuccess(true);
        // Store the full message for display
        setOtpMessage(result.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #050505 0%, #080808 50%, #050505 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
        transition: 'background 0.3s ease'
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
          {/* Back to Login Button */}
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors px-4 py-2 rounded-xl"
            style={{ 
              color: '#10b981',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <FiArrowLeft />
            <span>Back to Login</span>
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
              <FiTruck className="text-white text-3xl relative z-10" />
            </motion.div>
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Forgot Password</h1>
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)'
                }}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
                <span className="text-xs font-medium">{isDark ? 'Light' : 'Dark'}</span>
              </motion.button>
            </div>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>Enter your email to receive a reset code</p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{ 
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
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
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>OTP Sent!</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  We've sent a 6-digit code to <span className="font-semibold" style={{ color: '#10b981' }}>{email}</span>. 
                  The code is valid for 15 minutes.
                </p>
                <div className="mb-6 p-4 rounded-2xl text-left" style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)' 
                }}>
                  <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                    {otpMessage}
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
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
                  <span className="relative z-10">Enter Reset Code</span>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      <FiMail style={{ color: '#10b981' }} />
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="modern-input"
                      placeholder="Enter your registered email"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 text-base font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
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
                        <span className="relative z-10">Sending OTP...</span>
                      </>
                    ) : (
                      <span className="relative z-10">Send Reset Code</span>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center pt-6" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Remember your password?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="font-semibold animated-underline"
                      style={{ color: '#10b981' }}
                    >
                      Back to Login
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

export default ForgotPassword;
