import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiUser, FiTruck, FiClock, FiCheck, FiX, FiInfo, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import Modal from '../../components/Modal';
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
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-content-new">
      {/* Success Notification - using portal to escape overflow container */}
      {createPortal(
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className="fixed top-6 left-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
              style={{
                background: notification.type === 'success' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : notification.type === 'error' 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <FiCheckCircle className="text-white text-xl" />
              <span className="text-white font-bold">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Rental Requests</h1>
          <p className="page-subtitle-new">Manage incoming booking requests for your equipment</p>
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
            <FiCalendar />
          </motion.div>
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
                className="card"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="nav-item-icon"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                          color: '#3b82f6'
                        }}
                      >
                        <FiUser />
                      </div>
                      <div>
                        <h3 className="card-title">{request.farmerName}</h3>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <FiTruck className="text-sm" />
                          <span className="text-sm">Requested {request.machineName}</span>
                        </div>
                      </div>
                      <span 
                        className="badge ml-auto lg:ml-4" 
                        style={{ 
                          background: getStatusStyle(request.status).bg,
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
                          className="nav-item-icon"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                            color: '#3b82f6'
                          }}
                        >
                          <FiCalendar />
                        </div>
                        <div>
                          <p className="input-label">Requested Period</p>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(request.createdAt).toLocaleDateString()} (Last {request.hours} hours)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div 
                          className="nav-item-icon"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            color: '#a855f7'
                          }}
                        >
                          <FiClock />
                        </div>
                        <div>
                          <p className="input-label">Duration</p>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{request.hours} Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[240px]">
                    <div className="text-right">
                      <p className="input-label mb-1">Your Earnings</p>
                      <p className="text-3xl font-bold" style={{ color: '#10b981' }}>Rs.{(request.baseAmount || request.totalAmount).toLocaleString()}</p>
                      {request.platformFee > 0 && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>(after Rs.{request.platformFee} platform fee)</p>
                      )}
                    </div>
                    
                    {request.status === 'Pending' ? (
                      <div className="flex gap-3 w-full">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(request.id, 'accept')}
                          className="primary-button flex-1 flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                          <FiCheck className="text-lg" />
                          <span>Accept</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(request.id, 'reject')}
                          className="secondary-button flex-1 flex items-center justify-center gap-2"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                        >
                          <FiX className="text-lg" />
                          <span>Reject</span>
                        </motion.button>
                      </div>
                    ) : request.status === 'Active' ? (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                           <p className="text-sm font-semibold" style={{ color: '#10b981' }}>
                             Rental in Progress
                           </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(request.id, 'complete')}
                          className="primary-button w-full flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                          <FiCheck className="text-lg" />
                          <span>Mark as Completed</span>
                        </motion.button>
                      </div>
                    ) : request.status === 'Completed' ? (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                           <p className="text-sm font-bold" style={{ color: '#10b981' }}>
                             Completed
                           </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRequest(request)}
                          className="secondary-button w-full flex items-center justify-center gap-2"
                        >
                          <FiInfo /> View Details
                        </motion.button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                           <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                             Request {request.status.toUpperCase()}
                           </p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRequest(request)}
                          className="secondary-button w-full flex items-center justify-center gap-2"
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
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiCalendar />
              </div>
              <h3 className="empty-state-title">No pending requests</h3>
              <p className="empty-state-text">When farmers request your equipment, they will appear here.</p>
            </div>
          )}
        </div>

        {/* Request Details Modal */}
        <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
          <div className="flex items-center justify-between mb-6 p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <h2 className="card-title">Request Details</h2>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedRequest(null)}
              className="icon-button"
            >
              <FiX />
            </motion.button>
          </div>

          <div className="space-y-4 px-4">
            <div>
              <p className="input-label">Farmer</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRequest?.farmerName}</p>
            </div>
            <div>
              <p className="input-label">Equipment</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRequest?.machineName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="input-label">Duration</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRequest?.hours} Hours</p>
              </div>
              <div>
                <p className="input-label">Requested</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRequest?.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="input-label">Status</p>
              <span 
                className="badge"
                style={{ 
                  background: getStatusStyle(selectedRequest?.status).bg, 
                  color: getStatusStyle(selectedRequest?.status).color,
                  border: `1px solid ${getStatusStyle(selectedRequest?.status).border}`
                }}
              >
                {selectedRequest?.status}
              </span>
            </div>
            <div>
              <p className="input-label">Your Earnings (Net)</p>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>Rs.{(selectedRequest?.baseAmount || selectedRequest?.totalAmount)?.toLocaleString()}</p>
              {selectedRequest?.platformFee > 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Platform fee: Rs.{selectedRequest?.platformFee}</p>
              )}
            </div>
            <div>
              <p className="input-label">Request ID</p>
              <p style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>#{selectedRequest?.id}</p>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedRequest(null)}
            className="secondary-button w-full mt-6 mx-4 mb-4"
          >
            Close
          </motion.button>
        </Modal>
    </div>
  );
};

export default OwnerRequests;
