import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiFilter, FiSearch, FiArrowUpRight, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { getFarmerBookings } from '../../services/dashboardService';
import { processPayment } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

const FarmerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterRole] = useState('all');
  const [paymentLoading, setPaymentLoading] = useState(null);
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
          isPaid: booking.isPaid || booking.IsPaid || false
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
        // Update local state
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' };
      case 'pending': return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.2)' };
      case 'completed': return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' };
      case 'rejected':
      case 'cancelled': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { color: '#a1a1a1', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
            <p className="text-lg text-gray-400">Track and manage your equipment rental requests</p>
          </div>
          <button 
            onClick={() => navigate('/farmer/machines')}
            className="px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 hover:scale-105"
            style={{ backgroundColor: '#22c55e', color: '#000000' }}
          >
            <FiTruck className="text-xl" /> Rent More Equipment
          </button>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', paddingLeft: '16px' }}>
            <FiSearch style={{ color: '#a1a1a1', fontSize: '20px', flexShrink: 0 }} />
            <input 
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              style={{ 
                flex: 1,
                padding: '16px 16px 16px 12px',
                borderRadius: '16px',
                color: '#ffffff',
                outline: 'none',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ flex: '0 1 200px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', paddingLeft: '16px' }}>
            <FiFilter style={{ color: '#a1a1a1', fontSize: '20px', flexShrink: 0 }} />
            <select 
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterRole(e.target.value)}
              autoComplete="off"
              style={{ 
                flex: 1,
                padding: '16px 16px 16px 12px',
                borderRadius: '16px',
                color: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '16px'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => {
              const status = getStatusColor(booking.status);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-8 rounded-3xl transition-all hover:bg-white/10"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <FiTruck className="text-2xl text-green-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{booking.machineName}</h3>
                          <div className="flex items-center gap-2 text-gray-400">
                            <FiMapPin className="text-sm" />
                            <span>Owned by {booking.ownerName}</span>
                          </div>
                        </div>
                        <span className="ml-auto lg:ml-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border" style={{ backgroundColor: status.bg, color: status.color, borderColor: status.border }}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex items-center gap-3 text-gray-300">
                          <FiCalendar className="text-green-500 text-lg" />
                          <div>
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Rental Period</p>
                            <p className="font-medium">{booking.startDate} - {booking.endDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <FiClock className="text-green-500 text-lg" />
                          <div>
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Booking ID</p>
                            <p className="font-medium font-mono">#{booking.id.toString().substring(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[200px]">
                      <div className="text-right">
                        <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-1">Total Amount</p>
                        <p className="text-4xl font-bold text-green-500">₹{booking.totalCost.toLocaleString()}</p>
                      </div>
                      
                      {booking.status === 'Accepted' && !booking.isPaid && (
                        <button 
                          onClick={() => handlePayment(booking)}
                          disabled={paymentLoading === booking.id}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                          style={{ backgroundColor: '#22c55e', color: '#000000' }}
                        >
                          {paymentLoading === booking.id ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>Pay Now <FiCreditCard /></>
                          )}
                        </button>
                      )}

                      {booking.isPaid && (
                        <div className="flex items-center gap-2 text-green-500 font-bold py-2">
                          <FiCheckCircle /> Paid
                        </div>
                      )}

                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 hover:bg-white/5"
                        style={{ color: '#22c55e' }}
                      >
                        View Details <FiArrowUpRight />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-32 rounded-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
              <FiPackage className="text-6xl text-gray-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">No bookings match your search</h3>
              <p className="text-gray-400 max-w-md mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '512px',
                borderRadius: '24px',
                padding: '32px',
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Booking Details</h2>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                  <FiXCircle style={{ fontSize: '20px', color: '#a1a1a1' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Equipment</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{selectedBooking.machineName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Owner</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>{selectedBooking.ownerName}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Start Date</p>
                    <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedBooking.startDate}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#a1a1a1' }}>End Date</p>
                    <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedBooking.endDate}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Status</p>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: getStatusColor(selectedBooking.status).bg, 
                    color: getStatusColor(selectedBooking.status).color,
                    border: `1px solid ${getStatusColor(selectedBooking.status).border}`
                  }}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Total Amount</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>₹{selectedBooking.totalCost?.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Booking ID</p>
                  <p style={{ fontFamily: 'monospace', color: '#ffffff' }}>#{selectedBooking.id}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBooking(null)}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FarmerBookings;
