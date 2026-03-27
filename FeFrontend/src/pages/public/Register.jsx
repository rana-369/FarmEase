import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiShield, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
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
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ 
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #16a34a 100%)',
          position: 'relative'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="p-8 rounded-2xl text-center" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '2px solid #22c55e'
              }}>
                <FiCheck className="text-3xl" style={{ color: '#22c55e' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>Enterprise Account Created!</h2>
              <p className="mb-4" style={{ color: '#a1a1a1' }}>Your enterprise account has been successfully registered.</p>
              <p className="text-sm" style={{ color: '#22c55e' }}>Redirecting to login page...</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
          {/* Enterprise Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ 
              backgroundColor: '#22c55e',
              boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)'
            }}>
              <FiTruck className="text-white text-3xl" />
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Enterprise Registration</h1>
              <p className="text-lg" style={{ color: '#a1a1a1' }}>Request access to AgriConnect platform</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2" style={{ color: '#22c55e' }}>
                <FiShield />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#22c55e' }}>
                <FiLock />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#22c55e' }}>
                <FiUsers />
                <span>Enterprise</span>
              </div>
            </div>
          </div>

          {/* Enterprise Register Form */}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Farmer', 'Owner'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className="py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium"
                      style={{ 
                        backgroundColor: formData.role === role ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        border: formData.role === role ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.1)',
                        color: formData.role === role ? '#22c55e' : '#a1a1a1'
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser style={{ color: '#a1a1a1' }} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Corporate Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail style={{ color: '#a1a1a1' }} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone style={{ color: '#a1a1a1' }} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    className="w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Business Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                    <FiMapPin style={{ color: '#a1a1a1' }} />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    autoComplete="street-address"
                    rows="2"
                    className="w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter your business address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Enterprise Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock style={{ color: '#a1a1a1' }} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    style={{ color: '#a1a1a1' }}
                  >
                    {showPassword ? (
                      <FiEyeOff className="hover:text-white transition-colors" />
                    ) : (
                      <FiEye className="hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    style={{ color: '#a1a1a1' }}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="hover:text-white transition-colors" />
                    ) : (
                      <FiEye className="hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
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
                    Processing Request...
                  </div>
                ) : (
                  'Request Enterprise Access'
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p style={{ color: '#a1a1a1' }}>
                Already have an enterprise account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium hover:text-green-400 transition-colors"
                  style={{ color: '#22c55e' }}
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
