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

    const allowedOrigins = [
      // Local development
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',

      // Production Vercel frontend
      'https://smart-seat-liard.vercel.app',

      // Render environment variables
      process.env.SOCKET_CORS_ORIGIN,
      process.env.CLIENT_URL
    ].filter(Boolean);

    console.log('Socket.IO allowed origins:', allowedOrigins);

    this.io = new Server(httpServer, {
      cors: {
        origin: function (origin, callback) {
          // Allow requests without Origin
          if (!origin) {
            return callback(null, true);
          }

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          console.warn(
            `Socket.IO CORS blocked origin: ${origin}`
          );

          return callback(
            new Error(`Not allowed by Socket.IO CORS: ${origin}`)
          );
        },

        methods: ['GET', 'POST'],

        credentials: true
      },

      transports: ['websocket', 'polling']
    });

    // Make Socket.IO globally accessible
    global.socketIO = this.io;

    this.setupMiddleware();
    this.setupConnectionHandlers();

    console.log('Socket.IO initialized');
  }

  /**
   * Socket authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(
            new Error('Authentication error: token missing')
          );
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
          return next(
            new Error('User not found or inactive')
          );
        }

        socket.user = user;
        socket.userId = user._id.toString();

        next();
      } catch (error) {
        console.error(
          'Socket authentication error:',
          error.message
        );

        next(
          new Error('Authentication error')
        );
      }
    });
  }

  /**
   * Connection handlers
   */
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log(
        `User connected via Socket.IO: ${socket.userId}`
      );

      // User-specific room
      socket.join(`user:${socket.userId}`);

      // Join booking room
      socket.on('join:booking', (bookingId) => {
        if (!bookingId) return;

        socket.join(`booking:${bookingId}`);

        console.log(
          `User ${socket.userId} joined booking:${bookingId}`
        );
      });

      // Leave booking room
      socket.on('leave:booking', (bookingId) => {
        if (!bookingId) return;

        socket.leave(`booking:${bookingId}`);

        console.log(
          `User ${socket.userId} left booking:${bookingId}`
        );
      });

      // Seat selection updates
      socket.on('seat:selected', (data) => {
        if (!data?.bookingId) return;

        socket
          .to(`booking:${data.bookingId}`)
          .emit('seat:updated', data);
      });

      // Disconnect
      socket.on('disconnect', (reason) => {
        console.log(
          `User disconnected: ${socket.userId} (${reason})`
        );
      });
    });
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    if (!this.io) return;

    this.io
      .to(`user:${userId}`)
      .emit(event, data);
  }

  /**
   * Emit notification
   */
  emitNotification(userId, notification) {
    this.emitToUser(
      userId,
      'notification:new',
      notification
    );
  }

  /**
   * Emit seat update
   */
  emitSeatUpdate(bookingId, seatData) {
    if (!this.io) return;

    this.io
      .to(`booking:${bookingId}`)
      .emit('seat:updated', seatData);
  }

  /**
   * Connected users count
   */
  getConnectedUsersCount() {
    if (!this.io) {
      return 0;
    }

    return this.io.sockets.sockets.size;
  }
}

module.exports = new SocketService();