import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiFilter, FiEye, FiCalendar, FiMapPin, FiUser, FiDollarSign, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { getAllBookings } from '../../services/dashboardService';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.machineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'active': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'pending': return { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.3)' };
      case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#a1a1a1', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'active': return <FiClock className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'cancelled': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
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
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const activeCount = bookings.filter(b => b.status?.toLowerCase() === 'active').length;
  const completedCount = bookings.filter(b => b.status?.toLowerCase() === 'completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div className="p-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Bookings Management</h1>
            <p style={{ color: '#a1a1a1' }}>Monitor and manage all equipment bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              {activeCount} Active
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              {completedCount} Completed
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'rgba(251, 191, 36, 0.1)', 
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.2)'
            }}>
              ₹{totalRevenue.toLocaleString()} Revenue
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3" style={{ color: '#666666' }} />
            <input
              id="booking-search"
              type="text"
              placeholder="Search bookings by machine, farmer, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg"
              autoComplete="off"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-3" style={{ color: '#666666' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="pl-10 pr-4 py-3 rounded-lg appearance-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="p-8">
        <div className="rounded-2xl overflow-hidden" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Booking Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a1a1a1' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                {filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-opacity-50 transition-colors"
                    style={{ hover: { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ 
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                          <FiPackage className="text-sm" style={{ color: '#22c55e' }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#ffffff' }}>
                            {booking.machineName || 'Unknown Machine'}
                          </div>
                          <div className="text-sm" style={{ color: '#666666' }}>
                            <FiUser className="inline mr-1" />
                            {booking.farmerName || 'Unknown Farmer'}
                          </div>
                          <div className="text-sm" style={{ color: '#666666' }}>
                            Owner: {booking.ownerName || 'Unknown Owner'}
                          </div>
                          <div className="text-xs" style={{ color: '#666666' }}>
                            <FiMapPin className="inline mr-1" />
                            {booking.location || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#a1a1a1' }}>
                      <div>
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          {calculateDuration(booking.startDate, booking.endDate)}
                        </div>
                        <div className="text-xs mt-1">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: '#ffffff' }}>
                        ₹{(booking.totalAmount || 0).toLocaleString()}
                      </div>
                      {booking.platformFee && (
                        <div className="text-xs" style={{ color: '#666666' }}>
                          Platform fee: ₹{booking.platformFee}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border" style={{
                        backgroundColor: getStatusColor(booking.status).bg,
                        color: getStatusColor(booking.status).text,
                        borderColor: getStatusColor(booking.status).border
                      }}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'}
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <FiPackage className="mx-auto text-4xl mb-4" style={{ color: '#666666' }} />
              <p style={{ color: '#a1a1a1' }}>No bookings found matching your criteria</p>
            </div>
          )}
        </div>
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
            className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Machine</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>{selectedBooking.machineName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Farmer</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>{selectedBooking.farmerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Owner</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>{selectedBooking.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Location</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>{selectedBooking.location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Duration</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  {calculateDuration(selectedBooking.startDate, selectedBooking.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Total Amount</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  ₹{(selectedBooking.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Status</p>
                <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border" style={{
                  backgroundColor: getStatusColor(selectedBooking.status).bg,
                  color: getStatusColor(selectedBooking.status).text,
                  borderColor: getStatusColor(selectedBooking.status).border
                }}>
                  {getStatusIcon(selectedBooking.status)}
                  <span className="ml-1">{selectedBooking.status || 'Unknown'}</span>
                </span>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Created</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  {formatDate(selectedBooking.createdAt || selectedBooking.created_at)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Start Date</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  {formatDate(selectedBooking.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>End Date</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  {formatDate(selectedBooking.endDate)}
                </p>
              </div>
            </div>
            {selectedBooking.platformFee && (
              <div className="mt-4">
                <p className="text-sm mb-1" style={{ color: '#a1a1a1' }}>Platform Fee</p>
                <p className="font-medium" style={{ color: '#ffffff' }}>
                  ₹{selectedBooking.platformFee}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BookingsManagement;
