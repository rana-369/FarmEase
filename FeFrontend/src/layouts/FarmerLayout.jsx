import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FarmerLayout = () => {
  // Auth is already checked by ProtectedRoute in App.jsx - no need to re-check here
  // This avoids race conditions with auth state
  const { theme } = useTheme();

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className="flex-1 overflow-auto"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          marginLeft: '260px',
          transition: 'background-color 0.3s ease'
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: 'var(--text-primary)' }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default FarmerLayout;
