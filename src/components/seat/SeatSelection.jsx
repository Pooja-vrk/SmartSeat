// Interactive seat selection component
import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge } from '../common';
import { 
  Armchair, 
  User, 
  Lock, 
  AlertCircle,
  Star,
  Minimize2
} from 'lucide-react';

const SeatSelection = ({ 
  busId, 
  seatLayout, 
  selectedSeat, 
  onSeatSelect, 
  onSeatDeselect,
  monitoredSeat = null,
  recommendedSeats = []
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const getSeatStatus = (seat) => {
    if (seat.type === 'booked') return 'booked';
    if (seat.type === 'temporarily_reserved') return 'reserved';
    if (seat.type === 'unavailable') return 'unavailable';
    if (selectedSeat === seat.seatNumber) return 'selected';
    if (monitoredSeat === seat.seatNumber) return 'monitored';
    if (recommendedSeats.includes(seat.seatNumber)) return 'recommended';
    return 'available';
  };

  const getSeatStyles = (seat) => {
    const status = getSeatStatus(seat);
    
    const baseStyles = 'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer';
    
    const statusStyles = {
      available: 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50',
      selected: 'bg-primary-600 border-2 border-primary-600 text-white shadow-lg',
      booked: 'bg-gray-200 border-2 border-gray-300 text-gray-400 cursor-not-allowed',
      reserved: 'bg-yellow-100 border-2 border-yellow-400 text-yellow-700 cursor-not-allowed',
      unavailable: 'bg-red-100 border-2 border-red-300 text-red-400 cursor-not-allowed',
      monitored: 'bg-secondary-100 border-2 border-secondary-400 text-secondary-700',
      recommended: 'bg-green-100 border-2 border-green-400 text-green-700 hover:border-green-500 hover:bg-green-50'
    };

    return `${baseStyles} ${statusStyles[status]}`;
  };

  const getSeatIcon = (seat) => {
    const status = getSeatStatus(seat);
    
    if (status === 'booked') return <User className="w-4 h-4" />;
    if (status === 'reserved') return <AlertCircle className="w-4 h-4" />;
    if (status === 'unavailable') return <Lock className="w-4 h-4" />;
    if (status === 'monitored') return <Star className="w-4 h-4" />;
    if (status === 'recommended') return <Star className="w-4 h-4" />;
    return null;
  };

  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat);
    
    if (status === 'available' || status === 'recommended' || status === 'monitored') {
      if (selectedSeat === seat.seatNumber) {
        onSeatDeselect();
      } else {
        onSeatSelect(seat);
      }
    }
  };

  const renderSeatRow = (rowNumber, seatLayout) => {
    const rowSeats = seatLayout.filter(seat => seat.row === rowNumber);
    const sortedSeats = rowSeats.sort((a, b) => a.column - b.column);
    
    return (
      <div key={rowNumber} className="flex items-center space-x-2 sm:space-x-4 mb-2">
        <div className="w-8 text-xs text-gray-500 text-right">{rowNumber}</div>
        {sortedSeats.map((seat, index) => {
          const showAisle = seat.column === 3; // Add gap after column 2
          
          return (
            <div key={seat.id} className="flex items-center">
              {showAisle && (
                <div className="w-6 sm:w-8 flex-shrink-0" />
              )}
              <button
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
                className={getSeatStyles(seat)}
                disabled={seat.type === 'booked' || seat.type === 'temporarily_reserved' || seat.type === 'unavailable'}
                title={`${seat.seatNumber} - ${seat.type.replace('_', ' ')}`}
              >
                {getSeatIcon(seat) || seat.seatNumber}
              </button>
            </div>
          );
        })}
        <div className="w-8 text-xs text-gray-500">{rowNumber}</div>
      </div>
    );
  };

  const renderLegend = () => {
    const legendItems = [
      { status: 'available', label: 'Available', color: 'bg-white border-gray-300' },
      { status: 'selected', label: 'Selected', color: 'bg-primary-600 border-primary-600' },
      { status: 'booked', label: 'Booked', color: 'bg-gray-200 border-gray-300' },
      { status: 'reserved', label: 'Reserved', color: 'bg-yellow-100 border-yellow-400' },
      { status: 'unavailable', label: 'Unavailable', color: 'bg-red-100 border-red-300' },
      { status: 'monitored', label: 'Monitored', color: 'bg-secondary-100 border-secondary-400' },
      { status: 'recommended', label: 'Recommended', color: 'bg-green-100 border-green-400' }
    ];

    return (
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
        {legendItems.map((item) => (
          <div key={item.status} className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded border-2 ${item.color}`} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSeatInfo = () => {
    if (!hoveredSeat) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Seat {hoveredSeat.seatNumber}</h4>
            <p className="text-sm text-gray-600">
              {hoveredSeat.windowSide ? 'Window' : 'Aisle'} seat • Row {hoveredSeat.row}
            </p>
          </div>
          <Badge variant={hoveredSeat.type === 'available' ? 'success' : 'default'}>
            {hoveredSeat.type.replace('_', ' ')}
          </Badge>
        </div>
        {hoveredSeat.price && (
          <p className="mt-2 text-sm font-medium text-primary-600">₹{hoveredSeat.price}</p>
        )}
      </div>
    );
  };

  if (!seatLayout || seatLayout.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            No seat layout available
          </div>
        </CardBody>
      </Card>
    );
  }

  const rows = [...new Set(seatLayout.map(seat => seat.row))].sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Select Your Seat</h3>
          {selectedSeat && (
            <Badge variant="primary">
              Selected: {selectedSeat}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {/* Bus Front Indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Minimize2 className="w-4 h-4" />
            <span>FRONT / DRIVER</span>
            <Minimize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Seat Layout */}
        <div className="overflow-x-auto">
          <div className="min-w-fit inline-block">
            {rows.map(row => renderSeatRow(row, seatLayout))}
          </div>
        </div>

        {/* Seat Info */}
        {renderSeatInfo()}

        {/* Legend */}
        {renderLegend()}

        {/* Selected Seat Info */}
        {selectedSeat && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-primary-900">Selected Seat: {selectedSeat}</h4>
                <p className="text-sm text-primary-700">
                  You can proceed with booking or change your selection
                </p>
              </div>
              <Armchair className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SeatSelection;
