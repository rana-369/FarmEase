import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiTruck, FiPackage, FiTrendingUp, FiActivity, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiArrowRight, FiBarChart2, FiClock, FiBell, FiMoreVertical, FiArrowUpRight, FiShield } from 'react-icons/fi';
import { getAdminDashboardData } from '../../services/dashboardService';
import AdminAnalytics from '../../components/admin/AdminAnalytics';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('Daily');

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getAdminDashboardData();
        
        if (!isMounted) return;

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

  // Calculate meaningful metrics
  const userGrowthRate = stats.totalUsers > 0 
    ? Math.round(((stats.totalFarmers + stats.totalOwners) / stats.totalUsers) * 100) 
    : 0;
  const bookingRate = stats.totalMachines > 0 
    ? Math.round((stats.totalBookings / stats.totalMachines) * 100)
    : 0;
  const activeRate = stats.totalBookings > 0 
    ? Math.round((stats.activeRentals / stats.totalBookings) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      subtitle: `${stats.totalFarmers} Farmers, ${stats.totalOwners} Owners`,
      icon: FiUsers,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)'
    },
    {
      title: 'Total Machines',
      value: (stats.totalMachines || 0).toLocaleString(),
      subtitle: `${stats.pendingApprovals} Pending Approval`,
      icon: FiTruck,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)'
    },
    {
      title: 'Total Bookings',
      value: (stats.totalBookings || 0).toLocaleString(),
      subtitle: `${activeRate}% Currently Active`,
      icon: FiPackage,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      title: 'Platform Revenue',
      value: stats.totalRevenue >= 1000 
        ? `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`
        : `₹${(stats.totalRevenue || 0).toFixed(0)}`,
      subtitle: '10% Commission',
      icon: FiTrendingUp,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)'
    }
  ];

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'var(--border-primary)', borderTopColor: '#f43f5e' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)' }} />
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

  // Admin role color config
  const adminColor = {
    start: '#f43f5e',
    end: '#db2777',
    glow: 'rgba(244, 63, 94, 0.15)',
    accent: '#ec4899'
  };

  // Platform Score calculation (0-1000 scale based on platform metrics)
  const platformScore = Math.min(1000, Math.max(0,
    Math.round(
      (stats.totalUsers > 0 ? Math.min(250, stats.totalUsers / 2) : 0) +
      (stats.totalMachines > 0 ? Math.min(250, stats.totalMachines * 3) : 0) +
      (activeRate * 3) +
      (stats.totalRevenue > 0 ? Math.min(300, stats.totalRevenue / 80) : 0) +
      (stats.totalBookings > 0 ? 100 : 0)
    )
  ));

  return (
    <div className="dashboard-modern">
      {/* Header - Welcome Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header-modern"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ 
              background: `linear-gradient(135deg, ${adminColor.start} 0%, ${adminColor.end} 100%)`,
              color: 'white'
            }}
          >
            <FiShield />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome! Admin
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Monitor and manage your platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: 'var(--bg-button)', border: '1px solid var(--border-primary)' }}
          >
            <FiBell style={{ color: 'var(--text-secondary)' }} />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium" style={{ background: '#ec4899', color: 'white' }}>5</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="dashboard-grid-modern">
        {/* Left Column - Stats & Charts */}
        <div className="dashboard-left-col">
          {/* Current Stats Row - 5 Circular Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stats-row-modern"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="stat-circle-modern"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: stat.bgColor, color: stat.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <FiMoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</h3>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{stat.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminAnalytics />
          </motion.div>
        </div>

        {/* Right Column - Platform Score & Quick Actions */}
        <div className="dashboard-right-col">
          {/* Platform Score Gauge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="gauge-card-modern"
          >
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Platform Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40" viewBox="0 0 120 120">
                {/* Background arc */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" 
                  stroke="var(--border-primary)" 
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="235 314"
                  transform="rotate(135 60 60)"
                />
                {/* Value arc */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" 
                  stroke="url(#gaugeGradient)" 
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(platformScore / 1000) * 235} 314`}
                  transform="rotate(135 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{platformScore}</span>
                <span className="text-xs px-3 py-1.5 rounded-md mt-1.5 whitespace-nowrap font-semibold tracking-wide" style={{ background: platformScore >= 700 ? 'rgba(16, 185, 129, 0.9)' : platformScore >= 400 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{platformScore >= 700 ? 'Excellent' : platformScore >= 400 ? 'Good' : 'Needs Work'}</span>
              </div>
            </div>
            <div className="flex justify-between mt-4 px-4">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>0</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Score</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>1000</span>
            </div>
          </motion.div>

          {/* Quick Actions - Vertical */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="quick-actions-modern"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Quick Actions</h3>
              <FiMoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            
            {[
              { icon: FiUsers, label: 'Manage Users', path: '/admin/users', color: '#3b82f6' },
              { icon: FiTruck, label: 'Approve Equipment', path: '/admin/machines', color: '#10b981' },
              { icon: FiPackage, label: 'View Bookings', path: '/admin/bookings', color: '#a855f7' },
              { icon: FiBarChart2, label: 'Revenue Report', path: '/admin/revenue', color: '#f59e0b' }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="quick-action-item-modern"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: action.color + '20', color: action.color }}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                <FiArrowUpRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Recent Activity - Bottom Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="activity-table-modern"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
            >
              <FiActivity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Latest platform updates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm theme-select"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}
            >
              View All <FiArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="activity-row-modern"
            >
              <div className="flex items-center gap-4 flex-1">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: activity.status === 'completed' 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                      : `linear-gradient(135deg, ${adminColor.start}20 0%, ${adminColor.end}15 100%)`,
                    color: activity.status === 'completed' ? '#10b981' : adminColor.start
                  }}
                >
                  {activity.status === 'completed' ? <FiCheckCircle className="w-5 h-5" /> : <FiClock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Booking by <span style={{ color: adminColor.accent }}>{activity.farmer}</span> for {activity.machine}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {activity.revenue && (
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue</p>
                    <p className="font-semibold text-sm" style={{ color: '#10b981' }}>₹{activity.revenue}</p>
                  </div>
                )}
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: activity.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: activity.status === 'completed' ? '#10b981' : '#f43f5e'
                  }}
                >
                  {activity.status}
                </span>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--bg-button)' }}
              >
                <FiActivity className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No recent activity</p>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .dashboard-modern {
          padding: 24px;
          min-height: 100vh;
          background: var(--bg-secondary);
        }
        
        .dashboard-header-modern {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          margin-bottom: 24px;
          backdrop-filter: blur(20px);
        }
        
        .dashboard-grid-modern {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .dashboard-left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .dashboard-right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .stats-row-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        .stat-circle-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }
        
        .stat-circle-modern:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-secondary);
        }
        
        .gauge-card-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
        }
        
        .quick-actions-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(20px);
        }
        
        .quick-action-item-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 8px;
        }
        
        .quick-action-item-modern:hover {
          background: var(--bg-button-hover);
        }
        
        .activity-table-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
        }
        
        .activity-row-modern {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-radius: 12px;
          background: var(--bg-input);
          border: 1px solid var(--border-tertiary);
          transition: all 0.2s ease;
        }
        
        .activity-row-modern:hover {
          background: var(--bg-input-focus);
          border-color: var(--border-secondary);
        }
        
        .theme-select option {
          background: var(--bg-card);
          color: var(--text-primary);
        }
        
        @media (max-width: 1280px) {
          .dashboard-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .dashboard-right-col {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .gauge-card-modern,
          .quick-actions-modern {
            flex: 1;
            min-width: 280px;
          }
        }
        
        @media (max-width: 1024px) {
          .stats-row-modern {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .stats-row-modern {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-header-modern {
            flex-direction: column;
            gap: 16px;
          }
          
          .activity-row-modern {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
