import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiTrendingDown, FiUsers, FiTruck, FiDollarSign, 
  FiCalendar, FiBarChart2, FiActivity, FiArrowUp, FiArrowDown 
} from 'react-icons/fi';
import { RevenueChart, BookingBarChart, CategoryPieChart } from '../charts';
import { 
  getAdminAnalytics, 
  getAdminUserGrowth, 
  getAdminBookingTrends,
  getAdminCategoryDistribution 
} from '../../services/dashboardService';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, userGrowthData, bookingData, categoryData] = await Promise.all([
        getAdminAnalytics(period),
        getAdminUserGrowth(),
        getAdminBookingTrends(),
        getAdminCategoryDistribution()
      ]);

      if (analyticsData) {
        setAnalytics(analyticsData);
        
        if (analyticsData.revenueData && analyticsData.revenueData.length > 0) {
          setRevenueData(analyticsData.revenueData.map(item => ({
            name: item.month || item.name,
            revenue: item.revenue || item.amount || 0,
            bookings: item.bookingCount || item.bookings || item.count || 0
          })));
        }

        if (analyticsData.userGrowth && analyticsData.userGrowth.length > 0) {
          setUserGrowth(analyticsData.userGrowth.map(item => ({
            name: item.month || item.name,
            farmers: item.farmers || 0,
            owners: item.owners || 0,
            total: item.total || 0
          })));
        }

        if (analyticsData.bookingTrends && analyticsData.bookingTrends.length > 0) {
          setBookingTrends(analyticsData.bookingTrends.map(item => ({
            name: item.month || item.name,
            value: item.bookings || item.count || 0,
            color: item.color
          })));
        }

        if (analyticsData.categoryDistribution && analyticsData.categoryDistribution.length > 0) {
          setCategoryDistribution(analyticsData.categoryDistribution.map(item => ({
            name: item.category || item.name,
            value: item.count || item.value || 0,
            color: item.color
          })));
        }
      }

      // Use individual endpoints if main analytics didn't return data
      if (userGrowthData && userGrowthData.length > 0 && userGrowth.length === 0) {
        setUserGrowth(userGrowthData.map(item => ({
          name: item.month || item.name,
          farmers: item.farmers || 0,
          owners: item.owners || 0,
          total: item.total || 0
        })));
      }

      if (bookingData && bookingData.length > 0 && bookingTrends.length === 0) {
        setBookingTrends(bookingData.map(item => ({
          name: item.month || item.name,
          value: item.bookings || item.count || 0,
          color: item.color
        })));
      }

      if (categoryData && categoryData.length > 0 && categoryDistribution.length === 0) {
        setCategoryDistribution(categoryData.map(item => ({
          name: item.category || item.name,
          value: item.count || item.value || 0,
          color: item.color
        })));
      }
    } catch (error) {
      console.error('Failed to fetch admin analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const insights = analytics?.insights || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 rounded-xl animate-spin" style={{ borderColor: 'var(--border-primary)', borderTopColor: '#f43f5e' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#f43f5e', color: 'white' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-modern">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Platform Summary
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monitor platform performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium theme-select"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      {/* Charts Grid - Main Layout */}
      <div className="analytics-grid-modern">
        {/* Main Chart - Platform Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="chart-card-modern chart-main"
        >
          <RevenueChart 
            data={revenueData} 
            title="Platform Revenue"
            color="#ec4899"
            showBookings={true}
          />
        </motion.div>

        {/* Side Chart - Booking Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-card-modern chart-side"
        >
          <BookingBarChart 
            data={bookingTrends}
            title="Booking Trends"
          />
        </motion.div>

        {/* Pie Chart - Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-card-modern chart-pie"
        >
          <CategoryPieChart 
            data={categoryDistribution}
            title="Equipment Categories"
          />
        </motion.div>

        {/* Insights Cards - Compact Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="insights-row-modern"
        >
          {insights.slice(0, 4).map((insight, index) => {
            const iconMap = {
              'Total Users': FiUsers,
              'Total Equipment': FiTruck,
              'Platform Revenue': FiDollarSign,
              'Completion Rate': FiActivity
            };
            const Icon = iconMap[insight.title] || FiTrendingUp;
            return (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="insight-card-modern"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${insight.color}20` }}
                  >
                    <Icon style={{ color: insight.color }} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {insight.value}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {insight.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        .analytics-modern {
          width: 100%;
        }
        
        .analytics-grid-modern {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto;
          gap: 20px;
        }
        
        .chart-card-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
        }
        
        .chart-main {
          grid-row: span 2;
          min-height: 400px;
        }
        
        .chart-side {
          min-height: 200px;
        }
        
        .chart-pie {
          min-height: 200px;
        }
        
        .insights-row-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          grid-column: span 2;
        }
        
        .insight-card-modern {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 16px;
          backdrop-filter: blur(20px);
          transition: all 0.2s ease;
        }
        
        .insight-card-modern:hover {
          transform: translateY(-2px);
          background: var(--bg-card-hover);
          border-color: var(--border-secondary);
        }
        
        .theme-select option {
          background: var(--bg-card);
          color: var(--text-primary);
        }
        
        @media (max-width: 1024px) {
          .analytics-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .chart-main {
            grid-row: span 1;
            min-height: 300px;
          }
          
          .insights-row-modern {
            grid-column: span 1;
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .insights-row-modern {
            grid-template-columns: 1fr;
          }
          
          .chart-card-modern {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;
