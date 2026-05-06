import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary, { ChunkErrorBoundary } from './components/ErrorBoundary';

// Loading fallback component
const PageLoader = () => (
  <div className="page-content-new flex items-center justify-center min-h-screen">
    <div className="spinner" />
  </div>
);

// Lazy load layouts
const FarmerLayout = lazy(() => import('./layouts/FarmerLayout'));
const OwnerLayout = lazy(() => import('./layouts/OwnerLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Lazy load public pages
const Landing = lazy(() => import('./pages/public/Landing'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));

// Lazy load farmer pages
const FarmerDashboard = lazy(() => import('./pages/farmer/Dashboard'));
const FarmerMachines = lazy(() => import('./pages/farmer/Machines'));
const FarmerBookings = lazy(() => import('./pages/farmer/Bookings'));
const FarmerNotifications = lazy(() => import('./pages/farmer/Notifications'));
const FarmerProfile = lazy(() => import('./pages/farmer/Profile'));

// Lazy load owner pages
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'));
const AddMachine = lazy(() => import('./pages/owner/AddMachine'));
const EditMachine = lazy(() => import('./pages/owner/EditMachine'));
const OwnerMachines = lazy(() => import('./pages/owner/Machines'));
const OwnerRequests = lazy(() => import('./pages/owner/Requests'));
const OwnerEarnings = lazy(() => import('./pages/owner/Earnings'));
const OwnerNotifications = lazy(() => import('./pages/owner/Notifications'));
const OwnerProfile = lazy(() => import('./pages/owner/Profile'));
const OwnerPaymentSettings = lazy(() => import('./pages/owner/PaymentSettings'));
const PaymentOnboarding = lazy(() => import('./pages/owner/PaymentOnboarding'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UsersManagement = lazy(() => import('./pages/admin/Users'));
const MachineApproval = lazy(() => import('./pages/admin/Machines'));
const BookingsManagement = lazy(() => import('./pages/admin/Bookings'));
const EarningsPage = lazy(() => import('./pages/admin/Earnings'));
const NotificationsPage = lazy(() => import('./pages/admin/Notifications'));
const SettingsPage = lazy(() => import('./pages/admin/Settings'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));

// Route components must be inside AuthProvider, so we define them inside AppRoutes
const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (loading) {
      return <div className="page-content-new flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
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
      return <div className="page-content-new flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
    }

    return children;
  };

  return (
    <Suspense fallback={<PageLoader />}>
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
              
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
              
              <Route path="/reset-password" element={
                <PublicRoute>
                  <ResetPassword />
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
                <Route path="edit-machine/:id" element={<EditMachine />} />
                <Route path="requests" element={<OwnerRequests />} />
                <Route path="earnings" element={<OwnerEarnings />} />
                <Route path="notifications" element={<OwnerNotifications />} />
                <Route path="profile" element={<OwnerProfile />} />
                <Route path="payment-settings" element={<OwnerPaymentSettings />} />
                <Route path="payment-onboarding" element={<PaymentOnboarding />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="machines" element={<MachineApproval />} />
                <Route path="bookings" element={<BookingsManagement />} />
                <Route path="revenue" element={<EarningsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="analytics" element={<div className="page-content-new"><h2 className="page-title-new">Analytics</h2><p className="page-subtitle-new">Analytics page coming soon...</p></div>} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ChunkErrorBoundary>
              <AppContent />
            </ChunkErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Separate component for app content
const AppContent = () => {
  // Theme handled via CSS variables - prevents re-renders on theme change
  return (
    <div className="App" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      <AppRoutes />
    </div>
  );
};

export default App;
