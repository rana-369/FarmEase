import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiCalendar, FiFilter, FiDownload, FiSearch, FiChevronDown } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getRevenueData, getAdminDashboardData, getAllBookings } from '../../services/dashboardService';

const EarningsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    profit: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'last30', 'last90', 'last180'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'cancelled'
  const itemsPerPage = 10;

  // Debounced search to prevent excessive API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const [rev, dash] = await Promise.all([
          getRevenueData(),
          getAdminDashboardData()
        ]);
        
        if (rev) {
          setRevenueData(rev);
          setFilteredData(rev);
        }
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
  }, []); // Only fetch on initial mount

  // Separate effect for transactions with debounced search
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const bookings = await getAllBookings(currentPage, itemsPerPage, debouncedSearchTerm, statusFilter);
        setTransactions(bookings.bookings || bookings || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (debouncedSearchTerm || statusFilter !== 'all') {
      fetchTransactions();
    }
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  // Apply date filter
  useEffect(() => {
    if (dateFilter === 'all') {
      setFilteredData(revenueData);
    } else {
      const now = new Date();
      let filterDate;
      
      switch (dateFilter) {
        case 'last30':
          filterDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        case 'last90':
          filterDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
          break;
        case 'last180':
          filterDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
          break;
        default:
          filterDate = new Date(0);
      }
      
      const filtered = revenueData.filter(item => {
        // Better date parsing - handle different month formats
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = now.getFullYear();
        
        // Try to parse month and year from the month string
        let itemDate;
        if (item.month) {
          // If month is like "Mar 2024", split it
          const monthParts = item.month.split(' ');
          if (monthParts.length === 2) {
            const monthName = monthParts[0];
            const year = parseInt(monthParts[1]);
            const monthIndex = monthNames.indexOf(monthName);
            if (monthIndex !== -1) {
              itemDate = new Date(year, monthIndex, 1);
            }
          } else {
            // If just month name, assume current year
            const monthIndex = monthNames.indexOf(item.month);
            if (monthIndex !== -1) {
              itemDate = new Date(currentYear, monthIndex, 1);
            }
          }
        }
        
        return itemDate && itemDate >= filterDate;
      });
      
      setFilteredData(filtered);
    }
  }, [dateFilter, revenueData]);

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Month', 'Revenue', 'Transactions'],
      ...filteredData.map(item => [
        item.month,
        (item.revenue || item.Revenue || 0).toString(),
        (item.bookings || item.Bookings || 0).toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '56px',
            height: '56px',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            animation: 'spin 1s linear infinite',
            borderTopColor: '#10b981'
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            animation: 'pulse 2s infinite',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
          }} />
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid var(--border-primary)',
            padding: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  Earnings Analytics
                </h1>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '18px',
                  lineHeight: '1.5'
                }}>
                  Track and analyze platform revenue and commissions
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)'
                  }}>
                    {stats.totalBookings.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)'
                  }}>Total Transactions</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#10b981'
                  }}>
                    ₹{((stats.totalTransactionValue || 0) / 1000).toFixed(1)}K
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)'
                  }}>Total Volume</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            {
              title: "Total Revenue",
              value: `₹${(stats.totalTransactionValue || 0).toLocaleString()}`,
              change: "+12.5%",
              trend: "up",
              icon: "💰",
              color: "#10b981",
              bgColor: "rgba(16, 185, 129, 0.1)",
              borderColor: "rgba(16, 185, 129, 0.2)"
            },
            {
              title: "Platform Profit",
              value: `₹${(stats.platformProfit || 0).toLocaleString()}`,
              subtitle: "10% commission",
              change: "+8.3%",
              trend: "up",
              icon: "📈",
              color: "#3b82f6",
              bgColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 0.2)"
            },
            {
              title: "Total Transactions",
              value: stats.totalBookings.toLocaleString(),
              change: "+15.2%",
              trend: "up",
              icon: "📊",
              color: "#8b5cf6",
              bgColor: "rgba(139, 92, 246, 0.1)",
              borderColor: "rgba(139, 92, 246, 0.2)"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: `1px solid ${stat.borderColor}`,
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontSize: '28px',
                      marginRight: '12px'
                    }}>{stat.icon}</span>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                      }}>{stat.title}</h3>
                      {stat.subtitle && (
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--text-muted)',
                          marginTop: '2px'
                        }}>{stat.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: stat.color,
                      color: 'white'
                    }}>
                      <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0l7-7a1 1 0 011.414 0v7a1 1 0 01-1.414 0l-7 7a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {stat.trend === "up" ? "Increased" : "Decreased"}
                    </span>
                    <span style={{
                      color: 'var(--text-muted)',
                      marginLeft: '8px'
                    }}>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid var(--border-primary)',
            padding: '32px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'var(--text-primary)'
            }}>Monthly Revenue Breakdown</h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative'
            }}>
              {/* Filter Dropdown */}
              <div style={{ position: 'relative' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterOpen(!filterOpen)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-button)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-muted)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                  }}
                >
                  <FiFilter style={{ marginRight: '8px' }} />
                  Filter: {dateFilter === 'all' ? 'All Time' : 
                           dateFilter === 'last30' ? 'Last 30 Days' :
                           dateFilter === 'last90' ? 'Last 90 Days' : 'Last 180 Days'}
                </motion.button>
                
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 6px 10px -5px rgba(0, 0, 0, 0.04)',
                      zIndex: 50,
                      minWidth: '180px'
                    }}
                  >
                    {[
                      { value: 'all', label: 'All Time' },
                      { value: 'last30', label: 'Last 30 Days' },
                      { value: 'last90', label: 'Last 90 Days' },
                      { value: 'last180', label: 'Last 180 Days' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setDateFilter(option.value);
                          setFilterOpen(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          backgroundColor: dateFilter === option.value ? 'var(--bg-button)' : 'transparent',
                          color: dateFilter === option.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                          transition: 'all 0.2s ease',
                          borderRadius: dateFilter === option.value ? '4px' : '0'
                        }}
                        onMouseEnter={(e) => {
                          if (dateFilter !== option.value) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (dateFilter !== option.value) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                <FiDownload style={{ marginRight: '8px' }} />
                Export
              </motion.button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredData.map((data, index) => (
              <motion.div
                key={data.month || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#8b5cf6' : '#6b7280',
                        marginRight: '12px'
                      }}></div>
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '2px'
                        }}>{data.month}</h3>
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--text-muted)'
                        }}>Revenue</p>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)'
                    }}>
                      ₹{(data.revenue || data.Revenue || 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: index === 0 ? 'rgba(16, 185, 129, 0.1)' : 
                                       index === 1 ? 'rgba(59, 130, 246, 0.1)' : 
                                       index === 2 ? 'rgba(139, 92, 246, 0.1)' : 
                                       'rgba(107, 114, 128, 0.1)',
                      color: index === 0 ? '#065f46' : 
                             index === 1 ? '#1e3a8a' : 
                             index === 2 ? '#4c1d95' : 
                             '#1f2937'
                    }}>
                      {index === 0 ? '↑ 23%' : index === 1 ? '↑ 15%' : index === 2 ? '↓ 8%' : '→ 0%'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EarningsPage;
