import api from './api';

// ==================== FARMER SERVICES ====================

// Get all available machines (for Farmers)
export const getAvailableMachines = async () => {
  const response = await api.get('/machines');
  return response.data;
};

// Get machine by ID
export const getMachineById = async (id) => {
  const response = await api.get(`/machines/${id}`);
  return response.data;
};

// Get machine categories (for filters)
export const getMachineCategories = async () => {
  const response = await api.get('/machines/categories');
  return response.data;
};

// Create booking request
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', {
    machineId: bookingData.machineId,
    machineName: bookingData.machineName,
    hours: bookingData.hours
  });
  return response.data;
};

// Get farmer's bookings
export const getFarmerBookings = async () => {
  try {
    const response = await api.get('/bookings/farmer');
    return response.data;
  } catch (error) {
    console.log('Farmer bookings endpoint not found, returning empty array');
    return [];
  }
};

// Get farmer's statistics
export const getFarmerStats = async () => {
  try {
    const response = await api.get('/bookings/farmer/stats');
    return response.data;
  } catch (error) {
    console.log('Farmer stats endpoint not found, returning default values');
    return {
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      totalSpent: 0
    };
  }
};

// ==================== OWNER SERVICES ====================

// Get owner's machines
export const getOwnerMachines = async () => {
  const response = await api.get('/machines/owner');
  return response.data;
};

// Create new machine (for Owners)
export const createMachine = async (machineData) => {
  const response = await api.post('/machines', machineData);
  return response.data;
};

// Update machine
export const updateMachine = async (id, machineData) => {
  const response = await api.put(`/machines/${id}`, machineData);
  return response.data;
};

// Delete machine
export const deleteMachine = async (id) => {
  const response = await api.delete(`/machines/${id}`);
  return response.data;
};

// Get owner's bookings (for their machines)
export const getOwnerBookings = async () => {
  try {
    const response = await api.get('/bookings/owner');
    return response.data;
  } catch (error) {
    console.log('Owner bookings endpoint not found, returning empty array');
    return [];
  }
};

// Get owner's statistics
export const getOwnerStats = async () => {
  try {
    const response = await api.get('/bookings/owner/sync-stats');
    return response.data;
  } catch (error) {
    console.log('Owner stats endpoint not found, returning default values');
    return {
      totalMachines: 0,
      activeRentals: 0,
      totalEarnings: 0,
      pendingRequests: 0
    };
  }
};

// ==================== EQUIPMENT SERVICES ====================

// Add equipment with image (multipart form)
export const addEquipmentWithImage = async (formData) => {
  const response = await api.post('/equipment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Get available equipment
export const getAvailableEquipment = async () => {
  const response = await api.get('/equipment/available');
  return response.data;
};

// Get active cities
export const getActiveCities = async () => {
  const response = await api.get('/equipment/cities');
  return response.data;
};

// ==================== EQUIPMENT CALENDAR ====================

// Get equipment availability calendar
export const getEquipmentAvailability = async (machineId, startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await api.get(`/machines/${machineId}/availability?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment availability:', error);
    return [];
  }
};

// ==================== ADMIN SERVICES ====================

// Get all users (for Admin)
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data || [];
};

// Get all machines (for Admin)
export const getAllMachines = async () => {
  const response = await api.get('/admin/machines');
  return response.data || [];
};

// Approve machine (for Admin)
export const approveMachine = async (machineId) => {
  const response = await api.post(`/admin/machines/${machineId}/approve`);
  return response.data;
};

// Reject machine (for Admin)
export const rejectMachine = async (machineId, reason) => {
  const response = await api.post(`/admin/machines/${machineId}/reject`, { reason });
  return response.data;
};

// Get all bookings (for Admin)
export const getAllBookings = async () => {
  const response = await api.get('/admin/bookings');
  return response.data || [];
};

// Get platform statistics (for Admin)
export const getAdminStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data?.Stats || response.data;
};

// Get recent activity (for Admin)
export const getAdminActivity = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data?.RecentBookings || [];
};

// Get platform analytics (for Admin)
export const getPlatformAnalytics = async () => {
  try {
    const response = await api.get('/admin/revenue');
    return response.data || {};
  } catch (error) {
    console.log('Admin analytics endpoint not found, returning empty object');
    return {};
  }
};
