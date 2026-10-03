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

// Pre-validate hook to automatically normalize string stops into stopSchema objects
routeSchema.pre('validate', function (next) {
  if (Array.isArray(this.stops)) {
    this.stops = this.stops.map((s, idx) => {
      if (typeof s === 'string') {
        const trimmed = s.trim();
        return {
          name: trimmed,
          city: trimmed,
          type: 'both',
          sequence: idx + 1
        };
      }
      if (s && typeof s === 'object') {
        return {
          ...s,
          name: s.name ? String(s.name).trim() : '',
          city: s.city ? String(s.city).trim() : (s.name ? String(s.name).trim() : ''),
          type: s.type || 'both',
          sequence: Number(s.sequence) || (idx + 1)
        };
      }
      return s;
    });
  }
  next();
});

// Compound index for source-destination queries
routeSchema.index({ source: 1, destination: 1 });

module.exports = mongoose.model('Route', routeSchema);
