import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiCheck, FiX, FiEye, FiCalendar, FiMapPin, FiClock, FiTool, FiFilter, FiSearch } from 'react-icons/fi';
import Modal from '../../components/Modal';
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
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  const pendingCount = machines.filter(m => m.status?.toLowerCase() === 'pending verification').length;
  const verifiedCount = machines.filter(m => m.status?.toLowerCase() === 'verified' || m.status?.toLowerCase() === 'active').length;

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Machine Approval</h1>
          <p className="page-subtitle-new">Review equipment submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="logo-icon-new"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.35)'
            }}
          >
            <FiTool />
          </motion.div>
        </div>
      </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
                className="stat-card-new"
              >
                <div className="stat-info">
                  <p className="stat-title-new">{stat.label}</p>
                  <h3 className="stat-value-new" style={{ color: stat.color }}>{stat.value}</h3>
                </div>
                <div 
                  className="stat-icon-new"
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    color: stat.color
                  }}
                >
                  <Icon />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="filters-bar-new mb-6">
          <div className="search-box-new">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              id="machine-search"
              name="machine-search"
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="filter-select-new"
            >
              <option value="all">All Status</option>
              <option value="pending verification">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
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
                className="card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="card-title">
                      {machine.name || 'Unnamed Machine'}
                    </h3>
                    <p className="card-subtitle">
                      {machine.ownerName || 'Unknown'}
                    </p>
                  </div>
                  <span className="badge" style={{ background: config.bg, color: config.text, border: `1px solid ${config.text}25` }}>
                    <Icon className="w-3 h-3" />
                    {machine.status || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FiMapPin className="mr-2 w-3 h-3" style={{ color: '#10b981' }} />
                    {machine.ownerLocation || 'No location'}
                  </div>
                  <div className="flex items-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span className="text-sm mr-2 font-bold" style={{ color: '#10b981' }}>₹</span>
                    {machine.rate || 0}/hour
                  </div>
                  <div className="flex items-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FiCalendar className="mr-2 w-3 h-3" />
                    {formatDate(machine.createdAt || machine.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMachine(machine)}
                    className="secondary-button flex-1"
                    style={{ padding: '10px 12px', fontSize: '12px' }}
                  >
                    <FiEye className="w-3 h-3" />
                    View
                  </motion.button>

                  {machine.status?.toLowerCase() === 'pending verification' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApprove(machine.id)}
                        disabled={actionLoading === machine.id}
                        className="secondary-button flex-1"
                        style={{ padding: '10px 12px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', opacity: actionLoading === machine.id ? 0.5 : 1 }}
                      >
                        {actionLoading === machine.id ? (
                          <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                        ) : (
                          <>
                            <FiCheck className="w-3 h-3" />
                            Approve
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(machine.id)}
                        disabled={actionLoading === machine.id}
                        className="secondary-button flex-1"
                        style={{ padding: '10px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', opacity: actionLoading === machine.id ? 0.5 : 1 }}
                      >
                        {actionLoading === machine.id ? (
                          <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#f87171' }} />
                        ) : (
                          <>
                            <FiX className="w-3 h-3" />
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiTruck />
            </div>
            <p className="empty-state-title">No machines found</p>
            <p className="empty-state-text">Try adjusting your search or filters</p>
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

      {/* Machine Detail Modal */}
      <Modal isOpen={!!selectedMachine} onClose={() => setSelectedMachine(null)}>
        <div className="flex items-center justify-between mb-6 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="card-title">Machine Details</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedMachine(null)}
            className="icon-button"
          >
            <FiX className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 pb-4">
          <div>
            <p className="input-label">Name</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedMachine?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="input-label">Type</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedMachine?.type || 'N/A'}</p>
          </div>
          <div>
            <p className="input-label">Owner</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedMachine?.ownerName || 'N/A'}</p>
          </div>
          <div>
            <p className="input-label">Location</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedMachine?.ownerLocation || 'N/A'}</p>
          </div>
          <div>
            <p className="input-label">Rate</p>
            <p className="font-bold" style={{ color: '#10b981' }}>Rs.{selectedMachine?.rate || 0}/hour</p>
          </div>
          <div>
            <p className="input-label">Status</p>
            <span 
              className="badge"
              style={{ 
                background: getStatusConfig(selectedMachine?.status).bg,
                border: `1px solid ${getStatusConfig(selectedMachine?.status).text}25`,
                color: getStatusConfig(selectedMachine?.status).text 
              }}
            >
              {selectedMachine?.status || 'Unknown'}
            </span>
          </div>
          <div className="col-span-2">
            <p className="input-label">Added</p>
            <p className="font-semibold" style={{ color: '#ffffff' }}>
              {formatDate(selectedMachine?.createdAt || selectedMachine?.created_at)}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MachineApproval;
