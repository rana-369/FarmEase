import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCrosshair, FiMapPin, FiX, FiCheckCircle } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon (green pin like Rapido)
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks and marker dragging
const LocationMarker = ({ position, onPositionChange, isDragging, setIsDragging }) => {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragstart() {
      setIsDragging(true);
    },
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        onPositionChange({ lat: newPos.lat, lng: newPos.lng });
        setIsDragging(false);
      }
    },
  };

  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : (
    <Marker
      position={[position.lat, position.lng]}
      icon={customIcon}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
};

// Component to center map on location
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapLocationPicker = ({ onLocationSelect, initialLocation, onClose }) => {
  const [position, setPosition] = useState(
    initialLocation 
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : null
  );
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    initialLocation 
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : { lat: 20.5937, lng: 78.9629 } // Center of India
  );
  const [zoom, setZoom] = useState(initialLocation ? 15 : 5);

  // Reverse geocode to get address
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle position change
  const handlePositionChange = async (newPos) => {
    setPosition(newPos);
    const addr = await reverseGeocode(newPos.lat, newPos.lng);
    setAddress(addr);
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        setMapCenter(newPos);
        setZoom(16);
        
        const addr = await reverseGeocode(latitude, longitude);
        setAddress(addr);
        setIsLocating(false);
      },
      (err) => {
        alert('Unable to retrieve your location. Please enable location permissions.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Confirm location selection
  const confirmLocation = () => {
    if (position) {
      onLocationSelect({
        lat: position.lat,
        lng: position.lng,
        address: address,
        name: address.split(',')[0]
      });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4"
        style={{ 
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <FiX size={20} style={{ color: '#fff' }} />
          </motion.button>
          <span className="text-white font-semibold">Pick Location</span>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ 
            background: isLocating ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}
        >
          <FiCrosshair 
            size={16} 
            style={{ color: '#10b981' }}
            className={isLocating ? 'animate-spin' : ''} 
          />
          <span className="text-sm font-medium" style={{ color: '#10b981' }}>
            {isLocating ? 'Locating...' : 'My Location'}
          </span>
        </motion.button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={mapCenter} zoom={zoom} />
          
          <LocationMarker 
            position={position}
            onPositionChange={handlePositionChange}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        </MapContainer>

        {/* Center Pin Indicator (when no marker placed) */}
        {!position && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ zIndex: 500 }}
          >
            <div className="relative">
              <FiMapPin size={40} style={{ color: '#10b981' }} />
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ 
                  background: '#10b981',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        {!position && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 left-0 right-0 text-center pointer-events-none"
            style={{ zIndex: 500 }}
          >
            <div 
              className="inline-block px-4 py-2 rounded-full"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <span className="text-white text-sm">Tap on map to place marker</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Panel */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{ 
          background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)',
          zIndex: 1000
        }}
      >
        {/* Address Display */}
        {position && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16, 185, 129, 0.2)' }}
              >
                <FiMapPin size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Selected Location</p>
                {isLoadingAddress ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-sm">Fetching address...</span>
                  </div>
                ) : (
                  <p className="text-white text-sm line-clamp-2">{address}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-semibold"
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff'
            }}
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={confirmLocation}
            disabled={!position}
            className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ 
              background: position 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(255,255,255,0.1)',
              color: '#fff',
              opacity: position ? 1 : 0.5
            }}
          >
            <FiCheckCircle size={18} />
            Confirm Location
          </motion.button>
        </div>

        {/* Drag hint */}
        {position && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-gray-400 mt-3"
          >
            Drag the marker to adjust position
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default MapLocationPicker;
