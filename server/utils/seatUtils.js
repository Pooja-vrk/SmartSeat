const Seat = require('../models/Seat');

// ============================================================
// SEAT TYPE HELPERS
// ============================================================

/**
 * Return true if the busType string indicates a Sleeper bus.
 */
const isSleeper = (busType = '') =>
  /sleeper/i.test(busType);

/**
 * Return true if the busType string indicates a Semi-Sleeper bus.
 */
const isSemiSleeper = (busType = '') =>
  /semi[\s-]?sleeper/i.test(busType);

// ============================================================
// SLEEPER LAYOUT GENERATOR
//
// Layout: upper + lower berths on each side of a central aisle.
// Each row produces 4 seat records:
//   col 1 = left-lower  (e.g. 01L)
//   col 2 = left-upper  (e.g. 01U)
//   col 3 = right-lower (e.g. 01RL)   mapped internally as col 3 / col 4
//   col 4 = right-upper (e.g. 01RU)
//
// seatNumber format: {ROW_PADDED}{L|U} for left side,
//                    {ROW_PADDED}R{L|U} for right side.
// ============================================================

const generateSleeperLayout = async (busId, scheduleId, seatConfig, baseFare) => {
  const { rows } = seatConfig;
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    const rowPad = String(row).padStart(2, '0');

    // Left Lower
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}LL`,
      row,
      column: 1,
      seatType: 'window',
      position: 'left',
      berth: 'lower',
      status: 'available',
      adjacentSeatNumbers: [`${rowPad}LU`],
      price: baseFare
    });

    // Left Upper
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}LU`,
      row,
      column: 2,
      seatType: 'aisle',
      position: 'left',
      berth: 'upper',
      status: 'available',
      adjacentSeatNumbers: [`${rowPad}LL`],
      price: baseFare + 50   // upper berth slight premium
    });

    // Right Lower
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}RL`,
      row,
      column: 3,
      seatType: 'window',
      position: 'right',
      berth: 'lower',
      status: 'available',
      adjacentSeatNumbers: [`${rowPad}RU`],
      price: baseFare
    });

    // Right Upper
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}RU`,
      row,
      column: 4,
      seatType: 'aisle',
      position: 'right',
      berth: 'upper',
      status: 'available',
      adjacentSeatNumbers: [`${rowPad}RL`],
      price: baseFare + 50
    });
  }

  await Seat.insertMany(seats);
  return seats;
};

// ============================================================
// SEMI-SLEEPER LAYOUT GENERATOR
//
// 2 seats on the left + 1 seat on the right of a central aisle.
// Wider seats, all on the same level (no upper/lower).
// seatNumber: {ROW}{A|B} left side, {ROW}{C} right side.
// ============================================================

const generateSemiSleeperLayout = async (busId, scheduleId, seatConfig, baseFare) => {
  const { rows } = seatConfig;
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    const rowPad = String(row).padStart(2, '0');

    // Left seat A (window)
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}A`,
      row,
      column: 1,
      seatType: 'window',
      position: 'left',
      berth: null,
      status: 'available',
      adjacentSeatNumbers: [`${rowPad}B`],
      price: baseFare
    });

    // Left seat B (aisle)
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}B`,
      row,
      column: 2,
      seatType: 'aisle',
      position: 'left',
      berth: null,
      status: 'available',
      adjacentSeatNumbers: [`${rowPad}A`],
      price: baseFare
    });

    // Right seat C (window on right)
    seats.push({
      scheduleId,
      busId,
      seatNumber: `${rowPad}C`,
      row,
      column: 3,
      seatType: 'window',
      position: 'right',
      berth: null,
      status: 'available',
      adjacentSeatNumbers: [],
      price: baseFare
    });
  }

  await Seat.insertMany(seats);
  return seats;
};

// ============================================================
// SEATER LAYOUT GENERATOR  (2 + 2 columns)
//
// seatNumber: {ROW}{A|B|C|D}
//   A = left window, B = left aisle, C = right aisle, D = right window
// ============================================================

const generateSeaterLayout = async (busId, scheduleId, seatConfig, baseFare) => {
  const { rows, columns, aisleAfter } = seatConfig;
  const seats = [];
  const colCount = columns || 4;
  const aisle = aisleAfter || 2;

  for (let row = 1; row <= rows; row++) {
    const rowPad = String(row).padStart(2, '0');

    for (let col = 1; col <= colCount; col++) {
      const seatNumber = `${rowPad}${String.fromCharCode(64 + col)}`;

      let seatType = 'aisle';
      if (col === 1 || col === colCount) seatType = 'window';

      const position = col <= aisle ? 'left' : 'right';

      const adjacentSeatNumbers = [];
      if (col === 1) adjacentSeatNumbers.push(`${rowPad}B`);
      else if (col === 2) adjacentSeatNumbers.push(`${rowPad}A`);
      else if (col === 3) adjacentSeatNumbers.push(`${rowPad}D`);
      else if (col === 4) adjacentSeatNumbers.push(`${rowPad}C`);

      seats.push({
        scheduleId,
        busId,
        seatNumber,
        row,
        column: col,
        seatType,
        position,
        berth: null,
        status: 'available',
        adjacentSeatNumbers,
        price: baseFare
      });
    }
  }

  await Seat.insertMany(seats);
  return seats;
};

// ============================================================
// PUBLIC: generateSeatLayout
//
// Dispatches to the right generator based on busType.
// Backwards-compatible: busType defaults to 'AC Seater' if
// omitted so old callers that don't pass it still work.
// ============================================================

const generateSeatLayout = async (busId, scheduleId, seatConfig, busType = 'AC Seater', baseFare = 450) => {
  if (isSleeper(busType) && !isSemiSleeper(busType)) {
    return generateSleeperLayout(busId, scheduleId, seatConfig, baseFare);
  }

  if (isSemiSleeper(busType)) {
    return generateSemiSleeperLayout(busId, scheduleId, seatConfig, baseFare);
  }

  return generateSeaterLayout(busId, scheduleId, seatConfig, baseFare);
};

// ============================================================
// findAdjacentPassenger
// ============================================================

const findAdjacentPassenger = async (scheduleId, seatNumber) => {
  let seat = await Seat.findOne({ scheduleId, seatNumber });
  if (!seat) {
    const match = seatNumber.match(/^(\d+)([A-Z]+)$/i);
    if (match) {
      const padded = `${match[1].padStart(2, '0')}${match[2].toUpperCase()}`;
      seat = await Seat.findOne({ scheduleId, seatNumber: padded });
    }
  }
  if (!seat) return null;

  const numbersToCheck = [];
  (seat.adjacentSeatNumbers || []).forEach((adjNum) => {
    numbersToCheck.push(adjNum);
    const m = adjNum.match(/^0*(\d+)([A-Z]+)$/i);
    if (m) {
      numbersToCheck.push(`${m[1]}${m[2].toUpperCase()}`);
      numbersToCheck.push(`${m[1].padStart(2, '0')}${m[2].toUpperCase()}`);
    }
  });

  const adjacentSeats = await Seat.find({
    scheduleId,
    seatNumber: { $in: numbersToCheck },
    status: 'booked'
  }).populate('bookedBy', 'name email passengerCategory');

  if (!adjacentSeats || adjacentSeats.length === 0) return null;

  return adjacentSeats
    .map((adjacentSeat) => ({
      seatNumber: adjacentSeat.seatNumber,
      passenger: {
        id: adjacentSeat.bookedBy ? adjacentSeat.bookedBy._id : null,
        name: adjacentSeat.bookedBy ? adjacentSeat.bookedBy.name : 'Passenger',
        passengerCategory: adjacentSeat.bookedBy
          ? adjacentSeat.bookedBy.passengerCategory
          : 'general'
      }
    }))
    .filter((item) => item.passenger.id);
};

// ============================================================
// releaseExpiredReservations
// ============================================================

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

// ============================================================
// getAvailableSeats
// ============================================================

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
  getAvailableSeats,
  isSleeper,
  isSemiSleeper
};
