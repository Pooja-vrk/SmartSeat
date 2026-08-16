// Booking summary component

import {
  Card,
  CardHeader,
  CardBody,
  Badge
} from '../common';

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
  smartSeatMonitoring
}) => {

  // ==========================================================
  // SAFE VALUES
  // ==========================================================

  const schedule =
    bus?.schedule || {};

  const route =
    bus?.route ||
    schedule?.routeId ||
    {};

  // ==========================================================
  // DATE + TIME HELPERS
  // ==========================================================

  const createDateTime = (
    date,
    time
  ) => {
    if (!date || !time) {
      return null;
    }

    const datePart =
      new Date(date)
        .toISOString()
        .split('T')[0];

    const parsed =
      new Date(
        `${datePart}T${time}`
      );

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return 'N/A';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'N/A';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  };

  const formatTime = (
    value
  ) => {
    if (!value) {
      return 'N/A';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'N/A';
    }

    return date.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  };

  // ==========================================================
  // DEPARTURE
  // ==========================================================

  const departureDateTime =
    schedule.departure
      ? new Date(
          schedule.departure
        )
      : createDateTime(
          schedule.travelDate ||
            bus?.travelDate,
          schedule.departureTime
        );

  // ==========================================================
  // ARRIVAL
  // ==========================================================

  const arrivalDateTime =
    schedule.arrival
      ? new Date(
          schedule.arrival
        )
      : createDateTime(
          schedule.travelDate ||
            bus?.travelDate,
          schedule.arrivalTime
        );

  // ==========================================================
  // DISPLAY DATA
  // ==========================================================

  const from =
    route.source ||
    route.from ||
    'N/A';

  const to =
    route.destination ||
    route.to ||
    'N/A';

  const duration =
    schedule.duration ||
    route.estimatedDuration ||
    'N/A';

  const fare =
    Number(
      bus?.fare ??
        schedule?.fare ??
        0
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">
          Booking Summary
        </h3>
      </CardHeader>

      <CardBody>
        <div className="space-y-4">

          {/* BUS */}

          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-start gap-3">
              <Bus className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />

              <div className="flex-1">
                <h4 className="font-semibold text-primary-900">
                  {bus?.operatorName ||
                    bus?.operator ||
                    'N/A'}
                </h4>

                <p className="text-sm text-primary-700">
                  {bus?.busNumber ||
                    'N/A'}
                </p>

                <Badge
                  variant="info"
                  className="mt-2"
                >
                  {bus?.busType ||
                    'N/A'}
                </Badge>
              </div>
            </div>
          </div>

          {/* ROUTE */}

          <div className="space-y-3">

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />

              <div>
                <p className="text-sm text-gray-600">
                  From
                </p>

                <p className="font-semibold text-gray-900">
                  {from}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />

              <div>
                <p className="text-sm text-gray-600">
                  To
                </p>

                <p className="font-semibold text-gray-900">
                  {to}
                </p>
              </div>
            </div>

          </div>

          {/* DATE / DURATION */}

          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />

                <p className="text-xs text-gray-600">
                  Date
                </p>
              </div>

              <p className="font-semibold text-gray-900 text-sm">
                {formatDate(
                  departureDateTime
                )}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-500" />

                <p className="text-xs text-gray-600">
                  Duration
                </p>
              </div>

              <p className="font-semibold text-gray-900">
                {duration}
              </p>
            </div>

          </div>

          {/* DEPARTURE / ARRIVAL */}

          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">
                Departure
              </p>

              <p className="font-semibold text-green-900">
                {formatTime(
                  departureDateTime
                )}
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">
                Arrival
              </p>

              <p className="font-semibold text-blue-900">
                {formatTime(
                  arrivalDateTime
                )}
              </p>
            </div>

          </div>

          {/* SEAT */}

          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="flex items-center gap-3">
              <Armchair className="w-5 h-5 text-secondary-600" />

              <div>
                <p className="text-sm text-secondary-700">
                  Selected Seat
                </p>

                <p className="text-xl font-bold text-secondary-900">
                  {selectedSeat ||
                    'Not selected'}
                </p>
              </div>
            </div>

            <Badge
              variant={
                selectedSeat
                  ? 'success'
                  : 'default'
              }
            >
              {selectedSeat
                ? 'Selected'
                : 'Pending'}
            </Badge>
          </div>

          {/* PASSENGER */}

          {passengerDetails && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">

              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-gray-500" />

                <h4 className="font-semibold text-gray-900">
                  Passenger Details
                </h4>
              </div>

              <div className="space-y-2 text-sm">

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">
                    Name:
                  </span>

                  <span className="font-medium text-gray-900 text-right">
                    {passengerDetails.name ||
                      passengerDetails.fullName ||
                      'N/A'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">
                    Email:
                  </span>

                  <span className="font-medium text-gray-900 text-right">
                    {passengerDetails.email ||
                      'N/A'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">
                    Phone:
                  </span>

                  <span className="font-medium text-gray-900 text-right">
                    {passengerDetails.phone ||
                      'N/A'}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* SMARTSEAT */}

          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">

            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary-600" />

              <div>
                <p className="text-sm text-primary-700">
                  SmartSeat Monitoring
                </p>

                <p className="text-xs text-primary-600">
                  {smartSeatMonitoring
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>
            </div>

            <Badge
              variant={
                smartSeatMonitoring
                  ? 'success'
                  : 'default'
              }
            >
              {smartSeatMonitoring
                ? 'ON'
                : 'OFF'}
            </Badge>
          </div>

          {/* FARE */}

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">

            <div className="flex items-center gap-3">
              <IndianRupee className="w-6 h-6" />

              <div>
                <p className="text-sm opacity-80">
                  Total Fare
                </p>

                <p className="text-2xl font-bold">
                  ₹{fare}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-80">
                Per seat
              </p>
            </div>

          </div>

        </div>
      </CardBody>
    </Card>
  );
};

export default BookingSummary;