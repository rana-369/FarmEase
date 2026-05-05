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
        {payload.map((entry) => (
          <p key={`tooltip-${entry.name}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name === 'revenue' ? 'Revenue' : 'Bookings'}: 
            {entry.name === 'revenue' ? ` ¥${entry.value.toLocaleString()}` : ` ${entry.value}`}
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
  
  console.log('RevenueChart received data:', data);
  
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  if (!data || data.length === 0) {
    console.log('RevenueChart: No data, showing placeholder');
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-muted)' }}>No data available (from RevenueChart)</p>
      </div>
    );
  }
  
  console.log('RevenueChart: Rendering chart with', data.length, 'items');

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: '320px' }}>
      {title && (
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      )}
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: '280px' }}>
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
    </div>
  );
};

export default RevenueChart;
