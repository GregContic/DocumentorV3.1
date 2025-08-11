import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

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

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Basic JWT token structure check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      // If we can't parse the token, consider it expired
      return true;
    }
  };

  // Validate current session
  const validateSession = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser || isTokenExpired(token)) {
      // Clear invalid session
      logout();
      return false;
    }
    
    try {
      setUser(JSON.parse(storedUser));
      return true;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    // Validate session on app load
    validateSession();
    setLoading(false);

    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        console.log('Token expired, logging out user');
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const login = async (userData, token) => {
    try {
      // Validate token before storing
      if (token && !isTokenExpired(token)) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
      } else {
        throw new Error('Invalid or expired token');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Optional: Clear any other sensitive data
    localStorage.removeItem('lastActivity');
  };

  const refreshSession = () => {
    // Update last activity timestamp
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshSession,
    validateSession,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
