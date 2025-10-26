import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data.user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, loginType = 'whatsapp') => {
    try {
      setError(null);
      
      // Prepare login data based on type
      let loginData = { password };
      
      if (loginType === 'whatsapp') {
        loginData.whatsapp_number = identifier;
      } else if (loginType === 'username') {
        loginData.username = identifier;
      } else if (loginType === 'email') {
        loginData.email = identifier;
      }
      
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyOtp = async (whatsappNumber, otpCode) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        whatsapp_number: whatsappNumber,
        otp_code: otpCode
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      return { success: false, error: err.response?.data?.message || 'OTP verification failed' };
    }
  };

  const resendOtp = async (whatsappNumber) => {
    try {
      setError(null);
      await axios.post('http://localhost:5000/api/auth/resend-otp', {
        whatsapp_number: whatsappNumber
      });
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      return { success: false, error: err.response?.data?.message || 'Failed to resend OTP' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
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