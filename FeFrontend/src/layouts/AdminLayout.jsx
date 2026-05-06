import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
      <Sidebar />
      
      <div 
        className="flex-1 overflow-auto"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          marginLeft: '260px',
          transition: 'background-color 0.3s ease'
        }}
      >
        {/* Page transition animation - triggers only on route change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ color: 'var(--text-primary)' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminLayout;
