// Digital ticket component
import { Card, CardBody, Button, Badge } from '../common';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Calendar, 
  Armchair, 
  User,
  Smartphone,
  Download,
  Share2,
  IndianRupee,
  Shield,
  QrCode
} from 'lucide-react';

const Ticket = ({ booking, onDownload, onShare }) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const departure = formatDateTime(booking.schedule.departure);
  const arrival = formatDateTime(booking.schedule.arrival);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-primary-200 shadow-xl">
        <CardBody>
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Bus className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SmartSeat
              </h2>
            </div>
            <p className="text-sm text-gray-600">Digital Ticket</p>
          </div>

          {/* Booking ID */}
          <div className="flex items-center justify-between mb-6 p-3 bg-primary-50 rounded-lg">
            <div>
              <p className="text-xs text-primary-600">Booking ID</p>
              <p className="text-lg font-bold text-primary-900">{booking.id}</p>
            </div>
            <Badge variant="success">Confirmed</Badge>
          </div>

          {/* Passenger Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Passenger Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{booking.passengerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{booking.passengerEmail}</p>
              </div>
            </div>
          </div>

          {/* Bus and Route Info */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Bus className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-primary-900">Bus Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-700">Operator</span>
                <span className="font-medium text-primary-900">{booking.busOperator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Bus Number</span>
                <span className="font-medium text-primary-900">{booking.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Bus Type</span>
                <span className="font-medium text-primary-900">{booking.busType}</span>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-600">From</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{booking.route.from}</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-px bg-gray-300 relative">
                  <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-600 bg-white" />
                </div>
                <p className="text-xs text-gray-500 mt-2">{booking.schedule.duration}</p>
              </div>
              
              <div className="text-center flex-1">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-gray-600">To</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{booking.route.to}</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700">Departure</p>
              </div>
              <p className="font-semibold text-green-900">{departure.date}</p>
              <p className="text-sm text-green-800">{departure.time}</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700">Arrival</p>
              </div>
              <p className="font-semibold text-blue-900">{arrival.date}</p>
              <p className="text-sm text-blue-800">{arrival.time}</p>
            </div>
          </div>

          {/* Seat and Boarding */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2 mb-1">
                <Armchair className="w-4 h-4 text-secondary-600" />
                <p className="text-xs text-secondary-700">Seat</p>
              </div>
              <p className="text-2xl font-bold text-secondary-900">{booking.seat.number}</p>
              <p className="text-xs text-secondary-600">{booking.seat.type}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-600" />
                <p className="text-xs text-gray-700">Boarding</p>
              </div>
              <p className="font-semibold text-gray-900">{booking.boardingPoint}</p>
              <p className="text-xs text-gray-600">Dropping: {booking.droppingPoint}</p>
            </div>
          </div>

          {/* SmartSeat Status */}
          <div className="mb-6 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-700">SmartSeat Monitoring</span>
              </div>
              <Badge variant={booking.smartSeatMonitoring ? 'success' : 'default'}>
                {booking.smartSeatMonitoring ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <QrCode className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-600">Scan for boarding</p>
            </div>
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Show this QR code at boarding</p>
          </div>

          {/* Fare */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IndianRupee className="w-6 h-6" />
                <div>
                  <p className="text-sm text-primary-100">Total Fare</p>
                  <p className="text-2xl font-bold">₹{booking.fare}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-200">Including all taxes</p>
                <p className="text-xs text-primary-200">Paid successfully</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onDownload}
              className="flex-1"
              icon={Download}
            >
              Download Ticket
            </Button>
            <Button
              variant="outline"
              onClick={onShare}
              className="flex-1"
              icon={Share2}
            >
              Share Ticket
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Please carry a valid ID proof for verification
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For support, contact: +91 1800-123-4567
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Ticket;
