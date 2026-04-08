import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiEye, FiCalendar, FiMapPin, FiUser, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter, FiX, FiTrendingUp } from 'react-icons/fi';
import Modal from '../../components/Modal';
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
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  const activeCount = summary.activeCount;
  const completedCount = summary.completedCount;
  const totalRevenue = summary.totalRevenue;

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Bookings</h1>
          <p className="page-subtitle-new">Manage all equipment bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="logo-icon-new"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35)'
            }}
          >
            <FiPackage />
          </motion.div>
        </div>
      </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
                className="stat-card-new"
              >
                <div className="stat-info">
                  <p className="stat-title-new">{stat.label}</p>
                  <h3 className="stat-value-new" style={{ color: stat.color }}>{stat.value}</h3>
                </div>
                <div 
                  className="stat-icon-new"
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    color: stat.color
                  }}
                >
                  <Icon />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="filters-bar-new mb-6">
          <div className="search-box-new">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine, farmer, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="filter-select-new"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="table-container-new">
          <div className="overflow-x-auto">
            <table className="data-table-new">
              <thead>
                <tr>
                  <th>Booking Details</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => {
                  const config = getStatusConfig(booking.status);
                  const Icon = config.icon;
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td>
                        <div className="flex items-start gap-3">
                          <div 
                            className="nav-item-icon"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                              color: '#10b981'
                            }}
                          >
                            <FiPackage />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {booking.machineName || 'Unknown Machine'}
                            </div>
                            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              <FiUser className="inline mr-1" />
                              {booking.farmerName || 'Unknown Farmer'}
                            </div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              Owner: {booking.ownerName || 'Unknown Owner'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">
                          {calculateDuration(booking.startDate, booking.endDate)}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold" style={{ color: '#10b981' }}>
                          ₹{(booking.totalAmount || 0).toLocaleString()}
                        </div>
                        {booking.platformFee && (
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Fee: ₹{booking.platformFee}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}25` }}>
                          <Icon className="w-3 h-3" />
                          {booking.status || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedBooking(booking)}
                          className="icon-button"
                          style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
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
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiPackage />
              </div>
              <p className="empty-state-title">No bookings found</p>
              <p className="empty-state-text">Try adjusting your search or filters</p>
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

      {/* Booking Detail Modal */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)}>
        <div className="flex items-center justify-between mb-6 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="card-title">Booking Details</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedBooking(null)}
            className="icon-button"
          >
            <FiX />
          </motion.button>
        </div>
        
        <div className="space-y-4 px-4 pb-4">
          {[
            { label: 'Machine', value: selectedBooking?.machineName || 'N/A' },
            { label: 'Farmer', value: selectedBooking?.farmerName || 'N/A' },
            { label: 'Owner', value: selectedBooking?.ownerName || 'N/A' },
            { label: 'Location', value: selectedBooking?.location || 'N/A' },
            { label: 'Duration', value: calculateDuration(selectedBooking?.startDate, selectedBooking?.endDate) },
            { label: 'Total Amount', value: `₹${(selectedBooking?.totalAmount || 0).toLocaleString()}`, color: '#10b981' },
            { label: 'Start Date', value: formatDate(selectedBooking?.startDate) },
            { label: 'End Date', value: formatDate(selectedBooking?.endDate) }
          ].map((item) => (
            <div key={item.label}>
              <p className="input-label">{item.label}</p>
              <p className="font-semibold" style={{ color: item.color || '#ffffff' }}>{item.value}</p>
            </div>
          ))}
          
          <div>
            <p className="input-label">Status</p>
            <span 
              className="badge"
              style={{ 
                background: getStatusConfig(selectedBooking?.status).bg,
                border: `1px solid ${getStatusConfig(selectedBooking?.status).color}25`,
                color: getStatusConfig(selectedBooking?.status).color 
              }}
            >
              {selectedBooking?.status || 'Unknown'}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingsManagement;
