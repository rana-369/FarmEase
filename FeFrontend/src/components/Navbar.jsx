import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiSettings, FiHome, FiTruck, FiUsers, FiGrid, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isFarmer, isOwner } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { path: '/admin', label: 'Dashboard', icon: FiHome },
        { path: '/admin/users', label: 'Users', icon: FiUsers },
        { path: '/admin/machines', label: 'Machines', icon: FiTruck },
        { path: '/admin/bookings', label: 'Bookings', icon: FiGrid },
        { path: '/admin/earnings', label: 'Earnings', icon: FiBarChart2 },
        { path: '/admin/settings', label: 'Settings', icon: FiSettings },
      ];
    }
    if (isOwner) {
      return [
        { path: '/owner', label: 'Dashboard', icon: FiHome },
        { path: '/owner/machines', label: 'Machines', icon: FiTruck },
        { path: '/owner/requests', label: 'Requests', icon: FiGrid },
        { path: '/owner/earnings', label: 'Earnings', icon: FiBarChart2 },
      ];
    }
    if (isFarmer) {
      return [
        { path: '/farmer', label: 'Dashboard', icon: FiHome },
        { path: '/farmer/machines', label: 'Machines', icon: FiTruck },
        { path: '/farmer/bookings', label: 'Bookings', icon: FiGrid },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ 
      backgroundColor: 'rgba(5, 5, 5, 0.8)', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(20px)'
    }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : isOwner ? '/owner' : '/farmer'} className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTruck className="text-white text-xl relative z-10" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#ffffff' }}>AgriConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <motion.div key={link.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all relative overflow-hidden"
                    style={{
                      color: isActive ? '#10b981' : 'rgba(255,255,255,0.5)',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)' 
                        : 'transparent',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent'
                    }}
                  >
                    {isActive && (
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
                        }}
                      />
                    )}
                    <link.icon className="text-lg relative z-10" />
                    <span className="text-sm font-semibold relative z-10">{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-xl transition-all"
              style={{ 
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <FiBell className="text-xl" />
              <span 
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" 
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                }}
              />
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all"
                style={{ 
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden" 
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <FiUser style={{ color: '#10b981' }} />
                </div>
                <span className="hidden md:block text-sm font-semibold capitalize">{user?.role}</span>
              </motion.button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <Link
                    to={isAdmin ? '/admin/settings' : isOwner ? '/owner/profile' : '/farmer/profile'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5"
                    style={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <FiUser style={{ color: '#10b981' }} />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  <Link
                    to={isAdmin ? '/admin/settings' : isOwner ? '/owner/notifications' : '/farmer/notifications'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5"
                    style={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <FiSettings style={{ color: '#3b82f6' }} />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all"
                    style={{ color: '#f87171', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' }}
                  >
                    <FiLogOut />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 rounded-xl transition-all"
              style={{ 
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="space-y-1 pt-2">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{
                        color: isActive ? '#10b981' : 'rgba(255,255,255,0.5)',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)' 
                          : 'transparent',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent'
                      }}
                    >
                      <link.icon className="text-lg" />
                      <span className="text-sm font-semibold">{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
