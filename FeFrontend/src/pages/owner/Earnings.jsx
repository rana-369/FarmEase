import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiArrowUpRight, FiCalendar, FiFilter, FiDownload, FiTruck, FiClock } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
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
          // Backend returns OwnerDashboardStatsDto with specific property names
          setStats({
            totalEarnings: statsData.totalRevenue ?? statsData.TotalRevenue ?? 0,
            activeRentals: statsData.activeBookings ?? statsData.ActiveBookings ?? 0,
            totalMachines: statsData.totalMachines ?? statsData.TotalMachines ?? 0
          });
        }
        
        if (activityData) {
          const transformedActivity = (activityData || []).map(activity => {
            const totalAmount = activity.totalAmount || activity.TotalAmount || activity.amount || 0;
            const platformFee = activity.platformFee || activity.PlatformFee || 0;
            const baseAmount = activity.baseAmount || activity.BaseAmount || (totalAmount - platformFee);
            
            return {
              id: activity.id || activity.Id || Math.random().toString(36).substr(2, 9),
              type: activity.type || activity.Type || 'booking',
              machineName: activity.machineName || activity.MachineName || activity.equipmentName || 'Equipment',
              farmerName: activity.farmerName || activity.FarmerName || 'User',
              action: activity.action || activity.Action || 'made a booking',
              time: activity.createdAt || activity.CreatedAt || new Date().toISOString(),
              status: (activity.status || activity.Status || 'pending').toLowerCase(),
              amount: baseAmount,
              platformFee: platformFee,
              totalAmount: totalAmount
            };
          });
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

  const completedEarnings = activity
    .filter(a => a.status === 'completed' || a.status === 'active')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

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
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <FiTrendingUp className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Earnings</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Track your rental income</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, color: '#22c55e', icon: FiTrendingUp },
            { label: 'Active Rentals', value: stats.activeRentals || 0, color: '#3b82f6', icon: FiTruck },
            { label: 'Fleet Size', value: stats.totalMachines || 0, color: '#a855f7', icon: FiTrendingUp }
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

        {/* Transactions */}
        <div className="rounded-2xl p-6" style={{ 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>Recent Transactions</h2>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
              >
                <FiFilter className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
              >
                <FiDownload className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="space-y-3">
            {activity.filter(a => a.status === 'completed' || a.status === 'active').map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  >
                    <FiTrendingUp className="text-lg" style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#ffffff' }}>{item.machineName}</p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                      <FiCalendar className="w-3 h-3" />
                      <span>{new Date(item.time).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.farmerName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>+₹{(item.amount || 0).toLocaleString()}</p>
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {activity.filter(a => a.status === 'completed' || a.status === 'active').length === 0 && (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <FiTrendingUp className="text-3xl" style={{ color: '#333333' }} />
                </div>
                <p className="text-sm mb-1" style={{ color: '#ffffff' }}>No transactions yet</p>
                <p className="text-xs" style={{ color: '#666666' }}>Earnings will appear here after rentals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerEarnings;
