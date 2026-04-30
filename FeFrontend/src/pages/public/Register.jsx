import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiTruck, FiArrowLeft } from 'react-icons/fi';
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

  const steps = [
    { number: 1, title: 'Create your account', desc: 'Fill in your details' },
    { number: 2, title: 'Verify your email', desc: 'Confirm your identity' },
    { number: 3, title: 'Start farming', desc: 'Access equipment instantly' }
  ];

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#0a0a0a'
      }}>
        {/* Left Side - Dark Green Panel */}
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
        </div>

        {/* Right Side - Success Message */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          backgroundColor: '#0a0a0a'
        }} className="lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}>
              <FiCheck size={40} style={{ color: '#ffffff' }} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px'
            }}>Account Created!</h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>Your FarmEase account has been successfully registered.</p>
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#10b981'
            }}>Redirecting to login page...</p>
          </motion.div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .lg\\:block { display: block !important; }
            .lg\\:w-1\\/2 { width: 50% !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0a0a0a'
    }}>
      {/* Left Side - Dark Green Panel with FarmEase Branding */}
      <div style={{
        display: 'none',
        width: '50%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d2818 0%, #1a4d3a 50%, #0d2818 100%)'
      }} className="lg:block">
        {/* Radial gradient overlays */}
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

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 64px',
          height: '100%'
        }}>
          {/* Back to Home Button */}
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiArrowLeft style={{ fontSize: '16px' }} />
            Back to Home
          </motion.button>

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
              Join<br />FarmEase
            </h2>
            
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '40px',
              maxWidth: '400px'
            }}>
              Create your account and start accessing farm equipment today.
            </p>

            {/* Step Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
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
                      background: 'rgba(255,255,255,0.2)',
                      flexShrink: 0
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#ffffff'
                      }}>{step.number}</span>
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#ffffff',
                        margin: 0
                      }}>
                        {step.title}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.6)',
                        margin: '4px 0 0 0'
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        backgroundColor: '#0a0a0a',
        overflowY: 'auto'
      }} className="lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px'
            }}>Create Account</h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>Enter your information to create an account</p>
          </div>

          {/* Error Message */}
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

          {/* Register Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Role Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
                Account Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { value: 'Farmer', label: 'Farmer' },
                  { value: 'Owner', label: 'Equipment Owner' }
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      background: formData.role === role.value ? '#ffffff' : '#1a1a1a',
                      border: formData.role === role.value ? '1px solid #ffffff' : '1px solid #333',
                      color: formData.role === role.value ? '#0a0a0a' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
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
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
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

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
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
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                autoComplete="street-address"
                rows={2}
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
                  resize: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#555'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
                placeholder="Enter your address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                marginTop: '8px',
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                style={{
                  fontWeight: 600,
                  color: '#10b981',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Sign in
              </button>
            </p>
          </div>
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

export default Register;
