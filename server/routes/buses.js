const express = require('express');
const router = express.Router();
const {
  searchBuses,
  getBus,
  getBusSeats,
  getRoutes
} = require('../controllers/busController');

router.get('/search', searchBuses);
router.get('/:id', getBus);
router.get('/:id/seats', getBusSeats);
router.get('/routes', getRoutes);

module.exports = router;
