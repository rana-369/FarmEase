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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Success Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            style={{
              backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : notification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(59, 130, 246, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <FiCheckCircle className="text-white text-xl" />
            <span className="text-white font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Rental Requests</h1>
          <p className="text-lg text-gray-400">Manage incoming booking requests for your equipment</p>
        </motion.div>

        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-8 rounded-3xl transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <FiUser className="text-2xl text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{request.farmerName}</h3>
                        <div className="flex items-center gap-2 text-gray-400">
                          <FiTruck className="text-sm" />
                          <span>Requested {request.machineName}</span>
                        </div>
                      </div>
                      <span className="ml-auto lg:ml-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border" 
                        style={{ 
                          backgroundColor: getStatusStyle(request.status).bg,
                          color: getStatusStyle(request.status).color,
                          borderColor: getStatusStyle(request.status).border
                        }}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiCalendar className="text-blue-500 text-lg" />
                        <div>
                          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Requested Period</p>
                          <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()} (Last {request.hours} hours)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <FiClock className="text-blue-500 text-lg" />
                        <div>
                          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Duration</p>
                          <p className="font-medium">{request.hours} Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[240px]">
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-1">Your Earnings</p>
                      <p className="text-4xl font-bold text-green-500">₹{(request.baseAmount || request.totalAmount).toLocaleString()}</p>
                      {request.platformFee > 0 && (
                        <p className="text-xs text-gray-500 mt-1">(after ₹{request.platformFee} platform fee)</p>
                      )}
                    </div>
                    
                    {request.status === 'Pending' ? (
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => handleAction(request.id, 'accept')}
                          className="flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-500 text-black hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20"
                        >
                          <FiCheck className="text-xl" /> Accept
                        </button>
                        <button 
                          onClick={() => handleAction(request.id, 'reject')}
                          className="flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <FiX className="text-xl" /> Reject
                        </button>
                      </div>
                    ) : request.status === 'Active' ? (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center border border-green-500/20 bg-green-500/5">
                           <p className="text-sm font-medium text-green-500">
                             Rental in Progress
                           </p>
                        </div>
                        <button 
                          onClick={() => handleAction(request.id, 'complete')}
                          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-500 text-black hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20"
                        >
                          <FiCheck className="text-xl" /> Mark as Completed
                        </button>
                      </div>
                    ) : request.status === 'Completed' ? (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center border border-green-500/30 bg-green-500/10">
                           <p className="text-sm font-bold text-green-500">
                             ✓ Completed
                           </p>
                        </div>
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 hover:bg-white/5"
                          style={{ color: '#22c55e' }}
                        >
                          <FiInfo /> View Details
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center border border-red-500/20 bg-red-500/5">
                           <p className="text-sm font-medium text-red-500">
                             Request {request.status.toUpperCase()}
                           </p>
                        </div>
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 hover:bg-white/5"
                          style={{ color: '#22c55e' }}
                        >
                          <FiInfo /> View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-32 rounded-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
              <FiCalendar className="text-6xl text-gray-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">No pending requests</h3>
              <p className="text-gray-400">When farmers request your equipment, they will appear here.</p>
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
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Request Details</h2>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                  <FiX style={{ fontSize: '20px', color: '#a1a1a1' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Farmer</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{selectedRequest.farmerName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Equipment</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>{selectedRequest.machineName}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Duration</p>
                    <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedRequest.hours} Hours</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Requested</p>
                    <p style={{ fontWeight: '500', color: '#ffffff' }}>{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
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
                    backgroundColor: getStatusStyle(selectedRequest.status).bg, 
                    color: getStatusStyle(selectedRequest.status).color,
                    border: `1px solid ${getStatusStyle(selectedRequest.status).border}`
                  }}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Your Earnings (Net)</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>₹{(selectedRequest.baseAmount || selectedRequest.totalAmount)?.toLocaleString()}</p>
                  {selectedRequest.platformFee > 0 && (
                    <p style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>Platform fee: ₹{selectedRequest.platformFee}</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#a1a1a1' }}>Request ID</p>
                  <p style={{ fontFamily: 'monospace', color: '#ffffff' }}>#{selectedRequest.id}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedRequest(null)}
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

export default OwnerRequests;
