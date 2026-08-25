const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getBuses,
  createBus,
  updateBus,
  deleteBus,
  getBookings,
  getPassengers,
  getNotifications,
  getAnalytics,
  getSettings,
  updateSettings,
  createRoute,
  updateRoute,
  deleteRoute,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  reportDelay
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/dashboard', authenticate, requireAdmin, getDashboard);
router.get('/buses', authenticate, requireAdmin, getBuses);
router.post('/buses', authenticate, requireAdmin, createBus);
router.patch('/buses/:id', authenticate, requireAdmin, updateBus);
router.delete('/buses/:id', authenticate, requireAdmin, deleteBus);
router.get('/bookings', authenticate, requireAdmin, getBookings);
router.get('/passengers', authenticate, requireAdmin, getPassengers);
router.get('/notifications', authenticate, requireAdmin, getNotifications);
router.get('/analytics', authenticate, requireAdmin, getAnalytics);
router.get('/settings', authenticate, requireAdmin, getSettings);
router.patch('/settings', authenticate, requireAdmin, updateSettings);
router.post('/routes', authenticate, requireAdmin, createRoute);
router.patch('/routes/:id', authenticate, requireAdmin, updateRoute);
router.delete('/routes/:id', authenticate, requireAdmin, deleteRoute);
router.post('/schedules', authenticate, requireAdmin, createSchedule);
router.patch('/schedules/:id', authenticate, requireAdmin, updateSchedule);
router.delete('/schedules/:id', authenticate, requireAdmin, deleteSchedule);
router.post('/schedules/:id/delay', authenticate, requireAdmin, reportDelay);

module.exports = router;
