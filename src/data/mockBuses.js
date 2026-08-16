// Mock bus data for development
// This will be replaced by API calls in production

export const mockBuses = [
  {
    id: 'BUS001',
    operator: 'Smart Travels',
    busNumber: 'ST-2024-001',
    busType: 'AC Sleeper',
    route: {
      from: 'Mumbai',
      to: 'Pune',
      distance: '150 km'
    },
    schedule: {
      departure: '2024-08-20T06:00:00',
      arrival: '2024-08-20T09:30:00',
      duration: '3h 30m'
    },
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket', 'AC'],
    price: 450,
    rating: 4.5,
    totalSeats: 40,
    availableSeats: 28,
    boardingPoints: ['Dadar East', 'Sion', 'Chembur', 'Panvel'],
    droppingPoints: ['Wakad', 'Hinjewadi', 'Shivaji Nagar', 'Swargate'],
    seatLayout: {
      rows: 10,
      columns: 4,
      aisleAfter: 2
    }
  },
  {
    id: 'BUS002',
    operator: 'Express Lines',
    busNumber: 'EL-2024-045',
    busType: 'AC Seater',
    route: {
      from: 'Mumbai',
      to: 'Pune',
      distance: '150 km'
    },
    schedule: {
      departure: '2024-08-20T07:30:00',
      arrival: '2024-08-20T10:45:00',
      duration: '3h 15m'
    },
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'AC'],
    price: 350,
    rating: 4.2,
    totalSeats: 36,
    availableSeats: 15,
    boardingPoints: ['Borivali East', 'Andheri East', 'Kurla', 'Kalamboli'],
    droppingPoints: ['Kothrud', 'Karve Nagar', 'Deccan', 'Pune Station'],
    seatLayout: {
      rows: 9,
      columns: 4,
      aisleAfter: 2
    }
  },
  {
    id: 'BUS003',
    operator: 'Night Rider',
    busNumber: 'NR-2024-012',
    busType: 'Non-AC Sleeper',
    route: {
      from: 'Mumbai',
      to: 'Pune',
      distance: '150 km'
    },
    schedule: {
      departure: '2024-08-20T22:00:00',
      arrival: '2024-08-21T01:30:00',
      duration: '3h 30m'
    },
    amenities: ['USB Charging', 'Water Bottle', 'Blanket'],
    price: 300,
    rating: 3.8,
    totalSeats: 40,
    availableSeats: 32,
    boardingPoints: ['Thane', 'Navi Mumbai', 'Panvel'],
    droppingPoints: ['Wakad', 'Hinjewadi', 'Shivaji Nagar'],
    seatLayout: {
      rows: 10,
      columns: 4,
      aisleAfter: 2
    }
  },
  {
    id: 'BUS004',
    operator: 'Comfort Travels',
    busNumber: 'CT-2024-089',
    busType: 'AC Multi-Axle',
    route: {
      from: 'Delhi',
      to: 'Jaipur',
      distance: '280 km'
    },
    schedule: {
      departure: '2024-08-20T05:00:00',
      arrival: '2024-08-20T10:00:00',
      duration: '5h 00m'
    },
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket', 'AC', 'Reading Light', 'Snacks'],
    price: 750,
    rating: 4.7,
    totalSeats: 36,
    availableSeats: 20,
    boardingPoints: ['Kashmere Gate', 'Rajouri Garden', 'Dhaula Kuan'],
    droppingPoints: ['Ajmeri Gate', 'Civil Lines', 'MI Road'],
    seatLayout: {
      rows: 9,
      columns: 4,
      aisleAfter: 2
    }
  },
  {
    id: 'BUS005',
    operator: 'Royal Express',
    busNumber: 'RE-2024-156',
    busType: 'AC Seater',
    route: {
      from: 'Bangalore',
      to: 'Chennai',
      distance: '350 km'
    },
    schedule: {
      departure: '2024-08-20T06:30:00',
      arrival: '2024-08-20T12:30:00',
      duration: '6h 00m'
    },
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'AC', 'Entertainment'],
    price: 800,
    rating: 4.4,
    totalSeats: 40,
    availableSeats: 25,
    boardingPoints: ['Majestic', 'Silk Board', 'Electronic City'],
    droppingPoints: ['Koyambedu', 'Guindy', 'Tambaram'],
    seatLayout: {
      rows: 10,
      columns: 4,
      aisleAfter: 2
    }
  }
];

export const mockBusDetails = (busId) => {
  return mockBuses.find(bus => bus.id === busId) || mockBuses[0];
};
