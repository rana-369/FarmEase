import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiTruck, FiUsers, FiShield, FiArrowRight, FiCheck, FiSun, FiTool, FiClock, FiMapPin, FiStar, FiMoon, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { useNavigate } from 'react-router-dom';
import { getPublicStats, getFeaturedEquipment } from '../../services/dashboardService';
import { useTheme } from '../../context/ThemeContext';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMachines: 0,
    totalBookings: 0
  });
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicData();
    const interval = setInterval(fetchPublicData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPublicData = async () => {
    try {
      const [statsData, equipmentData] = await Promise.all([
        getPublicStats().catch(() => null),
        getFeaturedEquipment().catch(() => [])
      ]);

      if (statsData) {
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalMachines: statsData.totalMachines || 0,
          totalBookings: statsData.totalBookings || 0
        });
      }

      if (equipmentData && equipmentData.length > 0) {
        setFeaturedEquipment(equipmentData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching public data:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FiTruck,
      title: 'Equipment Rental',
      description: 'Browse and rent tractors, harvesters, plows, and other farming equipment from local owners',
      color: '#22c55e',
      size: 'large'
    },
    {
      icon: FiUsers,
      title: 'Connect with Owners',
      description: 'Find equipment owners in your area and book directly through the platform',
      color: '#3b82f6',
      size: 'small'
    },
    {
      icon: RupeeIcon,
      title: 'Fair Pricing',
      description: 'Set your own rental rates or find equipment within your budget',
      color: '#f59e0b',
      size: 'small'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'User verification and secure booking process for peace of mind',
      color: '#ef4444',
      size: 'medium'
    }
  ];

  const testimonials = [
    { name: 'Rajesh K.', role: 'Farmer', text: 'Saved 40% on equipment costs. Amazing platform!', rating: 5 },
    { name: 'Priya M.', role: 'Equipment Owner', text: 'My idle tractor now earns me passive income.', rating: 5 },
    { name: 'Amit S.', role: 'Farmer', text: 'Booked a harvester in minutes. So easy!', rating: 5 }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50" 
        style={{ 
          backgroundColor: 'var(--bg-header)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-tertiary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <FiTruck className="text-white text-lg relative z-10" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>FarmEase</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                style={{ 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)'
                }}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                <span className="text-xs font-medium hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)'
                }}
              >
                <span className="relative z-10">Get Started</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Trust Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed top-[72px] left-0 right-0 z-40 py-2.5"
        style={{ 
          background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FiShield size={14} style={{ color: '#10b981' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Verified Owners</span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
          <div className="flex items-center gap-2">
            <FiClock size={14} style={{ color: '#3b82f6' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Instant Booking</span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
          <div className="flex items-center gap-2">
            <FiAward size={14} style={{ color: '#f59e0b' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Best Prices</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Section - Story Driven */}
      <section className="relative min-h-screen flex items-center pt-32 pb-32" style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #fafafa 100%)',
        transition: 'background 0.3s ease'
      }}>
        {/* Modern Mesh Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
          }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
          }} />
        </div>

        {/* Floating Animated Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-20 w-16 h-16 rounded-2xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <FiSun className="text-2xl" style={{ color: '#22c55e' }} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-32 w-20 h-20 rounded-2xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <FiTool className="text-3xl" style={{ color: '#3b82f6' }} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-40 right-20 w-14 h-14 rounded-2xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <FiStar className="text-xl" style={{ color: '#f59e0b' }} />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content - Story Driven */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-8"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
                }}
              >
                <FiZap size={14} style={{ color: '#10b981' }} />
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>The Future of Farming</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold mb-6 leading-[1.05] tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                Rent Equipment.<br />
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Smarter.</span>
              </h1>

              <p className="text-lg md:text-xl mb-10 max-w-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Access tractors, harvesters, and more without the heavy investment. Connect with local owners, compare rates, and book instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 50px rgba(16, 185, 129, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    color: '#ffffff',
                    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10">Start Free</span>
                  <FiArrowRight className="relative z-10" />
                </motion.button>
              </div>

              {/* Stats - Social Proof */}
              <div className="flex flex-wrap items-center gap-4 mt-6">
                {[
                  { value: stats.totalUsers, label: 'Active Users', icon: FiUsers, color: '#10b981' },
                  { value: stats.totalMachines, label: 'Equipment', icon: FiTruck, color: '#3b82f6' },
                  { value: stats.totalBookings, label: 'Bookings', icon: FiTrendingUp, color: '#8b5cf6' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon size={16} style={{ color: stat.color }} />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Immersive Product Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Glassmorphism Card */}
              <div 
                className="rounded-3xl overflow-hidden relative"
                style={{ 
                  background: isDark ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--border-primary)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <FiTruck className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Featured Equipment</h3>
                    </div>
                    {featuredEquipment.length > 0 && (
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full" 
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                      >
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                        <span className="text-xs font-medium" style={{ color: '#22c55e' }}>Live</span>
                      </motion.div>
                    )}
                  </div>

                  {featuredEquipment.length > 0 ? (
                    <div className="space-y-4">
                      {featuredEquipment.slice(0, 4).map((item, index) => (
                        <motion.div
                          key={item.id || index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
                          style={{ 
                            backgroundColor: 'var(--bg-card-hover)',
                            border: '1px solid var(--border-secondary)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ 
                                backgroundColor: item.isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                              }}
                            >
                              <FiTruck size={20} style={{ color: item.isAvailable ? '#22c55e' : '#ef4444' }} />
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                              <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                                <FiMapPin size={12} />
                                {item.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg" style={{ color: '#10b981' }}>Rs.{Math.round(item.pricePerHour * 1.1)}<span className="text-sm font-normal">/hr</span></div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>incl. platform fee</div>
                            <div className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1" style={{ color: item.isAvailable ? '#22c55e' : '#ef4444', backgroundColor: item.isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                              {item.isAvailable ? 'Available' : 'Booked'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'var(--bg-button)' }}
                      >
                        <FiTruck className="text-4xl" style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No equipment listed yet</p>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Be the first to add your equipment!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="py-32 relative" style={{ backgroundColor: 'var(--bg-secondary)', transition: 'background-color 0.3s ease' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
          }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <FiZap size={12} style={{ color: '#10b981' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#10b981' }}>Features</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Why Choose <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FarmEase?</span>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              The smartest way to rent or list farm equipment
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-2xl group relative overflow-hidden"
                  style={{ 
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${feature.color}10 0%, transparent 60%)`
                    }}
                  />
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: `${feature.color}15`
                    }}
                  >
                    <Icon className="text-xl relative z-10" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl"
                  style={{ 
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    ))}
                  </div>
                  <p className="text-sm mb-4 italic" style={{ color: 'var(--text-secondary)' }}>"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', color: '#fff' }}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{testimonial.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Roles Section - Split Screen Layout */}
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)', transition: 'background-color 0.3s ease' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                background: 'var(--bg-button)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Join Us</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Choose Your <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Path</span>
            </h2>
            <p className="text-lg md:text-xl" style={{ color: 'var(--text-muted)' }}>
              Whether you need equipment or have equipment to share, we've got you covered
            </p>
          </motion.div>

          {/* Split Screen Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Farmer Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
              className="p-10 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[400px]"
              style={{ 
                background: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(20px)'
              }}
              onClick={() => navigate('/register')}
            >
              {/* Animated glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.2) 0%, transparent 60%)'
                }}
              />
              <div className="relative z-10">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  <FiSun className="text-3xl text-white relative z-10" />
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>I Need Equipment</h3>
                <p className="mb-8 text-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  Browse available machinery, compare rates, and book instantly for your farming needs.
                </p>
                <ul className="space-y-4">
                  {['Browse equipment listings', 'Check availability & rates', 'Book and manage rentals', 'Track booking history'].map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3" 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <FiCheck className="text-sm" style={{ color: '#10b981' }} />
                      </div>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Owner Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -8 }}
              className="p-10 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[400px]"
              style={{ 
                background: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(20px)'
              }}
              onClick={() => navigate('/register')}
            >
              {/* Animated glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)'
                }}
              />
              <div className="relative z-10">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  <FiTool className="text-3xl text-white relative z-10" />
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>I Have Equipment</h3>
                <p className="mb-8 text-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  List your farming equipment for rent and earn passive income when idle.
                </p>
                <ul className="space-y-4">
                  {['List your equipment', 'Set your own rates', 'Manage booking requests', 'Track your earnings'].map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3" 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.4)'
                        }}
                      >
                        <FiCheck className="text-sm" style={{ color: '#3b82f6' }} />
                      </div>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-tertiary)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <FiTruck className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>FarmEase</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Modern Farm Equipment Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>&copy; 2024 FarmEase. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
