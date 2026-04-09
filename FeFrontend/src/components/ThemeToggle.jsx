import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ showLabel = false, size = 'default' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 14,
    default: 18,
    large: 22
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`theme-toggle ${sizeClasses[size]} ${showLabel ? 'with-label' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={{
        backgroundColor: isDark ? 'var(--bg-button)' : 'var(--bg-button)',
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showLabel ? 'flex-start' : 'center',
        gap: '8px',
        padding: showLabel ? '8px 12px' : '0',
        background: 'var(--bg-button)',
        border: '1px solid var(--border-primary)',
        borderRadius: showLabel ? '10px' : '10px',
        color: 'var(--text-tertiary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: showLabel ? 'auto' : undefined,
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {isDark ? (
          <FiMoon size={iconSizes[size]} />
        ) : (
          <FiSun size={iconSizes[size]} style={{ color: '#f59e0b' }} />
        )}
      </motion.div>
      
      {showLabel && (
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 500,
          color: 'var(--text-secondary)'
        }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
