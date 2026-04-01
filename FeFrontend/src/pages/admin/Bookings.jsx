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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const activeCount = summary.activeCount;
  const completedCount = summary.completedCount;
  const totalRevenue = summary.totalRevenue;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
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
              <FiPackage className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Bookings</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Manage all equipment bookings</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active', value: activeCount, color: '#3b82f6', icon: FiClock },
            { label: 'Completed', value: completedCount, color: '#22c55e', icon: FiCheckCircle },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: '#f59e0b', icon: FiTrendingUp }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-5 rounded-xl"
                style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="text-lg" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#888888' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: '#666666' }} />
            <input
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine, farmer, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: '#666666' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm"
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
        <div className="rounded-2xl overflow-hidden" style={{ 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Booking Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#666666' }}>
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
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                          >
                            <FiPackage className="text-sm" style={{ color: '#22c55e' }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#ffffff' }}>
                              {booking.machineName || 'Unknown Machine'}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#666666' }}>
                              <FiUser className="inline mr-1" />
                              {booking.farmerName || 'Unknown Farmer'}
                            </div>
                            <div className="text-xs" style={{ color: '#666666' }}>
                              Owner: {booking.ownerName || 'Unknown Owner'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: '#ffffff' }}>
                          {calculateDuration(booking.startDate, booking.endDate)}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#666666' }}>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" style={{ color: '#22c55e' }}>
                          ₹{(booking.totalAmount || 0).toLocaleString()}
                        </div>
                        {booking.platformFee && (
                          <div className="text-xs" style={{ color: '#666666' }}>
                            Fee: ₹{booking.platformFee}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          <Icon className="w-3 h-3" />
                          {booking.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
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
            <div className="text-center py-12">
              <FiPackage className="mx-auto text-4xl mb-4" style={{ color: '#333333' }} />
              <p className="text-sm" style={{ color: '#666666' }}>No bookings found</p>
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
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setSelectedBooking(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Booking Details</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
              >
                <FiX />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Machine', value: selectedBooking.machineName || 'N/A' },
                { label: 'Farmer', value: selectedBooking.farmerName || 'N/A' },
                { label: 'Owner', value: selectedBooking.ownerName || 'N/A' },
                { label: 'Location', value: selectedBooking.location || 'N/A' },
                { label: 'Duration', value: calculateDuration(selectedBooking.startDate, selectedBooking.endDate) },
                { label: 'Total Amount', value: `₹${(selectedBooking.totalAmount || 0).toLocaleString()}`, color: '#22c55e' },
                { label: 'Start Date', value: formatDate(selectedBooking.startDate) },
                { label: 'End Date', value: formatDate(selectedBooking.endDate) }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs mb-1" style={{ color: '#666666' }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: item.color || '#ffffff' }}>{item.value}</p>
                </div>
              ))}
              
              <div>
                <p className="text-xs mb-1" style={{ color: '#666666' }}>Status</p>
                <span 
                  className="px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                  style={{ backgroundColor: getStatusConfig(selectedBooking.status).bg, color: getStatusConfig(selectedBooking.status).color }}
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
