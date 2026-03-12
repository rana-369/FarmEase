import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiFilter, FiSearch, FiArrowUpRight, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { getFarmerBookings } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const FarmerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterRole] = useState('all');
  const [paymentLoading, setPaymentLoading] = useState(null);

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
      
      // 1. Create order on backend
      const { data: orderData } = await API.post('/payments/create-order', {
        bookingId: booking.id
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "AgriConnect",
        description: `Payment for ${booking.machineName}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // 2. Verify payment on backend
            const verifyData = {
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            };
            
            const { data: verifyResult } = await API.post('/payments/verify-payment', verifyData);
            
            if (verifyResult) {
              // Update local state
              setBookings(prev => prev.map(b => 
                b.id === booking.id ? { ...b, status: 'Active', isPaid: true } : b
              ));
              alert("Payment successful! Your booking is now Active.");
            }
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: "#22c55e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed", error);
      alert(error.response?.data?.message || "Failed to initiate payment. Please try again.");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
            <label htmlFor="booking-search" className="sr-only">Search bookings</label>
            <input 
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search by machine or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-white outline-none transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select 
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-white outline-none appearance-none cursor-pointer"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
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
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 text-white hover:bg-white/5"
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
      </div>
    </div>
  );
};

export default FarmerBookings;
