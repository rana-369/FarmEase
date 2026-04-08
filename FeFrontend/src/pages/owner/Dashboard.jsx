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

  // Owner role color config
  const ownerColor = {
    start: '#3b82f6',
    end: '#4f46e5',
    glow: 'rgba(59, 130, 246, 0.15)'
  };

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Owner Dashboard</h1>
          <p className="page-subtitle-new">Manage your equipment fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="logo-icon-new"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: `linear-gradient(135deg, ${ownerColor.start} 0%, ${ownerColor.end} 100%)`,
              boxShadow: `0 8px 32px ${ownerColor.start}35`
            }}
          >
            <FiTruck />
          </motion.div>
        </div>
      </motion.div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="stat-card-new"
              >
                <div className="stat-info">
                  <p className="stat-title-new">{stat.title}</p>
                  <h3 className="stat-value-new">{stat.value}</h3>
                  <div className="stat-trend-new up">
                    <span>{stat.change}</span>
                  </div>
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="table-container-new p-6 mb-8"
        >
          <h2 className="table-title-new mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="quick-action-card"
              >
                <div 
                  className="quick-action-card-icon"
                  style={{ 
                    background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`,
                    color: action.color
                  }}
                >
                  <action.icon />
                </div>
                <p className="quick-action-card-label">{action.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="table-container-new p-6"
        >
          <div className="table-header-new" style={{ border: 'none', padding: '0 0 16px 0' }}>
            <div className="flex items-center gap-3">
              <div 
                className="stat-icon-new"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  color: '#a855f7'
                }}
              >
                <FiClock />
              </div>
              <h2 className="table-title-new">Recent Activity</h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/owner/requests')}
              className="secondary-button flex items-center gap-1.5" 
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              View All <FiArrowUpRight className="w-3 h-3" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="stat-card-new flex items-center justify-between"
                style={{ padding: '16px' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="nav-item-icon"
                    style={{ 
                      background: activity.type === 'booking' 
                        ? `linear-gradient(135deg, ${ownerColor.start}20 0%, ${ownerColor.end}15 100%)`
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                      color: activity.type === 'booking' ? ownerColor.start : '#10b981'
                    }}
                  >
                    {activity.type === 'booking' ? <FiCalendar /> : <FiCheckCircle />}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>
                      {activity.farmerName} booked {activity.machineName}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{activity.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {activity.amount && (
                    <span className="font-bold text-lg" style={{ color: '#10b981' }}>₹{activity.amount.toLocaleString()}</span>
                  )}
                  <span 
                    className={`badge ${activity.status === 'completed' ? 'badge-success' : 'badge-warning'}`}
                  >
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <div 
                  className="stat-icon-new mx-auto mb-4"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'rgba(255,255,255,0.4)' }}
                >
                  <FiClock />
                </div>
                <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
    </div>
  );
};

export default OwnerDashboard;
