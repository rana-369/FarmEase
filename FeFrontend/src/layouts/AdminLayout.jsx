import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  // Auth is already checked by ProtectedRoute in App.jsx - no need to re-check here
  // This avoids race conditions with auth state

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#0a0a0a' }}>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
          style={{ color: '#ffffff' }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLayout;
