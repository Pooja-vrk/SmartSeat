// Mock admin dashboard data for development
// This will be replaced by API calls in production

export const mockAdminDashboard = {
  overview: {
    totalBuses: 45,
    activeBuses: 38,
    todayBookings: 156,
    activePassengers: 1240,
    seatChanges: 23,
    smartSeatNotifications: 89,
    totalRevenue: 245000,
    monthlyRevenue: 8900000
  },
  recentBookings: [
    {
      id: 'BK001',
      passenger: 'John Doe',
      bus: 'BUS001',
      seat: '12A',
      date: '2024-08-20',
      status: 'confirmed',
      amount: 450,
      createdAt: '2024-08-16T10:30:00'
    },
    {
      id: 'BK002',
      passenger: 'Jane Smith',
      bus: 'BUS002',
      seat: '08B',
      date: '2024-08-25',
      status: 'confirmed',
      amount: 350,
      createdAt: '2024-08-16T14:20:00'
    },
    {
      id: 'BK003',
      passenger: 'Mike Johnson',
      bus: 'BUS004',
      seat: '05A',
      date: '2024-08-18',
      status: 'confirmed',
      amount: 750,
      createdAt: '2024-08-16T09:15:00'
    }
  ],
  recentNotifications: [
    {
      id: 'NOTIF001',
      type: 'adjacent_seat',
      recipient: 'John Doe',
      message: 'Adjacent seat 12B has been booked',
      time: '2024-08-16T08:30:00',
      read: false
    },
    {
      id: 'NOTIF002',
      type: 'booking',
      recipient: 'Jane Smith',
      message: 'Booking confirmed',
      time: '2024-08-16T14:25:00',
      read: true
    },
    {
      id: 'NOTIF003',
      type: 'recommendation',
      recipient: 'John Doe',
      message: 'New recommendations available',
      time: '2024-08-16T09:15:00',
      read: false
    }
  ],
  popularRoutes: [
    { from: 'Mumbai', to: 'Pune', bookings: 2340, revenue: 1053000 },
    { from: 'Delhi', to: 'Jaipur', bookings: 1890, revenue: 1417500 },
    { from: 'Bangalore', to: 'Chennai', bookings: 1560, revenue: 1248000 },
    { from: 'Hyderabad', to: 'Vijayawada', bookings: 980, revenue: 588000 },
    { from: 'Chennai', to: 'Bangalore', bookings: 890, revenue: 712000 }
  ],
  passengerStats: {
    total: 1240,
    active: 890,
    newThisMonth: 156,
    withSmartSeatEnabled: 678
  },
  seatChangeStats: {
    total: 23,
    thisWeek: 8,
    successful: 21,
    failed: 2
  }
};

export const mockAdminBuses = [
  {
    id: 'BUS001',
    operator: 'Smart Travels',
    busNumber: 'ST-2024-001',
    busType: 'AC Sleeper',
    route: { from: 'Mumbai', to: 'Pune' },
    status: 'active',
    totalSeats: 40,
    seatLayout: { rows: 10, columns: 4, aisleAfter: 2 },
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket', 'AC'],
    createdAt: '2024-01-15'
  },
  {
    id: 'BUS002',
    operator: 'Express Lines',
    busNumber: 'EL-2024-045',
    busType: 'AC Seater',
    route: { from: 'Mumbai', to: 'Pune' },
    status: 'active',
    totalSeats: 36,
    seatLayout: { rows: 9, columns: 4, aisleAfter: 2 },
    amenities: ['WiFi', 'USB Charging', 'Water Bottle', 'AC'],
    createdAt: '2024-02-20'
  },
  {
    id: 'BUS003',
    operator: 'Night Rider',
    busNumber: 'NR-2024-012',
    busType: 'Non-AC Sleeper',
    route: { from: 'Mumbai', to: 'Pune' },
    status: 'maintenance',
    totalSeats: 40,
    seatLayout: { rows: 10, columns: 4, aisleAfter: 2 },
    amenities: ['USB Charging', 'Water Bottle', 'Blanket'],
    createdAt: '2024-03-10'
  }
];

export const mockAdminPassengers = [
  {
    id: 'PASS001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 98765 43210',
    totalBookings: 12,
    activeBookings: 2,
    smartSeatEnabled: true,
    createdAt: '2024-01-20'
  },
  {
    id: 'PASS002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+91 98765 43211',
    totalBookings: 8,
    activeBookings: 1,
    smartSeatEnabled: true,
    createdAt: '2024-02-15'
  },
  {
    id: 'PASS003',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+91 98765 43212',
    totalBookings: 5,
    activeBookings: 1,
    smartSeatEnabled: false,
    createdAt: '2024-03-05'
  }
];

export const mockAdminBookings = [
  {
    id: 'BK001',
    passengerId: 'PASS001',
    passengerName: 'John Doe',
    busId: 'BUS001',
    busNumber: 'ST-2024-001',
    seat: '12A',
    date: '2024-08-20',
    status: 'confirmed',
    amount: 450,
    smartSeatMonitoring: true,
    createdAt: '2024-08-16T10:30:00'
  },
  {
    id: 'BK002',
    passengerId: 'PASS002',
    passengerName: 'Jane Smith',
    busId: 'BUS002',
    busNumber: 'EL-2024-045',
    seat: '08B',
    date: '2024-08-25',
    status: 'confirmed',
    amount: 350,
    smartSeatMonitoring: true,
    createdAt: '2024-08-16T14:20:00'
  },
  {
    id: 'BK003',
    passengerId: 'PASS003',
    passengerName: 'Mike Johnson',
    busId: 'BUS004',
    busNumber: 'CT-2024-089',
    seat: '05A',
    date: '2024-08-18',
    status: 'confirmed',
    amount: 750,
    smartSeatMonitoring: false,
    createdAt: '2024-08-16T09:15:00'
  }
];
