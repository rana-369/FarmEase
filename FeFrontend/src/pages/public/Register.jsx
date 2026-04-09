import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiShield, FiUsers, FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'Farmer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    const { confirmPassword, ...registrationData } = formData;
    
    const result = await register(registrationData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
          background: isDark 
            ? 'linear-gradient(135deg, #050505 0%, #080808 50%, #050505 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
          transition: 'background 0.3s ease'
        }}>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)'
          }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="p-8 rounded-3xl text-center relative overflow-hidden" style={{ 
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)'
            }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden" style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <FiCheck className="text-3xl text-white relative z-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Account Created!</h2>
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Your account has been successfully registered.</p>
              <p className="text-sm font-medium" style={{ color: '#10b981' }}>Redirecting to login page...</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
          {/* Back to Home Button */}
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors px-4 py-2 rounded-xl"
            style={{ 
              color: '#10b981',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <FiArrowLeft />
            <span>Back to Home</span>
          </motion.button>

          {/* Logo Section */}
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
            <div className="mb-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
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
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>Join the FarmEase platform</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-medium">
              {[
                { icon: FiShield, text: 'Secure' },
                { icon: FiLock, text: 'Encrypted' },
                { icon: FiUsers, text: 'Trusted' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <item.icon style={{ color: '#10b981' }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Register Form */}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Farmer', 'Owner'].map((role) => (
                    <motion.button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="py-3 px-4 rounded-2xl transition-all duration-200 text-sm font-semibold relative overflow-hidden"
                      style={{ 
                        background: formData.role === role 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)' 
                          : 'var(--bg-button)',
                        border: formData.role === role 
                          ? '2px solid rgba(16, 185, 129, 0.4)' 
                          : '2px solid var(--border-primary)',
                        color: formData.role === role ? '#10b981' : 'var(--text-muted)'
                      }}
                    >
                      {role}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiUser style={{ color: '#10b981' }} />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="modern-input"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiMail style={{ color: '#3b82f6' }} />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="modern-input"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiPhone style={{ color: '#8b5cf6' }} />
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  className="modern-input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Address Field */}
              <div>
                <label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiMapPin style={{ color: '#f59e0b' }} />
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  autoComplete="street-address"
                  rows="2"
                  className="modern-input resize-none"
                  placeholder="Enter your address"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiLock style={{ color: '#10b981' }} />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="modern-input pr-12"
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <FiLock style={{ color: '#3b82f6' }} />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="modern-input pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
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
                    <span className="relative z-10">Creating Account...</span>
                  </>
                ) : (
                  <span className="relative z-10">Create Account</span>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center pt-6" style={{ borderTop: '1px solid var(--border-secondary)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold animated-underline"
                  style={{ color: '#10b981' }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
