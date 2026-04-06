import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiUser, FiTruck, FiClock, FiCheck, FiX, FiInfo, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const OwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bookings/owner');
        // Ensure property names match backend (PascalCase fallback)
        const transformedRequests = (response.data || []).map(req => {
          // Calculate owner's net earnings (totalAmount - platformFee)
          const totalAmount = req.totalAmount || req.TotalAmount || 0;
          const platformFee = req.platformFee || req.PlatformFee || 0;
          const baseAmount = req.baseAmount || req.BaseAmount || (totalAmount - platformFee);
          
          return {
            id: req.id || req.Id,
            farmerName: req.farmerName || req.FarmerName || 'Farmer',
            machineName: req.machineName || req.MachineName || 'Equipment',
            status: req.status || req.Status || 'Pending',
            hours: req.hours || req.Hours || 0,
            totalAmount: totalAmount,
            platformFee: platformFee,
            baseAmount: baseAmount, // Owner's net earnings
            createdAt: req.createdAt || req.CreatedAt || new Date().toISOString()
          };
        });
        setRequests(transformedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAction = async (id, action) => {
    try {
      const response = await api.put(`/bookings/${id}/${action}`);
      
      // Find the request being updated
      const updatedRequest = requests.find(req => req.id === id);
      
      setRequests(requests.map(req => {
        if (req.id !== id) return req;
        switch (action) {
          case 'accept': return { ...req, status: 'Accepted' };
          case 'reject': return { ...req, status: 'Rejected' };
          case 'complete': return { ...req, status: 'Completed' };
          default: return req;
        }
      }));
      
      // Show success notification with earnings info
      if (action === 'complete' && updatedRequest) {
        const earnings = updatedRequest.baseAmount || (updatedRequest.totalAmount - updatedRequest.platformFee);
        showNotification(`Booking completed! You earned ₹${earnings.toLocaleString()}`, 'success');
      } else if (action === 'accept') {
        showNotification('Booking accepted! Waiting for farmer payment.', 'success');
      } else if (action === 'reject') {
        showNotification('Booking rejected.', 'info');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showNotification(`Failed to ${action} request`, 'error');
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.2)' };
    if (s === 'accepted') return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' };
    if (s === 'active') return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' };
    if (s === 'completed') return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
    if (s === 'rejected') return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' };
    return { color: '#a1a1a1', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
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

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      {/* Success Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            style={{
              background: notification.type === 'success' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : notification.type === 'error' 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <FiCheckCircle className="text-white text-xl" />
            <span className="text-white font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <motion.div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <FiCalendar className="text-xl text-white relative z-10" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Rental Requests</h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Manage incoming booking requests for your equipment</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.005 }}
                className="p-6 rounded-3xl transition-all relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }} />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.25)'
                        }}
                      >
                        <FiUser className="text-2xl" style={{ color: '#3b82f6' }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>{request.farmerName}</h3>
                        <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <FiTruck className="text-sm" />
                          <span className="text-sm font-medium">Requested {request.machineName}</span>
                        </div>
                      </div>
                      <span 
                        className="ml-auto lg:ml-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest" 
                        style={{ 
                          background: `linear-gradient(135deg, ${getStatusStyle(request.status).bg} 0%, ${getStatusStyle(request.status).bg} 100%)`,
                          color: getStatusStyle(request.status).color,
                          border: `1px solid ${getStatusStyle(request.status).border}`
                        }}
                      >
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <FiCalendar className="text-lg" style={{ color: '#3b82f6' }} />
                        </div>
                        <div>
                          <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>Requested Period</p>
                          <p className="font-semibold" style={{ color: '#ffffff' }}>{new Date(request.createdAt).toLocaleDateString()} (Last {request.hours} hours)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            border: '1px solid rgba(168, 85, 247, 0.2)'
                          }}
                        >
                          <FiClock className="text-lg" style={{ color: '#a855f7' }} />
                        </div>
                        <div>
                          <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>Duration</p>
                          <p className="font-semibold" style={{ color: '#ffffff' }}>{request.hours} Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[240px]">
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Your Earnings</p>
                      <p className="text-3xl font-bold" style={{ color: '#10b981' }}>₹{(request.baseAmount || request.totalAmount).toLocaleString()}</p>
                      {request.platformFee > 0 && (
                        <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>(after ₹{request.platformFee} platform fee)</p>
                      )}
                    </div>
                    
                    {request.status === 'Pending' ? (
                      <div className="flex gap-3 w-full">
                        <motion.button 
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(request.id, 'accept')}
                          className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                          <FiCheck className="text-lg relative z-10" />
                          <span className="relative z-10">Accept</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(request.id, 'reject')}
                          className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#f87171'
                          }}
                        >
                          <FiX className="text-lg" />
                          <span>Reject</span>
                        </motion.button>
                      </div>
                    ) : request.status === 'Active' ? (
                      <div className="w-full flex flex-col gap-3">
                        <div 
                          className="p-4 rounded-xl text-center relative overflow-hidden"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}
                        >
                           <p className="text-sm font-semibold" style={{ color: '#10b981' }}>
                             Rental in Progress
                           </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(request.id, 'complete')}
                          className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                          <FiCheck className="text-lg relative z-10" />
                          <span className="relative z-10">Mark as Completed</span>
                        </motion.button>
                      </div>
                    ) : request.status === 'Completed' ? (
                      <div className="w-full flex flex-col gap-3">
                        <div 
                          className="p-4 rounded-xl text-center relative overflow-hidden"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                          }}
                        >
                           <p className="text-sm font-bold" style={{ color: '#10b981' }}>
                             ✓ Completed
                           </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRequest(request)}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                          style={{ 
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#10b981'
                          }}
                        >
                          <FiInfo /> View Details
                        </motion.button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        <div 
                          className="p-4 rounded-xl text-center relative overflow-hidden"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}
                        >
                           <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                             Request {request.status.toUpperCase()}
                           </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRequest(request)}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                          style={{ 
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#10b981'
                          }}
                        >
                          <FiInfo /> View Details
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div 
              className="text-center py-32 rounded-3xl relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <FiCalendar className="text-4xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>No pending requests</h3>
              <p className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>When farmers request your equipment, they will appear here.</p>
            </div>
          )}
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRequest(null)}
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
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '512px',
                borderRadius: '24px',
                padding: '32px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }} className="relative">
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Request Details</h2>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedRequest(null)}
                  style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: 'none' }}
                >
                  <FiX style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }} />
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="relative">
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Farmer</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{selectedRequest.farmerName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Equipment</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>{selectedRequest.machineName}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Duration</p>
                    <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedRequest.hours} Hours</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Requested</p>
                    <p style={{ fontWeight: '500', color: '#ffffff' }}>{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Status</p>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    background: `linear-gradient(135deg, ${getStatusStyle(selectedRequest.status).bg} 0%, ${getStatusStyle(selectedRequest.status).bg} 100%)`, 
                    color: getStatusStyle(selectedRequest.status).color,
                    border: `1px solid ${getStatusStyle(selectedRequest.status).border}`
                  }}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Your Earnings (Net)</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>₹{(selectedRequest.baseAmount || selectedRequest.totalAmount)?.toLocaleString()}</p>
                  {selectedRequest.platformFee > 0 && (
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Platform fee: ₹{selectedRequest.platformFee}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Request ID</p>
                  <p style={{ fontFamily: 'monospace', color: '#ffffff' }}>#{selectedRequest.id}</p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedRequest(null)}
                className="relative"
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '14px',
                  borderRadius: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  cursor: 'pointer'
                }}
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

export default OwnerRequests;
