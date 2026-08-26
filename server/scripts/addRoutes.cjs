/**
 * addRoutes.cjs
 *
 * Adds new routes, buses, and schedules to the live MongoDB database
 * WITHOUT wiping existing data.
 *
 * Run from the server/ directory:
 *   node scripts/addRoutes.cjs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Route    = require('../models/Route');
const Bus      = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Seat     = require('../models/Seat');
const { generateSeatLayout } = require('../utils/seatUtils');
const connectDB = require('../config/database');

// ──────────────────────────────────────────────────────────────
// Rolling UTC-midnight date helper (same pattern as seed.js)
// ──────────────────────────────────────────────────────────────
function dayOffset(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ──────────────────────────────────────────────────────────────
// Routes to add
// ──────────────────────────────────────────────────────────────
const NEW_ROUTES = [
  { source: 'Bangalore',          destination: 'Chennai',             stops: ['Hosur', 'Vellore'],              distance: 350,  estimatedDuration: '6h 00m' },
  { source: 'Chennai',            destination: 'Bangalore',           stops: ['Vellore', 'Hosur'],              distance: 350,  estimatedDuration: '6h 00m' },
  { source: 'Chennai',            destination: 'Hyderabad',           stops: ['Tirupati', 'Nellore'],           distance: 630,  estimatedDuration: '10h 00m' },
  { source: 'Hyderabad',          destination: 'Bangalore',           stops: ['Kurnool', 'Anantapur'],          distance: 570,  estimatedDuration: '9h 00m' },
  { source: 'Bangalore',          destination: 'Hyderabad',           stops: ['Anantapur', 'Kurnool'],          distance: 570,  estimatedDuration: '9h 00m' },
  { source: 'Mumbai',             destination: 'Bangalore',           stops: ['Pune', 'Kolhapur', 'Dharwad'],   distance: 980,  estimatedDuration: '15h 00m' },
  { source: 'Bangalore',          destination: 'Kochi',               stops: ['Salem', 'Coimbatore', 'Thrissur'], distance: 560, estimatedDuration: '9h 30m' },
  { source: 'Kochi',              destination: 'Bangalore',           stops: ['Thrissur', 'Coimbatore', 'Salem'], distance: 560, estimatedDuration: '9h 30m' },
  { source: 'Kochi',              destination: 'Chennai',             stops: ['Coimbatore', 'Salem'],           distance: 680,  estimatedDuration: '11h 00m' },
  { source: 'Chennai',            destination: 'Coimbatore',          stops: ['Salem', 'Erode'],                distance: 490,  estimatedDuration: '8h 00m' },
  { source: 'Coimbatore',         destination: 'Chennai',             stops: ['Erode', 'Salem'],                distance: 490,  estimatedDuration: '8h 00m' },
  { source: 'Chennai',            destination: 'Madurai',             stops: ['Villupuram', 'Trichy'],          distance: 460,  estimatedDuration: '7h 30m' },
  { source: 'Madurai',            destination: 'Chennai',             stops: ['Trichy', 'Villupuram'],          distance: 460,  estimatedDuration: '7h 30m' },
  { source: 'Thiruvananthapuram', destination: 'Kochi',               stops: ['Kollam', 'Alappuzha'],           distance: 220,  estimatedDuration: '4h 00m' },
  { source: 'Kochi',              destination: 'Thiruvananthapuram',  stops: ['Alappuzha', 'Kollam'],           distance: 220,  estimatedDuration: '4h 00m' },
  { source: 'Kozhikode',          destination: 'Kochi',               stops: ['Thrissur'],                      distance: 190,  estimatedDuration: '3h 30m' },
  { source: 'Kochi',              destination: 'Kozhikode',           stops: ['Thrissur'],                      distance: 190,  estimatedDuration: '3h 30m' },
  { source: 'Bangalore',          destination: 'Mysore',              stops: ['Mandya'],                        distance: 145,  estimatedDuration: '3h 00m' },
  { source: 'Mysore',             destination: 'Bangalore',           stops: ['Mandya'],                        distance: 145,  estimatedDuration: '3h 00m' },
  { source: 'Delhi',              destination: 'Mumbai',              stops: ['Jaipur', 'Ahmedabad', 'Vadodara'], distance: 1410, estimatedDuration: '22h 00m' },
  { source: 'Mumbai',             destination: 'Delhi',               stops: ['Vadodara', 'Ahmedabad', 'Jaipur'], distance: 1410, estimatedDuration: '22h 00m' },
  { source: 'Hyderabad',          destination: 'Chennai',             stops: ['Nellore'],                       distance: 630,  estimatedDuration: '10h 00m' },
  { source: 'Coimbatore',         destination: 'Kochi',               stops: ['Thrissur'],                      distance: 180,  estimatedDuration: '3h 30m' },
  { source: 'Kochi',              destination: 'Coimbatore',          stops: ['Thrissur'],                      distance: 180,  estimatedDuration: '3h 30m' },
  { source: 'Madurai',            destination: 'Kochi',               stops: ['Kumily'],                        distance: 290,  estimatedDuration: '5h 30m' },
  { source: 'Kochi',              destination: 'Madurai',             stops: ['Kumily'],                        distance: 290,  estimatedDuration: '5h 30m' },
];

// ──────────────────────────────────────────────────────────────
// Bus templates — reused across routes
// ──────────────────────────────────────────────────────────────
function makeBusData(idx) {
  const configs = [
    { operatorName: 'KPN Travels',       busType: 'AC Sleeper',    rows: 10, cols: 4, fare_base: 500, amenities: ['WiFi','USB Charging','Water Bottle','Blanket'] },
    { operatorName: 'Kallada Travels',   busType: 'AC Multi-Axle', rows: 11, cols: 4, fare_base: 600, amenities: ['WiFi','USB Charging','Water Bottle','TV'] },
    { operatorName: 'KSRTC Express',     busType: 'Non-AC Seater', rows: 9,  cols: 4, fare_base: 250, amenities: ['Water Bottle'] },
    { operatorName: 'Orange Travels',    busType: 'AC Seater',     rows: 10, cols: 4, fare_base: 400, amenities: ['WiFi','USB Charging','Water Bottle'] },
    { operatorName: 'SRS Travels',       busType: 'AC Sleeper',    rows: 10, cols: 4, fare_base: 550, amenities: ['WiFi','USB Charging','Blanket'] },
    { operatorName: 'Parveen Travels',   busType: 'Non-AC Sleeper',rows: 9,  cols: 4, fare_base: 300, amenities: ['Water Bottle'] },
  ];
  return configs[idx % configs.length];
}

async function run() {
  await connectDB();
  console.log('Connected to MongoDB\n');

  let routesAdded = 0, busesAdded = 0, schedulesAdded = 0;

  for (let i = 0; i < NEW_ROUTES.length; i++) {
    const rd = NEW_ROUTES[i];

    // Skip if this exact route already exists
    const existing = await Route.findOne({ source: rd.source, destination: rd.destination });
    if (existing) {
      console.log(`  SKIP  route ${rd.source} → ${rd.destination} (already exists)`);
      continue;
    }

    // Create route
    const route = await Route.create({
      source:            rd.source,
      destination:       rd.destination,
      stops:             rd.stops,
      distance:          rd.distance,
      estimatedDuration: rd.estimatedDuration,
      isActive:          true
    });
    routesAdded++;

    // Create one bus for this route
    const tmpl = makeBusData(i);
    const busNum = `${tmpl.operatorName.slice(0,3).toUpperCase().replace(/\s/g,'')}-${2024 + (i % 3)}-${String(i + 100).padStart(3,'0')}`;
    const regNum = `${rd.source.slice(0,2).toUpperCase()}-${String(i+10).padStart(2,'0')}-${String.fromCharCode(65 + (i%26))}${String.fromCharCode(65 + ((i+1)%26))}-${String(1000 + i).padStart(4,'0')}`;
    const totalSeats = tmpl.rows * tmpl.cols;

    const bus = await Bus.create({
      operatorName:     tmpl.operatorName,
      busNumber:        busNum,
      busType:          tmpl.busType,
      registrationNumber: regNum,
      seatConfiguration: { rows: tmpl.rows, columns: tmpl.cols, aisleAfter: 2, totalSeats },
      amenities:        tmpl.amenities,
      boardingPoints:   [rd.source],
      droppingPoints:   [rd.destination],
      isActive:         true,
      rating:           3.8 + Math.round((i % 8) * 0.1 * 10) / 10,
      totalRatings:     20 + i * 5
    });
    busesAdded++;

    // Create 2 schedules on different days so users have choices
    const fare = tmpl.fare_base + Math.floor(rd.distance / 10);
    for (const dayOff of [1, 3]) {
      const schedule = await Schedule.create({
        busId:         bus._id,
        routeId:       route._id,
        departureTime: dayOff === 1 ? '21:00' : '08:00',
        arrivalTime:   dayOff === 1 ? computeArrival('21:00', rd.estimatedDuration)
                                    : computeArrival('08:00', rd.estimatedDuration),
        travelDate:    dayOffset(dayOff),
        fare,
        isActive:      true,
        availableSeats: totalSeats
      });

      await generateSeatLayout(bus._id, schedule._id, bus.seatConfiguration);
      schedulesAdded++;
    }

    console.log(`  ADD   ${rd.source} → ${rd.destination}  bus=${busNum}  fare=₹${fare}`);
  }

  console.log('\n─────────────────────────────────────');
  console.log(`Routes added:    ${routesAdded}`);
  console.log(`Buses added:     ${busesAdded}`);
  console.log(`Schedules added: ${schedulesAdded}`);
  console.log('─────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Done.');
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function computeArrival(departure, durationStr) {
  // durationStr like "6h 00m" or "9h 30m"
  const [depH, depM] = departure.split(':').map(Number);
  const match = durationStr.match(/(\d+)h\s*(\d+)m/);
  if (!match) return '00:00';
  const durH = parseInt(match[1]), durM = parseInt(match[2]);
  const totalMins = depH * 60 + depM + durH * 60 + durM;
  const arrH = Math.floor(totalMins / 60) % 24;
  const arrM = totalMins % 60;
  return `${String(arrH).padStart(2,'0')}:${String(arrM).padStart(2,'0')}`;
}

run().catch(err => { console.error(err); process.exit(1); });
