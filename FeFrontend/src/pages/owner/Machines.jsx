import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCheckCircle, FiClock, FiAlertCircle, FiTool } from 'react-icons/fi';
import { getOwnerEquipment } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OwnerMachines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/machines/owner');
      console.log('Owner Machines Received:', response.data);
      setMachines(response.data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) return;
    try {
      await api.delete(`/machines/${id}`);
      setMachines(machines.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('Failed to delete machine');
    }
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = (machine.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (machine.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (machine.status || '').toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('active') || s.includes('verified')) 
      return { icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
    if (s.includes('pending')) 
      return { icon: FiClock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    return { icon: FiAlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  };

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  const activeCount = machines.filter(m => m.status?.toLowerCase().includes('active') || m.status?.toLowerCase().includes('verified')).length;
  const pendingCount = machines.filter(m => m.status?.toLowerCase().includes('pending')).length;
  const totalEarnings = machines.reduce((sum, m) => sum + (m.totalEarnings || 0), 0);

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">My Machinery</h1>
          <p className="page-subtitle-new">Manage your equipment fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/owner/add-machine')}
            className="primary-button flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <FiPlus /> 
            <span>List New Equipment</span>
          </motion.button>
        </div>
      </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total', value: machines.length, color: '#3b82f6', icon: FiTool },
            { label: 'Active', value: activeCount, color: '#10b981', icon: FiCheckCircle },
            { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: FiClock }
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
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              id="machine-search"
              name="machine-search"
              type="text"
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            <select
              id="status-filter"
              name="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              autoComplete="off"
              className="filter-select-new"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active/Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMachines.map((machine, index) => {
            const config = getStatusConfig(machine.status);
            const Icon = config.icon;
            const imageUrl = machine.imageUrl || machine.ImageUrl || '/placeholder-equipment.png';

            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="card overflow-hidden"
              >
                <div className="h-40 overflow-hidden relative -mx-6 -mt-6 mb-4">
                  <img 
                    src={imageUrl} 
                    alt={machine.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 hidden items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <FiTruck className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span 
                      className="badge"
                      style={{ 
                        background: `${config.color}20`,
                        color: config.color,
                        border: `1px solid ${config.color}35`
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      {machine.status}
                    </span>
                  </div>
                </div>
                <h3 className="card-title">{machine.name}</h3>
                <p className="card-subtitle">{machine.type}</p>
                
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rate</p>
                    <p className="text-lg font-bold" style={{ color: '#10b981' }}>Rs.{machine.rate}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/hr</span></p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="icon-button"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(machine.id)}
                      className="icon-button"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiTruck />
            </div>
            <p className="empty-state-title">No machinery found</p>
            <p className="empty-state-text">List your equipment to start earning</p>
          </div>
        )}
    </div>
  );
};

export default OwnerMachines;
