import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load user profile on startup if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      const storedUser = localStorage.getItem('imovies_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh profile in background
          const res = await authService.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('imovies_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const { user: userData, token: userToken } = res.data;

      localStorage.setItem('imovies_token', userToken);
      localStorage.setItem('imovies_user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return userData;
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      const { user: newUser, token: userToken } = res.data;

      localStorage.setItem('imovies_token', userToken);
      localStorage.setItem('imovies_user', JSON.stringify(newUser));

      setToken(userToken);
      setUser(newUser);
      showToast(`Welcome to IMovies, ${newUser.name}!`, 'success');
      return newUser;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('imovies_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
