const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Socket.IO Service - Handles real-time communication
 */
class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.IO
   * @param {Object} httpServer - HTTP server instance
   */
  initialize(httpServer) {
    const { Server } = require('socket.io');
    
    // Use the same origin allowlist as Express CORS
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL
    ].filter(Boolean);
    
    this.io = new Server(httpServer, {
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          
          if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Make io globally accessible for SmartSeat service
    global.socketIO = this.io;

    this.setupMiddleware();
    this.setupConnectionHandlers();
    
    console.log('Socket.IO initialized');
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  /**
   * Setup connection handlers
   */
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);

      // Join user-specific room
      socket.join(`user:${socket.userId}`);

      // Handle joining booking-specific room
      socket.on('join:booking', (bookingId) => {
        socket.join(`booking:${bookingId}`);
      });

      // Handle leaving booking-specific room
      socket.on('leave:booking', (bookingId) => {
        socket.leave(`booking:${bookingId}`);
      });

      // Handle seat selection updates
      socket.on('seat:selected', (data) => {
        socket.to(`booking:${data.bookingId}`).emit('seat:updated', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });
  }

  /**
   * Emit SmartSeat event to specific user
   * @param {String} userId - User ID
   * @param {String} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  /**
   * Emit notification to user
   * @param {String} userId - User ID
   * @param {Object} notification - Notification data
   */
  emitNotification(userId, notification) {
    this.emitToUser(userId, 'notification:new', notification);
  }

  /**
   * Emit seat update to booking room
   * @param {String} bookingId - Booking ID
   * @param {Object} seatData - Seat data
   */
  emitSeatUpdate(bookingId, seatData) {
    if (this.io) {
      this.io.to(`booking:${bookingId}`).emit('seat:updated', seatData);
    }
  }

  /**
   * Get connected users count
   * @returns {Number} Connected users count
   */
  getConnectedUsersCount() {
    if (this.io) {
      return this.io.sockets.sockets.size;
    }
    return 0;
  }
}

module.exports = new SocketService();
