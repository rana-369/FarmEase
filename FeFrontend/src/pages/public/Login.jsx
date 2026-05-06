import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiTruck, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import TwoFactorVerify from '../../components/TwoFactorVerify';

const Login = () => {
  const navigate = useNavigate();
  const { login, verify2FA, resend2FACode, cancel2FA, requires2FA, pending2FAEmail } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
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
      const result = await login(formData.email, formData.password);
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

  const features = [
    { icon: FiCheck, title: 'Access to 1000+ farm equipment', color: '#10b981' },
    { icon: FiCheck, title: 'Secure booking & payments', color: '#10b981' },
    { icon: FiCheck, title: 'Real-time equipment tracking', color: '#10b981' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0a0a0a'
    }}>
      <div style={{
        display: 'none',
        width: '50%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d2818 0%, #1a4d3a 50%, #0d2818 100%)'
      }} className="lg:block">
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top left, rgba(16,185,129,0.15) 0%, transparent 50%)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at bottom right, rgba(5,150,105,0.1) 0%, transparent 50%)'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 64px',
          height: '100%'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
              }}>
                <FiTruck style={{ fontSize: '24px', color: '#ffffff' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0
                }}>FarmEase</h1>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0
                }}>Farm Equipment Platform</p>
              </div>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '16px'
            }}>
              Modern Farming<br />Starts Here
            </h2>
            
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '40px',
              maxWidth: '400px'
            }}>
              Connect with equipment owners, manage your farm operations, and grow your agricultural business.
            </p>

            {/* Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${feature.color}20`,
                      border: `1px solid ${feature.color}40`,
                      flexShrink: 0
                    }}>
                      <feature.icon style={{
                        fontSize: '16px',
                        color: feature.color
                      }} />
                    </div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#ffffff'
                    }}>
                      {feature.title}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        backgroundColor: '#0a0a0a'
      }} className="lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '24px',
              padding: 0,
              transition: 'color 0.2s ease'
            }}
            whileHover={{ color: '#10b981' }}
          >
            <FiArrowLeft style={{ fontSize: '16px' }} />
            Back to Home
          </motion.button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px'
            }}>Sign In</h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>Enter your credentials to access your account</p>
          </div>

          {/* Login Form */}
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
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '20px'
                  }}
                >
                  <FiAlertCircle style={{ color: '#f87171', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#f87171' }}>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Email */}
                <div>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#555'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <label htmlFor="password" style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#9ca3af'
                    }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      style={{
                        fontSize: '12px',
                        color: '#10b981',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        borderRadius: '12px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#555'}
                      onBlur={(e) => e.target.style.borderColor = '#333'}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '4px',
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: 'none',
                    color: '#0a0a0a',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    transition: 'background 0.2s ease'
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #0a0a0a',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              {/* Register Link */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    style={{
                      fontWeight: 600,
                      color: '#10b981',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 1024px) {
          .lg\\:block { display: block !important; }
          .lg\\:w-1\\/2 { width: 50% !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
