import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiCalendar, FiTrendingUp, FiClock, FiMapPin, FiArrowUpRight } from 'react-icons/fi';
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
      // Fetch stats and bookings from backend
      const [statsData, bookingsData] = await Promise.all([
        getFarmerStats().catch(() => null),
        getFarmerBookings().catch(() => [])
      ]);
      
      // Set stats with fallback to zeros
      if (statsData) {
        setStats({
          totalBookings: statsData.totalBookings || 0,
          activeBookings: statsData.activeBookings || 0,
          completedBookings: statsData.completedBookings || 0,
          totalSpent: statsData.totalSpent || 0
        });
      }
      
      // Transform bookings data to match frontend structure
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
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Rentals',
      value: stats.activeBookings,
      icon: FiClock,
      color: '#3b82f6',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      icon: FiTrendingUp,
      color: '#a855f7',
      change: '+10',
      changeType: 'positive'
    },
    {
      title: 'Total Spent',
      value: `₹${(stats.totalSpent || 0).toLocaleString()}`,
      icon: RupeeIcon,
      color: '#f59e0b',
      change: stats.totalSpent > 0 ? 'Live' : '0%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header Section with Gradient */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #16a34a 100%)' }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.15) 0%, transparent 50%)', 
          backgroundSize: '100% 100%'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="mb-6">
                <span className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ 
                  backgroundColor: 'rgba(22, 163, 74, 0.15)', 
                  color: '#22c55e',
                  border: '1px solid rgba(22, 163, 74, 0.3)'
                }}>
                  Farmer Console
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight" style={{ color: '#ffffff' }}>
                Farmer Dashboard
              </h1>
              <p className="text-xl leading-relaxed" style={{ color: '#888888' }}>Welcome back! Manage your equipment rentals and agricultural operations.</p>
            </div>
            <div className="hidden md:block px-8 py-4 rounded-2xl" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)'
            }}>
              <span className="text-base font-semibold" style={{ color: '#22c55e' }}>Farmer Account</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-10 rounded-3xl"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ 
                    backgroundColor: `${stat.color}12`,
                    border: `1px solid ${stat.color}25`
                  }}>
                    <Icon className="text-2xl" style={{ color: stat.color }} />
                  </div>
                  <span className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>{stat.value}</h3>
                <p className="text-base font-medium" style={{ color: '#666666' }}>{stat.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-10 rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold" style={{ color: '#ffffff' }}>Recent Equipment Rentals</h2>
            <button 
              onClick={() => navigate('/farmer/bookings')}
              className="font-semibold text-base px-8 py-3 rounded-xl transition-all" 
              style={{ 
                color: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}
            >
              View All
            </button>
          </div>

          <div className="space-y-6">
            {recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-8 rounded-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-5 mb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ 
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}>
                        <FiTruck className="text-2xl" style={{ color: '#22c55e' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl truncate" style={{ color: '#ffffff' }}>{booking.machineName}</h3>
                        <p className="text-base mt-1" style={{ color: '#666666' }}>{booking.ownerName}</p>
                      </div>
                      <span className="px-5 py-2 rounded-full text-sm font-semibold flex-shrink-0" style={{ 
                        backgroundColor: booking.status.toLowerCase() === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: booking.status.toLowerCase() === 'active' ? '#22c55e' : '#888888',
                        border: booking.status.toLowerCase() === 'active' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-base" style={{ color: '#888888' }}>
                      <FiCalendar className="text-lg" style={{ color: '#22c55e' }} />
                      <span>Rental Period:</span>
                      <span className="font-medium" style={{ color: '#ffffff' }}>{booking.startDate} - {booking.endDate}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>₹{booking.totalCost.toLocaleString()}</p>
                    <p className="text-sm font-semibold uppercase tracking-wider mt-2" style={{ color: '#444444' }}>Total Amount</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {recentBookings.length === 0 && (
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <FiPackage className="text-4xl" style={{ color: '#333333' }} />
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>No rentals found</h3>
              <p className="mb-12 text-xl leading-relaxed" style={{ color: '#666666' }}>You haven't rented any equipment yet. Start your first journey today!</p>
              <button 
                onClick={() => navigate('/farmer/machines')}
                className="px-12 py-5 rounded-2xl font-semibold text-lg transition-all duration-300" 
                style={{ 
                  backgroundColor: '#22c55e', 
                  color: '#000000',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.35)'
                }}
              >
                Browse Equipment
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-12 rounded-3xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <h3 className="text-3xl font-bold mb-10" style={{ color: '#ffffff' }}>Quick Actions</h3>
            <div className="grid grid-cols-1 gap-5">
              <button 
                onClick={() => navigate('/farmer/machines')}
                className="group flex items-center justify-between p-7 rounded-2xl font-semibold text-lg transition-all duration-300" 
                style={{ backgroundColor: '#22c55e', color: '#000000', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)' }}
              >
                <div className="flex items-center gap-5">
                  <FiTruck className="text-2xl" />
                  <span>Browse Equipment</span>
                </div>
                <FiArrowUpRight className="text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/farmer/bookings')}
                className="group flex items-center justify-between p-7 rounded-2xl font-semibold text-lg transition-all duration-300" 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-center gap-5">
                  <FiPackage className="text-2xl" />
                  <span>My Bookings</span>
                </div>
                <FiArrowUpRight className="text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-12 rounded-3xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <h3 className="text-3xl font-bold mb-6" style={{ color: '#ffffff' }}>Agricultural Insights</h3>
            <p className="text-xl mb-12 leading-relaxed" style={{ color: '#666666' }}>
              Access local weather forecasts, crop health monitoring, and expert market price trends tailored for your location.
            </p>
            <button className="w-full py-6 rounded-2xl font-semibold text-lg transition-all duration-300" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              View Insights
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
