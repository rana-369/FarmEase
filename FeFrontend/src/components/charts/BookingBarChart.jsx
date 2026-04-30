import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
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
          <p key={`tooltip-${entry.name}`} className="text-xs" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BookingBarChart = ({ 
  data, 
  title = 'Bookings Overview',
  color = '#10b981',
  showLegend = false
}) => {
  const { isDark } = useTheme();
  
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  // Color palette for different bars
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

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
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
          <Bar 
            dataKey="value" 
            fill={color}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name || index}`} fill={entry.color || colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingBarChart;
