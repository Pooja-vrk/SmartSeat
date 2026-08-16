// Bus service
import api from './api';

export const busService = {
  // ==========================================================
  // SEARCH BUSES
  // ==========================================================

  searchBuses: async (searchParams = {}) => {
    try {
      const response = await api.get(
        '/buses/search',
        {
          params: searchParams
        }
      );

      return response;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Failed to search buses'
        }
      );
    }
  },

  // ==========================================================
  // GET BUS DETAILS
  // ==========================================================

  getBus: async (busId) => {
    try {
      if (!busId) {
        return {
          success: false,
          message: 'Bus ID is required'
        };
      }

      const response = await api.get(
        `/buses/${busId}`
      );

      return response;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Failed to get bus details'
        }
      );
    }
  },

  // ==========================================================
  // GET REAL SEAT LAYOUT
  // ==========================================================

  getSeats: async (
    busId,
    scheduleId
  ) => {
    try {
      if (!busId) {
        return {
          success: false,
          message: 'Bus ID is required'
        };
      }

      if (!scheduleId) {
        return {
          success: false,
          message: 'Schedule ID is required'
        };
      }

      const response = await api.get(
        `/buses/${busId}/seats`,
        {
          params: {
            scheduleId
          }
        }
      );

      return {
        success: true,
        data: Array.isArray(response?.data)
          ? response.data
          : []
      };
    } catch (error) {
      console.error(
        'Failed to load seat layout:',
        error
      );

      throw (
        error.response?.data || {
          success: false,
          message: 'Failed to get seat layout'
        }
      );
    }
  },

  // ==========================================================
  // GET ADJACENT SEAT
  // ==========================================================

  getAdjacentSeat: async (
    busId,
    scheduleId,
    seatNumber
  ) => {
    try {
      if (!busId) {
        return {
          success: false,
          message: 'Bus ID is required'
        };
      }

      if (!scheduleId) {
        return {
          success: false,
          message: 'Schedule ID is required'
        };
      }

      if (!seatNumber) {
        return {
          success: false,
          message: 'Seat number is required'
        };
      }

      const response = await api.get(
        `/buses/${busId}/seats`,
        {
          params: {
            scheduleId
          }
        }
      );

      const seats = Array.isArray(response?.data)
        ? response.data
        : [];

      const seat = seats.find(
        (item) =>
          item.seatNumber === seatNumber
      );

      if (!seat?.adjacentSeat) {
        return {
          success: true,
          data: null
        };
      }

      const adjacentSeat = seats.find(
        (item) =>
          item.seatNumber ===
          seat.adjacentSeat
      );

      return {
        success: true,
        data: {
          adjacentSeatNumber:
            seat.adjacentSeat,

          adjacentSeatStatus:
            adjacentSeat?.type || 'unknown'
        }
      };
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            'Failed to get adjacent seat information'
        }
      );
    }
  },

  // ==========================================================
  // FILTER BUSES
  // ==========================================================

  filterBuses: async (
    buses = [],
    filters = {}
  ) => {
    let filtered = [...buses];

    if (
      Array.isArray(filters.busType) &&
      filters.busType.length > 0
    ) {
      filtered = filtered.filter(
        (bus) =>
          filters.busType.includes(
            bus.busType
          )
      );
    }

    if (filters.acType) {
      filtered = filtered.filter((bus) => {
        const type =
          bus.busType?.toUpperCase() || '';

        return filters.acType === 'ac'
          ? type.includes('AC')
          : !type.includes('AC');
      });
    }

    if (filters.seatType) {
      filtered = filtered.filter((bus) => {
        const type =
          bus.busType?.toUpperCase() || '';

        return filters.seatType === 'sleeper'
          ? type.includes('SLEEPER')
          : !type.includes('SLEEPER');
      });
    }

    if (
      filters.minPrice !== '' &&
      filters.minPrice !== undefined
    ) {
      filtered = filtered.filter(
        (bus) =>
          Number(bus.fare) >=
          Number(filters.minPrice)
      );
    }

    if (
      filters.maxPrice !== '' &&
      filters.maxPrice !== undefined
    ) {
      filtered = filtered.filter(
        (bus) =>
          Number(bus.fare) <=
          Number(filters.maxPrice)
      );
    }

    if (
      filters.minSeats !== '' &&
      filters.minSeats !== undefined
    ) {
      filtered = filtered.filter(
        (bus) =>
          Number(bus.availableSeats) >=
          Number(filters.minSeats)
      );
    }

    return {
      success: true,
      data: filtered
    };
  },

  // ==========================================================
  // SORT BUSES
  // ==========================================================

  sortBuses: async (
    buses = [],
    sortBy
  ) => {
    const sorted = [...buses].sort(
      (a, b) => {
        switch (sortBy) {
          case 'price':
            return (
              Number(a.fare || 0) -
              Number(b.fare || 0)
            );

          case 'departure':
            return (
              new Date(
                a.schedule?.departure || 0
              ) -
              new Date(
                b.schedule?.departure || 0
              )
            );

          case 'rating':
            return (
              Number(b.rating || 0) -
              Number(a.rating || 0)
            );

          case 'duration':
            return String(
              a.schedule?.duration ||
                a.route?.estimatedDuration ||
                ''
            ).localeCompare(
              String(
                b.schedule?.duration ||
                  b.route?.estimatedDuration ||
                  ''
              )
            );

          default:
            return 0;
        }
      }
    );

    return {
      success: true,
      data: sorted
    };
  }
};