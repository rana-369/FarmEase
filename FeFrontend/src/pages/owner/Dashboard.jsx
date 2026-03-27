import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiTrendingUp, FiClock, FiCalendar, FiUsers, FiPlus } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
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
      const transformedActivity = (activityData || []).map(activity => {
        // Calculate owner's net earnings (totalAmount - platformFee)
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
          amount: baseAmount, // Owner's net earnings (after platform fee deduction)
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
      icon: RupeeIcon,
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
      <div className="relative" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #16a34a 100%)' }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.15) 0%, transparent 50%)', 
          backgroundSize: '100% 100%'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="mb-6">
                <span className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ 
                  backgroundColor: 'rgba(22, 163, 74, 0.15)', 
                  color: '#22c55e',
                  border: '1px solid rgba(22, 163, 74, 0.3)'
                }}>
                  Fleet Console
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight" style={{ color: '#ffffff' }}>
                Owner Dashboard
              </h1>
              <p className="text-xl leading-relaxed" style={{ color: '#888888' }}>Manage your machinery fleet and track rental revenue growth.</p>
            </div>
            <div className="hidden md:block px-8 py-4 rounded-2xl" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)'
            }}>
              <span className="text-base font-semibold" style={{ color: '#22c55e' }}>Fleet Owner</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-10 rounded-3xl relative overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ 
                    backgroundColor: `${stat.color}12`,
                    border: `1px solid ${stat.color}25`
                  }}>
                    <Icon className="text-2xl" style={{ color: stat.color }} />
                  </div>
                  <span className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ 
                    backgroundColor: stat.changeType === 'positive' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)', 
                    color: stat.changeType === 'positive' ? '#22c55e' : '#888888',
                    border: `1px solid ${stat.changeType === 'positive' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`
                  }}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
                  {stat.title === 'Total Earnings' ? `₹${(stats.totalEarnings || 0).toLocaleString()}` : stat.value}
                </h3>
                <p className="text-base font-medium" style={{ color: '#666666' }}>{stat.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-10 rounded-3xl group cursor-pointer transition-all duration-300"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
            onClick={() => navigate('/owner/add-machine')}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <FiPlus className="text-3xl" style={{ color: '#22c55e' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Add Machinery</h3>
            <p className="text-base leading-relaxed" style={{ color: '#666666' }}>List new equipment for rental.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-10 rounded-3xl group cursor-pointer transition-all duration-300"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
            onClick={() => navigate('/owner/requests')}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <FiCalendar className="text-3xl" style={{ color: '#3b82f6' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Rental Requests</h3>
            <p className="text-base leading-relaxed" style={{ color: '#666666' }}>Manage your incoming bookings.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-10 rounded-3xl group cursor-pointer transition-all duration-300"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
            onClick={() => navigate('/owner/earnings')}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <RupeeIcon className="text-3xl" style={{ color: '#a855f7' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Fleet Earnings</h3>
            <p className="text-base leading-relaxed" style={{ color: '#666666' }}>Track your revenue growth.</p>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-10 rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold" style={{ color: '#ffffff' }}>Recent Fleet Activity</h2>
            <button className="font-semibold text-base px-6 py-3 rounded-xl transition-all" style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>View All History</button>
          </div>

          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-8 rounded-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ 
                    backgroundColor: activity.type === 'booking' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: activity.type === 'booking' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    {activity.type === 'booking' ? <FiCalendar className="text-2xl" style={{ color: '#3b82f6' }} /> : <RupeeIcon className="text-2xl" style={{ color: '#22c55e' }} />}
                  </div>
                  <div>
                    <p className="text-xl font-medium" style={{ color: '#ffffff' }}>
                      <span className="font-bold">{activity.farmerName}</span> {activity.action} <span className="font-bold" style={{ color: '#22c55e' }}>{activity.machineName}</span>
                    </p>
                    <p className="text-base mt-1" style={{ color: '#666666' }}>{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <p className="text-2xl font-bold mb-2" style={{ color: '#22c55e' }}>₹{activity.amount.toLocaleString()}</p>
                  )}
                  <span className="px-5 py-2 rounded-full text-sm font-semibold" style={{ 
                    backgroundColor: activity.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: activity.status === 'completed' ? '#22c55e' : '#888888',
                    border: activity.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-24">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <FiClock className="text-4xl" style={{ color: '#333333' }} />
                </div>
                <p className="text-xl" style={{ color: '#666666' }}>No fleet activity detected yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
