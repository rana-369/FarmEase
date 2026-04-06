import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield, FiUsers, FiArrowLeft, FiX, FiCheck, FiSun, FiTool, FiUser } from 'react-icons/fi';
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
        if (result.requires2FA === true) {
          console.log('2FA required, context state updated');
          setLoading(false);
          return;
        }
        
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

  const getRoleConfig = (role) => {
    switch (role) {
      case 'Farmer':
        return { icon: FiSun, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
      case 'Owner':
        return { icon: FiTool, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Admin':
        return { icon: FiShield, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { icon: FiUser, color: '#a1a1a1', bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#050505' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #080808 0%, #0c0c0c 50%, #080808 100%)'
      }}>
        {/* Background Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.04) 0%, transparent 30%)
          `
        }} />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <FiSun className="text-2xl" style={{ color: '#10b981' }} />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-32 w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)'
          }}
        >
          <FiTool className="text-3xl" style={{ color: '#3b82f6' }} />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-40 right-20 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)'
          }}
        >
          <FiShield className="text-xl" style={{ color: '#8b5cf6' }} />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <FiTruck className="text-2xl text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#ffffff' }}>AgriConnect</h1>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Farm Equipment Platform</p>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: '#ffffff' }}>
              Modern Farming<br />
              <span className="text-gradient">Starts Here</span>
            </h2>
            
            <p className="text-lg mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Connect with equipment owners, manage your farm operations, and grow your agricultural business.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: FiCheck, text: 'Access to 1000+ farm equipment', color: '#10b981' },
                { icon: FiCheck, text: 'Secure booking & payments', color: '#3b82f6' },
                { icon: FiCheck, text: 'Real-time equipment tracking', color: '#8b5cf6' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                      border: `1px solid ${feature.color}30`
                    }}
                  >
                    <feature.icon className="text-sm" style={{ color: feature.color }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{
          background: 'linear-gradient(to top, #050505, transparent)'
        }} />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative" style={{ backgroundColor: '#050505' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/', { replace: true })}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 mb-8 text-sm font-semibold transition-colors px-4 py-2 rounded-xl"
            style={{ 
              color: '#10b981',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <FiArrowLeft />
            <span>Back to Home</span>
          </motion.button>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <FiTruck className="text-xl text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: '#ffffff' }}>AgriConnect</h1>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Farm Equipment Platform</p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>Welcome Back</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Sign in to access your dashboard</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Select your role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Farmer', 'Owner', 'Admin'].map((role) => {
                const activeRole = requires2FA ? pending2FARole : selectedRole;
                const isActive = activeRole === role;
                const config = getRoleConfig(role);
                const Icon = config.icon;
                
                return (
                  <motion.button
                    key={role}
                    type="button"
                    onClick={() => !requires2FA && setSelectedRole(role)}
                    disabled={requires2FA}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all relative overflow-hidden group"
                    style={{ 
                      backgroundColor: isActive ? `${config.color}15` : 'rgba(255, 255, 255, 0.03)',
                      border: isActive ? `2px solid ${config.color}40` : '2px solid rgba(255, 255, 255, 0.06)',
                      opacity: requires2FA && !isActive ? 0.5 : 1,
                      cursor: requires2FA ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isActive && (
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${config.color}30 0%, transparent 70%)`
                        }}
                      />
                    )}
                    <Icon className="text-xl relative z-10" style={{ color: isActive ? config.color : 'rgba(255,255,255,0.8)' }} />
                    <span className="text-sm font-semibold relative z-10" style={{ color: isActive ? config.color : 'rgba(255,255,255,0.5)' }}>
                      {role}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Login Form Card */}
          <div 
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)'
            }}
          >
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
                    className="mb-5 p-4 rounded-2xl flex items-center gap-3"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171'
                    }}
                  >
                    <FiAlertCircle className="text-lg flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                {warning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-4 rounded-2xl flex items-center gap-3"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#fbbf24'
                    }}
                  >
                    <FiAlertCircle className="text-lg flex-shrink-0" />
                    <span className="text-sm font-medium">{warning}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <FiMail style={{ color: '#10b981' }} />
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
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <FiLock style={{ color: '#3b82f6' }} />
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
                        autoComplete="current-password"
                        className="modern-input pr-12"
                        placeholder="Enter your password"
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
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm font-semibold animated-underline"
                      style={{ color: '#10b981' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 relative overflow-hidden"
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
                        <span className="relative z-10">Signing in...</span>
                      </>
                    ) : (
                      <span className="relative z-10">Sign In</span>
                    )}
                  </motion.button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/register')}
                      className="font-semibold animated-underline"
                      style={{ color: '#10b981' }}
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs" style={{ color: '#555555' }}>
            <div className="flex items-center gap-1.5">
              <FiShield />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiLock />
              <span>Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Role Mismatch Modal */}
      {showRoleModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl relative"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: '#666666' }}
            >
              <FiX />
            </button>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
              >
                <FiAlertCircle className="text-3xl" style={{ color: '#f59e0b' }} />
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Role Mismatch</h3>
              <p className="text-sm mb-6" style={{ color: '#888888' }}>
                This account is registered as <span className="font-semibold" style={{ color: '#22c55e' }}>{actualRole}</span>. 
                Only <span className="font-semibold" style={{ color: '#22c55e' }}>{actualRole}</span>s can login with these credentials.
              </p>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedRole(actualRole);
                    setShowRoleModal(false);
                  }}
                  className="w-full py-3 rounded-xl font-medium transition-all"
                  style={{ 
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#ffffff'
                  }}
                >
                  Login as {actualRole}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRoleModal(false)}
                  className="w-full py-3 rounded-xl font-medium transition-all"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#a1a1a1',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Try Different Account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Login;
