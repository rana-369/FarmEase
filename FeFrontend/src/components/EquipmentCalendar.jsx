import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCheck, FiClock } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const EquipmentCalendar = ({ equipmentId, onDateSelect, selectedDate, selectedTime, onTimeSelect }) => {
  const { isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate time slots (6 AM to 8 PM, every 2 hours)
  const timeSlots = [
    { value: '06:00', label: '6:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '20:00', label: '8:00 PM' }
  ];

  // Fetch availability data
  const fetchAvailability = useCallback(async () => {
    if (!equipmentId) return;

    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${baseURL}/machines/${equipmentId}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  }, [equipmentId, currentMonth]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Get availability for a specific date
  const getDateAvailability = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.date?.split('T')[0] === dateStr);
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today
      });
    }

    return days;
  };

  // Handle date selection
  const handleDateClick = (dayInfo) => {
    if (!dayInfo.date || dayInfo.isPast) return;
    onDateSelect?.(dayInfo.date);
  };

  const days = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Styles using only inline CSS
  const containerStyle = {
    width: '100%'
  };

  const calendarBoxStyle = {
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: isDark 
      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
  };

  const navButtonStyle = {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    color: isDark ? '#e5e7eb' : '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const monthTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: isDark ? '#e5e7eb' : '#1f2937',
    margin: 0
  };

  const dayNamesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    padding: '12px 12px 0'
  };

  const dayNameStyle = {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    padding: '8px 0',
    color: isDark ? '#6b7280' : '#9ca3af'
  };

  const calendarGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    padding: '12px'
  };

  const getDayButtonStyle = (isPast, isToday, isSelected, isAvailable) => ({
    width: '100%',
    aspectRatio: '1',
    borderRadius: '12px',
    border: isToday && !isSelected ? '2px solid #3b82f6' : 'none',
    backgroundColor: isSelected
      ? '#22c55e'
      : isToday
        ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
        : isAvailable && !isPast
          ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
          : 'transparent',
    color: isSelected
      ? 'white'
      : isPast
        ? (isDark ? '#4b5563' : '#9ca3af')
        : isToday
          ? '#3b82f6'
          : (isDark ? '#e5e7eb' : '#1f2937'),
    cursor: isPast ? 'not-allowed' : 'pointer',
    opacity: isPast ? '0.3' : '1',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.2s ease'
  });

  const dotStyle = (color) => ({
    position: 'absolute',
    bottom: '4px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: color
  });

  const checkIconStyle = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '12px',
    height: '12px',
    color: 'white'
  };

  const legendStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '12px 16px',
    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)'
  };

  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const legendDotStyle = (color, isBorder) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: isBorder ? 'transparent' : color,
    border: isBorder ? `2px solid ${color}` : 'none'
  });

  const legendTextStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: isDark ? '#9ca3af' : '#6b7280'
  };

  const selectedDateBoxStyle = {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.2)'
  };

  const checkBadgeStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e'
  };

  const loadingSpinnerStyle = {
    width: '24px',
    height: '24px',
    border: '2px solid #22c55e',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  // Time selector styles
  const timeSectionStyle = {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
  };

  const timeHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  };

  const timeHeaderTextStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: isDark ? '#e5e7eb' : '#1f2937',
    margin: 0
  };

  const timeGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  };

  const getTimeButtonStyle = (isSelected) => ({
    padding: '10px 8px',
    borderRadius: '10px',
    border: isSelected ? 'none' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    backgroundColor: isSelected
      ? '#22c55e'
      : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    color: isSelected ? 'white' : (isDark ? '#e5e7eb' : '#1f2937'),
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  });

  // Render day cell
  const renderDay = (dayInfo, index) => {
    if (!dayInfo.date) {
      return <div key={index} style={{ aspectRatio: '1' }} />;
    }

    const dateAvailability = getDateAvailability(dayInfo.date);
    const isAvailable = dateAvailability?.isAvailable && !dayInfo.isPast;
    const isSelected = selectedDate && dayInfo.date.toDateString() === selectedDate.toDateString();
    const isToday = dayInfo.isToday;
    const isPast = dayInfo.isPast;
    const dayNumber = dayInfo.date.getDate();

    return (
      <motion.button
        key={index}
        type="button"
        disabled={isPast}
        onClick={() => handleDateClick(dayInfo)}
        style={getDayButtonStyle(isPast, isToday, isSelected, isAvailable)}
        whileHover={!isPast ? { scale: 1.08 } : {}}
        whileTap={!isPast ? { scale: 0.95 } : {}}
      >
        {dayNumber}
        
        {/* Availability indicator dot */}
        {!isPast && !isSelected && (
          <span style={dotStyle(isAvailable ? '#22c55e' : '#ef4444')} />
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <FiCheck style={checkIconStyle} />
        )}
      </motion.button>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Calendar Container */}
      <div style={calendarBoxStyle}>
        {/* Header with Navigation */}
        <div style={headerStyle}>
          <motion.button
            type="button"
            onClick={previousMonth}
            style={navButtonStyle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiChevronLeft size={18} />
          </motion.button>

          <h3 style={monthTitleStyle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          <motion.button
            type="button"
            onClick={nextMonth}
            style={navButtonStyle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiChevronRight size={18} />
          </motion.button>
        </div>

        {/* Day Names Header */}
        <div style={dayNamesGridStyle}>
          {dayNames.map(day => (
            <div key={day} style={dayNameStyle}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={calendarGridStyle}>
          {loading ? (
            <div style={{ gridColumn: 'span 7', padding: '48px 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={loadingSpinnerStyle} />
              </div>
              <p style={{ fontSize: '14px', color: isDark ? '#6b7280' : '#9ca3af', margin: 0 }}>
                Loading...
              </p>
            </div>
          ) : (
            days.map((day, index) => renderDay(day, index))
          )}
        </div>

        {/* Legend */}
        <div style={legendStyle}>
          <div style={legendItemStyle}>
            <span style={legendDotStyle('#22c55e', false)} />
            <span style={legendTextStyle}>Available</span>
          </div>
          <div style={legendItemStyle}>
            <span style={legendDotStyle('#ef4444', false)} />
            <span style={legendTextStyle}>Booked</span>
          </div>
          <div style={legendItemStyle}>
            <span style={legendDotStyle('#3b82f6', true)} />
            <span style={legendTextStyle}>Today</span>
          </div>
        </div>
      </div>

      {/* Time Selector */}
      <div style={timeSectionStyle}>
        <div style={timeHeaderStyle}>
          <FiClock size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          <h4 style={timeHeaderTextStyle}>Select Time</h4>
        </div>
        <div style={timeGridStyle}>
          {timeSlots.map(slot => (
            <motion.button
              key={slot.value}
              type="button"
              onClick={() => onTimeSelect?.(slot.value)}
              style={getTimeButtonStyle(selectedTime === slot.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {slot.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Date & Time Display */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={selectedDateBoxStyle}
        >
          <div style={checkBadgeStyle}>
            <FiCheck color="white" size={16} />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
              Selected Date & Time
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', margin: 0 }}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
              {selectedTime && (
                <span style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '400' }}>
                  {' '}at {timeSlots.find(t => t.value === selectedTime)?.label}
                </span>
              )}
            </p>
          </div>
        </motion.div>
      )}

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EquipmentCalendar;
