import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/axios';

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
  const [requires2FA, setRequires2FA] = useState(false);
  const [pending2FAEmail, setPending2FAEmail] = useState(null);
  const [pending2FARole, setPending2FARole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (token && role && userId) {
      setUser({ token, role, userId });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      
      const { token, role, userId, requires2FA, twoFAMethod, email: responseEmail } = response.data;
      
      if (requires2FA === true) {
        setRequires2FA(true);
        setPending2FAEmail(responseEmail || email);
        setPending2FARole(role);
        return { success: true, requires2FA: true, twoFAMethod, email: responseEmail || email, role };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      
      setUser({ token, role, userId });
      return { success: true, role };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.response?.data?.Message || 'Login failed' };
    }
  }, []);

  const verify2FA = useCallback(async (email, code) => {
    try {
      const response = await API.post('/auth/2fa/verify', { email, code });
      const { token, role, userId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      
      setUser({ token, role, userId });
      setRequires2FA(false);
      setPending2FAEmail(null);
      setPending2FARole(null);
      
      return { success: true, role };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid verification code' };
    }
  }, []);

  const resend2FACode = useCallback(async (email) => {
    try {
      await API.post('/auth/2fa/resend', { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to resend code' };
    }
  }, []);

  const cancel2FA = useCallback(() => {
    setRequires2FA(false);
    setPending2FAEmail(null);
    setPending2FARole(null);
  }, []);

  const get2FASettings = useCallback(async () => {
    try {
      const response = await API.get('/auth/2fa/settings');
      return { success: true, settings: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get 2FA settings' };
    }
  }, []);

  const update2FASettings = useCallback(async (settings) => {
    try {
      if (settings.enabled) {
        const response = await API.post('/auth/2fa/enable', { method: settings.method });
        return { success: true, data: response.data };
      } else {
        await API.post('/auth/2fa/disable');
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update 2FA settings' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
    setRequires2FA(false);
    setPending2FAEmail(null);
    setPending2FARole(null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    verify2FA,
    resend2FACode,
    cancel2FA,
    get2FASettings,
    update2FASettings,
    requires2FA,
    pending2FAEmail,
    pending2FARole,
    isAuthenticated: !!user,
    isAdmin: user?.role?.toLowerCase() === 'admin',
    isFarmer: user?.role?.toLowerCase() === 'farmer',
    isOwner: user?.role?.toLowerCase() === 'owner',
  }), [user, login, register, logout, verify2FA, resend2FACode, cancel2FA, get2FASettings, update2FASettings, requires2FA, pending2FAEmail, pending2FARole]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
