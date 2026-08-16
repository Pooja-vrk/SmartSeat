// SmartSeat awareness panel for adjacent seat monitoring
import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Switch } from '../common';
import { 
  Bell, 
  BellOff, 
  Armchair, 
  Users, 
  Shield,
  Settings,
  Info
} from 'lucide-react';

const SmartSeatPanel = ({ 
  currentSeat, 
  adjacentSeatInfo, 
  monitoringEnabled, 
  onToggleMonitoring,
  showPreferences = false,
  onViewPreferences
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const getAdjacentStatusBadge = () => {
    if (!adjacentSeatInfo) {
      return <Badge variant="default">Unknown</Badge>;
    }

    switch (adjacentSeatInfo.type) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'booked':
        return <Badge variant="warning">Booked</Badge>;
      case 'temporarily_reserved':
        return <Badge variant="info">Reserved</Badge>;
      case 'unavailable':
        return <Badge variant="danger">Unavailable</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getAdjacentStatusText = () => {
    if (!adjacentSeatInfo) {
      return 'No adjacent seat information available';
    }

    switch (adjacentSeatInfo.type) {
      case 'available':
        return 'Your adjacent seat is currently empty. You will be notified if someone books it.';
      case 'booked':
        return 'Your adjacent seat has been booked by another passenger.';
      case 'temporarily_reserved':
        return 'Your adjacent seat is temporarily reserved.';
      case 'unavailable':
        return 'Your adjacent seat is unavailable.';
      default:
        return 'Status unknown';
    }
  };

  return (
    <Card className="border-primary-200 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">SmartSeat Awareness</h3>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardBody>
        {showInfo && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              SmartSeat monitors your adjacent seat and notifies you of changes. 
              You can choose to keep your current seat or explore alternatives based on your preferences.
            </p>
          </div>
        )}

        {/* Current Seat */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Current Seat</span>
            <div className="flex items-center space-x-2">
              <Armchair className="w-4 h-4 text-primary-600" />
              <span className="text-lg font-bold text-primary-600">{currentSeat}</span>
            </div>
          </div>
        </div>

        {/* Adjacent Seat */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Adjacent Seat</span>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold text-gray-700">
                {adjacentSeatInfo?.seatNumber || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Status</span>
            {getAdjacentStatusBadge()}
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {getAdjacentStatusText()}
          </p>
        </div>

        {/* Monitoring Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center space-x-3">
              {monitoringEnabled ? (
                <Bell className="w-5 h-5 text-primary-600" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Adjacent Seat Monitoring
                </p>
                <p className="text-xs text-gray-600">
                  {monitoringEnabled 
                    ? 'You will be notified of changes' 
                    : 'Notifications disabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={monitoringEnabled}
              onChange={onToggleMonitoring}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  monitoringEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Switch>
          </div>
        </div>

        {/* Preference Settings */}
        {showPreferences && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewPreferences}
              className="w-full"
              icon={Settings}
            >
              Configure SmartSeat Preferences
            </Button>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
          <p>
            <Shield className="w-3 h-3 inline mr-1" />
            Your privacy is protected. We only share permitted information based on your preferences.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default SmartSeatPanel;
