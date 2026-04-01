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
        setStats({
          totalMachines: statsData.totalMachines ?? 0,
          activeRentals: statsData.activeRentals ?? 0,
          totalEarnings: statsData.totalEarnings ?? 0,
          pendingRequests: statsData.pendingRequests ?? 0
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiTruck className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Owner Dashboard</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Manage your equipment fleet</p>
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
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl cursor-pointer"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="text-lg" style={{ color: stat.color }} />
                  </div>
                  <span 
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>{stat.value}</h3>
                <p className="text-sm" style={{ color: '#888888' }}>{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl mb-8"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: FiPlus, label: 'Add Machinery', path: '/owner/add-machine', color: '#22c55e' },
              { icon: FiCalendar, label: 'Rental Requests', path: '/owner/requests', color: '#3b82f6' },
              { icon: FiTrendingUp, label: 'Fleet Earnings', path: '/owner/earnings', color: '#a855f7' }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-xl cursor-pointer text-center"
                style={{ 
                  backgroundColor: `${action.color}08`,
                  border: `1px solid ${action.color}20`
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon className="text-lg" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{action.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
              >
                <FiClock className="text-lg" style={{ color: '#a855f7' }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Recent Activity</h2>
            </div>
            <button 
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/5" 
              style={{ color: '#22c55e' }}
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: activity.type === 'booking' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)'
                    }}
                  >
                    {activity.type === 'booking' ? (
                      <FiCalendar className="text-lg" style={{ color: '#3b82f6' }} />
                    ) : (
                      <FiCheckCircle className="text-lg" style={{ color: '#22c55e' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#ffffff' }}>
                      {activity.farmerName} booked {activity.machineName}
                    </p>
                    <p className="text-xs" style={{ color: '#666666' }}>{activity.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {activity.amount && (
                    <span className="font-semibold" style={{ color: '#22c55e' }}>₹{activity.amount.toLocaleString()}</span>
                  )}
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ 
                      backgroundColor: activity.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: activity.status === 'completed' ? '#22c55e' : '#f59e0b'
                    }}
                  >
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <FiClock className="text-3xl" style={{ color: '#333333' }} />
                </div>
                <p style={{ color: '#666666' }}>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
