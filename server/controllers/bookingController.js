const bookingService = require('../services/bookingService');
const recommendationService = require('../services/recommendationService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = asyncHandler(async (req, res, next) => {
  const bookingData = {
    ...req.body,
    userId: req.user.id
  };

  const result = await bookingService.createBooking(bookingData);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: result.data
  });
});

/**
 * @desc    Get all bookings for current user
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filters = status ? { status } : {};

  const result = await bookingService.getUserBookings(req.user.id, filters);

  res.status(200).json({
    success: true,
    data: result.data
  });
});

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = asyncHandler(async (req, res, next) => {
  const result = await bookingService.getBookingById(req.params.id);

  // Check ownership
  if (result.data.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

/**
 * @desc    Cancel booking
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const result = await bookingService.cancelBooking(
    req.params.id,
    req.user.id,
    reason || 'User requested cancellation'
  );

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: result.data
  });
});

/**
 * @desc    Change seat for booking
 * @route   POST /api/bookings/:id/change-seat
 * @access  Private
 */
exports.changeSeat = asyncHandler(async (req, res, next) => {
  const { newSeatNumber } = req.body;

  const result = await bookingService.changeSeat(
    req.params.id,
    newSeatNumber,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Seat changed successfully',
    data: result.data
  });
});

/**
 * @desc    Check seat availability
 * @route   POST /api/bookings/check-availability
 * @access  Private
 */
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const { scheduleId, seatNumber } = req.body;

  const result = await bookingService.checkSeatAvailability(scheduleId, seatNumber);

  res.status(200).json(result);
});

/**
 * @desc    Get available seats for schedule
 * @route   GET /api/bookings/available-seats/:scheduleId
 * @access  Private
 */
exports.getAvailableSeats = asyncHandler(async (req, res, next) => {
  const result = await bookingService.getAvailableSeats(req.params.scheduleId);

  res.status(200).json(result);
});

/**
 * @desc    Update SmartSeat monitoring
 * @route   PATCH /api/bookings/:id/smartseat-monitoring
 * @access  Private
 */
exports.updateSmartSeatMonitoring = asyncHandler(async (req, res, next) => {
  const { enabled } = req.body;

  const result = await bookingService.updateSmartSeatMonitoring(
    req.params.id,
    enabled
  );

  res.status(200).json({
    success: true,
    message: 'SmartSeat monitoring updated',
    data: result.data
  });
});

/**
 * @desc    Get seat recommendations
 * @route   GET /api/recommendations/seats
 * @access  Private
 */
exports.getSeatRecommendations = asyncHandler(async (req, res, next) => {
  const { scheduleId, currentSeat } = req.query;

  const result = await recommendationService.getSeatRecommendations(
    scheduleId,
    currentSeat,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get recommendation details
 * @route   GET /api/recommendations/seats/:seatNumber
 * @access  Private
 */
exports.getRecommendationDetails = asyncHandler(async (req, res, next) => {
  const { scheduleId } = req.query;

  const result = await recommendationService.getRecommendationDetails(
    scheduleId,
    req.params.seatNumber,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});
