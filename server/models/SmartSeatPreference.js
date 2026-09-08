const mongoose = require('mongoose');

const smartSeatPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  notifyAdjacentSeatChange: {
    type: Boolean,
    default: true
  },
  preferredAdjacentCondition: {
    type: String,
    enum: ['no_preference', 'same_category', 'empty_adjacent', 'any'],
    default: 'no_preference'
  },
  showPermittedPassengerCategory: {
    type: Boolean,
    default: false
  },
  allowSeatRecommendations: {
    type: Boolean,
    default: true
  },
  sectionPreference: {
    type: String,
    enum: ['front', 'middle', 'rear'],
    default: 'middle'
  },
  windowPreference: {
    type: Boolean,
    default: true
  },
  accessibilityPriority: {
    type: Boolean,
    default: false
  },
  // Profile Visibility: when true, the passenger's name and gender are shown
  // to other passengers in the seat-map popup. Default is false (hidden).
  // Existing documents that lack this field are treated as false by the backend.
  profileVisibility: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SmartSeatPreference', smartSeatPreferenceSchema);
