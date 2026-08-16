const mongoose = require('mongoose');

const seatChangeHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
    index: true
  },
  oldSeat: {
    type: String,
    required: true
  },
  newSeat: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    enum: ['passenger_requested', 'smartseat_recommendation', 'admin_change', 'adjacent_seat_booked'],
    required: true
  },
  triggeredBy: {
    type: String,
    enum: ['user', 'system', 'admin'],
    default: 'user'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SeatChangeHistory', seatChangeHistorySchema);
