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

/**
 * Passenger-facing sleeper berth number.
 * Row 1: L01 / U01 (left), L02 / U02 (right)
 * Row 2: L03 / U03 (left), L04 / U04 (right)
 */
const sleeperSeatNumber = (row, position, berth) => {
  const n = (Number(row) - 1) * 2 + (position === 'right' ? 2 : 1);
  const pad = String(n).padStart(2, '0');
  return `${berth === 'upper' ? 'U' : 'L'}${pad}`;
};

const sleeperAdjacentNumber = (row, position, berth) =>
  sleeperSeatNumber(row, position, berth === 'upper' ? 'lower' : 'upper');

// ============================================================
// SLEEPER LAYOUT GENERATOR
//
// Layout: upper + lower berths on each side of a central aisle.
// Each row produces 4 seat records:
//   col 1 = left-lower  (L01, L03, ...)
//   col 2 = left-upper  (U01, U03, ...)
//   col 3 = right-lower (L02, L04, ...)
//   col 4 = right-upper (U02, U04, ...)
// ============================================================

const generateSleeperLayout = async (busId, scheduleId, seatConfig, baseFare) => {
  const { rows } = seatConfig;
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    const leftLower = sleeperSeatNumber(row, 'left', 'lower');
    const leftUpper = sleeperSeatNumber(row, 'left', 'upper');
    const rightLower = sleeperSeatNumber(row, 'right', 'lower');
    const rightUpper = sleeperSeatNumber(row, 'right', 'upper');

    seats.push({
      scheduleId,
      busId,
      seatNumber: leftLower,
      row,
      column: 1,
      seatType: 'window',
      position: 'left',
      berth: 'lower',
      status: 'available',
      adjacentSeatNumbers: [leftUpper],
      price: baseFare
    });

    seats.push({
      scheduleId,
      busId,
      seatNumber: leftUpper,
      row,
      column: 2,
      seatType: 'aisle',
      position: 'left',
      berth: 'upper',
      status: 'available',
      adjacentSeatNumbers: [leftLower],
      price: baseFare + 50
    });

    seats.push({
      scheduleId,
      busId,
      seatNumber: rightLower,
      row,
      column: 3,
      seatType: 'window',
      position: 'right',
      berth: 'lower',
      status: 'available',
      adjacentSeatNumbers: [rightUpper],
      price: baseFare
    });

    seats.push({
      scheduleId,
      busId,
      seatNumber: rightUpper,
      row,
      column: 4,
      seatType: 'aisle',
      position: 'right',
      berth: 'upper',
      status: 'available',
      adjacentSeatNumbers: [rightLower],
      price: baseFare + 50
    });
  }

  await Seat.insertMany(seats);
  return seats;
};

/**
 * Idempotent migration: rewrite legacy sleeper labels (01LL / 01RU)
 * to passenger berth numbers (L01 / U01) without dropping collections.
 * Also updates bookings and seat-change history that still store old labels.
 */
const migrateSleeperSeatNumbers = async () => {
  const Booking = require('../models/Booking');
  const SeatChangeHistory = require('../models/SeatChangeHistory');

  const sleeperSeats = await Seat.find({
    berth: { $in: ['lower', 'upper'] }
  });

  let updatedSeats = 0;

  for (const seat of sleeperSeats) {
    if (!seat.berth || !seat.position || !seat.row) continue;

    const nextNumber = sleeperSeatNumber(seat.row, seat.position, seat.berth);
    const nextAdjacent = sleeperAdjacentNumber(seat.row, seat.position, seat.berth);

    if (seat.seatNumber === nextNumber &&
        Array.isArray(seat.adjacentSeatNumbers) &&
        seat.adjacentSeatNumbers[0] === nextAdjacent) {
      continue;
    }

    const oldNumber = seat.seatNumber;

    await Seat.updateOne(
      { _id: seat._id },
      {
        $set: {
          seatNumber: nextNumber,
          adjacentSeatNumbers: [nextAdjacent]
        }
      }
    );

    if (oldNumber && oldNumber !== nextNumber) {
      await Booking.updateMany(
        { scheduleId: seat.scheduleId, seatNumber: oldNumber },
        { $set: { seatNumber: nextNumber } }
      );
      await SeatChangeHistory.updateMany(
        { scheduleId: seat.scheduleId, oldSeat: oldNumber },
        { $set: { oldSeat: nextNumber } }
      );
      await SeatChangeHistory.updateMany(
        { scheduleId: seat.scheduleId, newSeat: oldNumber },
        { $set: { newSeat: nextNumber } }
      );
    }

    updatedSeats += 1;
  }

  if (updatedSeats > 0) {
    console.log(`Migrated ${updatedSeats} sleeper berth labels to L/U numbering`);
  }

  return updatedSeats;
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
  if (!seat) {
    const berthMatch = String(seatNumber).match(/^([LU])(\d+)$/i);
    if (berthMatch) {
      const padded = `${berthMatch[1].toUpperCase()}${berthMatch[2].padStart(2, '0')}`;
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
  isSemiSleeper,
  sleeperSeatNumber,
  migrateSleeperSeatNumbers
};
