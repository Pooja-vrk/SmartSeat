/**
 * ensureSchedules.js
 *
 * Safe, idempotent script that:
 *   1. Upserts any missing routes from ROUTE_DEFS.
 *   2. Upserts any missing buses from BUS_TEMPLATES.
 *   3. Creates template schedules (dayOffset 1..7) for every
 *      route+bus combination defined in SCHEDULE_DEFS — one
 *      per (busId, routeId, departureTime, travelDate) to avoid
 *      duplicates.
 *   4. Generates seat inventory for each new schedule.
 *
 * SAFETY:
 *   - NEVER deletes existing users, bookings, seats or schedules.
 *   - Checks for duplicate (busId, routeId, departureTime, travelDate)
 *     before inserting any schedule.
 *   - Checks for duplicate seats before generating.
 *   - Idempotent: safe to run multiple times.
 *
 * Usage:
 *   cd server && node scripts/ensureSchedules.js
 *   or via:
 *   npm run ensure-schedules   (package.json script)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Bus      = require('../models/Bus');
const Route    = require('../models/Route');
const Schedule = require('../models/Schedule');
const Seat     = require('../models/Seat');
const { generateSeatLayout } = require('../utils/seatUtils');
const { GST_RATE } = require('../config/gst');
const connectDB = require('../config/database');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** UTC midnight for today + n days */
const dayOffset = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ─────────────────────────────────────────────────────────────
// SEAT CONFIGURATIONS
// ─────────────────────────────────────────────────────────────

const SEAT_CFG = {
  seater:     { rows: 10, columns: 4, aisleAfter: 2, totalSeats: 40 },
  semiSleeper:{ rows: 12, columns: 3, aisleAfter: 2, totalSeats: 36 },
  sleeper:    { rows:  9, columns: 4, aisleAfter: 2, totalSeats: 36 },
};

// ─────────────────────────────────────────────────────────────
// BUS TEMPLATES  (identical to seed.js)
// ─────────────────────────────────────────────────────────────

const BUS_TEMPLATES = [
  { key: 'sleeper_ac_1',    operatorName: 'NightStar Travels', busNumber: 'NST-AC-001', busType: 'AC Sleeper',         registrationNumber: 'KA-01-AC-0001', cfg: SEAT_CFG.sleeper,      amenities: ['WiFi','USB Charging','Blanket','Water Bottle','Reading Light'], rating: 4.6 },
  { key: 'sleeper_ac_2',    operatorName: 'Royal Sleeper',     busNumber: 'RSL-AC-002', busType: 'AC Sleeper',         registrationNumber: 'MH-02-AC-0002', cfg: SEAT_CFG.sleeper,      amenities: ['WiFi','USB Charging','Blanket','Pillow','Water Bottle'],         rating: 4.4 },
  { key: 'sleeper_nonac_1', operatorName: 'Overnight Express', busNumber: 'OEX-NA-003', busType: 'Non-AC Sleeper',     registrationNumber: 'TN-03-NA-0003', cfg: SEAT_CFG.sleeper,      amenities: ['Water Bottle','Blanket'],                                         rating: 3.9 },
  { key: 'semi_ac_1',       operatorName: 'ComfortRide AC',    busNumber: 'CRA-SS-004', busType: 'AC Semi Sleeper',    registrationNumber: 'KL-04-AC-0004', cfg: SEAT_CFG.semiSleeper,  amenities: ['WiFi','USB Charging','Water Bottle'],                             rating: 4.3 },
  { key: 'semi_ac_2',       operatorName: 'VIP Travels',       busNumber: 'VIP-SS-005', busType: 'AC Semi Sleeper',    registrationNumber: 'AP-05-AC-0005', cfg: SEAT_CFG.semiSleeper,  amenities: ['WiFi','Water Bottle','USB Charging'],                             rating: 4.5 },
  { key: 'semi_nonac_1',    operatorName: 'Budget Comfort',    busNumber: 'BCX-SS-006', busType: 'Non-AC Semi Sleeper',registrationNumber: 'GJ-06-NA-0006', cfg: SEAT_CFG.semiSleeper,  amenities: ['Water Bottle'],                                                   rating: 3.7 },
  { key: 'seater_ac_1',     operatorName: 'City Connect AC',   busNumber: 'CCA-SE-007', busType: 'AC Seater',          registrationNumber: 'RJ-07-AC-0007', cfg: SEAT_CFG.seater,       amenities: ['WiFi','USB Charging','Water Bottle'],                             rating: 4.1 },
  { key: 'seater_ac_2',     operatorName: 'SmartBus Express',  busNumber: 'SBE-SE-008', busType: 'AC Seater',          registrationNumber: 'DL-08-AC-0008', cfg: SEAT_CFG.seater,       amenities: ['WiFi','Water Bottle','USB Charging'],                             rating: 4.2 },
  { key: 'seater_nonac_1',  operatorName: 'Economy Rides',     busNumber: 'ECO-SE-009', busType: 'Non-AC Seater',      registrationNumber: 'MH-09-NA-0009', cfg: SEAT_CFG.seater,       amenities: ['Water Bottle'],                                                   rating: 3.6 },
  { key: 'seater_ac_3',     operatorName: 'Metro Fast',        busNumber: 'MFA-SE-010', busType: 'AC Seater',          registrationNumber: 'TN-10-AC-0010', cfg: SEAT_CFG.seater,       amenities: ['WiFi','USB Charging','Water Bottle'],                             rating: 4.0 },
  { key: 'multiaxle_ac_1',  operatorName: 'LuxeCoach',         busNumber: 'LCX-MA-011', busType: 'AC Multi-Axle',      registrationNumber: 'KA-11-AC-0011', cfg: SEAT_CFG.seater,       amenities: ['WiFi','USB Charging','Water Bottle','TV'],                        rating: 4.7 },
];

// ─────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS  — 22 routes (18 original + 4 new)
// ─────────────────────────────────────────────────────────────

// Helper to build structured stops for any route
function makeStops(source, destination, intermediate = []) {
  const stops = [];
  let seq = 1;

  // Pickup stop 1 (Source Main)
  stops.push({
    name: `${source} Main`,
    city: source,
    type: 'pickup',
    sequence: seq++,
    arrivalTime: null,
    departureTime: null
  });

  // Pickup stop 2 (Source Outer/Junction)
  if (source === 'Hyderabad') {
    stops.push({ name: 'LB Nagar', city: 'Hyderabad', type: 'pickup', sequence: seq++, arrivalTime: null, departureTime: null });
  } else if (source === 'Bengaluru' || source === 'Bangalore') {
    stops.push({ name: 'Electronic City', city: 'Bengaluru', type: 'pickup', sequence: seq++, arrivalTime: null, departureTime: null });
  } else if (source === 'Chennai') {
    stops.push({ name: 'Guindy', city: 'Chennai', type: 'pickup', sequence: seq++, arrivalTime: null, departureTime: null });
  }

  // Intermediate stops
  for (const item of intermediate) {
    const name = typeof item === 'string' ? item : item.name;
    const city = typeof item === 'string' ? item : (item.city || item.name);
    stops.push({
      name,
      city,
      type: 'both',
      sequence: seq++,
      arrivalTime: null,
      departureTime: null
    });
  }

  // Dropping stop 1 (Destination Main)
  const destMainName = destination === 'Chennai' ? 'CMBT'
    : destination === 'Hyderabad' ? 'MGBS'
    : destination === 'Bengaluru' || destination === 'Bangalore' ? 'Majestic'
    : `${destination} Central`;

  stops.push({
    name: destMainName,
    city: destination,
    type: 'drop',
    sequence: seq++,
    arrivalTime: null,
    departureTime: null
  });

  // Dropping stop 2 (Destination Outer)
  if (destination === 'Chennai') {
    stops.push({ name: 'Tambaram', city: 'Chennai', type: 'drop', sequence: seq++, arrivalTime: null, departureTime: null });
  } else if (destination === 'Hyderabad') {
    stops.push({ name: 'Ameerpet', city: 'Hyderabad', type: 'drop', sequence: seq++, arrivalTime: null, departureTime: null });
  } else if (destination === 'Bengaluru' || destination === 'Bangalore') {
    stops.push({ name: 'Hebbal', city: 'Bengaluru', type: 'drop', sequence: seq++, arrivalTime: null, departureTime: null });
  }

  return stops;
}

const ROUTE_DEFS = [
  { source: 'Bengaluru',   destination: 'Chennai',            stops: makeStops('Bengaluru', 'Chennai', ['Hosur', 'Krishnagiri', 'Vellore']),          distance: 345, duration: '6h 00m' },
  { source: 'Bengaluru',   destination: 'Hyderabad',          stops: makeStops('Bengaluru', 'Hyderabad', ['Anantapur', 'Kurnool']),                   distance: 570, duration: '9h 30m' },
  { source: 'Bengaluru',   destination: 'Mysuru',             stops: makeStops('Bengaluru', 'Mysuru', ['Mandya']),                                     distance: 145, duration: '3h 00m' },
  { source: 'Bengaluru',   destination: 'Kochi',              stops: makeStops('Bengaluru', 'Kochi', ['Salem', 'Coimbatore', 'Thrissur']),             distance: 545, duration: '9h 00m' },
  { source: 'Bengaluru',   destination: 'Mangaluru',          stops: makeStops('Bengaluru', 'Mangaluru', ['Hassan', 'Sakleshpur']),                    distance: 352, duration: '7h 00m' },
  { source: 'Chennai',     destination: 'Bengaluru',          stops: makeStops('Chennai', 'Bengaluru', ['Vellore', 'Krishnagiri', 'Hosur']),          distance: 345, duration: '6h 00m' },
  { source: 'Chennai',     destination: 'Coimbatore',         stops: makeStops('Chennai', 'Coimbatore', ['Vellore', 'Salem', 'Erode']),                distance: 495, duration: '8h 30m' },
  { source: 'Chennai',     destination: 'Madurai',            stops: makeStops('Chennai', 'Madurai', ['Villupuram', 'Trichy']),                       distance: 463, duration: '7h 30m' },
  { source: 'Hyderabad',   destination: 'Bengaluru',          stops: makeStops('Hyderabad', 'Bengaluru', ['Kurnool', 'Anantapur']),                   distance: 570, duration: '9h 30m' },
  { source: 'Hyderabad',   destination: 'Vijayawada',         stops: makeStops('Hyderabad', 'Vijayawada', ['Suryapet', 'Guntur']),                    distance: 275, duration: '5h 00m' },
  { source: 'Mumbai',      destination: 'Pune',               stops: makeStops('Mumbai', 'Pune', ['Thane', 'Lonavala']),                              distance: 150, duration: '3h 30m' },
  { source: 'Mumbai',      destination: 'Goa',                stops: makeStops('Mumbai', 'Goa', ['Alibaug', 'Ratnagiri', 'Panaji']),                   distance: 594, duration: '10h 00m' },
  { source: 'Pune',        destination: 'Mumbai',             stops: makeStops('Pune', 'Mumbai', ['Lonavala', 'Thane', 'Dadar']),                     distance: 150, duration: '3h 30m' },
  { source: 'Delhi',       destination: 'Jaipur',             stops: makeStops('Delhi', 'Jaipur', ['Gurgaon', 'Manesar', 'Kotputli']),                distance: 280, duration: '5h 30m' },
  { source: 'Delhi',       destination: 'Chandigarh',         stops: makeStops('Delhi', 'Chandigarh', ['Panipat', 'Karnal', 'Ambala']),               distance: 250, duration: '4h 30m' },
  { source: 'Kochi',       destination: 'Thiruvananthapuram', stops: makeStops('Kochi', 'Thiruvananthapuram', ['Alappuzha', 'Kollam']),               distance: 210, duration: '4h 00m' },
  { source: 'Kochi',       destination: 'Kozhikode',          stops: makeStops('Kochi', 'Kozhikode', ['Thrissur', 'Malappuram']),                     distance: 190, duration: '4h 30m' },
  { source: 'Coimbatore',  destination: 'Bengaluru',          stops: makeStops('Coimbatore', 'Bengaluru', ['Salem', 'Hosur']),                         distance: 360, duration: '6h 30m' },

  // ── IMPORTANT HIGH-DEMAND ROUTES ──
  { source: 'Coimbatore',  destination: 'Chennai',            stops: makeStops('Coimbatore', 'Chennai', ['Erode', 'Salem', 'Vellore']),               distance: 495, duration: '8h 30m' },
  { source: 'Coimbatore',  destination: 'Hyderabad',          stops: makeStops('Coimbatore', 'Hyderabad', ['Salem', 'Bengaluru', 'Kurnool']),          distance: 930, duration: '14h 00m' },
  { source: 'Chennai',     destination: 'Hyderabad',          stops: makeStops('Chennai', 'Hyderabad', ['Nellore', 'Ongole', 'Vijayawada']),          distance: 628, duration: '10h 00m' },
  { source: 'Hyderabad',   destination: 'Chennai',            stops: makeStops('Hyderabad', 'Chennai', ['Vijayawada', 'Ongole', 'Nellore']),          distance: 628, duration: '10h 00m' },
];

// ─────────────────────────────────────────────────────────────
// SCHEDULE DEFINITIONS
// Format: [busKey, routeIndex(0-based), dayOffset, dep, arr, baseFare]
// Days 1..7 give us a full week of templates for ensureSchedulesForDate to clone.
// ─────────────────────────────────────────────────────────────

const SCHEDULE_DEFS = [
  // Bengaluru → Chennai  (index 0)
  ['sleeper_ac_1',    0, 1, '21:00', '03:00', 650],
  ['semi_ac_1',       0, 2, '22:00', '04:30', 480],
  ['seater_ac_1',     0, 3, '06:00', '12:00', 350],
  ['sleeper_nonac_1', 0, 4, '22:30', '05:00', 400],
  // Bengaluru → Hyderabad  (index 1)
  ['sleeper_ac_2',    1, 1, '20:00', '05:30', 750],
  ['semi_ac_2',       1, 2, '21:30', '07:00', 550],
  ['seater_ac_2',     1, 3, '07:00', '16:30', 400],
  // Bengaluru → Mysuru  (index 2)
  ['seater_ac_1',     2, 1, '07:00', '10:00', 200],
  ['seater_ac_3',     2, 2, '14:00', '17:00', 200],
  ['semi_nonac_1',    2, 3, '09:00', '12:00', 180],
  // Bengaluru → Kochi  (index 3)
  ['sleeper_ac_1',    3, 1, '19:00', '04:00', 850],
  ['sleeper_ac_2',    3, 2, '20:00', '05:00', 800],
  ['semi_ac_1',       3, 3, '21:00', '06:00', 600],
  // Bengaluru → Mangaluru  (index 4)
  ['semi_ac_2',       4, 1, '22:00', '05:00', 500],
  ['sleeper_ac_1',    4, 2, '21:00', '04:00', 700],
  ['seater_nonac_1',  4, 3, '06:00', '13:00', 280],
  // Chennai → Bengaluru  (index 5)
  ['sleeper_ac_2',    5, 1, '22:00', '04:00', 650],
  ['seater_ac_2',     5, 2, '06:30', '12:30', 350],
  ['semi_ac_1',       5, 3, '21:00', '03:30', 480],
  // Chennai → Coimbatore  (index 6)
  ['semi_ac_2',       6, 1, '22:00', '06:30', 550],
  ['sleeper_nonac_1', 6, 2, '21:00', '05:30', 380],
  ['seater_ac_3',     6, 3, '07:00', '15:30', 320],
  // Chennai → Madurai  (index 7)
  ['sleeper_ac_1',    7, 1, '22:00', '05:30', 700],
  ['semi_nonac_1',    7, 2, '23:00', '06:30', 400],
  ['seater_nonac_1',  7, 3, '08:00', '15:30', 300],
  // Hyderabad → Bengaluru  (index 8)
  ['sleeper_ac_2',    8, 1, '21:00', '06:30', 750],
  ['semi_ac_1',       8, 2, '22:00', '07:30', 550],
  ['seater_ac_1',     8, 3, '06:00', '15:30', 400],
  // Hyderabad → Vijayawada  (index 9)
  ['seater_ac_2',     9, 1, '07:00', '12:00', 300],
  ['semi_ac_2',       9, 2, '22:00', '03:00', 400],
  ['sleeper_ac_1',    9, 3, '23:00', '04:00', 600],
  // Mumbai → Pune  (index 10)
  ['seater_ac_3',    10, 1, '07:00', '10:30', 250],
  ['multiaxle_ac_1', 10, 2, '08:00', '11:30', 450],
  ['semi_nonac_1',   10, 3, '22:00', '01:30', 200],
  // Mumbai → Goa  (index 11)
  ['sleeper_ac_2',   11, 1, '22:00', '08:00', 900],
  ['semi_ac_1',      11, 2, '21:00', '07:00', 650],
  ['seater_nonac_1', 11, 3, '07:00', '17:00', 400],
  // Pune → Mumbai  (index 12)
  ['seater_ac_1',    12, 1, '06:30', '10:00', 250],
  ['multiaxle_ac_1', 12, 2, '09:00', '12:30', 450],
  // Delhi → Jaipur  (index 13)
  ['seater_ac_2',    13, 1, '06:00', '11:30', 350],
  ['semi_ac_2',      13, 2, '22:00', '03:30', 500],
  ['sleeper_ac_1',   13, 3, '23:00', '04:30', 700],
  // Delhi → Chandigarh  (index 14)
  ['seater_ac_3',    14, 1, '07:00', '11:30', 300],
  ['semi_nonac_1',   14, 2, '22:00', '02:30', 350],
  // Kochi → Thiruvananthapuram  (index 15)
  ['seater_ac_1',    15, 1, '07:00', '11:00', 220],
  ['semi_ac_1',      15, 2, '22:00', '02:00', 300],
  ['sleeper_nonac_1',15, 3, '23:00', '03:00', 350],
  // Kochi → Kozhikode  (index 16)
  ['seater_ac_2',    16, 1, '08:00', '12:30', 250],
  ['semi_ac_2',      16, 2, '21:00', '01:30', 380],
  ['sleeper_ac_2',   16, 3, '22:00', '02:30', 550],
  // Coimbatore → Bengaluru  (index 17)
  ['seater_nonac_1', 17, 1, '07:00', '13:30', 320],
  ['semi_ac_1',      17, 2, '22:00', '04:30', 480],
  ['sleeper_ac_1',   17, 3, '23:00', '05:30', 700],

  // ── NEW: Coimbatore → Chennai  (index 18) ──
  ['semi_ac_2',       18, 1, '22:00', '06:30', 550],
  ['sleeper_ac_1',    18, 2, '21:00', '05:30', 700],
  ['seater_ac_3',     18, 3, '07:00', '15:30', 320],
  ['sleeper_nonac_1', 18, 4, '22:30', '07:00', 400],

  // ── NEW: Coimbatore → Hyderabad  (index 19) ──
  ['sleeper_ac_2',    19, 1, '18:00', '08:00', 950],
  ['semi_ac_1',       19, 2, '19:00', '09:00', 700],

  // ── NEW: Chennai → Hyderabad  (index 20) ──
  ['sleeper_ac_1',    20, 1, '20:00', '06:00', 800],
  ['seater_ac_2',     20, 2, '07:00', '17:00', 500],
  ['semi_ac_2',       20, 3, '21:00', '07:00', 650],

  // ── NEW: Hyderabad → Chennai  (index 21) ──
  ['sleeper_ac_2',    21, 1, '20:30', '06:30', 800],
  ['seater_ac_1',     21, 2, '07:00', '17:00', 500],
  ['semi_nonac_1',    21, 3, '21:30', '07:30', 550],
];

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function ensureSchedules() {
  await connectDB();
  console.log('Connected to MongoDB');

  let routesUpserted = 0;
  let busesUpserted  = 0;
  let schedulesCreated = 0;
  let seatsCreated   = 0;
  let skipped        = 0;

  // ── 1. UPSERT ROUTES ──────────────────────────────────────

  console.log('Upserting routes...');
  const routeMap = {}; // "source|destination" → Route doc

  for (let i = 0; i < ROUTE_DEFS.length; i++) {
    const rd = ROUTE_DEFS[i];
    const existing = await Route.findOne({
      source: rd.source,
      destination: rd.destination
    });

    if (existing) {
      if (!existing.stops || existing.stops.length === 0 || typeof existing.stops[0] === 'string' || !existing.stops[0].name) {
        existing.stops = rd.stops;
        await existing.save();
        console.log(`  ~ Updated stops for Route: ${rd.source} → ${rd.destination}`);
      }
      routeMap[i] = existing;
    } else {
      const created = await Route.create({
        source: rd.source,
        destination: rd.destination,
        stops: rd.stops,
        distance: rd.distance,
        estimatedDuration: rd.duration,
        isActive: true
      });
      routeMap[i] = created;
      routesUpserted++;
      console.log(`  + Route: ${rd.source} → ${rd.destination}`);
    }
  }

  // ── 2. UPSERT BUSES ───────────────────────────────────────

  console.log('Upserting buses...');
  const busMap = {}; // key → Bus doc

  for (const tmpl of BUS_TEMPLATES) {
    const existing = await Bus.findOne({ busNumber: tmpl.busNumber });
    if (existing) {
      busMap[tmpl.key] = existing;
    } else {
      const created = await Bus.create({
        operatorName:       tmpl.operatorName,
        busNumber:          tmpl.busNumber,
        busType:            tmpl.busType,
        registrationNumber: tmpl.registrationNumber,
        seatConfiguration:  tmpl.cfg,
        amenities:          tmpl.amenities,
        boardingPoints:     [],
        droppingPoints:     [],
        isActive:           true,
        rating:             tmpl.rating,
        totalRatings:       50,
      });
      busMap[tmpl.key] = created;
      busesUpserted++;
      console.log(`  + Bus: ${tmpl.busNumber} (${tmpl.busType})`);
    }
  }

  // ── 3. CREATE MISSING SCHEDULES (days 1..7) ───────────────

  console.log('Ensuring schedules for the next 7 days...');

  for (const [busKey, routeIdx, day, dep, arr, baseFare] of SCHEDULE_DEFS) {
    const bus   = busMap[busKey];
    const route = routeMap[routeIdx];

    if (!bus || !route) {
      console.warn(`  SKIP: busKey=${busKey} or routeIdx=${routeIdx} not resolved`);
      continue;
    }

    const travelDate = dayOffset(day);

    // Deduplication: same bus + route + departure time + date = duplicate
    const dupCheck = await Schedule.findOne({
      busId:         bus._id,
      routeId:       route._id,
      departureTime: dep,
      travelDate:    {
        $gte: new Date(travelDate.getTime()),
        $lt:  new Date(travelDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (dupCheck) {
      skipped++;
      // Make sure seats exist for this schedule
      const seatCount = await Seat.countDocuments({ scheduleId: dupCheck._id });
      if (seatCount === 0) {
        await generateSeatLayout(bus._id, dupCheck._id, bus.seatConfiguration, bus.busType, baseFare);
        seatsCreated += bus.seatConfiguration.totalSeats;
        console.log(`  + Seats created for existing schedule ${dupCheck._id} (was missing)`);
      }
      continue;
    }

    // Create schedule
    const totalSeats = bus.seatConfiguration.totalSeats;
    const schedule = await Schedule.create({
      busId:          bus._id,
      routeId:        route._id,
      departureTime:  dep,
      arrivalTime:    arr,
      travelDate,
      fare:           baseFare,
      isActive:       true,
      availableSeats: totalSeats,
    });

    // Generate seat inventory
    await generateSeatLayout(bus._id, schedule._id, bus.seatConfiguration, bus.busType, baseFare);

    schedulesCreated++;
    seatsCreated += totalSeats;
    console.log(`  + Schedule: ${route.source} → ${route.destination}  bus=${bus.busNumber}  date=${travelDate.toISOString().split('T')[0]}  dep=${dep}`);
  }

  // ── 4. VERIFY ─────────────────────────────────────────────

  console.log('\n── Verification ──────────────────────────────────────');

  const verifyRoutes = [
    { from: 'Coimbatore', to: 'Chennai'    },
    { from: 'Bengaluru',  to: 'Chennai'    },
    { from: 'Chennai',    to: 'Hyderabad'  },
    { from: 'Mumbai',     to: 'Pune'       },
  ];

  for (const { from, to } of verifyRoutes) {
    const route = await Route.findOne({ source: from, destination: to });
    if (!route) {
      console.log(`  ✗ Route NOT FOUND: ${from} → ${to}`);
      continue;
    }
    const tomorrow = dayOffset(1);
    const tmStart  = new Date(tomorrow); tmStart.setUTCHours(0, 0, 0, 0);
    const tmEnd    = new Date(tomorrow); tmEnd.setUTCHours(23, 59, 59, 999);

    const schedCount = await Schedule.countDocuments({
      routeId:    route._id,
      isActive:   true,
      travelDate: { $gte: tmStart, $lte: tmEnd },
    });

    const seatCount = await Seat.countDocuments({
      scheduleId: {
        $in: await Schedule.find({
          routeId:    route._id,
          isActive:   true,
          travelDate: { $gte: tmStart, $lte: tmEnd },
        }).distinct('_id'),
      },
    });

    console.log(`  ${schedCount > 0 ? '✓' : '✗'} ${from} → ${to}  | schedules tomorrow: ${schedCount}  seats: ${seatCount}`);
  }

  console.log('\n── Summary ───────────────────────────────────────────');
  console.log(`Routes upserted:    ${routesUpserted}`);
  console.log(`Buses upserted:     ${busesUpserted}`);
  console.log(`Schedules created:  ${schedulesCreated}`);
  console.log(`Seats created:      ${seatsCreated}`);
  console.log(`Schedules skipped (already existed): ${skipped}`);
  console.log('\nDone — no existing data was deleted.');

  await mongoose.disconnect();
  process.exit(0);
}

ensureSchedules().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
