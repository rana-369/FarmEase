import api from './api';

// Get all bookings (admin)
export const getBookings = async () => {
  const response = await api.get('/bookings/admin/all');
  return response.data;
};

// Get farmer's bookings
export const getFarmerBookings = async () => {
  const response = await api.get('/bookings/farmer');
  return response.data;
};

// Get owner's bookings
export const getOwnerBookings = async () => {
  const response = await api.get('/bookings/owner');
  return response.data;
};

// Create new booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', {
    machineId: bookingData.machineId,
    machineName: bookingData.machineName,
    hours: bookingData.hours,
    scheduledDate: bookingData.scheduledDate || null,
    scheduledTime: bookingData.scheduledTime || null
  });
  return response.data;
};

// Update booking status (owner)
export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.put(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

// Accept booking (owner)
export const acceptBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/accept`);
  return response.data;
};

// Reject booking (owner)
export const rejectBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/reject`);
  return response.data;
};

// Complete booking (owner)
export const completeBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/complete`);
  return response.data;
};

// Cancel booking (farmer)
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}/cancel`);
    return { success: true, message: response.data?.message || response.data?.Message || 'Booking cancelled successfully.' };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.response?.data?.Message || 'Failed to cancel booking.' 
    };
  }
};

// Pay for booking (farmer)
export const payBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/pay`);
  return response.data;
};

// Get farmer stats
export const getFarmerStats = async () => {
  const response = await api.get('/bookings/farmer/stats');
  return response.data;
};

// Get owner stats
export const getOwnerStats = async () => {
  const response = await api.get('/bookings/owner/sync-stats');
  return response.data;
};
