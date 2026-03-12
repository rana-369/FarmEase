import api from './api';

// Get all bookings
export const getBookings = async () => {
  const response = await api.get('/bookings');
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
    ownerId: bookingData.ownerId,
    hours: bookingData.hours,
    baseAmount: bookingData.baseAmount,
    platformFee: bookingData.platformFee,
    totalAmount: bookingData.totalAmount
  });
  return response.data;
};

// Update booking status (owner)
export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.put(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/cancel`);
  return response.data;
};
