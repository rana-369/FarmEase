import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiCalendar, FiTrendingUp, FiClock, FiMapPin, FiArrowUpRight, FiSun, FiCheckCircle, FiBell, FiMoreVertical, FiDollarSign, FiActivity, FiCloud, FiArrowRight } from 'react-icons/fi';
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

  const completionRate = stats.totalBookings > 0 
    ? Math.round((stats.completedBookings / stats.totalBookings) * 100) 
    : 0;
  const activeRate = stats.totalBookings > 0 
    ? Math.round((stats.activeBookings / stats.totalBookings) * 100) 
    : 0;

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      subtitle: 'All time bookings',
      icon: FiPackage,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Active Rentals',
      value: `${activeRate}%`,
      subtitle: `${stats.activeBookings} Currently Active`,
      icon: FiClock,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      title: 'Completed',
      value: `${completionRate}%`,
      subtitle: `${stats.completedBookings} Completed`,
      icon: FiCheckCircle,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)'
    },
    {
      title: 'Total Spent',
      value: stats.totalSpent >= 1000 
        ? `₹${(stats.totalSpent / 1000).toFixed(1)}K`
        : `₹${stats.totalSpent}`,
      subtitle: 'Total expenditure',
      icon: FiDollarSign,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)'
    }
  ];

  // Farmer role color config
  const farmerColor = {
    start: '#10b981',
    end: '#059669',
    glow: 'rgba(16, 185, 129, 0.15)',
    accent: '#22c55e'
  };

  // Rental Score calculation (0-1000 scale based on rental activity)
  const rentalScore = Math.min(1000, Math.max(0, 
    Math.round(
      (completionRate * 3) + 
      (activeRate * 2) + 
      (stats.totalBookings > 0 ? 200 : 0) +
      (stats.totalSpent > 0 ? Math.min(300, stats.totalSpent / 100) : 0)
    )
  ));

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '56px',
            height: '56px',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: '#10b981',
            borderRadius: '16px',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            animation: 'pulse 2s ease-in-out infinite',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header - Welcome Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '20px',
          marginBottom: '24px',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${farmerColor.start} 0%, ${farmerColor.end} 100%)`,
            color: 'white'
          }}>
            <FiSun />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Welcome! Farmer
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Manage your equipment rentals efficiently
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/farmer/notifications')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-button)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer'
            }}
          >
            <FiBell style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Left Column - Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats Row - 4 Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px'
            }}
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
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '20px',
                    padding: '20px',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: stat.bgColor,
                      color: stat.color
                    }}>
                      <Icon style={{ width: '20px', height: '20px' }} />
                    </div>
                    <FiMoreVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</h3>
                  <p style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px', color: 'var(--text-muted)' }}>{stat.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${farmerColor.start}20 0%, ${farmerColor.end}15 100%)`,
                  color: farmerColor.start
                }}>
                  <FiPackage style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Rentals</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Your latest equipment bookings</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/farmer/bookings')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: `linear-gradient(135deg, ${farmerColor.start}20 0%, ${farmerColor.end}15 100%)`,
                  color: farmerColor.start,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View All <FiArrowUpRight style={{ marginLeft: '4px', width: '14px', height: '14px', display: 'inline' }} />
              </motion.button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentBookings.length > 0 ? recentBookings.slice(0, 4).map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-tertiary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${farmerColor.start}20 0%, ${farmerColor.end}15 100%)`,
                      color: farmerColor.start
                    }}>
                      <FiTruck style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {booking.machineName}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{booking.ownerName}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date</p>
                      <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>{booking.startDate}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost</p>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#10b981' }}>₹{booking.totalCost.toLocaleString()}</p>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: booking.status.toLowerCase() === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: booking.status.toLowerCase() === 'active' ? '#10b981' : '#3b82f6'
                    }}>
                      {booking.status}
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    background: 'var(--bg-button)'
                  }}>
                    <FiPackage style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{ fontWeight: 500, color: 'var(--text-muted)' }}>No rentals yet</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/farmer/machines')}
                    style={{
                      marginTop: '16px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontWeight: 500,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Browse Equipment
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Score & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Rental Score Gauge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(20px)'
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-secondary)' }}>Rental Score</h3>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '160px', height: '160px' }} viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="var(--border-primary)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="235 314"
                  transform="rotate(135 60 60)"
                />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="url(#farmerGaugeGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(rentalScore / 1000) * 235} 314`}
                  transform="rotate(135 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <defs>
                  <linearGradient id="farmerGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '8px'
              }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{rentalScore}</span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  marginTop: '6px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  background: rentalScore >= 700 ? 'rgba(16, 185, 129, 0.9)' : rentalScore >= 400 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>{rentalScore >= 700 ? 'Excellent' : rentalScore >= 400 ? 'Good' : 'Needs Work'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '0 16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Score</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1000</span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              padding: '20px',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Quick Actions</h3>
              <FiMoreVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            </div>
            
            {[
              { icon: FiTruck, label: 'Browse Equipment', path: '/farmer/machines', color: '#10b981', external: false },
              { icon: FiPackage, label: 'My Bookings', path: '/farmer/bookings', color: '#3b82f6', external: false },
              { icon: FiTrendingUp, label: 'Spending History', path: '/farmer/bookings', color: '#a855f7', external: false },
              { icon: FiCloud, label: 'Weather & Insights', path: 'https://www.google.com/search?q=agricultural+weather+forecast+mandi+prices+Himachal+Punjab+Haryana+Rajasthan+Uttar+Pradesh+Jammu+Kashmir', color: '#06b6d4', external: true }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => action.external ? window.open(action.path, '_blank') : navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: action.color + '20',
                  color: action.color
                }}>
                  <action.icon style={{ width: '20px', height: '20px' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, flex: 1, color: 'var(--text-primary)' }}>{action.label}</span>
                <FiArrowUpRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Agricultural Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '20px',
          padding: '24px',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)',
              color: '#3b82f6'
            }}>
              <FiActivity style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Agricultural Insights</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weather forecasts, crop health & market trends</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px'
        }}>
          {[
            { icon: FiCloud, title: 'Weather Forecast', desc: 'Plan your farming activities with accurate weather predictions', color: '#3b82f6', searchQuery: 'weather forecast Himachal Punjab Haryana Rajasthan Uttar Pradesh Jammu Kashmir farmers India', comingSoon: false },
            { icon: FiTrendingUp, title: 'Market Prices', desc: 'Stay updated with current market rates for your crops', color: '#10b981', searchQuery: 'mandi prices today Himachal Punjab Haryana Rajasthan Uttar Pradesh Jammu Kashmir agricultural market', comingSoon: false },
            { icon: FiActivity, title: 'Crop Health', desc: 'Monitor and optimize your crop health status', color: '#a855f7', searchQuery: null, comingSoon: true }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => item.comingSoon ? alert('🚜 Crop Health Monitoring Coming Soon!\n\nThis feature will be available after we reach 5,000 users. Stay tuned!') : window.open(`https://www.google.com/search?q=${encodeURIComponent(item.searchQuery)}`, '_blank')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-tertiary)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                background: item.color + '20',
                color: item.color
              }}>
                <item.icon style={{ width: '20px', height: '20px' }} />
              </div>
              <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>{item.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1280px) {
          .dashboard-grid-modern {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 1024px) {
          .stats-row-modern {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .stats-row-modern {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .dashboard-header-modern {
            flex-direction: column !important;
            gap: 16px !important;
          }
          
          .activity-row-modern {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmerDashboard;
