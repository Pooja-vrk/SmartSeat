const Seat = require('../models/Seat');

/**
 * Generate seat layout for a bus
 * @param {String} busId - Bus ID
 * @param {Object} seatConfig - Seat configuration
 * @returns {Array} Array of seat objects
 */
const generateSeatLayout = async (busId, scheduleId, seatConfig) => {
  const { rows, columns, aisleAfter } = seatConfig;
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const seatNumber = `${row.toString().padStart(2, '0')}${String.fromCharCode(64 + col)}`;
      const isAisle = col === aisleAfter + 1;
      
      // Determine position (left or right of aisle)
      const position = col <= aisleAfter ? 'left' : 'right';
      
      // Determine seat type
      let seatType = 'aisle';
      if (col === 1 || col === columns) {
        seatType = 'window';
      }
      
      // Calculate adjacent seats
      const adjacentSeatNumbers = [];
      if (col === 1) {
        adjacentSeatNumbers.push(`${row.toString().padStart(2, '0')}B`);
      } else if (col === 2) {
        adjacentSeatNumbers.push(`${row.toString().padStart(2, '0')}A`);
      } else if (col === 3) {
        adjacentSeatNumbers.push(`${row.toString().padStart(2, '0')}D`);
      } else if (col === 4) {
        adjacentSeatNumbers.push(`${row.toString().padStart(2, '0')}C`);
      }

      seats.push({
        scheduleId,
        busId,
        seatNumber,
        row,
        column: col,
        seatType,
        position,
        status: 'available',
        adjacentSeatNumbers,
        price: 450 // Default price, can be overridden
      });
    }
  }

  // Bulk insert seats
  await Seat.insertMany(seats);
  return seats;
};

/**
 * Find adjacent passenger for a given seat
 * @param {String} scheduleId - Schedule ID
 * @param {String} seatNumber - Seat number
 * @returns {Object} Adjacent passenger information
 */
const findAdjacentPassenger = async (scheduleId, seatNumber) => {
  // Find the seat (try exact match, or padded/unpadded variations)
  let seat = await Seat.findOne({ scheduleId, seatNumber });
  if (!seat) {
    const match = seatNumber.match(/^(\d+)([A-Z])$/i);
    if (match) {
      const paddedNumber = `${match[1].padStart(2, '0')}${match[2].toUpperCase()}`;
      seat = await Seat.findOne({ scheduleId, seatNumber: paddedNumber });
    }
  }
  if (!seat) return null;

  // Prepare seat numbers to check (both padded and unpadded)
  const numbersToCheck = [];
  (seat.adjacentSeatNumbers || []).forEach(adjNum => {
    numbersToCheck.push(adjNum);
    const m = adjNum.match(/^0*(\d+)([A-Z])$/i);
    if (m) {
      numbersToCheck.push(`${m[1]}${m[2].toUpperCase()}`);
      numbersToCheck.push(`${m[1].padStart(2, '0')}${m[2].toUpperCase()}`);
    }
  });

  // Find adjacent seats that are booked
  const adjacentSeats = await Seat.find({
    scheduleId,
    seatNumber: { $in: numbersToCheck },
    status: 'booked'
  }).populate('bookedBy', 'name email passengerCategory');

  if (!adjacentSeats || adjacentSeats.length === 0) return null;

  return adjacentSeats.map(adjacentSeat => ({
    seatNumber: adjacentSeat.seatNumber,
    passenger: {
      id: adjacentSeat.bookedBy ? adjacentSeat.bookedBy._id : null,
      name: adjacentSeat.bookedBy ? adjacentSeat.bookedBy.name : 'Passenger',
      passengerCategory: adjacentSeat.bookedBy ? adjacentSeat.bookedBy.passengerCategory : 'general'
    }
  })).filter(item => item.passenger.id);
};

/**
 * Release expired seat reservations
 */
const releaseExpiredReservations = async () => {
  try {
    const result = await Seat.releaseExpiredReservations();
    console.log(`Released ${result.modifiedCount} expired seat reservations`);
    return result;
  } catch (error) {
    console.error('Error releasing expired reservations:', error);
    throw error;
  }
};

/**
 * Get available seats for a schedule
 * @param {String} scheduleId - Schedule ID
 * @returns {Array} Available seats
 */
const getAvailableSeats = async (scheduleId) => {
  try {
    await releaseExpiredReservations();
    
    const availableSeats = await Seat.find({
      scheduleId,
      status: 'available'
    }).sort({ row: 1, column: 1 });

    return availableSeats;
  } catch (error) {
    console.error('Error getting available seats:', error);
    throw error;
  }
};

module.exports = {
  generateSeatLayout,
  findAdjacentPassenger,
  releaseExpiredReservations,
  getAvailableSeats
};
