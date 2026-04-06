import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiSearch, FiFilter, FiMapPin, FiCalendar, FiClock, FiStar, FiX, FiCheckCircle, FiTool } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import { getAvailableMachines } from '../../services/machineService';
import { createBooking } from '../../services/bookingService';

const FarmerMachines = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState({ open: false, machine: null, hours: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const categories = ['All', 'Tractor', 'Harvester', 'Plow', 'Seeder', 'Irrigation', 'Other'];

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterMachines();
  }, [machines, searchTerm, selectedCategory]);

  const fetchMachines = async () => {
    try {
      const data = await getAvailableMachines();
      const transformedMachines = data.map(machine => ({
        id: machine.id || machine.Id,
        name: machine.name || machine.Name,
        category: machine.type || machine.Type || 'Other',
        ownerName: machine.ownerName || machine.OwnerName || 'Equipment Owner',
        location: machine.location || machine.Location || 'Location not specified',
        rate: machine.rate || machine.Rate,
        rating: machine.rating || machine.Rating || 4.5,
        image: machine.imageUrl || machine.ImageUrl || '/placeholder-equipment.png',
        available: machine.status === 'Verified' || machine.status === 'Active' || machine.Status === 'Verified' || machine.Status === 'Active',
        description: machine.description || machine.Description || 'Professional agricultural equipment'
      }));
      setMachines(transformedMachines);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
      setLoading(false);
    }
  };

  const filterMachines = () => {
    let filtered = machines;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(machine => machine.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMachines(filtered);
  };

  const handleBookNow = (machine) => {
    setBookingModal({ open: true, machine, hours: 1 });
    setBookingError('');
    setBookingSuccess(false);
  };

  const handleBookingSubmit = async () => {
    if (!bookingModal.machine || bookingModal.hours < 1) {
      setBookingError('Please enter valid number of hours');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      await createBooking({
        machineId: bookingModal.machine.id,
        machineName: bookingModal.machine.name,
        hours: parseInt(bookingModal.hours)
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingModal({ open: false, machine: null, hours: 1 });
        setBookingSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingModal({ open: false, machine: null, hours: 1 });
    setBookingError('');
    setBookingSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="relative">
          <div className="w-14 h-14 border-2 rounded-2xl animate-spin" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }} />
          <div className="absolute inset-0 w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
        </div>
      </div>
    );
  }

  const availableCount = machines.filter(m => m.available).length;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FiTool className="text-xl text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Browse Equipment</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Find and rent agricultural machinery</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Available', value: availableCount, color: '#10b981', icon: FiCheckCircle },
            { label: 'Total', value: machines.length, color: '#3b82f6', icon: FiTool },
            { label: 'Categories', value: categories.length - 1, color: '#a855f7', icon: FiFilter }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}20`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)` }} />
                <Icon className="text-lg mb-2 relative" style={{ color: stat.color }} />
                <p className="text-2xl font-bold relative" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium relative" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all focus-within:border-green-500/30" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: 'rgba(255,255,255,0.8)' }} />
            <input
              id="marketplace-search"
              name="marketplace-search"
              type="text"
              placeholder="Search equipment, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: 'rgba(255,255,255,0.8)' }} />
            <select
              id="category-filter"
              name="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm font-medium"
              style={{ color: '#ffffff' }}
            >
              {categories.map(category => (
                <option key={category} value={category} style={{ backgroundColor: '#1a1a1a' }}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-xs mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Showing <span className="font-semibold" style={{ color: '#ffffff' }}>{filteredMachines.length}</span> equipment
        </p>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMachines.map((machine, index) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl overflow-hidden group"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="h-40 overflow-hidden relative" style={{ backgroundColor: '#0a0a0a' }}>
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {!machine.available && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}>
                    <span className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
                      Unavailable
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981' }}>
                    {machine.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)', border: '1px solid rgba(250, 204, 21, 0.25)', color: '#facc15' }}>
                  <FiStar className="w-3 h-3" />
                  <span>{machine.rating}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: '#ffffff' }}>{machine.name}</h3>
                <p className="text-xs mb-3 line-clamp-1 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{machine.description}</p>
                
                <div className="flex items-center gap-2 text-xs mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <FiMapPin className="w-3 h-3" style={{ color: '#10b981' }} />
                  <span className="truncate">{machine.location}</span>
                </div>

                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#10b981' }}>₹{Math.round(machine.rate * 1.1)}<span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.8)' }}>/hr</span></p>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>incl. platform fee</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBookNow(machine)}
                    disabled={!machine.available}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold relative overflow-hidden"
                    style={{ 
                      background: machine.available 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: machine.available ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      cursor: machine.available ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {machine.available && <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />}
                    <span className="relative z-10">{machine.available ? 'Book' : 'Unavailable'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-12 rounded-3xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden" style={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <FiTruck className="text-3xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <p className="text-sm mb-1 font-semibold" style={{ color: '#ffffff' }}>No equipment found</p>
            <p className="text-xs mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-6 py-3 rounded-xl text-xs font-semibold relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <span className="relative z-10">Clear Filters</span>
            </motion.button>
          </div>
        )}

        {/* Booking Modal */}
        {bookingModal.open && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl max-w-md w-full relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5)'
              }}
            >
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden" style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    <FiCheckCircle className="text-3xl" style={{ color: '#10b981' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#10b981' }}>Booking Created!</h3>
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Your request has been sent to the owner.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Book Equipment</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeBookingModal}
                      className="p-2.5 rounded-xl transition-colors"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      <FiX className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ 
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <FiTool className="text-lg" style={{ color: '#10b981' }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>{bookingModal.machine?.name}</p>
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{bookingModal.machine?.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-semibold block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Number of Hours</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <FiClock style={{ color: 'rgba(255,255,255,0.8)' }} />
                      <input
                        id="booking-hours"
                        type="number"
                        min="1"
                        max="24"
                        value={bookingModal.hours}
                        onChange={(e) => setBookingModal({ ...bookingModal, hours: e.target.value })}
                        className="flex-1 bg-transparent outline-none text-sm font-semibold"
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)' }} />
                    <div className="flex justify-between items-center mb-2 relative">
                      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Base Amount</span>
                      <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>₹{(bookingModal.machine?.rate || 0) * bookingModal.hours}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 relative">
                      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Platform Fee (10%)</span>
                      <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>₹{Math.round((bookingModal.machine?.rate || 0) * bookingModal.hours * 0.1)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 relative" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Amount</span>
                      <span className="text-2xl font-bold" style={{ color: '#10b981' }}>₹{Math.round((bookingModal.machine?.rate || 0) * bookingModal.hours * 1.1)}</span>
                    </div>
                    <p className="text-xs mt-1 text-right font-medium relative" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      ₹{Math.round(bookingModal.machine?.rate * 1.1)}/hr × {bookingModal.hours} hr{bookingModal.hours > 1 ? 's' : ''}
                    </p>
                  </div>

                  {bookingError && (
                    <div className="mb-4 p-4 rounded-2xl text-center text-xs font-medium" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171' }}>
                      {bookingError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeBookingModal}
                      className="flex-1 px-4 py-3.5 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBookingSubmit}
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-3.5 rounded-xl text-sm font-semibold relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      <span className="relative z-10">{bookingLoading ? 'Processing...' : 'Confirm'}</span>
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerMachines;
