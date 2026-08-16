// Socket.IO service for real-time updates
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5003';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.connected = false;
  }

  // Initialize socket connection
  connect(userId, token) {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Connecting to Socket.IO at:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners = {};
    }
  }

  // Join booking room
  joinBookingRoom(bookingId) {
    if (this.socket) {
      this.socket.emit('join:booking', bookingId);
    }
  }

  // Leave booking room
  leaveBookingRoom(bookingId) {
    if (this.socket) {
      this.socket.emit('leave:booking', bookingId);
    }
  }

  // Subscribe to seat updates
  subscribeToSeatUpdates(callback) {
    if (this.socket) {
      this.socket.on('seat:updated', callback);
    }
  }

  // Subscribe to adjacent seat changes (SmartSeat)
  subscribeToAdjacentSeatChanges(callback) {
    if (this.socket) {
      this.socket.on('smartseat:adjacent-seat-booked', callback);
    }
  }

  // Subscribe to notifications
  subscribeToNotifications(callback) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
    }
  }

  // Subscribe to booking updates
  subscribeToBookingUpdates(callback) {
    if (this.socket) {
      this.socket.on('booking:updated', callback);
    }
  }

  // Unsubscribe from events
  unsubscribe(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Emit seat selection
  emitSeatSelected(bookingId, seatData) {
    if (this.socket) {
      this.socket.emit('seat:selected', { bookingId, ...seatData });
    }
  }

  // Get connection status
  isConnected() {
    return this.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Export hook for React components
export const useSocket = () => {
  return {
    connect: socketService.connect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
    joinBookingRoom: socketService.joinBookingRoom.bind(socketService),
    leaveBookingRoom: socketService.leaveBookingRoom.bind(socketService),
    subscribeToSeatUpdates: socketService.subscribeToSeatUpdates.bind(socketService),
    subscribeToAdjacentSeatChanges: socketService.subscribeToAdjacentSeatChanges.bind(socketService),
    subscribeToNotifications: socketService.subscribeToNotifications.bind(socketService),
    subscribeToBookingUpdates: socketService.subscribeToBookingUpdates.bind(socketService),
    unsubscribe: socketService.unsubscribe.bind(socketService),
    emitSeatSelected: socketService.emitSeatSelected.bind(socketService),
    isConnected: socketService.isConnected.bind(socketService),
    getSocket: socketService.getSocket.bind(socketService)
  };
};
