// Bus service
import api from './api';

export const busService = {
  // Search buses
  searchBuses: async (searchParams) => {
    try {
      const response = await api.get('/buses/search', { params: searchParams });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to search buses' };
    }
  },

  // Get bus details
  getBus: async (busId) => {
    try {
      const response = await api.get(`/buses/${busId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get bus details' };
    }
  },

  // Get seat layout
  getSeats: async (busId, scheduleId) => {
    try {
      const response = await api.get(`/buses/${busId}/seats`, { params: { scheduleId } });
      return response;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get seat layout' };
    }
  },

  // Get adjacent seat info
  getAdjacentSeat: async (busId, seatNumber) => {
    try {
      // This will be calculated from the seat layout on the frontend
      // or we can add a backend endpoint for this
      const response = await api.get(`/buses/${busId}/seats`);
      const seatLayout = response.data;
      const seat = seatLayout.find(s => s.seatNumber === seatNumber);
      
      if (seat && seat.adjacentSeat) {
        const adjacentSeat = seatLayout.find(s => s.seatNumber === seat.adjacentSeat);
        return {
          success: true,
          data: {
            adjacentSeatNumber: seat.adjacentSeat,
            adjacentSeatStatus: adjacentSeat ? adjacentSeat.type : 'unknown'
          }
        };
      }
      
      return { success: true, data: null };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get adjacent seat info' };
    }
  },

  // Filter buses (client-side filtering for now)
  filterBuses: async (buses, filters) => {
    let filtered = [...buses];
    
    if (filters.busType && filters.busType.length > 0) {
      filtered = filtered.filter(bus => 
        filters.busType.includes(bus.busType)
      );
    }
    
    if (filters.acType) {
      filtered = filtered.filter(bus => 
        filters.acType === 'ac' ? bus.busType.includes('AC') : 
        !bus.busType.includes('AC')
      );
    }
    
    if (filters.seatType) {
      filtered = filtered.filter(bus => 
        filters.seatType === 'sleeper' ? bus.busType.includes('Sleeper') : 
        !bus.busType.includes('Sleeper')
      );
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(bus => bus.fare >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(bus => bus.fare <= filters.maxPrice);
    }
    
    if (filters.minSeats) {
      filtered = filtered.filter(bus => bus.availableSeats >= filters.minSeats);
    }
    
    return { success: true, data: filtered };
  },

  // Sort buses (client-side sorting)
  sortBuses: async (buses, sortBy) => {
    const sorted = [...buses].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.fare - b.fare;
        case 'departure':
          return new Date(a.schedule.departure) - new Date(b.schedule.departure);
        case 'duration':
          return a.schedule.duration.localeCompare(b.schedule.duration);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    return { success: true, data: sorted };
  }
};
