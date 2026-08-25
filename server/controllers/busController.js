const mongoose = require('mongoose');

const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Seat = require('../models/Seat');

const asyncHandler = require('../utils/asyncHandler');

// ============================================================
// SEARCH BUSES
// GET /api/buses/search
// ============================================================

exports.searchBuses = asyncHandler(async (req, res) => {
  const {
    from,
    to,
    date,
    busType,
    acType,
    seatType,
    minPrice,
    maxPrice,
    minSeats
  } = req.query;

  const routeQuery = {};

  if (from) {
    routeQuery.source = {
      $regex: from,
      $options: 'i'
    };
  }

  if (to) {
    routeQuery.destination = {
      $regex: to,
      $options: 'i'
    };
  }

  const routes = await Route.find(routeQuery);

  const routeIds = routes.map((route) => route._id);

  if (routeIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  const scheduleQuery = {
    routeId: {
      $in: routeIds
    },
    isActive: true
  };

  if (date) {
    // Parse the date string as UTC midnight to match how the seed stores dates.
    // "2026-08-25" → new Date("2026-08-25") = 2026-08-25T00:00:00.000Z
    // Query covers the full UTC day: 00:00:00 ≤ travelDate ≤ 23:59:59
    const searchDate = new Date(date);

    if (!Number.isNaN(searchDate.getTime())) {
      const dayStart = new Date(searchDate);
      dayStart.setUTCHours(0, 0, 0, 0);

      const dayEnd = new Date(searchDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      scheduleQuery.travelDate = {
        $gte: dayStart,
        $lte: dayEnd
      };
    }
  }

  let schedules = await Schedule.find(scheduleQuery)
    .populate('busId')
    .populate('routeId')
    .sort({
      departureTime: 1
    });

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  if (busType && busType.length > 0) {
    schedules = schedules.filter(
      (schedule) =>
        schedule.busId &&
        busType.includes(schedule.busId.busType)
    );
  }

  if (acType) {
    schedules = schedules.filter((schedule) => {
      const type =
        schedule.busId?.busType?.toUpperCase() || '';

      return acType === 'ac'
        ? type.includes('AC')
        : !type.includes('AC');
    });
  }

  if (seatType) {
    schedules = schedules.filter((schedule) => {
      const type =
        schedule.busId?.busType?.toUpperCase() || '';

      return seatType === 'sleeper'
        ? type.includes('SLEEPER')
        : !type.includes('SLEEPER');
    });
  }

  if (minPrice !== undefined && minPrice !== '') {
    schedules = schedules.filter(
      (schedule) =>
        schedule.fare >= Number(minPrice)
    );
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    schedules = schedules.filter(
      (schedule) =>
        schedule.fare <= Number(maxPrice)
    );
  }

  if (minSeats !== undefined && minSeats !== '') {
    schedules = schedules.filter(
      (schedule) =>
        schedule.availableSeats >= Number(minSeats)
    );
  }

  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  const results = schedules
    .filter(
      (schedule) =>
        schedule.busId &&
        schedule.routeId
    )
    .map((schedule) => ({
      id: schedule.busId._id,

      operator: schedule.busId.operatorName,

      busNumber: schedule.busId.busNumber,

      busType: schedule.busId.busType,

      route: {
        from: schedule.routeId.source,
        to: schedule.routeId.destination,
        source: schedule.routeId.source,
        destination: schedule.routeId.destination,
        distance: schedule.routeId.distance,
        estimatedDuration:
          schedule.routeId.estimatedDuration
      },

      schedule: {
        departure:
          `${schedule.travelDate
            .toISOString()
            .split('T')[0]}T${schedule.departureTime}`,

        arrival:
          `${schedule.travelDate
            .toISOString()
            .split('T')[0]}T${schedule.arrivalTime}`,

        departureTime: schedule.departureTime,

        arrivalTime: schedule.arrivalTime,

        duration:
          schedule.routeId.estimatedDuration,

        fare: schedule.fare
      },

      travelDate: schedule.travelDate,

      departureTime: schedule.departureTime,

      arrivalTime: schedule.arrivalTime,

      fare: schedule.fare,

      availableSeats:
        schedule.availableSeats,

      totalSeats:
        schedule.busId.seatConfiguration.totalSeats,

      seatConfiguration:
        schedule.busId.seatConfiguration,

      amenities:
        schedule.busId.amenities,

      boardingPoints:
        schedule.busId.boardingPoints,

      droppingPoints:
        schedule.busId.droppingPoints,

      rating:
        schedule.busId.rating,

      scheduleId: schedule._id
    }));

  return res.status(200).json({
    success: true,
    data: results
  });
});

// ============================================================
// GET BUS
// GET /api/buses/:id
// ============================================================

exports.getBus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bus ID'
    });
  }

  const bus = await Bus.findById(id);

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: bus
  });
});

// ============================================================
// GET BUS SEATS
// GET /api/buses/:id/seats?scheduleId=...
// ============================================================

exports.getBusSeats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduleId } = req.query;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bus ID'
    });
  }

  if (!scheduleId) {
    return res.status(400).json({
      success: false,
      message: 'Schedule ID is required'
    });
  }

  if (!mongoose.isValidObjectId(scheduleId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid schedule ID'
    });
  }

  const bus = await Bus.findById(id);

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  const schedule = await Schedule.findById(scheduleId);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  if (schedule.busId.toString() !== id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Schedule does not belong to this bus'
    });
  }

  await Seat.releaseExpiredReservations();

  const seats = await Seat.find({
    scheduleId,
    busId: id
  }).sort({
    row: 1,
    column: 1
  });

  // For booked seats, fetch the associated booking to get passenger gender.
  // This lets the frontend show gender-based seat colors without exposing
  // any other passenger personal data.
  const bookedSeatIds = seats
    .filter((s) => s.status === 'booked' && s.bookingId)
    .map((s) => s.bookingId);

  const bookingGenderMap = {};
  if (bookedSeatIds.length > 0) {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find(
      { _id: { $in: bookedSeatIds } },
      { _id: 1, 'passengerDetails.gender': 1 }
    ).lean();
    bookings.forEach((b) => {
      bookingGenderMap[b._id.toString()] =
        b.passengerDetails?.gender || 'other';
    });
  }

  const formattedSeats = seats.map((seat) => {
    const passengerGender =
      seat.status === 'booked' && seat.bookingId
        ? bookingGenderMap[seat.bookingId.toString()] || 'other'
        : null;

    return {
      id: seat._id,

      seatNumber: seat.seatNumber,

      row: seat.row,

      column: seat.column,

      type: seat.status,

      price: seat.price,

      isAisle: seat.seatType === 'aisle',

      windowSide: seat.seatType === 'window',

      seatType: seat.seatType,

      position: seat.position,

      adjacentSeat:
        Array.isArray(seat.adjacentSeatNumbers) &&
        seat.adjacentSeatNumbers.length > 0
          ? seat.adjacentSeatNumbers[0]
          : null,

      // passengerGender is only present on booked seats.
      // Values: 'male' | 'female' | 'other' | null
      passengerGender
    };
  });

  return res.status(200).json({
    success: true,

    data: formattedSeats,

    meta: {
      busId: id,

      scheduleId,

      totalSeats: formattedSeats.length,

      availableSeats:
        formattedSeats.filter(
          (seat) => seat.type === 'available'
        ).length
    }
  });
});

// ============================================================
// GET SCHEDULE
// GET /api/schedules/:id
// ============================================================

exports.getSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid schedule ID'
    });
  }

  const schedule = await Schedule.findById(id)
    .populate('busId')
    .populate('routeId');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: schedule
  });
});

// ============================================================
// GET ROUTES
// GET /api/buses/routes
// ============================================================

exports.getRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({
    isActive: true
  }).sort({
    source: 1,
    destination: 1
  });

  return res.status(200).json({
    success: true,
    data: routes
  });
});