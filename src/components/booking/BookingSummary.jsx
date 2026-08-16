// Booking summary component
import { Card, CardHeader, CardBody, Badge } from '../common';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Calendar, 
  Armchair, 
  User,
  Shield,
  IndianRupee
} from 'lucide-react';

const BookingSummary = ({ 
  bus, 
  selectedSeat, 
  passengerDetails, 
  searchParams,
  smartSeatMonitoring
}) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const departure = bus.schedule?.departure ? formatDateTime(bus.schedule.departure) : { date: 'N/A', time: 'N/A' };
  const arrival = bus.schedule?.arrival ? formatDateTime(bus.schedule.arrival) : { date: 'N/A', time: 'N/A' };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Bus Information */}
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-start space-x-3">
              <Bus className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-primary-900">{bus.operator || bus.operatorName || 'N/A'}</h4>
                <p className="text-sm text-primary-700">{bus.busNumber || 'N/A'}</p>
                <Badge variant="info" className="mt-2">{bus.busType || 'N/A'}</Badge>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">From</p>
                <p className="font-semibold text-gray-900">{bus.route?.from || bus.route?.source || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">To</p>
                <p className="font-semibold text-gray-900">{bus.route?.to || bus.route?.destination || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-600">Date</p>
              </div>
              <p className="font-semibold text-gray-900">{departure.date}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-600">Duration</p>
              </div>
              <p className="font-semibold text-gray-900">{bus.schedule?.duration || bus.route?.estimatedDuration || 'N/A'}</p>
            </div>
          </div>

          {/* Departure and Arrival */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">Departure</p>
              <p className="font-semibold text-green-900">{departure.time}</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Arrival</p>
              <p className="font-semibold text-blue-900">{arrival.time}</p>
            </div>
          </div>

          {/* Seat Information */}
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="flex items-center space-x-3">
              <Armchair className="w-5 h-5 text-secondary-600" />
              <div>
                <p className="text-sm text-secondary-700">Selected Seat</p>
                <p className="text-xl font-bold text-secondary-900">{selectedSeat}</p>
              </div>
            </div>
            <Badge variant="success">Confirmed</Badge>
          </div>

          {/* Passenger Details */}
          {passengerDetails && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-5 h-5 text-gray-500" />
                <h4 className="font-semibold text-gray-900">Passenger Details</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{passengerDetails.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{passengerDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{passengerDetails.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* SmartSeat Monitoring */}
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-primary-700">SmartSeat Monitoring</p>
                <p className="text-xs text-primary-600">
                  {smartSeatMonitoring ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Badge variant={smartSeatMonitoring ? 'success' : 'default'}>
              {smartSeatMonitoring ? 'ON' : 'OFF'}
            </Badge>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <IndianRupee className="w-6 h-6" />
              <div>
                <p className="text-sm text-primary-100">Total Fare</p>
                <p className="text-2xl font-bold">₹{bus.fare || bus.price || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary-200">Including all taxes</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default BookingSummary;
