// Authentication service
import api from './api';

export const authService = {
  // Login
  login: async (email, password, userType = 'passenger') => {
    try {
      const response = await api.post('/auth/login', { email, password, userType });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      // Logout should always succeed on frontend even if backend fails
      return { success: true };
    }
  },

  // Get profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get profile' };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/me', profileData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Profile update failed' };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to send reset link' };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password: newPassword });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Password reset failed' };
    }
  }
};
