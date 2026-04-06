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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiSun className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Farmer Dashboard</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Manage your equipment rentals</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-6 rounded-3xl cursor-pointer group relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}10 0%, transparent 60%)` }} />
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}25 0%, ${stat.color}15 100%)`,
                      border: `1px solid ${stat.color}30`,
                      boxShadow: `0 4px 20px ${stat.color}20`
                    }}
                  >
                    <Icon className="text-lg relative z-10" style={{ color: stat.color }} />
                  </div>
                  <span 
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                      border: `1px solid ${stat.color}30`,
                      color: stat.color 
                    }}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>{stat.value}</h3>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Bookings */}
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
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)' }} />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <FiPackage className="text-lg" style={{ color: '#10b981' }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Recent Rentals</h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/farmer/bookings')}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all animated-underline" 
              style={{ color: '#10b981' }}
            >
              View All →
            </motion.button>
          </div>

          <div className="space-y-3 relative">
            {recentBookings.length > 0 ? recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center justify-between p-4 rounded-2xl transition-all group"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <FiTruck className="text-lg" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#ffffff' }}>{booking.machineName}</h3>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{booking.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FiCalendar className="text-sm" />
                    <span>{booking.startDate}</span>
                  </div>
                  <span 
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ 
                      background: booking.status.toLowerCase() === 'active' 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
                      border: booking.status.toLowerCase() === 'active' 
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(168, 85, 247, 0.3)',
                      color: booking.status.toLowerCase() === 'active' ? '#10b981' : '#a855f7'
                    }}
                  >
                    {booking.status}
                  </span>
                  <span className="font-bold text-lg" style={{ color: '#10b981' }}>₹{booking.totalCost.toLocaleString()}</span>
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
                  <FiPackage className="text-3xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
                <p className="mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>No rentals yet</p>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/farmer/machines')}
                  className="px-6 py-3.5 rounded-2xl font-semibold relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10">Browse Equipment</span>
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
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/farmer/machines')}
                className="w-full flex items-center justify-between p-4 rounded-2xl relative overflow-hidden group"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="flex items-center gap-3 relative z-10">
                  <FiTruck className="text-lg" />
                  <span className="font-semibold">Browse Equipment</span>
                </div>
                <FiArrowUpRight className="relative z-10" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/farmer/bookings')}
                className="w-full flex items-center justify-between p-4 rounded-2xl transition-all group"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-center gap-3">
                  <FiPackage className="text-lg" style={{ color: '#10b981' }} />
                  <span className="font-semibold">My Bookings</span>
                </div>
                <FiArrowUpRight style={{ color: 'rgba(255,255,255,0.8)' }} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.02) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)' }} />
            <div className="flex items-center gap-3 mb-4 relative">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.25)'
                }}
              >
                <FiTrendingUp className="text-lg" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Agricultural Insights</h3>
            </div>
            <p className="text-sm mb-4 font-medium relative" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
              Access weather forecasts, crop health monitoring, and market price trends for your area.
            </p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => alert('Agricultural Insights feature coming soon! This will include weather forecasts, crop health monitoring, and market price trends.')}
              className="w-full p-4 rounded-2xl font-semibold relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.25)'
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
