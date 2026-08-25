// Interactive real-time seat selection component

import { useState } from 'react';

import {
  Card,
  CardHeader,
  CardBody,
  Badge
} from '../common';

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
  seatLayout = [],
  selectedSeat,
  onSeatSelect,
  onSeatDeselect,
  monitoredSeat = null,
  recommendedSeats = [],
  aisleAfter = 2,
  errorMessage = ''
}) => {
  const [hoveredSeat, setHoveredSeat] =
    useState(null);

  // ==========================================================
  // NORMALIZE BACKEND STATUS
  // Backend:
  // available
  // booked
  // reserved
  // blocked
  // ==========================================================

  const normalizeStatus = (seat) => {
    const status =
      String(
        seat?.type || 'available'
      ).toLowerCase();

    if (status === 'booked') {
      return 'booked';
    }

    if (
      status === 'reserved' ||
      status === 'temporarily_reserved'
    ) {
      return 'reserved';
    }

    if (
      status === 'blocked' ||
      status === 'unavailable'
    ) {
      return 'unavailable';
    }

    return 'available';
  };

  // ==========================================================
  // DISPLAY STATUS
  // ==========================================================

  const getSeatStatus = (seat) => {
    if (!seat) {
      return 'unavailable';
    }

    const backendStatus =
      normalizeStatus(seat);

    if (
      backendStatus === 'booked'
    ) {
      return 'booked';
    }

    if (
      backendStatus === 'reserved'
    ) {
      return 'reserved';
    }

    if (
      backendStatus === 'unavailable'
    ) {
      return 'unavailable';
    }

    if (
      selectedSeat ===
      seat.seatNumber
    ) {
      return 'selected';
    }

    if (
      monitoredSeat ===
      seat.seatNumber
    ) {
      return 'monitored';
    }

    if (
      recommendedSeats.includes(
        seat.seatNumber
      )
    ) {
      return 'recommended';
    }

    return 'available';
  };

  // ==========================================================
  // STYLES
  // ==========================================================

  const getSeatStyles = (seat) => {
    const status = getSeatStatus(seat);

    const base =
      'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-all duration-200 select-none';

    const styles = {
      available:
        'bg-white border-2 border-gray-300 text-gray-700 cursor-pointer hover:border-primary-500 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-md',

      selected:
        'bg-primary-600 border-2 border-primary-600 text-white cursor-pointer shadow-lg scale-105',

      booked:
        'bg-red-500 border-2 border-red-600 text-white cursor-not-allowed opacity-90',

      reserved:
        'bg-yellow-100 border-2 border-yellow-400 text-yellow-700 cursor-not-allowed',

      unavailable:
        'bg-red-100 border-2 border-red-300 text-red-400 cursor-not-allowed',

      monitored:
        'bg-secondary-100 border-2 border-secondary-400 text-secondary-700 cursor-pointer',

      recommended:
        'bg-green-100 border-2 border-green-400 text-green-700 cursor-pointer hover:bg-green-50 hover:shadow-md'
    };

    return `${base} ${styles[status] || styles.available}`;
  };

  // ==========================================================
  // ICON
  // ==========================================================

  const getSeatIcon = (seat) => {
    const status =
      getSeatStatus(seat);

    if (status === 'booked') {
      return (
        <User className="w-4 h-4" />
      );
    }

    if (status === 'reserved') {
      return (
        <AlertCircle className="w-4 h-4" />
      );
    }

    if (
      status === 'unavailable'
    ) {
      return (
        <Lock className="w-4 h-4" />
      );
    }

    if (
      status === 'monitored'
    ) {
      return (
        <Star className="w-4 h-4" />
      );
    }

    if (
      status === 'recommended'
    ) {
      return (
        <Star className="w-4 h-4" />
      );
    }

    return null;
  };

  // ==========================================================
  // CLICK
  // ==========================================================

  const handleSeatClick = (
    seat
  ) => {
    const status =
      getSeatStatus(seat);

    const selectable = [
      'available',
      'recommended',
      'monitored'
    ];

    if (
      !selectable.includes(
        status
      )
    ) {
      return;
    }

    if (
      selectedSeat ===
      seat.seatNumber
    ) {
      onSeatDeselect?.();
      return;
    }

    onSeatSelect?.(seat);
  };

  // ==========================================================
  // ROW
  // ==========================================================

  const renderSeatRow = (
    rowNumber
  ) => {
    const rowSeats =
      seatLayout
        .filter(
          (seat) =>
            Number(seat.row) ===
            Number(rowNumber)
        )
        .sort(
          (a, b) =>
            Number(a.column) -
            Number(b.column)
        );

    return (
      <div
        key={rowNumber}
        className="flex items-center gap-2 sm:gap-3 mb-3"
      >
        {/* Left row number */}

        <div className="w-6 sm:w-8 text-xs text-gray-400 text-right flex-shrink-0">
          {String(rowNumber).padStart(
            2,
            '0'
          )}
        </div>

        {rowSeats.map((seat) => {
          const column =
            Number(seat.column);

          const showAisle =
            column ===
            Number(aisleAfter) + 1;

          const status =
            getSeatStatus(seat);

          return (
            <div
              key={
                seat.id ||
                seat._id ||
                seat.seatNumber
              }
              className="flex items-center"
            >
              {showAisle && (
                <div className="w-5 sm:w-8 flex-shrink-0" />
              )}

              <button
                type="button"
                onClick={() =>
                  handleSeatClick(
                    seat
                  )
                }
                onMouseEnter={() =>
                  setHoveredSeat(
                    seat
                  )
                }
                onMouseLeave={() =>
                  setHoveredSeat(
                    null
                  )
                }
                className={getSeatStyles(
                  seat
                )}
                disabled={
                  ![
                    'available',
                    'recommended',
                    'monitored'
                  ].includes(status)
                }
                aria-label={`Seat ${seat.seatNumber}`}
                title={`${seat.seatNumber} - ${status === 'booked' ? 'Booked (unavailable)' : status}`}
              >
                {getSeatIcon(
                  seat
                ) ||
                  seat.seatNumber}
              </button>
            </div>
          );
        })}

        {/* Right row number */}

        <div className="w-6 sm:w-8 text-xs text-gray-400 flex-shrink-0">
          {String(rowNumber).padStart(
            2,
            '0'
          )}
        </div>
      </div>
    );
  };

  // ==========================================================
  // LEGEND
  // ==========================================================

  const renderLegend = () => {
    const legend = [
      {
        label: 'Available',
        className: 'bg-white border-gray-300'
      },
      {
        label: 'Selected',
        className: 'bg-primary-600 border-primary-600'
      },
      {
        label: 'Booked',
        className: 'bg-red-500 border-red-600'
      },
      {
        label: 'Reserved',
        className: 'bg-yellow-100 border-yellow-400'
      },
      {
        label: 'Blocked',
        className: 'bg-red-100 border-red-300'
      },
      {
        label: 'Monitored',
        className: 'bg-secondary-100 border-secondary-400'
      },
      {
        label: 'Recommended',
        className: 'bg-green-100 border-green-400'
      }
    ];

    return (
      <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
        {legend.map(
          (item) => (
            <div
              key={item.label}
              className="flex items-center gap-2"
            >
              <div
                className={`w-5 h-5 rounded-md border-2 ${item.className}`}
              />

              <span className="text-xs text-gray-600">
                {item.label}
              </span>
            </div>
          )
        )}
      </div>
    );
  };

  // ==========================================================
  // HOVER INFO
  // ==========================================================

  const renderSeatInfo = () => {
    if (!hoveredSeat) {
      return null;
    }

    const status =
      getSeatStatus(
        hoveredSeat
      );

    const seatPosition =
      hoveredSeat.windowSide
        ? 'Window'
        : hoveredSeat.isAisle
        ? 'Aisle'
        : 'Seat';

    return (
      <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">
              Seat{' '}
              {hoveredSeat.seatNumber}
            </h4>

            <p className="text-sm text-gray-600">
              {seatPosition} • Row{' '}
              {hoveredSeat.row}
            </p>
          </div>

          <Badge
            variant={
              status === 'available'
                ? 'success'
                : 'default'
            }
          >
            {status}
          </Badge>
        </div>

        {hoveredSeat.price !==
          undefined &&
          hoveredSeat.price !==
            null && (
            <p className="mt-2 text-sm font-semibold text-primary-600">
              ₹{hoveredSeat.price}
            </p>
          )}
      </div>
    );
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (
    !Array.isArray(
      seatLayout
    ) ||
    seatLayout.length === 0
  ) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-10">
            <Armchair className="w-12 h-12 mx-auto mb-3 text-gray-300" />

            <h3 className="font-semibold text-gray-700">
              No seat layout available
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {errorMessage ||
                'Seat information could not be loaded for this schedule.'}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Bus ID: {busId || 'N/A'}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // ==========================================================
  // ROWS
  // ==========================================================

  const rows = [
    ...new Set(
      seatLayout.map(
        (seat) =>
          Number(seat.row)
      )
    )
  ].sort(
    (a, b) => a - b
  );

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Select Your Seat
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {seatLayout.length} seats loaded from server
            </p>
          </div>

          {selectedSeat && (
            <Badge variant="primary">
              Selected:{' '}
              {selectedSeat}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody>

        {/* FRONT */}

        <div className="flex items-center justify-center mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Minimize2 className="w-4 h-4" />
            <span>
              FRONT / DRIVER
            </span>
            <Minimize2 className="w-4 h-4" />
          </div>
        </div>

        {/* BUS BODY */}

        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-max px-2">
            <div className="border-2 border-gray-200 rounded-3xl p-4 sm:p-6 bg-gray-50">
              {rows.map(
                (row) =>
                  renderSeatRow(row)
              )}
            </div>
          </div>
        </div>

        {/* HOVER */}

        {renderSeatInfo()}

        {/* LEGEND */}

        {renderLegend()}

        {/* SELECTED */}

        {selectedSeat && (
          <div className="mt-5 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-primary-900">
                  Selected Seat:{' '}
                  {selectedSeat}
                </h4>

                <p className="text-sm text-primary-700 mt-1">
                  This seat is ready for booking.
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