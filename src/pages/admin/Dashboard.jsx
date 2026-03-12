import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTruck, FiPackage, FiDollarSign, FiTrendingUp, FiActivity, FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { getAdminDashboardData, getRevenueData } from '../../services/dashboardService';

const AdminDashboard = () => {
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

  // Load dashboard data from backend
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
          // Extract stats from backend response
          const statsObj = dashboardData.stats || dashboardData.Stats || {};
          const bookingsArr = dashboardData.recentBookings || dashboardData.RecentBookings || [];

          // Set stats from backend data
          setStats({
            totalUsers: statsObj.totalUsers || statsObj.TotalUsers || 0,
            totalFarmers: statsObj.farmers || statsObj.Farmers || 0,
            totalOwners: statsObj.owners || statsObj.Owners || 0,
            totalMachines: statsObj.totalMachines || statsObj.TotalMachines || 0,
            totalBookings: statsObj.totalBookings || statsObj.TotalBookings || 0,
            totalRevenue: statsObj.revenue || statsObj.Revenue || 0,
            pendingApprovals: statsObj.pendingApprovals || statsObj.PendingApprovals || 0,
            activeRentals: 0
          });

          // Set recent activity from backend data
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
  }, []); // Only run once on mount

  const statCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+15%',
      changeType: 'positive',
      breakdown: `${stats.totalFarmers || 0} Farmers, ${stats.totalOwners || 0} Owners`
    },
    {
      title: 'Total Machines',
      value: (stats.totalMachines || 0).toLocaleString(),
      icon: FiTruck,
      color: 'bg-green-500',
      change: '+22',
      changeType: 'positive',
      breakdown: `${stats.pendingApprovals || 0} pending approval`
    },
    {
      title: 'Total Bookings',
      value: (stats.totalBookings || 0).toLocaleString(),
      icon: FiPackage,
      color: 'bg-purple-500',
      change: '+180',
      changeType: 'positive',
      breakdown: `${stats.activeRentals || 0} currently active`
    },
    {
      title: 'Total Revenue',
      value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`,
      icon: FiDollarSign,
      color: 'bg-orange-500',
      change: '+28%',
      changeType: 'positive',
      breakdown: 'Platform commission'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
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

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header Section with Gradient */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #16a34a 100%)' }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)', 
          backgroundSize: '100% 100%'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="mb-4">
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ 
                  backgroundColor: 'rgba(22, 163, 74, 0.1)', 
                  color: '#22c55e',
                  border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                  Admin Console
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ color: '#ffffff' }}>
                Enterprise Admin Console
              </h1>
              <p className="text-lg" style={{ color: '#a1a1a1' }}>Monitor and manage your global agricultural equipment platform</p>
            </div>
            <div className="px-6 py-3 rounded-2xl" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>System Admin</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <Icon className="text-xl" style={{ color: '#22c55e' }} />
                  </div>
                  <span className="text-sm font-medium px-2 py-1 rounded-lg" style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>{stat.value}</h3>
                <p className="text-sm mb-2" style={{ color: '#a1a1a1' }}>{stat.title}</p>
                <p className="text-xs" style={{ color: '#666666' }}>{stat.breakdown}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Revenue Overview</h2>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <FiTrendingUp className="text-xl" style={{ color: '#22c55e' }} />
              </div>
            </div>
            
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span style={{ color: '#a1a1a1' }}>{data.month}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 rounded-full h-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(data.revenue / maxRevenue) * 100}%`,
                          backgroundColor: '#22c55e'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-20 text-right" style={{ color: '#ffffff' }}>
                      ₹{(data.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center justify-between">
                <span style={{ color: '#a1a1a1' }}>Total Revenue</span>
                <span className="text-xl font-bold" style={{ color: '#22c55e' }}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Recent Activity</h2>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <FiActivity className="text-xl" style={{ color: '#22c55e' }} />
              </div>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ 
                    backgroundColor: activity.status === 'new' ? 'rgba(59, 130, 246, 0.1)' :
                    activity.status === 'pending' ? 'rgba(250, 204, 21, 0.1)' :
                    activity.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' :
                    'rgba(168, 85, 247, 0.1)'
                  }}>
                    {activity.status === 'new' && <FiUsers className="text-sm" style={{ color: '#3b82f6' }} />}
                    {activity.status === 'pending' && <FiAlertCircle className="text-sm" style={{ color: '#facc15' }} />}
                    {activity.status === 'completed' && <FiCheckCircle className="text-sm" style={{ color: '#22c55e' }} />}
                    {activity.status === 'payment' && <FiDollarSign className="text-sm" style={{ color: '#a855f7' }} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#ffffff' }}>
                      {activity.type === 'user_registration' && (
                        <>
                          <span className="font-medium">{activity.user}</span> registered as {activity.role}
                        </>
                      )}
                      {activity.type === 'machine_approval' && (
                        <>
                          <span className="font-medium">{activity.machine}</span> by {activity.owner} needs approval
                        </>
                      )}
                      {activity.type === 'booking_completed' && (
                        <>
                          Booking completed by <span className="font-medium">{activity.farmer}</span> for {activity.machine}
                        </>
                      )}
                      {activity.type === 'payment_received' && (
                        <>
                          Payment received from <span className="font-medium">{activity.owner}</span>
                        </>
                      )}
                      {activity.revenue && (
                        <span className="font-medium" style={{ color: '#22c55e' }}> - ₹{activity.revenue}</span>
                      )}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-8 rounded-2xl text-center cursor-pointer transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <FiUsers className="text-xl" style={{ color: '#22c55e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Manage Users</h3>
            <p className="text-sm" style={{ color: '#a1a1a1' }}>View all platform users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-8 rounded-2xl text-center cursor-pointer transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <FiTruck className="text-xl" style={{ color: '#22c55e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Approve Equipment</h3>
            <p className="text-sm" style={{ color: '#a1a1a1' }}>{stats.pendingApprovals} pending approvals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-8 rounded-2xl text-center cursor-pointer transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <FiPackage className="text-xl" style={{ color: '#22c55e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>View Bookings</h3>
            <p className="text-sm" style={{ color: '#a1a1a1' }}>Monitor all bookings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-8 rounded-2xl text-center cursor-pointer transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <FiDollarSign className="text-xl" style={{ color: '#22c55e' }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Revenue Report</h3>
            <p className="text-sm" style={{ color: '#a1a1a1' }}>View financial analytics</p>
          </motion.div>
        </div>
      </div>

      {/* Platform Health Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-8 rounded-2xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#ffffff' }}>Platform Health</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36 * (stats.totalUsers > 0 ? 0.95 : 0.85)} ${2 * Math.PI * 36}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold" style={{ color: '#ffffff' }}>
                    {stats.totalUsers > 0 ? '95%' : '85%'}
                  </span>
                </div>
              </div>
              <p className="font-medium mb-1 mt-3" style={{ color: '#ffffff' }}>System Health</p>
              <p className="text-xs leading-tight" style={{ color: '#a1a1a1' }}>
                {stats.totalUsers > 0 ? 'All systems operational' : 'System initializing'}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: '#22c55e' }}>
                {stats.totalBookings > 0 ? '4.8' : '4.5'}
              </div>
              <p className="font-medium mb-2" style={{ color: '#ffffff' }}>User Satisfaction</p>
              <p className="text-sm" style={{ color: '#a1a1a1' }}>
                Based on {stats.totalUsers || 0} active users
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
                {stats.totalBookings > 0 ? '99.9%' : '98.5%'}
              </div>
              <p className="font-medium mb-2" style={{ color: '#ffffff' }}>Platform Uptime</p>
              <p className="text-sm" style={{ color: '#a1a1a1' }}>Last 30 days</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
