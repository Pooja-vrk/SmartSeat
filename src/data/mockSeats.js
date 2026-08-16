// Mock seat data for development
// This will be replaced by API calls in production

export const generateSeatLayout = (busId, rows = 10, columns = 4, aisleAfter = 2) => {
  const seats = [];
  
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const seatNumber = `${row.toString().padStart(2, '0')}${String.fromCharCode(64 + col)}`;
      const isAisle = col === aisleAfter + 1;
      
      // Deterministic seat types: mostly available, some booked
      let seatType = 'available';
      const seatIndex = (row - 1) * columns + (col - 1);
      
      // Simple pattern: every 5th seat is booked, every 7th is temporarily reserved
      if (seatIndex % 5 === 0) seatType = 'booked';
      else if (seatIndex % 7 === 0) seatType = 'temporarily_reserved';
      
      // Adjacent seat logic: pairs are (A,B) and (C,D)
      // A pairs with B, C pairs with D
      // A is col 1, B is col 2, C is col 3, D is col 4
      let adjacentSeat;
      if (col === 1) {
        adjacentSeat = `${row.toString().padStart(2, '0')}B`;
      } else if (col === 2) {
        adjacentSeat = `${row.toString().padStart(2, '0')}A`;
      } else if (col === 3) {
        adjacentSeat = `${row.toString().padStart(2, '0')}D`;
      } else if (col === 4) {
        adjacentSeat = `${row.toString().padStart(2, '0')}C`;
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        seatNumber,
        row,
        column: col,
        type: seatType,
        price: 450,
        isAisle,
        adjacentSeat,
        windowSide: col === 1 || col === columns
      });
    }
  }
  
  return seats;
};

export const mockSeatStatus = {
  BUS001: generateSeatLayout('BUS001', 10, 4, 2),
  BUS002: generateSeatLayout('BUS002', 9, 4, 2),
  BUS003: generateSeatLayout('BUS003', 10, 4, 2),
  BUS004: generateSeatLayout('BUS004', 9, 4, 2),
  BUS005: generateSeatLayout('BUS005', 10, 4, 2)
};

export const getSeatLayout = (busId, busConfig = null) => {
  // If busConfig is provided, use its seat layout configuration
  if (busConfig && busConfig.seatLayout) {
    const { rows, columns, aisleAfter } = busConfig.seatLayout;
    // Always generate fresh layout for specific configurations to ensure correctness
    return generateSeatLayout(busId, rows, columns, aisleAfter);
  }
  
  // Fall back to existing or default layout
  if (mockSeatStatus[busId]) {
    return mockSeatStatus[busId];
  }
  
  // Generate default layout for unknown bus
  return generateSeatLayout(busId, 10, 4, 2);
};

export const getAdjacentSeatInfo = (seatNumber, seatLayout) => {
  const seat = seatLayout.find(s => s.seatNumber === seatNumber);
  if (!seat) return null;
  
  const adjacentSeat = seatLayout.find(s => s.seatNumber === seat.adjacentSeat);
  return adjacentSeat || null;
};
