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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const availableCount = machines.filter(m => m.available).length;

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              <FiTool className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Browse Equipment</h1>
              <p className="text-sm" style={{ color: '#666666' }}>Find and rent agricultural machinery</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Available', value: availableCount, color: '#22c55e', icon: FiCheckCircle },
            { label: 'Total', value: machines.length, color: '#3b82f6', icon: FiTool },
            { label: 'Categories', value: categories.length - 1, color: '#a855f7', icon: FiFilter }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${stat.color}10`, border: `1px solid ${stat.color}20` }}
              >
                <Icon className="text-lg mb-2" style={{ color: stat.color }} />
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#888888' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiSearch style={{ color: '#666666' }} />
            <input
              id="marketplace-search"
              name="marketplace-search"
              type="text"
              placeholder="Search equipment, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              autoComplete="off"
              style={{ color: '#ffffff' }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <FiFilter style={{ color: '#666666' }} />
            <select
              id="category-filter"
              name="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              autoComplete="off"
              className="bg-transparent outline-none cursor-pointer text-sm"
              style={{ color: '#ffffff' }}
            >
              {categories.map(category => (
                <option key={category} value={category} style={{ backgroundColor: '#1a1a1a' }}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-xs mb-4" style={{ color: '#888888' }}>
          Showing <span style={{ color: '#ffffff' }}>{filteredMachines.length}</span> equipment
        </p>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMachines.map((machine, index) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div className="h-36 overflow-hidden relative" style={{ backgroundColor: '#1a1a1a' }}>
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {!machine.available && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      Unavailable
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                    {machine.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
                  <FiStar className="w-3 h-3" />
                  <span>{machine.rating}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-sm mb-1 truncate" style={{ color: '#ffffff' }}>{machine.name}</h3>
                <p className="text-xs mb-3 line-clamp-1" style={{ color: '#666666' }}>{machine.description}</p>
                
                <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#888888' }}>
                  <FiMapPin className="w-3 h-3" style={{ color: '#22c55e' }} />
                  <span className="truncate">{machine.location}</span>
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>₹{machine.rate}<span className="text-xs font-normal" style={{ color: '#666666' }}>/hr</span></p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBookNow(machine)}
                    disabled={!machine.available}
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ 
                      backgroundColor: machine.available ? '#22c55e' : 'rgba(255, 255, 255, 0.05)',
                      color: machine.available ? '#000000' : '#666666',
                      cursor: machine.available ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {machine.available ? 'Book' : 'Unavailable'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <FiTruck className="text-3xl" style={{ color: '#333333' }} />
            </div>
            <p className="text-sm mb-1" style={{ color: '#ffffff' }}>No equipment found</p>
            <p className="text-xs mb-4" style={{ color: '#666666' }}>Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: '#22c55e', color: '#000000' }}
            >
              Clear Filters
            </motion.button>
          </div>
        )}

        {/* Booking Modal */}
        {bookingModal.open && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl max-w-md w-full"
              style={{ backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              {bookingSuccess ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                    <FiCheckCircle className="text-3xl" style={{ color: '#22c55e' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#22c55e' }}>Booking Created!</h3>
                  <p className="text-xs" style={{ color: '#888888' }}>Your request has been sent to the owner.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Book Equipment</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeBookingModal}
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
                    >
                      <FiX className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                        <FiTool className="text-lg" style={{ color: '#22c55e' }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#ffffff' }}>{bookingModal.machine?.name}</p>
                        <p className="text-xs" style={{ color: '#666666' }}>{bookingModal.machine?.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-medium block mb-2" style={{ color: '#888888' }}>Number of Hours</label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <FiClock style={{ color: '#666666' }} />
                      <input
                        id="booking-hours"
                        type="number"
                        min="1"
                        max="24"
                        value={bookingModal.hours}
                        onChange={(e) => setBookingModal({ ...bookingModal, hours: e.target.value })}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: '#888888' }}>Total Amount</span>
                      <span className="text-xl font-bold" style={{ color: '#22c55e' }}>₹{(bookingModal.machine?.rate || 0) * bookingModal.hours}</span>
                    </div>
                    <p className="text-xs mt-1 text-right" style={{ color: '#666666' }}>
                      ₹{bookingModal.machine?.rate} × {bookingModal.hours} hr{bookingModal.hours > 1 ? 's' : ''}
                    </p>
                  </div>

                  {bookingError && (
                    <div className="mb-4 p-3 rounded-xl text-center text-xs" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      {bookingError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeBookingModal}
                      className="flex-1 px-4 py-3 rounded-lg text-sm"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888888' }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBookingSubmit}
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-3 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: '#22c55e', color: '#000000' }}
                    >
                      {bookingLoading ? 'Processing...' : 'Confirm'}
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
