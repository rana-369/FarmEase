import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiFilter, FiSearch, FiArrowUpRight, FiMapPin, FiCreditCard, FiRefreshCw, FiX } from 'react-icons/fi';
import { getFarmerBookings } from '../../services/dashboardService';
import { cancelBooking } from '../../services/bookingService';
import { processPayment, processRefund } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

const FarmerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterRole] = useState('all');
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getFarmerBookings();
        
        const transformedBookings = (data || []).map(booking => ({
          id: booking.id || booking.Id,
          machineName: booking.machineName || booking.MachineName || 'Equipment',
          ownerName: booking.ownerName || booking.OwnerName || 'Owner',
          startDate: booking.startDate || (booking.createdAt || booking.CreatedAt)?.split('T')[0] || 'N/A',
          endDate: booking.endDate || booking.EndDate || 'N/A',
          status: booking.status || booking.Status || 'Pending',
          totalCost: booking.totalAmount || booking.TotalAmount || 0,
          createdAt: booking.createdAt || booking.CreatedAt,
          isPaid: booking.isPaid || booking.IsPaid || false,
          payment: booking.payment || booking.Payment || null,
          hasRefund: booking.payment?.refundAmount || booking.Payment?.RefundAmount || booking.payment?.RefundAmount ? true : false,
          refundAmount: booking.payment?.refundAmount || booking.Payment?.RefundAmount || booking.payment?.RefundAmount || 0,
          refundDate: booking.payment?.refundedAt || booking.Payment?.RefundedAt || booking.payment?.RefundedAt || null,
          refundReason: booking.payment?.refundReason || booking.Payment?.RefundReason || booking.payment?.RefundReason || null
        }));
        
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error fetching farmer bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handlePayment = async (booking) => {
    try {
      setPaymentLoading(booking.id);
      
      const result = await processPayment(booking.id, booking.machineName);
      
      if (result.success) {
        setBookings(prev => prev.map(b => 
          b.id === booking.id ? { ...b, status: 'Active', isPaid: true } : b
        ));
        alert("Payment successful! Your booking is now Active.");
      } else {
        alert(result.message || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleCancel = async (booking) => {
    const confirmMsg = booking.status === 'Active' || booking.isPaid
      ? "This booking has been paid. Cancelling will process a refund. Are you sure?"
      : "Are you sure you want to cancel this booking?";
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      setCancelLoading(booking.id);
      
      const result = await cancelBooking(booking.id);
      
      if (result.success) {
        setBookings(prev => prev.filter(b => b.id !== booking.id));
        setSelectedBooking(null);
        alert(result.message || "Booking cancelled successfully.");
      } else {
        alert(result.message || "Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return { icon: FiClock, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'pending': return { icon: FiClock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'completed': return { icon: FiCheckCircle, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'rejected':
      case 'cancelled': return { icon: FiXCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default: return { icon: FiClock, color: '#888888', bg: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTruck className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>My Bookings</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Track and manage your rentals</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/farmer/machines')}
            className="px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <FiTruck className="relative z-10" /> 
            <span className="relative z-10">Rent Equipment</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: bookings.length, color: '#3b82f6' },
            { label: 'Active', value: bookings.filter(b => b.status.toLowerCase() === 'active').length, color: '#10b981' },
            { label: 'Completed', value: bookings.filter(b => b.status.toLowerCase() === 'completed').length, color: '#a855f7' }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-2xl text-center relative overflow-hidden group"
              style={{ 
                background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}20`
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
              <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-green-500/30" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: 'rgba(255,255,255,0.8)' }} />
            <input 
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: 'rgba(255,255,255,0.8)' }} />
            <select 
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm font-medium"
              style={{ color: '#ffffff' }}
            >
              <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>All Statuses</option>
              <option value="pending" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Pending</option>
              <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Active</option>
              <option value="completed" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Completed</option>
              <option value="rejected" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Rejected</option>
              <option value="cancelled" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => {
              const config = getStatusConfig(booking.status);
              const Icon = config.icon;
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-5 rounded-2xl transition-all group"
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <FiTruck className="text-lg" style={{ color: '#10b981' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: '#ffffff' }}>{booking.machineName}</h3>
                          <span 
                            className="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                            style={{ 
                              background: `linear-gradient(135deg, ${config.color}20 0%, ${config.color}15 100%)`,
                              border: `1px solid ${config.color}30`,
                              color: config.color 
                            }}
                          >
                            <Icon className="w-3 h-3" />
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <FiMapPin className="flex-shrink-0" />
                          <span>Owned by {booking.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <div className="flex items-center gap-1">
                            <FiCalendar />
                            <span>{booking.startDate} - {booking.endDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock />
                            <span>#{booking.id.toString().substring(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total</p>
                        <p className="text-xl font-bold" style={{ color: '#10b981' }}>₹{booking.totalCost.toLocaleString()}</p>
                      </div>
                      
                      {booking.status === 'Accepted' && !booking.isPaid && (
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePayment(booking)}
                          disabled={paymentLoading === booking.id}
                          className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
                        >
                          {paymentLoading === booking.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <><FiCreditCard /> Pay</>
                          )}
                        </motion.button>
                      )}

                      {booking.isPaid && !booking.hasRefund && (
                        <div className="flex items-center gap-1.5 font-semibold text-xs px-3 py-2 rounded-xl" style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          color: '#10b981' 
                        }}>
                          <FiCheckCircle className="w-3 h-3" /> Paid
                        </div>
                      )}

                      {booking.hasRefund && (
                        <div className="flex items-center gap-1.5 font-semibold text-xs px-3 py-2 rounded-xl" style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          color: '#3b82f6' 
                        }}>
                          <FiRefreshCw className="w-3 h-3" /> Refunded
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#10b981', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                      >
                        Details <FiArrowUpRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16 rounded-3xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <FiPackage className="text-3xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <p className="text-sm mb-1 font-semibold" style={{ color: '#ffffff' }}>No bookings found</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBooking(null)}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>Booking Details</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedBooking(null)}
                  className="p-2.5 rounded-xl transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <FiX />
                </motion.button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Equipment', value: selectedBooking.machineName },
                  { label: 'Owner', value: selectedBooking.ownerName },
                  { label: 'Start Date', value: selectedBooking.startDate },
                  { label: 'End Date', value: selectedBooking.endDate },
                  { label: 'Total Amount', value: `₹${selectedBooking.totalCost?.toLocaleString()}`, color: '#10b981' },
                  { label: 'Booking ID', value: `#${selectedBooking.id}` }
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.label}</p>
                    <p className="text-sm font-semibold" style={{ color: item.color || '#ffffff' }}>{item.value}</p>
                  </div>
                ))}
                
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Status</p>
                  <span 
                    className="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                    style={{ 
                      background: `linear-gradient(135deg, ${getStatusConfig(selectedBooking.status).color}20 0%, ${getStatusConfig(selectedBooking.status).color}15 100%)`,
                      border: `1px solid ${getStatusConfig(selectedBooking.status).color}30`,
                      color: getStatusConfig(selectedBooking.status).color 
                    }}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                
                {selectedBooking.hasRefund && (
                  <div 
                    className="p-4 rounded-2xl relative overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100())',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)' }} />
                    <div className="flex items-center gap-2 mb-3 relative">
                      <FiRefreshCw style={{ color: '#3b82f6' }} />
                      <span className="font-semibold text-sm" style={{ color: '#3b82f6' }}>Refund Processed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm relative">
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Amount</p>
                        <p className="font-semibold" style={{ color: '#3b82f6' }}>₹{selectedBooking.refundAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Date</p>
                        <p className="font-semibold" style={{ color: '#ffffff' }}>
                          {selectedBooking.refundDate ? new Date(selectedBooking.refundDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {['Pending', 'Accepted', 'Active'].includes(selectedBooking.status) && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleCancel(selectedBooking)}
                  disabled={cancelLoading === selectedBooking.id}
                  className="w-full mt-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ 
                    color: '#f87171', 
                    border: '1px solid rgba(239, 68, 68, 0.25)', 
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                  }}
                >
                  {cancelLoading === selectedBooking.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiXCircle /> Cancel Booking
                    </>
                  )}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedBooking(null)}
                className="w-full mt-3 py-3.5 rounded-xl font-semibold text-sm"
                style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FarmerBookings;
