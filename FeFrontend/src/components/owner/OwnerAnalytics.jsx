import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar, FiTruck, FiBarChart2, FiUsers, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { RevenueChart, BookingBarChart, CategoryPieChart } from '../charts';
import { getOwnerAnalytics, getOwnerEquipmentPerformance } from '../../services/dashboardService';

const OwnerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [equipmentPerformance, setEquipmentPerformance] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
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
      const [analyticsData, performance] = await Promise.all([
        getOwnerAnalytics(period),
        getOwnerEquipmentPerformance()
      ]);

      if (analyticsData) {
        setAnalytics(analyticsData);
        
        // Transform revenue data for chart
        if (analyticsData.revenueData && analyticsData.revenueData.length > 0) {
          setEarningsData(analyticsData.revenueData.map(item => ({
            name: item.month || item.name,
            revenue: item.revenue || item.amount || 0,
            bookings: item.bookingCount || item.bookings || item.count || 0
          })));
        }

        // Transform category data
        if (analyticsData.categoryDistribution && analyticsData.categoryDistribution.length > 0) {
          setCategoryData(analyticsData.categoryDistribution.map(item => ({
            name: item.category || item.name,
            value: item.count || item.value || 0,
            color: item.color
          })));
        }

        // Set insights from backend
        if (analyticsData.insights && analyticsData.insights.length > 0) {
          // Insights are already formatted from backend
        }
      }

      if (performance && performance.length > 0) {
        setEquipmentPerformance(performance.map(item => ({
          name: item.name || item.machineName,
          value: item.bookings || item.rentals || 0,
          revenue: item.revenue || item.earnings || 0,
          color: item.color
        })));
      }
    } catch (error) {
      console.error('Failed to fetch owner analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const insights = analytics?.insights || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 rounded-xl animate-spin" style={{ borderColor: 'var(--border-primary)', borderTopColor: '#10b981' }} />
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
          style={{ backgroundColor: '#10b981', color: 'white' }}
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
            Rental Summary
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Track your equipment performance</p>
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
        {/* Main Chart - Earnings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="chart-card-modern chart-main"
        >
          <RevenueChart 
            data={earningsData} 
            title="Earnings Trend"
            color="#06b6d4"
            showBookings={true}
          />
        </motion.div>

        {/* Side Chart - Equipment Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-card-modern chart-side"
        >
          <BookingBarChart 
            data={equipmentPerformance}
            title="Equipment Performance"
          />
        </motion.div>

        {/* Pie Chart - Booking Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-card-modern chart-pie"
        >
          <CategoryPieChart 
            data={categoryData}
            title="Booking Status"
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
              'Total Revenue': FiDollarSign,
              'Avg. Booking Value': FiDollarSign,
              'Utilization Rate': FiActivity,
              'Total Bookings': FiCalendar,
              'Revenue Growth': FiTrendingUp,
              'Peak Season': FiCalendar
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

export default OwnerAnalytics;
