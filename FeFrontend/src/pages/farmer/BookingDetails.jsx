import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
 
const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getCurrentSession } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpData, setOtpData] = useState({
    pickupOtp: '',
    returnOtp: ''
  });
  const [showOtpSharing, setShowOtpSharing] = useState(false);
  const [error, setError] = useState('');
 
  useEffect(() => {
    fetchBooking();
  }, [id]);
 
  const fetchBooking = async () => {
    try {
      const response = await API.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };
 
  const shareOtpWithOwner = async () => {
    try {
      // Create a secure OTP sharing link
      const shareData = {
        bookingId: id,
        farmerId: user.userId,
        pickupOtp: booking.pickupOtp,
        returnOtp: booking.returnOtp,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };
 
      // Store share data in backend
      await API.post('/bookings/share-otp', shareData);
 
      // Generate shareable link (in real app, this would be a secure URL)
      const shareLink = `${window.location.origin}/otp-share/${id}`;
 
      // Copy to clipboard
      await navigator.clipboard.writeText(shareLink);
 
      toast.success('OTP sharing link copied to clipboard!');
      setShowOtpSharing(false);
    } catch (error) {
      console.error('Error sharing OTP:', error);
      toast.error('Failed to share OTP. Please try again.');
    }
  };
 
  const confirmPickup = async () => {
    try {
      await API.post(`/bookings/${id}/verify-pickup`, {
        otp: otpData.pickupOtp
      });
 
      setBooking(prev => ({ ...prev, status: 'InProgress' }));
      toast.success('Pickup confirmed successfully!');
 
      // Notify owner that pickup is confirmed
      await API.post(`/notifications/notify-owner`, {
        bookingId: id,
        message: 'Equipment pickup has been confirmed',
        type: 'pickup_confirmed'
      });
    } catch (error) {
      console.error('Error confirming pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm pickup');
    }
  };
 
  const confirmReturn = async () => {
    try {
      await API.post(`/bookings/${id}/verify-return`, {
        otp: otpData.returnOtp
      });
 
      setBooking(prev => ({ ...prev, status: 'Completed' }));
      toast.success('Return confirmed successfully!');
 
      // Notify owner that return is confirmed
      await API.post(`/notifications/notify-owner`, {
        bookingId: id,
        message: 'Equipment return has been confirmed',
        type: 'return_confirmed'
      });
    } catch (error) {
      console.error('Error confirming return:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm return');
    }
  };
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }
 
  if (!booking) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Booking not found or you don't have permission to view this booking.</p>
      </div>
    );
  }
 
  const canViewBooking = booking.farmerId === user.userId || booking.ownerId === user.userId;
 
  if (!canViewBooking) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. You don't have permission to view this booking.</p>
      </div>
    );
  }
 
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h1>
          <div className="text-sm text-gray-600">
            Booking ID: {booking.id}
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Equipment Information</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">{booking.machine?.name}</p>
              <p className="text-gray-600">Category: {booking.machine?.category}</p>
              <p className="text-gray-600">Location: {booking.machine?.location}</p>
            </div>
          </div>
 
          <div>
            <h3 className="text-lg font-semibold mb-3">Booking Information</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600">Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
              <p className="text-gray-600">End Date: {new Date(booking.endDate).toLocaleDateString()}</p>
              <p className="text-gray-600">Total Amount: ₹{booking.totalAmount}</p>
              <p className="text-gray-600">Status: 
                <span className={`px-2 py-1 rounded text-xs ${
                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'InProgress' ? 'bg-green-100 text-green-800' :
                  booking.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </p>
            </div>
          </div>
        </div>
 
        {/* OTP Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">OTP Verification</h3>
 
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup OTP
                </label>
                <input
                  type="text"
                  value={otpData.pickupOtp}
                  onChange={(e) => setOtpData(prev => ({ ...prev, pickupOtp: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="Enter 6-digit pickup OTP"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return OTP
                </label>
                <input
                  type="text"
                  value={otpData.returnOtp}
                  onChange={(e) => setOtpData(prev => ({ ...prev, returnOtp: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="Enter 6-digit return OTP"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
 
          {/* OTP Actions */}
          <div className="flex gap-3">
            {booking.status === 'Approved' && booking.farmerId === user.userId && (
              <button
                onClick={shareOtpWithOwner}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Share OTP with Owner
              </button>
            )}
 
            {booking.status === 'InProgress' && booking.farmerId === user.userId && (
              <button
                onClick={confirmReturn}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirm Return
              </button>
            )}
 
            {booking.status === 'Approved' && booking.ownerId === user.userId && (
              <button
                onClick={confirmPickup}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirm Pickup
              </button>
            )}
          </div>
        </div>
 
        {/* OTP Sharing Modal */}
        {showOtpSharing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Share OTP</h3>
              <p className="text-gray-600 mb-4">
                Share the OTP securely with the equipment owner. The link will expire in 30 minutes.
              </p>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p className="text-sm font-mono break-all">
                  {window.location.origin}/otp-share/{id}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOtpSharing(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={shareOtpWithOwner}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default BookingDetails;