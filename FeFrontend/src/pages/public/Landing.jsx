import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiUsers, FiShield, FiArrowRight, FiCheck } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { useNavigate } from 'react-router-dom';
import { getPublicStats, getFeaturedEquipment } from '../../services/dashboardService';

const Landing = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMachines: 0,
    totalBookings: 0
  });
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicData();
    
    // Poll for live data every 10 seconds
    const interval = setInterval(fetchPublicData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPublicData = async () => {
    try {
      const [statsData, equipmentData] = await Promise.all([
        getPublicStats().catch(() => null),
        getFeaturedEquipment().catch(() => [])
      ]);

      if (statsData) {
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalMachines: statsData.totalMachines || 0,
          totalBookings: statsData.totalBookings || 0
        });
      }

      if (equipmentData && equipmentData.length > 0) {
        setFeaturedEquipment(equipmentData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching public data:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FiTruck,
      title: 'Equipment Rental',
      description: 'Browse and rent tractors, harvesters, plows, and other farming equipment from local owners'
    },
    {
      icon: FiUsers,
      title: 'Connect with Owners',
      description: 'Find equipment owners in your area and book directly through the platform'
    },
    {
      icon: RupeeIcon,
      title: 'Fair Pricing',
      description: 'Set your own rental rates or find equipment within your budget'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'User verification and secure booking process for peace of mind'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Hero Section */}
      <section className="relative py-20" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #16a34a 100%)' }}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)', 
          backgroundSize: '100% 100%'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ 
                  backgroundColor: 'rgba(22, 163, 74, 0.1)', 
                  color: '#22c55e',
                  border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                  Agricultural Equipment Rental
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#ffffff' }}>
                AgriConnect
                <span className="block" style={{ color: '#22c55e', marginTop: '0.5rem' }}>Rent Farm Equipment</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#a1a1a1', lineHeight: '1.6' }}>
                Connect with equipment owners in your area. Browse available machinery, 
                check rates, and book instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: '#22c55e', 
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  Get Started
                  <FiArrowRight />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                  style={{ 
                    backgroundColor: 'transparent', 
                    color: '#ffffff',
                    border: '2px solid #ffffff'
                  }}
                >
                  Login
                </motion.button>
              </div>
              
              {/* Real Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.totalUsers}</div>
                  <div className="text-sm" style={{ color: '#a1a1a1' }}>Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.totalMachines}</div>
                  <div className="text-sm" style={{ color: '#a1a1a1' }}>Equipment Listed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.totalBookings}</div>
                  <div className="text-sm" style={{ color: '#a1a1a1' }}>Bookings</div>
                </div>
              </div>
            </motion.div>
            
            {/* Equipment Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold" style={{ color: '#ffffff' }}>Available Equipment</h3>
                    {featuredEquipment.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                        <span className="text-sm" style={{ color: '#a1a1a1' }}>Live</span>
                      </div>
                    )}
                  </div>
                  
                  {featuredEquipment.length > 0 ? (
                    <div className="space-y-4">
                      {featuredEquipment.map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between p-3 rounded-lg" style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                              <div className="font-medium" style={{ color: '#ffffff' }}>{item.name}</div>
                              <div className="text-sm" style={{ color: '#a1a1a1' }}>{item.location}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold" style={{ color: '#22c55e' }}>₹{item.pricePerHour}/hr</div>
                            <div className="text-xs" style={{ color: '#a1a1a1' }}>{item.isAvailable ? 'Available' : 'Booked'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiTruck className="text-4xl mx-auto mb-3" style={{ color: '#333333' }} />
                      <p style={{ color: '#a1a1a1' }}>No equipment listed yet</p>
                      <p className="text-sm mt-2" style={{ color: '#666666' }}>Be the first to add your equipment!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: '#111111' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              How It Works
            </h2>
            <p className="text-xl" style={{ color: '#a1a1a1' }}>
              Simple and straightforward equipment rental
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <Icon className="text-xl" style={{ color: '#22c55e' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: '#a1a1a1' }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Join as
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Farmer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl cursor-pointer"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
              onClick={() => navigate('/register')}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <FiUsers className="text-2xl" style={{ color: '#22c55e' }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#ffffff' }}>Farmer</h3>
              <p className="mb-4" style={{ color: '#a1a1a1', lineHeight: '1.6' }}>
                Browse available equipment, compare rates, and book machinery for your farming needs.
              </p>
              <ul className="space-y-2">
                {['Browse equipment listings', 'Check availability & rates', 'Book and manage rentals', 'Track booking history'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#a1a1a1' }}>
                    <FiCheck style={{ color: '#22c55e' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Owner Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl cursor-pointer"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
              onClick={() => navigate('/register')}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <FiTruck className="text-2xl" style={{ color: '#22c55e' }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#ffffff' }}>Equipment Owner</h3>
              <p className="mb-4" style={{ color: '#a1a1a1', lineHeight: '1.6' }}>
                List your farming equipment for rent and earn income when your machinery is idle.
              </p>
              <ul className="space-y-2">
                {['List your equipment', 'Set your own rates', 'Manage booking requests', 'Track your earnings'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#a1a1a1' }}>
                    <FiCheck style={{ color: '#22c55e' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: '#22c55e' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8" style={{ color: '#f0fdf4' }}>
              Create your account and start renting or listing equipment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: '#16a34a'
                }}
              >
                Create Account
                <FiArrowRight />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#ffffff',
                  border: '2px solid #ffffff'
                }}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #333333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
                <FiTruck className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>AgriConnect</h3>
              </div>
            </div>
            <p style={{ color: '#a1a1a1' }}>&copy; 2024 AgriConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
