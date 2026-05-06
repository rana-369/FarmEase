import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiArrowUpRight, FiCalendar, FiFilter, FiDownload, FiTruck, FiClock } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getOwnerStats, getOwnerActivity } from '../../services/dashboardService';

const OwnerEarnings = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeRentals: 0,
    totalMachines: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          getOwnerStats(),
          getOwnerActivity()
        ]);
        
        console.log('Earnings Stats Received:', statsData);
        
        if (statsData) {
          setStats({
            totalEarnings: statsData.totalRevenue ?? statsData.TotalRevenue ?? 0,
            activeRentals: statsData.activeBookings ?? statsData.ActiveBookings ?? 0,
            totalMachines: statsData.totalMachines ?? statsData.TotalMachines ?? 0
          });
        }
        
        if (activityData) {
          const transformedActivity = (activityData || []).map(activity => {
            const totalAmount = activity.totalAmount || activity.TotalAmount || activity.amount || 0;
            const platformFee = activity.platformFee || activity.PlatformFee || 0;
            const baseAmount = activity.baseAmount || activity.BaseAmount || (totalAmount - platformFee);
            
            return {
              id: activity.id || activity.Id || Math.random().toString(36).substr(2, 9),
              type: activity.type || activity.Type || 'booking',
              machineName: activity.machineName || activity.MachineName || activity.equipmentName || 'Equipment',
              farmerName: activity.farmerName || activity.FarmerName || 'User',
              action: activity.action || activity.Action || 'made a booking',
              time: activity.createdAt || activity.CreatedAt || new Date().toISOString(),
              status: (activity.status || activity.Status || 'pending').toLowerCase(),
              amount: baseAmount,
              platformFee: platformFee,
              totalAmount: totalAmount
            };
          });
          setActivity(transformedActivity);
        }
      } catch (error) {
        console.error('Error fetching owner earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

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
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: '#10b981',
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
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
          }} />
        </div>
      </div>
    );
  }

  const completedEarnings = activity
    .filter(a => a.status === 'paid' || a.status === 'completed' || a.status === 'active')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const statsConfig = [
    { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, color: '#10b981', bgGradient: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)', icon: RupeeIcon },
    { label: 'Active Rentals', value: stats.activeRentals || 0, color: '#3b82f6', bgGradient: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.3)', icon: FiTruck },
    { label: 'Fleet Size', value: stats.totalMachines || 0, color: '#a855f7', bgGradient: 'rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.3)', icon: FiTrendingUp }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
              }} />
              <FiTrendingUp style={{ fontSize: '24px', color: '#ffffff', position: 'relative', zIndex: 10 }} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)'
              }}>Earnings</h1>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)'
              }}>Track your rental income</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                style={{
                  padding: '20px',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${stat.bgGradient} 0%, rgba(255,255,255,0.03) 100%)`,
                  border: `1px solid ${stat.borderColor}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  background: `linear-gradient(135deg, ${stat.bgGradient} 0%, rgba(255,255,255,0.05) 100%)`,
                  border: `1px solid ${stat.borderColor}`
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: stat.color }} />
                </div>
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
            );
          })}
        </div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)'
          }} />
          
          {/* Transactions Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <FiTrendingUp style={{ width: '20px', height: '20px', color: '#10b981' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Transactions</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <FiFilter style={{ width: '16px', height: '16px' }} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <FiDownload style={{ width: '16px', height: '16px' }} />
              </motion.button>
            </div>
          </div>

          {/* Transaction List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            {activity.filter(a => a.status === 'paid' || a.status === 'completed' || a.status === 'active').map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01, x: 4 }}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <FiTrendingUp style={{ width: '18px', height: '18px', color: '#10b981' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{item.machineName}</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)'
                    }}>
                      <FiCalendar style={{ width: '12px', height: '12px' }} />
                      <span>{new Date(item.time).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.farmerName}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>+₹{(item.amount || 0).toLocaleString()}</p>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981'
                  }}>
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {activity.filter(a => a.status === 'paid' || a.status === 'completed' || a.status === 'active').length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-secondary)'
                }}>
                  <FiTrendingUp style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                </div>
                <p style={{ fontSize: '14px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>No transactions yet</p>
                <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Earnings will appear here after rentals</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerEarnings;
