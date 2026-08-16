const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { type, read } = req.query;

  const query = { userId: req.user.id };

  if (type) {
    query.type = type;
  }

  if (read !== undefined) {
    query.read = read === 'true';
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    data: notifications
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.markAsRead();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    userId: req.user.id,
    read: false
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});
