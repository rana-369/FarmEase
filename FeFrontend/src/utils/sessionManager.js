// Session Management Utility for Multi-User Support

const SESSION_KEYS = {
  ACTIVE_SESSIONS: 'activeSessions',
  CURRENT_SESSION: 'currentSessionKey',
  API_HEADERS: 'apiHeaders'
};

class SessionManager {
  static getActiveSessions() {
    const sessions = localStorage.getItem(SESSION_KEYS.ACTIVE_SESSIONS);
    return sessions ? JSON.parse(sessions) : {};
  }

  static saveSession(sessionData, sessionKey) {
    const sessions = this.getActiveSessions();
    sessions[sessionKey] = sessionData;
    localStorage.setItem(SESSION_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessions));
    return sessionKey;
  }

  static removeSession(sessionKey) {
    const sessions = this.getActiveSessions();
    delete sessions[sessionKey];
    localStorage.setItem(SESSION_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessions));
  }

  static getCurrentSessionKey() {
    return localStorage.getItem(SESSION_KEYS.CURRENT_SESSION);
  }

  static setCurrentSession(sessionKey) {
    localStorage.setItem(SESSION_KEYS.CURRENT_SESSION, sessionKey);
    
    const sessions = this.getActiveSessions();
    const session = sessions[sessionKey];
    
    if (session) {
      this.updateApiHeaders(session.token);
      return session;
    }
    return null;
  }

  static getCurrentSession() {
    const currentKey = this.getCurrentSessionKey();
    if (!currentKey) return null;
    
    const sessions = this.getActiveSessions();
    return sessions[currentKey] || null;
  }

  static updateApiHeaders(token) {
    const headers = this.getApiHeaders();
    headers['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(SESSION_KEYS.API_HEADERS, JSON.stringify(headers));
  }

  static getApiHeaders() {
    const stored = localStorage.getItem(SESSION_KEYS.API_HEADERS);
    return stored ? JSON.parse(stored) : {};
  }

  static switchToSession(sessionKey) {
    const session = this.setCurrentSession(sessionKey);
    return session;
  }

  static logoutSession(sessionKey = null) {
    if (sessionKey) {
      this.removeSession(sessionKey);
    }
    
    const currentKey = this.getCurrentSessionKey();
    if (currentKey === sessionKey) {
      // Switch to another session if available
      const sessions = this.getActiveSessions();
      const remainingKeys = Object.keys(sessions).filter(key => key !== sessionKey);
      
      if (remainingKeys.length > 0) {
        this.switchToSession(remainingKeys[0]);
      } else {
        // No more sessions, clear everything
        this.clearAllSessions();
      }
    }
  }

  static clearAllSessions() {
    localStorage.removeItem(SESSION_KEYS.ACTIVE_SESSIONS);
    localStorage.removeItem(SESSION_KEYS.CURRENT_SESSION);
    localStorage.removeItem(SESSION_KEYS.API_HEADERS);
  }

  static generateSessionKey() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static validateSession(sessionData) {
    return sessionData && 
           sessionData.token && 
           sessionData.userId && 
           sessionData.role &&
           sessionData.loginTime;
  }

  static isSessionExpired(sessionData) {
    if (!sessionData.loginTime) return true;
    
    const now = new Date();
    const loginTime = new Date(sessionData.loginTime);
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    // Session expires after 24 hours
    return hoursDiff > 24;
  }

  static cleanupExpiredSessions() {
    const sessions = this.getActiveSessions();
    let hasChanges = false;
    
    Object.keys(sessions).forEach(key => {
      const session = sessions[key];
      if (this.isSessionExpired(session)) {
        delete sessions[key];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      localStorage.setItem(SESSION_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessions));
      
      // If current session was expired, switch to another
      const currentKey = this.getCurrentSessionKey();
      if (currentKey && !sessions[currentKey]) {
        const remainingKeys = Object.keys(sessions);
        if (remainingKeys.length > 0) {
          this.switchToSession(remainingKeys[0]);
        } else {
          this.clearAllSessions();
        }
      }
    }
  }
}

export default SessionManager;
