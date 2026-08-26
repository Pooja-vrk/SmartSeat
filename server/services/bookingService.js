const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');
const User = require('../models/User');
const SeatChangeHistory = require('../models/SeatChangeHistory');
const smartSeatService = require('./smartSeatService');
const recommendationService = require('./recommendationService');
const { getAvailableSeats } = require('../utils/seatUtils');
const { GST_RATE } = require('../config/gst');

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

      const { userId, scheduleId, seatNumber, passengerDetails, smartSeatMonitoring } = bookingData;

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

      // Fetch route info for response
      const Route = require('../models/Route');
      const route = await Route.findById(schedule.routeId).session(session);

      // Create booking
      const booking = await Booking.create([{
        bookingId,
        userId,
        scheduleId,
        busId: bus._id,
        routeId: schedule.routeId,
        seatNumber,
        passengerDetails,
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
   * @param {Object} filters - Optional filters
   * @returns {Array} User bookings
   */
  async getUserBookings(userId, filters = {}) {
    try {
      const query = { userId };
      
      if (filters.status) {
        query.bookingStatus = filters.status;
      }

      const bookings = await Booking.find(query)
        .populate('scheduleId')
        .populate('busId')
        .populate('routeId')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: bookings
      };
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

      // Cancel booking
      await booking.cancel(reason);

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
        data: booking
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
        throw new Error('You can only change your own bookings');
      }

      if (booking.bookingStatus !== 'confirmed') {
        throw new Error('Only confirmed bookings can be changed');
      }

      const oldSeatNumber = booking.seatNumber;

      // Atomic reservation of new seat
      const newSeat = await Seat.findOneAndUpdate(
        {
          scheduleId: booking.scheduleId,
          seatNumber: newSeatNumber,
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
        { session }
      );

      if (!newSeat) {
        throw new Error('Seat is not available or already booked');
      }

      // Release old seat
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

      // Update booking with new seat
      booking.seatNumber = newSeatNumber;
      await booking.save({ session });

      // Update new seat with booking reference
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

      // Record seat change history
      await SeatChangeHistory.create([{
        userId,
        bookingId: booking._id,
        scheduleId: booking.scheduleId,
        oldSeat: oldSeatNumber,
        newSeat: newSeatNumber,
        reason: 'passenger_requested',
        triggeredBy: 'user'
      }], { session });

      await session.commitTransaction();

      // Handle SmartSeat notification for the change
      try {
        await smartSeatService.handleAdjacentSeatChange(booking.scheduleId, newSeatNumber, booking._id);
      } catch (smartSeatError) {
        console.error('SmartSeat notification error:', smartSeatError);
      }

      return {
        success: true,
        data: {
          ...booking.toObject(),
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
