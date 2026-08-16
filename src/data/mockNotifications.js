// Mock notification data for development
// This will be replaced by API calls in production

export const mockNotifications = [
  {
    id: 'NOTIF001',
    passengerId: 'PASS001',
    type: 'adjacent_seat',
    category: 'SmartSeat',
    title: 'Adjacent seat has been booked',
    message: 'Your adjacent seat 12B has been booked by another passenger.',
    data: {
      bookingId: 'BK001',
      currentSeat: '12A',
      adjacentSeat: '12B',
      previousStatus: 'available',
      newStatus: 'booked',
      passengerCategory: 'general',
      timestamp: '2024-08-16T08:30:00'
    },
    read: false,
    createdAt: '2024-08-16T08:30:00'
  },
  {
    id: 'NOTIF002',
    passengerId: 'PASS001',
    type: 'booking',
    category: 'Booking',
    title: 'Booking confirmed',
    message: 'Your booking BK002 has been confirmed successfully.',
    data: {
      bookingId: 'BK002',
      seat: '08B',
      busId: 'BUS002'
    },
    read: true,
    createdAt: '2024-08-16T14:25:00'
  },
  {
    id: 'NOTIF003',
    passengerId: 'PASS001',
    type: 'recommendation',
    category: 'SmartSeat',
    title: 'New seat recommendations available',
    message: 'Based on your preferences, we found 3 alternative seats with better matches.',
    data: {
      bookingId: 'BK001',
      recommendations: [
        { seat: '14A', matchScore: 96 },
        { seat: '16A', matchScore: 92 },
        { seat: '20A', matchScore: 88 }
      ]
    },
    read: false,
    createdAt: '2024-08-16T09:15:00'
  },
  {
    id: 'NOTIF004',
    passengerId: 'PASS001',
    type: 'payment',
    category: 'Payment',
    title: 'Payment successful',
    message: 'Your payment of ₹450 for booking BK002 was successful.',
    data: {
      bookingId: 'BK002',
      amount: 450,
      paymentMethod: 'UPI'
    },
    read: true,
    createdAt: '2024-08-16T14:22:00'
  },
  {
    id: 'NOTIF005',
    passengerId: 'PASS001',
    type: 'system',
    category: 'System',
    title: 'SmartSeat monitoring enabled',
    message: 'Adjacent seat monitoring has been enabled for your booking BK001.',
    data: {
      bookingId: 'BK001',
      feature: 'adjacent_seat_monitoring'
    },
    read: true,
    createdAt: '2024-08-15T10:35:00'
  },
  {
    id: 'NOTIF006',
    passengerId: 'PASS001',
    type: 'seat_update',
    category: 'Seat Update',
    title: 'Seat change confirmed',
    message: 'Your seat has been successfully changed from 12A to 14A.',
    data: {
      bookingId: 'BK001',
      previousSeat: '12A',
      newSeat: '14A',
      timestamp: '2024-08-16T10:00:00'
    },
    read: true,
    createdAt: '2024-08-16T10:00:00'
  }
];

export const getNotificationsByPassenger = (passengerId) => {
  return mockNotifications.filter(notif => notif.passengerId === passengerId);
};

export const getUnreadNotifications = (passengerId) => {
  return mockNotifications.filter(notif => 
    notif.passengerId === passengerId && !notif.read
  );
};

export const getNotificationsByCategory = (passengerId, category) => {
  return mockNotifications.filter(notif => 
    notif.passengerId === passengerId && notif.category === category
  );
};
