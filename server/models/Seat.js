const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
    index: true
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  seatNumber: {
    type: String,
    required: [true, 'Please provide seat number'],
    trim: true
  },
  row: {
    type: Number,
    required: true
  },
  column: {
    type: Number,
    required: true
  },
  seatType: {
    type: String,
    enum: ['window', 'aisle', 'middle'],
    default: 'aisle'
  },
  position: {
    type: String,
    enum: ['left', 'right'],
    required: true
  },
  // For sleeper buses: 'lower' | 'upper' | null
  berth: {
    type: String,
    enum: ['lower', 'upper', null],
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'reserved', 'blocked'],
    default: 'available'
  },
  adjacentSeatNumbers: [{
    type: String,
    trim: true
  }],
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  reservedUntil: {
    type: Date,
    default: null
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for performance (defined in schema with index: true)

// Method to check if seat is available for booking
seatSchema.methods.isAvailable = function() {
  return this.status === 'available' && 
         (!this.reservedUntil || new Date(this.reservedUntil) < new Date());
};

// Method to reserve seat temporarily
seatSchema.methods.reserve = function(userId, durationMinutes = 15) {
  this.status = 'reserved';
  this.reservedBy = userId;
  this.reservedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
  return this.save();
};

// Method to release reservation
seatSchema.methods.releaseReservation = function() {
  this.status = 'available';
  this.reservedBy = null;
  this.reservedUntil = null;
  return this.save();
};

// Method to book seat
seatSchema.methods.book = function(userId, bookingId) {
  this.status = 'booked';
  this.bookedBy = userId;
  this.bookingId = bookingId;
  this.reservedBy = null;
  this.reservedUntil = null;
  return this.save();
};

// Static method to release expired reservations
seatSchema.statics.releaseExpiredReservations = async function() {
  const now = new Date();
  const result = await this.updateMany(
    {
      status: 'reserved',
      reservedUntil: { $lt: now }
    },
    {
      $set: {
        status: 'available',
        reservedBy: null,
        reservedUntil: null
      }
    }
  );
  return result;
};

module.exports = mongoose.model('Seat', seatSchema);
