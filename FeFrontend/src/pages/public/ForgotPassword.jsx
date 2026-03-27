import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheck, FiTruck } from 'react-icons/fi';
import { forgotPassword } from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
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
          {/* Back to Login Button */}
          <div className="mb-6">
            <motion.button
              onClick={() => navigate('/login')}
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
              <span>Back to Login</span>
            </motion.button>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ 
              backgroundColor: '#22c55e',
              boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)'
            }}>
              <FiTruck className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Forgot Password</h1>
            <p className="text-lg" style={{ color: '#a1a1a1' }}>Enter your email to receive a reset code</p>
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
                <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>OTP Sent!</h3>
                <p className="text-sm mb-4" style={{ color: '#a1a1a1' }}>
                  We've sent a 6-digit code to <span style={{ color: '#22c55e' }}>{email}</span>. 
                  The code is valid for 15 minutes.
                </p>
                <div className="mb-6 p-4 rounded-lg text-left" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                    {otpMessage}
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 text-lg font-semibold rounded-lg transition-all"
                  style={{ 
                    backgroundColor: '#22c55e', 
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  Enter Reset Code
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
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail style={{ color: '#a1a1a1' }} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter your registered email"
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
                        Sending OTP...
                      </div>
                    ) : (
                      'Send Reset Code'
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <p style={{ color: '#a1a1a1' }}>
                    Remember your password?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="font-medium hover:text-green-400 transition-colors"
                      style={{ color: '#22c55e' }}
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
