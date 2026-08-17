const express = require('express');
const router = express.Router();

const {
  getSchedule
} = require('../controllers/busController');

router.get('/:id', getSchedule);

module.exports = router;