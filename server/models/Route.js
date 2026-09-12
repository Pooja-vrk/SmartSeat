const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide stop name'],
    trim: true
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['pickup', 'drop', 'both'],
    default: 'both'
  },
  sequence: {
    type: Number,
    required: [true, 'Please provide stop sequence']
  },
  arrivalTime: {
    type: String,
    default: null
  },
  departureTime: {
    type: String,
    default: null
  }
}, { _id: true });

const routeSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Please provide source city'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide destination city'],
    trim: true
  },
  stops: [stopSchema],
  distance: {
    type: Number,
    required: [true, 'Please provide distance in km']
  },
  estimatedDuration: {
    type: String,
    required: [true, 'Please provide estimated duration']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for source-destination queries
routeSchema.index({ source: 1, destination: 1 });

module.exports = mongoose.model('Route', routeSchema);
