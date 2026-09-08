// Admin service
import api from './api';

export const adminService = {
  // Get dashboard overview
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get dashboard data' };
    }
  },

  // Get all buses
  getBuses: async () => {
    try {
      const response = await api.get('/admin/buses');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get buses' };
    }
  },

  // Create bus
  createBus: async (busData) => {
    try {
      const response = await api.post('/admin/buses', busData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create bus' };
    }
  },

  // Update bus
  updateBus: async (busId, busData) => {
    try {
      const response = await api.patch(`/admin/buses/${busId}`, busData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update bus' };
    }
  },

  // Delete bus
  deleteBus: async (busId) => {
    try {
      const response = await api.delete(`/admin/buses/${busId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete bus' };
    }
  },

  // Get all bookings
  getBookings: async (filters = {}) => {
    try {
      const response = await api.get('/admin/bookings', { params: filters });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get bookings' };
    }
  },

  // Get all passengers
  getPassengers: async (filters = {}) => {
    try {
      const response = await api.get('/admin/passengers', { params: filters });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get passengers' };
    }
  },

  // Get passenger details
  getPassengerDetails: async (passengerId) => {
    try {
      const response = await api.get(`/admin/passengers/${passengerId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get passenger details' };
    }
  },

  // Get notifications log
  getNotifications: async (filters = {}) => {
    try {
      const response = await api.get('/admin/notifications', { params: filters });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get notifications' };
    }
  },

  // Send a notification (admin-initiated)
  sendNotification: async (payload) => {
    try {
      const response = await api.post('/admin/notifications', payload);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to send notification' };
    }
  },

  // Get buses for notification modal dropdowns
  getBusesForNotification: async () => {
    try {
      const response = await api.get('/admin/notification-buses');
      return response;
    } catch (error) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to fetch buses';
      throw new Error(msg);
    }
  },

  // Get schedules for a specific bus (notification modal)
  getSchedulesForBus: async (busId) => {
    try {
      const response = await api.get('/admin/notification-schedules', { params: { busId } });
      return response;
    } catch (error) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to fetch schedules';
      throw new Error(msg);
    }
  },

  // Get analytics
  getAnalytics: async (period = 'month') => {
    try {
      const response = await api.get('/admin/analytics', { params: { period } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get analytics' };
    }
  },

  // Get settings
  getSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get settings' };
    }
  },

  // Update settings
  updateSettings: async (settings) => {
    try {
      const response = await api.patch('/admin/settings', settings);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update settings' };
    }
  },

  // Route management
  createRoute: async (routeData) => {
    try {
      const response = await api.post('/admin/routes', routeData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create route' };
    }
  },

  updateRoute: async (routeId, routeData) => {
    try {
      const response = await api.patch(`/admin/routes/${routeId}`, routeData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update route' };
    }
  },

  deleteRoute: async (routeId) => {
    try {
      const response = await api.delete(`/admin/routes/${routeId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete route' };
    }
  },

  // Schedule management
  createSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/admin/schedules', scheduleData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create schedule' };
    }
  },

  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const response = await api.patch(`/admin/schedules/${scheduleId}`, scheduleData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update schedule' };
    }
  },

  deleteSchedule: async (scheduleId) => {
    try {
      const response = await api.delete(`/admin/schedules/${scheduleId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete schedule' };
    }
  }
};
