import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiTruck, FiUsers, FiShield, FiArrowRight, FiCheck, FiClock, FiMapPin, FiStar, FiMoon, FiSun, FiZap, FiTrendingUp, FiAward, FiChevronRight, FiSearch, FiPhone, FiHeart, FiPackage, FiPlay } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { useNavigate } from 'react-router-dom';
import { getPublicStats, getFeaturedEquipment } from '../../services/dashboardService';
import { useTheme } from '../../context/ThemeContext';
import TestimonialsSection from '../../components/TestimonialsSection';

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

  // Equipment categories for showcase
  const equipmentCategories = [
    { 
      name: 'Tractors', 
      image: '/Tractors', 
      count: stats.totalMachines, 
      icon: 'tractor',
      fallback: '🚜'
    },
    { 
      name: 'Harvesters', 
      image: '/Harvester', 
      count: Math.round(stats.totalMachines * 0.3), 
      icon: 'harvester',
      fallback: '🌾'
    },
    { 
      name: 'Plows', 
      image: '/Plows', 
      count: Math.round(stats.totalMachines * 0.2), 
      icon: 'plow',
      fallback: '⛏️'
    },
    { 
      name: 'Sprayers', 
      image: '/Sprayers', 
      count: Math.round(stats.totalMachines * 0.15), 
      icon: 'sprayer',
      fallback: '🔧'
    }
  ];

  // Why Choose Us benefits
  const benefits = [
    { icon: FiCheck, title: 'Verified Equipment', desc: 'All machines inspected & certified' },
    { icon: FiClock, title: 'Instant Booking', desc: 'Book in minutes, not days' },
    { icon: RupeeIcon, title: 'Best Prices', desc: 'Competitive rates guaranteed' },
    { icon: FiShield, title: 'Secure Payments', desc: '100% secure transactions' }
  ];

  // How it works steps
  const steps = [
    { icon: FiSearch, title: 'Search', desc: 'Find equipment near you' },
    { icon: FiCheck, title: 'Book', desc: 'Reserve instantly online' },
    { icon: FiTruck, title: 'Use', desc: 'Get equipment delivered' },
    { icon: FiHeart, title: 'Return', desc: 'Easy return process' }
  ];

  // Locations for explore section - showing regions where FarmEase operates
  const locations = [
    { name: 'Punjab', image: '/Punjab', fallback: '🌾' },
    { name: 'Haryana', image: '/Haryana', fallback: '🚜' },
    { name: 'Uttar Pradesh', image: '/Uttar Pradesh.jpg', fallback: '🌻' },
    { name: 'Rajasthan', image: '/Rajasthan', fallback: '🏜️' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      {/* Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-500"
        style={{
          backgroundColor: isDark ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <motion.img
                src="/Logo.png"
                alt="FarmEase"
                className="h-12 w-12 object-contain transition-transform group-hover:scale-105"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className={`text-xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>FarmEase</span>
            </a>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle - Modern Switch */}
              <motion.button
                onClick={toggleTheme}
                className="relative flex items-center w-20 h-10 rounded-full p-1 transition-all duration-500"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                  boxShadow: isDark
                    ? 'inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                    : 'inset 0 2px 10px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                {/* Background Stars for Dark Mode */}
                {isDark && (
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: i * 0.3 
                        }}
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${10 + i * 18}%`
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Sun Rays for Light Mode */}
                {!isDark && (
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <motion.div
                      className="absolute w-12 h-12 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                )}
                
                {/* Toggle Ball */}
                <motion.div
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center"
                  animate={{ x: isDark ? 40 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{
                    background: isDark 
                      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                      : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    boxShadow: isDark
                      ? '0 0 20px rgba(251, 191, 36, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 0 20px rgba(251, 191, 36, 0.6), 0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {isDark ? (
                    <motion.div
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiMoon size={16} style={{ color: '#fbbf24' }} />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiSun size={16} style={{ color: '#f59e0b' }} />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Static Icons */}
                <motion.div 
                  className="absolute left-2"
                  animate={{ opacity: isDark ? 0.3 : 0.8, scale: isDark ? 0.8 : 1 }}
                >
                  <FiSun size={14} style={{ color: '#fbbf24' }} />
                </motion.div>
                <motion.div 
                  className="absolute right-2"
                  animate={{ opacity: isDark ? 0.8 : 0.3, scale: isDark ? 1 : 0.8 }}
                >
                  <FiMoon size={14} style={{ color: '#94a3b8' }} />
                </motion.div>
              </motion.button>
              
              {/* Login Button */}
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative',
                  padding: '12px 28px',
                  borderRadius: '50px',
                  fontWeight: '600',
                  fontSize: '14px',
                  overflow: 'hidden',
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
                    : 'linear-gradient(135deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.04) 100%)',
                  border: isDark 
                    ? '1px solid rgba(255,255,255,0.18)' 
                    : '1px solid rgba(15,23,42,0.12)',
                  color: isDark ? '#ffffff' : '#1e293b',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isDark 
                    ? '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  cursor: 'pointer'
                }}
              >
                {/* Shine effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.8 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 60%)',
                    pointerEvents: 'none'
                  }}
                />
                <span style={{ position: 'relative', zIndex: 10 }}>Login</span>
              </motion.button>
              
              {/* Get Started Button */}
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative',
                  padding: '12px 32px',
                  borderRadius: '50px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#ffffff',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 25%, #34d399 50%, #10b981 75%, #059669 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.45), 0 0 60px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                  cursor: 'pointer'
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                {/* Animated shine */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 55%, transparent 65%)',
                    backgroundSize: '200% 100%',
                    pointerEvents: 'none'
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
                />
                <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Get Started
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FiArrowRight style={{ width: '16px', height: '16px' }} />
                  </motion.div>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop"
            alt="Farm landscape"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)' }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-28 pt-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#34d399' }}
            />
            <span 
              className="text-sm font-semibold"
              style={{ color: '#34d399' }}
            >
              {stats.totalMachines || 0} Equipment Available
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight"
          >
            FARM
            <span 
              className="block"
              style={{ 
                background: 'linear-gradient(to right, #34d399, #2dd4bf, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              EASE
            </span>
          </motion.h1>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto mt-16"
          >
            {[
              { value: '4.8★', label: 'Rating', icon: FiStar, color: '#fbbf24' },
              { value: '10+', label: 'Users', icon: FiUsers, color: '#34d399' },
              { value: '98%', label: 'Success Rate', icon: FiAward, color: '#3b82f6' }
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center text-white"
              >
                <stat.icon style={{ color: stat.color }} className="mx-auto mb-2" size={24} />
                <div className="text-xl md:text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-white/80">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section id="equipment" className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-emerald-500 text-sm font-bold tracking-wider uppercase mb-4 block">Explore</span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Equipment Categories</h2>
            <p className={`max-w-2xl mx-auto text-lg transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Premium farming machinery available for rent</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {equipmentCategories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
                onClick={() => navigate('/register')}
              >
                <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { 
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Fallback emoji when image fails */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span style={{ fontSize: '48px', opacity: 0.4 }}>{category.fallback}</span>
                  </div>
                  {/* Category icon overlay */}
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                    {category.icon === 'tractor' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="3" y="10" width="14" height="6" rx="1"/>
                        <rect x="5" y="6" width="6" height="4" rx="1" opacity="0.8"/>
                        <circle cx="6" cy="18" r="2.5"/>
                        <circle cx="14" cy="18" r="2.5"/>
                      </svg>
                    )}
                    {category.icon === 'harvester' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="2" y="8" width="16" height="8" rx="1"/>
                        <rect x="4" y="4" width="8" height="4" rx="1" opacity="0.8"/>
                        <circle cx="5" cy="18" r="2"/>
                        <circle cx="11" cy="18" r="2"/>
                        <path d="M18 10h4v6h-4z" opacity="0.6"/>
                      </svg>
                    )}
                    {category.icon === 'plow' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="2" y="10" width="20" height="3" rx="1"/>
                        <path d="M5 13v6M10 13v6M15 13v6M20 13v6" stroke="white" strokeWidth="2"/>
                      </svg>
                    )}
                    {category.icon === 'sprayer' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="8" width="12" height="10" rx="1"/>
                        <rect x="9" y="4" width="6" height="4" rx="1" opacity="0.8"/>
                        <circle cx="8" cy="20" r="1.5"/>
                        <circle cx="12" cy="20" r="1.5"/>
                        <circle cx="16" cy="20" r="1.5"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className={`text-xl font-bold mb-3 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{category.name}</h3>
                  <p className="text-emerald-500 text-sm font-semibold">{category.count || 0} Available</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="benefits" className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-emerald-500 text-sm font-bold tracking-wider uppercase mb-4 block">Benefits</span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Why Choose FarmEase?</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="text-center p-10 rounded-2xl border transition-all duration-300"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.2))',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <benefit.icon style={{ color: '#10b981' }} size={28} />
                </div>
                <h3 className={`text-lg font-bold mb-3 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h3>
                <p className={`text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-500 text-sm font-bold tracking-wider uppercase mb-4 block">Process</span>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
              <p className={`mb-8 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Renting equipment has never been easier. Follow these simple steps.
              </p>
              
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-5 p-6 rounded-2xl border transition-colors"
                    style={{
                      backgroundColor: isDark ? 'rgba(26, 26, 26, 0.5)' : '#ffffff',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
                    }}
                  >
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(to bottom right, #10b981, #0d9488)',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <step.icon style={{ color: '#ffffff' }} size={24} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                      <p className={`text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}
                >
                  <img 
                    src="/Tractors"
                    alt="Tractor"
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span style={{ fontSize: '64px', opacity: 0.4 }}>🚜</span>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="aspect-[3/4] rounded-2xl overflow-hidden mt-10 shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}
                >
                  <img 
                    src="/Harvester"
                    alt="Harvester"
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span style={{ fontSize: '64px', opacity: 0.4 }}>🌾</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-emerald-500 text-sm font-bold tracking-wider uppercase mb-4 block">Locations</span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Explore Regions</h2>
            <p className={`max-w-2xl mx-auto text-lg transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Find equipment across major farming regions</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {locations.map((location, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
                onClick={() => navigate('/register')}
              >
                <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { 
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Fallback emoji when image fails */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span style={{ fontSize: '48px', opacity: 0.4 }}>{location.fallback}</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{location.name}</h3>
                  <p className="text-emerald-500 text-sm font-semibold">Explore Region</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Footer */}
      <footer 
        className="py-16 border-t transition-colors duration-500"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(to bottom right, #10b981, #0d9488)',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                }}
              >
                {/* Wheat/Grain icon for footer */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C12 3 8 6 8 12C8 15 9 17 10 18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 3C12 3 16 6 16 12C16 15 15 17 14 18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <ellipse cx="8" cy="8" rx="2" ry="3" fill="white" opacity="0.9"/>
                  <ellipse cx="16" cy="8" rx="2" ry="3" fill="white" opacity="0.9"/>
                  <ellipse cx="10" cy="6" rx="1.5" ry="2" fill="white" opacity="0.7"/>
                  <ellipse cx="14" cy="6" rx="1.5" ry="2" fill="white" opacity="0.7"/>
                  <path d="M12 18V21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className={`text-xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>FarmEase</span>
            </div>
            
            <div className={`flex items-center gap-10 text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <a href="#" style={{ color: 'inherit' }} className="hover:text-emerald-500 transition-colors font-medium">Privacy</a>
              <a href="#" style={{ color: 'inherit' }} className="hover:text-emerald-500 transition-colors font-medium">Terms</a>
              <a href="#" style={{ color: 'inherit' }} className="hover:text-emerald-500 transition-colors font-medium">Contact</a>
            </div>
            
            <p className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>© 2024 FarmEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

