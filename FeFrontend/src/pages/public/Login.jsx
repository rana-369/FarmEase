import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield, FiUsers, FiArrowLeft, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';
import TwoFactorVerify from '../../components/TwoFactorVerify';

const Login = () => {
  const navigate = useNavigate();
  const { login, logout, verify2FA, resend2FACode, cancel2FA, requires2FA, pending2FAEmail, pending2FARole } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState('Farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [actualRole, setActualRole] = useState('');

  // Debug modal state
  useEffect(() => {
    if (showRoleModal) {
      console.log('Modal should be visible, actualRole:', actualRole);
    }
  }, [showRoleModal, actualRole]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (warning) setWarning('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, selectedRole);
      console.log('Login result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        // Check if 2FA is required - context state is already updated by login()
        if (result.requires2FA === true) {
          console.log('2FA required, context state updated');
          setLoading(false);
          return;
        }
        
        // Role validation is now done by backend - just redirect
        console.log('Redirecting to dashboard, role:', result.role);
        if (result.role === 'Farmer') {
          navigate('/farmer');
        } else if (result.role === 'Owner') {
          navigate('/owner');
        } else if (result.role === 'Admin') {
          navigate('/admin');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (code) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await verify2FA(pending2FAEmail, code);
      
      if (result.success) {
        if (result.role === 'Farmer') {
          navigate('/farmer');
        } else if (result.role === 'Owner') {
          navigate('/owner');
        } else if (result.role === 'Admin') {
          navigate('/admin');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAResend = async () => {
    try {
      await resend2FACode(pending2FAEmail);
    } catch (err) {
      setError('Failed to resend code');
    }
  };

  const handle2FABack = () => {
    cancel2FA();
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
          {/* Back to Home Button */}
          <div className="mb-6">
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#a1a1a1'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#22c55e';
                e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#a1a1a1';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <FiArrowLeft />
              <span>Back to Home</span>
            </motion.button>
          </div>

          {/* Enterprise Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ 
              backgroundColor: '#22c55e',
              boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)'
            }}>
              <FiTruck className="text-white text-3xl" />
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Enterprise Login</h1>
              <p className="text-lg" style={{ color: '#a1a1a1' }}>Access your AgriConnect platform</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm mb-4">
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
            {/* Role Selection */}
            <div className="mb-4">
              <label id="role-label" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Login as
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="role-label">
                {['Farmer', 'Owner', 'Admin'].map((role) => {
                  // Use pending2FARole during 2FA, otherwise use selectedRole
                  const activeRole = requires2FA ? pending2FARole : selectedRole;
                  const isActive = activeRole === role;
                  return (
                    <button
                      key={role}
                      id={`role-${role.toLowerCase()}`}
                      type="button"
                      onClick={() => !requires2FA && setSelectedRole(role)}
                      disabled={requires2FA}
                      className="py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium"
                      style={{ 
                        backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        border: isActive ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.1)',
                        color: isActive ? '#22c55e' : '#a1a1a1',
                        cursor: requires2FA ? 'not-allowed' : 'pointer',
                        opacity: requires2FA && !isActive ? 0.5 : 1
                      }}
                      aria-pressed={isActive}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enterprise Login Form */}
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
            {/* Show 2FA verification if required */}
            {requires2FA ? (
              <TwoFactorVerify
                email={pending2FAEmail}
                onVerify={handle2FAVerify}
                onBack={handle2FABack}
                loading={loading}
              />
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

                {warning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg flex items-center gap-3"
                    style={{ 
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b'
                    }}
                  >
                    <FiAlertCircle className="text-xl flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </motion.div>
                )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Email
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
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Password
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
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter your password"
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-medium hover:text-green-400 transition-colors"
                  style={{ color: '#22c55e' }}
                >
                  Forgot password?
                </button>
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
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p style={{ color: '#a1a1a1' }}>
                Need an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-medium hover:text-green-400 transition-colors"
                  style={{ color: '#22c55e' }}
                >
                  Register
                </button>
              </p>
            </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Role Mismatch Modal - Using Portal for proper rendering */}
      {showRoleModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl relative"
            style={{ 
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
              style={{ color: '#a1a1a1' }}
            >
              <FiX className="text-xl" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <FiAlertCircle className="text-3xl" style={{ color: '#f59e0b' }} />
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Role Mismatch</h3>
              <p className="text-sm mb-4" style={{ color: '#a1a1a1' }}>
                This account is registered as <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{actualRole}</span>. 
                Only <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{actualRole}</span> can login with these credentials.
              </p>
              
              <button
                onClick={() => {
                  setSelectedRole(actualRole);
                  setShowRoleModal(false);
                }}
                className="w-full py-3 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#22c55e',
                  color: '#ffffff'
                }}
              >
                Login as {actualRole}
              </button>
              
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full py-3 mt-2 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#a1a1a1',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                Try Different Account
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Login;
