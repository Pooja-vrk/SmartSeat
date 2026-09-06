require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketService = require('./sockets/socketService');
const { releaseExpiredReservations, migrateSleeperSeatNumbers } = require('./utils/seatUtils');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other Node process using this port, then start the backend once.`
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  try {
    await migrateSleeperSeatNumbers();
  } catch (error) {
    console.error('Sleeper berth label migration failed:', error);
  }
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
