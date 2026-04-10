import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FiTruck, FiUsers, FiShield, FiArrowRight, FiCheck, FiSun, FiTool, FiClock, FiMapPin, FiStar, FiMoon, FiZap, FiTrendingUp, FiAward, FiChevronRight, FiLayers } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { useNavigate } from 'react-router-dom';
import { getPublicStats, getFeaturedEquipment } from '../../services/dashboardService';
import { useTheme } from '../../context/ThemeContext';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { scrollYProgress } = useScroll();
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  
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
      description: 'Browse and rent tractors, harvesters, plows, and other farming equipment from local owners instantly.',
      color: '#22c55e',
      size: 'large',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: FiUsers,
      title: 'Connect with Owners',
      description: 'Find equipment owners in your area and book directly through our verified platform.',
      color: '#3b82f6',
      size: 'small',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: RupeeIcon,
      title: 'Fair Pricing',
      description: 'Set your own rental rates or find equipment within your budget with transparent pricing.',
      color: '#f59e0b',
      size: 'small',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'User verification and secure booking process for peace of mind and trust.',
      color: '#ef4444',
      size: 'medium',
      gradient: 'from-rose-500 to-pink-500'
    }
  ];

  // TODO: Testimonials feature not implemented yet
  // Need backend endpoint: GET /api/testimonials to fetch reviews
  // Need backend endpoint: POST /api/testimonials for users to submit

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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        className="fixed top-[72px] left-0 right-0 z-40 py-3"
        style={{ 
          background: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 text-sm">
          {[
            { icon: FiShield, text: 'Verified Owners', color: '#10b981' },
            { icon: FiClock, text: 'Instant Booking', color: '#3b82f6' },
            { icon: FiAward, text: 'Best Prices', color: '#f59e0b' },
            { icon: FiZap, text: 'Premium Quality', color: '#8b5cf6' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${item.color}15` }}>
                <item.icon size={12} style={{ color: item.color }} />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-[60] origin-left"
        style={{ 
          scaleX: scrollYProgress,
          background: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)'
        }}
      />

      {/* Hero Section - Story Driven */}
      <motion.section 
        className="relative min-h-screen flex items-center pt-40 pb-40" 
        style={{ 
          background: isDark 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)'
            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #fafafa 100%)',
          transition: 'background 0.3s ease',
          opacity: heroOpacity,
          scale: heroScale
        }}
      >
        {/* Enhanced Animated Mesh Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25" 
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)'
            }} 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, -5, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20" 
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)'
            }} 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.08]" 
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 60%)'
            }} 
          />
          
          {/* Animated Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Enhanced Floating Elements */}
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-48 left-20 w-20 h-20 rounded-2xl flex items-center justify-center hidden lg:flex shadow-xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)'
          }}
        >
          <FiSun className="text-3xl" style={{ color: '#22c55e' }} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -8, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-48 left-32 w-24 h-24 rounded-2xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
          }}
        >
          <FiTool className="text-4xl" style={{ color: '#3b82f6' }} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-56 right-24 w-16 h-16 rounded-2xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
          }}
        >
          <FiStar className="text-2xl" style={{ color: '#f59e0b' }} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-32 right-48 w-14 h-14 rounded-xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
          }}
        >
          <FiLayers className="text-xl" style={{ color: '#8b5cf6' }} />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-center">
            {/* Left Content - Story Driven */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-8 cursor-pointer group"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.2)'
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FiZap size={14} style={{ color: '#10b981' }} />
                </motion.div>
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>The Future of Farming</span>
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="ml-1"
                >
                  <FiChevronRight size={14} style={{ color: '#10b981' }} />
                </motion.div>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold mb-6 leading-[1.05] tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="block"
                >
                  Rent Equipment.
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="block"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 4px 20px rgba(16, 185, 129, 0.3))'
                  }}
                >
                  Grow Smarter.
                </motion.span>
              </h1>

              <p className="text-lg md:text-xl mb-12 max-w-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                Access tractors, harvesters, and more without the heavy investment. Connect with local owners, compare rates, and book instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-16">
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

              {/* Stats - Social Proof with enhanced visuals */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                {[
                  { value: stats.totalUsers, label: 'Active Users', icon: FiUsers, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                  { value: stats.totalMachines, label: 'Equipment', icon: FiTruck, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
                  { value: stats.totalBookings, label: 'Bookings', icon: FiTrendingUp, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.15, type: 'spring', stiffness: 100 }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl min-w-[100px]"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.bg} 0%, ${stat.bg}50 100%)`,
                      border: `1px solid ${stat.color}30`,
                      backdropFilter: 'blur(10px)',
                      boxShadow: `0 8px 32px ${stat.color}15`
                    }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ 
                        background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                        border: `1px solid ${stat.color}40`
                      }}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <stat.icon size={20} style={{ color: stat.color }} />
                    </motion.div>
                    <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
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
      </motion.section>

      {/* Features Section - Bento Grid */}
      <section className="py-28 relative" style={{ backgroundColor: 'var(--bg-secondary)', transition: 'background-color 0.3s ease' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
          }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <FiZap size={12} style={{ color: '#10b981' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#10b981' }}>Features</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Why Choose <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FarmEase?</span>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              The smartest way to rent or list farm equipment
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6, type: 'spring', stiffness: 100 }}
                  whileHover={{ 
                    y: -12, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="p-8 rounded-2xl group relative overflow-hidden cursor-pointer"
                  style={{ 
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDark ? '0 4px 30px rgba(0,0,0,0.2)' : '0 4px 30px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Animated gradient background on hover */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}08 0%, transparent 60%)`
                    }}
                  />
                  
                  {/* Top border glow */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${feature.color}50 50%, transparent 100%)`
                    }}
                  />
                  
                  {/* Icon with enhanced animation */}
                  <motion.div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 relative"
                    style={{ 
                      background: `${feature.color}15`,
                      border: `1px solid ${feature.color}25`
                    }}
                    whileHover={{ 
                      rotate: [0, -5, 5, 0],
                      scale: 1.15,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <Icon className="text-xl relative z-10" style={{ color: feature.color }} />
                    
                    {/* Icon glow effect */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                      style={{ background: feature.color }}
                    />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold mb-3 relative z-10" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed relative z-10" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{feature.description}</p>
                  
                  {/* Arrow indicator on hover */}
                  <motion.div
                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <FiArrowRight style={{ color: feature.color }} />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* TODO: Testimonials section - feature not yet implemented 
              Backend needed: POST /api/testimonials endpoint for users to submit reviews
              Currently hidden until functionality is built
          */}
        </div>
      </section>

      {/* User Roles Section - Split Screen Layout */}
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)', transition: 'background-color 0.3s ease' }}>
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20" 
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20" 
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }} 
        />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative pt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24 pb-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <FiZap size={14} style={{ color: '#10b981' }} />
              </motion.div>
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#10b981' }}>Join Our Growing Community</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Choose Your <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 10px rgba(16, 185, 129, 0.3))' }}>Path</span>
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              Whether you need equipment or have equipment to share, we've got you covered
            </p>
          </motion.div>

          {/* Enhanced Split Screen Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto mt-8">
            {/* Farmer Card */}
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: -5 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, type: 'spring' }}
              whileHover={{ 
                scale: 1.02, 
                y: -8,
                boxShadow: '0 25px 50px rgba(16, 185, 129, 0.2)'
              }}
              className="p-12 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[450px]"
              style={{ 
                background: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.03)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                backdropFilter: 'blur(20px)',
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
              onClick={() => navigate('/register')}
            >
              {/* Animated gradient border */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, transparent 50%, rgba(6, 182, 212, 0.3) 100%)',
                  padding: '1px',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor'
                }}
              />
              
              {/* Top glow */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                  boxShadow: '0 0 20px #10b981'
                }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-10 relative"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    boxShadow: '0 16px 50px rgba(16, 185, 129, 0.5), inset 0 2px 0 rgba(255,255,255,0.4)'
                  }}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.1,
                    transition: { duration: 0.6 }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-2xl" />
                  <FiSun className="text-4xl text-white relative z-10" />
                </motion.div>
                
                <h3 className="text-3xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>I Need Equipment</h3>
                <p className="mb-10 text-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  Browse available machinery, compare rates, and book instantly for your farming needs.
                </p>
                
                <ul className="space-y-5">
                  {['Browse equipment listings', 'Check availability & rates', 'Book and manage rentals', 'Track booking history'].map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3" 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <motion.div 
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        <FiCheck className="text-sm" style={{ color: '#10b981' }} />
                      </motion.div>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* Arrow indicator */}
                <motion.div
                  className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100"
                  initial={{ x: -20 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiArrowRight className="text-2xl" style={{ color: '#10b981' }} />
                </motion.div>
              </div>
            </motion.div>

            {/* Owner Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: 5 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, type: 'spring', delay: 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                y: -8,
                boxShadow: '0 25px 50px rgba(59, 130, 246, 0.2)'
              }}
              className="p-12 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[450px]"
              style={{ 
                background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.03)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                backdropFilter: 'blur(20px)',
                transformStyle: 'preserve-3d'
              }}
              onClick={() => navigate('/register')}
            >
              {/* Animated gradient border */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, transparent 50%, rgba(139, 92, 246, 0.3) 100%)',
                  padding: '1px',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor'
                }}
              />
              
              {/* Top glow */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                  boxShadow: '0 0 20px #3b82f6'
                }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-10 relative"
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    boxShadow: '0 16px 50px rgba(59, 130, 246, 0.5), inset 0 2px 0 rgba(255,255,255,0.4)'
                  }}
                  whileHover={{ 
                    rotate: [0, 10, -10, 0],
                    scale: 1.1,
                    transition: { duration: 0.6 }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-2xl" />
                  <FiTool className="text-4xl text-white relative z-10" />
                </motion.div>
                
                <h3 className="text-3xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>I Have Equipment</h3>
                <p className="mb-10 text-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  List your farming equipment for rent and earn passive income when idle.
                </p>
                
                <ul className="space-y-5">
                  {['List your equipment', 'Set your own rates', 'Manage booking requests', 'Track your earnings'].map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3" 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <motion.div 
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.4)'
                        }}
                        whileHover={{ scale: 1.2, rotate: -10 }}
                      >
                        <FiCheck className="text-sm" style={{ color: '#3b82f6' }} />
                      </motion.div>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* Arrow indicator */}
                <motion.div
                  className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100"
                  initial={{ x: -20 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiArrowRight className="text-2xl" style={{ color: '#3b82f6' }} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-tertiary)', transition: 'background-color 0.3s ease' }}>
        {/* Subtle background decoration */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(16, 185, 129, 0.05) 0%, transparent 60%)'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <FiTruck className="text-white text-2xl" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>FarmEase</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Modern Farm Equipment Platform</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <motion.a 
                href="#" 
                className="text-sm font-medium hover:text-emerald-500 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ y: -2 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a 
                href="#" 
                className="text-sm font-medium hover:text-emerald-500 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ y: -2 }}
              >
                Terms of Service
              </motion.a>
              <motion.a 
                href="#" 
                className="text-sm font-medium hover:text-emerald-500 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ y: -2 }}
              >
                Contact
              </motion.a>
            </motion.div>
            
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>&copy; 2024 FarmEase. All rights reserved.</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
