import api from './api';

// Create a review for a completed booking
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', {
      bookingId: reviewData.bookingId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit review.'
    };
  }
};

// Get reviews for a specific machine (paginated)
export const getMachineReviews = async (machineId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/reviews/machine/${machineId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching machine reviews:', error);
    return { items: [], totalItems: 0, page: 1, totalPages: 0 };
  }
};

// Get rating summary for a machine
export const getMachineRatingSummary = async (machineId) => {
  try {
    const response = await api.get(`/reviews/machine/${machineId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    return {
      machineId,
      machineName: 'Unknown',
      averageRating: 0,
      totalReviews: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0
    };
  }
};

// Get reviews by the current farmer
export const getFarmerReviews = async () => {
  try {
    const response = await api.get('/reviews/farmer');
    return response.data;
  } catch (error) {
    console.error('Error fetching farmer reviews:', error);
    return [];
  }
};

// Get reviews for equipment owned by the current owner
export const getOwnerReviews = async () => {
  try {
    const response = await api.get('/reviews/owner');
    return response.data;
  } catch (error) {
    console.error('Error fetching owner reviews:', error);
    return [];
  }
};

// Check if a booking can be reviewed
export const checkReviewEligibility = async (bookingId) => {
  try {
    const response = await api.get(`/reviews/eligibility/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return {
      bookingId,
      machineId: 0,
      machineName: 'Unknown',
      canReview: false,
      reason: 'Error checking eligibility.',
      hasReviewed: false
    };
  }
};

// Get review by booking ID
export const getReviewByBookingId = async (bookingId) => {
  try {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
};

// Get all eligible bookings for review by the current farmer
export const getEligibleBookingsForReview = async () => {
  try {
    const response = await api.get('/reviews/eligible-bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching eligible bookings:', error);
    return [];
  }
};

export default {
  createReview,
  getMachineReviews,
  getMachineRatingSummary,
  getFarmerReviews,
  getOwnerReviews,
  checkReviewEligibility,
  getReviewByBookingId,
  getEligibleBookingsForReview
};
