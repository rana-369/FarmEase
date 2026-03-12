import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext-simple';
import Navbar from './components/Navbar';
import FarmerLayout from './layouts/FarmerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerMachines from './pages/farmer/Machines';
import FarmerBookings from './pages/farmer/Bookings';
import FarmerNotifications from './pages/farmer/Notifications';
import FarmerProfile from './pages/farmer/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import AddMachine from './pages/owner/AddMachine';
import OwnerMachines from './pages/owner/Machines';
import OwnerRequests from './pages/owner/Requests';
import OwnerEarnings from './pages/owner/Earnings';
import OwnerNotifications from './pages/owner/Notifications';
import OwnerProfile from './pages/owner/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/Users';
import MachineApproval from './pages/admin/Machines';
import BookingsManagement from './pages/admin/Bookings';
import EarningsPage from './pages/admin/Earnings';
import NotificationsPage from './pages/admin/Notifications';
import SettingsPage from './pages/admin/Settings';

// Route components must be inside AuthProvider, so we define them inside AppRoutes
const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Public Route Component (redirects authenticated users to their dashboard)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return children;
  };

  return (
    <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Farmer Routes */}
            <Route path="/farmer" element={
              <ProtectedRoute allowedRole="Farmer">
                <FarmerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FarmerDashboard />} />
              <Route path="machines" element={<FarmerMachines />} />
              <Route path="bookings" element={<FarmerBookings />} />
              <Route path="notifications" element={<FarmerNotifications />} />
              <Route path="profile" element={<FarmerProfile />} />
            </Route>

            {/* Owner Routes */}
            <Route path="/owner" element={
              <ProtectedRoute allowedRole="Owner">
                <OwnerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<OwnerDashboard />} />
              <Route path="machines" element={<OwnerMachines />} />
              <Route path="add-machine" element={<AddMachine />} />
              <Route path="requests" element={<OwnerRequests />} />
              <Route path="earnings" element={<OwnerEarnings />} />
              <Route path="notifications" element={<OwnerNotifications />} />
              <Route path="profile" element={<OwnerProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard key="admin-dash" />} />
              <Route path="users" element={<UsersManagement key="admin-users" />} />
              <Route path="machines" element={<MachineApproval key="admin-machines" />} />
              <Route path="bookings" element={<BookingsManagement key="admin-bookings" />} />
              <Route path="revenue" element={<EarningsPage key="admin-revenue" />} />
              <Route path="notifications" element={<NotificationsPage key="admin-notifications" />} />
              <Route path="settings" element={<SettingsPage key="admin-settings" />} />
              <Route path="analytics" element={<div className="p-8"><h2 className="text-2xl font-bold">Analytics</h2><p className="text-gray-600 mt-2">Analytics page coming soon...</p></div>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
