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
 
  // Enhanced session management
  const [activeSessions, setActiveSessions] = useState(() => {
    const sessions = localStorage.getItem('activeSessions');
    return sessions ? JSON.parse(sessions) : {};
  });
 
  const saveSession = useCallback((userData, sessionKey) => {
    const sessions = { ...activeSessions };
    sessions[sessionKey] = userData;
    localStorage.setItem('activeSessions', JSON.stringify(sessions));
    setActiveSessions(sessions);
  }, [activeSessions]);
 
  const removeSession = useCallback((sessionKey) => {
    const sessions = { ...activeSessions };
    delete sessions[sessionKey];
    localStorage.setItem('activeSessions', JSON.stringify(sessions));
    setActiveSessions(sessions);
  }, [activeSessions]);
 
  const getCurrentSession = useCallback(() => {
    const currentSessionKey = localStorage.getItem('currentSessionKey');
    return currentSessionKey ? activeSessions[currentSessionKey] : null;
  }, [activeSessions]);
 
  const switchSession = useCallback((sessionKey) => {
    const session = activeSessions[sessionKey];
    if (session) {
      localStorage.setItem('currentSessionKey', sessionKey);
      setUser(session);
      // Update API headers with new session token
      API.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
    }
  }, [activeSessions]);
 
  useEffect(() => {
    // Initialize with current session
    const currentSessionKey = localStorage.getItem('currentSessionKey');
    if (currentSessionKey && activeSessions[currentSessionKey]) {
      setUser(activeSessions[currentSessionKey]);
    }
    setLoading(false);
  }, [activeSessions]);
 
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
 
      // Create session key
      const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = { token, role, userId, email, loginTime: new Date().toISOString() };
 
      // Save session
      saveSession(sessionData, sessionKey);
 
      // Set as current session
      switchSession(sessionKey);
 
      return { success: true, role, sessionKey };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  }, [saveSession, switchSession]);
 
  const verify2FA = useCallback(async (email, code) => {
    try {
      const response = await API.post('/auth/2fa/verify', { email, code });
      const { token, role, userId } = response.data;
 
      // Create session key
      const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = { token, role, userId, email, loginTime: new Date().toISOString() };
 
      // Save session
      saveSession(sessionData, sessionKey);
 
      // Set as current session
      switchSession(sessionKey);
 
      setRequires2FA(false);
      setPending2FAEmail(null);
      setPending2FARole(null);
 
      return { success: true, role, sessionKey };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid verification code' };
    }
  }, [saveSession, switchSession]);
 
  const logout = useCallback((sessionKey = null) => {
    if (sessionKey) {
      // Logout specific session
      removeSession(sessionKey);
 
      // If logging out current session, switch to another or clear all
      const currentSessionKey = localStorage.getItem('currentSessionKey');
      if (currentSessionKey === sessionKey) {
        const remainingSessions = Object.keys(activeSessions).filter(key => key !== sessionKey);
        if (remainingSessions.length > 0) {
          switchSession(remainingSessions[0]);
        } else {
          localStorage.removeItem('currentSessionKey');
          setUser(null);
          delete API.defaults.headers.common['Authorization'];
        }
      }
    } else {
      // Logout current session
      const currentSessionKey = localStorage.getItem('currentSessionKey');
      if (currentSessionKey) {
        removeSession(currentSessionKey);
 
        // Switch to another session if available
        const remainingSessions = Object.keys(activeSessions);
        if (remainingSessions.length > 0) {
          switchSession(remainingSessions[0]);
        } else {
          localStorage.removeItem('currentSessionKey');
          setUser(null);
          delete API.defaults.headers.common['Authorization'];
        }
      }
    }
 
    setRequires2FA(false);
    setPending2FAEmail(null);
    setPending2FARole(null);
  }, [removeSession, switchSession, activeSessions]);
 
  const logoutAll = useCallback(() => {
    // Clear all sessions
    localStorage.removeItem('activeSessions');
    localStorage.removeItem('currentSessionKey');
    setActiveSessions({});
    setUser(null);
    delete API.defaults.headers.common['Authorization'];
    setRequires2FA(false);
    setPending2FAEmail(null);
    setPending2FARole(null);
  }, []);
 
  const value = useMemo(() => ({
    user,
    activeSessions,
    currentSessionKey: localStorage.getItem('currentSessionKey'),
    getCurrentSession,
    switchSession,
    login,
    logout,
    logoutAll,
    register,
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
  }), [user, activeSessions, getCurrentSession, switchSession, login, logout, logoutAll, verify2FA, requires2FA, pending2FAEmail, pending2FARole]);
 
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};