/**
 * migrateRouteStops.js
 *
 * Safely updates existing Route documents in MongoDB so that all routes
 * have structured stops subdocuments with proper sequence numbers.
 *
 * SAFETY:
 * - Does NOT delete any data (routes, buses, schedules, seats, bookings, users).
 * - Preserves existing structured stops if already set.
 * - Converts string stop arrays into structured stop objects.
 *
 * Usage:
 *   node server/scripts/migrateRouteStops.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const mongoose = require('mongoose');
const Route = require('../models/Route');
const connectDB = require('../config/database');
const { normalizeRouteStops } = require('../controllers/busController');

const CORRIDOR_STOPS = {
  'chennai|bangalore': [
    { name: 'Koyambedu', city: 'Chennai', type: 'pickup', departureTime: '06:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'pickup', departureTime: '06:30' },
    { name: 'Sriperumbudur', city: 'Sriperumbudur', type: 'both', arrivalTime: '07:15', departureTime: '07:20' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '08:45', departureTime: '08:50' },
    { name: 'Ambur', city: 'Ambur', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'Krishnagiri', city: 'Krishnagiri', type: 'both', arrivalTime: '10:30', departureTime: '10:35' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '11:15', departureTime: '11:20' },
    { name: 'Electronic City', city: 'Bangalore', type: 'drop', arrivalTime: '11:45' },
    { name: 'Madiwala', city: 'Bangalore', type: 'drop', arrivalTime: '12:05' },
    { name: 'Majestic', city: 'Bangalore', type: 'drop', arrivalTime: '12:30' }
  ],
  'chennai|bengaluru': [
    { name: 'Koyambedu', city: 'Chennai', type: 'pickup', departureTime: '06:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'pickup', departureTime: '06:30' },
    { name: 'Sriperumbudur', city: 'Sriperumbudur', type: 'both', arrivalTime: '07:15', departureTime: '07:20' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '08:45', departureTime: '08:50' },
    { name: 'Ambur', city: 'Ambur', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'Krishnagiri', city: 'Krishnagiri', type: 'both', arrivalTime: '10:30', departureTime: '10:35' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '11:15', departureTime: '11:20' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'drop', arrivalTime: '11:45' },
    { name: 'Madiwala', city: 'Bengaluru', type: 'drop', arrivalTime: '12:05' },
    { name: 'Majestic', city: 'Bengaluru', type: 'drop', arrivalTime: '12:30' }
  ],
  'bangalore|chennai': [
    { name: 'Majestic', city: 'Bangalore', type: 'pickup', departureTime: '06:00' },
    { name: 'Madiwala', city: 'Bangalore', type: 'pickup', departureTime: '06:25' },
    { name: 'Electronic City', city: 'Bangalore', type: 'pickup', departureTime: '06:45' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '07:15', departureTime: '07:20' },
    { name: 'Krishnagiri', city: 'Krishnagiri', type: 'both', arrivalTime: '08:00', departureTime: '08:05' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '09:45', departureTime: '09:50' },
    { name: 'Sriperumbudur', city: 'Sriperumbudur', type: 'both', arrivalTime: '11:15', departureTime: '11:20' },
    { name: 'Koyambedu', city: 'Chennai', type: 'drop', arrivalTime: '12:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'drop', arrivalTime: '12:30' }
  ],
  'bengaluru|chennai': [
    { name: 'Majestic', city: 'Bengaluru', type: 'pickup', departureTime: '06:00' },
    { name: 'Madiwala', city: 'Bengaluru', type: 'pickup', departureTime: '06:25' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'pickup', departureTime: '06:45' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '07:15', departureTime: '07:20' },
    { name: 'Krishnagiri', city: 'Krishnagiri', type: 'both', arrivalTime: '08:00', departureTime: '08:05' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '09:45', departureTime: '09:50' },
    { name: 'Sriperumbudur', city: 'Sriperumbudur', type: 'both', arrivalTime: '11:15', departureTime: '11:20' },
    { name: 'Koyambedu', city: 'Chennai', type: 'drop', arrivalTime: '12:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'drop', arrivalTime: '12:30' }
  ],
  'hyderabad|chennai': [
    { name: 'MGBS', city: 'Hyderabad', type: 'pickup', departureTime: '20:00' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'pickup', departureTime: '20:30' },
    { name: 'Suryapet', city: 'Suryapet', type: 'both', arrivalTime: '22:30', departureTime: '22:35' },
    { name: 'Vijayawada', city: 'Vijayawada', type: 'both', arrivalTime: '00:30', departureTime: '00:40' },
    { name: 'Ongole', city: 'Ongole', type: 'both', arrivalTime: '02:45', departureTime: '02:50' },
    { name: 'Nellore', city: 'Nellore', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'CMBT', city: 'Chennai', type: 'drop', arrivalTime: '06:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'drop', arrivalTime: '06:30' }
  ],
  'chennai|hyderabad': [
    { name: 'CMBT', city: 'Chennai', type: 'pickup', departureTime: '20:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'pickup', departureTime: '20:30' },
    { name: 'Nellore', city: 'Nellore', type: 'both', arrivalTime: '22:00', departureTime: '22:05' },
    { name: 'Ongole', city: 'Ongole', type: 'both', arrivalTime: '23:45', departureTime: '23:50' },
    { name: 'Vijayawada', city: 'Vijayawada', type: 'both', arrivalTime: '01:50', departureTime: '02:00' },
    { name: 'Suryapet', city: 'Suryapet', type: 'both', arrivalTime: '03:45', departureTime: '03:50' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'drop', arrivalTime: '05:30' },
    { name: 'MGBS', city: 'Hyderabad', type: 'drop', arrivalTime: '06:00' }
  ],
  'hyderabad|bangalore': [
    { name: 'MGBS', city: 'Hyderabad', type: 'pickup', departureTime: '21:00' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'pickup', departureTime: '21:30' },
    { name: 'Kurnool', city: 'Kurnool', type: 'both', arrivalTime: '00:30', departureTime: '00:35' },
    { name: 'Anantapur', city: 'Anantapur', type: 'both', arrivalTime: '02:45', departureTime: '02:50' },
    { name: 'Hebbal', city: 'Bangalore', type: 'drop', arrivalTime: '05:30' },
    { name: 'Majestic', city: 'Bangalore', type: 'drop', arrivalTime: '06:00' }
  ],
  'hyderabad|bengaluru': [
    { name: 'MGBS', city: 'Hyderabad', type: 'pickup', departureTime: '21:00' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'pickup', departureTime: '21:30' },
    { name: 'Kurnool', city: 'Kurnool', type: 'both', arrivalTime: '00:30', departureTime: '00:35' },
    { name: 'Anantapur', city: 'Anantapur', type: 'both', arrivalTime: '02:45', departureTime: '02:50' },
    { name: 'Hebbal', city: 'Bengaluru', type: 'drop', arrivalTime: '05:30' },
    { name: 'Majestic', city: 'Bengaluru', type: 'drop', arrivalTime: '06:00' }
  ],
  'bangalore|hyderabad': [
    { name: 'Majestic', city: 'Bangalore', type: 'pickup', departureTime: '21:00' },
    { name: 'Hebbal', city: 'Bangalore', type: 'pickup', departureTime: '21:30' },
    { name: 'Anantapur', city: 'Anantapur', type: 'both', arrivalTime: '00:15', departureTime: '00:20' },
    { name: 'Kurnool', city: 'Kurnool', type: 'both', arrivalTime: '02:30', departureTime: '02:35' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'drop', arrivalTime: '05:30' },
    { name: 'MGBS', city: 'Hyderabad', type: 'drop', arrivalTime: '06:00' }
  ],
  'bengaluru|hyderabad': [
    { name: 'Majestic', city: 'Bengaluru', type: 'pickup', departureTime: '21:00' },
    { name: 'Hebbal', city: 'Bengaluru', type: 'pickup', departureTime: '21:30' },
    { name: 'Anantapur', city: 'Anantapur', type: 'both', arrivalTime: '00:15', departureTime: '00:20' },
    { name: 'Kurnool', city: 'Kurnool', type: 'both', arrivalTime: '02:30', departureTime: '02:35' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'drop', arrivalTime: '05:30' },
    { name: 'MGBS', city: 'Hyderabad', type: 'drop', arrivalTime: '06:00' }
  ],
  'mumbai|pune': [
    { name: 'Borivali', city: 'Mumbai', type: 'pickup', departureTime: '07:00' },
    { name: 'Dadar', city: 'Mumbai', type: 'pickup', departureTime: '07:30' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'pickup', departureTime: '08:00' },
    { name: 'Lonavala', city: 'Lonavala', type: 'both', arrivalTime: '09:15', departureTime: '09:20' },
    { name: 'Wakad', city: 'Pune', type: 'drop', arrivalTime: '10:00' },
    { name: 'Swargate', city: 'Pune', type: 'drop', arrivalTime: '10:30' }
  ],
  'pune|mumbai': [
    { name: 'Swargate', city: 'Pune', type: 'pickup', departureTime: '06:30' },
    { name: 'Wakad', city: 'Pune', type: 'pickup', departureTime: '07:00' },
    { name: 'Lonavala', city: 'Lonavala', type: 'both', arrivalTime: '07:45', departureTime: '07:50' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'drop', arrivalTime: '09:00' },
    { name: 'Dadar', city: 'Mumbai', type: 'drop', arrivalTime: '09:30' },
    { name: 'Borivali', city: 'Mumbai', type: 'drop', arrivalTime: '10:00' }
  ],
  'delhi|jaipur': [
    { name: 'Kashmiri Gate', city: 'Delhi', type: 'pickup', departureTime: '06:00' },
    { name: 'Dhaula Kuan', city: 'Delhi', type: 'pickup', departureTime: '06:30' },
    { name: 'Gurgaon IFFCO Chowk', city: 'Gurgaon', type: 'pickup', departureTime: '07:00' },
    { name: 'Manesar', city: 'Manesar', type: 'both', arrivalTime: '07:30', departureTime: '07:35' },
    { name: 'Kotputli', city: 'Kotputli', type: 'both', arrivalTime: '09:00', departureTime: '09:05' },
    { name: 'Sindhi Camp', city: 'Jaipur', type: 'drop', arrivalTime: '11:30' }
  ],
  'delhi|chandigarh': [
    { name: 'Kashmiri Gate', city: 'Delhi', type: 'pickup', departureTime: '07:00' },
    { name: 'Karnal Bypass', city: 'Delhi', type: 'pickup', departureTime: '07:30' },
    { name: 'Panipat', city: 'Panipat', type: 'both', arrivalTime: '08:45', departureTime: '08:50' },
    { name: 'Karnal', city: 'Karnal', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'Ambala', city: 'Ambala', type: 'both', arrivalTime: '10:30', departureTime: '10:35' },
    { name: 'Sector 43', city: 'Chandigarh', type: 'drop', arrivalTime: '11:30' }
  ],
  'chennai|coimbatore': [
    { name: 'Koyambedu', city: 'Chennai', type: 'pickup', departureTime: '22:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'pickup', departureTime: '22:30' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '00:30', departureTime: '00:35' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '03:30', departureTime: '03:35' },
    { name: 'Erode', city: 'Erode', type: 'both', arrivalTime: '04:45', departureTime: '04:50' },
    { name: 'Gandhipuram', city: 'Coimbatore', type: 'drop', arrivalTime: '06:30' }
  ],
  'coimbatore|chennai': [
    { name: 'Gandhipuram', city: 'Coimbatore', type: 'pickup', departureTime: '21:00' },
    { name: 'Hopes College', city: 'Coimbatore', type: 'pickup', departureTime: '21:20' },
    { name: 'Erode', city: 'Erode', type: 'both', arrivalTime: '22:45', departureTime: '22:50' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '00:00', departureTime: '00:05' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '03:00', departureTime: '03:05' },
    { name: 'Koyambedu', city: 'Chennai', type: 'drop', arrivalTime: '05:30' },
    { name: 'Tambaram', city: 'Chennai', type: 'drop', arrivalTime: '06:00' }
  ],
  'chennai|madurai': [
    { name: 'Koyambedu', city: 'Chennai', type: 'pickup', departureTime: '22:00' },
    { name: 'Tambaram', city: 'Chennai', type: 'pickup', departureTime: '22:30' },
    { name: 'Villupuram', city: 'Villupuram', type: 'both', arrivalTime: '00:45', departureTime: '00:50' },
    { name: 'Trichy Central', city: 'Trichy', type: 'both', arrivalTime: '03:15', departureTime: '03:20' },
    { name: 'Mattuthavani', city: 'Madurai', type: 'drop', arrivalTime: '05:30' }
  ],
  'madurai|chennai': [
    { name: 'Mattuthavani', city: 'Madurai', type: 'pickup', departureTime: '21:30' },
    { name: 'Periyar', city: 'Madurai', type: 'pickup', departureTime: '21:50' },
    { name: 'Trichy Central', city: 'Trichy', type: 'both', arrivalTime: '00:00', departureTime: '00:05' },
    { name: 'Villupuram', city: 'Villupuram', type: 'both', arrivalTime: '02:30', departureTime: '02:35' },
    { name: 'Tambaram', city: 'Chennai', type: 'drop', arrivalTime: '04:45' },
    { name: 'Koyambedu', city: 'Chennai', type: 'drop', arrivalTime: '05:15' }
  ],
  'hyderabad|vijayawada': [
    { name: 'MGBS', city: 'Hyderabad', type: 'pickup', departureTime: '07:00' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'pickup', departureTime: '07:30' },
    { name: 'Suryapet', city: 'Suryapet', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'Nandigama', city: 'Nandigama', type: 'both', arrivalTime: '10:45', departureTime: '10:50' },
    { name: 'Pandit Nehru Bus Station', city: 'Vijayawada', type: 'drop', arrivalTime: '12:00' }
  ],
  'vijayawada|hyderabad': [
    { name: 'Pandit Nehru Bus Station', city: 'Vijayawada', type: 'pickup', departureTime: '07:00' },
    { name: 'Gollapudi', city: 'Vijayawada', type: 'pickup', departureTime: '07:25' },
    { name: 'Nandigama', city: 'Nandigama', type: 'both', arrivalTime: '08:15', departureTime: '08:20' },
    { name: 'Suryapet', city: 'Suryapet', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'drop', arrivalTime: '11:30' },
    { name: 'MGBS', city: 'Hyderabad', type: 'drop', arrivalTime: '12:00' }
  ],
  'mumbai|goa': [
    { name: 'Borivali', city: 'Mumbai', type: 'pickup', departureTime: '20:00' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'pickup', departureTime: '20:45' },
    { name: 'Panvel', city: 'Panvel', type: 'both', arrivalTime: '21:30', departureTime: '21:35' },
    { name: 'Chiplun', city: 'Chiplun', type: 'both', arrivalTime: '01:30', departureTime: '01:35' },
    { name: 'Ratnagiri', city: 'Ratnagiri', type: 'both', arrivalTime: '03:15', departureTime: '03:20' },
    { name: 'Mapusa', city: 'Goa', type: 'drop', arrivalTime: '05:30' },
    { name: 'Panaji', city: 'Goa', type: 'drop', arrivalTime: '06:00' }
  ],
  'goa|mumbai': [
    { name: 'Panaji', city: 'Goa', type: 'pickup', departureTime: '19:00' },
    { name: 'Mapusa', city: 'Goa', type: 'pickup', departureTime: '19:30' },
    { name: 'Ratnagiri', city: 'Ratnagiri', type: 'both', arrivalTime: '22:30', departureTime: '22:35' },
    { name: 'Chiplun', city: 'Chiplun', type: 'both', arrivalTime: '00:15', departureTime: '00:20' },
    { name: 'Panvel', city: 'Panvel', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'drop', arrivalTime: '05:15' },
    { name: 'Borivali', city: 'Mumbai', type: 'drop', arrivalTime: '06:00' }
  ],
  'mumbai|bangalore': [
    { name: 'Borivali', city: 'Mumbai', type: 'pickup', departureTime: '15:00' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'pickup', departureTime: '15:45' },
    { name: 'Pune', city: 'Pune', type: 'both', arrivalTime: '18:30', departureTime: '18:40' },
    { name: 'Kolhapur', city: 'Kolhapur', type: 'both', arrivalTime: '23:00', departureTime: '23:10' },
    { name: 'Dharwad', city: 'Dharwad', type: 'both', arrivalTime: '02:30', departureTime: '02:35' },
    { name: 'Electronic City', city: 'Bangalore', type: 'drop', arrivalTime: '07:30' },
    { name: 'Majestic', city: 'Bangalore', type: 'drop', arrivalTime: '08:00' }
  ],
  'mumbai|bengaluru': [
    { name: 'Borivali', city: 'Mumbai', type: 'pickup', departureTime: '15:00' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'pickup', departureTime: '15:45' },
    { name: 'Pune', city: 'Pune', type: 'both', arrivalTime: '18:30', departureTime: '18:40' },
    { name: 'Kolhapur', city: 'Kolhapur', type: 'both', arrivalTime: '23:00', departureTime: '23:10' },
    { name: 'Dharwad', city: 'Dharwad', type: 'both', arrivalTime: '02:30', departureTime: '02:35' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'drop', arrivalTime: '07:30' },
    { name: 'Majestic', city: 'Bengaluru', type: 'drop', arrivalTime: '08:00' }
  ],
  'bangalore|mumbai': [
    { name: 'Majestic', city: 'Bangalore', type: 'pickup', departureTime: '15:00' },
    { name: 'Electronic City', city: 'Bangalore', type: 'pickup', departureTime: '15:30' },
    { name: 'Dharwad', city: 'Dharwad', type: 'both', arrivalTime: '20:30', departureTime: '20:35' },
    { name: 'Kolhapur', city: 'Kolhapur', type: 'both', arrivalTime: '00:00', departureTime: '00:10' },
    { name: 'Pune', city: 'Pune', type: 'both', arrivalTime: '04:30', departureTime: '04:40' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'drop', arrivalTime: '07:15' },
    { name: 'Borivali', city: 'Mumbai', type: 'drop', arrivalTime: '08:00' }
  ],
  'bengaluru|mumbai': [
    { name: 'Majestic', city: 'Bengaluru', type: 'pickup', departureTime: '15:00' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'pickup', departureTime: '15:30' },
    { name: 'Dharwad', city: 'Dharwad', type: 'both', arrivalTime: '20:30', departureTime: '20:35' },
    { name: 'Kolhapur', city: 'Kolhapur', type: 'both', arrivalTime: '00:00', departureTime: '00:10' },
    { name: 'Pune', city: 'Pune', type: 'both', arrivalTime: '04:30', departureTime: '04:40' },
    { name: 'Vashi', city: 'Navi Mumbai', type: 'drop', arrivalTime: '07:15' },
    { name: 'Borivali', city: 'Mumbai', type: 'drop', arrivalTime: '08:00' }
  ],
  'bangalore|kochi': [
    { name: 'Majestic', city: 'Bangalore', type: 'pickup', departureTime: '20:00' },
    { name: 'Madiwala', city: 'Bangalore', type: 'pickup', departureTime: '20:30' },
    { name: 'Electronic City', city: 'Bangalore', type: 'pickup', departureTime: '20:50' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '21:30', departureTime: '21:35' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '23:45', departureTime: '23:50' },
    { name: 'Coimbatore', city: 'Coimbatore', type: 'both', arrivalTime: '02:00', departureTime: '02:05' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '03:15', departureTime: '03:20' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'Aluva', city: 'Kochi', type: 'drop', arrivalTime: '05:30' },
    { name: 'Vytilla Hub', city: 'Kochi', type: 'drop', arrivalTime: '06:00' }
  ],
  'bengaluru|kochi': [
    { name: 'Majestic', city: 'Bengaluru', type: 'pickup', departureTime: '20:00' },
    { name: 'Madiwala', city: 'Bengaluru', type: 'pickup', departureTime: '20:30' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'pickup', departureTime: '20:50' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '21:30', departureTime: '21:35' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '23:45', departureTime: '23:50' },
    { name: 'Coimbatore', city: 'Coimbatore', type: 'both', arrivalTime: '02:00', departureTime: '02:05' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '03:15', departureTime: '03:20' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'Aluva', city: 'Kochi', type: 'drop', arrivalTime: '05:30' },
    { name: 'Vytilla Hub', city: 'Kochi', type: 'drop', arrivalTime: '06:00' }
  ],
  'kochi|bangalore': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '19:30' },
    { name: 'Aluva', city: 'Kochi', type: 'pickup', departureTime: '20:00' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '21:15', departureTime: '21:20' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '22:30', departureTime: '22:35' },
    { name: 'Coimbatore', city: 'Coimbatore', type: 'both', arrivalTime: '23:50', departureTime: '23:55' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '02:15', departureTime: '02:20' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'Electronic City', city: 'Bangalore', type: 'drop', arrivalTime: '05:15' },
    { name: 'Majestic', city: 'Bangalore', type: 'drop', arrivalTime: '06:00' }
  ],
  'kochi|bengaluru': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '19:30' },
    { name: 'Aluva', city: 'Kochi', type: 'pickup', departureTime: '20:00' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '21:15', departureTime: '21:20' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '22:30', departureTime: '22:35' },
    { name: 'Coimbatore', city: 'Coimbatore', type: 'both', arrivalTime: '23:50', departureTime: '23:55' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '02:15', departureTime: '02:20' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'drop', arrivalTime: '05:15' },
    { name: 'Majestic', city: 'Bengaluru', type: 'drop', arrivalTime: '06:00' }
  ],
  'kochi|chennai': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '18:30' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '20:00', departureTime: '20:05' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '21:15', departureTime: '21:20' },
    { name: 'Coimbatore', city: 'Coimbatore', type: 'both', arrivalTime: '22:30', departureTime: '22:35' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '01:00', departureTime: '01:05' },
    { name: 'Vellore', city: 'Vellore', type: 'both', arrivalTime: '03:45', departureTime: '03:50' },
    { name: 'Tambaram', city: 'Chennai', type: 'drop', arrivalTime: '05:30' },
    { name: 'Koyambedu', city: 'Chennai', type: 'drop', arrivalTime: '06:00' }
  ],
  'bangalore|mysore': [
    { name: 'Majestic', city: 'Bangalore', type: 'pickup', departureTime: '07:00' },
    { name: 'Kengeri', city: 'Bangalore', type: 'pickup', departureTime: '07:30' },
    { name: 'Ramanagara', city: 'Ramanagara', type: 'both', arrivalTime: '08:15', departureTime: '08:20' },
    { name: 'Mandya', city: 'Mandya', type: 'both', arrivalTime: '09:00', departureTime: '09:05' },
    { name: 'Suburb Bus Stand', city: 'Mysore', type: 'drop', arrivalTime: '10:00' }
  ],
  'bengaluru|mysuru': [
    { name: 'Majestic', city: 'Bengaluru', type: 'pickup', departureTime: '07:00' },
    { name: 'Kengeri', city: 'Bengaluru', type: 'pickup', departureTime: '07:30' },
    { name: 'Ramanagara', city: 'Ramanagara', type: 'both', arrivalTime: '08:15', departureTime: '08:20' },
    { name: 'Mandya', city: 'Mandya', type: 'both', arrivalTime: '09:00', departureTime: '09:05' },
    { name: 'Suburb Bus Stand', city: 'Mysuru', type: 'drop', arrivalTime: '10:00' }
  ],
  'mysore|bangalore': [
    { name: 'Suburb Bus Stand', city: 'Mysore', type: 'pickup', departureTime: '07:00' },
    { name: 'Mandya', city: 'Mandya', type: 'both', arrivalTime: '07:55', departureTime: '08:00' },
    { name: 'Ramanagara', city: 'Ramanagara', type: 'both', arrivalTime: '08:45', departureTime: '08:50' },
    { name: 'Kengeri', city: 'Bangalore', type: 'drop', arrivalTime: '09:30' },
    { name: 'Majestic', city: 'Bangalore', type: 'drop', arrivalTime: '10:00' }
  ],
  'mysuru|bengaluru': [
    { name: 'Suburb Bus Stand', city: 'Mysuru', type: 'pickup', departureTime: '07:00' },
    { name: 'Mandya', city: 'Mandya', type: 'both', arrivalTime: '07:55', departureTime: '08:00' },
    { name: 'Ramanagara', city: 'Ramanagara', type: 'both', arrivalTime: '08:45', departureTime: '08:50' },
    { name: 'Kengeri', city: 'Bengaluru', type: 'drop', arrivalTime: '09:30' },
    { name: 'Majestic', city: 'Bengaluru', type: 'drop', arrivalTime: '10:00' }
  ],
  'delhi|mumbai': [
    { name: 'Kashmiri Gate', city: 'Delhi', type: 'pickup', departureTime: '10:00' },
    { name: 'Dhaula Kuan', city: 'Delhi', type: 'pickup', departureTime: '10:30' },
    { name: 'Jaipur', city: 'Jaipur', type: 'both', arrivalTime: '15:30', departureTime: '15:45' },
    { name: 'Udaipur', city: 'Udaipur', type: 'both', arrivalTime: '21:30', departureTime: '21:45' },
    { name: 'Ahmedabad', city: 'Ahmedabad', type: 'both', arrivalTime: '02:30', departureTime: '02:45' },
    { name: 'Vadodara', city: 'Vadodara', type: 'both', arrivalTime: '04:30', departureTime: '04:40' },
    { name: 'Surat', city: 'Surat', type: 'both', arrivalTime: '06:30', departureTime: '06:40' },
    { name: 'Borivali', city: 'Mumbai', type: 'drop', arrivalTime: '11:00' }
  ],
  'mumbai|delhi': [
    { name: 'Borivali', city: 'Mumbai', type: 'pickup', departureTime: '10:00' },
    { name: 'Surat', city: 'Surat', type: 'both', arrivalTime: '14:30', departureTime: '14:40' },
    { name: 'Vadodara', city: 'Vadodara', type: 'both', arrivalTime: '16:30', departureTime: '16:40' },
    { name: 'Ahmedabad', city: 'Ahmedabad', type: 'both', arrivalTime: '18:30', departureTime: '18:45' },
    { name: 'Udaipur', city: 'Udaipur', type: 'both', arrivalTime: '23:30', departureTime: '23:45' },
    { name: 'Jaipur', city: 'Jaipur', type: 'both', arrivalTime: '05:30', departureTime: '05:45' },
    { name: 'Dhaula Kuan', city: 'Delhi', type: 'drop', arrivalTime: '10:30' },
    { name: 'Kashmiri Gate', city: 'Delhi', type: 'drop', arrivalTime: '11:00' }
  ],
  'thiruvananthapuram|kochi': [
    { name: 'Thampanoor', city: 'Thiruvananthapuram', type: 'pickup', departureTime: '06:00' },
    { name: 'Kazhakkoottam', city: 'Thiruvananthapuram', type: 'pickup', departureTime: '06:25' },
    { name: 'Kollam', city: 'Kollam', type: 'both', arrivalTime: '07:30', departureTime: '07:35' },
    { name: 'Kayamkulam', city: 'Kayamkulam', type: 'both', arrivalTime: '08:15', departureTime: '08:20' },
    { name: 'Alappuzha', city: 'Alappuzha', type: 'both', arrivalTime: '09:00', departureTime: '09:05' },
    { name: 'Vytilla Hub', city: 'Kochi', type: 'drop', arrivalTime: '10:30' }
  ],
  'kochi|thiruvananthapuram': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '06:00' },
    { name: 'Alappuzha', city: 'Alappuzha', type: 'both', arrivalTime: '07:20', departureTime: '07:25' },
    { name: 'Kayamkulam', city: 'Kayamkulam', type: 'both', arrivalTime: '08:05', departureTime: '08:10' },
    { name: 'Kollam', city: 'Kollam', type: 'both', arrivalTime: '08:50', departureTime: '08:55' },
    { name: 'Kazhakkoottam', city: 'Thiruvananthapuram', type: 'drop', arrivalTime: '10:00' },
    { name: 'Thampanoor', city: 'Thiruvananthapuram', type: 'drop', arrivalTime: '10:30' }
  ],
  'kozhikode|kochi': [
    { name: 'Kozhikode Bus Stand', city: 'Kozhikode', type: 'pickup', departureTime: '07:00' },
    { name: 'Kottakkal', city: 'Kottakkal', type: 'both', arrivalTime: '08:00', departureTime: '08:05' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'Aluva', city: 'Kochi', type: 'drop', arrivalTime: '10:30' },
    { name: 'Vytilla Hub', city: 'Kochi', type: 'drop', arrivalTime: '11:00' }
  ],
  'kochi|kozhikode': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '07:00' },
    { name: 'Aluva', city: 'Kochi', type: 'pickup', departureTime: '07:30' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '08:30', departureTime: '08:35' },
    { name: 'Kottakkal', city: 'Kottakkal', type: 'both', arrivalTime: '10:00', departureTime: '10:05' },
    { name: 'Kozhikode Bus Stand', city: 'Kozhikode', type: 'drop', arrivalTime: '11:00' }
  ],
  'coimbatore|kochi': [
    { name: 'Gandhipuram', city: 'Coimbatore', type: 'pickup', departureTime: '07:00' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '08:15', departureTime: '08:20' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '09:30', departureTime: '09:35' },
    { name: 'Aluva', city: 'Kochi', type: 'drop', arrivalTime: '10:30' },
    { name: 'Vytilla Hub', city: 'Kochi', type: 'drop', arrivalTime: '11:00' }
  ],
  'kochi|coimbatore': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '07:00' },
    { name: 'Aluva', city: 'Kochi', type: 'pickup', departureTime: '07:30' },
    { name: 'Thrissur', city: 'Thrissur', type: 'both', arrivalTime: '08:30', departureTime: '08:35' },
    { name: 'Palakkad', city: 'Palakkad', type: 'both', arrivalTime: '09:45', departureTime: '09:50' },
    { name: 'Gandhipuram', city: 'Coimbatore', type: 'drop', arrivalTime: '11:00' }
  ],
  'madurai|kochi': [
    { name: 'Mattuthavani', city: 'Madurai', type: 'pickup', departureTime: '07:00' },
    { name: 'Theni', city: 'Theni', type: 'both', arrivalTime: '08:30', departureTime: '08:35' },
    { name: 'Kumily', city: 'Kumily', type: 'both', arrivalTime: '10:00', departureTime: '10:05' },
    { name: 'Kothamangalam', city: 'Kothamangalam', type: 'both', arrivalTime: '12:30', departureTime: '12:35' },
    { name: 'Vytilla Hub', city: 'Kochi', type: 'drop', arrivalTime: '14:00' }
  ],
  'kochi|madurai': [
    { name: 'Vytilla Hub', city: 'Kochi', type: 'pickup', departureTime: '07:00' },
    { name: 'Kothamangalam', city: 'Kothamangalam', type: 'both', arrivalTime: '08:30', departureTime: '08:35' },
    { name: 'Kumily', city: 'Kumily', type: 'both', arrivalTime: '11:00', departureTime: '11:05' },
    { name: 'Theni', city: 'Theni', type: 'both', arrivalTime: '12:30', departureTime: '12:35' },
    { name: 'Mattuthavani', city: 'Madurai', type: 'drop', arrivalTime: '14:00' }
  ],
  'bengaluru|mangaluru': [
    { name: 'Majestic', city: 'Bengaluru', type: 'pickup', departureTime: '21:00' },
    { name: 'Yeshwanthpur', city: 'Bengaluru', type: 'pickup', departureTime: '21:30' },
    { name: 'Hassan', city: 'Hassan', type: 'both', arrivalTime: '00:30', departureTime: '00:35' },
    { name: 'Sakleshpur', city: 'Sakleshpur', type: 'both', arrivalTime: '01:30', departureTime: '01:35' },
    { name: 'BC Road', city: 'Bantwal', type: 'drop', arrivalTime: '04:30' },
    { name: 'KSRTC Bus Stand', city: 'Mangaluru', type: 'drop', arrivalTime: '05:00' }
  ],
  'coimbatore|bengaluru': [
    { name: 'Gandhipuram', city: 'Coimbatore', type: 'pickup', departureTime: '21:00' },
    { name: 'Hopes College', city: 'Coimbatore', type: 'pickup', departureTime: '21:20' },
    { name: 'Erode', city: 'Erode', type: 'both', arrivalTime: '22:30', departureTime: '22:35' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '23:45', departureTime: '23:50' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '02:30', departureTime: '02:35' },
    { name: 'Electronic City', city: 'Bengaluru', type: 'drop', arrivalTime: '03:15' },
    { name: 'Majestic', city: 'Bengaluru', type: 'drop', arrivalTime: '04:00' }
  ],
  'coimbatore|hyderabad': [
    { name: 'Gandhipuram', city: 'Coimbatore', type: 'pickup', departureTime: '18:00' },
    { name: 'Salem', city: 'Salem', type: 'both', arrivalTime: '20:30', departureTime: '20:35' },
    { name: 'Hosur', city: 'Hosur', type: 'both', arrivalTime: '23:00', departureTime: '23:05' },
    { name: 'Kurnool', city: 'Kurnool', type: 'both', arrivalTime: '04:30', departureTime: '04:35' },
    { name: 'LB Nagar', city: 'Hyderabad', type: 'drop', arrivalTime: '07:30' },
    { name: 'MGBS', city: 'Hyderabad', type: 'drop', arrivalTime: '08:00' }
  ]
};

function formatStops(stopsArray) {
  return stopsArray.map((s, idx) => ({
    name: s.name,
    city: s.city || s.name,
    type: s.type || (idx === 0 ? 'pickup' : idx === stopsArray.length - 1 ? 'drop' : 'both'),
    sequence: idx + 1,
    arrivalTime: s.arrivalTime || null,
    departureTime: s.departureTime || null
  }));
}

async function run() {
  await connectDB();
  console.log('Connected to MongoDB for Comprehensive Route Stops Migration\n');

  const routes = await Route.find({});
  console.log(`Found ${routes.length} routes in database.`);

  let updatedCount = 0;

  for (const route of routes) {
    const key = `${route.source.trim().toLowerCase()}|${route.destination.trim().toLowerCase()}`;
    const corridorDef = CORRIDOR_STOPS[key];

    if (corridorDef && corridorDef.length > 0) {
      const formatted = formatStops(corridorDef);
      route.stops = formatted;
      await route.save();
      updatedCount++;
      console.log(`  ✓ Upgraded corridor route: ${route.source} → ${route.destination} with ${formatted.length} stops`);
    } else {
      const normalizedStops = normalizeRouteStops(route);
      route.stops = normalizedStops;
      await route.save();
      updatedCount++;
      console.log(`  ✓ Normalized route: ${route.source} → ${route.destination} with ${normalizedStops.length} stops`);
    }
  }

  console.log(`\nMigration complete. Updated ${updatedCount} routes.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
