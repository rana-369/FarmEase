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
    totalBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    successRate: 0,
    machineCategories: {}
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
          totalUsers: statsData.TotalUsers || statsData.totalUsers || 0,
          totalMachines: statsData.TotalMachines || statsData.totalMachines || 0,
          totalBookings: statsData.TotalBookings || statsData.totalBookings || 0,
          completedBookings: statsData.CompletedBookings || statsData.completedBookings || 0,
          averageRating: statsData.AverageRating || statsData.averageRating || 0,
          successRate: statsData.SuccessRate || statsData.successRate || 0,
          machineCategories: statsData.MachineCategories || statsData.machineCategories || {}
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

  // Equipment categories for showcase - use real counts from API
  const equipmentCategories = [
    {
      name: 'Tractors',
      image: '/Tractors',
      count: stats.machineCategories['Tractor'] || stats.machineCategories['tractors'] || 0,
      icon: 'tractor',
      fallback: '🚜'
    },
    {
      name: 'Harvesters',
      image: '/Harvester',
      count: stats.machineCategories['Harvester'] || stats.machineCategories['harvesters'] || 0,
      icon: 'harvester',
      fallback: '🌾'
    },
    {
      name: 'Plows',
      image: '/Plows',
      count: stats.machineCategories['Plow'] || stats.machineCategories['plows'] || 0,
      icon: 'plow',
      fallback: '⛏️'
    },
    {
      name: 'Sprayers',
      image: '/Sprayers',
      count: stats.machineCategories['Sprayer'] || stats.machineCategories['sprayers'] || 0,
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

  const steps = [
    { icon: FiSearch, title: 'Search', desc: 'Find equipment near you' },
    { icon: FiCheck, title: 'Book', desc: 'Reserve instantly online' },
    { icon: FiTruck, title: 'Use', desc: 'Get equipment delivered' },
    { icon: FiHeart, title: 'Return', desc: 'Easy return process' }
  ];

  const locations = [
    { name: 'Punjab', image: '/Punjab', fallback: '🌾' },
    { name: 'Haryana', image: '/Haryana', fallback: '🚜' },
    { name: 'Uttar Pradesh', image: '/Uttar Pradesh.jpg', fallback: '🌻' },
    { name: 'Rajasthan', image: '/Rajasthan', fallback: '🏜️' }
  ];

  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <div style={{
        minHeight: '100vh',
        transition: 'background-color 0.5s ease',
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff'
      }}>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          transition: 'all 0.5s ease',
          backgroundColor: isDark ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <motion.img
                src="/Logo.png"
                alt="FarmEase"
                style={{
                  height: '56px',
                  width: '80px',
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease',
                  filter: isDark ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))' : 'none',
                  position: 'relative',
                  zIndex: 10
                }}
                whileHover={{ scale: 1.05 }}
              />
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                transition: 'color 0.5s ease',
                color: isDark ? '#ffffff' : '#111827'
              }}>FarmEase</span>
            </a>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <motion.a 
                href="#equipment" 
                whileHover={{ color: '#10b981', y: -2 }}
                style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  textDecoration: 'none',
                  transition: 'color 0.5s ease',
                  color: isDark ? '#9ca3af' : '#4b5563'
                }}
              >
                Equipment
              </motion.a>
              <motion.a 
                href="#benefits" 
                whileHover={{ color: '#10b981', y: -2 }}
                style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  textDecoration: 'none',
                  transition: 'color 0.5s ease',
                  color: isDark ? '#9ca3af' : '#4b5563'
                }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#how-it-works" 
                whileHover={{ color: '#10b981', y: -2 }}
                style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  textDecoration: 'none',
                  transition: 'color 0.5s ease',
                  color: isDark ? '#9ca3af' : '#4b5563'
                }}
              >
                How It Works
              </motion.a>
              <motion.a 
                href="#testimonials" 
                whileHover={{ color: '#10b981', y: -2 }}
                style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  textDecoration: 'none',
                  transition: 'color 0.5s ease',
                  color: isDark ? '#9ca3af' : '#4b5563'
                }}
              >
                Reviews
              </motion.a>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Theme Toggle - Modern Switch */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  width: '80px',
                  height: '40px',
                  borderRadius: '9999px',
                  padding: '4px',
                  transition: 'all 0.5s ease',
                  background: isDark 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                  boxShadow: isDark
                    ? 'inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                    : 'inset 0 2px 10px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {/* Background Stars for Dark Mode */}
                {isDark && (
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '9999px' }}>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        style={{
                          position: 'absolute',
                          width: '4px',
                          height: '4px',
                          background: '#ffffff',
                          borderRadius: '50%',
                          top: `${20 + Math.random() * 60}%`,
                          left: `${10 + i * 18}%`
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Sun Rays for Light Mode */}
                {!isDark && (
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '9999px' }}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        position: 'absolute',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                )}
                
                {/* Toggle Ball */}
                <motion.div
                  animate={{ x: isDark ? 40 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  animate={{ opacity: isDark ? 0.3 : 0.8, scale: isDark ? 0.8 : 1 }}
                  style={{ position: 'absolute', left: '8px' }}
                >
                  <FiSun size={14} style={{ color: '#fbbf24' }} />
                </motion.div>
                <motion.div 
                  animate={{ opacity: isDark ? 0.8 : 0.3, scale: isDark ? 1 : 0.8 }}
                  style={{ position: 'absolute', right: '8px' }}
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
                  fontWeight: 600,
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
                <span style={{ position: 'relative', zIndex: 10 }}>Login</span>
              </motion.button>
              
              {/* Get Started Button */}
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'relative',
                  padding: '12px 32px',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#ffffff',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 25%, #34d399 50%, #10b981 75%, #059669 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.45), 0 0 60px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
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
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Background Image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop"
            alt="Farm landscape"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{ position: 'absolute', inset: 0, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)' }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '64rem', margin: '0 auto', padding: '0 24px', textAlign: 'center', paddingTop: '96px', paddingBottom: '112px' }}>
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '24px',
              lineHeight: 1.1,
              letterSpacing: '-0.025em'
            }}
          >
            FARM
            <span
              style={{
                display: 'block',
                background: 'linear-gradient(to right, #34d399, #2dd4bf, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              EASE
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '40px',
              maxWidth: '36rem',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}
          >
            Rent farming equipment near you. Save money, boost productivity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '48px'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 32px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '16px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.45)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Get Started <FiArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              style={{
                padding: '16px 32px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '16px',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer'
              }}
            >
              Login
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              maxWidth: '48rem',
              margin: '64px auto 0'
            }}
          >
            {[
              { value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '4.8', label: 'Rating', icon: FiStar, color: '#fbbf24' },
              { value: `${stats.totalUsers || 0}+`, label: 'Users', icon: FiUsers, color: '#34d399' },
              { value: stats.successRate > 0 ? `${stats.successRate}%` : '98%', label: 'Success Rate', icon: FiAward, color: '#3b82f6' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', color: '#ffffff' }}>
                <stat.icon style={{ color: stat.color }} size={24} />
                <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, marginTop: '8px', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section id="equipment" style={{ padding: '96px 0', transition: 'background-color 0.5s ease', background: isDark ? 'linear-gradient(to bottom, #0a0a0a, #0f0f0f)' : 'linear-gradient(to bottom, #ffffff, #f9fafb)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.2) 100%)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              Explore
            </motion.span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>Equipment Categories</h2>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '18px', transition: 'color 0.5s ease', color: isDark ? '#9ca3af' : '#4b5563' }}>Premium farming machinery available for rent</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {equipmentCategories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate('/register')}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: isDark ? 'rgba(26,26,26,0.8)' : 'rgba(255,255,255,0.9)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '48px', opacity: 0.4 }}>{category.fallback}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
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
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>{category.name}</h3>
                  <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 500 }}>{category.count || 0} Available</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="benefits" style={{ padding: '96px 0', transition: 'background-color 0.5s ease', background: isDark ? 'linear-gradient(to bottom, #0f0f0f, #0a0a0a)' : 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.2) 100%)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              Benefits
            </motion.span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>Why Choose FarmEase?</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                style={{
                  textAlign: 'center',
                  padding: '32px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: isDark ? 'rgba(26,26,26,0.6)' : 'rgba(255,255,255,0.8)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <benefit.icon style={{ color: '#ffffff' }} size={24} />
                </motion.div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>{benefit.title}</h3>
                <p style={{ fontSize: '14px', transition: 'color 0.5s ease', color: isDark ? '#9ca3af' : '#4b5563' }}>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '96px 0', transition: 'background-color 0.5s ease', background: isDark ? 'linear-gradient(to bottom, #0a0a0a, #0f0f0f)' : 'linear-gradient(to bottom, #ffffff, #f9fafb)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.2) 100%)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              Process
            </motion.span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>How It Works</h2>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '18px', transition: 'color 0.5s ease', color: isDark ? '#9ca3af' : '#4b5563' }}>
              Renting equipment has never been easier. Follow these simple steps.
            </p>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                style={{
                  textAlign: 'center',
                  padding: '24px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: isDark ? 'rgba(26,26,26,0.6)' : 'rgba(255,255,255,0.8)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <step.icon style={{ color: '#ffffff' }} size={24} />
                </motion.div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', transition: 'color 0.5s ease', color: isDark ? '#9ca3af' : '#4b5563' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" style={{ padding: '96px 0', transition: 'background-color 0.5s ease', background: isDark ? 'linear-gradient(to bottom, #0f0f0f, #0a0a0a)' : 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.2) 100%)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              Locations
            </motion.span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>Explore Regions</h2>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '18px', transition: 'color 0.5s ease', color: isDark ? '#9ca3af' : '#4b5563' }}>Find equipment across major farming regions</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {locations.map((location, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate('/register')}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: isDark ? 'rgba(26,26,26,0.8)' : 'rgba(255,255,255,0.9)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
                  <img 
                    src={location.image} 
                    alt={location.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '48px', opacity: 0.4 }}>{location.fallback}</span>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>{location.name}</h3>
                  <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 500 }}>Explore Region</p>
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
        style={{
          padding: '48px 0',
          borderTop: '1px solid',
          transition: 'all 0.5s ease',
          backgroundColor: isDark ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                }}
              >
                <FiTruck style={{ color: '#ffffff' }} size={20} />
              </motion.div>
              <span style={{ fontSize: '18px', fontWeight: 700, transition: 'color 0.5s ease', color: isDark ? '#ffffff' : '#111827' }}>FarmEase</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '14px', transition: 'color 0.5s ease', color: isDark ? '#9ca3af' : '#4b5563' }}>
              <motion.a href="#" whileHover={{ color: '#10b981', y: -2 }} style={{ color: 'inherit', fontWeight: 500, textDecoration: 'none' }}>Privacy</motion.a>
              <motion.a href="#" whileHover={{ color: '#10b981', y: -2 }} style={{ color: 'inherit', fontWeight: 500, textDecoration: 'none' }}>Terms</motion.a>
              <motion.a href="#" whileHover={{ color: '#10b981', y: -2 }} style={{ color: 'inherit', fontWeight: 500, textDecoration: 'none' }}>Contact</motion.a>
            </div>

            <p style={{ fontSize: '14px', transition: 'color 0.5s ease', color: isDark ? '#6b7280' : '#9ca3af' }}>© 2024 FarmEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Landing;

