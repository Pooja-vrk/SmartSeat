const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  seatNumber: {
    type: String,
    required: true,
    trim: true
  },
  passengerDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    }
  },
  boardingPoint: {
    stopId: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    name: {
      type: String,
      default: null,
      trim: true
    },
    city: {
      type: String,
      default: null,
      trim: true
    },
    time: {
      type: String,
      default: null
    }
  },
  droppingPoint: {
    stopId: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    name: {
      type: String,
      default: null,
      trim: true
    },
    city: {
      type: String,
      default: null,
      trim: true
    },
    time: {
      type: String,
      default: null
    }
  },
  baseFare: {
    type: Number,
    required: true,
    min: [0, 'Base fare cannot be negative']
  },
  gstRate: {
    type: Number,
    required: true,
    min: [0, 'GST rate cannot be negative'],
    default: 0
  },
  gstAmount: {
    type: Number,
    required: true,
    min: [0, 'GST amount cannot be negative'],
    default: 0
  },
  fare: {
    type: Number,
    required: true,
    min: [0, 'Fare cannot be negative'],
    comment: 'Total fare including GST (baseFare + gstAmount)'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'failed'],
    default: 'pending'
  },
  smartSeatMonitoring: {
    type: Boolean,
    default: true
  },
  smartSeatPreferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartSeatPreference',
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  // Refund tracking
  refundAmount: {
    type: Number,
    default: null
  },
  refundPercentage: {
    type: Number,
    default: null
  },
  refundStatus: {
    type: String,
    enum: ['none', 'initiated', 'processing', 'completed'],
    default: 'none'
  },
  refundInitiatedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance (defined in schema with index: true)

// Method to cancel booking
bookingSchema.methods.cancel = function(reason) {
  this.bookingStatus = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Method to complete booking
bookingSchema.methods.complete = function() {
  this.bookingStatus = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark payment as completed
bookingSchema.methods.markPaymentCompleted = function(paymentId) {
  this.paymentStatus = 'completed';
  this.paymentId = paymentId;
  this.bookingStatus = 'confirmed';
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
