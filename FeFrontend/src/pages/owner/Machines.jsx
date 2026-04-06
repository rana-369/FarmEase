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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const activeCount = machines.filter(m => m.status?.toLowerCase().includes('active') || m.status?.toLowerCase().includes('verified')).length;
  const pendingCount = machines.filter(m => m.status?.toLowerCase().includes('pending')).length;
  const totalEarnings = machines.reduce((sum, m) => sum + (m.totalEarnings || 0), 0);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTool className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>My Machinery</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Manage your equipment fleet</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/owner/add-machine')}
            className="px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <FiPlus className="relative z-10" /> 
            <span className="relative z-10">List New Equipment</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
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
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-blue-500/30" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: 'rgba(255,255,255,0.8)' }} />
            <input
              id="machine-search"
              name="machine-search"
              type="text"
              placeholder="Search by name or type..."
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
              <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>All Statuses</option>
              <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Active/Verified</option>
              <option value="pending" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Pending</option>
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
                className="rounded-2xl overflow-hidden relative group"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    alt={machine.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span 
                      className="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                      style={{ 
                        background: `linear-gradient(135deg, ${config.color}25 0%, ${config.color}15 100%)`,
                        border: `1px solid ${config.color}35`,
                        color: config.color,
                        backdropFilter: 'blur(12px)'
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      {machine.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: '#ffffff' }}>{machine.name}</h3>
                  <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>{machine.type}</p>
                  
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Rate</p>
                      <p className="text-lg font-bold" style={{ color: '#10b981' }}>₹{machine.rate}<span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.8)' }}>/hr</span></p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 rounded-xl transition-colors"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255,255,255,0.6)'
                        }}
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(machine.id)}
                        className="p-2.5 rounded-xl"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171'
                        }}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-16 rounded-3xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <FiTruck className="text-3xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <p className="text-sm mb-1 font-semibold" style={{ color: '#ffffff' }}>No machinery found</p>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>List your equipment to start earning</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMachines;
