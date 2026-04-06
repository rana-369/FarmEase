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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(168, 85, 247, 0.2)', borderTopColor: '#a855f7' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiBell className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Notifications</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>System alerts and messages</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)', 
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
            { label: 'Unread', value: notifications.filter(n => !n.isRead).length, color: '#10b981' },
            { label: 'Read', value: notifications.filter(n => n.isRead).length, color: '#6b7280' }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-5 rounded-2xl relative overflow-hidden group"
              style={{ 
                background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}20`
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
              <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <FiBell className="text-4xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>No notifications found</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>You're all caught up!</p>
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
                  whileHover={{ scale: 1.01 }}
                  className="p-5 rounded-2xl transition-all relative overflow-hidden group"
                  style={{ 
                    background: notification.isRead 
                      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)' 
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: notification.isRead 
                      ? '1px solid rgba(255, 255, 255, 0.04)' 
                      : `1px solid ${config.color}30`,
                    opacity: notification.isRead ? 0.6 : 1
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${config.color}10 0%, transparent 60%)` }} />
                  <div className="flex items-start gap-4 relative">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg} 100%)`,
                        border: `1px solid ${config.color}25`
                      }}
                    >
                      <Icon className="text-lg" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm" style={{ color: '#ffffff' }}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <FiClock />
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3">
                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs font-semibold px-4 py-2 rounded-xl"
                            style={{ 
                              color: '#10b981', 
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                              border: '1px solid rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            Mark as read
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs font-semibold flex items-center gap-1.5 px-4 py-2 rounded-xl"
                          style={{ 
                            color: '#f87171', 
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.25)'
                          }}
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
