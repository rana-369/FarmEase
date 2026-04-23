import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiCalendar, FiTrendingUp, FiClock, FiMapPin, FiArrowUpRight, FiSun, FiCheckCircle } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getFarmerStats, getFarmerBookings } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, bookingsData] = await Promise.all([
        getFarmerStats().catch(() => null),
        getFarmerBookings().catch(() => [])
      ]);
      
      if (statsData) {
        // Backend returns FarmerDashboardStatsDto with specific property names
        setStats({
          totalBookings: statsData.totalBookings ?? statsData.TotalBookings ?? 0,
          activeBookings: statsData.activeBookings ?? statsData.ActiveBookings ?? 0,
          completedBookings: statsData.completedBookings ?? statsData.CompletedBookings ?? 0,
          totalSpent: statsData.totalSpent ?? statsData.TotalSpent ?? 0
        });
      }
      
      const transformedBookings = (bookingsData || []).map(booking => ({
        id: booking.id || booking.Id,
        machineName: booking.machineName || booking.MachineName || 'Equipment',
        ownerName: booking.ownerName || booking.OwnerName || 'Equipment Owner',
        startDate: booking.startDate || (booking.createdAt || booking.CreatedAt)?.split('T')[0] || 'N/A',
        endDate: booking.endDate || booking.EndDate || 'N/A',
        status: booking.status || booking.Status || 'Pending',
        totalCost: booking.totalAmount || booking.TotalAmount || 0
      }));
      
      setRecentBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: FiPackage,
      color: '#22c55e',
      change: '+12%'
    },
    {
      title: 'Active Rentals',
      value: stats.activeBookings,
      icon: FiClock,
      color: '#3b82f6',
      change: '+2'
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      icon: FiCheckCircle,
      color: '#a855f7',
      change: '+10'
    },
    {
      title: 'Total Spent',
      value: `₹${(stats.totalSpent || 0).toLocaleString()}`,
      icon: FiTrendingUp,
      color: '#f59e0b',
      change: 'Live'
    }
  ];

  // Farmer role color config
  const farmerColor = {
    start: '#10b981',
    end: '#059669',
    glow: 'rgba(16, 185, 129, 0.15)'
  };

  if (loading) {
    return (
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content-new px-4 sm:px-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="page-header-new flex-col sm:flex-row gap-4 sm:gap-0"
      >
        <div>
          <h1 className="page-title-new text-xl sm:text-2xl">Farmer Dashboard</h1>
          <p className="page-subtitle-new text-sm sm:text-base">Manage your equipment rentals</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div 
            className="logo-icon-new w-10 h-10 sm:w-12 sm:h-12"
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: `linear-gradient(135deg, ${farmerColor.start} 0%, ${farmerColor.end} 100%)`,
              boxShadow: `0 8px 32px ${farmerColor.start}35`
            }}
          >
            <FiSun className="text-lg sm:text-xl" />
          </motion.div>
        </div>
      </motion.div>

        {/* Stats Grid */}
        <div className="stats-grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="stat-card-new p-4 sm:p-5 min-h-[100px] sm:min-h-[120px]"
              >
                <div className="stat-info">
                  <p className="stat-title-new text-xs sm:text-sm">{stat.title}</p>
                  <h3 className="stat-value-new text-lg sm:text-2xl">{stat.value}</h3>
                  <div className="stat-trend-new up text-xs">
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div 
                  className="stat-icon-new w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl"
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

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="table-container-new p-4 sm:p-6 mb-4 sm:mb-8"
        >
          <div className="table-header-new flex-col sm:flex-row gap-3 sm:gap-0" style={{ border: 'none', padding: '0 0 16px 0' }}>
            <div className="flex items-center gap-3">
              <div 
                className="stat-icon-new w-10 h-10 sm:w-12 sm:h-12"
                style={{ 
                  background: `linear-gradient(135deg, ${farmerColor.start}20 0%, ${farmerColor.end}15 100%)`,
                  color: farmerColor.start
                }}
              >
                <FiPackage className="text-lg sm:text-xl" />
              </div>
              <h2 className="table-title-new text-lg sm:text-xl">Recent Rentals</h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/farmer/bookings')}
              className="secondary-button w-full sm:w-auto min-h-[44px]" 
              style={{ padding: '10px 16px', fontSize: '14px' }}
            >
              View All →
            </motion.button>
          </div>

          <div className="space-y-3">
            {recentBookings.length > 0 ? recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="stat-card-new flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                style={{ padding: '12px sm:16px' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div 
                    className="nav-item-icon w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${farmerColor.start}15 0%, ${farmerColor.end}10 100%)`,
                      color: farmerColor.start
                    }}
                  >
                    <FiTruck className="text-base sm:text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{booking.machineName}</h3>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{booking.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pl-13 sm:pl-0">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    <FiCalendar className="text-xs sm:text-sm" />
                    <span>{booking.startDate}</span>
                  </div>
                  <span 
                    className={`badge text-xs ${booking.status.toLowerCase() === 'active' ? 'badge-success' : 'badge-info'}`}
                  >
                    {booking.status}
                  </span>
                  <span className="font-bold text-base sm:text-lg" style={{ color: farmerColor.start }}>₹{booking.totalCost.toLocaleString()}</span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <div 
                  className="stat-icon-new mx-auto mb-4"
                  style={{ background: 'var(--bg-button)', color: 'var(--text-muted)' }}
                >
                  <FiPackage />
                </div>
                <p className="mb-6 font-medium" style={{ color: 'var(--text-muted)' }}>No rentals yet</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/farmer/machines')}
                  className="primary-button"
                >
                  Browse Equipment
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="table-container-new p-6"
          >
            <h3 className="table-title-new mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/farmer/machines')}
                className="primary-button w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FiTruck />
                  <span>Browse Equipment</span>
                </div>
                <FiArrowUpRight />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/farmer/bookings')}
                className="secondary-button w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FiPackage />
                  <span>My Bookings</span>
                </div>
                <FiArrowUpRight />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="table-container-new p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="stat-icon-new"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)',
                  color: '#3b82f6'
                }}
              >
                <FiTrendingUp />
              </div>
              <h3 className="table-title-new">Agricultural Insights</h3>
            </div>
            <p className="text-sm mb-4 font-medium" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              Access weather forecasts, crop health monitoring, and market price trends for your area.
            </p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => alert('Agricultural Insights feature coming soon! This will include weather forecasts, crop health monitoring, and market price trends.')}
              className="secondary-button w-full"
              style={{ color: '#3b82f6' }}
            >
              View Insights
            </motion.button>
          </motion.div>
        </div>
    </div>
  );
};

export default FarmerDashboard;
