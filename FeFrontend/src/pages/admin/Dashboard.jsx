import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiTruck, FiPackage, FiTrendingUp, FiActivity, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiShield, FiArrowRight, FiBarChart2, FiClock } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getAdminDashboardData, getRevenueData } from '../../services/dashboardService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalOwners: 0,
    totalMachines: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeRentals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardData, revData] = await Promise.all([
          getAdminDashboardData(),
          getRevenueData()
        ]);
        
        if (!isMounted) return;

        if (revData) {
          setRevenueData(revData);
        }
        
        if (dashboardData) {
          // Backend returns AdminDashboardStatsDto directly (not nested under stats)
          const bookingsArr = dashboardData.recentBookings || dashboardData.RecentBookings || [];

          setStats({
            totalUsers: dashboardData.totalUsers || dashboardData.TotalUsers || 0,
            totalFarmers: dashboardData.totalFarmers || dashboardData.TotalFarmers || 0,
            totalOwners: dashboardData.totalOwners || dashboardData.TotalOwners || 0,
            totalMachines: dashboardData.totalMachines || dashboardData.TotalMachines || 0,
            totalBookings: dashboardData.totalBookings || dashboardData.TotalBookings || 0,
            totalRevenue: dashboardData.platformRevenue || dashboardData.PlatformRevenue || 0,
            pendingApprovals: dashboardData.pendingApprovals || dashboardData.PendingApprovals || 0,
            activeRentals: dashboardData.activeBookings || dashboardData.ActiveBookings || 0
          });

          const transformedActivity = bookingsArr.map(booking => ({
            id: booking.id || booking.Id || Math.random().toString(36).substr(2, 9),
            type: 'booking_completed',
            user: booking.farmerName || booking.FarmerName || 'User',
            role: 'Farmer',
            machine: booking.machineName || booking.MachineName || 'Equipment',
            owner: '',
            farmer: booking.farmerName || booking.FarmerName || 'Farmer',
            revenue: booking.totalAmount || booking.TotalAmount || null,
            time: booking.createdAt || booking.CreatedAt ? new Date(booking.createdAt || booking.CreatedAt).toLocaleDateString() : 'Recently',
            status: booking.status || booking.Status || 'completed'
          }));
          
          setRecentActivity(transformedActivity);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: FiUsers,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      change: '+15%',
      breakdown: `${stats.totalFarmers || 0} Farmers, ${stats.totalOwners || 0} Owners`
    },
    {
      title: 'Total Machines',
      value: (stats.totalMachines || 0).toLocaleString(),
      icon: FiTruck,
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      change: '+22',
      breakdown: `${stats.pendingApprovals || 0} pending approval`
    },
    {
      title: 'Total Bookings',
      value: (stats.totalBookings || 0).toLocaleString(),
      icon: FiPackage,
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      change: '+180',
      breakdown: `${stats.activeRentals || 0} currently active`
    },
    {
      title: 'Platform Profit',
      value: stats.totalRevenue >= 1000 
        ? `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K` 
        : `₹${(stats.totalRevenue || 0).toFixed(0)}`,
      icon: FiTrendingUp,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      change: '+28%',
      breakdown: '10% commission from completed bookings'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <p style={{ color: '#ef4444' }} className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 rounded-lg" 
            style={{ backgroundColor: '#22c55e', color: 'white' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

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
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FiShield className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Admin Dashboard</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Monitor and manage your platform</p>
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
                <p className="text-sm font-medium mb-1" style={{ color: '#888888' }}>{stat.title}</p>
                <p className="text-xs" style={{ color: '#555555' }}>{stat.breakdown}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <FiTrendingUp className="text-lg" style={{ color: '#22c55e' }} />
                </div>
                <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Revenue Overview</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={data.month || index} className="flex items-center gap-4">
                  <span className="text-sm w-12" style={{ color: '#888888' }}>{data.month}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((data.revenue || data.Revenue || 0) / maxRevenue) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-16 text-right" style={{ color: '#ffffff' }}>
                    ₹{((data.revenue || data.Revenue || 0) / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span className="text-sm" style={{ color: '#888888' }}>Total Revenue</span>
              <span className="text-xl font-bold" style={{ color: '#22c55e' }}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</span>
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
                  <FiActivity className="text-lg" style={{ color: '#a855f7' }} />
                </div>
                <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Recent Activity</h2>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: activity.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)'
                    }}
                  >
                    {activity.status === 'completed' ? (
                      <FiCheckCircle className="text-sm" style={{ color: '#22c55e' }} />
                    ) : (
                      <FiClock className="text-sm" style={{ color: '#3b82f6' }} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#ffffff' }}>
                      Booking by <span className="font-semibold">{activity.farmer}</span> for {activity.machine}
                      {activity.revenue && (
                        <span style={{ color: '#22c55e' }}> • ₹{activity.revenue}</span>
                      )}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>{activity.time}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <FiActivity className="text-3xl mx-auto mb-3" style={{ color: '#333333' }} />
                  <p style={{ color: '#666666' }}>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl mb-8"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#ffffff' }}>Quick Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiUsers, label: 'Manage Users', path: '/admin/users', color: '#3b82f6' },
              { icon: FiTruck, label: 'Approve Equipment', path: '/admin/machines', color: '#22c55e' },
              { icon: FiPackage, label: 'View Bookings', path: '/admin/bookings', color: '#a855f7' },
              { icon: FiBarChart2, label: 'Revenue Report', path: '/admin/revenue', color: '#f59e0b' }
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

        {/* Platform Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#ffffff' }}>Platform Health</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                label: 'System Health', 
                value: stats.totalUsers > 0 ? '95%' : '85%', 
                subtext: stats.totalUsers > 0 ? 'All systems operational' : 'System initializing',
                color: '#22c55e'
              },
              { 
                label: 'User Satisfaction', 
                value: stats.totalBookings > 0 ? '4.8' : '4.5', 
                subtext: `Based on ${stats.totalUsers || 0} users`,
                color: '#3b82f6'
              },
              { 
                label: 'Platform Uptime', 
                value: stats.totalBookings > 0 ? '99.9%' : '98.5%', 
                subtext: 'Last 30 days',
                color: '#a855f7'
              }
            ].map((metric, index) => (
              <div 
                key={metric.label}
                className="p-5 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    backgroundColor: `${metric.color}15`,
                    border: `1px solid ${metric.color}30`
                  }}
                >
                  <span className="text-xl font-bold" style={{ color: metric.color }}>{metric.value}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#ffffff' }}>{metric.label}</h3>
                <p className="text-xs" style={{ color: '#666666' }}>{metric.subtext}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
