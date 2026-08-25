const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true,
    index: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
    index: true
  },
  departureTime: {
    type: String,
    required: [true, 'Please provide departure time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  arrivalTime: {
    type: String,
    required: [true, 'Please provide arrival time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  travelDate: {
    type: Date,
    required: [true, 'Please provide travel date'],
    index: true
  },
  fare: {
    type: Number,
    required: [true, 'Please provide fare'],
    min: [0, 'Fare cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availableSeats: {
    type: Number,
    default: 0
  },
  delayMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Delay cannot be negative'],
    comment: 'Delay in minutes (0 = on time). Set by admin when a bus is running late.'
  }
}, {
  timestamps: true
});

// Indexes for performance (defined in schema with index: true)

module.exports = mongoose.model('Schedule', scheduleSchema);
