// BookingSummary.jsx

import {
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '../common';

import {
  Bus,
  MapPin,
  Clock,
  Calendar,
  Armchair,
  User,
  Shield,
  IndianRupee,
} from 'lucide-react';

import { calculateGST } from '../../config/gst';

const BookingSummary = ({
  bus,
  selectedSeat,
  passengerDetails,
  smartSeatMonitoring,
}) => {

  // ==========================================================
  // SAFE OBJECTS
  // ==========================================================

  const schedule =
    bus?.schedule || {};

  const route =
    bus?.route ||
    schedule?.routeId ||
    {};

  // ==========================================================
  // SAFE DISPLAY VALUES
  // ==========================================================

  const operatorName =
    bus?.operatorName ||
    bus?.operator ||
    'N/A';

  const busNumber =
    bus?.busNumber ||
    'N/A';

  const busType =
    bus?.busType ||
    'N/A';

  const from =
    route?.source ||
    route?.from ||
    'N/A';

  const to =
    route?.destination ||
    route?.to ||
    'N/A';

  const duration =
    schedule?.duration ||
    schedule?.estimatedDuration ||
    route?.estimatedDuration ||
    'N/A';

  const fare =
    Number(
      schedule?.fare ??
      bus?.fare ??
      0
    );

  // GST breakdown (computed client-side for display; backend is the source of truth)
  const { gstRate, gstAmount, totalAmount } = calculateGST(fare);

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDate = (value) => {
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
      'en-IN',
      {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  // ==========================================================
  // TIME FORMATTER
  // ==========================================================

  const formatTime = (value) => {
    if (!value) {
      return 'N/A';
    }

    // Backend format:
    // "06:00"
    // "11:30"

    if (
      typeof value === 'string' &&
      /^\d{2}:\d{2}$/.test(value)
    ) {
      const [
        hoursString,
        minutesString,
      ] = value.split(':');

      const hours =
        Number(hoursString);

      const minutes =
        Number(minutesString);

      if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
      ) {
        return 'N/A';
      }

      const period =
        hours >= 12
          ? 'PM'
          : 'AM';

      const displayHour =
        hours % 12 || 12;

      return `${displayHour}:${String(
        minutes
      ).padStart(2, '0')} ${period}`;
    }

    // Fallback for ISO date/time.
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
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }
    );
  };

  // ==========================================================
  // TRAVEL DATE
  // ==========================================================

  const travelDate =
    schedule?.travelDate ||
    bus?.travelDate ||
    null;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Card>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">
          Booking Summary
        </h3>
      </CardHeader>

      <CardBody>

        <div className="space-y-4">

          {/* ==================================================
              BUS
          ================================================== */}

          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">

            <div className="flex items-start gap-3">

              <Bus className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />

              <div className="flex-1">

                <h4 className="font-semibold text-primary-900">
                  {operatorName}
                </h4>

                <p className="text-sm text-primary-700">
                  {busNumber}
                </p>

                <Badge
                  variant="info"
                  className="mt-2"
                >
                  {busType}
                </Badge>

              </div>
            </div>
          </div>

          {/* ==================================================
              ROUTE
          ================================================== */}

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

          {/* ==================================================
              DATE + DURATION
          ================================================== */}

          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-gray-50 rounded-lg">

              <div className="flex items-center gap-2 mb-1">

                <Calendar className="w-4 h-4 text-gray-500" />

                <p className="text-xs text-gray-600">
                  Travel Date
                </p>

              </div>

              <p className="font-semibold text-gray-900 text-sm">
                {formatDate(
                  travelDate
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

          {/* ==================================================
              DEPARTURE + ARRIVAL
          ================================================== */}

          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">

              <p className="text-xs text-green-700 mb-1">
                Departure
              </p>

              <p className="font-semibold text-green-900">
                {formatTime(
                  schedule?.departureTime
                )}
              </p>

            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">

              <p className="text-xs text-blue-700 mb-1">
                Arrival
              </p>

              <p className="font-semibold text-blue-900">
                {formatTime(
                  schedule?.arrivalTime
                )}
              </p>

            </div>

          </div>

          {/* ==================================================
              SEAT
          ================================================== */}

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

          {/* ==================================================
              PASSENGER
          ================================================== */}

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
                    {passengerDetails?.name ||
                      passengerDetails?.fullName ||
                      'N/A'}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-600">
                    Email:
                  </span>

                  <span className="font-medium text-gray-900 text-right">
                    {passengerDetails?.email ||
                      'N/A'}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-600">
                    Phone:
                  </span>

                  <span className="font-medium text-gray-900 text-right">
                    {passengerDetails?.phone ||
                      'N/A'}
                  </span>

                </div>

              </div>
            </div>
          )}

          {/* ==================================================
              SMARTSEAT
          ================================================== */}

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

          {/* ==================================================
              FARE BREAKDOWN
          ================================================== */}

          <div className="rounded-lg border border-gray-200 overflow-hidden">

            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">
                  Fare Details
                </p>
              </div>
            </div>

            <div className="px-4 py-3 space-y-2">

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Base Fare
                </span>
                <span className="font-medium text-gray-900">
                  ₹{fare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  GST ({gstRate}%)
                </span>
                <span className="font-medium text-gray-900">
                  ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  Total
                </span>
              </div>
              <span className="text-xl font-bold">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

          </div>

        </div>

      </CardBody>
    </Card>
  );
};

export default BookingSummary;

