import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getRevenueData, getAdminDashboardData } from '../../services/dashboardService';

const EarningsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    profit: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const [rev, dash] = await Promise.all([
          getRevenueData(),
          getAdminDashboardData()
        ]);
        
        if (rev) setRevenueData(rev);
        if (dash) {
          // Backend returns AdminDashboardStatsDto directly
          setStats({
            totalTransactionValue: dash.totalRevenue || dash.TotalRevenue || 0,
            platformProfit: dash.platformRevenue || dash.PlatformRevenue || 0,
            totalBookings: dash.totalBookings || dash.TotalBookings || 0
          });
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4">
            <span className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', 
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              Financial Overview
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Earnings Analytics</h1>
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Track and analyze platform revenue and commissions</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              label: 'Total Transaction Volume', 
              value: (stats.totalTransactionValue || 0) >= 1000 
                ? `₹${((stats.totalTransactionValue || 0) / 1000).toFixed(1)}K` 
                : `₹${(stats.totalTransactionValue || 0).toFixed(0)}`, 
              icon: RupeeIcon, 
              color: '#10b981' 
            },
            { 
              label: 'Platform Profit (10%)', 
              value: (stats.platformProfit || 0) >= 1000 
                ? `₹${((stats.platformProfit || 0) / 1000).toFixed(1)}K` 
                : `₹${(stats.platformProfit || 0).toFixed(0)}`, 
              icon: FiTrendingUp, 
              color: '#3b82f6' 
            },
            { label: 'Total Transactions', value: stats.totalBookings, icon: FiCalendar, color: '#a855f7' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-8 rounded-3xl relative overflow-hidden group"
              style={{ 
                background: `linear-gradient(135deg, ${item.color}10 0%, ${item.color}05 100%)`,
                border: `1px solid ${item.color}20`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}15 0%, transparent 60%)` }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative" style={{ 
                background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}15 100%)`,
                border: `1px solid ${item.color}30`
              }}>
                <item.icon className="text-xl" style={{ color: item.color }} />
              </div>
              <p className="text-sm font-medium mb-2 relative" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
              <h3 className="text-3xl font-bold relative" style={{ color: 'var(--text-primary)' }}>{item.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl relative overflow-hidden"
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)' }} />
          <div className="flex items-center justify-between mb-10 relative">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Monthly Revenue Breakdown</h2>
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl transition-all" 
                style={{ 
                  background: 'var(--bg-button)', 
                  border: '1px solid var(--border-primary)', 
                  color: 'var(--text-muted)' 
                }}
              >
                <FiFilter />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl transition-all" 
                style={{ 
                  background: 'var(--bg-button)', 
                  border: '1px solid var(--border-primary)', 
                  color: 'var(--text-muted)' 
                }}
              >
                <FiDownload />
              </motion.button>
            </div>
          </div>

          <div className="space-y-8 relative">
            {revenueData.map((data, index) => (
              <div key={data.month || index} className="group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{data.month}</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>₹{(data.revenue || data.Revenue || 0).toLocaleString()}</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: 'var(--bg-button)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((data.revenue || data.Revenue || 0) / maxRevenue) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EarningsPage;
