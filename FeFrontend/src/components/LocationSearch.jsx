import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiNavigation, FiX, FiLoader, FiCrosshair, FiCheck, FiMap, FiTarget } from 'react-icons/fi';
import MapLocationPicker from './MapLocationPicker';

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  } else {
    return `${Math.round(distance)} km`;
  }
};

const LocationSearch = ({ onLocationSelect, initialLocation, showRadiusSelector = true }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [radius, setRadius] = useState(10); // Default 10km radius
  const [error, setError] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLocations');
    if (saved) {
      setRecentLocations(JSON.parse(saved));
    }
  }, []);

  // Get user's current location using browser geolocation
  const getCurrentLocation = useCallback(() => {
    setIsLocating(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const address = await reverseGeocode(latitude, longitude);
          const location = {
            lat: latitude,
            lng: longitude,
            address: address,
            name: 'Current Location'
          };
          
          setSelectedLocation(location);
          setSearchQuery(address);
          setShowSuggestions(false);
          
          // Save to recent locations
          saveRecentLocation(location);
          
          onLocationSelect(location, radius);
        } catch (err) {
          // If reverse geocoding fails, still use coordinates
          const location = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            name: 'Current Location'
          };
          setSelectedLocation(location);
          setSearchQuery(location.address);
          onLocationSelect(location, radius);
        }
        
        setIsLocating(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location permissions.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [onLocationSelect, radius]);

  // Reverse geocode using OpenStreetMap Nominatim (free)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Search for locations using Nominatim
  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`
      );
      const data = await response.json();
      
      const formatted = data.map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        name: item.display_name.split(',')[0],
        type: item.type
      }));
      
      setSuggestions(formatted);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && !selectedLocation) {
        searchLocations(searchQuery);
        setShowSuggestions(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedLocation]);

  // Save recent location
  const saveRecentLocation = (location) => {
    const updated = [
      location,
      ...recentLocations.filter(l => l.address !== location.address)
    ].slice(0, 5);
    setRecentLocations(updated);
    localStorage.setItem('recentLocations', JSON.stringify(updated));
  };

  // Handle location selection
  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    setShowSuggestions(false);
    saveRecentLocation(location);
    onLocationSelect(location, radius);
  };

  // Handle map picker location selection
  const handleMapLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    saveRecentLocation(location);
    onLocationSelect(location, radius);
  };

  // Clear selected location
  const clearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSuggestions([]);
    setError('');
    onLocationSelect(null, radius);
  };

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (selectedLocation) {
      onLocationSelect(selectedLocation, newRadius);
    }
  };

  const radiusOptions = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 20, label: '20 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' }
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Search Input Container */}
      <div style={{ position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: `1px solid ${selectedLocation ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-primary)'}`,
            boxShadow: selectedLocation 
              ? '0 0 0 3px rgba(16, 185, 129, 0.1), 0 8px 24px rgba(16, 185, 129, 0.15)'
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Input Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-secondary)'
          }}>
            <motion.div
              animate={{ scale: selectedLocation ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: selectedLocation 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: selectedLocation ? 'none' : '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: selectedLocation ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none'
              }}
            >
              <FiTarget style={{ fontSize: '20px', color: '#ffffff' }} />
            </motion.div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {selectedLocation ? 'Location Set' : 'Set Your Location'}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                margin: 0
              }}>
                {selectedLocation ? 'Search equipment nearby' : 'Find equipment near you'}
              </p>
            </div>
            {selectedLocation && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearLocation}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.15)',
                  cursor: 'pointer',
                  color: '#f87171'
                }}
              >
                <FiX size={18} />
              </motion.button>
            )}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <FiMapPin style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: selectedLocation ? '#10b981' : 'var(--text-muted)',
              fontSize: '18px'
            }} />
            <input
              type="text"
              placeholder="Search your location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLocation(null);
              }}
              onFocus={() => {
                setShowSuggestions(true);
              }}
              style={{
                width: '100%',
                padding: '16px 100px 16px 52px',
                fontSize: '14px',
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Action Buttons */}
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getCurrentLocation}
                disabled={isLocating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isLocating 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)'
                    : 'var(--bg-button)',
                  cursor: 'pointer',
                  color: isLocating ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                {isLocating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FiLoader size={16} />
                  </motion.div>
                ) : (
                  <FiCrosshair size={16} />
                )}
                <span style={{ display: 'none' }}>Locate</span>
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                margin: '0',
                padding: '12px 20px',
                fontSize: '13px',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.1)',
                borderTop: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && !selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                zIndex: 1000,
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Current Location Button */}
              <motion.button
                type="button"
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                onClick={() => {
                  getCurrentLocation();
                  setShowSuggestions(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'var(--bg-primary)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-secondary)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <FiNavigation style={{ fontSize: '20px', color: '#10b981' }} />
                </div>
                <div>
                  <p style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}>Use Current Location</p>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>Enable location permissions</p>
                </div>
              </motion.button>

              {/* Pick on Map Button */}
              <motion.button
                type="button"
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                onClick={() => {
                  setShowMapPicker(true);
                  setShowSuggestions(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'var(--bg-primary)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-secondary)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <FiMap style={{ fontSize: '20px', color: '#3b82f6' }} />
                </div>
                <div>
                  <p style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}>Pick on Map</p>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>Drop a pin to select location</p>
                </div>
              </motion.button>

              {/* Recent Locations */}
              {recentLocations.length > 0 && !searchQuery && (
                <div style={{ borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-primary)' }}>
                  <p style={{
                    margin: 0,
                    padding: '12px 20px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-primary)'
                  }}>Recent Locations</p>
                  {recentLocations.map((loc, index) => (
                    <motion.button
                      type="button"
                      key={index}
                      whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                      onClick={() => handleSelectLocation(loc)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        textAlign: 'left',
                        border: 'none',
                        background: 'var(--bg-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <FiMapPin style={{ color: 'var(--text-muted)', fontSize: '16px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{loc.name}</p>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{loc.address}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {suggestions.length > 0 && (
                <div style={{ background: 'var(--bg-primary)' }}>
                  <p style={{
                    margin: 0,
                    padding: '12px 20px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-primary)'
                  }}>Search Results</p>
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      type="button"
                      key={index}
                      whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                      onClick={() => handleSelectLocation(suggestion)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        textAlign: 'left',
                        border: 'none',
                        background: 'var(--bg-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(16, 185, 129, 0.15)'
                      }}>
                        <FiMapPin style={{ color: '#10b981', fontSize: '14px' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{suggestion.name}</p>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{suggestion.address}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Radius Selector */}
      {showRadiusSelector && selectedLocation && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <FiTarget style={{ fontSize: '16px', color: '#3b82f6' }} />
              </div>
              <p style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>Search Radius</p>
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {radiusOptions.map((option) => (
                <motion.button
                  type="button"
                  key={option.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRadiusChange(option.value)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: radius === option.value ? 'none' : '1px solid var(--border-secondary)',
                    background: radius === option.value
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'var(--bg-button)',
                    color: radius === option.value ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    boxShadow: radius === option.value ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px',
            padding: '20px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
          }}>
            <FiCheck style={{ fontSize: '24px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#10b981'
            }}>Location Confirmed</p>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Searching within {radius} km of {selectedLocation.name || 'your location'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Map Location Picker Modal */}
      <AnimatePresence>
        {showMapPicker && (
          <MapLocationPicker
            onLocationSelect={handleMapLocationSelect}
            initialLocation={selectedLocation}
            onClose={() => setShowMapPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearch;
