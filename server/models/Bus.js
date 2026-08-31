const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  operatorName: {
    type: String,
    required: [true, 'Please provide operator name'],
    trim: true
  },
  busNumber: {
    type: String,
    required: [true, 'Please provide bus number'],
    unique: true,
    trim: true,
    index: true
  },
  busType: {
    type: String,
    required: [true, 'Please provide bus type'],
    enum: [
      'AC Sleeper',
      'Non-AC Sleeper',
      'AC Semi Sleeper',
      'Non-AC Semi Sleeper',
      'AC Seater',
      'Non-AC Seater',
      'AC Multi-Axle'
    ]
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true,
    trim: true,
    index: true
  },
  seatConfiguration: {
    rows: {
      type: Number,
      required: true,
      default: 10
    },
    columns: {
      type: Number,
      required: true,
      default: 4
    },
    aisleAfter: {
      type: Number,
      required: true,
      default: 2
    },
    totalSeats: {
      type: Number,
      required: true
    }
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket', 'Pillow', 'Reading Light', 'TV', 'Emergency Exit']
  }],
  boardingPoints: [{
    type: String,
    trim: true
  }],
  droppingPoints: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  images: [String],
  rating: {
    type: Number,
    default: 4.0,
    min: 1,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes are defined in the schema with index: true

module.exports = mongoose.model('Bus', busSchema);
