"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username?: string;
  email?: string;
  whatsapp_number?: string;
  role: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  verifyOtp: (userId: string, otpCode: string) => Promise<any>;
  resendOtp: (userId: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      loading: false,
      error: null,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      verifyOtp: async () => ({ success: false }),
      resendOtp: async () => ({ success: false }),
      logout: () => {}
    };
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserProfile(token);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data.user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setUser(user);
      
      return { success: true, data: response.data };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyOtp = async (userId: string, otpCode: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/verify-otp', {
        userId,
        otpCode
      });
      
      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setUser(user);
      
      return { success: true, data: response.data };
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
      return { success: false, error: err.response?.data?.message || 'OTP verification failed' };
    }
  };

  const resendOtp = async (userId: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/resend-otp', { userId });
      return { success: true, data: response.data };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      return { success: false, error: err.response?.data?.message || 'Failed to resend OTP' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}