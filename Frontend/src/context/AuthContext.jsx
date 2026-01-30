import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [loggingOut, setLoggingOut] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      setLoading(false);
      return;
    }

    // If we have stored user data, use it first
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }

    try {
      // Try admin endpoint first if user might be admin
      let response;
      try {
        response = await axios.get('http://localhost:5001/api/v1/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (adminError) {
        // If admin endpoint fails, try user endpoint
        if (adminError.response?.status === 403 || adminError.response?.status === 404) {
          response = await axios.get('http://localhost:5001/api/v1/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw adminError;
        }
      }
      
      const userData = response.data.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only clear auth on 401/403 errors, not network errors
      if (error.response && [401, 403].includes(error.response.status)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      console.log('Starting logout animation...');
      // Show animation for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Animation complete, clearing auth...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoggingOut(false);
      // Small delay to ensure state updates before redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Try admin endpoint first if user might be admin
      let response;
      try {
        response = await axios.get('http://localhost:5001/api/v1/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (adminError) {
        // If admin endpoint fails, try user endpoint
        if (adminError.response?.status === 403 || adminError.response?.status === 404) {
          response = await axios.get('http://localhost:5001/api/v1/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw adminError;
        }
      }
      
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    token: localStorage.getItem('token'),
    login,
    logout,
    loading,
    loggingOut,
    updateUser,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};