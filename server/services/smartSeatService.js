const Notification = require('../models/Notification');
const SmartSeatPreference = require('../models/SmartSeatPreference');
const SeatChangeHistory = require('../models/SeatChangeHistory');
const Booking = require('../models/Booking');
const { findAdjacentPassenger } = require('../utils/seatUtils');

/**
 * SmartSeat Service - Handles adjacent seat monitoring and notifications
 */
class SmartSeatService {
  /**
   * Check for adjacent seat changes and notify affected passengers
   * @param {String} scheduleId - Schedule ID
   * @param {String} seatNumber - Seat number that was booked
   * @param {String} bookingId - Booking ID
   */
  async handleAdjacentSeatChange(scheduleId, seatNumber, bookingId) {
    try {
      // Find adjacent passengers
      const adjacentPassengers = await findAdjacentPassenger(scheduleId, seatNumber);
      
      if (!adjacentPassengers || adjacentPassengers.length === 0) {
        return { affected: 0 };
      }

      let notifiedCount = 0;

      for (const adjacent of adjacentPassengers) {
        // Check if passenger has SmartSeat monitoring enabled
        const preference = await SmartSeatPreference.findOne({
          userId: adjacent.passenger.id
        });

        if (preference && preference.enabled && preference.notifyAdjacentSeatChange) {
          // Create notification
          const notification = await Notification.create({
            userId: adjacent.passenger.id,
            type: 'smartseat',
            title: 'Adjacent Seat Update',
            message: `Your adjacent seat ${seatNumber} has been booked.`,
            bookingId,
            scheduleId,
            seatNumber: adjacent.seatNumber,
            adjacentSeatNumber: seatNumber,
            category: 'SmartSeat',
            metadata: {
              adjacentPassengerCategory: adjacent.passenger.passengerCategory
            }
          });

          // Emit socket event (will be handled by socket service)
          this.emitSmartSeatEvent(adjacent.passenger.id, {
            notificationId: notification._id,
            bookingId,
            scheduleId,
            currentSeat: adjacent.seatNumber,
            adjacentSeat: seatNumber,
            newStatus: 'booked',
            message: 'Your adjacent seat has been booked'
          });

          notifiedCount++;
        }
      }

      return { affected: adjacentPassengers.length, notified: notifiedCount };
    } catch (error) {
      console.error('Error handling adjacent seat change:', error);
      throw error;
    }
  }

  /**
   * Record seat change history
   * @param {Object} changeData - Seat change data
   */
  async recordSeatChange(changeData) {
    try {
      const seatChange = await SeatChangeHistory.create(changeData);
      return seatChange;
    } catch (error) {
      console.error('Error recording seat change:', error);
      throw error;
    }
  }

  /**
   * Emit socket event (placeholder - will be connected to socket service)
   * @param {String} userId - User ID
   * @param {Object} eventData - Event data
   */
  emitSmartSeatEvent(userId, eventData) {
    // This will be connected to Socket.IO service
    // For now, we'll store the event to be emitted
    if (global.socketIO) {
      global.socketIO.to(`user:${userId}`).emit('smartseat:adjacent-seat-booked', eventData);
    }
  }

  /**
   * Get user's SmartSeat preferences
   * @param {String} userId - User ID
   */
  async getUserPreferences(userId) {
    try {
      let preference = await SmartSeatPreference.findOne({ userId });
      
      if (!preference) {
        // Create default preferences
        preference = await SmartSeatPreference.create({
          userId,
          enabled: true,
          notifyAdjacentSeatChange: true,
          preferredAdjacentCondition: 'no_preference',
          showPermittedPassengerCategory: false,
          allowSeatRecommendations: true,
          sectionPreference: 'middle',
          windowPreference: true,
          accessibilityPriority: false
        });
      }

      return preference;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Update user's SmartSeat preferences
   * @param {String} userId - User ID
   * @param {Object} preferenceData - Preference data
   */
  async updateUserPreferences(userId, preferenceData) {
    try {
      const preference = await SmartSeatPreference.findOneAndUpdate(
        { userId },
        preferenceData,
        { new: true, upsert: true }
      );
      return preference;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

module.exports = new SmartSeatService();
