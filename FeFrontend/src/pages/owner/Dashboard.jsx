import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiTrendingUp, FiClock, FiCalendar, FiUsers, FiPlus, FiCheckCircle, FiArrowUpRight } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getOwnerStats, getOwnerEquipment, getOwnerActivity } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeRentals: 0,
    totalEarnings: 0,
    pendingRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, equipmentData, activityData] = await Promise.all([
        getOwnerStats().catch(err => { if (import.meta.env.DEV) console.error('Stats fetch failed:', err); return null; }),
        getOwnerEquipment().catch(err => { if (import.meta.env.DEV) console.error('Equipment fetch failed:', err); return []; }),
        getOwnerActivity().catch(err => { if (import.meta.env.DEV) console.error('Activity fetch failed:', err); return []; })
      ]);
      
      if (import.meta.env.DEV) {
        console.log('--- OWNER DASHBOARD DEBUG ---');
        console.log('Raw statsData from backend:', statsData);
        console.log('Raw equipmentData from backend:', equipmentData);
        console.log('------------------------------');
      }
      
      if (statsData) {
        // Backend returns OwnerDashboardStatsDto with specific property names
        setStats({
          totalMachines: statsData.totalMachines ?? statsData.TotalMachines ?? 0,
          activeRentals: statsData.activeBookings ?? statsData.ActiveBookings ?? 0,
          totalEarnings: statsData.totalRevenue ?? statsData.TotalRevenue ?? 0,
          pendingRequests: statsData.pendingBookings ?? statsData.PendingBookings ?? 0
        });
        
        if (statsData.debugInfo) {
          if (import.meta.env.DEV) {
            console.log('Sync Info:', {
              lastSync: statsData.lastSync,
              userId: statsData.debugInfo.userId,
              machines: statsData.debugInfo.foundMachines,
              bookings: statsData.debugInfo.foundBookings
            });
          }
        }
      } else {
        setStats({
          totalMachines: 0,
          activeRentals: 0,
          totalEarnings: 0,
          pendingRequests: 0
        });
      }
      
      const transformedActivity = (activityData || []).map(activity => {
        const totalAmount = activity.totalAmount || activity.TotalAmount || activity.amount || 0;
        const platformFee = activity.platformFee || activity.PlatformFee || 0;
        const baseAmount = activity.baseAmount || activity.BaseAmount || (totalAmount - platformFee);
        
        return {
          id: activity.id || activity.Id || Math.random().toString(36).substr(2, 9),
          type: activity.type || activity.Type || 'booking',
          machineName: activity.machineName || activity.MachineName || activity.equipmentName || 'Equipment',
          farmerName: activity.farmerName || activity.FarmerName || activity.userName || 'User',
          action: activity.action || activity.Action || 'made a booking',
          time: activity.createdAt || activity.CreatedAt ? new Date(activity.createdAt || activity.CreatedAt).toLocaleDateString() : 'Recently',
          status: (activity.status || activity.Status || 'pending').toLowerCase(),
          amount: baseAmount,
          totalAmount: totalAmount,
          platformFee: platformFee
        };
      });
      
      setRecentActivity(transformedActivity);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching dashboard data:', error);
      }
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Machines',
      value: stats.totalMachines,
      icon: FiTruck,
      color: '#3b82f6',
      change: stats.totalMachines > 0 ? `${stats.totalMachines}` : '0'
    },
    {
      title: 'Active Rentals',
      value: stats.activeRentals,
      icon: FiClock,
      color: '#22c55e',
      change: stats.activeRentals > 0 ? `${stats.activeRentals}` : '0'
    },
    {
      title: 'Total Earnings',
      value: `₹${(stats.totalEarnings || 0).toLocaleString()}`,
      icon: FiTrendingUp,
      color: '#a855f7',
      change: stats.totalEarnings > 0 ? 'Live' : '0'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: FiCalendar,
      color: '#f59e0b',
      change: stats.pendingRequests > 0 ? `${stats.pendingRequests}` : '0'
    }
  ];

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

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
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
              <FiTruck className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Owner Dashboard</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Manage your equipment fleet</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-5 rounded-2xl cursor-pointer relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
                <div className="flex items-center justify-between mb-4 relative">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <Icon className="text-lg" style={{ color: stat.color }} />
                  </div>
                  <span 
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                      border: `1px solid ${stat.color}25`,
                      color: stat.color 
                    }}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1 relative" style={{ color: '#ffffff' }}>{stat.value}</h3>
                <p className="text-sm font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl mb-8 relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }} />
          <h2 className="text-lg font-bold mb-4 relative" style={{ color: '#ffffff' }}>Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {[
              { icon: FiPlus, label: 'Add Machinery', path: '/owner/add-machine', color: '#10b981' },
              { icon: FiCalendar, label: 'Rental Requests', path: '/owner/requests', color: '#3b82f6' },
              { icon: FiTrendingUp, label: 'Fleet Earnings', path: '/owner/earnings', color: '#a855f7' }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="p-5 rounded-2xl cursor-pointer text-center relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${action.color}08 0%, ${action.color}04 100%)`,
                  border: `1px solid ${action.color}20`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${action.color}10 0%, transparent 60%)` }} />
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}10 100%)`,
                    border: `1px solid ${action.color}25`
                  }}
                >
                  <action.icon className="text-lg" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-semibold relative" style={{ color: '#ffffff' }}>{action.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)' }} />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.25)'
                }}
              >
                <FiClock className="text-lg" style={{ color: '#a855f7' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>Recent Activity</h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/owner/requests')}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5" 
              style={{ 
                color: '#10b981',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              View All <FiArrowUpRight className="w-3 h-3" />
            </motion.button>
          </div>

          <div className="space-y-3 relative">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center justify-between p-4 rounded-2xl transition-all group"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                      background: activity.type === 'booking' 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                      border: activity.type === 'booking' 
                        ? '1px solid rgba(59, 130, 246, 0.25)'
                        : '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {activity.type === 'booking' ? (
                      <FiCalendar className="text-lg" style={{ color: '#3b82f6' }} />
                    ) : (
                      <FiCheckCircle className="text-lg" style={{ color: '#10b981' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>
                      {activity.farmerName} booked {activity.machineName}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{activity.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {activity.amount && (
                    <span className="font-bold text-lg" style={{ color: '#10b981' }}>₹{activity.amount.toLocaleString()}</span>
                  )}
                  <span 
                    className="px-4 py-2 rounded-full text-xs font-semibold"
                    style={{ 
                      background: activity.status === 'completed' 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                      border: activity.status === 'completed' 
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : '1px solid rgba(245, 158, 11, 0.25)',
                      color: activity.status === 'completed' ? '#10b981' : '#f59e0b'
                    }}
                  >
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <FiClock className="text-3xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
                <p className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
