const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SeatChangeHistory = require('../models/SeatChangeHistory');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalBuses,
    activeBuses,
    totalPassengers,
    todayBookings,
    confirmedBookings,
    cancelledBookings,
    seatChanges,
    smartSeatNotifications,
    recentBookings,
    recentNotifications,
    popularRoutes
  ] = await Promise.all([
    Bus.countDocuments(),
    Bus.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'passenger' }),
    Booking.countDocuments({ createdAt: { $gte: today } }),
    Booking.countDocuments({ bookingStatus: 'confirmed' }),
    Booking.countDocuments({ bookingStatus: 'cancelled' }),
    SeatChangeHistory.countDocuments(),
    Notification.countDocuments({ type: 'adjacent_seat' }),
    Booking.find()
      .populate('userId', 'name email')
      .populate('busId', 'busNumber')
      .sort({ createdAt: -1 })
      .limit(5),
    Notification.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Booking.aggregate([
      {
        $group: {
          _id: '$routeId',
          bookings: { $sum: 1 },
          revenue: { $sum: '$fare' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ])
  ]);

  const routePerformance = await Route.populate(popularRoutes, { path: '_id', model: 'Route' });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalBuses,
        activeBuses,
        totalPassengers,
        todayBookings,
        confirmedBookings,
        cancelledBookings,
        seatChanges,
        smartSeatNotifications
      },
      recentBookings: recentBookings.map(b => ({
        id: b.bookingId,
        passenger: b.userId.name,
        bus: b.busId.busNumber,
        seat: b.seatNumber,
        amount: b.fare,
        status: b.bookingStatus,
        createdAt: b.createdAt
      })),
      recentNotifications: recentNotifications.map(n => ({
        id: n._id,
        recipient: n.userId.name,
        message: n.message,
        type: n.type,
        read: n.read,
        time: n.createdAt
      })),
      popularRoutes: routePerformance.map(r => ({
        from: r._id.source,
        to: r._id.destination,
        bookings: r.bookings,
        revenue: r.revenue
      }))
    }
  });
});

/**
 * @desc    Get all buses (admin)
 * @route   GET /api/admin/buses
 * @access  Private/Admin
 */
exports.getBuses = asyncHandler(async (req, res, next) => {
  const buses = await Bus.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: buses
  });
});

/**
 * @desc    Create bus
 * @route   POST /api/admin/buses
 * @access  Private/Admin
 */
exports.createBus = asyncHandler(async (req, res, next) => {
  const bus = await Bus.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Bus created successfully',
    data: bus
  });
});

/**
 * @desc    Update bus
 * @route   PATCH /api/admin/buses/:id
 * @access  Private/Admin
 */
exports.updateBus = asyncHandler(async (req, res, next) => {
  const bus = await Bus.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bus updated successfully',
    data: bus
  });
});

/**
 * @desc    Delete bus
 * @route   DELETE /api/admin/buses/:id
 * @access  Private/Admin
 */
exports.deleteBus = asyncHandler(async (req, res, next) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bus deleted successfully'
  });
});

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
exports.getBookings = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = {};
  if (status) query.bookingStatus = status;

  const bookings = await Booking.find(query)
    .populate('userId', 'name email phone')
    .populate('busId', 'busNumber operatorName')
    .populate('scheduleId', 'travelDate departureTime')
    .sort({ createdAt: -1 });

  const formattedBookings = bookings.map(b => ({
    id: b.bookingId,
    passengerName: b.passengerDetails.name,
    busNumber: b.busId.busNumber,
    seat: b.seatNumber,
    date: b.scheduleId?.travelDate?.toISOString().split('T')[0] || 'N/A',
    amount: b.fare,
    status: b.bookingStatus,
    smartSeatMonitoring: b.smartSeatMonitoring
  }));

  res.status(200).json({
    success: true,
    data: formattedBookings
  });
});

/**
 * @desc    Get all passengers (admin)
 * @route   GET /api/admin/passengers
 * @access  Private/Admin
 */
exports.getPassengers = asyncHandler(async (req, res, next) => {
  const passengers = await User.find({ role: 'passenger' })
    .select('-password')
    .sort({ createdAt: -1 });

  const formattedPassengers = await Promise.all(passengers.map(async (p) => {
    const bookingCount = await Booking.countDocuments({ userId: p._id });
    const activeBookingCount = await Booking.countDocuments({ 
      userId: p._id, 
      bookingStatus: 'confirmed' 
    });

    return {
      id: p._id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      totalBookings: bookingCount,
      activeBookings: activeBookingCount,
      smartSeatEnabled: true, // Will be updated with preference check
      createdAt: p.createdAt
    };
  }));

  res.status(200).json({
    success: true,
    data: formattedPassengers
  });
});

/**
 * @desc    Get notifications (admin)
 * @route   GET /api/admin/notifications
 * @access  Private/Admin
 */
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { type, read } = req.query;

  const query = {};
  if (type) query.type = type;
  if (read !== undefined) query.read = read === 'true';

  const notifications = await Notification.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

  const formattedNotifications = notifications.map(n => ({
    id: n._id,
    type: n.type,
    recipient: n.userId.name,
    message: n.message,
    read: n.read,
    time: n.createdAt
  }));

  res.status(200).json({
    success: true,
    data: formattedNotifications
  });
});

/**
 * @desc    Get analytics (admin)
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query;

  let startDate;
  const now = new Date();

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [bookings, bookingsData, smartSeatData] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: startDate } }),
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$fare' },
          seatChanges: { $sum: { $cond: [{ $eq: ['$metadata.seatChange', true] }, 1, 0] } }
        }
      }
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate }, smartSeatMonitoring: true } },
      { $count: 'smartSeatBookings' }
    ])
  ]);

  const totalRevenue = bookingsData[0]?.revenue || 0;
  const seatChanges = bookingsData[0]?.seatChanges || 0;
  const smartSeatBookings = smartSeatData[0]?.smartSeatBookings || 0;

  // Get passenger growth
  const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
  const [currentPassengers, previousPassengers] = await Promise.all([
    User.countDocuments({ 
      role: 'passenger', 
      createdAt: { $gte: startDate } 
    }),
    User.countDocuments({ 
      role: 'passenger', 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    })
  ]);

  const passengerGrowth = previousPassengers > 0 
    ? Math.round(((currentPassengers - previousPassengers) / previousPassengers) * 100)
    : 0;

  const smartSeatAdoption = bookings > 0 
    ? Math.round((smartSeatBookings / bookings) * 100)
    : 0;

  // Get route performance
  const routeData = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$routeId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$fare' }
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);

  const routePerformance = await Route.populate(routeData, { path: '_id', model: 'Route' });

  res.status(200).json({
    success: true,
    data: {
      revenue: totalRevenue,
      bookings,
      seatChanges,
      passengerGrowth,
      smartSeatAdoption,
      routePerformance: routePerformance.map(r => ({
        from: r._id.source,
        to: r._id.destination,
        bookings: r.bookings,
        revenue: r.revenue
      }))
    }
  });
});

/**
 * @desc    Get admin settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
exports.getSettings = asyncHandler(async (req, res, next) => {
  // For now, return default settings
  // In production, this would be stored in database
  res.status(200).json({
    success: true,
    data: {
      siteName: 'SmartSeat',
      supportEmail: 'support@smartseat.com',
      supportPhone: '+91 1800-123-4567',
      enableSmartSeat: true,
      enableRecommendations: true,
      enableNotifications: true,
      maxSeatChanges: 3,
      seatChangeCutoffHours: 24
    }
  });
});

/**
 * @desc    Update admin settings
 * @route   PATCH /api/admin/settings
 * @access  Private/Admin
 */
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // For now, just return success
  // In production, this would update database
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: req.body
  });
});

/**
 * @desc    Create route
 * @route   POST /api/admin/routes
 * @access  Private/Admin
 */
exports.createRoute = asyncHandler(async (req, res, next) => {
  const route = await Route.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Route created successfully',
    data: route
  });
});

/**
 * @desc    Update route
 * @route   PATCH /api/admin/routes/:id
 * @access  Private/Admin
 */
exports.updateRoute = asyncHandler(async (req, res, next) => {
  const route = await Route.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Route updated successfully',
    data: route
  });
});

/**
 * @desc    Delete route
 * @route   DELETE /api/admin/routes/:id
 * @access  Private/Admin
 */
exports.deleteRoute = asyncHandler(async (req, res, next) => {
  const route = await Route.findByIdAndDelete(req.params.id);

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Route deleted successfully'
  });
});

/**
 * @desc    Create schedule
 * @route   POST /api/admin/schedules
 * @access  Private/Admin
 */
exports.createSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await Schedule.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Schedule created successfully',
    data: schedule
  });
});

/**
 * @desc    Update schedule
 * @route   PATCH /api/admin/schedules/:id
 * @access  Private/Admin
 */
exports.updateSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Schedule updated successfully',
    data: schedule
  });
});

/**
 * @desc    Delete schedule
 * @route   DELETE /api/admin/schedules/:id
 * @access  Private/Admin
 */
exports.deleteSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully'
  });
});
