import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const hydrateAuthUser = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw.id || raw._id;
  return id && !raw.id ? { ...raw, id } : raw;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(hydrateAuthUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, roleOrOptions = 'admin') => {
    const role =
      typeof roleOrOptions === 'string'
        ? roleOrOptions
        : roleOrOptions?.role || 'user';
    try {
      let response;
      if (role === 'admin') {
        response = await apiService.adminLogin(email, password);
      } else {
        response = await apiService.userLogin(email, password);
      }
      if (response.success) {
        const u = hydrateAuthUser(response.user);
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', response.token);
        return { success: true, user: u };
      }
      return {
        success: false,
        message: response.message || 'Login failed',
        error: response.error,
      };
    } catch (error) {
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const loginWithOtp = async (phone, otp, sessionId) => {
    try {
      const response = await apiService.verifyOtp(phone, otp, sessionId);
      if (response.success) {
        const u = hydrateAuthUser(response.user);
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', response.token);
        return { success: true, user: u };
      }
      return {
        success: false,
        message: response.message || 'OTP verification failed',
        attemptsRemaining: response.attemptsRemaining,
        error: response.error,
      };
    } catch (error) {
      return { success: false, message: 'An error occurred during OTP login' };
    }
  };

  const sendLoginOtp = async (phone) => apiService.sendOtp(phone);

  const signup = async (userData) => {
    try {
      const response = await apiService.userSignup(userData);
      if (response.success) {
        const u = hydrateAuthUser(response.user);
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', response.token);
        return { success: true, user: u };
      }
      return {
        success: false,
        message: response.message || 'Signup failed',
        error: response.error,
      };
    } catch (error) {
      return { success: false, message: 'An error occurred during signup' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await apiService.forgotPassword(email);
    } catch (error) {
      return { success: false, message: 'Request failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    loginWithOtp,
    sendLoginOtp,
    signup,
    forgotPassword,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
