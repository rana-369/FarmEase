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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0a0a0a' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl max-w-md w-full text-center"
          style={{ 
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
          >
            <FiCheckCircle className="text-3xl" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Listed Successfully!</h2>
          <p className="text-sm" style={{ color: '#888888' }}>Your machinery has been added and is pending verification.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiTool className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Add Equipment</h1>
              <p className="text-sm" style={{ color: '#666666' }}>List new machinery for rent</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl mb-6 text-sm"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipment Name */}
              <div>
                <label htmlFor="name" className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Machinery Name</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <FiTool style={{ color: '#666666' }} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#ffffff' }}
                    placeholder="e.g., Mahindra Arjun Nova 605"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Category</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <FiTruck style={{ color: '#666666' }} />
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none cursor-pointer text-sm"
                    style={{ color: '#ffffff' }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} style={{ backgroundColor: '#1a1a1a' }}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label htmlFor="rate" className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Hourly Rate (₹)</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: '#22c55e' }}>₹</span>
                  <input
                    id="rate"
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                    min="0"
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#ffffff' }}
                    placeholder="800"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Location</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <FiMapPin style={{ color: '#666666' }} />
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    autoComplete="address-level2"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#ffffff' }}
                    placeholder="City, State"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Description</label>
                <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    autoComplete="off"
                    className="w-full bg-transparent outline-none text-sm resize-none"
                    style={{ color: '#ffffff' }}
                    placeholder="Describe technical details, condition, and accessories..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Equipment Image</label>
                <div 
                  className="border border-dashed rounded-xl p-8 text-center cursor-pointer"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <FiCamera className="text-3xl mx-auto mb-3" style={{ color: '#333333' }} />
                  <p className="text-sm mb-1" style={{ color: '#ffffff' }}>Drop image or click to browse</p>
                  <p className="text-xs" style={{ color: '#666666' }}>JPG, PNG, WEBP (Max 5MB)</p>
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
                    className="inline-block px-4 py-2 rounded-lg mt-4 text-xs font-medium cursor-pointer"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                  >
                    Select Image
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <FiFileText style={{ color: '#22c55e' }} />
                        <span className="text-xs" style={{ color: '#888888' }}>{image}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 rounded"
                          style={{ color: '#ef4444' }}
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 flex justify-end gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/owner/machines')}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: '#22c55e', color: '#000000' }}
              >
                {loading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiSave />
                )}
                {loading ? 'Processing...' : 'Add Equipment'}
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddMachine;
