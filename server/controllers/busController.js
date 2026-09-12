const mongoose = require('mongoose');

const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Seat = require('../models/Seat');
const SmartSeatPreference = require('../models/SmartSeatPreference');

const asyncHandler = require('../utils/asyncHandler');
const { generateSeatLayout } = require('../utils/seatUtils');

const MAX_SCHEDULE_HORIZON_DAYS = 365;

const utcDayBounds = (dateValue) => {
  if (!dateValue) return null;
  let searchDate;

  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim();
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
      const year = parseInt(ddmmyyyyMatch[3], 10);
      searchDate = new Date(Date.UTC(year, month, day));
    } else {
      const yyyymmddMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (yyyymmddMatch) {
        const year = parseInt(yyyymmddMatch[1], 10);
        const month = parseInt(yyyymmddMatch[2], 10) - 1;
        const day = parseInt(yyyymmddMatch[3], 10);
        searchDate = new Date(Date.UTC(year, month, day));
      }
    }
  }

  if (!searchDate || Number.isNaN(searchDate.getTime())) {
    searchDate = new Date(dateValue);
  }
  if (Number.isNaN(searchDate.getTime())) return null;

  const dayStart = new Date(searchDate);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(searchDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  return { dayStart, dayEnd, searchDate };
};

const isPastUtcDay = (dayStart) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return dayStart < today;
};

const isBeyondHorizon = (dayStart) => {
  const limit = new Date();
  limit.setUTCHours(0, 0, 0, 0);
  limit.setUTCDate(limit.getUTCDate() + MAX_SCHEDULE_HORIZON_DAYS);
  return dayStart > limit;
};

/**
 * Clone existing route services onto a requested future date when that date
 * has no schedules yet. Each cloned schedule gets its own seat documents so
 * bookings never leak across dates.
 */
const ensureSchedulesForDate = async (routeIds, dateValue) => {
  const bounds = utcDayBounds(dateValue);
  if (!bounds || !routeIds || !routeIds.length) return;

  const { dayStart, dayEnd } = bounds;
  if (isPastUtcDay(dayStart) || isBeyondHorizon(dayStart)) return;

  // 1. Check existing schedules for these routes on this travel date
  const existing = await Schedule.find({
    routeId: { $in: routeIds },
    isActive: true,
    travelDate: { $gte: dayStart, $lte: dayEnd }
  }).select('_id busId routeId departureTime fare');

  // Verify seat inventories exist for existing schedules
  for (const s of existing) {
    const seatCount = await Seat.countDocuments({ scheduleId: s._id });
    if (seatCount === 0 && s.busId) {
      const bus = await Bus.findById(s.busId);
      if (bus && bus.seatConfiguration) {
        await generateSeatLayout(
          bus._id,
          s._id,
          bus.seatConfiguration,
          bus.busType,
          s.fare || 500
        );
      }
    }
  }

  const existingKeys = new Set(
    existing.map((s) => `${s.routeId.toString()}_${s.busId.toString()}_${s.departureTime}`)
  );

  // 2. Fetch template schedules for each route
  const templates = await Schedule.find({
    routeId: { $in: routeIds },
    isActive: true
  })
    .populate('busId')
    .sort({ travelDate: 1 });

  const uniqueTemplates = new Map();
  const routesWithTemplates = new Set();

  for (const tmpl of templates) {
    if (!tmpl.busId?._id) continue;
    const rId = tmpl.routeId.toString();
    const key = `${rId}_${tmpl.busId._id.toString()}_${tmpl.departureTime}`;
    routesWithTemplates.add(rId);
    if (!uniqueTemplates.has(key)) {
      uniqueTemplates.set(key, tmpl);
    }
  }

  // 3. Create missing schedules from templates
  for (const [key, tmpl] of uniqueTemplates.entries()) {
    if (existingKeys.has(key)) continue;

    const bus = tmpl.busId;
    const totalSeats = bus.seatConfiguration?.totalSeats || 36;

    const created = await Schedule.create({
      busId: bus._id,
      routeId: tmpl.routeId,
      departureTime: tmpl.departureTime,
      arrivalTime: tmpl.arrivalTime,
      travelDate: dayStart,
      fare: tmpl.fare,
      isActive: true,
      availableSeats: totalSeats
    });

    await generateSeatLayout(
      bus._id,
      created._id,
      bus.seatConfiguration,
      bus.busType,
      tmpl.fare
    );

    existingKeys.add(key);
  }

  // 4. For any route that has NO existing templates at all, dynamically provision a default service
  for (const rId of routeIds) {
    const rIdStr = rId.toString();
    const hasAnyScheduleOnDate = Array.from(existingKeys).some((k) => k.startsWith(`${rIdStr}_`));
    if (!hasAnyScheduleOnDate) {
      const defaultBus = await Bus.findOne({ isActive: true });
      if (defaultBus) {
        const totalSeats = defaultBus.seatConfiguration?.totalSeats || 36;
        const fare = 500;
        const created = await Schedule.create({
          busId: defaultBus._id,
          routeId: rId,
          departureTime: '21:00',
          arrivalTime: '06:00',
          travelDate: dayStart,
          fare,
          isActive: true,
          availableSeats: totalSeats
        });

        await generateSeatLayout(
          defaultBus._id,
          created._id,
          defaultBus.seatConfiguration,
          defaultBus.busType,
          fare
        );

        existingKeys.add(`${rIdStr}_${defaultBus._id.toString()}_21:00`);
      }
    }
  }
};

/**
 * Normalize and sort route stops into a complete, ordered sequence.
 */
const normalizeRouteStops = (route) => {
  if (!route) return [];

  // If route.stops has structured stop objects with sequence
  if (
    Array.isArray(route.stops) &&
    route.stops.length > 0 &&
    typeof route.stops[0] === 'object' &&
    route.stops[0] !== null &&
    route.stops[0].name
  ) {
    const sorted = [...route.stops].sort(
      (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0)
    );
    return sorted.map((s, idx) => {
      const type = s.type || (idx === 0 ? 'pickup' : idx === sorted.length - 1 ? 'drop' : 'both');
      const isBoarding = s.isBoarding !== undefined ? Boolean(s.isBoarding) : (type === 'pickup' || type === 'both' || idx < sorted.length - 1);
      const isDropping = s.isDropping !== undefined ? Boolean(s.isDropping) : (type === 'drop' || type === 'both' || idx > 0);
      return {
        stopId: s._id || s.stopId || null,
        _id: s._id || s.stopId || null,
        name: s.name ? String(s.name).trim() : '',
        city: s.city ? String(s.city).trim() : (s.name ? String(s.name).trim() : ''),
        type,
        isBoarding,
        isDropping,
        sequence: Number(s.sequence) || (idx + 1),
        arrivalTime: s.arrivalTime || null,
        departureTime: s.departureTime || null
      };
    });
  }

  // If route.stops is an array of strings or empty
  const rawStops = Array.isArray(route.stops)
    ? route.stops
        .map((s) => (typeof s === 'string' ? s.trim() : (s?.name ? String(s.name).trim() : '')))
        .filter(Boolean)
    : [];

  const stopsList = [];
  let seq = 1;

  const sourceName = route.source ? route.source.trim() : 'Origin';
  stopsList.push({
    stopId: null,
    _id: null,
    name: sourceName,
    city: sourceName,
    type: 'pickup',
    isBoarding: true,
    isDropping: false,
    sequence: seq++,
    arrivalTime: null,
    departureTime: null
  });

  for (const stopName of rawStops) {
    if (
      stopName.toLowerCase() !== sourceName.toLowerCase() &&
      stopName.toLowerCase() !== (route.destination || '').trim().toLowerCase()
    ) {
      stopsList.push({
        stopId: null,
        _id: null,
        name: stopName,
        city: stopName,
        type: 'both',
        isBoarding: true,
        isDropping: true,
        sequence: seq++,
        arrivalTime: null,
        departureTime: null
      });
    }
  }

  const destName = route.destination ? route.destination.trim() : 'Destination';
  stopsList.push({
    stopId: null,
    _id: null,
    name: destName,
    city: destName,
    type: 'drop',
    isBoarding: false,
    isDropping: true,
    sequence: seq++,
    arrivalTime: null,
    departureTime: null
  });

  return stopsList;
};

// ============================================================
// SEARCH BUSES
// GET /api/buses/search
// ============================================================

exports.searchBuses = asyncHandler(async (req, res) => {
  const {
    from,
    to,
    boardingPoint,
    droppingPoint,
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

  if (routes.length === 0) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  // Filter routes based on boardingPoint and droppingPoint if specified
  const validRoutes = [];
  const routeStopDetailsMap = {};

  for (const route of routes) {
    const stops = normalizeRouteStops(route);
    let isValidRoute = true;
    let selectedBoardingStop = null;
    let selectedDroppingStop = null;

    if (boardingPoint) {
      const bp = String(boardingPoint).trim().toLowerCase();
      selectedBoardingStop = stops.find(
        (s) =>
          (s.stopId && String(s.stopId).toLowerCase() === bp) ||
          (s._id && String(s._id).toLowerCase() === bp) ||
          s.name.toLowerCase() === bp ||
          s.city.toLowerCase() === bp
      );
      if (!selectedBoardingStop) {
        isValidRoute = false;
      }
    }

    if (droppingPoint) {
      const dp = String(droppingPoint).trim().toLowerCase();
      selectedDroppingStop = stops.find(
        (s) =>
          (s.stopId && String(s.stopId).toLowerCase() === dp) ||
          (s._id && String(s._id).toLowerCase() === dp) ||
          s.name.toLowerCase() === dp ||
          s.city.toLowerCase() === dp
      );
      if (!selectedDroppingStop) {
        isValidRoute = false;
      }
    }

    if (selectedBoardingStop && selectedDroppingStop) {
      if (Number(selectedBoardingStop.sequence) >= Number(selectedDroppingStop.sequence)) {
        isValidRoute = false;
      }
    }

    if (isValidRoute) {
      validRoutes.push(route);
      routeStopDetailsMap[route._id.toString()] = {
        boardingStop: selectedBoardingStop,
        droppingStop: selectedDroppingStop,
        stops
      };
    }
  }

  // If user searched specific boarding and/or dropping points and no route matches sequence/existence
  if ((boardingPoint || droppingPoint) && validRoutes.length === 0 && from && to) {
    return res.status(400).json({
      success: false,
      message: 'Invalid boarding or dropping point for this route'
    });
  }

  const routeIds = validRoutes.map((route) => route._id);

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
    const bounds = utcDayBounds(date);

    if (bounds) {
      await ensureSchedulesForDate(routeIds, date);

      scheduleQuery.travelDate = {
        $gte: bounds.dayStart,
        $lte: bounds.dayEnd
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
    .map((schedule) => {
      const rId = schedule.routeId._id?.toString() || schedule.routeId.toString();
      const stopInfo = routeStopDetailsMap[rId] || {};
      const boardingStop = stopInfo.boardingStop || null;
      const droppingStop = stopInfo.droppingStop || null;

      return {
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
              .split('T')[0]}T${boardingStop?.departureTime || schedule.departureTime}`,

          arrival:
            `${schedule.travelDate
              .toISOString()
              .split('T')[0]}T${droppingStop?.arrivalTime || schedule.arrivalTime}`,

          departureTime: boardingStop?.departureTime || schedule.departureTime,

          arrivalTime: droppingStop?.arrivalTime || schedule.arrivalTime,

          duration:
            schedule.routeId.estimatedDuration,

          fare: schedule.fare
        },

        travelDate: schedule.travelDate,

        departureTime: boardingStop?.departureTime || schedule.departureTime,

        arrivalTime: droppingStop?.arrivalTime || schedule.arrivalTime,

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
          schedule.busId.boardingPoints && schedule.busId.boardingPoints.length > 0
            ? schedule.busId.boardingPoints
            : (stopInfo.stops ? stopInfo.stops.filter(s => s.type !== 'drop').map(s => s.name) : [schedule.routeId.source]),

        droppingPoints:
          schedule.busId.droppingPoints && schedule.busId.droppingPoints.length > 0
            ? schedule.busId.droppingPoints
            : (stopInfo.stops ? stopInfo.stops.filter(s => s.type !== 'pickup').map(s => s.name) : [schedule.routeId.destination]),

        selectedBoardingPoint: boardingStop ? {
          stopId: boardingStop.stopId || boardingStop._id,
          name: boardingStop.name,
          city: boardingStop.city,
          time: boardingStop.departureTime || schedule.departureTime
        } : null,

        selectedDroppingPoint: droppingStop ? {
          stopId: droppingStop.stopId || droppingStop._id,
          name: droppingStop.name,
          city: droppingStop.city,
          time: droppingStop.arrivalTime || schedule.arrivalTime
        } : null,

        rating:
          schedule.busId.rating,

        scheduleId: schedule._id
      };
    });

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

  // For booked seats, fetch the associated booking to get passenger name + gender,
  // BUT only expose those when the booked passenger has opted in via
  // profileVisibility = true in their SmartSeatPreference.
  //
  // Privacy contract (enforced server-side before the HTTP response is built):
  //   profileVisibility = true  → return passenger: { name, gender }
  //   profileVisibility = false (or missing/no pref doc) → omit passenger entirely
  //
  // The key "passenger" is absent from the response object when visibility is OFF.
  // The frontend never receives name or gender when the passenger has not opted in.
  const bookedSeatIds = seats
    .filter((s) => s.status === 'booked' && s.bookingId)
    .map((s) => s.bookingId);

  // bookingId → { name, gender, userId }
  const bookingInfoMap = {};
  if (bookedSeatIds.length > 0) {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find(
      { _id: { $in: bookedSeatIds } },
      { _id: 1, userId: 1, 'passengerDetails.name': 1, 'passengerDetails.gender': 1 }
    ).lean();
    bookings.forEach((b) => {
      bookingInfoMap[b._id.toString()] = {
        name:   b.passengerDetails?.name   || '',
        gender: b.passengerDetails?.gender || 'other',
        userId: b.userId ? b.userId.toString() : null
      };
    });
  }

  // Batch-fetch SmartSeatPreference for all booked passenger userIds (one query).
  const bookedUserIds = [
    ...new Set(
      Object.values(bookingInfoMap)
        .map((b) => b.userId)
        .filter(Boolean)
    )
  ];

  // userId (string) → profileVisibility (boolean)
  const visibilityMap = {};
  if (bookedUserIds.length > 0) {
    const prefs = await SmartSeatPreference.find(
      { userId: { $in: bookedUserIds } },
      { userId: 1, profileVisibility: 1 }
    ).lean();
    prefs.forEach((p) => {
      // Treat missing/null as false (OFF) — backward-compatible with existing docs
      visibilityMap[p.userId.toString()] = Boolean(p.profileVisibility);
    });
    // Any userId NOT in the prefs collection has no doc → treated as OFF
  }

  const formattedSeats = seats.map((seat) => {
    // Base seat object — no identity fields yet
    const formatted = {
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

      // berth: 'lower' | 'upper' | null  — only set for sleeper buses
      berth: seat.berth || null,

      adjacentSeat:
        Array.isArray(seat.adjacentSeatNumbers) &&
        seat.adjacentSeatNumbers.length > 0
          ? seat.adjacentSeatNumbers[0]
          : null
    };

    // Conditionally attach passenger identity ONLY for booked seats whose
    // owner has profileVisibility = true.
    if (seat.status === 'booked' && seat.bookingId) {
      const info = bookingInfoMap[seat.bookingId.toString()];
      if (info) {
        const isVisible =
          info.userId && visibilityMap[info.userId] === true;

        if (isVisible) {
          // Expose ONLY name + gender — never email, phone, address, token, etc.
          formatted.passenger = {
            name:   info.name,
            gender: info.gender
          };
          // Also set passengerGender for the seat-icon badge (backward compat)
          formatted.passengerGender = info.gender;
        }
        // When OFF: "passenger" and "passengerGender" keys are simply absent.
      }
    }

    return formatted;
  });

  return res.status(200).json({
    success: true,

    data: formattedSeats,

    meta: {
      busId: id,

      scheduleId,

      // busType enables the frontend to render the correct layout style
      busType: bus.busType,

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

// ============================================================
// GET ROUTE STOPS
// GET /api/buses/routes/stops?from=...&to=...
// GET /api/buses/routes/:id/stops
// ============================================================

exports.getRouteStops = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const { id } = req.params;

  let route = null;

  if (id && mongoose.isValidObjectId(id)) {
    route = await Route.findById(id);
  } else if (from && to) {
    route = await Route.findOne({
      source: { $regex: `^${from.trim()}$`, $options: 'i' },
      destination: { $regex: `^${to.trim()}$`, $options: 'i' },
      isActive: true
    });

    if (!route) {
      route = await Route.findOne({
        source: { $regex: from.trim(), $options: 'i' },
        destination: { $regex: to.trim(), $options: 'i' },
        isActive: true
      });
    }
  }

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  const stops = normalizeRouteStops(route);

  return res.status(200).json({
    success: true,
    route: {
      id: route._id,
      _id: route._id,
      source: route.source,
      destination: route.destination,
      distance: route.distance,
      estimatedDuration: route.estimatedDuration
    },
    stops,
    data: {
      route: {
        id: route._id,
        _id: route._id,
        source: route.source,
        destination: route.destination,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration
      },
      stops
    }
  });
});

exports.normalizeRouteStops = normalizeRouteStops;