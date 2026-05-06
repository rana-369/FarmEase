import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiRefreshCw, FiBriefcase, FiCheck, FiEdit2, FiX, FiUpload, FiStar, FiMessageSquare } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import TwoFactorSetup from '../../components/TwoFactorSetup';
import SubmitTestimonial from '../../components/SubmitTestimonial';

const OwnerProfile = () => {
  const { get2FASettings, update2FASettings } = useAuth();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    companyName: '',
    profileImageUrl: ''
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [twoFASettings, setTwoFASettings] = useState({ enabled: false, method: 'email' });
  const [showTestimonial, setShowTestimonial] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetch2FASettings();
  }, []);

  const fetch2FASettings = async () => {
    const result = await get2FASettings();
    if (result.success && result.settings) {
      setTwoFASettings(result.settings);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const data = response.data || {};
      const profileData = {
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        location: data.location || '',
        companyName: data.companyName || '',
        profileImageUrl: data.profileImageUrl || ''
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfile(prev => ({
        ...prev,
        profileImageUrl: response.data.profileImageUrl || response.data.url
      }));
      setMessage({ type: 'success', text: 'Profile image updated!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.put('/profile', profile);
      setOriginalProfile(profile);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handle2FAUpdate = async (settings) => {
    const result = await update2FASettings(settings);
    if (result.success) {
      setTwoFASettings(settings);
      setMessage({ type: 'success', text: `Two-factor authentication ${settings.enabled ? 'enabled' : 'disabled'} successfully!` });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update 2FA settings' });
    }
    return result;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '56px',
            height: '56px',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '16px',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            animation: 'pulse 2s ease-in-out infinite',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
              }} />
              <FiBriefcase style={{ fontSize: '20px', color: '#ffffff', position: 'relative', zIndex: 10 }} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)'
              }}>Owner Profile</h1>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)'
              }}>Manage your personal details and business identity</p>
            </div>
          </div>

          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
              }} />
              <FiEdit2 style={{ width: '16px', height: '16px', position: 'relative', zIndex: 10 }} />
              <span style={{ position: 'relative', zIndex: 10 }}>Edit Profile</span>
            </motion.button>
          )}
        </motion.div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: message.type === 'success'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
              border: message.type === 'success'
                ? '1px solid rgba(16, 185, 129, 0.25)'
                : '1px solid rgba(239, 68, 68, 0.25)',
              color: message.type === 'success' ? '#10b981' : '#f87171'
            }}
          >
            {message.type === 'success' ? <FiCheck /> : <FiX />}
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{message.text}</span>
          </motion.div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px'
        }}>
          {/* Avatar Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ gridColumn: 'span 4' }}
          >
            <div style={{
              padding: '24px',
              borderRadius: '24px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)'
              }} />

              {/* Avatar */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{
                  width: '112px',
                  height: '112px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.3)'
                }}>
                  {profile.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <FiUser style={{ fontSize: '40px', color: '#3b82f6' }} />
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleImageClick}
                  disabled={uploading}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    opacity: uploading ? 0.7 : 1,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                  }} />
                  {uploading ? (
                    <FiRefreshCw style={{ color: '#ffffff', fontSize: '14px', position: 'relative', zIndex: 10, animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <FiCamera style={{ color: '#ffffff', fontSize: '14px', position: 'relative', zIndex: 10 }} />
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  id="profile-image"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* User Info */}
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '4px',
                position: 'relative',
                color: 'var(--text-primary)'
              }}>
                {profile.fullName || 'Fleet Owner'}
              </h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <FiCheck style={{ fontSize: '12px' }} />
                Enterprise Owner
              </span>

              {/* Quick Stats */}
              <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                position: 'relative',
                borderTop: '1px solid var(--border-secondary)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-button)',
                    border: '1px solid var(--border-tertiary)'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Company</p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-primary)'
                    }}>
                      {profile.companyName || 'N/A'}
                    </p>
                  </div>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-button)',
                    border: '1px solid var(--border-tertiary)'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Location</p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-primary)'
                    }}>
                      {profile.location || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ gridColumn: 'span 8' }}
          >
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                background: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
              }} />

              <form onSubmit={handleSave} style={{ padding: '24px', position: 'relative' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)'
                      }}>
                        <FiUser style={{ fontSize: '10px', color: '#60a5fa' }} />
                      </div>
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      autoComplete="name"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        outline: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)',
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)'
                      }}>
                        <FiMail style={{ fontSize: '10px', color: '#c084fc' }} />
                      </div>
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      disabled
                      value={profile.email}
                      autoComplete="email"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        outline: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box',
                        background: 'var(--bg-button)',
                        border: '1px solid var(--border-tertiary)',
                        color: 'var(--text-secondary)'
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phoneNumber" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)'
                      }}>
                        <FiPhone style={{ fontSize: '10px', color: '#10b981' }} />
                      </div>
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      autoComplete="tel"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        outline: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)',
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)'
                      }}>
                        <FiMapPin style={{ fontSize: '10px', color: '#f87171' }} />
                      </div>
                      Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      autoComplete="address-level2"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        outline: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)',
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>

                  {/* Company Name */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="companyName" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)'
                      }}>
                        <FiBriefcase style={{ fontSize: '10px', color: '#fbbf24' }} />
                      </div>
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. Green Acres Rentals"
                      autoComplete="organization"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        outline: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: isEditing ? 'var(--bg-input)' : 'var(--bg-button)',
                        border: isEditing ? '1px solid var(--border-primary)' : '1px solid var(--border-tertiary)',
                        color: isEditing ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: isEditing ? 'text' : 'default'
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px',
                    paddingTop: '24px',
                    position: 'relative',
                    borderTop: '1px solid var(--border-secondary)'
                  }}>
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--bg-button)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      <FiX style={{ width: '16px', height: '16px' }} />
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                      }} />
                      {saving ? (
                        <FiRefreshCw style={{ width: '16px', height: '16px', position: 'relative', zIndex: 10, animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <FiSave style={{ width: '16px', height: '16px', position: 'relative', zIndex: 10 }} />
                      )}
                      <span style={{ position: 'relative', zIndex: 10 }}>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </motion.button>
                  </div>
                )}
              </form>

              {/* 2FA Section */}
              <div style={{
                padding: '0 24px 24px',
                position: 'relative',
                borderTop: '1px solid var(--border-secondary)'
              }}>
                <div style={{ paddingTop: '24px' }}>
                  <TwoFactorSetup
                    currentSettings={twoFASettings}
                    onUpdate={handle2FAUpdate}
                  />
                </div>
              </div>

              {/* Write a Review Section */}
              <div style={{
                padding: '0 24px 24px',
                position: 'relative',
                borderTop: '1px solid var(--border-secondary)'
              }}>
                <div style={{ paddingTop: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(245, 158, 11, 0.15)'
                      }}>
                        <FiStar style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          Share Your Experience
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                          Write a review about FarmEase platform
                        </p>
                      </div>
                    </div>
                    {!showTestimonial && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTestimonial(true)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <FiMessageSquare style={{ width: '16px', height: '16px' }} />
                        Write a Review
                      </motion.button>
                    )}
                  </div>

                  {showTestimonial && (
                    <SubmitTestimonial
                      onClose={() => setShowTestimonial(false)}
                      onSubmitSuccess={() => {
                        setShowTestimonial(false);
                        setMessage({ type: 'success', text: 'Thank you for your review!' });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
