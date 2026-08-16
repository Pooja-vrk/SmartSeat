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

const connectDB = require('../config/database');

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    await Seat.deleteMany({});
    await Booking.deleteMany({});
    await SmartSeatPreference.deleteMany({});

    console.log('Creating users...');

    // Create admin user (password will be hashed by User model pre-save hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartseat.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      passengerCategory: 'general'
    });

    // Create passenger users (password will be hashed by User model pre-save hook)
    
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

    console.log('Creating routes...');

    // Create routes
    const route1 = await Route.create({
      source: 'Mumbai',
      destination: 'Pune',
      stops: ['Thane', 'Lonavala', 'Khandala'],
      distance: 150,
      estimatedDuration: '4h 30m',
      isActive: true
    });

    const route2 = await Route.create({
      source: 'Delhi',
      destination: 'Jaipur',
      stops: ['Gurgaon', 'Manesar'],
      distance: 280,
      estimatedDuration: '5h 30m',
      isActive: true
    });

    console.log('Creating buses...');

    // Create buses
    const bus1 = await Bus.create({
      operatorName: 'Smart Travels',
      busNumber: 'ST-2024-001',
      busType: 'AC Sleeper',
      registrationNumber: 'MH-01-AB-1234',
      seatConfiguration: {
        rows: 10,
        columns: 4,
        aisleAfter: 2,
        totalSeats: 40
      },
      amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket'],
      boardingPoints: ['Borivali East', 'Andheri East', 'Kurla', 'Kalamboli'],
      droppingPoints: ['Kothrud', 'Karve Nagar', 'Deccan', 'Pune Station'],
      isActive: true,
      rating: 4.5,
      totalRatings: 120
    });

    const bus2 = await Bus.create({
      operatorName: 'Night Rider',
      busNumber: 'NR-2024-012',
      busType: 'AC Multi-Axle',
      registrationNumber: 'MH-02-CD-5678',
      seatConfiguration: {
        rows: 12,
        columns: 4,
        aisleAfter: 2,
        totalSeats: 48
      },
      amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'Reading Light', 'TV'],
      boardingPoints: ['Dadar', 'Sion', 'Chembur'],
      droppingPoints: ['Swargate', 'Shivajinagar', 'PMC'],
      isActive: true,
      rating: 4.2,
      totalRatings: 85
    });

    const bus3 = await Bus.create({
      operatorName: 'Comfort Lines',
      busNumber: 'CL-2024-034',
      busType: 'Non-AC Seater',
      registrationNumber: 'MH-03-EF-9012',
      seatConfiguration: {
        rows: 9,
        columns: 4,
        aisleAfter: 2,
        totalSeats: 36
      },
      amenities: ['Water Bottle'],
      boardingPoints: ['Kalyan', 'Dombivili'],
      droppingPoints: ['Katraj', 'Warje'],
      isActive: true,
      rating: 3.8,
      totalRatings: 45
    });

    console.log('Creating schedules...');

    // Create schedules
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const schedule1 = await Schedule.create({
      busId: bus1._id,
      routeId: route1._id,
      departureTime: '22:00',
      arrivalTime: '02:30',
      travelDate: tomorrow,
      fare: 450,
      isActive: true,
      availableSeats: 40
    });

    const schedule2 = await Schedule.create({
      busId: bus2._id,
      routeId: route1._id,
      departureTime: '23:30',
      arrivalTime: '04:00',
      travelDate: tomorrow,
      fare: 550,
      isActive: true,
      availableSeats: 48
    });

    const schedule3 = await Schedule.create({
      busId: bus3._id,
      routeId: route2._id,
      departureTime: '06:00',
      arrivalTime: '11:30',
      travelDate: tomorrow,
      fare: 350,
      isActive: true,
      availableSeats: 36
    });

    console.log('Generating seat layouts...');

    // Generate seat layouts for schedules
    await generateSeatLayout(bus1._id, schedule1._id, bus1.seatConfiguration);
    await generateSeatLayout(bus2._id, schedule2._id, bus2.seatConfiguration);
    await generateSeatLayout(bus3._id, schedule3._id, bus3.seatConfiguration);

    console.log('Creating SmartSeat preferences...');

    // Create SmartSeat preferences for passengers
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

    console.log('Creating sample bookings...');

    // Create a booking for Passenger A on seat 05A (use a seat that exists)
    const seat05A = await Seat.findOne({ scheduleId: schedule1._id, seatNumber: '05A' });
    console.log('Found seat 05A:', seat05A ? 'Yes' : 'No');
    
    if (seat05A) {
      const booking1 = await Booking.create({
        bookingId: 'BK001',
        userId: passengerA._id,
        scheduleId: schedule1._id,
        busId: bus1._id,
        routeId: route1._id,
        seatNumber: '05A',
        passengerDetails: {
          name: passengerA.name,
          age: 28,
          gender: 'male',
          phone: passengerA.phone
        },
        fare: schedule1.fare,
        paymentStatus: 'completed',
        bookingStatus: 'confirmed',
        smartSeatMonitoring: true
      });

      // Mark seat as booked
      await Seat.findByIdAndUpdate(seat05A._id, {
        status: 'booked',
        bookedBy: passengerA._id,
        bookingId: booking1._id
      });

      // Update schedule available seats
      await Schedule.findByIdAndUpdate(schedule1._id, {
        $inc: { availableSeats: -1 }
      });
      
      console.log('Sample booking created successfully for seat 05A');
    } else {
      console.log('Could not find seat 05A for schedule:', schedule1._id);
      // Try to find any seat for debugging
      const anySeat = await Seat.findOne({ scheduleId: schedule1._id });
      console.log('Found any seat for schedule:', anySeat ? anySeat.seatNumber : 'None');
    }

    console.log('Seed data created successfully!');
    console.log('\n================================================');
    console.log('DEVELOPMENT CREDENTIALS:');
    console.log('================================================');
    console.log('Admin:');
    console.log('  Email: admin@smartseat.com');
    console.log('  Password: admin123');
    console.log('\nPassenger A (has booking on 05A):');
    console.log('  Email: passengera@test.com');
    console.log('  Password: pass123');
    console.log('\nPassenger B:');
    console.log('  Email: passengerb@test.com');
    console.log('  Password: pass123');
    console.log('\nPassenger C:');
    console.log('  Email: passengerc@test.com');
    console.log('  Password: pass123');
    console.log('================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
