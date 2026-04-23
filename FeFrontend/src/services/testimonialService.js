import api from './api';

// Get active testimonials (public - for landing page)
export const getActiveTestimonials = async () => {
  try {
    const response = await api.get('/testimonials');
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

// Get all testimonials (admin only)
export const getAllTestimonials = async () => {
  try {
    const response = await api.get('/testimonials/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    return [];
  }
};

// Get pending testimonials (admin only - low ratings needing approval)
export const getPendingTestimonials = async () => {
  try {
    const response = await api.get('/testimonials/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending testimonials:', error);
    return [];
  }
};

// Create testimonial (admin only)
export const createTestimonial = async (testimonialData) => {
  try {
    const response = await api.post('/testimonials', testimonialData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create testimonial.'
    };
  }
};

// Submit testimonial (authenticated users)
export const submitTestimonial = async (testimonialData) => {
  try {
    const response = await api.post('/testimonials/submit', testimonialData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit testimonial.'
    };
  }
};

// Update testimonial (admin only)
export const updateTestimonial = async (id, testimonialData) => {
  try {
    const response = await api.put(`/testimonials/${id}`, testimonialData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update testimonial.'
    };
  }
};

// Delete testimonial (admin only)
export const deleteTestimonial = async (id) => {
  try {
    await api.delete(`/testimonials/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete testimonial.'
    };
  }
};

// Toggle testimonial active status (admin only)
export const toggleTestimonialActive = async (id) => {
  try {
    const response = await api.patch(`/testimonials/${id}/toggle-active`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to toggle testimonial status.'
    };
  }
};

// Approve testimonial (admin only - for low ratings)
export const approveTestimonial = async (id) => {
  try {
    const response = await api.patch(`/testimonials/${id}/approve`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to approve testimonial.'
    };
  }
};

export default {
  getActiveTestimonials,
  getAllTestimonials,
  getPendingTestimonials,
  createTestimonial,
  submitTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
  approveTestimonial
};
