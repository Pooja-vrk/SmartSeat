const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.patch('/me', authenticate, updateProfile);
router.patch('/me/change-password', authenticate, changePassword);
router.get('/me/preferences', authenticate, getPreferences);
router.patch('/me/preferences', authenticate, updatePreferences);

module.exports = router;
