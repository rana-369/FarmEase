import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiCheck, FiX, FiEye, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
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
  
  // Pagination state
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
  
  // Debounced search
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
      await fetchMachines(); // Refresh the list
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
      await fetchMachines(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting machine:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'pending verification': return { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.3)' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'active': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#a1a1a1', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return <FiCheck className="w-4 h-4" />;
      case 'pending verification': return <FiClock className="w-4 h-4" />;
      case 'rejected': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const pendingCount = machines.filter(m => m.status?.toLowerCase() === 'pending verification').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div className="p-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Machine Approval</h1>
            <p style={{ color: '#a1a1a1' }}>Review and approve equipment submissions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'rgba(250, 204, 21, 0.1)', 
              color: '#facc15',
              border: '1px solid rgba(250, 204, 21, 0.2)'
            }}>
              {pendingCount} Pending Approval
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              {totalItems} Total Machines
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="machine-search" className="sr-only">Search machines</label>
            <input
              id="machine-search"
              name="machine-search"
              type="text"
              placeholder="Search machines by name, owner, location, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg"
              autoComplete="off"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            />
          </div>
          <div className="">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="px-4 py-3 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >
              <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>All Status</option>
              <option value="pending verification" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Pending</option>
              <option value="verified" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Verified</option>
              <option value="rejected" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Rejected</option>
              <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine, index) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl p-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>
                    {machine.name || 'Unnamed Machine'}
                  </h3>
                  <p className="text-sm" style={{ color: '#a1a1a1' }}>
                    Owner: {machine.ownerName || 'Unknown'}
                  </p>
                </div>
                <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getStatusColor(machine.status)}`}>
                  {getStatusIcon(machine.status)}
                  <span className="ml-1">{machine.status || 'Unknown'}</span>
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm" style={{ color: '#a1a1a1' }}>
                  <FiMapPin className="mr-2" />
                  {machine.ownerLocation || 'Location not specified'}
                </div>
                <div className="flex items-center text-sm" style={{ color: '#a1a1a1' }}>
                  <RupeeIcon className="mr-2" />
                  ₹{machine.rate || 0}/hour
                </div>
                <div className="flex items-center text-sm" style={{ color: '#a1a1a1' }}>
                  <FiCalendar className="mr-2" />
                  Added {formatDate(machine.createdAt || machine.created_at)}
                </div>
                <div className="flex items-center text-sm" style={{ color: '#a1a1a1' }}>
                  Type: {machine.type || 'Not specified'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMachine(machine)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                >
                  <FiEye className="inline mr-1" />
                  View Details
                </button>

                {machine.status?.toLowerCase() === 'pending verification' && (
                  <>
                    <button
                      onClick={() => handleApprove(machine.id)}
                      disabled={actionLoading === machine.id}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        opacity: actionLoading === machine.id ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => !actionLoading && (e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.2)')}
                      onMouseLeave={(e) => !actionLoading && (e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)')}
                    >
                      {actionLoading === machine.id ? (
                        <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
                      ) : (
                        <>
                          <FiCheck className="inline mr-1" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(machine.id)}
                      disabled={actionLoading === machine.id}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        opacity: actionLoading === machine.id ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => !actionLoading && (e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)')}
                      onMouseLeave={(e) => !actionLoading && (e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                    >
                      {actionLoading === machine.id ? (
                        <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#ef4444', borderTopColor: 'transparent' }}></div>
                      ) : (
                        <>
                          <FiX className="inline mr-1" />
                          Reject
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12">
            <FiTruck className="mx-auto text-4xl mb-4" style={{ color: '#666666' }} />
            <p style={{ color: '#a1a1a1' }}>No machines found matching your criteria</p>
          </div>
        )}
        
        {/* Pagination */}
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '672px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Machine Details</h3>
              <button
                onClick={() => setSelectedMachine(null)}
                style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#ffffff' }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Name</p>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedMachine.name || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Type</p>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedMachine.type || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Owner</p>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedMachine.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Owner Location</p>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>{selectedMachine.ownerLocation || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Rate</p>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>₹{selectedMachine.rate || 0}/hour</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Status</p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '9999px',
                  border: `1px solid ${getStatusColor(selectedMachine.status).border}`,
                  backgroundColor: getStatusColor(selectedMachine.status).bg,
                  color: getStatusColor(selectedMachine.status).text
                }}>
                  {selectedMachine.status || 'Unknown'}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px', color: '#a1a1a1' }}>Added</p>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>
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
