import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiCheck, FiX, FiEye, FiCalendar, FiMapPin, FiClock, FiTool, FiFilter, FiSearch } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getAllMachines, approveMachine, rejectMachine } from '../../services/dashboardService';
import Pagination from '../../components/Pagination';

const MachineApproval = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllMachines(currentPage, itemsPerPage, searchTerm, filterStatus);
      setMachines(response.machines || []);
      setTotalItems(response.totalItems || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);
  
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

  const handleApprove = async (machineId) => {
    try {
      setActionLoading(machineId);
      await approveMachine(machineId);
      await fetchMachines();
    } catch (error) {
      console.error('Error approving machine:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (machineId) => {
    try {
      setActionLoading(machineId);
      await rejectMachine(machineId, 'Rejected by admin');
      await fetchMachines();
    } catch (error) {
      console.error('Error rejecting machine:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', icon: FiCheck };
      case 'pending verification': return { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', icon: FiClock };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', icon: FiX };
      case 'active': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', icon: FiCheck };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#a1a1a1', icon: FiClock };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(168, 85, 247, 0.2)', borderTopColor: '#a855f7' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const pendingCount = machines.filter(m => m.status?.toLowerCase() === 'pending verification').length;
  const verifiedCount = machines.filter(m => m.status?.toLowerCase() === 'verified' || m.status?.toLowerCase() === 'active').length;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTool className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Machine Approval</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Review equipment submissions</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: FiClock },
            { label: 'Verified', value: verifiedCount, color: '#10b981', icon: FiCheck },
            { label: 'Total', value: totalItems, color: '#3b82f6', icon: FiTool }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
                <div className="flex items-center justify-between mb-2 relative">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <Icon className="text-lg" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-purple-500/30" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: 'rgba(255,255,255,0.8)' }} />
            <input
              id="machine-search"
              name="machine-search"
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: 'rgba(255,255,255,0.8)' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm font-medium"
              style={{ color: '#ffffff' }}
            >
              <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>All Status</option>
              <option value="pending verification" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Pending</option>
              <option value="verified" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Verified</option>
              <option value="rejected" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Rejected</option>
              <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Active</option>
            </select>
          </div>
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine, index) => {
            const config = getStatusConfig(machine.status);
            const Icon = config.icon;
            
            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${config.text}10 0%, transparent 60%)` }} />
                <div className="flex items-start justify-between mb-3 relative">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1" style={{ color: '#ffffff' }}>
                      {machine.name || 'Unnamed Machine'}
                    </h3>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {machine.ownerName || 'Unknown'}
                    </p>
                  </div>
                  <span 
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                    style={{ 
                      background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg} 100%)`,
                      border: `1px solid ${config.text}25`,
                      color: config.text 
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {machine.status || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 relative">
                  <div className="flex items-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FiMapPin className="mr-2 w-3 h-3" style={{ color: '#10b981' }} />
                    {machine.ownerLocation || 'No location'}
                  </div>
                  <div className="flex items-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span className="text-sm mr-2 font-bold" style={{ color: '#10b981' }}>₹</span>
                    {machine.rate || 0}/hour
                  </div>
                  <div className="flex items-center text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FiCalendar className="mr-2 w-3 h-3" />
                    {formatDate(machine.createdAt || machine.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2 relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMachine(machine)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      color: '#3b82f6' 
                    }}
                  >
                    <FiEye className="inline mr-1 w-3 h-3" />
                    View
                  </motion.button>

                  {machine.status?.toLowerCase() === 'pending verification' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApprove(machine.id)}
                        disabled={actionLoading === machine.id}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          color: '#10b981', 
                          opacity: actionLoading === machine.id ? 0.5 : 1 
                        }}
                      >
                        {actionLoading === machine.id ? (
                          <div className="w-3 h-3 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }}></div>
                        ) : (
                          <>
                            <FiCheck className="inline mr-1 w-3 h-3" />
                            Approve
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(machine.id)}
                        disabled={actionLoading === machine.id}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171', 
                          opacity: actionLoading === machine.id ? 0.5 : 1 
                        }}
                      >
                        {actionLoading === machine.id ? (
                          <div className="w-3 h-3 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#f87171', borderTopColor: 'transparent' }}></div>
                        ) : (
                          <>
                            <FiX className="inline mr-1 w-3 h-3" />
                            Reject
                          </>
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <FiTruck className="text-4xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#ffffff' }}>No machines found</p>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Try adjusting your search or filters</p>
          </div>
        )}
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Machine Detail Modal */}
      {selectedMachine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedMachine(null)}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl p-6 max-w-lg w-full relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)' }} />
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Machine Details</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMachine(null)}
                className="p-2 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255,255,255,0.6)' 
                }}
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="grid grid-cols-2 gap-4 relative">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Name</p>
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{selectedMachine.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Type</p>
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{selectedMachine.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Owner</p>
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{selectedMachine.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Location</p>
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{selectedMachine.ownerLocation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Rate</p>
                <p className="text-sm font-bold" style={{ color: '#10b981' }}>₹{selectedMachine.rate || 0}/hour</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Status</p>
                <span 
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ 
                    background: `linear-gradient(135deg, ${getStatusConfig(selectedMachine.status).bg} 0%, ${getStatusConfig(selectedMachine.status).bg} 100%)`,
                    border: `1px solid ${getStatusConfig(selectedMachine.status).text}25`,
                    color: getStatusConfig(selectedMachine.status).text 
                  }}
                >
                  {selectedMachine.status || 'Unknown'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Added</p>
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                  {formatDate(selectedMachine.createdAt || selectedMachine.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MachineApproval;
