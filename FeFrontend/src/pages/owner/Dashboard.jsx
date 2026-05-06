import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiClock, FiTrendingUp, FiCalendar, FiPackage, FiPlus, FiUsers, FiActivity, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiArrowRight, FiBarChart2, FiBell, FiMoreVertical, FiArrowUpRight } from 'react-icons/fi';
import { getOwnerStats, getOwnerEquipment, getOwnerActivity } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import OwnerAnalytics from '../../components/owner/OwnerAnalytics';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeRentals: 0,
    totalEarnings: 0,
    pendingRequests: 0,
    avgUtilization: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('Daily');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, equipmentData, activityData] = await Promise.all([
        getOwnerStats().catch(err => { if (import.meta.env.DEV) console.error('Stats fetch failed:', err); return null; }),
        getOwnerEquipment().catch(err => { if (import.meta.env.DEV) console.error('Equipment fetch failed:', err); return []; }),
        getOwnerActivity().catch(err => { if (import.meta.env.DEV) console.error('Activity fetch failed:', err); return []; })
      ]);
      
      if (import.meta.env.DEV) {
        console.log('--- OWNER DASHBOARD DEBUG ---');
        console.log('Raw statsData from backend:', statsData);
        console.log('Raw equipmentData from backend:', equipmentData);
        console.log('------------------------------');
      }
      
      if (statsData) {
        setStats({
          totalMachines: statsData.totalMachines ?? statsData.TotalMachines ?? 0,
          activeRentals: statsData.activeBookings ?? statsData.ActiveBookings ?? 0,
          totalEarnings: statsData.totalRevenue ?? statsData.TotalRevenue ?? 0,
          pendingRequests: statsData.pendingBookings ?? statsData.PendingBookings ?? 0,
          avgUtilization: statsData.avgUtilization ?? statsData.AvgUtilization ?? 78
        });
        
        if (statsData.debugInfo) {
          if (import.meta.env.DEV) {
            console.log('Sync Info:', {
              lastSync: statsData.lastSync,
              userId: statsData.debugInfo.userId,
              machines: statsData.debugInfo.foundMachines,
              bookings: statsData.debugInfo.foundBookings
            });
          }
        }
      } else {
        setStats({
          totalMachines: 0,
          activeRentals: 0,
          totalEarnings: 0,
          pendingRequests: 0
        });
      }
      
      const transformedActivity = (activityData || []).map(activity => {
        const totalAmount = activity.totalAmount || activity.TotalAmount || activity.amount || 0;
        const platformFee = activity.platformFee || activity.PlatformFee || 0;
        const baseAmount = activity.baseAmount || activity.BaseAmount || (totalAmount - platformFee);
        
        return {
          id: activity.id || activity.Id || Math.random().toString(36).substr(2, 9),
          type: activity.type || activity.Type || 'booking',
          machineName: activity.machineName || activity.MachineName || activity.equipmentName || 'Equipment',
          farmerName: activity.farmerName || activity.FarmerName || activity.userName || 'User',
          action: activity.action || activity.Action || 'made a booking',
          time: activity.createdAt || activity.CreatedAt ? new Date(activity.createdAt || activity.CreatedAt).toLocaleDateString() : 'Recently',
          status: (activity.status || activity.Status || 'pending').toLowerCase(),
          amount: baseAmount,
          totalAmount: totalAmount,
          platformFee: platformFee
        };
      });
      
      setRecentActivity(transformedActivity);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching dashboard data:', error);
      }
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate meaningful percentages
  const activeRate = stats.totalMachines > 0 
    ? Math.round((stats.activeRentals / stats.totalMachines) * 100) 
    : 0;
  const pendingRate = stats.totalMachines > 0 
    ? Math.round((stats.pendingRequests / (stats.totalMachines + stats.pendingRequests)) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats.totalMachines,
      subtitle: 'Registered Machines',
      icon: FiTruck,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)'
    },
    {
      title: 'Active Rentals',
      value: `${activeRate}%`,
      subtitle: `${stats.activeRentals} Currently Active`,
      icon: FiClock,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)'
    },
    {
      title: 'Total Earnings',
      value: stats.totalEarnings >= 1000 
        ? `₹${(stats.totalEarnings / 1000).toFixed(1)}K`
        : `₹${stats.totalEarnings}`,
      subtitle: 'Total Revenue',
      icon: FiTrendingUp,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      subtitle: stats.pendingRequests === 0 ? 'No pending requests' : `${pendingRate}% of total`,
      icon: FiCalendar,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)'
    },
    {
      title: 'Utilization',
      value: `${stats.avgUtilization}%`,
      subtitle: 'Fleet Usage Rate',
      icon: FiPackage,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)'
    }
  ];

  // Owner role color config
  const ownerColor = {
    start: '#3b82f6',
    end: '#4f46e5',
    glow: 'rgba(59, 130, 246, 0.15)',
    accent: '#06b6d4'
  };

  // Fleet Score calculation (0-1000 scale based on performance metrics)
  const fleetScore = Math.min(1000, Math.max(0, 
    Math.round(
      (stats.avgUtilization * 3) + 
      (activeRate * 2) + 
      (stats.totalMachines > 0 ? 200 : 0) +
      (stats.totalEarnings > 0 ? Math.min(300, stats.totalEarnings / 100) : 0)
    )
  ));

  if (loading) {
    return (
      <div className="dashboard-modern flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'var(--border-primary)', borderTopColor: '#06b6d4' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      {/* Header - Welcome Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header-modern"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ 
              background: `linear-gradient(135deg, ${ownerColor.start} 0%, ${ownerColor.end} 100%)`,
              color: 'white'
            }}
          >
            <FiTruck />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome! Equipment Owner
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Manage your fleet and track earnings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: 'var(--bg-button)', border: '1px solid var(--border-primary)' }}
          >
            <FiBell style={{ color: 'var(--text-secondary)' }} />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium" style={{ background: '#06b6d4', color: 'white' }}>3</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="dashboard-grid-modern">
        {/* Left Column - Stats & Charts */}
        <div className="dashboard-left-col">
          {/* Current Stats Row - 5 Circular Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stats-row-modern"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="stat-circle-modern"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: stat.bgColor, color: stat.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <FiMoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</h3>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{stat.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OwnerAnalytics />
          </motion.div>
        </div>

        {/* Right Column - Risk Score & Summary */}
        <div className="dashboard-right-col">
          {/* Risk Score Gauge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="gauge-card-modern"
          >
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Fleet Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40" viewBox="0 0 120 120">
                {/* Background arc */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" 
                  stroke="var(--border-primary)" 
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="235 314"
                  transform="rotate(135 60 60)"
                />
                {/* Value arc */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" 
                  stroke="url(#gaugeGradient)" 
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(fleetScore / 1000) * 235} 314`}
                  transform="rotate(135 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{fleetScore}</span>
                <span className="text-xs px-3 py-1.5 rounded-md mt-1.5 whitespace-nowrap font-semibold tracking-wide" style={{ background: fleetScore >= 700 ? 'rgba(16, 185, 129, 0.9)' : fleetScore >= 400 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{fleetScore >= 700 ? 'Excellent' : fleetScore >= 400 ? 'Good' : 'Needs Work'}</span>
              </div>
            </div>
            <div className="flex justify-between mt-4 px-4">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>0</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Score</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>1000</span>
            </div>
          </motion.div>

          {/* Quick Actions - Vertical */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="quick-actions-modern"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Quick Actions</h3>
              <FiMoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            
            {[
              { icon: FiPlus, label: 'Add Machinery', path: '/owner/add-machine', color: '#10b981' },
              { icon: FiCalendar, label: 'Rental Requests', path: '/owner/requests', color: '#3b82f6' },
              { icon: FiTrendingUp, label: 'Fleet Earnings', path: '/owner/earnings', color: '#a855f7' },
              { icon: FiUsers, label: 'My Fleet', path: '/owner/machines', color: '#06b6d4' }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="quick-action-item-modern"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: action.color + '20', color: action.color }}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                <FiArrowUpRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Recent Activity - Bottom Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="activity-table-modern"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
            >
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Latest bookings and updates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm theme-select"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/owner/requests')}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}
            >
              View All <FiArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="space-y-3">
          {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="activity-row-modern"
            >
              <div className="flex items-center gap-4 flex-1">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: activity.type === 'booking' 
                      ? `linear-gradient(135deg, ${ownerColor.start}20 0%, ${ownerColor.end}15 100%)` 
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                    color: activity.type === 'booking' ? ownerColor.start : '#10b981'
                  }}
                >
                  {activity.type === 'booking' ? <FiCalendar className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {activity.farmerName} booked <span style={{ color: ownerColor.accent }}>{activity.machineName}</span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Amount</p>
                  <p className="font-semibold text-sm" style={{ color: '#10b981' }}>₹{activity.amount?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Platform Fee</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>₹{activity.platformFee?.toLocaleString() || 0}</p>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: activity.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: activity.status === 'completed' ? '#10b981' : '#f59e0b'
                  }}
                >
                  {activity.status}
                </span>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--bg-button)' }}
              >
                <FiClock className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No recent activity</p>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .dashboard-modern {
          padding: 24px;
          min-height: 100vh;
          background: var(--bg-secondary);
        }
        
        .dashboard-header-modern {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          margin-bottom: 24px;
          backdrop-filter: blur(20px);
        }
        
        .dashboard-grid-modern {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .dashboard-left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .dashboard-right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .stats-row-modern {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        
        .stat-circle-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }
        
        .stat-circle-modern:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-secondary);
        }
        
        .gauge-card-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
        }
        
        .quick-actions-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(20px);
        }
        
        .quick-action-item-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 8px;
        }
        
        .quick-action-item-modern:hover {
          background: var(--bg-button-hover);
        }
        
        .activity-table-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
        }
        
        .activity-row-modern {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-radius: 12px;
          background: var(--bg-input);
          border: 1px solid var(--border-tertiary);
          transition: all 0.2s ease;
        }
        
        .activity-row-modern:hover {
          background: var(--bg-input-focus);
          border-color: var(--border-secondary);
        }
        
        .theme-select option {
          background: var(--bg-card);
          color: var(--text-primary);
        }
        
        @media (max-width: 1280px) {
          .dashboard-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .dashboard-right-col {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .gauge-card-modern,
          .quick-actions-modern {
            flex: 1;
            min-width: 280px;
          }
        }
        
        @media (max-width: 1024px) {
          .stats-row-modern {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .stats-row-modern {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-header-modern {
            flex-direction: column;
            gap: 16px;
          }
          
          .activity-row-modern {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
