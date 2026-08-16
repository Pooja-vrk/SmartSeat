const express = require('express');

const router =
  express.Router();

const {
  searchBuses,
  getBus,
  getBusSeats,
  getRoutes
} = require('../controllers/busController');

// ============================================================
// IMPORTANT
// Static routes must be registered before /:id
// ============================================================

// GET /api/buses/routes
router.get(
  '/routes',
  getRoutes
);

// GET /api/buses/search
router.get(
  '/search',
  searchBuses
);

// GET /api/buses/:id/seats?scheduleId=...
router.get(
  '/:id/seats',
  getBusSeats
);

// GET /api/buses/:id
router.get(
  '/:id',
  getBus
);

module.exports = router;