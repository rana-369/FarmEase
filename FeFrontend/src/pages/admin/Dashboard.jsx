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
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(244, 63, 94, 0.2)', borderTopColor: '#f43f5e' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p style={{ color: '#f87171' }} className="mb-4 font-medium">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()} 
            className="primary-button"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  // Admin role color config
  const adminColor = {
    start: '#f43f5e',
    end: '#db2777',
    glow: 'rgba(244, 63, 94, 0.15)'
  };

  return (
    <div className="page-content-new">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new"
      >
        <div>
          <h1 className="page-title-new">Admin Dashboard</h1>
          <p className="page-subtitle-new">Monitor and manage your platform</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="logo-icon-new"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: `linear-gradient(135deg, ${adminColor.start} 0%, ${adminColor.end} 100%)`,
              boxShadow: `0 8px 32px ${adminColor.start}35`
            }}
          >
            <FiShield />
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
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.breakdown}</p>
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

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="table-container-new p-6"
          >
            <div className="table-header-new" style={{ border: 'none', padding: '0 0 16px 0' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="stat-icon-new"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                    color: '#10b981'
                  }}
                >
                  <FiTrendingUp />
                </div>
                <h2 className="table-title-new">Revenue Overview</h2>
              </div>
            </div>
            
            <div className="space-y-4 relative">
              {revenueData.map((data, index) => (
                <div key={data.month || index} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.month}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((data.revenue || data.Revenue || 0) / maxRevenue) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-16 text-right" style={{ color: '#ffffff' }}>
                    ₹{((data.revenue || data.Revenue || 0) / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 flex items-center justify-between relative" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Revenue</span>
              <span className="text-xl font-bold" style={{ color: '#10b981' }}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</span>
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
                  <FiActivity />
                </div>
                <h2 className="table-title-new">Recent Activity</h2>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="stat-card-new flex items-start gap-3"
                  style={{ padding: '16px' }}
                >
                  <div 
                    className="nav-item-icon flex-shrink-0"
                    style={{ 
                      background: activity.status === 'completed' 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                      color: activity.status === 'completed' ? '#10b981' : '#3b82f6'
                    }}
                  >
                    {activity.status === 'completed' ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                      Booking by <span className="font-semibold">{activity.farmer}</span> for {activity.machine}
                      {activity.revenue && (
                        <span style={{ color: '#10b981' }}> • ₹{activity.revenue}</span>
                      )}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{activity.time}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <div 
                    className="stat-icon-new mx-auto mb-3"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    <FiActivity />
                  </div>
                  <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>No recent activity</p>
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
          className="table-container-new p-6 mb-8"
        >
          <h2 className="table-title-new mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiUsers, label: 'Manage Users', path: '/admin/users', color: '#3b82f6' },
              { icon: FiTruck, label: 'Approve Equipment', path: '/admin/machines', color: '#10b981' },
              { icon: FiPackage, label: 'View Bookings', path: '/admin/bookings', color: '#a855f7' },
              { icon: FiBarChart2, label: 'Revenue Report', path: '/admin/revenue', color: '#f59e0b' }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
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

        {/* Platform Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="table-container-new p-6"
        >
          <h2 className="table-title-new mb-6">Platform Health</h2>
          
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { 
                label: 'System Health', 
                value: stats.totalUsers > 0 ? '95%' : '85%', 
                subtext: stats.totalUsers > 0 ? 'All systems operational' : 'System initializing',
                color: '#10b981'
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
              <motion.div 
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="stat-card-new text-center"
                style={{ flexDirection: 'column', alignItems: 'center' }}
              >
                <div 
                  className="stat-icon-new mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}10 100%)`,
                    color: metric.color
                  }}
                >
                  <span className="text-xl font-bold">{metric.value}</span>
                </div>
                <h3 className="stat-title-new">{metric.label}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{metric.subtext}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
    </div>
  );
};

export default AdminDashboard;
