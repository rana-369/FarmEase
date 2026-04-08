import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiSearch, FiFilter, FiMapPin, FiClock, FiStar, FiX, FiCheckCircle, FiTool } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import Modal from '../../components/Modal';
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
      <div className="page-content-new flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  const availableCount = machines.filter(m => m.available).length;

  return (
    <>
      {/* Booking Modal */}
      <Modal isOpen={bookingModal.open} onClose={closeBookingModal}>
        {bookingSuccess ? (
          <div className="text-center py-6">
            <div className="empty-state-icon mx-auto mb-4" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <FiCheckCircle style={{ color: '#10b981' }} />
            </div>
            <h3 className="card-title mb-2" style={{ color: '#10b981' }}>Booking Created!</h3>
            <p className="card-subtitle">Your request has been sent to the owner.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="card-title">Book Equipment</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeBookingModal}
                className="icon-button"
              >
                <FiX />
              </motion.button>
            </div>

            <div className="mb-6 p-4" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="nav-item-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <FiTool />
                </div>
                <div>
                  <p className="card-title">{bookingModal.machine?.name}</p>
                  <p className="card-subtitle">{bookingModal.machine?.location}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 px-4">
              <label className="input-label block mb-2">Number of Hours</label>
              <div className="search-box-new">
                <FiClock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
                <input
                  id="booking-hours"
                  type="number"
                  min="1"
                  max="24"
                  value={bookingModal.hours}
                  onChange={(e) => setBookingModal({ ...bookingModal, hours: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="mb-6 p-4 mx-4" style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="input-label">Base Amount</span>
                <span className="font-semibold">Rs.{(bookingModal.machine?.rate || 0) * bookingModal.hours}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="input-label">Platform Fee (10%)</span>
                <span className="font-semibold">Rs.{Math.round((bookingModal.machine?.rate || 0) * bookingModal.hours * 0.1)}</span>
              </div>
              <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="input-label">Total Amount</span>
                <span className="text-2xl font-bold" style={{ color: '#10b981' }}>Rs.{Math.round((bookingModal.machine?.rate || 0) * bookingModal.hours * 1.1)}</span>
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Rs.{Math.round(bookingModal.machine?.rate * 1.1)}/hr × {bookingModal.hours} hr{bookingModal.hours > 1 ? 's' : ''}
              </p>
            </div>

            {bookingError && (
              <div className="mb-4 p-4 mx-4 text-center" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '12px' }}>
                {bookingError}
              </div>
            )}

            <div className="flex gap-3 px-4 pb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeBookingModal}
                className="secondary-button flex-1"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookingSubmit}
                disabled={bookingLoading}
                className="primary-button flex-1"
              >
                {bookingLoading ? 'Processing...' : 'Confirm'}
              </motion.button>
            </div>
          </>
        )}
      </Modal>

    <div className="page-content-new">
      {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="page-header-new"
        >
          <div>
            <h1 className="page-title-new">Browse Equipment</h1>
            <p className="page-subtitle-new">Find and rent the perfect machinery for your farm</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Available', value: availableCount, color: '#10b981' },
            { label: 'Total', value: machines.length, color: '#3b82f6' },
            { label: 'Categories', value: categories.length - 1, color: '#a855f7' }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="stat-card-new"
            >
              <div className="stat-info">
                <p className="stat-title-new">{stat.label}</p>
                <h3 className="stat-value-new" style={{ color: stat.color }}>{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-bar-new mb-6">
          <div className="search-box-new">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              id="marketplace-search"
              name="marketplace-search"
              type="text"
              placeholder="Search equipment, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter style={{ color: 'rgba(255,255,255,0.5)' }} />
            <select
              id="category-filter"
              name="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select-new"
              autoComplete="off"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="input-label mb-4">
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
              className="card overflow-hidden"
            >
              <div className="h-40 overflow-hidden relative" style={{ backgroundColor: '#0a0a0a' }}>
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { 
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
                  <FiTruck className="w-12 h-12" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
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
                <h3 className="card-title mb-1 truncate">{machine.name}</h3>
                <p className="card-subtitle mb-3 line-clamp-1">{machine.description}</p>
                
                <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <FiMapPin className="w-3 h-3" style={{ color: '#10b981' }} />
                  <span className="truncate">{machine.location}</span>
                </div>

                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#10b981' }}>Rs.{Math.round(machine.rate * 1.1)}<span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.8)' }}>/hr</span></p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>incl. platform fee</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBookNow(machine)}
                    disabled={!machine.available}
                    className="primary-button"
                    style={{ 
                      background: machine.available 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: machine.available ? '#ffffff' : 'rgba(255,255,255,0.7)',
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiTruck />
            </div>
            <p className="empty-state-title">No equipment found</p>
            <p className="empty-state-text">Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="primary-button"
            >
              Clear Filters
            </motion.button>
          </div>
        )}
    </div>
    </>
  );
};

export default FarmerMachines;
