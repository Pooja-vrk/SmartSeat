const express = require('express');

const router =
  express.Router();

const {
  searchBuses,
  getBus,
  getBusSeats,
  getRoutes,
  getRouteStops
} = require('../controllers/busController');

// ============================================================
// IMPORTANT
// Static routes must be registered before /:id
// ============================================================

// GET /api/buses/routes/stops?from=...&to=...
router.get(
  '/routes/stops',
  getRouteStops
);

// GET /api/buses/routes/:id/stops
router.get(
  '/routes/:id/stops',
  getRouteStops
);

// GET /api/buses/stops?from=...&to=... (alias)
router.get(
  '/stops',
  getRouteStops
);

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