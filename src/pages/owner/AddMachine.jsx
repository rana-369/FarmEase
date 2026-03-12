import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiCamera, FiMapPin, FiDollarSign, FiFileText, FiSave, FiX, FiRefreshCw } from 'react-icons/fi';
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
    imageFiles: [] // Store actual File objects for upload
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

    // Validation
    if (!formData.name || !formData.rate || !formData.location) {
      setError('Equipment name, hourly rate, and location are required');
      setLoading(false);
      return;
    }

    try {
      // Use multipart form upload for everything to handle the image
      const formDataObj = new FormData();
      formDataObj.append('Name', formData.name);
      formDataObj.append('Type', formData.category);
      formDataObj.append('Rate', parseInt(formData.rate));
      formDataObj.append('Location', formData.location);
      formDataObj.append('Description', formData.description);
      
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formDataObj.append('Image', formData.imageFiles[0]);
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
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-3xl max-w-md w-full text-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid #22c55e'
          }}>
            <FiTruck className="text-4xl" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Listed Successfully!</h2>
          <p className="text-lg leading-relaxed" style={{ color: '#a1a1a1' }}>Your machinery has been added to your fleet and is now pending verification.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">List New Equipment</h1>
            <p className="text-lg text-gray-400">Expand your rental fleet with high-quality machinery</p>
          </div>
          <div className="px-6 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>Enterprise</span>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl font-bold text-center"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 rounded-3xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Equipment Name */}
              <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Machinery Name</label>
                <div className="relative">
                  <FiTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    placeholder="e.g., Mahindra Arjun Nova 605"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label htmlFor="category" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Type / Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-xl text-white outline-none cursor-pointer"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  {categories.map(category => (
                    <option key={category} value={category} style={{ backgroundColor: '#1a1a1a' }}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-3">
                <label htmlFor="rate" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Hourly Rate (₹)</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                  <input
                    id="rate"
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    placeholder="800"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label htmlFor="location" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Current Location</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    placeholder="City, State"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 md:col-span-2">
                <label htmlFor="description" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Full Description</label>
                <div className="relative">
                  <FiFileText className="absolute left-4 top-6 text-green-500" />
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white outline-none focus:border-green-500 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    placeholder="Describe technical details, condition, and any accessories included..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Equipment Media</label>
                <div 
                  className="border-2 border-dashed rounded-3xl p-10 text-center transition-all hover:border-green-500/50 group"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <FiCamera className="text-5xl mx-auto mb-4 text-gray-700 group-hover:text-green-500 transition-colors" />
                  <p className="text-lg font-medium text-gray-400 mb-6">Drop images here or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-block px-10 py-4 rounded-2xl font-bold transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  >
                    Select Images
                  </label>
                </div>

                {/* Media Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group p-4 rounded-2xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div className="flex flex-col items-center gap-3">
                          <FiTruck className="text-3xl text-gray-600" />
                          <p className="text-[10px] text-gray-500 truncate w-full text-center">{image}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white shadow-lg transform scale-0 group-hover:scale-100 transition-all"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t flex justify-end gap-5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                type="button"
                onClick={() => navigate('/owner/machines')}
                className="px-10 py-4 rounded-2xl font-bold text-gray-400 hover:text-white transition-all bg-white/5 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: '#22c55e', 
                  color: '#000000',
                  boxShadow: '0 15px 35px rgba(34, 197, 94, 0.2)'
                }}
              >
                {loading ? (
                  <FiRefreshCw className="animate-spin text-xl" />
                ) : (
                  <FiSave className="text-xl" />
                )}
                {loading ? 'Processing...' : 'Deploy Machinery'}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddMachine;
