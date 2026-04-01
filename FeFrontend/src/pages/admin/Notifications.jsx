import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiTrash2, FiClock, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/admin');
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

  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return { icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
      case 'warning': return { icon: FiAlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'error': return { icon: FiAlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default: return { icon: FiInfo, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
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
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
            >
              <FiBell className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Notifications</h1>
              <p className="text-sm" style={{ color: '#666666' }}>System alerts and messages</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}
          >
            <FiRefreshCw className="text-sm" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: notifications.length, color: '#3b82f6' },
            { label: 'Unread', value: notifications.filter(n => !n.isRead).length, color: '#22c55e' },
            { label: 'Read', value: notifications.filter(n => n.isRead).length, color: '#888888' }
          ].map((stat) => (
            <div 
              key={stat.label}
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
            >
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs" style={{ color: '#888888' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <FiBell className="text-3xl" style={{ color: '#333333' }} />
              </div>
              <p className="text-sm" style={{ color: '#666666' }}>No notifications found</p>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const config = getTypeConfig(notification.type);
              const Icon = config.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 rounded-xl transition-all"
                  style={{ 
                    background: notification.isRead 
                      ? 'rgba(255, 255, 255, 0.02)' 
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: notification.isRead 
                      ? '1px solid rgba(255, 255, 255, 0.04)' 
                      : `1px solid ${config.color}30`,
                    opacity: notification.isRead ? 0.6 : 1
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: config.bg }}
                    >
                      <Icon className="text-lg" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm" style={{ color: '#ffffff' }}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#666666' }}>
                          <FiClock />
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#888888' }}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3">
                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg"
                            style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                          >
                            Mark as read
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                          style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <FiTrash2 className="text-sm" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
