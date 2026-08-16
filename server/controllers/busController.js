const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Seat = require('../models/Seat');
const { getAvailableSeats } = require('../utils/seatUtils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Search buses with filters
 * @route   GET /api/buses/search
 * @access  Public
 */
exports.searchBuses = asyncHandler(async (req, res, next) => {
  const { from, to, date, busType, acType, seatType, minPrice, maxPrice, minSeats } = req.query;

  // Build query
  const query = { isActive: true };

  // Get schedules matching the route and date
  const routeQuery = {};
  if (from) routeQuery.source = { $regex: from, $options: 'i' };
  if (to) routeQuery.destination = { $regex: to, $options: 'i' };

  const routes = await Route.find(routeQuery);
  const routeIds = routes.map(r => r._id);

  const scheduleQuery = {
    routeId: { $in: routeIds },
    isActive: true
  };

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    scheduleQuery.travelDate = {
      $gte: searchDate,
      $lt: nextDay
    };
  }

  let schedules = await Schedule.find(scheduleQuery)
    .populate('busId')
    .populate('routeId')
    .sort({ departureTime: 1 });

  // Apply filters
  if (busType && busType.length > 0) {
    schedules = schedules.filter(s => busType.includes(s.busId.busType));
  }

  if (acType) {
    schedules = schedules.filter(s => 
      acType === 'ac' ? s.busId.busType.includes('AC') : !s.busId.busType.includes('AC')
    );
  }

  if (seatType) {
    schedules = schedules.filter(s => 
      seatType === 'sleeper' ? s.busId.busType.includes('Sleeper') : !s.busId.busType.includes('Sleeper')
    );
  }

  if (minPrice) {
    schedules = schedules.filter(s => s.fare >= parseFloat(minPrice));
  }

  if (maxPrice) {
    schedules = schedules.filter(s => s.fare <= parseFloat(maxPrice));
  }

  if (minSeats) {
    schedules = schedules.filter(s => s.availableSeats >= parseInt(minSeats));
  }

  // Format response
  const results = schedules.map(schedule => ({
    id: schedule.busId._id,
    operator: schedule.busId.operatorName,
    busNumber: schedule.busId.busNumber,
    busType: schedule.busId.busType,
    route: {
      from: schedule.routeId.source,
      to: schedule.routeId.destination,
      distance: schedule.routeId.distance
    },
    schedule: {
      departure: `${schedule.travelDate.toISOString().split('T')[0]} ${schedule.departureTime}`,
      arrival: `${schedule.travelDate.toISOString().split('T')[0]} ${schedule.arrivalTime}`,
      duration: schedule.routeId.estimatedDuration
    },
    fare: schedule.fare,
    availableSeats: schedule.availableSeats,
    totalSeats: schedule.busId.seatConfiguration.totalSeats,
    amenities: schedule.busId.amenities,
    rating: schedule.busId.rating,
    scheduleId: schedule._id
  }));

  res.status(200).json({
    success: true,
    data: results
  });
});

/**
 * @desc    Get bus details
 * @route   GET /api/buses/:id
 * @access  Public
 */
exports.getBus = asyncHandler(async (req, res, next) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.status(200).json({
    success: true,
    data: bus
  });
});

/**
 * @desc    Get seats for a bus
 * @route   GET /api/buses/:id/seats
 * @access  Public
 */
exports.getBusSeats = asyncHandler(async (req, res, next) => {
  const { scheduleId } = req.query;

  if (!scheduleId) {
    return res.status(400).json({
      success: false,
      message: 'Schedule ID is required'
    });
  }

  const seats = await Seat.find({ scheduleId })
    .sort({ row: 1, column: 1 });

  const formattedSeats = seats.map(seat => ({
    id: seat._id,
    seatNumber: seat.seatNumber,
    row: seat.row,
    column: seat.column,
    type: seat.status,
    price: seat.price,
    isAisle: seat.seatType === 'aisle',
    adjacentSeat: seat.adjacentSeatNumbers[0] || null,
    windowSide: seat.seatType === 'window'
  }));

  res.status(200).json({
    success: true,
    data: formattedSeats
  });
});

/**
 * @desc    Get schedule details
 * @route   GET /api/schedules/:id
 * @access  Public
 */
exports.getSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('busId')
    .populate('routeId');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.status(200).json({
    success: true,
    data: schedule
  });
});

/**
 * @desc    Get all routes
 * @route   GET /api/routes
 * @access  Public
 */
exports.getRoutes = asyncHandler(async (req, res, next) => {
  const routes = await Route.find({ isActive: true })
    .sort({ source: 1, destination: 1 });

  res.status(200).json({
    success: true,
    data: routes
  });
});
