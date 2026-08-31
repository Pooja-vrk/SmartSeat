// Booking service
import api from './api';

export const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create booking' };
    }
  },

  // Get all bookings for a passenger
  getBookings: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/bookings', { params });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get bookings' };
    }
  },

  // Get single booking
  getBooking: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get booking' };
    }
  },

  // Get upcoming bookings
  getUpcomingBookings: async () => {
    try {
      const response = await api.get('/bookings', { params: { status: 'confirmed' } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get upcoming bookings' };
    }
  },

  // Get completed bookings
  getCompletedBookings: async () => {
    try {
      const response = await api.get('/bookings', { params: { status: 'completed' } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get completed bookings' };
    }
  },

  // Get cancelled bookings
  getCancelledBookings: async () => {
    try {
      const response = await api.get('/bookings', { params: { status: 'cancelled' } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get cancelled bookings' };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to cancel booking' };
    }
  },

  // Get refund preview before cancellation
  getRefundPreview: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/refund-preview`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get refund preview' };
    }
  },

  // Change seat
  changeSeat: async (bookingId, newSeatNumber) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/change-seat`, { newSeatNumber });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to change seat' };
    }
  },

  // Update SmartSeat monitoring preference
  updateSmartSeatMonitoring: async (bookingId, enabled) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/smartseat-monitoring`, { enabled });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update SmartSeat monitoring' };
    }
  },

  // Check seat availability
  checkSeatAvailability: async (scheduleId, seatNumber) => {
    try {
      const response = await api.post('/bookings/check-availability', { scheduleId, seatNumber });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to check seat availability' };
    }
  },

  // Get available seats for a schedule
  getAvailableSeats: async (scheduleId) => {
    try {
      const response = await api.get(`/bookings/available-seats/${scheduleId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get available seats' };
    }
  }
};
