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
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <FiSun className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Farmer Dashboard</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Manage your equipment rentals</p>
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

        {/* Recent Bookings */}
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
              >
                <FiPackage className="text-lg" style={{ color: '#22c55e' }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Recent Rentals</h2>
            </div>
            <button 
              onClick={() => navigate('/farmer/bookings')}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/5" 
              style={{ color: '#22c55e' }}
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {recentBookings.length > 0 ? recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <FiTruck className="text-lg" style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: '#ffffff' }}>{booking.machineName}</h3>
                    <p className="text-xs" style={{ color: '#666666' }}>{booking.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#888888' }}>
                    <FiCalendar className="text-sm" />
                    <span>{booking.startDate}</span>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ 
                      backgroundColor: booking.status.toLowerCase() === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                      color: booking.status.toLowerCase() === 'active' ? '#22c55e' : '#a855f7'
                    }}
                  >
                    {booking.status}
                  </span>
                  <span className="font-semibold" style={{ color: '#22c55e' }}>₹{booking.totalCost.toLocaleString()}</span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <FiPackage className="text-3xl" style={{ color: '#333333' }} />
                </div>
                <p className="mb-4" style={{ color: '#666666' }}>No rentals yet</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/farmer/machines')}
                  className="px-6 py-3 rounded-xl font-medium"
                  style={{ 
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#ffffff'
                  }}
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
            className="p-6 rounded-2xl"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/farmer/machines')}
                className="w-full flex items-center justify-between p-4 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff'
                }}
              >
                <div className="flex items-center gap-3">
                  <FiTruck className="text-lg" />
                  <span className="font-medium">Browse Equipment</span>
                </div>
                <FiArrowUpRight />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/farmer/bookings')}
                className="w-full flex items-center justify-between p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-center gap-3">
                  <FiPackage className="text-lg" />
                  <span className="font-medium">My Bookings</span>
                </div>
                <FiArrowUpRight />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl"
            style={{ 
              background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
              >
                <FiTrendingUp className="text-lg" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Agricultural Insights</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#888888', lineHeight: '1.6' }}>
              Access weather forecasts, crop health monitoring, and market price trends for your area.
            </p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full p-4 rounded-xl font-medium"
              style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              View Insights
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
