import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiTrash2, FiClock, FiRefreshCw } from 'react-icons/fi';
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

  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return { icon: FiCheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.25)' };
      case 'warning': return { icon: FiAlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.25)' };
      case 'error': return { icon: FiAlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.25)' };
      default: return { icon: FiInfo, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.25)' };
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '56px',
            height: '56px',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '16px',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            animation: 'pulse 2s ease-in-out infinite',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
              }} />
              <FiBell style={{ fontSize: '20px', color: '#ffffff', position: 'relative', zIndex: 10 }} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)'
              }}>Notifications</h1>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)'
              }}>Fleet alerts and rental updates</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchNotifications}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              background: 'var(--bg-button)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <FiRefreshCw style={{ fontSize: '14px' }} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'Total', value: notifications.length, color: '#3b82f6', bgGradient: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.3)' },
            { label: 'Unread', value: notifications.filter(n => !n.isRead).length, color: '#10b981', bgGradient: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' },
            { label: 'Read', value: notifications.filter(n => n.isRead).length, color: '#8b5cf6', bgGradient: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.3)' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              style={{
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${stat.bgGradient} 0%, rgba(255,255,255,0.03) 100%)`,
                border: `1px solid ${stat.borderColor}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <p style={{
                fontSize: '24px',
                fontWeight: 700,
                position: 'relative',
                color: stat.color
              }}>{stat.value}</p>
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                position: 'relative',
                color: 'var(--text-secondary)'
              }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-primary)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                background: 'var(--bg-button)',
                border: '1px solid var(--border-secondary)'
              }}>
                <FiBell style={{ fontSize: '32px', color: 'var(--text-muted)' }} />
              </div>
              <p style={{
                fontSize: '14px',
                marginBottom: '4px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>All caught up!</p>
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary)'
              }}>No new notifications for your fleet</p>
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
                  whileHover={{ scale: 1.01, x: 4 }}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: notification.isRead ? 'var(--bg-button)' : 'var(--bg-card)',
                    border: notification.isRead ? '1px solid var(--border-tertiary)' : `1px solid ${config.border}`,
                    opacity: notification.isRead ? 0.6 : 1
                  }}
                >
                  {!notification.isRead && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.2,
                      background: `radial-gradient(circle at 0% 50%, ${config.color}10 0%, transparent 60%)`
                    }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg} 100%)`,
                      border: `1px solid ${config.border}`
                    }}>
                      <Icon style={{ fontSize: '18px', color: config.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <h3 style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: 'var(--text-primary)'
                        }}>
                          {notification.title}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)'
                        }}>
                          <FiClock style={{ fontSize: '12px' }} />
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        marginBottom: '12px',
                        fontWeight: 500,
                        color: 'var(--text-muted)'
                      }}>
                        {notification.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(notification.id)}
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '8px 16px',
                              borderRadius: '12px',
                              border: 'none',
                              cursor: 'pointer',
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
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#f87171',
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.25)'
                          }}
                        >
                          <FiTrash2 style={{ fontSize: '12px' }} />
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

export default OwnerNotifications;
