// Notification service
import api from './api';

export const notificationService = {
  // Get all notifications for a passenger
  getNotifications: async (type, read) => {
    try {
      const params = {};
      if (type) params.type = type;
      if (read !== undefined) params.read = read;
      
      const response = await api.get('/notifications', { params });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get notifications' };
    }
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    try {
      const response = await api.get('/notifications', { params: { read: false } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get unread notifications' };
    }
  },

  // Get notifications by category
  getNotificationsByCategory: async (category) => {
    try {
      const response = await api.get('/notifications', { params: { type: category } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get notifications by category' };
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to mark notification as read' };
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to mark all notifications as read' };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete notification' };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get unread count' };
    }
  }
};
