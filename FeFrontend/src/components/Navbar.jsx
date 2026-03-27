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
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : isOwner ? '/owner' : '/farmer'} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
              <FiTruck className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-white">AgriConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  location.pathname === link.path ? '' : 'hover:bg-white/5'
                }`}
                style={{
                  color: location.pathname === link.path ? '#22c55e' : '#a1a1a1',
                  backgroundColor: location.pathname === link.path ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                }}
              >
                <link.icon className="text-lg" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: '#a1a1a1' }}
            >
              <FiBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-white/5"
                style={{ color: '#a1a1a1' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <FiUser style={{ color: '#22c55e' }} />
                </div>
                <span className="hidden md:block text-sm font-medium capitalize">{user?.role}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <Link
                    to={isAdmin ? '/admin/settings' : isOwner ? '/owner/profile' : '/farmer/profile'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 transition-all hover:bg-white/5"
                    style={{ color: '#a1a1a1' }}
                  >
                    <FiUser />
                    <span className="text-sm">Profile</span>
                  </Link>
                  <Link
                    to={isAdmin ? '/admin/settings' : isOwner ? '/owner/notifications' : '/farmer/notifications'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 transition-all hover:bg-white/5"
                    style={{ color: '#a1a1a1' }}
                  >
                    <FiSettings />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 transition-all hover:bg-red-500/10"
                    style={{ color: '#ef4444' }}
                  >
                    <FiLogOut />
                    <span className="text-sm">Logout</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: '#a1a1a1' }}
            >
              {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === link.path ? '' : 'hover:bg-white/5'
                }`}
                style={{
                  color: location.pathname === link.path ? '#22c55e' : '#a1a1a1',
                  backgroundColor: location.pathname === link.path ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                }}
              >
                <link.icon className="text-lg" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
