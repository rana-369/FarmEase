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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const pendingCount = machines.filter(m => m.status?.toLowerCase() === 'pending verification').length;
  const verifiedCount = machines.filter(m => m.status?.toLowerCase() === 'verified' || m.status?.toLowerCase() === 'active').length;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
            >
              <FiTool className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Machine Approval</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Review equipment submissions</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', value: pendingCount, color: '#facc15', icon: FiClock },
            { label: 'Verified', value: verifiedCount, color: '#22c55e', icon: FiCheck },
            { label: 'Total', value: totalItems, color: '#3b82f6', icon: FiTool }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
              >
                <Icon className="text-lg mb-2" style={{ color: stat.color }} />
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#888888' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: '#666666' }} />
            <input
              id="machine-search"
              name="machine-search"
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: '#666666' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm"
              style={{ color: '#ffffff' }}
            >
              <option value="all" style={{ backgroundColor: '#1a1a1a' }}>All Status</option>
              <option value="pending verification" style={{ backgroundColor: '#1a1a1a' }}>Pending</option>
              <option value="verified" style={{ backgroundColor: '#1a1a1a' }}>Verified</option>
              <option value="rejected" style={{ backgroundColor: '#1a1a1a' }}>Rejected</option>
              <option value="active" style={{ backgroundColor: '#1a1a1a' }}>Active</option>
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
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1" style={{ color: '#ffffff' }}>
                      {machine.name || 'Unnamed Machine'}
                    </h3>
                    <p className="text-xs" style={{ color: '#666666' }}>
                      {machine.ownerName || 'Unknown'}
                    </p>
                  </div>
                  <span 
                    className="px-2 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                    style={{ backgroundColor: config.bg, color: config.text }}
                  >
                    <Icon className="w-3 h-3" />
                    {machine.status || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs" style={{ color: '#888888' }}>
                    <FiMapPin className="mr-2 w-3 h-3" style={{ color: '#22c55e' }} />
                    {machine.ownerLocation || 'No location'}
                  </div>
                  <div className="flex items-center text-xs" style={{ color: '#888888' }}>
                    <span className="text-sm mr-2" style={{ color: '#22c55e' }}>₹</span>
                    {machine.rate || 0}/hour
                  </div>
                  <div className="flex items-center text-xs" style={{ color: '#888888' }}>
                    <FiCalendar className="mr-2 w-3 h-3" />
                    {formatDate(machine.createdAt || machine.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMachine(machine)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
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
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', opacity: actionLoading === machine.id ? 0.5 : 1 }}
                      >
                        {actionLoading === machine.id ? (
                          <div className="w-3 h-3 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
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
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', opacity: actionLoading === machine.id ? 0.5 : 1 }}
                      >
                        {actionLoading === machine.id ? (
                          <div className="w-3 h-3 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#ef4444', borderTopColor: 'transparent' }}></div>
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
          <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <FiTruck className="text-3xl" style={{ color: '#333333' }} />
            </div>
            <p className="text-sm mb-1" style={{ color: '#ffffff' }}>No machines found</p>
            <p className="text-xs" style={{ color: '#666666' }}>Try adjusting your search or filters</p>
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
            className="rounded-2xl p-6 max-w-lg w-full"
            style={{ backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Machine Details</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMachine(null)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Name</p>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{selectedMachine.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Type</p>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{selectedMachine.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Owner</p>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{selectedMachine.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Location</p>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{selectedMachine.ownerLocation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Rate</p>
                <p className="text-sm font-medium" style={{ color: '#22c55e' }}>₹{selectedMachine.rate || 0}/hour</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Status</p>
                <span 
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: getStatusConfig(selectedMachine.status).bg, color: getStatusConfig(selectedMachine.status).text }}
                >
                  {selectedMachine.status || 'Unknown'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Added</p>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
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
