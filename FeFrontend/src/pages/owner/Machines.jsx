import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
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

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('active') || s.includes('verified')) 
      return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' };
    if (s.includes('pending')) 
      return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.2)' };
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' };
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold text-white mb-2">My Machinery</h1>
            <p className="text-lg text-gray-400">Manage and monitor your equipment fleet</p>
          </motion.div>
          <button 
            onClick={() => navigate('/owner/add-machine')}
            className="px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 hover:scale-105"
            style={{ backgroundColor: '#22c55e', color: '#000000' }}
          >
            <FiPlus className="text-xl" /> List New Equipment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="machine-search" className="sr-only">Search machinery</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input 
                id="machine-search"
                name="machine-search"
                type="text"
                placeholder="Search by machine name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                className="w-full pl-14 pr-4 py-4 rounded-2xl text-white outline-none transition-all focus:ring-2 focus:ring-green-500/50"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400 text-lg" />
              </div>
              <select 
                id="status-filter"
                name="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                autoComplete="off"
                className="w-full pl-14 pr-4 py-4 rounded-2xl text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/50"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active/Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMachines.map((machine, index) => {
            const status = getStatusStyle(machine.status);
            // Use relative URL - Vite proxy will forward to backend
            const imageUrl = machine.imageUrl || machine.ImageUrl || '/placeholder-equipment.png';

            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl overflow-hidden group"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    alt={machine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 rounded-full text-xs font-semibold border" style={{ backgroundColor: status.bg, color: status.color, borderColor: status.border, backdropFilter: 'blur(8px)' }}>
                      {machine.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{machine.name}</h3>
                  <p className="text-sm mb-4" style={{ color: '#666666' }}>{machine.type}</p>
                  
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Rate</p>
                      <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>₹{machine.rate}<span className="text-sm font-normal" style={{ color: '#666666' }}>/hr</span></p>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-3.5 rounded-xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#888888' }}>
                        <FiEdit2 className="text-lg" />
                      </button>
                      <button 
                        onClick={() => handleDelete(machine.id)}
                        className="p-3.5 rounded-xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-32 rounded-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <FiTruck className="text-6xl text-gray-700 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No machinery found</h3>
            <p className="text-gray-400">List your equipment to start earning from rentals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMachines;
