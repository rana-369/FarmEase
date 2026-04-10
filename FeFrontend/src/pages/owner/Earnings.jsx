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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const completedEarnings = activity
    .filter(a => a.status === 'completed' || a.status === 'active')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTrendingUp className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Earnings</h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Track your rental income</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, color: '#10b981', icon: FiTrendingUp },
            { label: 'Active Rentals', value: stats.activeRentals || 0, color: '#3b82f6', icon: FiTruck },
            { label: 'Fleet Size', value: stats.totalMachines || 0, color: '#a855f7', icon: FiTrendingUp }
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
                  border: `1px solid ${stat.color}20`,
                  textAlign: 'center'
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                    border: `1px solid ${stat.color}30`
                  }}
                >
                  <Icon className="text-lg" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium relative" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-6 relative overflow-hidden" 
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)' }} />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <FiTrendingUp className="text-lg" style={{ color: '#10b981' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl"
                style={{ 
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)'
                }}
              >
                <FiFilter className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl"
                style={{ 
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)'
                }}
              >
                <FiDownload className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="space-y-3 relative">
            {activity.filter(a => a.status === 'completed' || a.status === 'active').map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="p-4 rounded-2xl flex items-center justify-between transition-all group"
                style={{ 
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-secondary)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <FiTrendingUp className="text-lg" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.machineName}</p>
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <FiCalendar className="w-3 h-3" />
                      <span>{new Date(item.time).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.farmerName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: '#10b981' }}>+₹{(item.amount || 0).toLocaleString()}</p>
                  <span 
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#10b981'
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {activity.filter(a => a.status === 'completed' || a.status === 'active').length === 0 && (
              <div className="text-center py-12">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                  style={{ 
                    background: 'var(--bg-button)',
                    border: '1px solid var(--border-secondary)'
                  }}
                >
                  <FiTrendingUp className="text-3xl" style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>No transactions yet</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Earnings will appear here after rentals</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerEarnings;
