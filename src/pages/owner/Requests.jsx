import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiTruck, FiClock, FiCheck, FiX, FiInfo, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';

const OwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bookings/owner');
        // Ensure property names match backend (PascalCase fallback)
        const transformedRequests = (response.data || []).map(req => ({
          id: req.id || req.Id,
          farmerName: req.farmerName || req.FarmerName || 'Farmer',
          machineName: req.machineName || req.MachineName || 'Equipment',
          status: req.status || req.Status || 'Pending',
          hours: req.hours || req.Hours || 0,
          totalAmount: req.totalAmount || req.TotalAmount || 0,
          createdAt: req.createdAt || req.CreatedAt || new Date().toISOString()
        }));
        setRequests(transformedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/${action}`);
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: action === 'accept' ? 'Accepted' : 'Rejected' } : req
      ));
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request`);
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
                          backgroundColor: request.status === 'Pending' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: request.status === 'Pending' ? '#facc15' : '#a1a1a1',
                          borderColor: request.status === 'Pending' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.1)'
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
                      <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-1">Potential Earnings</p>
                      <p className="text-4xl font-bold text-green-500">₹{request.totalAmount.toLocaleString()}</p>
                    </div>
                    
                    {request.status === 'Pending' ? (
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => handleAction(request.id, 'accept')}
                          className="flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-500 text-black hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20"
                        >
                          <FiCheck className="text-xl" /> Accept Request
                        </button>
                        <button 
                          onClick={() => handleAction(request.id, 'reject')}
                          className="flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <FiX className="text-xl" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        <div className="p-4 rounded-xl text-center border border-white/10 bg-white/5">
                           <p className="text-sm font-medium" style={{ color: request.status === 'Accepted' || request.status === 'Active' ? '#22c55e' : '#ef4444' }}>
                             Request {request.status.toUpperCase()}
                           </p>
                        </div>
                        <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 text-white hover:bg-white/5">
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
      </div>
    </div>
  );
};

export default OwnerRequests;
