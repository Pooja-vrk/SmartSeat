// Mock booking data for development
// This will be replaced by API calls in production

export const mockBookings = [
  {
    id: 'BK001',
    passengerId: 'PASS001',
    passengerName: 'John Doe',
    passengerEmail: 'john.doe@email.com',
    passengerPhone: '+91 98765 43210',
    busId: 'BUS001',
    busOperator: 'Smart Travels',
    busNumber: 'ST-2024-001',
    busType: 'AC Sleeper',
    route: {
      from: 'Mumbai',
      to: 'Pune'
    },
    schedule: {
      departure: '2024-08-20T06:00:00',
      arrival: '2024-08-20T09:30:00',
      date: '2024-08-20'
    },
    seat: {
      number: '12A',
      type: 'Sleeper',
      price: 450
    },
    boardingPoint: 'Dadar East',
    droppingPoint: 'Swargate',
    fare: 450,
    status: 'confirmed',
    smartSeatMonitoring: true,
    createdAt: '2024-08-15T10:30:00',
    bookingTime: '2024-08-15T10:30:00'
  },
  {
    id: 'BK002',
    passengerId: 'PASS001',
    passengerName: 'John Doe',
    passengerEmail: 'john.doe@email.com',
    passengerPhone: '+91 98765 43210',
    busId: 'BUS002',
    busOperator: 'Express Lines',
    busNumber: 'EL-2024-045',
    busType: 'AC Seater',
    route: {
      from: 'Mumbai',
      to: 'Pune'
    },
    schedule: {
      departure: '2024-08-25T07:30:00',
      arrival: '2024-08-25T10:45:00',
      date: '2024-08-25'
    },
    seat: {
      number: '08B',
      type: 'Seater',
      price: 350
    },
    boardingPoint: 'Borivali East',
    droppingPoint: 'Pune Station',
    fare: 350,
    status: 'confirmed',
    smartSeatMonitoring: true,
    createdAt: '2024-08-16T14:20:00',
    bookingTime: '2024-08-16T14:20:00'
  },
  {
    id: 'BK003',
    passengerId: 'PASS001',
    passengerName: 'John Doe',
    passengerEmail: 'john.doe@email.com',
    passengerPhone: '+91 98765 43210',
    busId: 'BUS004',
    busOperator: 'Comfort Travels',
    busNumber: 'CT-2024-089',
    busType: 'AC Multi-Axle',
    route: {
      from: 'Delhi',
      to: 'Jaipur'
    },
    schedule: {
      departure: '2024-08-10T05:00:00',
      arrival: '2024-08-10T10:00:00',
      date: '2024-08-10'
    },
    seat: {
      number: '05A',
      type: 'Seater',
      price: 750
    },
    boardingPoint: 'Kashmere Gate',
    droppingPoint: 'MI Road',
    fare: 750,
    status: 'completed',
    smartSeatMonitoring: false,
    createdAt: '2024-08-05T09:15:00',
    bookingTime: '2024-08-05T09:15:00'
  },
  {
    id: 'BK004',
    passengerId: 'PASS001',
    passengerName: 'John Doe',
    passengerEmail: 'john.doe@email.com',
    passengerPhone: '+91 98765 43210',
    busId: 'BUS003',
    busOperator: 'Night Rider',
    busNumber: 'NR-2024-012',
    busType: 'Non-AC Sleeper',
    route: {
      from: 'Mumbai',
      to: 'Pune'
    },
    schedule: {
      departure: '2024-08-01T22:00:00',
      arrival: '2024-08-02T01:30:00',
      date: '2024-08-01'
    },
    seat: {
      number: '03C',
      type: 'Sleeper',
      price: 300
    },
    boardingPoint: 'Thane',
    droppingPoint: 'Shivaji Nagar',
    fare: 300,
    status: 'cancelled',
    smartSeatMonitoring: true,
    createdAt: '2024-07-28T16:45:00',
    bookingTime: '2024-07-28T16:45:00',
    cancelledAt: '2024-07-30T11:20:00'
  }
];

export const getBookingById = (bookingId) => {
  return mockBookings.find(booking => booking.id === bookingId);
};

export const getBookingsByPassenger = (passengerId) => {
  return mockBookings.filter(booking => booking.passengerId === passengerId);
};

export const getUpcomingBookings = (passengerId) => {
  const now = new Date();
  return mockBookings.filter(booking => 
    booking.passengerId === passengerId && 
    booking.status === 'confirmed' &&
    new Date(booking.schedule.departure) > now
  );
};

export const getCompletedBookings = (passengerId) => {
  const now = new Date();
  return mockBookings.filter(booking => 
    booking.passengerId === passengerId && 
    booking.status === 'completed'
  );
};

export const getCancelledBookings = (passengerId) => {
  return mockBookings.filter(booking => 
    booking.passengerId === passengerId && 
    booking.status === 'cancelled'
  );
};
