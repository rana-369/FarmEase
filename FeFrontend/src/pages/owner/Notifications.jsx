import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiTrash2, FiClock } from 'react-icons/fi';
import api from '../../services/api';

const OwnerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/user-notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return <FiCheckCircle style={{ color: '#22c55e' }} />;
      case 'warning': return <FiAlertCircle style={{ color: '#facc15' }} />;
      case 'error': return <FiAlertCircle style={{ color: '#ef4444' }} />;
      default: return <FiInfo style={{ color: '#3b82f6' }} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>Notifications</h1>
            <p className="text-lg" style={{ color: '#a1a1a1' }}>Manage alerts for your equipment fleet and rentals</p>
          </motion.div>
          <button 
            onClick={fetchNotifications}
            className="px-6 py-3 rounded-xl transition-all font-medium"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: '#ffffff' 
            }}
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-32 rounded-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
              <FiBell className="text-6xl mx-auto mb-6" style={{ color: '#333333' }} />
              <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
              <p style={{ color: '#a1a1a1' }}>No new notifications for your fleet.</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl transition-all"
                style={{ 
                  backgroundColor: notification.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  border: notification.isRead ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(34, 197, 94, 0.2)',
                  opacity: notification.isRead ? 0.7 : 1
                }}
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)' 
                  }}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <FiClock className="text-sm" style={{ color: '#666666' }} />
                        <span className="text-xs" style={{ color: '#666666' }}>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-base mb-5 leading-relaxed" style={{ color: '#a1a1a1' }}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-6">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm font-bold transition-colors"
                          style={{ color: '#22c55e' }}
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm font-bold flex items-center gap-2 transition-colors"
                        style={{ color: '#ef4444' }}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerNotifications;
