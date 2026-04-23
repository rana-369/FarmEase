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
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {entry.value}
          </span>
        </div>
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

  // Default color palette
  const defaultColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  // Calculate percentages
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  const dataWithPercentage = data?.map(item => ({
    ...item,
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
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]}
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
