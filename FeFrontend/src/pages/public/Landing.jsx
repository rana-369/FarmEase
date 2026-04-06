import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiUsers, FiShield, FiArrowRight, FiCheck, FiSun, FiTool, FiClock, FiMapPin, FiStar } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { useNavigate } from 'react-router-dom';
import { getPublicStats, getFeaturedEquipment } from '../../services/dashboardService';

const Landing = () => {
  const navigate = useNavigate();
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
      color: '#22c55e'
    },
    {
      icon: FiUsers,
      title: 'Connect with Owners',
      description: 'Find equipment owners in your area and book directly through the platform',
      color: '#3b82f6'
    },
    {
      icon: RupeeIcon,
      title: 'Fair Pricing',
      description: 'Set your own rental rates or find equipment within your budget',
      color: '#f59e0b'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'User verification and secure booking process for peace of mind',
      color: '#ef4444'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50" 
        style={{ 
          backgroundColor: 'rgba(5, 5, 5, 0.8)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
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
              <span className="text-xl font-bold tracking-tight" style={{ color: '#ffffff' }}>AgriConnect</span>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ 
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)'
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20" style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
      }}>
        {/* Background Elements */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.03) 0%, transparent 70%)
          `
        }} />

        {/* Floating Animated Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-20 w-16 h-16 rounded-2xl flex items-center justify-center hidden lg:flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
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
            border: '1px solid rgba(59, 130, 246, 0.3)'
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
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}
        >
          <FiStar className="text-xl" style={{ color: '#f59e0b' }} />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-6"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
                }}
              >
                <FiSun style={{ color: '#10b981' }} />
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>Agricultural Equipment Rental</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: '#ffffff' }}>
                Modern Farming<br />
                <span className="text-gradient">Starts Here</span>
              </h1>

              <p className="text-lg mb-8 max-w-lg" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
                Connect with equipment owners in your area. Browse available machinery, compare rates, and book instantly. The smart way to farm.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10">Get Started</span>
                  <FiArrowRight className="relative z-10" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Login
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  { value: stats.totalUsers, label: 'Active Users', gradient: 'from-emerald-500 to-green-600' },
                  { value: stats.totalMachines, label: 'Equipment', gradient: 'from-cyan-500 to-teal-600' },
                  { value: stats.totalBookings, label: 'Bookings', gradient: 'from-violet-500 to-purple-600' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="group"
                  >
                    <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stat.value}</div>
                    <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Equipment Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div 
                className="rounded-2xl overflow-hidden"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Featured Equipment</h3>
                    {featuredEquipment.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                        <span className="text-xs font-medium" style={{ color: '#22c55e' }}>Live</span>
                      </div>
                    )}
                  </div>

                  {featuredEquipment.length > 0 ? (
                    <div className="space-y-3">
                      {featuredEquipment.slice(0, 4).map((item, index) => (
                        <motion.div
                          key={item.id || index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ 
                                backgroundColor: item.isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                              }}
                            >
                              <FiTruck style={{ color: item.isAvailable ? '#22c55e' : '#ef4444' }} />
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: '#ffffff' }}>{item.name}</div>
                              <div className="flex items-center gap-1 text-xs" style={{ color: '#666666' }}>
                                <FiMapPin className="text-xs" />
                                {item.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold" style={{ color: '#22c55e' }}>₹{item.pricePerHour}/hr</div>
                            <div className="text-xs" style={{ color: item.isAvailable ? '#22c55e' : '#ef4444' }}>
                              {item.isAvailable ? 'Available' : 'Booked'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <FiTruck className="text-3xl" style={{ color: '#333333' }} />
                      </div>
                      <p style={{ color: '#666666' }}>No equipment listed yet</p>
                      <p className="text-sm mt-2" style={{ color: '#444444' }}>Be the first to add your equipment!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative" style={{ backgroundColor: '#050505' }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)'
        }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Features</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Why Choose <span className="text-gradient">AgriConnect</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Everything you need to manage your agricultural equipment rental business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 rounded-2xl card-hover group relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${feature.color}15 0%, transparent 60%)`
                    }}
                  />
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.color}25 0%, ${feature.color}15 100%)`,
                      border: `1px solid ${feature.color}30`,
                      boxShadow: `0 4px 20px ${feature.color}20`
                    }}
                  >
                    <Icon className="text-xl relative z-10" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-24 relative" style={{ backgroundColor: '#080808' }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 40%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.04) 0%, transparent 40%)'
        }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Join Us</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Join the <span className="text-gradient">Platform</span>
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Choose your role and start today
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Farmer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="p-8 rounded-3xl cursor-pointer group relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => navigate('/register')}
            >
              {/* Animated glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)'
                }}
              />
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                <FiSun className="text-2xl text-white relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Farmer</h3>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
                Browse available equipment, compare rates, and book machinery for your farming needs.
              </p>
              <ul className="space-y-3">
                {['Browse equipment listings', 'Check availability & rates', 'Book and manage rentals', 'Track booking history'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center" 
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <FiCheck className="text-xs" style={{ color: '#10b981' }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Owner Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="p-8 rounded-3xl cursor-pointer group relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.02) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => navigate('/register')}
            >
              {/* Animated glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)'
                }}
              />
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                <FiTool className="text-2xl text-white relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Equipment Owner</h3>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
                List your farming equipment for rent and earn income when your machinery is idle.
              </p>
              <ul className="space-y-3">
                {['List your equipment', 'Set your own rates', 'Manage booking requests', 'Track your earnings'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center" 
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <FiCheck className="text-xs" style={{ color: '#3b82f6' }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#050505' }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20" style={{
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)'
        }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Get Started</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Ready to <span className="text-gradient">Transform</span> Your Farming?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Join thousands of farmers and equipment owners already using AgriConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <span className="relative z-10">Create Account</span>
                <FiArrowRight className="relative z-10" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-2xl font-semibold text-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                }}
              >
                <FiTruck className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>AgriConnect</h3>
                <p className="text-xs" style={{ color: '#666666' }}>Farm Equipment Platform</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: '#666666' }}>&copy; 2024 AgriConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
