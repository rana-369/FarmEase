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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const activeCount = machines.filter(m => m.status?.toLowerCase().includes('active') || m.status?.toLowerCase().includes('verified')).length;
  const pendingCount = machines.filter(m => m.status?.toLowerCase().includes('pending')).length;
  const totalEarnings = machines.reduce((sum, m) => sum + (m.totalEarnings || 0), 0);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiTool className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>My Machinery</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Manage your equipment fleet</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/owner/add-machine')}
            className="px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
            style={{ backgroundColor: '#22c55e', color: '#000000' }}
          >
            <FiPlus /> List New Equipment
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: machines.length, color: '#3b82f6', icon: FiTool },
            { label: 'Active', value: activeCount, color: '#22c55e', icon: FiCheckCircle },
            { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: FiClock }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="text-lg" style={{ color: stat.color }} />
                </div>
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
              placeholder="Search by name or type..."
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
                className="rounded-xl overflow-hidden"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    alt={machine.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span 
                      className="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                      style={{ backgroundColor: config.bg, color: config.color, backdropFilter: 'blur(8px)' }}
                    >
                      <Icon className="w-3 h-3" />
                      {machine.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-1 truncate" style={{ color: '#ffffff' }}>{machine.name}</h3>
                  <p className="text-xs mb-3" style={{ color: '#666666' }}>{machine.type}</p>
                  
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div>
                      <p className="text-xs" style={{ color: '#666666' }}>Rate</p>
                      <p className="text-lg font-bold" style={{ color: '#22c55e' }}>₹{machine.rate}<span className="text-xs font-normal" style={{ color: '#666666' }}>/hr</span></p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(machine.id)}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
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
          <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <FiTruck className="text-3xl" style={{ color: '#333333' }} />
            </div>
            <p className="text-sm mb-1" style={{ color: '#ffffff' }}>No machinery found</p>
            <p className="text-xs" style={{ color: '#666666' }}>List your equipment to start earning</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMachines;
