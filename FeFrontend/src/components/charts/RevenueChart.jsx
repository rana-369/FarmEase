import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  const { isDark } = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <div 
        className="p-3 rounded-lg shadow-lg border"
        style={{
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name === 'revenue' ? 'Revenue' : 'Bookings'}: 
            {entry.name === 'revenue' ? ` ₹${entry.value.toLocaleString()}` : ` ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ 
  data, 
  title = 'Revenue Overview',
  color = '#10b981',
  showBookings = false
}) => {
  const { isDark } = useTheme();
  
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-muted)' }}>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            {showBookings && (
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
          {showBookings && (
            <Area 
              type="monotone" 
              dataKey="bookings" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorBookings)" 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
