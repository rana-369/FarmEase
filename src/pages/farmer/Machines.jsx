import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiSearch, FiFilter, FiMapPin, FiDollarSign, FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import { getAvailableMachines } from '../../services/machineService';

const FarmerMachines = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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
        id: machine.id,
        name: machine.name,
        category: machine.type || 'Other',
        ownerName: machine.ownerName || 'Equipment Owner',
        location: machine.location || 'Location not specified',
        rate: machine.rate,
        rating: machine.rating || 4.5,
        image: machine.imageUrl 
          ? `https://localhost:7103${machine.imageUrl}`
          : 'https://via.placeholder.com/300x200?text=Equipment',
        available: machine.status === 'Verified' || machine.status === 'Active',
        description: machine.description || 'Professional agricultural equipment'
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

  const handleBookNow = (machineId) => {
    // Navigate to booking page or open booking modal
    console.log('Booking machine:', machineId);
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
      <div className="flex items-center justify-between">
        <p style={{ color: '#a1a1a1' }}>
          Showing <span className="font-medium" style={{ color: '#ffffff' }}>{filteredMachines.length}</span> equipment
        </p>
      </div>

      {/* Enterprise Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine, index) => (
          <motion.div
            key={machine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="overflow-hidden rounded-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Machine Image */}
            <div className="relative h-48" style={{ backgroundColor: '#1a1a1a' }}>
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {!machine.available && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                    Not Available
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                {machine.category}
              </div>
            </div>

            {/* Machine Details */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>{machine.name}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: '#a1a1a1' }}>{machine.description}</p>

              {/* Owner and Location */}
              <div className="flex items-center gap-2 text-sm mb-3" style={{ color: '#a1a1a1' }}>
                <FiMapPin className="text-xs" />
                <span>{machine.location}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                <FiStar className="fill-current" style={{ color: '#facc15' }} />
                <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{machine.rating}</span>
                <span className="text-sm" style={{ color: '#a1a1a1' }}>(23 reviews)</span>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>₹{machine.rate}</p>
                  <p className="text-sm" style={{ color: '#a1a1a1' }}>per hour</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBookNow(machine.id)}
                  disabled={!machine.available}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: machine.available ? '#22c55e' : 'rgba(255, 255, 255, 0.05)',
                    color: machine.available ? '#ffffff' : '#666666',
                    cursor: machine.available ? 'pointer' : 'not-allowed'
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
    </div>
  );
};

export default FarmerMachines;
