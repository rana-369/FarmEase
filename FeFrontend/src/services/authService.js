import api from './api';

// Register new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'farmer'
  });
  return response.data;
};

// Login user
export const login = async (email, password, selectedRole = null) => {
  const payload = {
    email,
    password
  };
  
  // Send selected role if provided (for role-based login validation)
  if (selectedRole) {
    payload.selectedRole = selectedRole;
  }
  
  const response = await api.post('/auth/login', payload);
  
  // Handle both lowercase and capitalized field names
  const token = response.data.token || response.data.Token;
  const role = response.data.role || response.data.Role;
  const userId = response.data.userId || response.data.UserId;
  
  // Store token and user info in localStorage
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
  }
  
  return {
    token,
    role,
    userId
  };
};

// Forgot password - request OTP
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password with OTP
export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    email,
    otp,
    newPassword
  });
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};

// Get current user ID
export const getUserId = () => {
  return localStorage.getItem('userId');
};

// Get token
export const getToken = () => {
  return localStorage.getItem('token');
};
