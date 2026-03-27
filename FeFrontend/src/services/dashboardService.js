import api from './api';

// ==================== FARMER DASHBOARD ====================

// Get farmer's booking statistics
export const getFarmerStats = async () => {
  try {
    const response = await api.get('bookings/farmer/stats');
    const data = response.data || {};
    return {
      totalBookings: data.totalBookings ?? data.TotalBookings ?? 0,
      activeBookings: data.activeBookings ?? data.ActiveBookings ?? 0,
      completedBookings: data.completedBookings ?? data.CompletedBookings ?? 0,
      totalSpent: data.totalSpent ?? data.TotalSpent ?? 0
    };
  } catch (error) {
    console.error('Error fetching farmer stats:', error);
    return {
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      totalSpent: 0
    };
  }
};

// Get farmer's recent bookings
export const getFarmerBookings = async () => {
  try {
    const response = await api.get('bookings/farmer');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching farmer bookings:', error);
    return [];
  }
};

// ==================== OWNER DASHBOARD ====================

// Get owner's equipment statistics
export const getOwnerStats = async () => {
  try {
    const response = await api.get('bookings/owner/sync-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    return null;
  }
};

// Get owner's equipment list
export const getOwnerEquipment = async () => {
  try {
    const response = await api.get('machines/owner');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching owner equipment:', error.response?.data || error.message);
    return [];
  }
};

// Get owner's recent activity (bookings)
export const getOwnerActivity = async () => {
  try {
    const response = await api.get('bookings/owner');
    return response.data;
  } catch (error) {
    console.log('Owner activity endpoint not found, returning empty array');
    return [];
  }
};

// ==================== ADMIN DASHBOARD ====================

// Get platform statistics and activity (for Admin)
export const getAdminDashboardData = async () => {
  try {
    const response = await api.get('admin/dashboard');
    console.log('Full Admin Dashboard Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return null;
  }
};

// Get platform statistics (for Admin) - DEPRECATED, use getAdminDashboardData
export const getAdminStats = async () => {
  return await getAdminDashboardData();
};

// Get revenue data
export const getRevenueData = async () => {
  try {
    const response = await api.get('admin/revenue');
    return response.data || [];
  } catch {
    return [];
  }
};

// Get pending approvals
export const getPendingApprovals = async () => {
  const response = await api.get('admin/dashboard');
  return response.data?.Stats?.PendingApprovals || 0;
};

// Get all users with pagination
export const getAllUsers = async (page = 1, limit = 10, search = '', role = 'all') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role !== 'all' && { role })
    });
    const response = await api.get(`admin/users?${params}`);
    return {
      users: response.data?.users || response.data || [],
      totalItems: response.data?.totalItems || response.data?.length || 0,
      totalPages: response.data?.totalPages || 1,
      currentPage: response.data?.currentPage || page
    };
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    return { users: [], totalItems: 0, totalPages: 1, currentPage: 1 };
  }
};

// Get all machines for approval with pagination
export const getAllMachines = async (page = 1, limit = 10, search = '', status = 'all') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status !== 'all' && { status })
    });
    const response = await api.get(`admin/machines?${params}`);
    return {
      machines: response.data?.machines || response.data || [],
      totalItems: response.data?.totalItems || response.data?.length || 0,
      totalPages: response.data?.totalPages || 1,
      currentPage: response.data?.currentPage || page
    };
  } catch (error) {
    console.error('Error fetching machines:', error.response?.data || error.message);
    return { machines: [], totalItems: 0, totalPages: 1, currentPage: 1 };
  }
};

// Approve machine
export const approveMachine = async (machineId) => {
  const response = await api.post(`admin/machines/${machineId}/approve`);
  return response.data;
};

// Reject machine
export const rejectMachine = async (machineId, reason) => {
  const response = await api.post(`admin/machines/${machineId}/reject`, { reason });
  return response.data;
};

// Get all bookings with pagination
export const getAllBookings = async (page = 1, limit = 10, search = '', status = 'all') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status !== 'all' && { status })
    });
    const response = await api.get(`admin/bookings?${params}`);
    console.log('Admin bookings response:', response.data);
    return {
      bookings: response.data?.items || response.data?.bookings || response.data || [],
      totalItems: response.data?.totalItems || response.data?.length || 0,
      totalPages: response.data?.totalPages || 1,
      currentPage: response.data?.currentPage || page,
      summary: response.data?.summary || null
    };
  } catch (error) {
    console.error('Error fetching admin bookings:', error.response?.data || error.message);
    return { bookings: [], totalItems: 0, totalPages: 1, currentPage: 1, summary: null };
  }
};

// Get platform analytics
export const getPlatformAnalytics = async () => {
  const response = await api.get('admin/revenue');
  return response.data || {};
};

// ==================== LANDING PAGE (PUBLIC) ====================

// Get public platform statistics
export const getPublicStats = async () => {
  try {
    const [machinesResponse, farmersResponse, ownersResponse] = await Promise.all([
      api.get('machines').catch(() => ({ data: [] })),
      api.get('users/farmers').catch(() => ({ data: [] })),
      api.get('users/owners').catch(() => ({ data: [] }))
    ]);
    
    const machines = machinesResponse.data || [];
    const farmers = farmersResponse.data || [];
    const owners = ownersResponse.data || [];
    
    return {
      totalUsers: farmers.length + owners.length,
      totalMachines: machines.length,
      totalBookings: 0,
      averageRating: 4.5
    };
  } catch {
    return null;
  }
};

// Get featured equipment (uses public machines endpoint)
export const getFeaturedEquipment = async () => {
  try {
    const response = await api.get('machines');
    const machines = response.data || [];
    
    return machines
      .filter(m => m.status === 'Active' || m.status === 'Verified')
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        name: m.name,
        location: m.location || 'Location not specified',
        pricePerHour: m.rate || m.pricePerHour,
        isAvailable: true
      }));
  } catch {
    return [];
  }
};

// Get testimonials (static - no backend endpoint)
export const getTestimonials = async () => {
  return [];
};
