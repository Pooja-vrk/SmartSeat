const User = require('../models/User');
const SmartSeatPreference = require('../models/SmartSeatPreference');
const smartSeatService = require('../services/smartSeatService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, profile } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (phone) fieldsToUpdate.phone = phone;
  if (profile) fieldsToUpdate.profile = profile;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      passengerCategory: user.passengerCategory,
      profile: user.profile
    }
  });
});

/**
 * @desc    Change password
 * @route   PATCH /api/users/me/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Get user preferences
 * @route   GET /api/users/me/preferences
 * @access  Private
 */
exports.getPreferences = asyncHandler(async (req, res, next) => {
  const preferences = await smartSeatService.getUserPreferences(req.user.id);

  res.status(200).json({
    success: true,
    data: preferences
  });
});

/**
 * @desc    Update user preferences
 * @route   PATCH /api/users/me/preferences
 * @access  Private
 */
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const preferences = await smartSeatService.updateUserPreferences(
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: preferences
  });
});
