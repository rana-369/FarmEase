import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiEye, FiCalendar, FiMapPin, FiUser, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter, FiX, FiTrendingUp } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getAllBookings } from '../../services/dashboardService';
import Pagination from '../../components/Pagination';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [summary, setSummary] = useState({ activeCount: 0, completedCount: 0, totalRevenue: 0 });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllBookings(currentPage, itemsPerPage, searchTerm, filterStatus);
      setBookings(response.bookings || response.items || []);
      setTotalItems(response.totalItems || 0);
      setTotalPages(response.totalPages || 1);
      if (response.summary) {
        setSummary({
          activeCount: response.summary.activeCount || response.summary.ActiveCount || 0,
          completedCount: response.summary.completedCount || response.summary.CompletedCount || 0,
          totalRevenue: response.summary.totalRevenue || response.summary.TotalRevenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'active': return { icon: FiClock, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'pending': return { icon: FiClock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'cancelled': return { icon: FiXCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default: return { icon: FiClock, color: '#888888', bg: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const activeCount = summary.activeCount;
  const completedCount = summary.completedCount;
  const totalRevenue = summary.totalRevenue;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
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
              <FiPackage className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Bookings</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage all equipment bookings</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active', value: activeCount, color: '#3b82f6', icon: FiClock },
            { label: 'Completed', value: completedCount, color: '#10b981', icon: FiCheckCircle },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: '#f59e0b', icon: FiTrendingUp }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
                <div className="flex items-center justify-between mb-2 relative">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <Icon className="text-lg" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-blue-500/30" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: 'rgba(255,255,255,0.8)' }} />
            <input
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine, farmer, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: 'rgba(255,255,255,0.8)' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm font-medium"
              style={{ color: '#ffffff' }}
            >
              <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>All Status</option>
              <option value="pending" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Pending</option>
              <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Active</option>
              <option value="completed" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Completed</option>
              <option value="cancelled" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="rounded-3xl overflow-hidden relative" style={{ 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }} />
          <div className="overflow-x-auto relative">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Booking Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
                {bookings.map((booking, index) => {
                  const config = getStatusConfig(booking.status);
                  const Icon = config.icon;
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <FiPackage className="text-sm" style={{ color: '#10b981' }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                              {booking.machineName || 'Unknown Machine'}
                            </div>
                            <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              <FiUser className="inline mr-1" />
                              {booking.farmerName || 'Unknown Farmer'}
                            </div>
                            <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              Owner: {booking.ownerName || 'Unknown Owner'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                          {calculateDuration(booking.startDate, booking.endDate)}
                        </div>
                        <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold" style={{ color: '#10b981' }}>
                          ₹{(booking.totalAmount || 0).toLocaleString()}
                        </div>
                        {booking.platformFee && (
                          <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Fee: ₹{booking.platformFee}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                          style={{ 
                            background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg} 100%)`,
                            border: `1px solid ${config.color}25`,
                            color: config.color 
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {booking.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2.5 rounded-xl"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            color: '#10b981' 
                          }}
                        >
                          <FiEye className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {bookings.length === 0 && (
            <div className="text-center py-12 relative">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <FiPackage className="text-4xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>No bookings found</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setSelectedBooking(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)' }} />
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Booking Details</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255,255,255,0.6)' 
                }}
              >
                <FiX />
              </motion.button>
            </div>
            
            <div className="space-y-4 relative">
              {[
                { label: 'Machine', value: selectedBooking.machineName || 'N/A' },
                { label: 'Farmer', value: selectedBooking.farmerName || 'N/A' },
                { label: 'Owner', value: selectedBooking.ownerName || 'N/A' },
                { label: 'Location', value: selectedBooking.location || 'N/A' },
                { label: 'Duration', value: calculateDuration(selectedBooking.startDate, selectedBooking.endDate) },
                { label: 'Total Amount', value: `₹${(selectedBooking.totalAmount || 0).toLocaleString()}`, color: '#10b981' },
                { label: 'Start Date', value: formatDate(selectedBooking.startDate) },
                { label: 'End Date', value: formatDate(selectedBooking.endDate) }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.label}</p>
                  <p className="text-sm font-semibold" style={{ color: item.color || '#ffffff' }}>{item.value}</p>
                </div>
              ))}
              
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Status</p>
                <span 
                  className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                  style={{ 
                    background: `linear-gradient(135deg, ${getStatusConfig(selectedBooking.status).bg} 0%, ${getStatusConfig(selectedBooking.status).bg} 100%)`,
                    border: `1px solid ${getStatusConfig(selectedBooking.status).color}25`,
                    color: getStatusConfig(selectedBooking.status).color 
                  }}
                >
                  {selectedBooking.status || 'Unknown'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BookingsManagement;
