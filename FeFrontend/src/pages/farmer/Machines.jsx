import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiSearch, FiFilter, FiMapPin, FiCalendar, FiClock, FiStar, FiX, FiCheckCircle } from 'react-icons/fi';
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
    
    // Poll for live data every 10 seconds
    const interval = setInterval(fetchMachines, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterMachines();
  }, [machines, searchTerm, selectedCategory]);

  const fetchMachines = async () => {
    try {
      // Fetch from .NET backend
      const data = await getAvailableMachines();
      
      // Transform backend data to match frontend structure
      const transformedMachines = data.map(machine => ({
        id: machine.id || machine.Id,
        name: machine.name || machine.Name,
        category: machine.type || machine.Type || 'Other',
        ownerName: machine.ownerName || machine.OwnerName || 'Equipment Owner',
        location: machine.location || machine.Location || 'Location not specified',
        rate: machine.rate || machine.Rate,
        rating: machine.rating || machine.Rating || 4.5,
        // Use relative URL - Vite proxy will forward to backend
        image: machine.imageUrl || machine.ImageUrl || '/placeholder-equipment.png',
        available: machine.status === 'Verified' || machine.status === 'Active' || machine.Status === 'Verified' || machine.Status === 'Active',
        description: machine.description || machine.Description || 'Professional agricultural equipment'
      }));
      
      setMachines(transformedMachines);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machines:', error);
      // Fallback to empty array on error
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
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '2rem' }}>
      {/* Enterprise Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>Equipment Marketplace</h1>
            <p className="text-lg" style={{ color: '#a1a1a1' }}>Browse and rent verified agricultural equipment from enterprise owners</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Verified Equipment</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enterprise Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#a1a1a1' }} />
            <label htmlFor="marketplace-search" className="sr-only">Search equipment</label>
            <input
              id="marketplace-search"
              name="marketplace-search"
              type="text"
              placeholder="Search equipment, locations, or owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg"
              autoComplete="off"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: '#a1a1a1' }} />
            <select
              id="category-filter"
              name="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              autoComplete="off"
              className="px-4 py-3 rounded-lg"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category} style={{ backgroundColor: '#1a1a1a' }}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm" style={{ color: '#a1a1a1' }}>
          Showing <span className="font-semibold" style={{ color: '#ffffff' }}>{filteredMachines.length}</span> equipment available
        </p>
      </div>

      {/* Enterprise Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMachines.map((machine, index) => (
          <motion.div
            key={machine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="overflow-hidden rounded-3xl group"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Machine Image */}
            <div className="relative h-52 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {!machine.available && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    Not Available
                  </span>
                </div>
              )}
              {/* Category Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold" 
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                {machine.category}
              </div>
              {/* Rating Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                <FiStar className="fill-current text-xs" />
                <span>{machine.rating}</span>
              </div>
            </div>

            {/* Machine Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 truncate" style={{ color: '#ffffff' }}>{machine.name}</h3>
              <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: '#888888' }}>{machine.description}</p>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm mb-5" style={{ color: '#888888' }}>
                <FiMapPin className="text-base flex-shrink-0" style={{ color: '#22c55e' }} />
                <span className="truncate">{machine.location}</span>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>₹{machine.rate}<span className="text-sm font-normal" style={{ color: '#666666' }}>/hr</span></p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBookNow(machine)}
                  disabled={!machine.available}
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                  style={{ 
                    backgroundColor: machine.available ? '#22c55e' : 'rgba(255, 255, 255, 0.03)',
                    color: machine.available ? '#000000' : '#444444',
                    cursor: machine.available ? 'pointer' : 'not-allowed',
                    boxShadow: machine.available ? '0 4px 20px rgba(34, 197, 94, 0.3)' : 'none'
                  }}
                >
                  {machine.available ? 'Book Now' : 'Unavailable'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredMachines.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '3rem 0' }}
        >
          <FiTruck style={{ fontSize: '3rem', margin: '0 auto 1rem', color: '#333333' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem', color: '#ffffff' }}>No equipment found</h3>
          <p style={{ marginBottom: '1rem', color: '#a1a1a1' }}>Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Booking Modal */}
      {bookingModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl max-w-md w-full"
            style={{ backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' }}
          >
            {bookingSuccess ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '2px solid rgba(34, 197, 94, 0.3)' }}>
                  <FiCheckCircle style={{ fontSize: '2.5rem', color: '#22c55e' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#22c55e' }}>Booking Created!</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>Your booking request has been sent to the owner. You'll be notified once it's accepted.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Book Equipment</h3>
                    <p className="text-sm mt-1" style={{ color: '#666666' }}>Complete your rental request</p>
                  </div>
                  <button 
                    onClick={closeBookingModal} 
                    className="p-3 rounded-xl transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                  >
                    <FiX className="text-lg" style={{ color: '#888888' }} />
                  </button>
                </div>

                {/* Equipment Info */}
                <div className="mb-8 p-5 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                      <FiTruck className="text-2xl" style={{ color: '#22c55e' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate" style={{ color: '#ffffff' }}>{bookingModal.machine?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <FiMapPin className="text-sm flex-shrink-0" style={{ color: '#666666' }} />
                        <p className="text-sm truncate" style={{ color: '#666666' }}>{bookingModal.machine?.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours Input */}
                <div className="mb-6">
                  <label htmlFor="booking-hours" className="block text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#666666' }}>Number of Hours</label>
                  <div className="relative">
                    <input
                      id="booking-hours"
                      type="number"
                      min="1"
                      max="24"
                      value={bookingModal.hours}
                      onChange={(e) => setBookingModal({ ...bookingModal, hours: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl text-lg font-semibold text-center"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
                    />
                    <FiClock className="absolute right-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#666666' }} />
                  </div>
                </div>

                {/* Total */}
                <div className="mb-8 p-5 rounded-2xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: '#888888' }}>Total Amount</span>
                    <span className="text-3xl font-bold" style={{ color: '#22c55e' }}>₹{(bookingModal.machine?.rate || 0) * bookingModal.hours}</span>
                  </div>
                  <p className="text-xs mt-2 text-right" style={{ color: '#666666' }}>
                    ₹{bookingModal.machine?.rate} × {bookingModal.hours} hour{bookingModal.hours > 1 ? 's' : ''}
                  </p>
                </div>

                {bookingError && (
                  <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p className="text-sm font-medium" style={{ color: '#ef4444' }}>{bookingError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeBookingModal}
                    className="flex-1 px-5 py-4 rounded-xl font-semibold transition-all duration-300"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#888888', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={bookingLoading}
                    className="flex-1 px-5 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                    style={{ backgroundColor: '#22c55e', color: '#000000', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)' }}
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FarmerMachines;
