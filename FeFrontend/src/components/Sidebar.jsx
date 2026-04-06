import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiUser,
  FiChevronRight
} from 'react-icons/fi';
import { RupeeIcon } from './RupeeIcon';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const adminMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin', gradient: 'from-violet-500 to-purple-600' },
    { icon: FiPackage, label: 'Orders', path: '/admin/bookings', gradient: 'from-amber-500 to-orange-600' },
    { icon: FiTruck, label: 'Products', path: '/admin/machines', gradient: 'from-cyan-500 to-teal-600' },
    { icon: RupeeIcon, label: 'Earnings', path: '/admin/revenue', gradient: 'from-emerald-500 to-green-600' },
    { icon: FiUsers, label: 'Users', path: '/admin/users', gradient: 'from-pink-500 to-rose-600' },
    { icon: FiBell, label: 'Notifications', path: '/admin/notifications', gradient: 'from-blue-500 to-indigo-600' },
    { icon: FiSettings, label: 'Settings', path: '/admin/settings', gradient: 'from-slate-500 to-gray-600' },
  ];

  const farmerMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/farmer', gradient: 'from-emerald-500 to-green-600' },
    { icon: FiTruck, label: 'Browse Equipment', path: '/farmer/machines', gradient: 'from-cyan-500 to-teal-600' },
    { icon: FiPackage, label: 'My Bookings', path: '/farmer/bookings', gradient: 'from-violet-500 to-purple-600' },
    { icon: FiBell, label: 'Notifications', path: '/farmer/notifications', gradient: 'from-amber-500 to-orange-600' },
    { icon: FiSettings, label: 'Profile Settings', path: '/farmer/profile', gradient: 'from-slate-500 to-gray-600' },
  ];

  const ownerMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/owner', gradient: 'from-blue-500 to-indigo-600' },
    { icon: FiTruck, label: 'My Machinery', path: '/owner/machines', gradient: 'from-cyan-500 to-teal-600' },
    { icon: FiPlus, label: 'Add Machinery', path: '/owner/add-machine', gradient: 'from-emerald-500 to-green-600' },
    { icon: FiPackage, label: 'Rental Requests', path: '/owner/requests', gradient: 'from-violet-500 to-purple-600' },
    { icon: RupeeIcon, label: 'Fleet Earnings', path: '/owner/earnings', gradient: 'from-amber-500 to-orange-600' },
    { icon: FiBell, label: 'Notifications', path: '/owner/notifications', gradient: 'from-pink-500 to-rose-600' },
    { icon: FiSettings, label: 'Profile Settings', path: '/owner/profile', gradient: 'from-slate-500 to-gray-600' },
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
        gradient: 'from-rose-500 to-pink-600', 
        bgGlow: 'rgba(244, 63, 94, 0.15)',
        text: '#f43f5e',
        border: 'rgba(244, 63, 94, 0.3)'
      };
      case 'Farmer': return { 
        gradient: 'from-emerald-500 to-green-600', 
        bgGlow: 'rgba(16, 185, 129, 0.15)',
        text: '#10b981',
        border: 'rgba(16, 185, 129, 0.3)'
      };
      case 'Owner': return { 
        gradient: 'from-blue-500 to-indigo-600', 
        bgGlow: 'rgba(59, 130, 246, 0.15)',
        text: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.3)'
      };
      default: return { 
        gradient: 'from-gray-500 to-slate-600', 
        bgGlow: 'rgba(255, 255, 255, 0.1)',
        text: '#a1a1a1',
        border: 'rgba(255, 255, 255, 0.2)'
      };
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-72 h-full flex flex-col relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.04)'
      }}
    >
      {/* Ambient glow effect */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)'
        }}
      />
      
      {/* Logo Section */}
      <div className="p-6 pb-3 relative">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <span className="text-white font-bold text-lg relative z-10">A</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#ffffff' }}>AgriConnect</h2>
            <p className="text-xs font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.75)' }}>Farm Equipment Platform</p>
          </div>
        </motion.div>
      </div>

      {/* User Profile Section */}
      <AnimatePresence>
        {user && (
          <motion.div 
            className="px-4 pb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div 
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
              }}
            >
              {/* Profile glow */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${getRoleConfig().bgGlow} 0%, transparent 60%)`
                }}
              />
              
              <div className="flex items-center gap-3 relative z-10">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${getRoleConfig().gradient.split(' ')[0].replace('from-', '')} 0%, ${getRoleConfig().gradient.split(' ')[1].replace('to-', '')} 100%)`,
                    boxShadow: `0 4px 16px ${getRoleConfig().bgGlow}`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
                  <FiUser className="text-lg text-white relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#ffffff' }}>
                    {user.fullName || user.email?.split('@')[0] || 'User'}
                  </p>
                  <span 
                    className="text-xs px-2.5 py-1 rounded-full inline-block mt-1.5 font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${getRoleConfig().gradient.split(' ')[0].replace('from-', '')} 0%, ${getRoleConfig().gradient.split(' ')[1].replace('to-', '')} 100%)`,
                      color: '#ffffff',
                      boxShadow: `0 2px 8px ${getRoleConfig().bgGlow}`
                    }}
                  >
                    {user.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto relative">
        <motion.div 
          className="mb-3 px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Navigation
          </span>
        </motion.div>
        
        <ul className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDashboard = item.path === '/admin' || item.path === '/farmer' || item.path === '/owner';
            const isActive = isDashboard 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
              >
                <motion.button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 group relative overflow-hidden"
                  style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active indicator bar */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                        style={{ 
                          background: `linear-gradient(180deg, ${item.gradient.split(' ')[0].replace('from-', '')} 0%, ${item.gradient.split(' ')[1].replace('to-', '')} 100%)`,
                          boxShadow: `0 0 12px ${item.gradient.split(' ')[0].replace('from-', '')}80`
                        }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 32 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at 0% 50%, ${item.gradient.split(' ')[0].replace('from-', '')}15 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Icon container */}
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all duration-300`}
                    style={{ 
                      background: isActive 
                        ? `linear-gradient(135deg, ${item.gradient.split(' ')[0].replace('from-', '')} 0%, ${item.gradient.split(' ')[1].replace('to-', '')} 100%)`
                        : 'rgba(255, 255, 255, 0.04)',
                      boxShadow: isActive 
                        ? `0 4px 20px ${item.gradient.split(' ')[0].replace('from-', '')}40, inset 0 1px 0 rgba(255,255,255,0.6)`
                        : 'none'
                    }}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />}
                    <Icon className={`text-lg relative z-10 ${isActive ? 'text-white' : ''}`} style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)' }} />
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="font-semibold text-sm relative z-10"
                    style={{ 
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                      textShadow: isActive ? '0 0 20px rgba(255,255,255,0.7)' : 'none'
                    }}
                  >
                    {item.label}
                  </span>
                  
                  {/* Arrow indicator */}
                  <motion.div
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: isActive ? 0 : -5 }}
                  >
                    <FiChevronRight 
                      className="text-sm" 
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                    />
                  </motion.div>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout Section */}
      <motion.div 
        className="p-4 mt-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div 
          className="rounded-2xl relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.12)'
          }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Hover effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 70%)'
              }}
            />
            
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <FiLogOut className="text-lg" style={{ color: '#f87171' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#f87171' }}>Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
