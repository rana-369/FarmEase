import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiArrowUpRight, FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';
import { getOwnerStats, getOwnerActivity } from '../../services/dashboardService';

const OwnerEarnings = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeRentals: 0,
    totalMachines: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          getOwnerStats(),
          getOwnerActivity()
        ]);
        
        console.log('Earnings Stats Received:', statsData);
        
        if (statsData) {
          setStats({
            totalEarnings: statsData.totalEarnings ?? 0,
            activeRentals: statsData.activeRentals ?? 0,
            totalMachines: statsData.totalMachines ?? 0
          });
        }
        
        if (activityData) {
          const transformedActivity = (activityData || []).map(activity => ({
            id: activity.id || activity.Id || Math.random().toString(36).substr(2, 9),
            type: activity.type || activity.Type || 'booking',
            machineName: activity.machineName || activity.MachineName || activity.equipmentName || 'Equipment',
            farmerName: activity.farmerName || activity.FarmerName || 'User',
            action: activity.action || activity.Action || 'made a booking',
            time: activity.createdAt || activity.CreatedAt || new Date().toISOString(),
            status: (activity.status || activity.Status || 'pending').toLowerCase(),
            amount: activity.totalAmount || activity.TotalAmount || activity.amount || 0
          }));
          setActivity(transformedActivity);
        }
      } catch (error) {
        console.error('Error fetching owner earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4">
            <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ 
              backgroundColor: 'rgba(22, 163, 74, 0.1)', 
              color: '#22c55e',
              border: '1px solid rgba(22, 163, 74, 0.2)'
            }}>
              Revenue Analytics
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>Fleet Earnings</h1>
          <p className="text-lg" style={{ color: '#a1a1a1' }}>Monitor your machinery rental income and financial performance.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, icon: FiDollarSign, color: '#22c55e' },
            { label: 'Active Rentals', value: stats.activeRentals || 0, icon: FiTrendingUp, color: '#3b82f6' },
            { label: 'Fleet Size', value: stats.totalMachines || 0, icon: FiCalendar, color: '#a855f7' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <item.icon className="text-xl" style={{ color: item.color }} />
              </div>
              <p className="text-sm mb-2" style={{ color: '#a1a1a1' }}>{item.label}</p>
              <h3 className="text-3xl font-bold" style={{ color: '#ffffff' }}>{item.value}</h3>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Recent Transactions</h2>
            <div className="flex gap-3">
              <label htmlFor="earnings-filter" className="sr-only">Filter earnings</label>
              <button id="earnings-filter" className="p-3 rounded-xl transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#a1a1a1' }}><FiFilter /></button>
              <label htmlFor="earnings-download" className="sr-only">Download earnings</label>
              <button id="earnings-download" className="p-3 rounded-xl transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#a1a1a1' }}><FiDownload /></button>
            </div>
          </div>

          <div className="space-y-4">
            {activity.filter(a => a.status === 'completed' || a.status === 'active').map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl flex items-center justify-between transition-all hover:bg-white/10" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <FiDollarSign className="text-xl text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{item.machineName}</p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#666666' }}>
                      <FiCalendar className="text-xs" />
                      <span>{new Date(item.time).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                      <span className="text-gray-400 font-medium">Farmer: {item.farmerName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-500">+₹{(item.amount || 0).toLocaleString()}</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
            {activity.filter(a => a.status === 'completed' || a.status === 'active').length === 0 && (
              <div className="text-center py-24 rounded-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <FiDollarSign className="text-6xl mx-auto mb-6 text-gray-800" />
                <p className="text-xl font-medium" style={{ color: '#666666' }}>No transactions recorded yet.</p>
                <p className="text-sm mt-2" style={{ color: '#444444' }}>Earnings will appear here once rentals are active or completed.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerEarnings;
