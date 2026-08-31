require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const SmartSeatPreference = require('../models/SmartSeatPreference');
const { generateSeatLayout } = require('../utils/seatUtils');
const { GST_RATE } = require('../config/gst');
const connectDB = require('../config/database');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Return a Date set to UTC midnight N days from now */
const dayOffset = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/** GST-inclusive total fare */
const withGST = (base) => Math.round((base + base * (GST_RATE / 100)) * 100) / 100;

// ─────────────────────────────────────────────────────────────
// SEAT CONFIGURATIONS  (per bus type)
// ─────────────────────────────────────────────────────────────

/**
 * Seater:      10 rows × 4 cols (2+aisle+2),  40 seats
 * Semi-Sleeper: 12 rows × 3 cols (2+aisle+1), 36 seats
 * Sleeper:      9 rows × 4 berths (LL/LU/RL/RU), 36 berths
 */
const SEAT_CFG = {
  seater: { rows: 10, columns: 4, aisleAfter: 2, totalSeats: 40 },
  semiSleeper: { rows: 12, columns: 3, aisleAfter: 2, totalSeats: 36 },
  sleeper: { rows: 9, columns: 4, aisleAfter: 2, totalSeats: 36 }
};

// ─────────────────────────────────────────────────────────────
// BUS TEMPLATE DATA
// ─────────────────────────────────────────────────────────────

const BUS_TEMPLATES = [
  // ── SLEEPER (AC) ──
  {
    key: 'sleeper_ac_1',
    operatorName: 'NightStar Travels',
    busNumber: 'NST-AC-001',
    busType: 'AC Sleeper',
    registrationNumber: 'KA-01-AC-0001',
    cfg: SEAT_CFG.sleeper,
    amenities: ['WiFi', 'USB Charging', 'Blanket', 'Water Bottle', 'Reading Light'],
    rating: 4.6
  },
  {
    key: 'sleeper_ac_2',
    operatorName: 'Royal Sleeper',
    busNumber: 'RSL-AC-002',
    busType: 'AC Sleeper',
    registrationNumber: 'MH-02-AC-0002',
    cfg: SEAT_CFG.sleeper,
    amenities: ['WiFi', 'USB Charging', 'Blanket', 'Pillow', 'Water Bottle', 'AC'],
    rating: 4.4
  },
  {
    key: 'sleeper_nonac_1',
    operatorName: 'Overnight Express',
    busNumber: 'OEX-NA-003',
    busType: 'Non-AC Sleeper',
    registrationNumber: 'TN-03-NA-0003',
    cfg: SEAT_CFG.sleeper,
    amenities: ['Water Bottle', 'Blanket'],
    rating: 3.9
  },
  // ── SEMI-SLEEPER (AC) ──
  {
    key: 'semi_ac_1',
    operatorName: 'ComfortRide AC',
    busNumber: 'CRA-SS-004',
    busType: 'AC Semi Sleeper',
    registrationNumber: 'KL-04-AC-0004',
    cfg: SEAT_CFG.semiSleeper,
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'AC'],
    rating: 4.3
  },
  {
    key: 'semi_ac_2',
    operatorName: 'VIP Travels',
    busNumber: 'VIP-SS-005',
    busType: 'AC Semi Sleeper',
    registrationNumber: 'AP-05-AC-0005',
    cfg: SEAT_CFG.semiSleeper,
    amenities: ['WiFi', 'Water Bottle', 'USB Charging', 'AC', 'Snacks'],
    rating: 4.5
  },
  {
    key: 'semi_nonac_1',
    operatorName: 'Budget Comfort',
    busNumber: 'BCX-SS-006',
    busType: 'Non-AC Semi Sleeper',
    registrationNumber: 'GJ-06-NA-0006',
    cfg: SEAT_CFG.semiSleeper,
    amenities: ['Water Bottle'],
    rating: 3.7
  },
  // ── SEATER (AC) ──
  {
    key: 'seater_ac_1',
    operatorName: 'City Connect AC',
    busNumber: 'CCA-SE-007',
    busType: 'AC Seater',
    registrationNumber: 'RJ-07-AC-0007',
    cfg: SEAT_CFG.seater,
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'AC'],
    rating: 4.1
  },
  {
    key: 'seater_ac_2',
    operatorName: 'SmartBus Express',
    busNumber: 'SBE-SE-008',
    busType: 'AC Seater',
    registrationNumber: 'DL-08-AC-0008',
    cfg: SEAT_CFG.seater,
    amenities: ['WiFi', 'AC', 'Water Bottle', 'USB Charging'],
    rating: 4.2
  },
  {
    key: 'seater_nonac_1',
    operatorName: 'Economy Rides',
    busNumber: 'ECO-SE-009',
    busType: 'Non-AC Seater',
    registrationNumber: 'MH-09-NA-0009',
    cfg: SEAT_CFG.seater,
    amenities: ['Water Bottle'],
    rating: 3.6
  },
  {
    key: 'seater_ac_3',
    operatorName: 'Metro Fast',
    busNumber: 'MFA-SE-010',
    busType: 'AC Seater',
    registrationNumber: 'TN-10-AC-0010',
    cfg: SEAT_CFG.seater,
    amenities: ['WiFi', 'AC', 'USB Charging', 'Water Bottle'],
    rating: 4.0
  },
  // Multi-Axle
  {
    key: 'multiaxle_ac_1',
    operatorName: 'LuxeCoach',
    busNumber: 'LCX-MA-011',
    busType: 'AC Multi-Axle',
    registrationNumber: 'KA-11-AC-0011',
    cfg: SEAT_CFG.seater,
    amenities: ['WiFi', 'AC', 'USB Charging', 'Water Bottle', 'Snacks', 'TV'],
    rating: 4.7
  }
];

// ─────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS  (18 unique routes)
// ─────────────────────────────────────────────────────────────

const ROUTE_DEFS = [
  { source: 'Bengaluru',        destination: 'Chennai',           stops: ['Krishnagiri', 'Vellore'],           distance: 345, duration: '6h 00m' },
  { source: 'Bengaluru',        destination: 'Hyderabad',         stops: ['Kurnool', 'Mantralayam'],           distance: 570, duration: '9h 30m' },
  { source: 'Bengaluru',        destination: 'Mysuru',            stops: ['Mandya'],                            distance: 145, duration: '3h 00m' },
  { source: 'Bengaluru',        destination: 'Kochi',             stops: ['Salem', 'Coimbatore'],              distance: 545, duration: '9h 00m' },
  { source: 'Bengaluru',        destination: 'Mangaluru',         stops: ['Hassan', 'Sakleshpur'],             distance: 352, duration: '7h 00m' },
  { source: 'Chennai',          destination: 'Bengaluru',         stops: ['Vellore', 'Krishnagiri'],           distance: 345, duration: '6h 00m' },
  { source: 'Chennai',          destination: 'Coimbatore',        stops: ['Vellore', 'Salem'],                 distance: 495, duration: '8h 30m' },
  { source: 'Chennai',          destination: 'Madurai',           stops: ['Trichy'],                            distance: 463, duration: '7h 30m' },
  { source: 'Hyderabad',        destination: 'Bengaluru',         stops: ['Kurnool'],                          distance: 570, duration: '9h 30m' },
  { source: 'Hyderabad',        destination: 'Vijayawada',        stops: ['Guntur'],                           distance: 275, duration: '5h 00m' },
  { source: 'Mumbai',           destination: 'Pune',              stops: ['Thane', 'Lonavala'],                distance: 150, duration: '3h 30m' },
  { source: 'Mumbai',           destination: 'Goa',               stops: ['Alibaug', 'Ratnagiri'],            distance: 594, duration: '10h 00m' },
  { source: 'Pune',             destination: 'Mumbai',            stops: ['Lonavala', 'Thane'],                distance: 150, duration: '3h 30m' },
  { source: 'Delhi',            destination: 'Jaipur',            stops: ['Gurgaon', 'Manesar'],               distance: 280, duration: '5h 30m' },
  { source: 'Delhi',            destination: 'Chandigarh',        stops: ['Panipat', 'Ambala'],                distance: 250, duration: '4h 30m' },
  { source: 'Kochi',            destination: 'Thiruvananthapuram', stops: ['Kollam'],                          distance: 210, duration: '4h 00m' },
  { source: 'Kochi',            destination: 'Kozhikode',         stops: ['Thrissur', 'Malappuram'],          distance: 190, duration: '4h 30m' },
  { source: 'Coimbatore',       destination: 'Bengaluru',         stops: ['Hosur'],                            distance: 360, duration: '6h 30m' }
];

// ─────────────────────────────────────────────────────────────
// SCHEDULE DEFINITIONS
// Format: [busKey, routeIndex(0-based), dayOffset, dep, arr, baseFare]
// ─────────────────────────────────────────────────────────────

const SCHEDULE_DEFS = [
  // Bengaluru → Chennai  (3 buses covering all 3 types)
  ['sleeper_ac_1',    0, 1, '21:00', '03:00', 650],
  ['semi_ac_1',       0, 1, '22:00', '04:30', 480],
  ['seater_ac_1',     0, 2, '06:00', '12:00', 350],
  ['sleeper_nonac_1', 0, 2, '22:30', '05:00', 400],

  // Bengaluru → Hyderabad
  ['sleeper_ac_2',    1, 1, '20:00', '05:30', 750],
  ['semi_ac_2',       1, 1, '21:30', '07:00', 550],
  ['seater_ac_2',     1, 2, '07:00', '16:30', 400],

  // Bengaluru → Mysuru  (shorter route — day service)
  ['seater_ac_1',     2, 1, '07:00', '10:00', 200],
  ['seater_ac_3',     2, 1, '14:00', '17:00', 200],
  ['semi_nonac_1',    2, 2, '09:00', '12:00', 180],

  // Bengaluru → Kochi
  ['sleeper_ac_1',    3, 1, '19:00', '04:00', 850],
  ['sleeper_ac_2',    3, 2, '20:00', '05:00', 800],
  ['semi_ac_1',       3, 1, '21:00', '06:00', 600],

  // Bengaluru → Mangaluru
  ['semi_ac_2',       4, 1, '22:00', '05:00', 500],
  ['sleeper_ac_1',    4, 2, '21:00', '04:00', 700],
  ['seater_nonac_1',  4, 1, '06:00', '13:00', 280],

  // Chennai → Bengaluru
  ['sleeper_ac_2',    5, 1, '22:00', '04:00', 650],
  ['seater_ac_2',     5, 1, '06:30', '12:30', 350],
  ['semi_ac_1',       5, 2, '21:00', '03:30', 480],

  // Chennai → Coimbatore
  ['semi_ac_2',       6, 1, '22:00', '06:30', 550],
  ['sleeper_nonac_1', 6, 1, '21:00', '05:30', 380],
  ['seater_ac_3',     6, 2, '07:00', '15:30', 320],

  // Chennai → Madurai
  ['sleeper_ac_1',    7, 1, '22:00', '05:30', 700],
  ['semi_nonac_1',    7, 1, '23:00', '06:30', 400],
  ['seater_nonac_1',  7, 2, '08:00', '15:30', 300],

  // Hyderabad → Bengaluru
  ['sleeper_ac_2',    8, 1, '21:00', '06:30', 750],
  ['semi_ac_1',       8, 2, '22:00', '07:30', 550],
  ['seater_ac_1',     8, 2, '06:00', '15:30', 400],

  // Hyderabad → Vijayawada
  ['seater_ac_2',     9, 1, '07:00', '12:00', 300],
  ['semi_ac_2',       9, 1, '22:00', '03:00', 400],
  ['sleeper_ac_1',    9, 2, '23:00', '04:00', 600],

  // Mumbai → Pune
  ['seater_ac_3',    10, 1, '07:00', '10:30', 250],
  ['multiaxle_ac_1', 10, 1, '08:00', '11:30', 450],
  ['semi_nonac_1',   10, 1, '22:00', '01:30', 200],

  // Mumbai → Goa
  ['sleeper_ac_2',   11, 1, '22:00', '08:00', 900],
  ['semi_ac_1',      11, 2, '21:00', '07:00', 650],
  ['seater_nonac_1', 11, 2, '07:00', '17:00', 400],

  // Pune → Mumbai
  ['seater_ac_1',    12, 1, '06:30', '10:00', 250],
  ['multiaxle_ac_1', 12, 1, '09:00', '12:30', 450],

  // Delhi → Jaipur
  ['seater_ac_2',    13, 1, '06:00', '11:30', 350],
  ['semi_ac_2',      13, 1, '22:00', '03:30', 500],
  ['sleeper_ac_1',   13, 2, '23:00', '04:30', 700],

  // Delhi → Chandigarh
  ['seater_ac_3',    14, 1, '07:00', '11:30', 300],
  ['semi_nonac_1',   14, 1, '22:00', '02:30', 350],

  // Kochi → Thiruvananthapuram
  ['seater_ac_1',    15, 1, '07:00', '11:00', 220],
  ['semi_ac_1',      15, 1, '22:00', '02:00', 300],
  ['sleeper_nonac_1',15, 2, '23:00', '03:00', 350],

  // Kochi → Kozhikode
  ['seater_ac_2',    16, 1, '08:00', '12:30', 250],
  ['semi_ac_2',      16, 1, '21:00', '01:30', 380],
  ['sleeper_ac_2',   16, 2, '22:00', '02:30', 550],

  // Coimbatore → Bengaluru
  ['seater_nonac_1', 17, 1, '07:00', '13:30', 320],
  ['semi_ac_1',      17, 1, '22:00', '04:30', 480],
  ['sleeper_ac_1',   17, 2, '23:00', '05:30', 700]
];

// ─────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    await Seat.deleteMany({});
    await Booking.deleteMany({});
    await SmartSeatPreference.deleteMany({});

    // ── USERS ──────────────────────────────────────────────

    console.log('Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartseat.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      passengerCategory: 'general'
    });

    const passengerA = await User.create({
      name: 'Passenger A',
      email: 'passengera@test.com',
      phone: '9876543211',
      password: 'pass123',
      role: 'passenger',
      passengerCategory: 'general'
    });

    const passengerB = await User.create({
      name: 'Passenger B',
      email: 'passengerb@test.com',
      phone: '9876543212',
      password: 'pass123',
      role: 'passenger',
      passengerCategory: 'general'
    });

    const passengerC = await User.create({
      name: 'Passenger C',
      email: 'passengerc@test.com',
      phone: '9876543213',
      password: 'pass123',
      role: 'passenger',
      passengerCategory: 'female'
    });

    // ── ROUTES ─────────────────────────────────────────────

    console.log(`Creating ${ROUTE_DEFS.length} routes...`);

    const routes = [];
    for (const rd of ROUTE_DEFS) {
      const route = await Route.create({
        source: rd.source,
        destination: rd.destination,
        stops: rd.stops,
        distance: rd.distance,
        estimatedDuration: rd.duration,
        isActive: true
      });
      routes.push(route);
    }

    // ── BUSES ──────────────────────────────────────────────

    console.log(`Creating ${BUS_TEMPLATES.length} buses...`);

    const busMap = {};   // key → Bus document
    for (const tmpl of BUS_TEMPLATES) {
      const bus = await Bus.create({
        operatorName: tmpl.operatorName,
        busNumber: tmpl.busNumber,
        busType: tmpl.busType,
        registrationNumber: tmpl.registrationNumber,
        seatConfiguration: tmpl.cfg,
        amenities: tmpl.amenities,
        boardingPoints: [],    // populated per schedule
        droppingPoints: [],
        isActive: true,
        rating: tmpl.rating,
        totalRatings: Math.floor(Math.random() * 200 + 30)
      });
      busMap[tmpl.key] = bus;
    }

    // ── SCHEDULES + SEAT LAYOUTS ───────────────────────────

    console.log(`Creating ${SCHEDULE_DEFS.length} schedules with seat layouts...`);

    const scheduleMap = {};  // "busKey_routeIdx_day" → Schedule doc
    const schedules = [];

    for (const [busKey, routeIdx, day, dep, arr, baseFare] of SCHEDULE_DEFS) {
      const bus = busMap[busKey];
      const route = routes[routeIdx];
      if (!bus || !route) {
        console.warn(`Skip: busKey=${busKey} or routeIdx=${routeIdx} not found`);
        continue;
      }

      const availSeats = bus.seatConfiguration.totalSeats;

      const schedule = await Schedule.create({
        busId: bus._id,
        routeId: route._id,
        departureTime: dep,
        arrivalTime: arr,
        travelDate: dayOffset(day),
        fare: baseFare,
        isActive: true,
        availableSeats: availSeats
      });

      schedules.push(schedule);
      scheduleMap[`${busKey}_${routeIdx}_${day}`] = schedule;

      // Generate type-aware seat layout
      await generateSeatLayout(
        bus._id,
        schedule._id,
        bus.seatConfiguration,
        bus.busType,
        baseFare
      );
    }

    // ── SMARTSEAT PREFERENCES ──────────────────────────────

    console.log('Creating SmartSeat preferences...');

    await SmartSeatPreference.create({
      userId: passengerA._id,
      enabled: true,
      notifyAdjacentSeatChange: true,
      preferredAdjacentCondition: 'empty_adjacent',
      showPermittedPassengerCategory: false,
      allowSeatRecommendations: true,
      sectionPreference: 'middle',
      windowPreference: true,
      accessibilityPriority: false
    });

    await SmartSeatPreference.create({
      userId: passengerB._id,
      enabled: true,
      notifyAdjacentSeatChange: true,
      preferredAdjacentCondition: 'no_preference',
      showPermittedPassengerCategory: false,
      allowSeatRecommendations: true,
      sectionPreference: 'middle',
      windowPreference: false,
      accessibilityPriority: false
    });

    await SmartSeatPreference.create({
      userId: passengerC._id,
      enabled: true,
      notifyAdjacentSeatChange: true,
      preferredAdjacentCondition: 'same_category',
      showPermittedPassengerCategory: true,
      allowSeatRecommendations: true,
      sectionPreference: 'front',
      windowPreference: true,
      accessibilityPriority: true
    });

    // ── SAMPLE BOOKINGS ────────────────────────────────────

    console.log('Creating sample bookings...');

    // Find the first Bengaluru → Chennai AC Sleeper schedule
    const blrChenSleeperSchedule = scheduleMap['sleeper_ac_1_0_1'];
    if (blrChenSleeperSchedule) {
      // Sleeper seat: 01LL (row1, left-lower)
      const sleeperSeat = await Seat.findOne({
        scheduleId: blrChenSleeperSchedule._id,
        seatNumber: '01LL'
      });

      if (sleeperSeat) {
        const seedGstAmount  = Math.round(blrChenSleeperSchedule.fare * (GST_RATE / 100) * 100) / 100;
        const seedTotalFare  = Math.round((blrChenSleeperSchedule.fare + seedGstAmount) * 100) / 100;

        const booking1 = await Booking.create({
          bookingId: 'BK001',
          userId: passengerA._id,
          scheduleId: blrChenSleeperSchedule._id,
          busId: busMap['sleeper_ac_1']._id,
          routeId: routes[0]._id,
          seatNumber: '01LL',
          passengerDetails: {
            name: 'Passenger A',
            age: 28,
            gender: 'male',
            phone: '9876543211'
          },
          baseFare:   blrChenSleeperSchedule.fare,
          gstRate:    GST_RATE,
          gstAmount:  seedGstAmount,
          fare:       seedTotalFare,
          paymentStatus: 'completed',
          bookingStatus: 'confirmed',
          smartSeatMonitoring: true
        });

        await Seat.findByIdAndUpdate(sleeperSeat._id, {
          status: 'booked',
          bookedBy: passengerA._id,
          bookingId: booking1._id
        });

        await Schedule.findByIdAndUpdate(blrChenSleeperSchedule._id, {
          $inc: { availableSeats: -1 }
        });

        console.log('Sleeper booking created: seat 01LL (lower berth)');
      }
    }

    // Sample booking on a seater bus for passenger B
    const blrChenSeaterSchedule = scheduleMap['seater_ac_1_0_2'];
    if (blrChenSeaterSchedule) {
      const seaterSeat = await Seat.findOne({
        scheduleId: blrChenSeaterSchedule._id,
        seatNumber: '05A'
      });

      if (seaterSeat) {
        const seedGstAmount  = Math.round(blrChenSeaterSchedule.fare * (GST_RATE / 100) * 100) / 100;
        const seedTotalFare  = Math.round((blrChenSeaterSchedule.fare + seedGstAmount) * 100) / 100;

        const booking2 = await Booking.create({
          bookingId: 'BK002',
          userId: passengerB._id,
          scheduleId: blrChenSeaterSchedule._id,
          busId: busMap['seater_ac_1']._id,
          routeId: routes[0]._id,
          seatNumber: '05A',
          passengerDetails: {
            name: 'Passenger B',
            age: 35,
            gender: 'male',
            phone: '9876543212'
          },
          baseFare:   blrChenSeaterSchedule.fare,
          gstRate:    GST_RATE,
          gstAmount:  seedGstAmount,
          fare:       seedTotalFare,
          paymentStatus: 'completed',
          bookingStatus: 'confirmed',
          smartSeatMonitoring: false
        });

        await Seat.findByIdAndUpdate(seaterSeat._id, {
          status: 'booked',
          bookedBy: passengerB._id,
          bookingId: booking2._id
        });

        await Schedule.findByIdAndUpdate(blrChenSeaterSchedule._id, {
          $inc: { availableSeats: -1 }
        });

        console.log('Seater booking created: seat 05A');
      }
    }

    // Sample booking on a semi-sleeper for passenger C
    const semiSchedule = scheduleMap['semi_ac_1_0_1'];
    if (semiSchedule) {
      const semiSeat = await Seat.findOne({
        scheduleId: semiSchedule._id,
        seatNumber: '03A'
      });

      if (semiSeat) {
        const seedGstAmount  = Math.round(semiSchedule.fare * (GST_RATE / 100) * 100) / 100;
        const seedTotalFare  = Math.round((semiSchedule.fare + seedGstAmount) * 100) / 100;

        const booking3 = await Booking.create({
          bookingId: 'BK003',
          userId: passengerC._id,
          scheduleId: semiSchedule._id,
          busId: busMap['semi_ac_1']._id,
          routeId: routes[0]._id,
          seatNumber: '03A',
          passengerDetails: {
            name: 'Passenger C',
            age: 24,
            gender: 'female',
            phone: '9876543213'
          },
          baseFare:   semiSchedule.fare,
          gstRate:    GST_RATE,
          gstAmount:  seedGstAmount,
          fare:       seedTotalFare,
          paymentStatus: 'completed',
          bookingStatus: 'confirmed',
          smartSeatMonitoring: true
        });

        await Seat.findByIdAndUpdate(semiSeat._id, {
          status: 'booked',
          bookedBy: passengerC._id,
          bookingId: booking3._id
        });

        await Schedule.findByIdAndUpdate(semiSchedule._id, {
          $inc: { availableSeats: -1 }
        });

        console.log('Semi-sleeper booking created: seat 03A');
      }
    }

    // ── SUMMARY ────────────────────────────────────────────

    const totalSeats = await Seat.countDocuments();
    const totalSchedules = await Schedule.countDocuments();

    console.log('\n================================================');
    console.log('SEED COMPLETE — SMARTSEAT DATABASE READY');
    console.log('================================================');
    console.log(`Routes:     ${routes.length}`);
    console.log(`Buses:      ${Object.keys(busMap).length}`);
    console.log(`Schedules:  ${totalSchedules}`);
    console.log(`Seats:      ${totalSeats}`);
    console.log(`GST Rate:   ${GST_RATE}%`);
    console.log('\nBus types seeded:');
    console.log('  ✓ AC Sleeper      (upper/lower berth layout)');
    console.log('  ✓ Non-AC Sleeper  (upper/lower berth layout)');
    console.log('  ✓ AC Semi Sleeper (2+1 recliner layout)');
    console.log('  ✓ Non-AC Semi Sleeper');
    console.log('  ✓ AC Seater       (2+2 upright layout)');
    console.log('  ✓ Non-AC Seater');
    console.log('  ✓ AC Multi-Axle');
    console.log('\nCITIES AVAILABLE IN SEARCH:');
    const uniqueCities = [...new Set([...ROUTE_DEFS.map(r => r.source), ...ROUTE_DEFS.map(r => r.destination)])].sort();
    console.log(' ', uniqueCities.join(', '));
    console.log('\nDEVELOPMENT CREDENTIALS:');
    console.log('================================================');
    console.log('Admin:          admin@smartseat.com / admin123');
    console.log('Passenger A:    passengera@test.com / pass123  (sleeper booking BK001)');
    console.log('Passenger B:    passengerb@test.com / pass123  (seater booking BK002)');
    console.log('Passenger C:    passengerc@test.com / pass123  (semi-sleeper booking BK003)');
    console.log('================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
