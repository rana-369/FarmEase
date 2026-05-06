import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiCamera, FiMapPin, FiFileText, FiSave, FiX, FiRefreshCw, FiTool, FiCheckCircle, FiNavigation, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import LocationSearch from '../../components/LocationSearch';

const EditMachine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tractor',
    description: '',
    rate: '',
    location: '',
    specifications: '',
    availability: true,
    images: [],
    imageFiles: [],
    latitude: null,
    longitude: null,
    city: '',
    state: '',
    pincode: ''
  });

  const categories = [
    'Tractor',
    'Harvester',
    'Plow',
    'Seeder',
    'Irrigation',
    'Sprayer',
    'Cultivator',
    'Other'
  ];

  useEffect(() => {
    fetchMachine();
  }, [id]);

  const fetchMachine = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/machines/${id}`);
      const machine = response.data;
      
      setFormData({
        name: machine.name || machine.Name || '',
        category: machine.type || machine.Type || 'Tractor',
        description: machine.description || machine.Description || '',
        rate: machine.rate || machine.Rate || machine.pricePerHour || '',
        location: machine.location || machine.Location || '',
        specifications: '',
        availability: machine.status === 'Verified' || machine.status === 'Active',
        images: machine.imageUrl ? [machine.imageUrl] : [],
        imageFiles: [],
        latitude: machine.latitude || machine.Latitude || null,
        longitude: machine.longitude || machine.Longitude || null,
        city: machine.city || '',
        state: machine.state || '',
        pincode: machine.pincode || ''
      });
      
      if (machine.latitude && machine.longitude) {
        setLocationConfirmed(true);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machine:', error);
      setError('Failed to load equipment details');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.name || !formData.rate || !formData.location) {
      setError('Equipment name, hourly rate, and location are required');
      setSaving(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        type: formData.category,
        pricePerHour: parseInt(formData.rate),
        location: formData.location,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };
      
      // If there's a new image, use FormData with /equipment endpoint
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('type', formData.category);
        formDataObj.append('pricePerHour', parseInt(formData.rate));
        formDataObj.append('location', formData.location);
        formDataObj.append('description', formData.description);
        if (formData.latitude !== null) formDataObj.append('latitude', formData.latitude);
        if (formData.longitude !== null) formDataObj.append('longitude', formData.longitude);
        if (formData.city) formDataObj.append('city', formData.city);
        if (formData.state) formDataObj.append('state', formData.state);
        if (formData.pincode) formDataObj.append('pincode', formData.pincode);
        formDataObj.append('image', formData.imageFiles[0]);
        
        await api.put(`/equipment/${id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // No new image, send as JSON - but backend expects FormData
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('category', formData.category);
        formDataObj.append('pricePerHour', parseInt(formData.rate));
        if (formData.location) formDataObj.append('location', formData.location);
        if (formData.description) formDataObj.append('description', formData.description);
        if (formData.latitude !== null) formDataObj.append('latitude', formData.latitude);
        if (formData.longitude !== null) formDataObj.append('longitude', formData.longitude);
        if (formData.city) formDataObj.append('city', formData.city);
        if (formData.state) formDataObj.append('state', formData.state);
        if (formData.pincode) formDataObj.append('pincode', formData.pincode);
        
        await api.put(`/equipment/${id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/owner/machines');
      }, 2000);
    } catch (error) {
      console.error('Error updating machine:', error);
      setError(error.response?.data?.message || 'Failed to update equipment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files.map(file => file.name)],
        imageFiles: [...prev.imageFiles, ...files]
      }));
    }
  };

  const removeImage = (imageName) => {
    setFormData(prev => {
      const imageIndex = prev.images.indexOf(imageName);
      return {
        ...prev,
        images: prev.images.filter(img => img !== imageName),
        imageFiles: imageIndex >= 0 ? prev.imageFiles.filter((_, i) => i !== imageIndex) : prev.imageFiles
      };
    });
  };

  const handleLocationSelect = (location) => {
    if (location) {
      setFormData(prev => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
        location: location.address,
        city: location.name?.split(',')[0] || prev.city,
        state: location.name?.split(',')[1]?.trim() || prev.state
      }));
      setLocationConfirmed(true);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border-primary)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '32px',
            borderRadius: '24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <FiCheckCircle style={{ fontSize: '32px', color: '#10b981' }} />
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>Updated Successfully!</h2>
          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>Your equipment details have been saved.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/owner/machines')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <FiArrowLeft style={{ fontSize: '20px' }} />
            </motion.button>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>Edit Equipment</h1>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)'
              }}>Update machinery details</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: '24px',
              padding: '24px',
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              position: 'relative'
            }}>
              {/* Equipment Name */}
              <div>
                <label htmlFor="name" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '10px'
                }}>
                  <FiTool style={{ fontSize: '14px', color: '#60a5fa' }} />
                  Machinery Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  placeholder="e.g., Mahindra Arjun Nova 605"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '10px'
                }}>
                  <FiTruck style={{ fontSize: '14px', color: '#c084fc' }} />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Hourly Rate */}
              <div>
                <label htmlFor="rate" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 700 }}>₹</span>
                  Hourly Rate (₹)
                </label>
                <input
                  id="rate"
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  required
                  min="0"
                  autoComplete="off"
                  placeholder="800"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                />
              </div>

              {/* Location */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '10px'
                }}>
                  <FiMapPin style={{ fontSize: '14px', color: '#10b981' }} />
                  Equipment Location
                  {locationConfirmed && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981'
                    }}>Location Set</span>
                  )}
                </label>
                
                {/* Location Picker */}
                <div style={{ marginBottom: '12px' }}>
                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    showRadiusSelector={false}
                    initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude, address: formData.location } : null}
                  />
                </div>
                
                {/* Manual Location Input */}
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  autoComplete="address-level2"
                  placeholder="Or enter location manually (City, State)"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                />
                
                {/* Coordinates Display */}
                {formData.latitude && formData.longitude && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiMapPin style={{ color: '#10b981', fontSize: '12px' }} />
                    <span style={{ fontSize: '11px', color: '#10b981' }}>
                      Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="description" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '10px'
                }}>
                  <FiFileText style={{ fontSize: '14px', color: '#fbbf24' }} />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  autoComplete="off"
                  placeholder="Describe technical details, condition, and accessories..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(245, 158, 11, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                />
              </div>

              {/* Image Upload */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '10px'
                }}>
                  <FiCamera style={{ fontSize: '14px', color: '#60a5fa' }} />
                  Equipment Image
                </label>
                <div style={{
                  border: '2px dashed var(--border-primary)',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-button)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-secondary)'
                  }}>
                    <FiCamera style={{ fontSize: '28px', color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{
                    fontSize: '14px',
                    marginBottom: '4px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>Drop image or click to browse</p>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)'
                  }}>JPG, PNG, WEBP (Max 5MB)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                    name="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      marginTop: '16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#10b981'
                    }}
                  >
                    Select Image
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    {formData.images.map((image) => (
                      <div key={image} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: 'var(--bg-button)',
                        border: '1px solid var(--border-secondary)'
                      }}>
                        <FiFileText style={{ color: '#10b981' }} />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--text-muted)'
                        }}>{image}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeImage(image)}
                          style={{
                            padding: '4px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: '#f87171',
                            cursor: 'pointer'
                          }}
                        >
                          <FiX style={{ width: '12px', height: '12px' }} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-secondary)'
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/owner/machines')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? (
                  <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <FiSave />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EditMachine;
