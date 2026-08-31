const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  changeSeat,
  checkAvailability,
  getAvailableSeats,
  updateSmartSeatMonitoring,
  getSeatRecommendations,
  getRecommendationDetails,
  getRefundPreview
} = require('../controllers/bookingController');
const { authenticate, requirePassenger } = require('../middleware/auth');

router.post('/', authenticate, requirePassenger, createBooking);
router.get('/', authenticate, requirePassenger, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.get('/:id/refund-preview', authenticate, requirePassenger, getRefundPreview);
router.patch('/:id/cancel', authenticate, requirePassenger, cancelBooking);
router.post('/:id/change-seat', authenticate, requirePassenger, changeSeat);
router.post('/check-availability', authenticate, checkAvailability);
router.get('/available-seats/:scheduleId', authenticate, getAvailableSeats);
router.patch('/:id/smartseat-monitoring', authenticate, updateSmartSeatMonitoring);

// Recommendation routes
router.get('/recommendations/seats', authenticate, getSeatRecommendations);
router.get('/recommendations/seats/:seatNumber', authenticate, getRecommendationDetails);

module.exports = router;
