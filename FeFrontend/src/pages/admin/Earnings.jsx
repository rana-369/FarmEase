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
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4">
            <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ 
              backgroundColor: 'rgba(22, 163, 74, 0.1)', 
              color: '#22c55e',
              border: '1px solid rgba(22, 163, 74, 0.2)'
            }}>
              Financial Overview
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>Earnings Analytics</h1>
          <p className="text-lg" style={{ color: '#a1a1a1' }}>Track and analyze platform revenue and commissions</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Transaction Volume', value: `₹${((stats.totalTransactionValue || 0) / 1000).toFixed(1)}K`, icon: RupeeIcon, color: '#22c55e' },
            { label: 'Platform Profit (10%)', value: `₹${((stats.platformProfit || 0) / 1000).toFixed(1)}K`, icon: FiTrendingUp, color: '#3b82f6' },
            { label: 'Total Transactions', value: stats.totalBookings, icon: FiCalendar, color: '#a855f7' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <item.icon className="text-xl" style={{ color: item.color }} />
              </div>
              <p className="text-sm mb-2" style={{ color: '#a1a1a1' }}>{item.label}</p>
              <h3 className="text-3xl font-bold" style={{ color: '#ffffff' }}>{item.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-2xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Monthly Revenue Breakdown</h2>
            <div className="flex gap-3">
              <button className="p-3 rounded-xl transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#a1a1a1' }}><FiFilter /></button>
              <button className="p-3 rounded-xl transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#a1a1a1' }}><FiDownload /></button>
            </div>
          </div>

          <div className="space-y-8">
            {revenueData.map((data, index) => (
              <div key={data.month || index} className="group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: '#a1a1a1' }}>{data.month}</span>
                  <span className="font-bold text-lg" style={{ color: '#ffffff' }}>₹{(data.revenue || data.Revenue || 0).toLocaleString()}</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((data.revenue || data.Revenue || 0) / maxRevenue) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: '#22c55e' }}
                  />
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
