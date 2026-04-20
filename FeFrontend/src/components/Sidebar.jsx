import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome,
  FiTruck,
  FiPackage,
  FiBell,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiPlus,
  FiUser,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiCreditCard
} from 'react-icons/fi';
import { RupeeIcon } from './RupeeIcon';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const adminMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin' },
    { icon: FiPackage, label: 'Orders', path: '/admin/bookings' },
    { icon: FiTruck, label: 'Products', path: '/admin/machines' },
    { icon: RupeeIcon, label: 'Earnings', path: '/admin/revenue' },
    { icon: FiUsers, label: 'Users', path: '/admin/users' },
    { icon: FiBell, label: 'Notifications', path: '/admin/notifications' },
    { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
  ];

  const farmerMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/farmer' },
    { icon: FiTruck, label: 'Browse Equipment', path: '/farmer/machines' },
    { icon: FiPackage, label: 'My Bookings', path: '/farmer/bookings' },
    { icon: FiBell, label: 'Notifications', path: '/farmer/notifications' },
    { icon: FiSettings, label: 'Profile Settings', path: '/farmer/profile' },
  ];

  const ownerMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/owner' },
    { icon: FiTruck, label: 'My Machinery', path: '/owner/machines' },
    { icon: FiPlus, label: 'Add Machinery', path: '/owner/add-machine' },
    { icon: FiPackage, label: 'Rental Requests', path: '/owner/requests' },
    { icon: RupeeIcon, label: 'Fleet Earnings', path: '/owner/earnings' },
    { icon: FiCreditCard, label: 'Payment Settings', path: '/owner/payment-settings' },
    { icon: FiBell, label: 'Notifications', path: '/owner/notifications' },
    { icon: FiSettings, label: 'Profile Settings', path: '/owner/profile' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'Admin': return adminMenuItems;
      case 'Farmer': return farmerMenuItems;
      case 'Owner': return ownerMenuItems;
      default: return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'Admin': return { 
        gradientStart: '#f43f5e',
        gradientEnd: '#db2777',
        bgGlow: 'rgba(244, 63, 94, 0.15)',
        text: '#f43f5e',
        border: 'rgba(244, 63, 94, 0.3)'
      };
      case 'Farmer': return { 
        gradientStart: '#10b981',
        gradientEnd: '#059669',
        bgGlow: 'rgba(16, 185, 129, 0.15)',
        text: '#10b981',
        border: 'rgba(16, 185, 129, 0.3)'
      };
      case 'Owner': return { 
        gradientStart: '#3b82f6',
        gradientEnd: '#4f46e5',
        bgGlow: 'rgba(59, 130, 246, 0.15)',
        text: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.3)'
      };
      default: return { 
        gradientStart: '#6b7280',
        gradientEnd: '#475569',
        bgGlow: 'rgba(255, 255, 255, 0.1)',
        text: '#a1a1a1',
        border: 'rgba(255, 255, 255, 0.2)'
      };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="sidebar-new"
    >
      {/* Ambient glow effect */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${roleConfig.bgGlow} 0%, transparent 50%)`
        }}
      />
      
      {/* Logo Section */}
      <div className="sidebar-header-new">
        <motion.div 
          className="logo-new"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div 
            className="logo-icon-new"
            style={{ 
              background: `linear-gradient(135deg, ${roleConfig.gradientStart} 0%, ${roleConfig.gradientEnd} 100%)`,
              boxShadow: `0 8px 32px ${roleConfig.text}35`
            }}
          >
            <span>A</span>
          </div>
          <div className="user-info">
            <h2 className="logo-text-new">FarmEase</h2>
            <p className="logo-subtitle">Farm Equipment Platform</p>
          </div>
        </motion.div>
      </div>

      {/* User Profile Section */}
      <AnimatePresence>
        {user && (
          <motion.div 
            className="sidebar-profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Profile glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${roleConfig.bgGlow} 0%, transparent 60%)`
              }}
            />
            
            <div className="profile-header">
              <div 
                className="profile-avatar"
                style={{ 
                  background: `linear-gradient(135deg, ${roleConfig.gradientStart} 0%, ${roleConfig.gradientEnd} 100%)`,
                  boxShadow: `0 4px 16px ${roleConfig.bgGlow}`
                }}
              >
                <FiUser />
              </div>
              <div className="user-info">
                <p className="profile-name">
                  {user.fullName || user.email?.split('@')[0] || 'User'}
                </p>
                <span 
                  className="profile-role"
                  style={{ 
                    background: `linear-gradient(135deg, ${roleConfig.gradientStart} 0%, ${roleConfig.gradientEnd} 100%)`,
                    boxShadow: `0 2px 8px ${roleConfig.bgGlow}`
                  }}
                >
                  {user.role || 'User'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <nav className="sidebar-nav-new">
        <div className="nav-section-title">Navigation</div>
        
        <ul>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDashboard = item.path === '/admin' || item.path === '/farmer' || item.path === '/owner';
            const isActive = isDashboard 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={index}>
                <motion.button
                  onClick={() => navigate(item.path)}
                  className={`nav-item-new ${isActive ? 'active' : ''}`}
                  style={isActive ? {
                    '--active-color': roleConfig.gradientStart
                  } : {}}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ 
                        background: `linear-gradient(180deg, ${roleConfig.gradientStart} 0%, ${roleConfig.gradientEnd} 100%)`,
                        boxShadow: `0 0 12px ${roleConfig.text}80`
                      }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <div 
                    className="nav-item-icon"
                    style={isActive ? { 
                      background: `linear-gradient(135deg, ${roleConfig.gradientStart} 0%, ${roleConfig.gradientEnd} 100%)`,
                      boxShadow: `0 4px 20px ${roleConfig.text}40`
                    } : {}}
                  >
                    <Icon />
                  </div>
                  
                  {/* Label */}
                  <span className="nav-item-text">{item.label}</span>
                  
                  {/* Arrow indicator */}
                  <FiChevronRight className="nav-item-arrow" />
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Theme Toggle Section */}
      <div style={{ padding: '8px 16px' }}>
        <motion.button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            background: 'var(--bg-button)',
            border: '1px solid var(--border-primary)',
            borderRadius: '12px',
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          whileHover={{ scale: 1.01, backgroundColor: 'var(--bg-button-hover)' }}
          whileTap={{ scale: 0.99 }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
          }}>
            {isDark ? <FiSun style={{ color: '#f59e0b' }} /> : <FiMoon style={{ color: '#6366f1' }} />}
          </div>
          <span className="nav-item-text">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </motion.button>
      </div>
      
      {/* Logout Section */}
      <div className="sidebar-footer-new">
        <motion.button
          onClick={handleLogout}
          className="logout-btn-new"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="logout-icon-new">
            <FiLogOut />
          </div>
          <span className="nav-item-text">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
