// Adjacent seat change notification component
import { Card, CardHeader, CardBody, Button, Badge } from '../common';
import { 
  AlertTriangle, 
  Armchair, 
  Users, 
  Clock,
  Shield,
  ArrowRight
} from 'lucide-react';

const AdjacentSeatChange = ({ 
  notification, 
  onKeepSeat, 
  onFindAlternative 
}) => {
  const { 
    currentSeat, 
    adjacentSeat, 
    previousStatus, 
    newStatus, 
    passengerCategory,
    timestamp 
  } = notification.data || {};

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const canShowPassengerCategory = passengerCategory && passengerCategory !== 'sensitive';

  return (
    <Card className="border-yellow-200 bg-yellow-50 shadow-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Adjacent Seat Change Detected</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Current Seat Info */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Armchair className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Your Seat</p>
                <p className="text-lg font-bold text-primary-600">{currentSeat}</p>
              </div>
            </div>
            <Badge variant="success">Your Seat</Badge>
          </div>

          {/* Adjacent Seat Info */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Adjacent Seat</p>
                <p className="text-lg font-bold text-gray-700">{adjacentSeat}</p>
              </div>
            </div>
            <Badge variant="warning">Changed</Badge>
          </div>

          {/* Status Change */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Status Change</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="info">{previousStatus}</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge variant="warning">{newStatus}</Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">{formatTime(timestamp)}</p>
          </div>

          {/* Passenger Category (if permitted) */}
          {canShowPassengerCategory && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Adjacent passenger: {passengerCategory}
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          {!canShowPassengerCategory && (
            <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
              <Shield className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-600">
                Passenger information is protected by privacy settings
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="primary"
              onClick={onKeepSeat}
              className="flex-1"
            >
              Keep Current Seat
            </Button>
            <Button
              variant="outline"
              onClick={onFindAlternative}
              className="flex-1"
            >
              Find Another Seat
            </Button>
          </div>

          {/* Notice */}
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
            <p>
              <Shield className="w-3 h-3 inline mr-1" />
              Your seat is not automatically changed. You have full control over your booking.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdjacentSeatChange;
