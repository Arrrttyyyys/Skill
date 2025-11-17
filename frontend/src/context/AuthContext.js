import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

// Web-compatible storage
const getStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      getItem: async (key) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: async (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: async (key) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  return AsyncStorage;
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storage = getStorage();
      const storedToken = await storage.getItem('token');
      const storedUser = await storage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: tokenData } = response.data;

      setUser(userData);
      setToken(tokenData);

      const storage = getStorage();
      await storage.setItem('token', tokenData);
      await storage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { user: newUser, token: tokenData } = response.data;

      setUser(newUser);
      setToken(tokenData);

      const storage = getStorage();
      await storage.setItem('token', tokenData);
      await storage.setItem('user', JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed',
      };
    }
  };

  const logout = async () => {
    try {
      console.log('Logout called');
      const storage = getStorage();
      await storage.removeItem('token');
      await storage.removeItem('user');
      console.log('Storage cleared');
      // Clear state after storage is cleared
      setUser(null);
      setToken(null);
      console.log('State cleared - user:', null, 'token:', null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear state even if storage fails
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = async (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    const storage = getStorage();
    await storage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

