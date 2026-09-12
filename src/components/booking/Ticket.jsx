// Digital ticket component
import { Card, CardBody, Button, Badge } from '../common';

import {
  Bus,
  MapPin,
  Calendar,
  Armchair,
  User,
  Download,
  Share2,
  IndianRupee,
  Shield,
  QrCode,
} from 'lucide-react';

const Ticket = ({ booking, onDownload, onShare }) => {
  // ==========================================================
  // SAFE BOOKING OBJECT
  // ==========================================================

  const safeBooking = booking || {};

  // ==========================================================
  // SAFE OBJECT RESOLUTION
  // ==========================================================

  const schedule =
    safeBooking?.scheduleId &&
    typeof safeBooking.scheduleId === 'object'
      ? safeBooking.scheduleId
      : safeBooking?.schedule || {};

  const route =
    (safeBooking?.routeId && typeof safeBooking.routeId === 'object' ? safeBooking.routeId : null) ||
    safeBooking?.route ||
    (schedule?.routeId && typeof schedule.routeId === 'object' ? schedule.routeId : null) ||
    schedule?.route ||
    {};

  const bus =
    (safeBooking?.busId && typeof safeBooking.busId === 'object' ? safeBooking.busId : null) ||
    safeBooking?.bus ||
    schedule?.bus ||
    (schedule?.busId && typeof schedule.busId === 'object' ? schedule.busId : null) ||
    {};

  const passenger =
    safeBooking?.passengerDetails ||
    safeBooking?.passenger ||
    {};

  const seat =
    safeBooking?.seat ||
    {};

  // ==========================================================
  // SAFE VALUES
  // ==========================================================

  const bookingId =
    safeBooking?.bookingId ||
    safeBooking?.id ||
    safeBooking?._id ||
    'N/A';

  const passengerName =
    passenger?.name ||
    passenger?.fullName ||
    safeBooking?.passengerName ||
    'N/A';

  const passengerEmail =
    passenger?.email ||
    safeBooking?.passengerEmail ||
    (typeof safeBooking?.userId === 'object' ? safeBooking.userId?.email : null) ||
    'N/A';

  const passengerPhone =
    passenger?.phone ||
    safeBooking?.passengerPhone ||
    'N/A';

  // ==========================================================
  // BUS INFORMATION
  // ==========================================================

  const busOperator =
    safeBooking?.busOperator ||
    safeBooking?.operatorName ||
    bus?.operatorName ||
    bus?.operator ||
    'N/A';

  const busNumber =
    safeBooking?.busNumber ||
    bus?.busNumber ||
    bus?.number ||
    'N/A';

  const busType =
    safeBooking?.busType ||
    bus?.busType ||
    bus?.type ||
    'N/A';

  // ==========================================================
  // ROUTE INFORMATION
  // ==========================================================

  const from =
    route?.from ||
    route?.source ||
    route?.origin ||
    'N/A';

  const to =
    route?.to ||
    route?.destination ||
    route?.dest ||
    'N/A';

  // ==========================================================
  // SEAT INFORMATION
  // ==========================================================

  const seatNumber =
    safeBooking?.seatNumber ||
    seat?.number ||
    seat?.seatNumber ||
    'N/A';

  const seatType =
    seat?.type ||
    seat?.seatType ||
    'Standard';

  // ==========================================================
  // BOARDING INFORMATION
  // ==========================================================

  const boardingPointObj = safeBooking?.boardingPoint;
  const droppingPointObj = safeBooking?.droppingPoint;

  const boardingPoint =
    (typeof boardingPointObj === 'object' ? boardingPointObj?.name : boardingPointObj) ||
    safeBooking?.boarding ||
    from ||
    'N/A';

  const droppingPoint =
    (typeof droppingPointObj === 'object' ? droppingPointObj?.name : droppingPointObj) ||
    safeBooking?.dropping ||
    to ||
    'N/A';

  const boardingTime =
    (typeof boardingPointObj === 'object' ? boardingPointObj?.time : null) ||
    '';

  const droppingTime =
    (typeof droppingPointObj === 'object' ? droppingPointObj?.time : null) ||
    '';

  // ==========================================================
  // SMARTSEAT
  // ==========================================================

  const smartSeatMonitoring =
    Boolean(
      safeBooking?.smartSeatMonitoring
    );

  // ==========================================================
  // FARE — backend values are the source of truth.
  //
  // New bookings have all four fields from bookingService:
  //   baseFare, gstRate, gstAmount, fare (= GST-inclusive total)
  //
  // Legacy bookings (created before GST was added) only have
  // `fare` = raw schedule fare (no GST applied).  For those,
  // we back-compute the GST breakdown from the current rate
  // so the ticket always shows a consistent display format.
  // ==========================================================

  const rawFare = Number(
    safeBooking?.fare ??
      safeBooking?.amount ??
      schedule?.fare ??
      0
  );

  // Determine whether this booking already has GST fields stored
  const storedBaseFare  = Number(safeBooking?.baseFare  ?? 0);
  const storedGstRate   = Number(safeBooking?.gstRate   ?? 0);
  const storedGstAmount = Number(safeBooking?.gstAmount ?? 0);

  const hasStoredGST = storedBaseFare > 0 && storedGstRate > 0;

  // For display:
  let baseFare, gstRate, gstAmount, totalFare;

  if (hasStoredGST) {
    // New booking — use backend-stored authoritative values
    baseFare  = storedBaseFare;
    gstRate   = storedGstRate;
    gstAmount = storedGstAmount;
    totalFare = rawFare;  // fare = baseFare + gstAmount
  } else {
    // Legacy booking — rawFare is the pre-GST schedule fare.
    // Back-compute using current GST_RATE for a consistent display.
    // These are display-only estimates; the stored DB value is unchanged.
    const legacyGstRate   = 5;
    const legacyGstAmount = Math.round(rawFare * (legacyGstRate / 100) * 100) / 100;
    const legacyTotal     = Math.round((rawFare + legacyGstAmount) * 100) / 100;
    baseFare  = rawFare;
    gstRate   = legacyGstRate;
    gstAmount = legacyGstAmount;
    totalFare = legacyTotal;
  }

  // ==========================================================
  // DATE/TIME HELPERS
  // ==========================================================

  const formatDateTime = (value) => {
    if (!value) {
      return {
        date: 'N/A',
        time: 'N/A',
      };
    }

    // Backend may provide:
    // "06:00"
    // "11:30"

    if (
      typeof value === 'string' &&
      /^\d{2}:\d{2}$/.test(value)
    ) {
      const [hoursString, minutesString] =
        value.split(':');

      const hours = Number(hoursString);
      const minutes = Number(minutesString);

      if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
      ) {
        return {
          date: 'N/A',
          time: 'N/A',
        };
      }

      const period =
        hours >= 12 ? 'PM' : 'AM';

      const displayHour =
        hours % 12 || 12;

      return {
        date:
          schedule?.travelDate
            ? formatDate(schedule.travelDate)
            : 'N/A',

        time: `${displayHour}:${String(
          minutes
        ).padStart(2, '0')} ${period}`,
      };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return {
        date: 'N/A',
        time: 'N/A',
      };
    }

    return {
      date: date.toLocaleDateString(
        'en-IN',
        {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      ),

      time: date.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }
      ),
    };
  };

  const formatDate = (value) => {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  // ==========================================================
  // DEPARTURE / ARRIVAL
  // ==========================================================

  const departureValue =
    schedule?.departure ||
    schedule?.departureTime ||
    safeBooking?.departure ||
    safeBooking?.departureTime ||
    null;

  const arrivalValue =
    schedule?.arrival ||
    schedule?.arrivalTime ||
    safeBooking?.arrival ||
    safeBooking?.arrivalTime ||
    null;

  const departure =
    formatDateTime(departureValue);

  const arrival =
    formatDateTime(arrivalValue);

  // ==========================================================
  // DURATION
  // ==========================================================

  const duration =
    schedule?.duration ||
    schedule?.estimatedDuration ||
    route?.estimatedDuration ||
    'N/A';

  // ==========================================================
  // PAYMENT STATUS
  // ==========================================================

  const paymentStatus =
    safeBooking?.payment?.status ||
    safeBooking?.paymentStatus ||
    safeBooking?.status ||
    'Paid';

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="max-w-2xl mx-auto">

      <Card className="border-2 border-primary-200 shadow-xl">

        <CardBody>

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-200">

            <div className="flex items-center justify-center space-x-2 mb-2">

              <Bus className="w-6 h-6 text-primary-600" />

              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SmartSeat
              </h2>

            </div>

            <p className="text-sm text-gray-600">
              Digital Ticket
            </p>

          </div>

          {/* ==================================================
              BOOKING ID
          ================================================== */}

          <div className="flex items-center justify-between mb-6 p-3 bg-primary-50 rounded-lg">

            <div>

              <p className="text-xs text-primary-600">
                Booking ID
              </p>

              <p className="text-lg font-bold text-primary-900">
                {bookingId}
              </p>

            </div>

            <Badge variant="success">
              Confirmed
            </Badge>

          </div>

          {/* ==================================================
              PASSENGER
          ================================================== */}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">

            <div className="flex items-center space-x-3 mb-3">

              <User className="w-5 h-5 text-gray-500" />

              <h3 className="font-semibold text-gray-900">
                Passenger Information
              </h3>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

              <div>

                <p className="text-gray-600">
                  Name
                </p>

                <p className="font-medium text-gray-900">
                  {passengerName}
                </p>

              </div>

              <div>

                <p className="text-gray-600">
                  Email
                </p>

                <p className="font-medium text-gray-900 break-all">
                  {passengerEmail}
                </p>

              </div>

              <div>

                <p className="text-gray-600">
                  Phone
                </p>

                <p className="font-medium text-gray-900">
                  {passengerPhone}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              BUS INFORMATION
          ================================================== */}

          <div className="mb-6 p-4 bg-primary-50 rounded-lg">

            <div className="flex items-center space-x-3 mb-3">

              <Bus className="w-5 h-5 text-primary-600" />

              <h3 className="font-semibold text-primary-900">
                Bus Information
              </h3>

            </div>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between gap-4">

                <span className="text-primary-700">
                  Operator
                </span>

                <span className="font-medium text-primary-900 text-right">
                  {busOperator}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-primary-700">
                  Bus Number
                </span>

                <span className="font-medium text-primary-900">
                  {busNumber}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-primary-700">
                  Bus Type
                </span>

                <span className="font-medium text-primary-900">
                  {busType}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              ROUTE
          ================================================== */}

          <div className="mb-6">

            <div className="flex items-center justify-between">

              {/* FROM */}

              <div className="text-center flex-1">

                <div className="flex items-center justify-center space-x-2 mb-1">

                  <MapPin className="w-4 h-4 text-green-600" />

                  <p className="text-xs text-gray-600">
                    From
                  </p>

                </div>

                <p className="text-xl font-bold text-gray-900">
                  {from}
                </p>

              </div>

              {/* ROUTE LINE */}

              <div className="flex-1 flex flex-col items-center px-2">

                <div className="w-full h-px bg-gray-300 relative">

                  <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-600 bg-white" />

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {duration}
                </p>

              </div>

              {/* TO */}

              <div className="text-center flex-1">

                <div className="flex items-center justify-center space-x-2 mb-1">

                  <MapPin className="w-4 h-4 text-red-600" />

                  <p className="text-xs text-gray-600">
                    To
                  </p>

                </div>

                <p className="text-xl font-bold text-gray-900">
                  {to}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              SCHEDULE
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">

              <div className="flex items-center space-x-2 mb-1">

                <Calendar className="w-4 h-4 text-green-600" />

                <p className="text-xs text-green-700">
                  Departure
                </p>

              </div>

              <p className="font-semibold text-green-900">
                {departure.date}
              </p>

              <p className="text-sm text-green-800">
                {departure.time}
              </p>

            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">

              <div className="flex items-center space-x-2 mb-1">

                <Calendar className="w-4 h-4 text-blue-600" />

                <p className="text-xs text-blue-700">
                  Arrival
                </p>

              </div>

              <p className="font-semibold text-blue-900">
                {arrival.date}
              </p>

              <p className="text-sm text-blue-800">
                {arrival.time}
              </p>

            </div>

          </div>

          {/* ==================================================
              SEAT + BOARDING
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-200">

              <div className="flex items-center space-x-2 mb-1">

                <Armchair className="w-4 h-4 text-secondary-600" />

                <p className="text-xs text-secondary-700">
                  Seat
                </p>

              </div>

              <p className="text-2xl font-bold text-secondary-900">
                {seatNumber}
              </p>

              <p className="text-xs text-secondary-600">
                {seatType}
              </p>

            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Boarding & Dropping
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">BOARDING POINT</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {boardingPoint} {boardingTime ? <span className="text-xs font-mono font-semibold text-cyan-700">({boardingTime})</span> : ''}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">DROPPING POINT</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {droppingPoint} {droppingTime ? <span className="text-xs font-mono font-semibold text-teal-700">({droppingTime})</span> : ''}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ==================================================
              SMARTSEAT STATUS
          ================================================== */}

          <div className="mb-6 p-3 bg-primary-50 rounded-lg border border-primary-200">

            <div className="flex items-center justify-between">

              <div className="flex items-center space-x-2">

                <Shield className="w-4 h-4 text-primary-600" />

                <span className="text-sm text-primary-700">
                  SmartSeat Monitoring
                </span>

              </div>

              <Badge
                variant={
                  smartSeatMonitoring
                    ? 'success'
                    : 'default'
                }
              >
                {smartSeatMonitoring
                  ? 'Enabled'
                  : 'Disabled'}
              </Badge>

            </div>

          </div>

          {/* ==================================================
              QR CODE
          ================================================== */}

          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 text-center">

            <div className="flex items-center justify-center space-x-2 mb-2">

              <QrCode className="w-6 h-6 text-gray-400" />

              <p className="text-sm text-gray-600">
                Scan for boarding
              </p>

            </div>

            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">

              <QrCode className="w-24 h-24 text-gray-400" />

            </div>

            <p className="text-xs text-gray-500 mt-2">
              Show this QR code at boarding
            </p>

          </div>

          {/* ==================================================
              FARE BREAKDOWN
          ================================================== */}

          <div className="mb-6 rounded-lg border border-gray-200 overflow-hidden">

            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">
                  Fare Details
                </p>
              </div>
            </div>

            {/* Always show GST breakdown — new bookings use stored values,
                 legacy bookings use back-computed display values */}
            <div className="px-4 py-3 space-y-2 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium text-gray-900">
                    ₹{baseFare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({gstRate}%)</span>
                  <span className="font-medium text-gray-900">
                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

              </div>

            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5" />
                <span className="font-semibold">Total Fare</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ₹{totalFare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-primary-200">
                  {paymentStatus}
                </p>
              </div>
            </div>

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

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

          {/* ==================================================
              FOOTER
          ================================================== */}

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

