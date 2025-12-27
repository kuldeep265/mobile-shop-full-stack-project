import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          // If token is invalid, clear it
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []); // Only run once on mount

  // Register
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // Login
  const login = async (formDataOrUser, tokenParam = null) => {
    try {
      // If called with user object and token (from Google OAuth)
      if (tokenParam) {
        const { token, user } = { token: tokenParam, user: formDataOrUser };
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { token, user };
      }
      
      // Regular email/password login
      const normalizedFormData = {
        ...formDataOrUser,
        email: formDataOrUser.email?.toLowerCase().trim()
      };
      
      const res = await api.post('/auth/login', normalizedFormData);
      
      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error('Invalid response from server');
      }
      
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return res.data;
    } catch (error) {
      // Log error for debugging
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
