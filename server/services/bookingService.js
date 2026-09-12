const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');
const User = require('../models/User');
const SeatChangeHistory = require('../models/SeatChangeHistory');
const mongoose = require('mongoose');
const smartSeatService = require('./smartSeatService');
const recommendationService = require('./recommendationService');
const { getAvailableSeats } = require('../utils/seatUtils');
const { GST_RATE } = require('../config/gst');
const { calculateRefund } = require('../config/cancellationPolicy');

const seatNumberVariants = (seatNumber) => {
  const raw = String(seatNumber || '').trim();
  const variants = new Set([raw]);
  if (!raw) return [...variants];

  const seater = raw.match(/^(\d+)([A-Z]{1,3})$/i);
  if (seater) {
    const letters = seater[2].toUpperCase();
    variants.add(`${seater[1].padStart(2, '0')}${letters}`);
    variants.add(`${parseInt(seater[1], 10)}${letters}`);
  }

  const berth = raw.match(/^([LU])(\d+)$/i);
  if (berth) {
    const letter = berth[1].toUpperCase();
    variants.add(`${letter}${berth[2].padStart(2, '0')}`);
    variants.add(`${letter}${parseInt(berth[2], 10)}`);
  }

  return [...variants];
};

/**
 * Calculate GST breakdown for a given base fare.
 *
 * @param {number} baseFare - The raw fare before tax (schedule.fare)
 * @returns {{ baseFare: number, gstRate: number, gstAmount: number, totalAmount: number }}
 */
function calculateGST(baseFare) {
  const gstAmount = Math.round(baseFare * (GST_RATE / 100) * 100) / 100;
  const totalAmount = Math.round((baseFare + gstAmount) * 100) / 100;
  return {
    baseFare,
    gstRate: GST_RATE,
    gstAmount,
    totalAmount
  };
}

/**
 * Booking Service - Handles booking operations with atomic seat reservation
 */
class BookingService {
  /**
   * Create a new booking with atomic seat reservation
   * @param {Object} bookingData - Booking data
   * @returns {Object} Created booking
   */
  async createBooking(bookingData) {
    const session = await Booking.startSession();
    
    try {
      session.startTransaction();

      const {
        userId,
        scheduleId,
        seatNumber,
        passengerDetails,
        smartSeatMonitoring,
        boardingPoint,
        droppingPoint
      } = bookingData;

      // Validate schedule exists
      const schedule = await Schedule.findById(scheduleId).session(session);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Get bus information
      const bus = await Bus.findById(schedule.busId).session(session);
      if (!bus) {
        throw new Error('Bus not found');
      }

      // Fetch route and validate stops
      const Route = require('../models/Route');
      const route = await Route.findById(schedule.routeId).session(session);
      if (!route) {
        throw new Error('Route not found');
      }

      // Normalize stops for this route
      const { normalizeRouteStops } = require('../controllers/busController');
      const routeStops = normalizeRouteStops ? normalizeRouteStops(route) : [];

      let selectedBoardingStop = null;
      let selectedDroppingStop = null;

      if (boardingPoint) {
        const bpName = typeof boardingPoint === 'string'
          ? boardingPoint.trim().toLowerCase()
          : (boardingPoint.name || boardingPoint.stopId || '').trim().toLowerCase();

        selectedBoardingStop = routeStops.find(
          (s) =>
            (s.stopId && String(s.stopId).toLowerCase() === bpName) ||
            (s._id && String(s._id).toLowerCase() === bpName) ||
            s.name.toLowerCase() === bpName ||
            s.city.toLowerCase() === bpName
        );
      }

      if (droppingPoint) {
        const dpName = typeof droppingPoint === 'string'
          ? droppingPoint.trim().toLowerCase()
          : (droppingPoint.name || droppingPoint.stopId || '').trim().toLowerCase();

        selectedDroppingStop = routeStops.find(
          (s) =>
            (s.stopId && String(s.stopId).toLowerCase() === dpName) ||
            (s._id && String(s._id).toLowerCase() === dpName) ||
            s.name.toLowerCase() === dpName ||
            s.city.toLowerCase() === dpName
        );
      }

      // If boarding or dropping were supplied, validate existence and sequence order
      if (boardingPoint && !selectedBoardingStop) {
        throw new Error('Invalid boarding point for this route');
      }

      if (droppingPoint && !selectedDroppingStop) {
        throw new Error('Invalid dropping point for this route');
      }

      if (selectedBoardingStop && selectedDroppingStop) {
        if (Number(selectedBoardingStop.sequence) >= Number(selectedDroppingStop.sequence)) {
          throw new Error('Invalid boarding or dropping point for this route: dropping must be after boarding');
        }
      }

      const resolvedBoardingPoint = selectedBoardingStop
        ? {
            stopId: selectedBoardingStop.stopId || selectedBoardingStop._id || null,
            name: selectedBoardingStop.name,
            city: selectedBoardingStop.city || route.source,
            time: selectedBoardingStop.departureTime || schedule.departureTime || null
          }
        : {
            stopId: null,
            name: route.source,
            city: route.source,
            time: schedule.departureTime || null
          };

      const resolvedDroppingPoint = selectedDroppingStop
        ? {
            stopId: selectedDroppingStop.stopId || selectedDroppingStop._id || null,
            name: selectedDroppingStop.name,
            city: selectedDroppingStop.city || route.destination,
            time: selectedDroppingStop.arrivalTime || schedule.arrivalTime || null
          }
        : {
            stopId: null,
            name: route.destination,
            city: route.destination,
            time: schedule.arrivalTime || null
          };

      // Atomic seat reservation - prevent double booking
      const seat = await Seat.findOneAndUpdate(
        {
          scheduleId,
          seatNumber,
          status: 'available',
          $or: [
            { reservedUntil: null },
            { reservedUntil: { $lt: new Date() } }
          ]
        },
        {
          $set: {
            status: 'reserved',
            reservedBy: userId,
            reservedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
          }
        },
        { session }
      );

      if (!seat) {
        throw new Error('Seat is not available or already booked');
      }

      // Generate booking ID
      const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Calculate GST on the schedule fare
      const { baseFare, gstRate, gstAmount, totalAmount } = calculateGST(schedule.fare);

      const user = await User.findById(userId).select('name email phone').session(session);

      // Create booking
      const booking = await Booking.create([{
        bookingId,
        userId,
        scheduleId,
        busId: bus._id,
        routeId: schedule.routeId,
        seatNumber,
        passengerDetails,
        boardingPoint: resolvedBoardingPoint,
        droppingPoint: resolvedDroppingPoint,
        baseFare,
        gstRate,
        gstAmount,
        fare: totalAmount,        // fare = total (baseFare + gstAmount) — kept for backward compat
        paymentStatus: 'completed',
        bookingStatus: 'confirmed',
        smartSeatMonitoring
      }], { session });

      // Update seat with booking reference
      await Seat.findByIdAndUpdate(
        seat._id,
        {
          bookingId: booking[0]._id,
          status: 'booked',
          bookedBy: userId,
          reservedBy: null,
          reservedUntil: null
        },
        { session }
      );

      // Update schedule available seats
      await Schedule.findByIdAndUpdate(
        scheduleId,
        { $inc: { availableSeats: -1 } },
        { session }
      );

      await session.commitTransaction();

      // Handle SmartSeat adjacent seat notification (outside transaction)
      try {
        await smartSeatService.handleAdjacentSeatChange(scheduleId, seatNumber, booking[0]._id);
      } catch (smartSeatError) {
        console.error('SmartSeat notification error:', smartSeatError);
        // Don't fail booking if SmartSeat notification fails
      }

      return {
        success: true,
        data: {
          ...booking[0].toObject(),
          userId: user ? user.toObject() : booking[0].userId,
          passengerEmail: user ? user.email : (passengerDetails?.email || null),
          routeId: route ? route.toObject() : booking[0].routeId,
          route: route ? route.toObject() : null,
          schedule: schedule.toObject(),
          bus: bus.toObject()
        }
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Booking creation error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get bookings for a user
   * @param {String} userId - User ID
   * @param {Object} filters - Optional filters { status }
   * @returns {Array} User bookings
   */
  async getUserBookings(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.status === 'cancelled') {
        // Explicitly cancelled bookings only
        query.bookingStatus = 'cancelled';

        const bookings = await Booking.find(query)
          .populate('scheduleId')
          .populate('busId')
          .populate('routeId')
          .sort({ createdAt: -1 });

        return { success: true, data: bookings };
      }

      if (filters.status === 'completed') {
        // "Completed" = a confirmed (or pending) booking whose travel date
        // has already passed.  The bookingStatus field is never automatically
        // updated to 'completed' by a cron, so we derive the tab from the
        // schedule date instead.
        //
        // Use the start of today in UTC so a booking dated exactly today
        // stays on the Upcoming tab until midnight (matches the Schedule
        // model's travelDate which is stored as a Date at 00:00:00 UTC).
        const todayUTCStart = new Date();
        todayUTCStart.setUTCHours(0, 0, 0, 0);

        query.bookingStatus = { $in: ['confirmed', 'pending', 'completed'] };

        // Join through scheduleId to filter by travelDate
        const Schedule = require('../models/Schedule');
        const pastScheduleIds = await Schedule.find(
          { travelDate: { $lt: todayUTCStart } },
          { _id: 1 }
        ).lean();

        const pastIds = pastScheduleIds.map((s) => s._id);
        query.scheduleId = { $in: pastIds };

        const bookings = await Booking.find(query)
          .populate('scheduleId')
          .populate('busId')
          .populate('routeId')
          .sort({ 'scheduleId.travelDate': -1, createdAt: -1 });

        return { success: true, data: bookings };
      }

      if (filters.status === 'confirmed') {
        // "Upcoming" = confirmed/pending bookings whose travel date is
        // today or in the future.
        const todayUTCStart = new Date();
        todayUTCStart.setUTCHours(0, 0, 0, 0);

        query.bookingStatus = { $in: ['confirmed', 'pending'] };

        const Schedule = require('../models/Schedule');
        const upcomingScheduleIds = await Schedule.find(
          { travelDate: { $gte: todayUTCStart } },
          { _id: 1 }
        ).lean();

        const upcomingIds = upcomingScheduleIds.map((s) => s._id);
        query.scheduleId = { $in: upcomingIds };

        const bookings = await Booking.find(query)
          .populate('scheduleId')
          .populate('busId')
          .populate('routeId')
          .sort({ 'scheduleId.travelDate': 1, createdAt: -1 });

        return { success: true, data: bookings };
      }

      // No status filter — return all bookings for the user
      const bookings = await Booking.find(query)
        .populate('scheduleId')
        .populate('busId')
        .populate('routeId')
        .sort({ createdAt: -1 });

      return { success: true, data: bookings };
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   * @param {String} bookingId - Booking ID
   * @returns {Object} Booking details
   */
  async getBookingById(bookingId) {
    try {
      // Find booking by either MongoDB _id or custom bookingId
      const booking = await Booking.findOne({ 
        $or: [
          { _id: bookingId },
          { bookingId: bookingId }
        ]
      })
        .populate('scheduleId')
        .populate('busId')
        .populate('routeId')
        .populate('userId', 'name email phone');

      if (!booking) {
        throw new Error('Booking not found');
      }

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {String} bookingId - Booking ID
   * @param {String} userId - User ID (for ownership check)
   * @param {String} reason - Cancellation reason
   * @returns {Object} Cancelled booking
   */
  async cancelBooking(bookingId, userId, reason) {
    const session = await Booking.startSession();
    
    try {
      session.startTransaction();

      // Find booking by either MongoDB _id or custom bookingId
      const booking = await Booking.findOne({ 
        $or: [
          { _id: bookingId },
          { bookingId: bookingId }
        ]
      }).session(session);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId.toString() !== userId) {
        throw new Error('You can only cancel your own bookings');
      }

      if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
        throw new Error('Booking cannot be cancelled');
      }

      // Populate schedule to get travelDate + departureTime for refund calc
      const schedule = await Schedule.findById(booking.scheduleId).session(session);

      // Calculate refund based on cancellation policy
      let refundInfo = {
        refundPercentage: 0,
        refundAmount: 0,
        cancellationFee: booking.fare,
        label: 'No refund',
        description: 'No refund applicable'
      };

      if (schedule) {
        refundInfo = calculateRefund(
          booking.fare,
          schedule.travelDate,
          schedule.departureTime
        );
      }

      // Cancel booking and record refund info
      booking.bookingStatus = 'cancelled';
      booking.cancellationReason = reason;
      booking.cancelledAt = new Date();
      booking.refundAmount = refundInfo.refundAmount;
      booking.refundPercentage = refundInfo.refundPercentage;

      if (refundInfo.refundAmount > 0) {
        booking.paymentStatus = 'refunded';
        booking.refundStatus = 'initiated';
        booking.refundInitiatedAt = new Date();
      }

      await booking.save({ session });

      // Release seat
      await Seat.findOneAndUpdate(
        { bookingId: booking._id },
        {
          $set: {
            status: 'available',
            bookedBy: null,
            bookingId: null
          }
        },
        { session }
      );

      // Update schedule available seats
      await Schedule.findByIdAndUpdate(
        booking.scheduleId,
        { $inc: { availableSeats: 1 } },
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        data: booking,
        refund: refundInfo
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Booking cancellation error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get refund preview before cancelling a booking
   * @param {String} bookingId
   * @param {String} userId
   */
  async getRefundPreview(bookingId, userId) {
    try {
      const booking = await Booking.findOne({
        $or: [{ _id: bookingId }, { bookingId }]
      }).populate('scheduleId');

      if (!booking) throw new Error('Booking not found');
      if (booking.userId.toString() !== userId)
        throw new Error('Access denied');
      if (booking.bookingStatus !== 'confirmed' && booking.bookingStatus !== 'pending')
        throw new Error('Only active bookings can be cancelled');

      const schedule = booking.scheduleId;
      const refundInfo = schedule
        ? calculateRefund(booking.fare, schedule.travelDate, schedule.departureTime)
        : { refundPercentage: 0, refundAmount: 0, cancellationFee: booking.fare };

      return {
        success: true,
        data: {
          bookingId: booking.bookingId || booking._id,
          totalFare: booking.fare,
          baseFare: booking.baseFare,
          gstAmount: booking.gstAmount,
          ...refundInfo
        }
      };
    } catch (error) {
      console.error('Error getting refund preview:', error);
      throw error;
    }
  }

  /**
   * Change seat for a booking
   * @param {String} bookingId - Booking ID
   * @param {String} newSeatNumber - New seat number
   * @param {String} userId - User ID
   * @returns {Object} Updated booking
   */
  async changeSeat(bookingId, newSeatNumber, userId) {
    const session = await Booking.startSession();
    
    try {
      session.startTransaction();

      const bookingQuery = mongoose.isValidObjectId(bookingId)
        ? { $or: [{ _id: bookingId }, { bookingId }] }
        : { bookingId };

      const booking = await Booking.findOne(bookingQuery).session(session);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      const bookingOwnerId = (booking.userId._id || booking.userId).toString();
      if (bookingOwnerId !== userId.toString()) {
        throw new Error('You can only change your own bookings');
      }

      if (booking.bookingStatus !== 'confirmed' && booking.bookingStatus !== 'pending') {
        throw new Error('Only active bookings can be changed');
      }

      const oldSeatNumber = booking.seatNumber;
      const targetSeatNumbers = seatNumberVariants(newSeatNumber);

      if (seatNumberVariants(oldSeatNumber).some((n) => targetSeatNumbers.includes(n))) {
        throw new Error('Please select a different seat');
      }

      // Atomic reservation of new seat
      const newSeat = await Seat.findOneAndUpdate(
        {
          scheduleId: booking.scheduleId,
          seatNumber: { $in: targetSeatNumbers },
          status: 'available',
          $or: [
            { reservedUntil: null },
            { reservedUntil: { $lt: new Date() } }
          ]
        },
        {
          $set: {
            status: 'reserved',
            reservedBy: userId,
            reservedUntil: new Date(Date.now() + 15 * 60 * 1000)
          }
        },
        { session, new: true }
      );

      if (!newSeat) {
        throw new Error('Seat is not available or already booked');
      }

      const oldSeatNumbers = seatNumberVariants(oldSeatNumber);

      // Release only this booking's previous seat — never another passenger's
      const released = await Seat.findOneAndUpdate(
        {
          _id: { $ne: newSeat._id },
          scheduleId: booking.scheduleId,
          $or: [
            { bookingId: booking._id },
            { seatNumber: { $in: oldSeatNumbers }, bookedBy: userId }
          ]
        },
        {
          $set: {
            status: 'available',
            bookedBy: null,
            bookingId: null,
            reservedBy: null,
            reservedUntil: null
          }
        },
        { session }
      );

      if (!released) {
        throw new Error('Could not release the current seat. Seat change aborted.');
      }

      const authoritativeSeatNumber = newSeat.seatNumber;
      booking.seatNumber = authoritativeSeatNumber;
      await booking.save({ session });

      await Seat.findByIdAndUpdate(
        newSeat._id,
        {
          bookingId: booking._id,
          status: 'booked',
          bookedBy: userId,
          reservedBy: null,
          reservedUntil: null
        },
        { session }
      );

      await SeatChangeHistory.create([{
        userId,
        bookingId: booking._id,
        scheduleId: booking.scheduleId,
        oldSeat: oldSeatNumber,
        newSeat: authoritativeSeatNumber,
        reason: 'passenger_requested',
        triggeredBy: 'user'
      }], { session });

      await session.commitTransaction();

      try {
        await smartSeatService.handleAdjacentSeatChange(
          booking.scheduleId,
          authoritativeSeatNumber,
          booking._id
        );
      } catch (smartSeatError) {
        console.error('SmartSeat notification error:', smartSeatError);
      }

      const refreshed = await Booking.findById(booking._id)
        .populate('scheduleId')
        .populate('busId')
        .populate('routeId')
        .populate('userId', 'name email phone');

      return {
        success: true,
        data: {
          ...(refreshed ? refreshed.toObject() : booking.toObject()),
          previousSeat: oldSeatNumber,
          seatChangedAt: new Date()
        }
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Seat change error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Check seat availability
   * @param {String} scheduleId - Schedule ID
   * @param {String} seatNumber - Seat number
   * @returns {Object} Availability status
   */
  async checkSeatAvailability(scheduleId, seatNumber) {
    try {
      const seat = await Seat.findOne({ scheduleId, seatNumber });
      
      if (!seat) {
        return {
          success: true,
          data: {
            available: false,
            seatNumber,
            message: 'Seat not found'
          }
        };
      }

      const isAvailable = seat.isAvailable();

      return {
        success: true,
        data: {
          available: isAvailable,
          seatNumber,
          status: seat.status,
          scheduleId
        }
      };
    } catch (error) {
      console.error('Error checking seat availability:', error);
      throw error;
    }
  }

  /**
   * Get available seats for a schedule
   * @param {String} scheduleId - Schedule ID
   * @returns {Array} Available seats
   */
  async getAvailableSeats(scheduleId) {
    try {
      const seats = await getAvailableSeats(scheduleId);
      return {
        success: true,
        data: seats
      };
    } catch (error) {
      console.error('Error getting available seats:', error);
      throw error;
    }
  }

  /**
   * Update SmartSeat monitoring preference for a booking
   * @param {String} bookingId - Booking ID
   * @param {Boolean} enabled - Enable/disable monitoring
   * @returns {Object} Updated booking
   */
  async updateSmartSeatMonitoring(bookingId, enabled) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { smartSeatMonitoring: enabled },
        { new: true }
      );

      if (!booking) {
        throw new Error('Booking not found');
      }

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      console.error('Error updating SmartSeat monitoring:', error);
      throw error;
    }
  }
}

module.exports = new BookingService();
