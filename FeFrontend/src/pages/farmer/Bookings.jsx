import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiFilter, FiSearch, FiArrowUpRight, FiMapPin, FiCreditCard, FiRefreshCw, FiX, FiStar, FiKey } from 'react-icons/fi';
import Modal from '../../components/Modal';
import { getFarmerBookings } from '../../services/dashboardService';
import { cancelBooking } from '../../services/bookingService';
import { processPayment, processRefund } from '../../services/paymentService';
import { checkReviewEligibility, getReviewByBookingId } from '../../services/reviewService';
import ReviewForm from '../../components/ReviewForm';
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [bookingReview, setBookingReview] = useState(null);

  const formatTime = (time) => {
    if (!time || !time.includes(':')) return time;
    const [hours] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getFarmerBookings();
        
        const transformedBookings = (data || []).map(booking => ({
          id: booking.id || booking.Id,
          machineId: booking.machineId || booking.MachineId || 0,
          machineName: booking.machineName || booking.MachineName || 'Equipment',
          ownerName: booking.ownerName || booking.OwnerName || 'Owner',
          scheduledDate: booking.scheduledDate || booking.ScheduledDate || null,
          scheduledTime: booking.scheduledTime || booking.ScheduledTime || null,
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
          refundReason: booking.payment?.refundReason || booking.Payment?.RefundReason || booking.payment?.RefundReason || null,
          hasReviewed: booking.hasReviewed || booking.HasReviewed || false,
          arrivalOtp: booking.arrivalOtp || booking.ArrivalOtp || null,
          workStartOtp: booking.workStartOtp || booking.WorkStartOtp || null
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

  useEffect(() => {
    const fetchReview = async () => {
      if (selectedBooking?.hasReviewed && selectedBooking?.id) {
        const review = await getReviewByBookingId(selectedBooking.id);
        setBookingReview(review);
      } else {
        setBookingReview(null);
      }
    };
    fetchReview();
  }, [selectedBooking]);

  const handlePayment = async (booking) => {
    try {
      setPaymentLoading(booking.id);
      
      const result = await processPayment(booking.id, booking.machineName);
      
      if (result.success) {
        setBookings(prev => prev.map(b => 
          b.id === booking.id ? { ...b, status: 'Paid', isPaid: true } : b
        ));
        alert("Payment successful! Booking settled.");
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
      const errorMsg = error.response?.data?.message || error.response?.data?.Message || error.message || "Failed to cancel booking. Please try again.";
      alert(errorMsg);
    } finally {
      setCancelLoading(null);
    }
  };

  const handleReview = async (booking) => {
    try {
      const eligibility = await checkReviewEligibility(booking.id);
      setReviewEligibility(eligibility);
      
      if (eligibility && eligibility.canReview) {
        setReviewBooking(booking);
        setShowReviewForm(true);
        setSelectedBooking(null); // Close the details modal
      } else {
        // Update the booking's hasReviewed status if it was returned
        if (eligibility?.hasReviewed) {
          setBookings(prev => prev.map(b => 
            b.id === booking.id ? { ...b, hasReviewed: true } : b
          ));
          setSelectedBooking(prev => prev ? { ...prev, hasReviewed: true } : prev);
        }
        alert(eligibility?.reason || 'You cannot review this booking.');
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      alert('Failed to check review eligibility. Please try again.');
    }
  };

  const handleReviewSuccess = async () => {
    setBookings(prev => prev.map(b => 
      b.id === reviewBooking?.id ? { ...b, hasReviewed: true } : b
    ));
    // Fetch the new review to display
    if (reviewBooking?.id) {
      const review = await getReviewByBookingId(reviewBooking.id);
      setBookingReview(review);
      setSelectedBooking(prev => prev ? { ...prev, hasReviewed: true } : prev);
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
      case 'pending': return { icon: FiClock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'accepted': return { icon: FiCheckCircle, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'arrived': return { icon: FiMapPin, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'inprogress': return { icon: FiTruck, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'completed': return { icon: FiCheckCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'paid': return { icon: FiCheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'rejected':
      case 'cancelled': return { icon: FiXCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default: return { icon: FiClock, color: '#888888', bg: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">My Bookings</h1>
          <p className="page-subtitle-new">Track and manage your rentals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/farmer/machines')}
          className="primary-button flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <FiTruck /> 
          <span>Rent Equipment</span>
        </motion.button>
      </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total', value: bookings.length, color: '#3b82f6' },
            { label: 'In Progress', value: bookings.filter(b => ['accepted', 'arrived', 'inprogress'].includes(b.status?.toLowerCase() || '')).length, color: '#10b981' },
            { label: 'Settled', value: bookings.filter(b => b.status?.toLowerCase() === 'paid' || b.isPaid).length, color: '#a855f7' }
          ].map((stat, index) => (
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
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-bar-new mb-6">
          <div className="search-box-new">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input 
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            <select 
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              className="filter-select-new"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="arrived">Arrived</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
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
                  className="card"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="nav-item-icon"
                        style={{ 
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981'
                        }}
                      >
                        <FiTruck />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1" style={{ minWidth: 0 }}>
                          <h3 className="card-title">{booking.machineName}</h3>
                          <span
                            className="badge"
                            style={{
                              background: `${config.color}20`,
                              color: config.color,
                              flexShrink: 0
                            }}
                          >
                            <Icon style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <FiMapPin className="flex-shrink-0" />
                          <span>Owned by {booking.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex items-center gap-1">
                            <FiCalendar />
                            <span>
                              {booking.scheduledDate
                                ? new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : booking.startDate}
                              {booking.scheduledTime && ` at ${formatTime(booking.scheduledTime)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock />
                            <span>#{booking.id.toString().substring(0, 8)}</span>
                          </div>
                        </div>

                        {/* OTP Display for Accepted/Arrived status - OTP generated at booking creation */}
                        {booking.status === 'Accepted' && booking.arrivalOtp && (
                          <div
                            className="mt-3 p-3 rounded-lg flex items-center gap-3"
                            style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                          >
                            <FiKey className="text-lg" style={{ color: '#3b82f6' }} />
                            <div>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Arrival OTP (share with owner when they arrive):</p>
                              <p className="text-2xl font-bold tracking-widest" style={{ color: '#3b82f6' }}>{booking.arrivalOtp}</p>
                            </div>
                          </div>
                        )}

                        {booking.status === 'Arrived' && booking.workStartOtp && (
                          <div
                            className="mt-3 p-3 rounded-lg flex items-center gap-3"
                            style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                          >
                            <FiKey className="text-lg" style={{ color: '#a855f7' }} />
                            <div>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Work Start OTP (share with owner to begin work):</p>
                              <p className="text-2xl font-bold tracking-widest" style={{ color: '#a855f7' }}>{booking.workStartOtp}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div>
                        <p className="input-label">Total</p>
                        <p className="text-xl font-bold" style={{ color: '#10b981' }}>Rs.{booking.totalCost.toLocaleString()}</p>
                      </div>
                      
                      {/* NEW FLOW: Payment only after work is completed */}
                      {booking.status === 'Completed' && !booking.isPaid && !booking.payment && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePayment(booking)}
                          disabled={paymentLoading === booking.id}
                          className="primary-button flex items-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                          {paymentLoading === booking.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <><FiCreditCard /> Pay Now</>
                          )}
                        </motion.button>
                      )}

                      {/* Show Paid badge if payment exists or status is Paid */}
                      {(booking.isPaid || booking.payment || booking.status === 'Paid') && !booking.hasRefund && (
                        <div className="badge" style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981'
                        }}>
                          <FiCheckCircle className="w-3 h-3" /> Paid
                        </div>
                      )}

                      {booking.hasRefund && (
                        <div className="badge" style={{ 
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6' 
                        }}>
                          <FiRefreshCw className="w-3 h-3" /> Refunded
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedBooking(booking)}
                        className="secondary-button flex items-center gap-2"
                      >
                        Details <FiArrowUpRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiPackage />
              </div>
              <p className="empty-state-title">No bookings found</p>
              <p className="empty-state-text">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)}>
          <div className="flex items-center justify-between mb-4 p-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <h2 className="card-title">Booking Details</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedBooking(null)}
              className="icon-button"
            >
              <FiX />
            </motion.button>
          </div>

          <div className="space-y-3 px-4">
            {[
              { label: 'Equipment', value: selectedBooking?.machineName },
              { label: 'Owner', value: selectedBooking?.ownerName },
              { label: 'Start Date', value: selectedBooking?.startDate },
              { label: 'End Date', value: selectedBooking?.endDate },
              { label: 'Total Amount', value: `Rs.${selectedBooking?.totalCost?.toLocaleString()}`, color: '#10b981' },
              { label: 'Booking ID', value: `#${selectedBooking?.id}` }
            ].map((item) => (
              <div key={item.label}>
                <p className="input-label">{item.label}</p>
                <p className="font-semibold" style={{ color: item.color || 'var(--text-primary)' }}>{item.value}</p>
              </div>
            ))}
            
            <div>
              <p className="input-label">Status</p>
              <span 
                className="badge"
                style={{ 
                  background: `${getStatusConfig(selectedBooking?.status).color}20`,
                  color: getStatusConfig(selectedBooking?.status).color 
                }}
              >
                {selectedBooking?.status}
              </span>
            </div>
            
            {selectedBooking?.hasRefund && (
              <div 
                className="p-3"
                style={{ 
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FiRefreshCw style={{ color: '#3b82f6' }} />
                  <span className="font-semibold text-sm" style={{ color: '#3b82f6' }}>Refund Processed</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="input-label">Amount</p>
                    <p className="font-semibold" style={{ color: '#3b82f6' }}>Rs.{selectedBooking?.refundAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="input-label">Date</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedBooking?.refundDate ? new Date(selectedBooking.refundDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-3">
            {['Pending', 'Accepted', 'Active'].includes(selectedBooking?.status) && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCancel(selectedBooking)}
                disabled={cancelLoading === selectedBooking?.id}
                className="secondary-button w-full flex items-center justify-center gap-2"
                style={{ 
                  color: '#f87171', 
                  background: 'rgba(239, 68, 68, 0.1)'
                }}
              >
                {cancelLoading === selectedBooking?.id ? (
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

            {selectedBooking?.status?.toLowerCase() === 'completed' && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleReview(selectedBooking)}
                className="primary-button w-full flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <FiStar /> Write a Review
              </motion.button>
            )}

            {selectedBooking?.hasReviewed && bookingReview && (
              <div 
                className="p-4 space-y-3"
                style={{ 
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px'
                }}
              >
                <div className="flex items-center gap-2">
                  <FiCheckCircle style={{ color: '#10b981' }} />
                  <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
                    Your Review
                  </span>
                </div>
                
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={star <= bookingReview.rating ? 'fill-current' : ''}
                      style={{ 
                        color: star <= bookingReview.rating ? '#f59e0b' : 'var(--text-muted)',
                        fontSize: '16px'
                      }}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {bookingReview.rating}/5
                  </span>
                </div>

                {/* Comment */}
                {bookingReview.comment && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    "{bookingReview.comment}"
                  </p>
                )}

                {/* Date */}
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Reviewed on {new Date(bookingReview.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedBooking(null)}
              className="secondary-button w-full"
            >
              Close
            </motion.button>
          </div>
        </Modal>

        {/* Review Form Modal */}
        {showReviewForm && reviewBooking && (
          <ReviewForm
            bookingId={reviewBooking.id}
            machineName={reviewBooking.machineName}
            onClose={() => {
              setShowReviewForm(false);
              setReviewBooking(null);
            }}
            onSuccess={handleReviewSuccess}
          />
        )}
    </div>
  );
};

export default FarmerBookings;
