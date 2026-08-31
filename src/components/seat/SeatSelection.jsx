// SeatSelection.jsx — SmartSeat 3D seat selection component
// Supports Seater / Semi-Sleeper / Sleeper bus layouts

import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge } from '../common';
import {
  User,
  AlertCircle,
  CheckCircle2,
  Compass,
  X,
  ShieldAlert,
  Info
} from 'lucide-react';
import './Seat3D.css';

// ─────────────────────────────────────────────────────────────
// BUS TYPE HELPERS
// ─────────────────────────────────────────────────────────────

const isSleeper = (bt = '') => /sleeper/i.test(bt) && !/semi[\s-]?sleeper/i.test(bt);
const isSemiSleeper = (bt = '') => /semi[\s-]?sleeper/i.test(bt);

const SeatSelection = ({
  busId,
  seatLayout = [],
  selectedSeat,
  onSeatSelect,
  onSeatDeselect,
  monitoredSeat = null,
  recommendedSeats = [],
  aisleAfter = 2,
  busType = '',
  errorMessage = ''
}) => {
  const [activePopoverSeat, setActivePopoverSeat] = useState(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // ──────────────────────────────────────────────
  // Status resolution
  // ──────────────────────────────────────────────

  const normalizeStatus = (seat) => {
    const s = String(seat?.type || seat?.status || 'available').toLowerCase();
    if (s === 'booked') return 'booked';
    if (s === 'reserved' || s === 'held' || s === 'temporarily_reserved') return 'reserved';
    if (s === 'blocked' || s === 'unavailable') return 'unavailable';
    return 'available';
  };

  const getSeatStatus = (seat) => {
    if (!seat) return 'unavailable';
    const backend = normalizeStatus(seat);
    if (backend === 'booked') return 'booked';
    if (backend === 'reserved') return 'reserved';
    if (backend === 'unavailable') return 'unavailable';
    if (selectedSeat === seat.seatNumber) return 'selected';
    if (monitoredSeat === seat.seatNumber) return 'monitored';
    if (recommendedSeats.includes(seat.seatNumber)) return 'recommended';
    return 'available';
  };

  // ──────────────────────────────────────────────
  // Click handler
  // ──────────────────────────────────────────────

  const handleSeatClick = (seat, e) => {
    e?.stopPropagation();
    const status = getSeatStatus(seat);

    if (status === 'booked' || status === 'reserved') {
      setActivePopoverSeat(activePopoverSeat?.seatNumber === seat.seatNumber ? null : seat);
      return;
    }

    if (!['available', 'recommended', 'monitored'].includes(status)) return;

    setActivePopoverSeat(seat);
    if (selectedSeat === seat.seatNumber) {
      onSeatDeselect?.();
      return;
    }
    onSeatSelect?.(seat);
  };

  // ──────────────────────────────────────────────
  // Popover
  // ──────────────────────────────────────────────

  const renderPassengerPopover = (seat) => {
    if (!seat) return null;
    const status = getSeatStatus(seat);
    const isBooked = status === 'booked' || status === 'reserved';
    const gender = seat.passengerGender || seat.passengerDetails?.gender || null;
    const seatPosition = seat.windowSide ? 'Window Side' : seat.isAisle ? 'Aisle Side' : 'Standard Seat';

    return (
      <div
        className="passenger-popover-card left-1/2 -translate-x-1/2 bottom-full mb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h5 className="font-bold text-xs tracking-wider text-cyan-400 uppercase">
              SEAT {seat.seatNumber}
            </h5>
          </div>
          <button type="button" onClick={() => setActivePopoverSeat(null)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Position:</span>
            <span className="font-medium text-slate-200">{seatPosition} (Row {seat.row})</span>
          </div>
          {seat.berth && (
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Berth:</span>
              <span className={`font-bold uppercase ${seat.berth === 'upper' ? 'text-violet-300' : 'text-teal-300'}`}>
                {seat.berth} berth
              </span>
            </div>
          )}
          {seat.price !== undefined && seat.price !== null && (
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Fare:</span>
              <span className="font-bold text-emerald-400">₹{seat.price}</span>
            </div>
          )}

          {isBooked ? (
            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">{status}</span>
              </div>
              {gender ? (
                <div className="mt-1 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium capitalize">
                    <User className="w-3.5 h-3.5 text-rose-400" />
                    <span>Gender: {gender}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 bg-slate-900/90 p-1.5 rounded border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Passenger details unavailable</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">{status}</span>
              </div>
              <p className="text-[10px] text-cyan-300 mt-1">
                {selectedSeat === seat.seatNumber ? 'Currently selected' : 'Click to select this seat'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // ─── SEATER: standard 3D upright chair ───────
  // ──────────────────────────────────────────────

  const render3DSeat = (seat) => {
    const status = getSeatStatus(seat);
    const isPopoverOpen = activePopoverSeat?.seatNumber === seat.seatNumber;
    const gender = seat.passengerGender || seat.passengerDetails?.gender || null;

    const variantClasses = {
      available: 'seat-3d-available',
      selected: 'seat-3d-selected',
      booked: 'seat-3d-booked',
      reserved: 'seat-3d-reserved',
      unavailable: 'seat-3d-unavailable',
      monitored: 'seat-3d-monitored',
      recommended: 'seat-3d-recommended'
    };

    return (
      <div key={seat.id || seat._id || seat.seatNumber} className="relative flex justify-center items-center py-1.5 px-1 perspective-seat-container">
        <button
          type="button"
          onClick={(e) => handleSeatClick(seat, e)}
          onMouseEnter={() => setHoveredSeat(seat)}
          onMouseLeave={() => setHoveredSeat(null)}
          className={`seat-3d-wrapper ${variantClasses[status] || 'seat-3d-available'}`}
          aria-label={`Seat ${seat.seatNumber} — ${status}`}
          title={`Seat ${seat.seatNumber} — ${status.toUpperCase()}`}
        >
          <div className="seat-3d-body">
            <div className="seat-3d-headrest" />
            <div className="seat-3d-armrest-left" />
            <div className="seat-3d-armrest-right" />
            <div className="seat-3d-cushion">
              {status === 'selected' ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white mb-0.5" />
                  <span className="text-[10px] font-black">{seat.seatNumber}</span>
                </div>
              ) : status === 'booked' ? (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-300">{seat.seatNumber}</span>
                  {gender && (
                    <span className={`text-[8px] font-black uppercase px-0.5 rounded ${
                      gender === 'female' ? 'bg-pink-500/80 text-white' : 'bg-blue-500/80 text-white'
                    }`}>
                      {gender[0]}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[11px] font-extrabold">{seat.seatNumber}</span>
              )}
            </div>
          </div>
        </button>
        {isPopoverOpen && renderPassengerPopover(seat)}
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // ─── SLEEPER BERTH UNIT ────────────────────────
  // ──────────────────────────────────────────────

  const renderSleeperBerth = (seat) => {
    if (!seat) return null;
    const status = getSeatStatus(seat);
    const isPopoverOpen = activePopoverSeat?.seatNumber === seat.seatNumber;
    const isUpper = seat.berth === 'upper';
    const gender = seat.passengerGender || null;

    const stateClass = {
      available: 'berth-available',
      selected: 'berth-selected',
      booked: 'berth-booked',
      reserved: 'berth-reserved',
      unavailable: 'berth-unavailable',
      monitored: 'berth-monitored',
      recommended: 'berth-recommended'
    }[status] || 'berth-available';

    return (
      <div key={seat.id || seat._id || seat.seatNumber} className="relative">
        <button
          type="button"
          onClick={(e) => handleSeatClick(seat, e)}
          onMouseEnter={() => setHoveredSeat(seat)}
          onMouseLeave={() => setHoveredSeat(null)}
          className={`berth-unit ${stateClass}`}
          aria-label={`Seat ${seat.seatNumber} — ${isUpper ? 'Upper' : 'Lower'} Berth — ${status}`}
          title={`${seat.seatNumber} (${isUpper ? 'Upper' : 'Lower'}) — ${status.toUpperCase()}`}
        >
          {/* Berth layer indicator */}
          <div className="berth-layer-tag">{isUpper ? '▲ UPPER' : '▼ LOWER'}</div>

          {/* Pillow */}
          <div className="berth-pillow" />

          {/* Mattress surface */}
          <div className="berth-mattress">
            {status === 'selected' ? (
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black">{seat.seatNumber}</span>
              </div>
            ) : status === 'booked' ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-bold">{seat.seatNumber}</span>
                {gender && (
                  <span className={`text-[8px] font-black uppercase px-0.5 rounded ${
                    gender === 'female' ? 'bg-pink-500/80 text-white' : 'bg-blue-600/80 text-white'
                  }`}>{gender[0]}</span>
                )}
              </div>
            ) : (
              <span className="text-[11px] font-extrabold">{seat.seatNumber}</span>
            )}
          </div>

          {/* Side rail */}
          <div className="berth-rail" />
        </button>
        {isPopoverOpen && renderPassengerPopover(seat)}
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // ─── SEMI-SLEEPER RECLINER ─────────────────────
  // ──────────────────────────────────────────────

  const renderRecliner = (seat) => {
    if (!seat) return null;
    const status = getSeatStatus(seat);
    const isPopoverOpen = activePopoverSeat?.seatNumber === seat.seatNumber;
    const gender = seat.passengerGender || null;

    const stateClass = {
      available: 'recliner-available',
      selected: 'recliner-selected',
      booked: 'recliner-booked',
      reserved: 'recliner-reserved',
      unavailable: 'recliner-unavailable',
      monitored: 'recliner-monitored',
      recommended: 'recliner-recommended'
    }[status] || 'recliner-available';

    return (
      <div key={seat.id || seat._id || seat.seatNumber} className="relative flex justify-center items-center py-2 px-1">
        <button
          type="button"
          onClick={(e) => handleSeatClick(seat, e)}
          onMouseEnter={() => setHoveredSeat(seat)}
          onMouseLeave={() => setHoveredSeat(null)}
          className={`recliner-unit ${stateClass}`}
          aria-label={`Seat ${seat.seatNumber} — Semi-Sleeper Recliner — ${status}`}
          title={`${seat.seatNumber} — ${status.toUpperCase()}`}
        >
          {/* Reclined backrest */}
          <div className="recliner-back" />

          {/* Armrests */}
          <div className="recliner-arm-left" />
          <div className="recliner-arm-right" />

          {/* Seat cushion */}
          <div className="recliner-cushion">
            {status === 'selected' ? (
              <div className="flex flex-col items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-black">{seat.seatNumber}</span>
              </div>
            ) : status === 'booked' ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-bold">{seat.seatNumber}</span>
                {gender && (
                  <span className={`text-[8px] font-black uppercase px-0.5 rounded ${
                    gender === 'female' ? 'bg-pink-500/80 text-white' : 'bg-blue-600/80 text-white'
                  }`}>{gender[0]}</span>
                )}
              </div>
            ) : (
              <span className="text-[11px] font-extrabold">{seat.seatNumber}</span>
            )}
          </div>

          {/* Footrest indicator */}
          <div className="recliner-foot" />
        </button>
        {isPopoverOpen && renderPassengerPopover(seat)}
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // ─── ROW RENDERERS ────────────────────────────
  // ──────────────────────────────────────────────

  const renderSeaterRow = (rowNumber) => {
    const rowSeats = seatLayout
      .filter((s) => Number(s.row) === Number(rowNumber))
      .sort((a, b) => Number(a.column) - Number(b.column));

    return (
      <div key={rowNumber} className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
        <div className="w-5 sm:w-7 text-[10px] sm:text-xs font-mono font-bold text-slate-500 text-right flex-shrink-0">
          R{String(rowNumber).padStart(2, '0')}
        </div>
        <div className="w-1.5 h-10 bg-slate-700/60 rounded-full border-r border-cyan-500/30 flex-shrink-0" title="Window" />
        <div className="flex items-center gap-1 sm:gap-2">
          {rowSeats.map((seat) => {
            const col = Number(seat.column);
            const showAisle = col === Number(aisleAfter) + 1;
            return (
              <div key={seat.id || seat._id || seat.seatNumber} className="flex items-center">
                {showAisle && (
                  <div className="w-6 sm:w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
                    <div className="w-px h-full bg-cyan-500/20 aisle-line" />
                    <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest rotate-90 opacity-60">AISLE</span>
                  </div>
                )}
                {render3DSeat(seat)}
              </div>
            );
          })}
        </div>
        <div className="w-1.5 h-10 bg-slate-700/60 rounded-full border-l border-cyan-500/30 flex-shrink-0" title="Window" />
        <div className="w-5 sm:w-7 text-[10px] sm:text-xs font-mono font-bold text-slate-500 flex-shrink-0">
          R{String(rowNumber).padStart(2, '0')}
        </div>
      </div>
    );
  };

  const renderSleeperRow = (rowNumber) => {
    const rowSeats = seatLayout
      .filter((s) => Number(s.row) === Number(rowNumber))
      .sort((a, b) => Number(a.column) - Number(b.column));

    // Group: left side (col 1,2) = lower,upper | right side (col 3,4) = lower,upper
    const leftLower = rowSeats.find((s) => s.position === 'left' && s.berth === 'lower');
    const leftUpper = rowSeats.find((s) => s.position === 'left' && s.berth === 'upper');
    const rightLower = rowSeats.find((s) => s.position === 'right' && s.berth === 'lower');
    const rightUpper = rowSeats.find((s) => s.position === 'right' && s.berth === 'upper');

    return (
      <div key={rowNumber} className="flex items-center justify-center gap-2 mb-3">
        {/* Row label */}
        <div className="w-7 text-[10px] font-mono font-bold text-slate-500 text-right flex-shrink-0">
          R{String(rowNumber).padStart(2, '0')}
        </div>

        {/* Left berth stack */}
        <div className="flex flex-col gap-1">
          {leftLower && renderSleeperBerth(leftLower)}
          {leftUpper && renderSleeperBerth(leftUpper)}
        </div>

        {/* Aisle */}
        <div className="w-8 sm:w-12 h-full flex items-center justify-center flex-shrink-0">
          <div className="w-px h-16 bg-cyan-500/20" />
          <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest rotate-90 opacity-60 absolute">AISLE</span>
        </div>

        {/* Right berth stack */}
        <div className="flex flex-col gap-1">
          {rightLower && renderSleeperBerth(rightLower)}
          {rightUpper && renderSleeperBerth(rightUpper)}
        </div>

        <div className="w-7 text-[10px] font-mono font-bold text-slate-500 flex-shrink-0">
          R{String(rowNumber).padStart(2, '0')}
        </div>
      </div>
    );
  };

  const renderSemiSleeperRow = (rowNumber) => {
    const rowSeats = seatLayout
      .filter((s) => Number(s.row) === Number(rowNumber))
      .sort((a, b) => Number(a.column) - Number(b.column));

    const leftSeats = rowSeats.filter((s) => s.position === 'left');
    const rightSeats = rowSeats.filter((s) => s.position === 'right');

    return (
      <div key={rowNumber} className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
        <div className="w-5 sm:w-7 text-[10px] sm:text-xs font-mono font-bold text-slate-500 text-right flex-shrink-0">
          R{String(rowNumber).padStart(2, '0')}
        </div>
        <div className="w-1.5 h-12 bg-slate-700/60 rounded-full border-r border-cyan-500/30 flex-shrink-0" />

        {/* Left recliners (2 seats) */}
        <div className="flex items-center gap-1">
          {leftSeats.map((seat) => renderRecliner(seat))}
        </div>

        {/* Aisle */}
        <div className="w-8 sm:w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
          <div className="w-px h-full bg-cyan-500/20" />
          <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest rotate-90 opacity-60 absolute">AISLE</span>
        </div>

        {/* Right recliners (1 seat) */}
        <div className="flex items-center gap-1">
          {rightSeats.map((seat) => renderRecliner(seat))}
        </div>

        <div className="w-1.5 h-12 bg-slate-700/60 rounded-full border-l border-cyan-500/30 flex-shrink-0" />
        <div className="w-5 sm:w-7 text-[10px] sm:text-xs font-mono font-bold text-slate-500 flex-shrink-0">
          R{String(rowNumber).padStart(2, '0')}
        </div>
      </div>
    );
  };

  // Route to correct row renderer
  const renderRow = (rowNumber) => {
    if (isSleeper(busType)) return renderSleeperRow(rowNumber);
    if (isSemiSleeper(busType)) return renderSemiSleeperRow(rowNumber);
    return renderSeaterRow(rowNumber);
  };

  // ──────────────────────────────────────────────
  // Legend
  // ──────────────────────────────────────────────

  const renderLegend = () => {
    const items = [
      { label: 'Available', cls: 'seat-3d-available', text: 'text-emerald-400' },
      { label: 'Selected', cls: 'seat-3d-selected', text: 'text-sky-400' },
      { label: 'Booked', cls: 'seat-3d-booked', text: 'text-rose-400' },
      { label: 'Reserved', cls: 'seat-3d-reserved', text: 'text-amber-400' },
      { label: 'Recommended', cls: 'seat-3d-recommended', text: 'text-teal-400' }
    ];
    return (
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-6 h-7 rounded-md ${item.cls} flex items-center justify-center text-[9px] font-bold`}>
              <div className="seat-3d-body !w-6 !h-7 !p-0.5">
                <div className="seat-3d-headrest !h-1" />
                <div className="seat-3d-cushion text-[8px]">◉</div>
              </div>
            </div>
            <span className={`text-xs font-medium ${item.text}`}>{item.label}</span>
          </div>
        ))}
        {isSleeper(busType) && (
          <div className="w-full text-center text-[10px] font-mono text-slate-500 mt-2">
            ▲ UPPER BERTH &nbsp;|&nbsp; ▼ LOWER BERTH
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // Empty state
  // ──────────────────────────────────────────────

  if (!Array.isArray(seatLayout) || seatLayout.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
        <CardBody>
          <div className="text-center py-12">
            <Compass className="w-14 h-14 mx-auto mb-4 text-cyan-500 animate-spin" style={{ animationDuration: '8s' }} />
            <h3 className="text-lg font-bold text-slate-100">Initializing SmartSeat Cabin Layout...</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              {errorMessage || 'Retrieving seat layout from server.'}
            </p>
            <p className="mt-3 text-xs font-mono text-cyan-400/80 bg-slate-800/80 inline-block px-3 py-1 rounded-full border border-slate-700">
              Bus ID: {busId || 'N/A'}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const rows = [...new Set(seatLayout.map((s) => Number(s.row)))].sort((a, b) => a - b);

  // Layout label for header
  const layoutLabel = isSleeper(busType)
    ? 'SLEEPER CABIN — UPPER & LOWER BERTHS'
    : isSemiSleeper(busType)
    ? 'SEMI-SLEEPER — RECLINING SEATS'
    : 'SEATER — STANDARD CABIN';

  return (
    <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
      <CardHeader className="bg-slate-900/90 border-b border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xl font-black text-white tracking-wide uppercase">SMARTSEAT CONTROL CENTER</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {layoutLabel} &nbsp;·&nbsp; {seatLayout.length} seats
            </p>
          </div>
          {selectedSeat && (
            <Badge variant="primary" className="bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
              Selected: #{selectedSeat}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="bus-cabin-container rounded-3xl p-4 sm:p-8 max-w-2xl mx-auto border border-slate-800 shadow-2xl relative">
          {/* Front of bus */}
          <div className="mb-8 p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="font-bold text-white uppercase text-[11px] tracking-wider block">DRIVER COCKPIT</span>
                <span className="text-[10px] text-slate-400">Front Windshield</span>
              </div>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-cyan-300 tracking-widest uppercase">
              FRONT OF BUS
            </div>
          </div>

          <div className="overflow-x-auto pb-4 pt-2">
            <div className="inline-block min-w-max w-full">
              {rows.map((row) => renderRow(row))}
            </div>
          </div>

          {/* Rear of bus */}
          <div className="mt-8 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-rose-400/90 font-medium">
              <Info className="w-3.5 h-3.5" />
              <span>EMERGENCY EXIT</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">REAR CABIN</span>
          </div>
        </div>

        {renderLegend()}

        {selectedSeat && (
          <div className="mt-6 p-4 bg-cyan-950/40 rounded-xl border border-cyan-500/40 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-cyan-300 text-sm">Seat #{selectedSeat} Reserved for Booking</h4>
              <p className="text-xs text-slate-300 mt-0.5">Click "Continue" to enter passenger details.</p>
            </div>
            <CheckCircle2 className="w-7 h-7 text-cyan-400 flex-shrink-0" />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SeatSelection;
