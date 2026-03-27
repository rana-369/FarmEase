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
  FiPlus
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

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 h-full flex flex-col"
      style={{ 
        backgroundColor: '#0a0a0a',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-2xl font-bold" style={{ color: '#22c55e' }}>AgriConnect</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            // Precise active state logic: 
            // 1. Exact match for main dashboard (/admin, /farmer, or /owner)
            // 2. StartsWith match for sub-pages
            const isDashboard = item.path === '/admin' || item.path === '/farmer' || item.path === '/owner';
            const isActive = isDashboard 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={index}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    color: isActive ? '#22c55e' : '#a1a1a1',
                    border: isActive ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent'
                  }}
                >
                  <Icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all"
          style={{
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <FiLogOut className="text-xl" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
