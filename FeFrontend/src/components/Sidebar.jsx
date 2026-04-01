import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiTruck, 
  FiPackage, 
  FiBell, 
  FiSettings, 
  FiUsers,
  FiLogOut,
  FiPlus,
  FiUser
} from 'react-icons/fi';
import { RupeeIcon } from './RupeeIcon';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

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

  const getRoleColor = () => {
    switch (user?.role) {
      case 'Admin': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Farmer': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'Owner': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#a1a1a1', border: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-72 h-full flex flex-col"
      style={{ 
        background: 'linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>AgriConnect</h2>
            <p className="text-xs" style={{ color: '#666666' }}>Farm Equipment Platform</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="px-4 pb-4">
          <div 
            className="p-4 rounded-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: getRoleColor().bg,
                  border: `2px solid ${getRoleColor().border}`
                }}
              >
                <FiUser className="text-lg" style={{ color: getRoleColor().text }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#ffffff' }}>
                  {user.fullName || user.email?.split('@')[0] || 'User'}
                </p>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                  style={{ 
                    backgroundColor: getRoleColor().bg,
                    color: getRoleColor().text
                  }}
                >
                  {user.role || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="mb-2 px-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
            Menu
          </span>
        </div>
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDashboard = item.path === '/admin' || item.path === '/farmer' || item.path === '/owner';
            const isActive = isDashboard 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={index}>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
                  style={{
                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    color: isActive ? '#22c55e' : '#888888',
                  }}
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ 
                      backgroundColor: isActive 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isActive ? '0 2px 8px rgba(34, 197, 94, 0.2)' : 'none'
                    }}
                  >
                    <Icon className="text-lg" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1.5 h-1.5 rounded-full ml-auto"
                      style={{ backgroundColor: '#22c55e' }}
                    />
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout Section */}
      <div className="p-4 mt-auto">
        <div 
          className="p-1 rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.05)'
            }}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
            >
              <FiLogOut className="text-lg" />
            </div>
            <span className="font-medium text-sm">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
