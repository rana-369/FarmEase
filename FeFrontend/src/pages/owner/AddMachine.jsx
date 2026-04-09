import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiCamera, FiMapPin, FiFileText, FiSave, FiX, FiRefreshCw, FiTool, FiCheckCircle } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { addEquipmentWithImage } from '../../services/machineService';

const AddMachine = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tractor',
    description: '',
    rate: '',
    location: '',
    specifications: '',
    availability: true,
    images: [],
    imageFiles: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setLoading(true);
    setError('');

    if (!formData.name || !formData.rate || !formData.location) {
      setError('Equipment name, hourly rate, and location are required');
      setLoading(false);
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('category', formData.category);
      formDataObj.append('pricePerHour', parseInt(formData.rate));
      formDataObj.append('location', formData.location);
      formDataObj.append('description', formData.description);
      
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formDataObj.append('image', formData.imageFiles[0]);
      }
      
      await addEquipmentWithImage(formDataObj);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/owner/machines');
      }, 2000);
    } catch (error) {
      console.error('Error adding machine:', error);
      setError(error.response?.data?.message || 'Failed to add equipment. Please check your connection.');
    } finally {
      setLoading(false);
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

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden"
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)' }} />
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <FiCheckCircle className="text-3xl" style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-xl font-bold mb-2 relative" style={{ color: 'var(--text-primary)' }}>Listed Successfully!</h2>
          <p className="text-sm font-medium relative" style={{ color: 'var(--text-secondary)' }}>Your machinery has been added and is pending verification.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTool className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Add Equipment</h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>List new machinery for rent</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl mb-6 text-sm font-semibold"
            style={{ 
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
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{ 
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Equipment Name */}
              <div>
                <label htmlFor="name" className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Machinery Name</label>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-blue-500/30" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                  <FiTool style={{ color: 'var(--text-secondary)' }} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="e.g., Mahindra Arjun Nova 605"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                  <FiTruck style={{ color: 'var(--text-secondary)' }} />
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none cursor-pointer text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} style={{ backgroundColor: 'var(--bg-card)' }}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label htmlFor="rate" className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Hourly Rate (₹)</label>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-green-500/30" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                  <span className="font-bold" style={{ color: '#10b981' }}>₹</span>
                  <input
                    id="rate"
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                    min="0"
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="800"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Location</label>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-red-500/30" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                  <FiMapPin style={{ color: 'var(--text-secondary)' }} />
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    autoComplete="address-level2"
                    className="flex-1 bg-transparent outline-none text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="City, State"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
                <div className="px-4 py-3.5 rounded-2xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    autoComplete="off"
                    className="w-full bg-transparent outline-none text-sm font-medium resize-none"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="Describe technical details, condition, and accessories..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Equipment Image</label>
                <div 
                  className="border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-green-500/30"
                  style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-button)' }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 relative overflow-hidden"
                    style={{ 
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-secondary)'
                    }}
                  >
                    <FiCamera className="text-3xl" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Drop image or click to browse</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>JPG, PNG, WEBP (Max 5MB)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    name="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-5 py-2.5 rounded-xl mt-4 text-xs font-semibold cursor-pointer"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#10b981'
                    }}
                  >
                    Select Image
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-button)', border: '1px solid var(--border-secondary)' }}>
                        <FiFileText style={{ color: '#10b981' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{image}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 rounded"
                          style={{ color: '#f87171' }}
                        >
                          <FiX className="w-3 h-3" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 flex justify-end gap-3 relative" style={{ borderTop: '1px solid var(--border-secondary)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/owner/machines')}
                className="px-5 py-3 rounded-xl text-sm font-semibold"
                style={{ 
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)'
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                {loading ? (
                  <FiRefreshCw className="animate-spin relative z-10" />
                ) : (
                  <FiSave className="relative z-10" />
                )}
                <span className="relative z-10">{loading ? 'Processing...' : 'Add Equipment'}</span>
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddMachine;
