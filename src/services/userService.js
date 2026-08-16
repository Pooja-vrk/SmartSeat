// User service
import api from './api';

export const userService = {
  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/me', profileData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Profile update failed' };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.patch('/users/me/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Password change failed' };
    }
  },

  // Get preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/users/me/preferences');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get preferences' };
    }
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.patch('/users/me/preferences', preferences);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update preferences' };
    }
  }
};
