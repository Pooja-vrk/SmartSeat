const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
