// Mock recommendation data for development
// This will be replaced by API calls in production

export const mockRecommendations = [
  {
    seatNumber: '14A',
    matchScore: 96,
    reasons: [
      'Adjacent seat is empty',
      'Front section preferred',
      'Good accessibility',
      'Near boarding point'
    ],
    seatType: 'available',
    price: 450,
    windowSide: true,
    distanceFromFront: 4
  },
  {
    seatNumber: '16A',
    matchScore: 92,
    reasons: [
      'Adjacent seat is occupied',
      'Middle section',
      'Good legroom'
    ],
    seatType: 'available',
    price: 450,
    windowSide: true,
    distanceFromFront: 6
  },
  {
    seatNumber: '20A',
    matchScore: 88,
    reasons: [
      'Adjacent seat is empty',
      'Quiet rear section',
      'Away from aisle'
    ],
    seatType: 'available',
    price: 450,
    windowSide: true,
    distanceFromFront: 10
  },
  {
    seatNumber: '05B',
    matchScore: 85,
    reasons: [
      'Adjacent seat is empty',
      'Very front section',
      'Quick exit'
    ],
    seatType: 'available',
    price: 450,
    windowSide: false,
    distanceFromFront: 5
  },
  {
    seatNumber: '18C',
    matchScore: 82,
    reasons: [
      'Adjacent seat is empty',
      'Middle-rear section',
      'Away from restroom'
    ],
    seatType: 'available',
    price: 450,
    windowSide: false,
    distanceFromFront: 8
  }
];

export const getRecommendations = (currentSeat, seatLayout, preferences = {}) => {
  // This is a mock implementation
  // In production, this will be replaced by backend recommendation engine
  const availableSeats = seatLayout.filter(seat => 
    seat.type === 'available' && seat.seatNumber !== currentSeat
  );
  
  return mockRecommendations.filter(rec => 
    availableSeats.some(seat => seat.seatNumber === rec.seatNumber)
  );
};

export const getRecommendationDetails = (seatNumber) => {
  return mockRecommendations.find(rec => rec.seatNumber === seatNumber);
};
