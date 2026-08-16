require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketService = require('./sockets/socketService');
const { releaseExpiredReservations } = require('./utils/seatUtils');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Release expired reservations every 5 minutes
setInterval(async () => {
  try {
    await releaseExpiredReservations();
  } catch (error) {
    console.error('Error releasing expired reservations:', error);
  }
}, 5 * 60 * 1000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

module.exports = server;
