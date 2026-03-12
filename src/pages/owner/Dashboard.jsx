import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiDollarSign, FiTrendingUp, FiClock, FiCalendar, FiUsers, FiPlus } from 'react-icons/fi';
import { getOwnerStats, getOwnerEquipment, getOwnerActivity } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeRentals: 0,
    totalEarnings: 0,
    pendingRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats, equipment, and activity from backend
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
      
      // Set stats with strict backend data
      if (statsData) {
        setStats({
          totalMachines: statsData.totalMachines ?? 0,
          activeRentals: statsData.activeRentals ?? 0,
          totalEarnings: statsData.totalEarnings ?? 0,
          pendingRequests: statsData.pendingRequests ?? 0
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
      
      // Transform activity data
      const transformedActivity = (activityData || []).map(activity => ({
        id: activity.id || activity.Id || Math.random().toString(36).substr(2, 9),
        type: activity.type || activity.Type || 'booking',
        machineName: activity.machineName || activity.MachineName || activity.equipmentName || 'Equipment',
        farmerName: activity.farmerName || activity.FarmerName || activity.userName || 'User',
        action: activity.action || activity.Action || 'made a booking',
        time: activity.createdAt || activity.CreatedAt ? new Date(activity.createdAt || activity.CreatedAt).toLocaleDateString() : 'Recently',
        status: (activity.status || activity.Status || 'pending').toLowerCase(),
        amount: activity.totalAmount || activity.TotalAmount || activity.amount || null
      }));
      
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

  const statCards = [
    {
      title: 'Total Machines',
      value: stats.totalMachines,
      icon: FiTruck,
      color: '#3b82f6',
      change: stats.totalMachines > 0 ? `+${stats.totalMachines}` : '0',
      changeType: 'positive'
    },
    {
      title: 'Active Rentals',
      value: stats.activeRentals,
      icon: FiClock,
      color: '#22c55e',
      change: stats.activeRentals > 0 ? `+${stats.activeRentals}` : '0',
      changeType: 'positive'
    },
    {
      title: 'Total Earnings',
      value: `₹${(stats.totalEarnings || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: '#a855f7',
      change: stats.totalEarnings > 0 ? 'Live' : '0%',
      changeType: 'positive'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: FiCalendar,
      color: '#f59e0b',
      change: stats.pendingRequests > 0 ? `+${stats.pendingRequests}` : '0',
      changeType: 'neutral'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header Section with Gradient */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #16a34a 100%)' }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)', 
          backgroundSize: '100% 100%'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="mb-4">
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ 
                  backgroundColor: 'rgba(22, 163, 74, 0.1)', 
                  color: '#22c55e',
                  border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                  Fleet Console
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ color: '#ffffff' }}>
                Owner Dashboard
              </h1>
              <p className="text-lg" style={{ color: '#a1a1a1' }}>Manage your machinery fleet and track rental revenue growth.</p>
            </div>
            <div className="px-6 py-3 rounded-2xl" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Fleet Owner</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-2xl relative overflow-hidden group"
                                style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                {/* Background Glow Effect */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-3xl transition-all group-hover:opacity-20" 
                                     style={{ backgroundColor: stat.color }}></div>
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ 
                                        backgroundColor: `${stat.color}15`,
                                        border: `1px solid ${stat.color}30`
                                    }}>
                                        <Icon className="text-xl" style={{ color: stat.color }} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-md tracking-wider uppercase" style={{ 
                                        backgroundColor: stat.changeType === 'positive' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                        color: stat.changeType === 'positive' ? '#22c55e' : '#a1a1a1',
                                        border: `1px solid ${stat.changeType === 'positive' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                                    }}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1 tracking-tight" style={{ color: '#ffffff' }}>
                                    {stat.title === 'Total Earnings' ? `₹${(stats.totalEarnings || 0).toLocaleString()}` : stat.value}
                                </h3>
                                <p className="text-sm font-medium uppercase tracking-widest opacity-60" style={{ color: '#a1a1a1' }}>{stat.title}</p>
                            </motion.div>
                        );
                    })}
                </div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-3xl group cursor-pointer transition-all"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => navigate('/owner/add-machine')}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <FiPlus className="text-2xl text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Add Machinery</h3>
            <p style={{ color: '#a1a1a1' }}>List new equipment for rental.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-3xl group cursor-pointer transition-all"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => navigate('/owner/requests')}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <FiCalendar className="text-2xl text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rental Requests</h3>
            <p style={{ color: '#a1a1a1' }}>Manage your incoming bookings.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-8 rounded-3xl group cursor-pointer transition-all"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => navigate('/owner/earnings')}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <FiDollarSign className="text-2xl text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fleet Earnings</h3>
            <p style={{ color: '#a1a1a1' }}>Track your revenue growth.</p>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-8 rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-white">Recent Fleet Activity</h2>
            <button className="text-green-500 font-bold hover:text-green-400 transition-colors">View All History</button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-6 rounded-2xl transition-all hover:bg-white/10"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                    backgroundColor: activity.type === 'booking' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: activity.type === 'booking' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    {activity.type === 'booking' ? <FiCalendar style={{ color: '#3b82f6' }} /> : <FiDollarSign style={{ color: '#22c55e' }} />}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">
                      <span className="font-bold">{activity.farmerName}</span> {activity.action} <span className="font-bold text-green-500">{activity.machineName}</span>
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <p className="text-xl font-bold text-green-500">₹{activity.amount.toLocaleString()}</p>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ 
                    backgroundColor: activity.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: activity.status === 'completed' ? '#22c55e' : '#a1a1a1',
                    border: activity.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-20">
                <FiClock className="text-6xl mx-auto mb-6 text-gray-800" />
                <p className="text-lg text-gray-500">No fleet activity detected yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
