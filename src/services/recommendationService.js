// Recommendation service
import api from './api';

export const recommendationService = {
  // Get seat recommendations
  getSeatRecommendations: async (scheduleId, currentSeat) => {
    try {
      const response = await api.get('/bookings/recommendations/seats', { 
        params: { scheduleId, currentSeat } 
      });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get recommendations' };
    }
  },

  // Get recommendation details for a specific seat
  getRecommendationDetails: async (scheduleId, seatNumber) => {
    try {
      const response = await api.get(`/bookings/recommendations/seats/${seatNumber}`, { 
        params: { scheduleId } 
      });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get recommendation details' };
    }
  },

  // Analyze seat preferences (client-side for now)
  analyzePreferences: async (preferences) => {
    try {
      // This could be a backend endpoint in the future
      return { 
        success: true, 
        data: {
          preferredSection: preferences.section || 'middle',
          windowPreference: preferences.windowSeat || true,
          adjacentPreference: preferences.adjacentSeat || 'empty',
          accessibilityPriority: preferences.accessibility || false,
          estimatedMatchScore: 85
        }
      };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to analyze preferences' };
    }
  },

  // Compare seats (client-side for now)
  compareSeats: async (seat1, seat2, seatLayout) => {
    try {
      const seat1Data = seatLayout.find(s => s.seatNumber === seat1);
      const seat2Data = seatLayout.find(s => s.seatNumber === seat2);
      
      if (!seat1Data || !seat2Data) {
        return { success: false, message: 'Seat not found' };
      }
      
      return { 
        success: true, 
        data: {
          seat1: seat1Data,
          seat2: seat2Data,
          comparison: {
            priceDifference: seat1Data.price - seat2Data.price,
            locationDifference: Math.abs(seat1Data.row - seat2Data.row),
            windowDifference: (seat1Data.windowSide !== seat2Data.windowSide),
            availabilityDifference: (seat1Data.type === seat2Data.type)
          }
        }
      };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to compare seats' };
    }
  }
};
