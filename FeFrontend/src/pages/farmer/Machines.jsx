import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiSearch, FiFilter, FiMapPin, FiClock, FiStar, FiX, FiCheckCircle, FiTool, FiUser, FiCalendar } from 'react-icons/fi';
import { RupeeIcon } from '../../components/RupeeIcon';
import Modal from '../../components/Modal';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';
import EquipmentCalendar from '../../components/EquipmentCalendar';
import LocationSearch, { calculateDistance, formatDistance } from '../../components/LocationSearch';
import { getAvailableMachines, getMachinesNearLocation } from '../../services/machineService';
import { createBooking } from '../../services/bookingService';

const FarmerMachines = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState({ open: false, machine: null, hours: 1 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, machine: null });
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [sortByDistance, setSortByDistance] = useState(true);

  const categories = ['All', 'Tractor', 'Harvester', 'Plow', 'Seeder', 'Irrigation', 'Other'];

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate distance for each machine
  const machinesWithDistance = useMemo(() => {
    if (!userLocation) return machines;
    
    return machines.map(machine => {
      let distance = null;
      
      if (machine.latitude && machine.longitude) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          machine.latitude,
          machine.longitude
        );
      } else if (machine.Location && machine.Location.includes(',')) {
        const parts = machine.Location.split(',').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            parts[0],
            parts[1]
          );
        }
      }
      
      return { ...machine, distance };
    });
  }, [machines, userLocation]);

  useEffect(() => {
    filterMachines();
  }, [machinesWithDistance, searchTerm, selectedCategory, userLocation, searchRadius]);

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
        description: machine.description || machine.Description || 'Professional agricultural equipment',
        latitude: machine.latitude || machine.Latitude || null,
        longitude: machine.longitude || machine.Longitude || null
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
    let filtered = machinesWithDistance;
    
    // Filter by distance - only show equipment within radius
    if (userLocation) {
      filtered = filtered.filter(machine => {
        if (machine.distance !== null && machine.distance <= searchRadius) {
          return true;
        }
        return false;
      });
    }
    
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
    
    // Sort by distance
    if (userLocation && sortByDistance) {
      filtered.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }
    
    setFilteredMachines(filtered);
  };

  const handleBookNow = (machine) => {
    setBookingModal({ open: true, machine, hours: 1 });
    setSelectedDate(null);
    setSelectedTime(null);
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
        hours: parseInt(bookingModal.hours),
        scheduledDate: selectedDate ? selectedDate.toISOString() : null,
        scheduledTime: selectedTime || null
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingModal({ open: false, machine: null, hours: 1 });
        setSelectedDate(null);
        setSelectedTime(null);
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
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingError('');
    setBookingSuccess(false);
  };

  // Handle location selection from LocationSearch component
  const handleLocationSelect = (location, radius) => {
    setUserLocation(location);
    setSearchRadius(radius);
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
            <div className="flex justify-between items-center mb-6 p-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
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

            {/* Availability Calendar */}
            <div className="mb-6 px-4">
              <label className="input-label block mb-3 flex items-center gap-2">
                <FiCalendar /> Select Date & Time (Optional)
              </label>
              <EquipmentCalendar
                equipmentId={bookingModal.machine?.id}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            </div>

            <div className="mb-6 px-4">
              <label htmlFor="booking-hours" className="input-label block mb-2">Number of Hours</label>
              <div className="search-box-new">
                <FiClock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="booking-hours"
                  name="hours"
                  type="number"
                  min="1"
                  max="24"
                  value={bookingModal.hours}
                  onChange={(e) => setBookingModal({ ...bookingModal, hours: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  autoComplete="off"
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
              <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                <span className="input-label">Total Amount</span>
                <span className="text-2xl font-bold" style={{ color: '#10b981' }}>Rs.{Math.round((bookingModal.machine?.rate || 0) * bookingModal.hours * 1.1)}</span>
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-secondary)' }}>
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

        {/* Location Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '24px' }}
        >
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            showRadiusSelector={true}
          />
          {userLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={sortByDistance}
                  onChange={(e) => setSortByDistance(e.target.checked)}
                  style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#10b981' }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort by distance</span>
              </label>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserLocation(null)}
                style={{
                  fontSize: '13px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#f87171',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  fontWeight: 600
                }}
              >
                Clear Location
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}
        >
          {/* Search Input */}
          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: '200px'
          }}>
            <FiSearch style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: '18px'
            }} />
            <input
              id="marketplace-search"
              name="marketplace-search"
              type="text"
              placeholder="Search equipment, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}>
            <FiFilter style={{ color: 'var(--text-muted)', fontSize: '18px' }} />
            <select
              id="category-filter"
              name="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              autoComplete="off"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '16px'
          }}
        >
          Showing <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{filteredMachines.length}</span> equipment
        </motion.p>

        {/* Machines Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredMachines.map((machine, index) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
              onClick={() => setDetailModal({ open: true, machine })}
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                transition: 'box-shadow 0.3s ease'
              }}
            >
              {/* Image Section */}
              <div style={{
                height: '180px',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg-primary)'
              }}>
                <img
                  src={machine.image}
                  alt={machine.name}
                  onError={(e) => { 
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <FiTruck style={{ fontSize: '28px', color: '#10b981' }} />
                  </div>
                </div>
                
                {/* Unavailable Overlay */}
                {!machine.available && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171'
                    }}>
                      Unavailable
                    </span>
                  </div>
                )}
                
                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px'
                }}>
                  <span style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    color: '#10b981',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    {machine.category}
                  </span>
                </div>
                
                {/* Rating Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px'
                }}>
                  <RatingSummary machineId={machine.id} />
                </div>
                
                {/* Distance Badge */}
                {machine.distance !== null && !isNaN(machine.distance) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px'
                  }}>
                    <span style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: '#60a5fa',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                      📍 {formatDistance(machine.distance)} away
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{machine.name}</h3>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{machine.description}</p>
                
                {/* Location Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <FiMapPin style={{ fontSize: '14px', color: '#10b981' }} />
                  </div>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>{machine.location}</span>
                </div>

                {/* Price and Book Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-secondary)'
                }}>
                  <div>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#10b981',
                      margin: 0
                    }}>
                      ₹{Math.round(machine.rate * 1.1)}
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)'
                      }}>/hr</span>
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      margin: 0
                    }}>incl. platform fee</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleBookNow(machine); }}
                    disabled={!machine.available}
                    type="button"
                    style={{ 
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      background: machine.available 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: machine.available ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      cursor: machine.available ? 'pointer' : 'not-allowed',
                      boxShadow: machine.available ? '0 4px 16px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  >
                    {machine.available ? 'Book Now' : 'Unavailable'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              background: userLocation 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: userLocation 
                ? '1px solid rgba(59, 130, 246, 0.3)'
                : '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <FiMapPin style={{ fontSize: '32px', color: userLocation ? '#3b82f6' : '#10b981' }} />
            </div>
            <p style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '8px',
              color: 'var(--text-primary)'
            }}>
              {userLocation ? 'No Equipment Nearby' : 'No Equipment Found'}
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              {userLocation 
                ? `No equipment found within ${searchRadius} km of your location. Try expanding your search radius or clearing the location filter.`
                : 'Try adjusting your search or filters to find equipment.'}
            </p>
            {userLocation && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserLocation(null)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)'
                }}
              >
                Clear Location Filter
              </motion.button>
            )}
          </motion.div>
        )}
    </div>

      {/* Machine Detail Modal with Reviews */}
      <Modal isOpen={detailModal.open} onClose={() => setDetailModal({ open: false, machine: null })}>
        <div className="flex justify-between items-center mb-4 p-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
          <h3 className="card-title">{detailModal.machine?.name}</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDetailModal({ open: false, machine: null })}
            className="icon-button"
          >
            <FiX />
          </motion.button>
        </div>

        <div className="p-4 space-y-4">
          {/* Machine Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <FiTruck className="w-8 h-8" style={{ color: '#10b981' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  {detailModal.machine?.category}
                </span>
                <RatingSummary machineId={detailModal.machine?.id} />
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <FiUser className="w-3 h-3" />
                <span>{detailModal.machine?.ownerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <FiMapPin className="w-3 h-3" />
                <span>{detailModal.machine?.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {detailModal.machine?.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Hourly Rate</span>
            <span className="text-xl font-bold" style={{ color: '#10b981' }}>
              Rs.{Math.round((detailModal.machine?.rate || 0) * 1.1)}
              <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>/hr</span>
            </span>
          </div>

          {/* Reviews Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Reviews
            </h4>
            <ReviewList machineId={detailModal.machine?.id} />
          </div>

          {/* Book Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              setDetailModal({ open: false, machine: null });
              handleBookNow(detailModal.machine);
            }}
            disabled={!detailModal.machine?.available}
            className="primary-button w-full"
            style={{ 
              background: detailModal.machine?.available 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              color: detailModal.machine?.available ? '#ffffff' : 'rgba(255,255,255,0.7)'
            }}
          >
            {detailModal.machine?.available ? 'Book This Equipment' : 'Currently Unavailable'}
          </motion.button>
        </div>
      </Modal>
    </>
  );
};

export default FarmerMachines;
