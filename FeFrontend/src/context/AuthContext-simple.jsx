import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount - Synchronous session restoration
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        
        // Validate all session data exists
        if (token && role && userId && token.length > 10) {
          const userData = {
            id: userId,
            role: role,
            token: token
          };
          
          // Synchronous state update to prevent routing flicker
          setUser(userData);
          if (import.meta.env.DEV) {
            console.log('Session restored:', userData);
          }
        } else {
          // Clear corrupted session data
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          setUser(null);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Session restoration error:', error);
        }
        // Clear any corrupted data
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Immediate synchronous execution
    restoreSession();
  }, []);

  const login = async (email, password, selectedRole = null) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Attempting login with:', email, 'as', selectedRole);
      }
      const response = await authService.login(email, password, selectedRole);
      if (import.meta.env.DEV) {
        console.log('Login response:', response);
      }
      
      const normalizedRole = response.role?.charAt(0).toUpperCase() + response.role?.slice(1).toLowerCase();
      if (import.meta.env.DEV) {
        console.log('Normalized role:', normalizedRole);
      }
      
      setUser({
        id: response.userId,
        role: normalizedRole,
        token: response.token
      });
      
      // 🔥 ADD THESE 3 CRITICAL LINES 🔥
      // This permanently saves the session in the browser until they click "logout"
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('userId', response.userId);
      
      if (import.meta.env.DEV) {
        console.log('User set:', { id: response.userId, role: normalizedRole });
      }
      return { success: true, role: normalizedRole };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Invalid email or password. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, message: response.message };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Register error:', error);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isFarmer: user?.role === 'Farmer',
    isOwner: user?.role === 'Owner',
    getToken: () => user?.token || localStorage.getItem('token'),
    getUserId: () => user?.id || localStorage.getItem('userId'),
    getUserRole: () => user?.role || localStorage.getItem('role'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
