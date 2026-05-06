import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload }) => {
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
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill || payload[0].color }}>
          {payload[0].name}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {payload[0].value} ({payload[0].payload.percentage || 0}%)
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div 
      className="flex flex-wrap justify-center mt-4"
      style={{ 
        width: '100%', 
        padding: '0 8px',
        boxSizing: 'border-box',
        gap: '16px 24px'
      }}
    >
      {payload.map((entry, index) => (
        <span 
          key={`legend-${index}-${entry.value}`}
          className="text-xs font-medium"
          style={{ 
            color: entry.color,
            whiteSpace: 'nowrap'
          }}
        >
          {entry.value}
        </span>
      ))}
    </div>
  );
};

const CategoryPieChart = ({ 
  data, 
  title = 'Distribution',
  innerRadius = 60,
  outerRadius = 90,
  showLegend = true
}) => {
  const { isDark } = useTheme();

  // Status-based color mapping for booking statuses
  const statusColors = {
    'accepted': '#10b981',    // green
    'cancelled': '#f59e0b',   // amber/orange
    'paid': '#3b82f6',        // blue
    'rejected': '#ef4444',    // red
    'pending': '#8b5cf6',     // purple
    'completed': '#06b6d4',   // cyan
    'arrived': '#ec4899',     // pink
    'inprogress': '#84cc16'   // lime
  };

  // Default color palette (for non-status data)
  const defaultColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  // Get color for an item - prioritize status colors
  const getColor = (item, index) => {
    const nameLower = item.name?.toLowerCase() || '';
    if (statusColors[nameLower]) {
      return statusColors[nameLower];
    }
    return item.color || defaultColors[index % defaultColors.length];
  };

  // Calculate percentages and assign colors
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  const dataWithPercentage = data?.map((item, index) => ({
    ...item,
    color: getColor(item, index),
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));

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
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${entry.name || index}`} 
                fill={getColor(entry, index)}
                stroke={isDark ? '#1f1f1f' : '#ffffff'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
