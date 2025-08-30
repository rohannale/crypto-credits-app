import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  // Configure axios base URL
  axios.defaults.baseURL = 'http://localhost:5001';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserCredits();
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ email });
      setIsAuthenticated(true);
      await fetchUserCredits();
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password) => {
    try {
      await axios.post('/api/auth/signup', { email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setCredits(0);
  };

  const fetchUserCredits = async () => {
    try {
      const response = await axios.get('/api/user/credits');
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Failed to fetch karma:', error);
    }
  };

  const updateWallet = async (walletAddress) => {
    try {
      const response = await axios.post('/api/user/wallet', { walletAddress });
      return { success: true, walletAddress: response.data.walletAddress };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update wallet' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    credits,
    login,
    register,
    logout,
    fetchUserCredits,
    updateWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
