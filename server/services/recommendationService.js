const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const SmartSeatPreference = require('../models/SmartSeatPreference');

/**
 * Recommendation Service - Provides seat recommendations based on preferences
 */
class RecommendationService {
  /**
   * Get seat recommendations for a user
   * @param {String} scheduleId - Schedule ID
   * @param {String} currentSeat - Current seat number
   * @param {String} userId - User ID
   * @returns {Array} Recommended seats
   */
  async getSeatRecommendations(scheduleId, currentSeat, userId) {
    try {
      // Get user preferences
      const preference = await SmartSeatPreference.findOne({ userId });
      const prefs = preference || {};

      // Get available seats
      const availableSeats = await Seat.find({
        scheduleId,
        status: 'available'
      }).sort({ row: 1, column: 1 });

      // Get current seat info
      const currentSeatData = await Seat.findOne({
        scheduleId,
        seatNumber: currentSeat
      });

      if (!currentSeatData) {
        return [];
      }

      // Score each available seat
      const recommendations = availableSeats.map(seat => {
        const score = this.calculateSeatScore(seat, currentSeatData, prefs);
        const reasons = this.generateReasons(seat, currentSeatData, prefs);
        
        return {
          seatNumber: seat.seatNumber,
          score,
          reasons,
          seatData: {
            row: seat.row,
            column: seat.column,
            seatType: seat.seatType,
            position: seat.position,
            price: seat.price
          }
        };
      });

      // Sort by score descending
      recommendations.sort((a, b) => b.score - a.score);

      // Return top 5 recommendations
      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Error getting seat recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate seat recommendation score
   * @param {Object} seat - Seat to evaluate
   * @param {Object} currentSeat - Current seat
   * @param {Object} preferences - User preferences
   * @returns {Number} Score (0-100)
   */
  calculateSeatScore(seat, currentSeat, preferences) {
    let score = 50; // Base score

    // Window preference
    if (preferences.windowPreference) {
      if (seat.seatType === 'window') score += 15;
      else if (seat.seatType === 'aisle') score -= 5;
    }

    // Section preference
    const totalRows = 20; // Assuming 20 rows total
    const rowPercentage = seat.row / totalRows;
    
    if (preferences.sectionPreference === 'front' && rowPercentage < 0.33) score += 10;
    if (preferences.sectionPreference === 'middle' && rowPercentage >= 0.33 && rowPercentage <= 0.66) score += 10;
    if (preferences.sectionPreference === 'rear' && rowPercentage > 0.66) score += 10;

    // Accessibility priority
    if (preferences.accessibilityPriority && seat.row <= 3) score += 10;

    // Proximity to current seat
    const rowDistance = Math.abs(seat.row - currentSeat.row);
    if (rowDistance <= 2) score += 10;
    else if (rowDistance <= 5) score += 5;
    else score -= 5;

    // Adjacent seat status
    const adjacentStatus = this.checkAdjacentSeatStatus(seat);
    if (adjacentStatus === 'available') score += 15;
    else if (adjacentStatus === 'booked') score -= 10;

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check adjacent seat status
   * @param {Object} seat - Seat to check
   * @returns {String} Status of adjacent seat
   */
  async checkAdjacentSeatStatus(seat) {
    // This would require checking the actual adjacent seats
    // For now, return a placeholder
    return 'available';
  }

  /**
   * Generate reasons for recommendation
   * @param {Object} seat - Recommended seat
   * @param {Object} currentSeat - Current seat
   * @param {Object} preferences - User preferences
   * @returns {Array} List of reasons
   */
  generateReasons(seat, currentSeat, preferences) {
    const reasons = [];

    if (seat.seatType === 'window' && preferences.windowPreference) {
      reasons.push('Window seat preferred');
    }

    if (seat.row <= 3 && preferences.accessibilityPriority) {
      reasons.push('Easy access (front row)');
    }

    const rowDistance = Math.abs(seat.row - currentSeat.row);
    if (rowDistance <= 2) {
      reasons.push('Close to current seat');
    }

    if (preferences.sectionPreference === 'front' && seat.row <= 7) {
      reasons.push('Front section');
    }

    if (preferences.sectionPreference === 'middle' && seat.row > 7 && seat.row <= 14) {
      reasons.push('Middle section');
    }

    if (preferences.sectionPreference === 'rear' && seat.row > 14) {
      reasons.push('Rear section');
    }

    if (reasons.length === 0) {
      reasons.push('Available seat');
    }

    return reasons;
  }

  /**
   * Get recommendation details for a specific seat
   * @param {String} scheduleId - Schedule ID
   * @param {String} seatNumber - Seat number
   * @param {String} userId - User ID
   * @returns {Object} Seat details
   */
  async getRecommendationDetails(scheduleId, seatNumber, userId) {
    try {
      const seat = await Seat.findOne({
        scheduleId,
        seatNumber
      });

      if (!seat) {
        return null;
      }

      const preference = await SmartSeatPreference.findOne({ userId });
      const prefs = preference || {};

      return {
        seatNumber: seat.seatNumber,
        status: seat.status,
        seatType: seat.seatType,
        position: seat.position,
        row: seat.row,
        column: seat.column,
        price: seat.price,
        adjacentSeats: seat.adjacentSeatNumbers,
        userPreferences: prefs
      };
    } catch (error) {
      console.error('Error getting recommendation details:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationService();
