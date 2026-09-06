// BookingSummary.jsx - Smart Mobility Control Center Journey Panel

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
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

import { calculateGST } from '../../config/gst';

const BookingSummary = ({
  bus,
  selectedSeat,
  selectedSeats,
  passengerCount = 1,
  passengerDetails,
  multiPassengerDetails,
  smartSeatMonitoring,
}) => {

  // Derive the display seat(s) — multi takes precedence
  const isMulti = passengerCount > 1 && Array.isArray(selectedSeats) && selectedSeats.length > 0;
  const displaySeats = isMulti ? selectedSeats : (selectedSeat ? [selectedSeat] : []);

  // ==========================================================
  // SAFE OBJECTS
  // ==========================================================

  const schedule = bus?.schedule || {};
  const route = bus?.route || schedule?.routeId || {};

  // ==========================================================
  // SAFE DISPLAY VALUES
  // ==========================================================

  const operatorName = bus?.operatorName || bus?.operator || 'N/A';
  const busNumber = bus?.busNumber || 'N/A';
  const busType = bus?.busType || 'N/A';
  const from = route?.source || route?.from || 'N/A';
  const to = route?.destination || route?.to || 'N/A';
  const duration = schedule?.duration || schedule?.estimatedDuration || route?.estimatedDuration || 'N/A';

  const fare = Number(schedule?.fare ?? bus?.fare ?? 0);

  // For multi-passenger, multiply the per-seat fare by the number of selected seats
  const seatCount = isMulti ? displaySeats.length : 1;
  const totalFareBase = fare * (seatCount || 1);

  // GST breakdown (computed client-side for display; backend is the source of truth)
  const { gstRate, gstAmount, totalAmount } = calculateGST(totalFareBase);

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ==========================================================
  // TIME FORMATTER
  // ==========================================================

  const formatTime = (value) => {
    if (!value) return 'N/A';

    if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
      const [hoursString, minutesString] = value.split(':');
      const hours = Number(hoursString);
      const minutes = Number(minutesString);

      if (Number.isNaN(hours) || Number.isNaN(minutes)) return 'N/A';

      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;

      return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const travelDate = schedule?.travelDate || bus?.travelDate || null;

  return (
    <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
      {/* HEADER */}
      <CardHeader className="bg-slate-900/90 border-b border-slate-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              JOURNEY CONTROL PANEL
            </h3>
          </div>
          <Badge variant="primary" className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] uppercase font-mono">
            LIVE TELEMETRY
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="p-5 space-y-5 bg-gradient-to-b from-slate-950 to-slate-900">
        {/* BUS OPERATOR INFO */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
            <Bus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base">{operatorName}</h4>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                {busNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{busType}</p>
          </div>
        </div>

        {/* ROUTE DISPLAY */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Origin</p>
                <p className="font-bold text-white text-sm">{from}</p>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />

            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Destination</p>
                <p className="font-bold text-white text-sm">{to}</p>
              </div>
              <MapPin className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>

        {/* DATE & DURATION */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Travel Date</span>
            </div>
            <p className="font-bold text-white text-xs">{formatDate(travelDate)}</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Est. Duration</span>
            </div>
            <p className="font-bold text-white text-xs">{duration}</p>
          </div>
        </div>

        {/* DEPARTURE & ARRIVAL */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30">
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-1">Departure</p>
            <p className="font-extrabold text-white text-sm">{formatTime(schedule?.departureTime)}</p>
          </div>

          <div className="p-3 bg-cyan-950/20 rounded-xl border border-cyan-500/30">
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold mb-1">Arrival</p>
            <p className="font-extrabold text-white text-sm">{formatTime(schedule?.arrivalTime)}</p>
          </div>
        </div>

        {/* SELECTED SEAT(S) BADGE */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex-shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {isMulti ? `Selected Seats (${displaySeats.length} / ${passengerCount})` : 'Selected Seat'}
              </p>
              {displaySeats.length === 0 ? (
                <p className="text-lg font-black text-slate-500">None Selected</p>
              ) : isMulti ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {displaySeats.map(s => (
                    <span key={s} className="text-xs font-black text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-black text-cyan-300">#{displaySeats[0]}</p>
              )}
            </div>
          </div>
          {isMulti && (
            <div className="mt-1">
              <Badge
                variant={displaySeats.length === passengerCount ? 'success' : 'default'}
                className={displaySeats.length === passengerCount
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}
              >
                {displaySeats.length === passengerCount ? 'ALL SELECTED' : 'INCOMPLETE'}
              </Badge>
            </div>
          )}
          {!isMulti && (
            <Badge
              variant={displaySeats.length > 0 ? 'success' : 'default'}
              className={displaySeats.length > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400'}
            >
              {displaySeats.length > 0 ? 'CONFIRMED' : 'PENDING'}
            </Badge>
          )}
        </div>

        {/* PASSENGER DETAILS */}
        {isMulti && Array.isArray(multiPassengerDetails) && multiPassengerDetails.length > 0 ? (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Passengers</h4>
            </div>
            {multiPassengerDetails.map((pax, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">{idx + 1}</span>
                  <span className="font-semibold text-white">{pax.fullName || pax.name || 'N/A'}</span>
                  {selectedSeats[idx] && (
                    <span className="ml-auto text-[10px] font-mono text-cyan-400">Seat {selectedSeats[idx]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !isMulti && passengerDetails ? (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Passenger Information</h4>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-semibold text-white">{passengerDetails?.name || passengerDetails?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-white">{passengerDetails?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-white">{passengerDetails?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* SMARTSEAT MONITORING INDICATOR */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="font-semibold text-slate-200 block">SmartSeat AI Monitoring</span>
              <span className="text-[10px] text-slate-400">Real-time adjacent seat notifications</span>
            </div>
          </div>
          <Badge variant={smartSeatMonitoring ? 'success' : 'default'} className={smartSeatMonitoring ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}>
            {smartSeatMonitoring ? 'ACTIVE' : 'OFF'}
          </Badge>
        </div>

        {/* FARE BREAKDOWN */}
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/90">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              FARE BREAKDOWN
            </p>
          </div>

          <div className="p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{isMulti && seatCount > 1 ? `Base Fare (${seatCount} × ₹${fare.toLocaleString('en-IN')})` : 'Base Seat Fare'}</span>
              <span className="font-mono font-semibold">₹{totalFareBase.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GST ({gstRate}%)</span>
              <span className="font-mono font-semibold">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-t border-cyan-500/30 text-white">
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Payable</span>
            </div>
            <span className="text-xl font-black text-cyan-300 font-mono">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </CardBody>
    </Card>
  );
};

export default BookingSummary;
