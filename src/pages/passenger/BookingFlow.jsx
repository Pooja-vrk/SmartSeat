// BookingFlow.jsx
// SmartSeat booking flow
// Seat Selection -> Passenger Details -> Payment -> Ticket

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Card,
  CardBody,
  Button,
  Loading,
} from '../../components/common';

import { useBooking } from '../../context/BookingContext';
import { useSmartSeat } from '../../context/SmartSeatContext';

import SeatSelection from '../../components/seat/SeatSelection';
import SmartSeatPanel from '../../components/seat/SmartSeatPanel';
import PassengerDetailsForm from '../../components/booking/PassengerDetailsForm';
import BookingSummary from '../../components/booking/BookingSummary';
import PaymentForm from '../../components/payment/PaymentForm';
import Ticket from '../../components/booking/Ticket';

import api from '../../services/api';
import { busService } from '../../services/busService';
import { bookingService } from '../../services/bookingService';
import { recommendationService } from '../../services/recommendationService';

const BookingFlow = () => {
  const { busId, busID, scheduleId, id } = useParams();
  const navigate = useNavigate();

  const {
    selectedBus,
    selectedSeat,
    selectSeat,
    selectBus,
    clearBooking,
  } = useBooking();

  const {
    isMonitoringEnabled,
    setSeatMonitoring,
  } = useSmartSeat();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [seatLayout, setSeatLayout] = useState([]);
  const [adjacentSeatInfo, setAdjacentSeatInfo] = useState(null);
  // busType from the seat meta — drives layout rendering in SeatSelection
  const [busType, setBusType] = useState('');

  const [passengerDetails, setPassengerDetails] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);   // backend-created booking awaiting mock payment

  const [recommendations, setRecommendations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // ==========================================================
  // ROUTE IDS
  // ==========================================================

  const routeBusId = busId || busID || null;

  const routeScheduleId = scheduleId || id || null;

  // ==========================================================
  // CONTEXT IDS
  // ==========================================================

  const contextScheduleId =
    selectedBus?.scheduleId ||
    selectedBus?.schedule?._id ||
    null;

  const contextBusId =
    selectedBus?.busId ||
    selectedBus?._id ||
    selectedBus?.id ||
    null;

  // ==========================================================
  // INITIAL IDs
  // ==========================================================

  const initialScheduleId =
    routeScheduleId || contextScheduleId;

  const initialBusId =
    routeBusId || contextBusId;

  // ==========================================================
  // LOAD BOOKING DATA
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadSchedule = async (scheduleIdToLoad) => {
      console.log(
        '[SmartSeat] Loading schedule:',
        scheduleIdToLoad
      );

      const response = await api.get(
        `/schedules/${scheduleIdToLoad}`
      );

      if (
        !response?.success ||
        !response?.data
      ) {
        const error = new Error(
          response?.message ||
            'Schedule information could not be loaded.'
        );

        error.response = {
          status: 404,
          data: response,
        };

        throw error;
      }

      return response.data;
    };

    const loadBookingData = async () => {
      if (!initialScheduleId) {
        if (!cancelled) {
          setLoading(false);
          setErrorMessage(
            'Schedule ID is missing. Please return to Search Buses and select a bus again.'
          );
        }

        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setErrorMessage('');
          setSeatLayout([]);
          setAdjacentSeatInfo(null);
          setRecommendations([]);

          // Clear old selected seat.
          selectSeat(null);
        }

        console.log('====================================');
        console.log('[SmartSeat] BOOKING FLOW');
        console.log('Route schedule ID:', routeScheduleId);
        console.log('Context schedule ID:', contextScheduleId);
        console.log('Initial schedule ID:', initialScheduleId);
        console.log('Route bus ID:', routeBusId);
        console.log('Context bus ID:', contextBusId);
        console.log('====================================');

        // ======================================================
        // 1. LOAD SCHEDULE
        // ======================================================

        let scheduleData = null;
        let resolvedScheduleId = initialScheduleId;

        try {
          scheduleData = await loadSchedule(
            initialScheduleId
          );
        } catch (firstError) {
          const status =
            firstError?.response?.status;

          console.warn(
            '[SmartSeat] First schedule request failed:',
            {
              scheduleId: initialScheduleId,
              status,
              message: firstError?.message,
            }
          );

          // ====================================================
          // IMPORTANT FALLBACK
          //
          // If URL contains an old/deleted schedule but
          // BookingContext contains the valid schedule,
          // automatically try the context schedule.
          // ====================================================

          if (
            status === 404 &&
            contextScheduleId &&
            contextScheduleId !== initialScheduleId
          ) {
            console.log(
              '[SmartSeat] URL schedule is stale.'
            );

            console.log(
              '[SmartSeat] Trying context schedule:',
              contextScheduleId
            );

            scheduleData = await loadSchedule(
              contextScheduleId
            );

            resolvedScheduleId =
              contextScheduleId;
          } else {
            throw firstError;
          }
        }

        if (cancelled) {
          return;
        }

        console.log(
          '[SmartSeat] Schedule loaded:',
          scheduleData
        );

        // ======================================================
        // 2. RESOLVE BUS FROM SCHEDULE
        // ======================================================

        const populatedBus =
          scheduleData?.busId &&
          typeof scheduleData.busId === 'object'
            ? scheduleData.busId
            : null;

        const scheduleBusId =
          populatedBus?._id ||
          (
            typeof scheduleData?.busId === 'string'
              ? scheduleData.busId
              : null
          ) ||
          routeBusId ||
          contextBusId ||
          null;

        console.log(
          '[SmartSeat] Resolved bus:',
          {
            scheduleBusId,
            populatedBus,
          }
        );

        if (!scheduleBusId) {
          throw new Error(
            'Bus information is missing from this schedule.'
          );
        }

        // ======================================================
        // 3. USE POPULATED BUS
        //
        // Do NOT call:
        // busService.getBus(scheduleBusId)
        //
        // Your schedule API already gives the full bus object.
        // ======================================================

        let busData = populatedBus;

        // Fallback to existing BookingContext bus.
        if (!busData && selectedBus) {
          busData = selectedBus;
        }

        if (!busData) {
          throw new Error(
            'Bus details are not available.'
          );
        }

        // ======================================================
        // 4. BUILD BOOKING BUS
        // ======================================================

        const bookingBus = {
          ...busData,

          _id:
            busData._id ||
            scheduleBusId,

          id:
            busData._id ||
            scheduleBusId,

          busId:
            busData._id ||
            scheduleBusId,

          scheduleId:
            resolvedScheduleId,

          schedule:
            scheduleData,

          route:
            scheduleData?.routeId || null,

          routeId:
            scheduleData?.routeId || null,

          travelDate:
            scheduleData?.travelDate || null,

          departureTime:
            scheduleData?.departureTime || null,

          arrivalTime:
            scheduleData?.arrivalTime || null,

          availableSeats:
            scheduleData?.availableSeats ?? 0,

          fare:
            scheduleData?.fare ??
            busData?.fare ??
            0,
        };

        console.log(
          '[SmartSeat] Booking bus:',
          bookingBus
        );

        if (!cancelled) {
          selectBus(bookingBus);
        }

        // ======================================================
        // 5. LOAD REAL SEATS
        // ======================================================

        console.log(
          '[SmartSeat] Loading seats:',
          {
            busId: scheduleBusId,
            scheduleId: resolvedScheduleId,
          }
        );

        const seatsResponse =
          await busService.getSeats(
            scheduleBusId,
            resolvedScheduleId
          );

        if (cancelled) {
          return;
        }

        console.log(
          '[SmartSeat] Real seat API response:',
          seatsResponse
        );

        if (
          !seatsResponse?.success
        ) {
          throw new Error(
            seatsResponse?.message ||
              'Seat layout could not be loaded.'
          );
        }

        // ======================================================
        // 6. NORMALIZE SEATS
        // ======================================================

        let seats = [];

        if (
          Array.isArray(
            seatsResponse?.data
          )
        ) {
          seats =
            seatsResponse.data;
        } else if (
          Array.isArray(
            seatsResponse?.data?.seats
          )
        ) {
          seats =
            seatsResponse.data.seats;
        }

        console.log(
          '[SmartSeat] REAL SEAT LAYOUT:',
          {
            scheduleId:
              resolvedScheduleId,

            busId:
              scheduleBusId,

            seatCount:
              seats.length,

            seats,
          }
        );

        if (seats.length === 0) {
          throw new Error(
            'No seats were found for this schedule.'
          );
        }

        if (!cancelled) {
          setSeatLayout(seats);
          // Capture busType from meta so SeatSelection can render the correct layout
          const resolvedBusType =
            seatsResponse?.meta?.busType ||
            bookingBus?.busType ||
            '';
          setBusType(resolvedBusType);
          setErrorMessage('');
        }

      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          '[SmartSeat] Booking flow loading error:',
          error
        );

        const status =
          error?.response?.status;

        const backendMessage =
          error?.response?.data?.message;

        let message =
          backendMessage ||
          error?.message ||
          'Unable to load booking information.';

        if (status === 404) {
          message =
            'This booking schedule is no longer available. Please return to Search Buses and select the bus again.';
        }

        setSeatLayout([]);
        setErrorMessage(message);

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookingData();

    return () => {
      cancelled = true;
    };
 }, [
  initialScheduleId,
  routeScheduleId,
  contextScheduleId,
  routeBusId,
  contextBusId,
]);

  // ==========================================================
  // SEAT SELECT
  // ==========================================================

  const handleSeatSelect = (seat) => {
    if (!seat) {
      return;
    }

    const seatNumber =
      seat?.seatNumber;

    if (!seatNumber) {
      return;
    }

    selectSeat(seatNumber);

    if (seat?.adjacentSeat) {
      const adjacentSeat =
        seatLayout.find(
          (item) =>
            item?.seatNumber ===
            seat.adjacentSeat
        );

      setAdjacentSeatInfo({
        adjacentSeatNumber:
          seat.adjacentSeat,

        adjacentSeatStatus:
          adjacentSeat?.type ||
          adjacentSeat?.status ||
          'unknown',
      });
    } else {
      setAdjacentSeatInfo(null);
    }

    console.log(
      '[SmartSeat] Selected seat:',
      seat
    );
  };

  // ==========================================================
  // DESELECT
  // ==========================================================

  const handleSeatDeselect = () => {
    selectSeat(null);
    setAdjacentSeatInfo(null);
  };

  // ==========================================================
  // STEP 1 -> STEP 2
  // ==========================================================

  const handleProceedToDetails = () => {
    if (!selectedSeat) {
      alert('Please select a seat first.');
      return;
    }

    setStep(2);
  };

  // ==========================================================
  // PASSENGER DETAILS → CREATE BOOKING → PAYMENT
  //
  // Booking is created HERE so the backend-authoritative fare
  // (baseFare, gstRate, gstAmount, booking.fare) is available
  // to PaymentForm before the user pays.
  //
  // The backend ignores any monetary values from req.body.
  // booking.fare comes from calculateGST(schedule.fare) on the
  // server — it is the sole source of truth.
  // ==========================================================

  const handlePassengerSubmit = async (details) => {
    if (!details) {
      alert('Please enter passenger details.');
      return;
    }

    if (!selectedSeat) {
      alert('Please select a seat first.');
      return;
    }

    setPassengerDetails(details);

    try {
      const bookingData = {
        scheduleId:
          selectedBus?.scheduleId ||
          initialScheduleId,

        seatNumber: selectedSeat,

        passengerDetails: {
          name:   details?.name || details?.fullName || '',
          age:    Number(details?.age),
          gender: details?.gender || '',
          phone:  details?.phone || '',
          email:  details?.email || '',
        },

        smartSeatMonitoring: isMonitoringEnabled(
          selectedBus?.scheduleId || initialScheduleId
        ),
      };

      console.log('[SmartSeat] Creating booking before payment:', bookingData);

      const response = await bookingService.createBooking(bookingData);

      console.log('[SmartSeat] Booking response:', response);

      if (response?.success) {
        // Store the backend-created booking.
        // PaymentForm will display response.data.fare — the backend-authoritative total.
        setPendingBooking(response.data);
        setStep(3);
      } else {
        alert(response?.message || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('[SmartSeat] Booking creation error:', error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          'Booking failed. Please try again.'
      );
    }
  };

  // ==========================================================
  // PAYMENT COMPLETE
  //
  // Booking was already created in handlePassengerSubmit.
  // Payment is mock (simulated). We simply record the payment
  // data and show the ticket using the already-created booking.
  // ==========================================================

  const handlePaymentComplete = (paymentData) => {
    if (!pendingBooking) {
      alert('Booking data is missing. Please start again.');
      return;
    }

    console.log('[SmartSeat] Mock payment completed:', paymentData);

    // Combine the backend booking with the mock payment receipt for the ticket.
    setBookingResult({
      ...pendingBooking,
      payment: paymentData,
    });

    setStep(4);
  };

  const handleDownloadTicket = () => {
    const b = bookingResult || pendingBooking;
    if (!b) return;

    const schedule =
      b.scheduleId && typeof b.scheduleId === 'object'
        ? b.scheduleId
        : b.schedule || {};

    const route =
      (b.routeId && typeof b.routeId === 'object' ? b.routeId : null) ||
      b.route ||
      (schedule?.routeId && typeof schedule.routeId === 'object' ? schedule.routeId : null) ||
      schedule?.route ||
      {};

    const bus = b.bus || schedule?.busId || {};
    const passenger = b.passengerDetails || {};

    const from  = route?.source || route?.from || 'N/A';
    const to    = route?.destination || route?.to || 'N/A';
    const busNo = bus?.busNumber || 'N/A';
    const operator = bus?.operatorName || 'N/A';

    const baseFare  = Number(b.baseFare  ?? 0);
    const gstRate   = Number(b.gstRate   ?? 0);
    const gstAmount = Number(b.gstAmount ?? 0);
    const totalFare = Number(b.fare      ?? 0);
    const hasGST    = baseFare > 0 && gstRate > 0;

    const fmt = (n) =>
      n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const fareLines = hasGST
      ? `Base Fare:    ₹${fmt(baseFare)}\nGST (${gstRate}%): ₹${fmt(gstAmount)}\n${'─'.repeat(28)}\nTOTAL:        ₹${fmt(totalFare)}`
      : `TOTAL:        ₹${fmt(totalFare)}`;

    const travelDate = schedule?.travelDate
      ? new Date(schedule.travelDate).toLocaleDateString('en-IN', {
          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
        })
      : 'N/A';

    const content = [
      '========================================',
      '        SmartSeat — Digital Ticket       ',
      '========================================',
      '',
      `Booking ID:    ${b.bookingId || b._id || 'N/A'}`,
      `Status:        ${b.bookingStatus || 'confirmed'}`,
      `Payment:       ${b.paymentStatus || 'completed'}`,
      '',
      '-- PASSENGER INFORMATION ---------------',
      `Name:          ${passenger.name || 'N/A'}`,
      `Phone:         ${passenger.phone || 'N/A'}`,
      '',
      '-- JOURNEY INFORMATION -----------------',
      `From:          ${from}`,
      `To:            ${to}`,
      `Date:          ${travelDate}`,
      `Departure:     ${schedule?.departureTime || 'N/A'}`,
      `Arrival:       ${schedule?.arrivalTime   || 'N/A'}`,
      '',
      '-- BUS INFORMATION ---------------------',
      `Operator:      ${operator}`,
      `Bus Number:    ${busNo}`,
      `Bus Type:      ${bus?.busType || 'N/A'}`,
      '',
      '-- SEAT INFORMATION --------------------',
      `Seat Number:   ${b.seatNumber || 'N/A'}`,
      '',
      '-- FARE DETAILS ------------------------',
      fareLines,
      '',
      '========================================',
      'Please carry a valid ID proof for boarding',
      'For support: +91 1800-123-4567',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SmartSeat-Ticket-${b.bookingId || b._id || 'ticket'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareTicket = async () => {
    const b = bookingResult || pendingBooking;
    if (!b) return;

    const schedule =
      b.scheduleId && typeof b.scheduleId === 'object'
        ? b.scheduleId
        : b.schedule || {};
    const route =
      (b.routeId && typeof b.routeId === 'object' ? b.routeId : null) ||
      b.route ||
      (schedule?.routeId && typeof schedule.routeId === 'object' ? schedule.routeId : null) ||
      schedule?.route ||
      {};
    const bus   = b.bus   || schedule?.busId   || {};

    const from  = route?.source || route?.from || 'N/A';
    const to    = route?.destination || route?.to || 'N/A';
    const date  = schedule?.travelDate
      ? new Date(schedule.travelDate).toLocaleDateString('en-IN')
      : 'N/A';
    const total = Number(b.fare ?? 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });

    const shareText =
      `SmartSeat Booking Ticket\n` +
      `Booking ID: ${b.bookingId || b._id || 'N/A'}\n` +
      `Route: ${from} → ${to}\n` +
      `Date: ${date}\n` +
      `Bus: ${bus?.busNumber || 'N/A'}\n` +
      `Seat: ${b.seatNumber || 'N/A'}\n` +
      `Total: ₹${total}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SmartSeat Ticket — ${b.bookingId || ''}`,
          text: shareText,
        });
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Booking details copied to clipboard!');
      } catch {
        const ta = document.createElement('textarea');
        ta.value = shareText;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Booking details copied to clipboard!');
      }
    }
  };

  // ==========================================================
  // ALTERNATIVE SEATS
  // ==========================================================

  const handleFindAlternative = async () => {
    const currentScheduleId =
      selectedBus?.scheduleId ||
      initialScheduleId;

    if (
      !currentScheduleId ||
      !selectedSeat
    ) {
      return;
    }

    try {
      const response =
        await recommendationService
          .getSeatRecommendations(
            currentScheduleId,
            selectedSeat
          );

      if (response?.success) {
        setRecommendations(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      }

    } catch (error) {
      console.error(
        '[SmartSeat] Recommendation error:',
        error
      );
    }
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = () => {
    window.location.reload();
  };

  // ==========================================================
  // COMPLETE
  // ==========================================================

  const handleComplete = () => {
    clearBooking();
    navigate('/my-bookings');
  };

  // ==========================================================
  // BACK TO SEARCH
  // ==========================================================

  const handleBackToSearch = () => {
    clearBooking();
    navigate('/search');
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading
          size="lg"
          text="Loading booking information..."
        />
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    errorMessage &&
    seatLayout.length === 0
  ) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-10">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">
                !
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Unable to load seat layout
              </h3>

              <p className="mt-3 text-sm text-gray-500 max-w-lg mx-auto">
                {errorMessage}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">

                <Button
                  variant="primary"
                  onClick={
                    handleBackToSearch
                  }
                >
                  Back to Search
                </Button>

                <Button
                  variant="secondary"
                  onClick={
                    handleRetry
                  }
                >
                  Try Again
                </Button>

              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================================
  // AISLE CONFIGURATION
  // ==========================================================

  const aisleAfter =
    selectedBus?.seatConfiguration
      ?.aisleAfter ??
    selectedBus?.schedule?.busId
      ?.seatConfiguration
      ?.aisleAfter ??
    2;

  // ==========================================================
  // CURRENT SCHEDULE ID
  // ==========================================================

  const currentScheduleId =
    selectedBus?.scheduleId ||
    initialScheduleId;

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <div className="mb-8">

        <div className="flex items-center justify-center overflow-x-auto">

          {[1, 2, 3, 4].map(
            (stepNumber) => (
              <div
                key={stepNumber}
                className="flex items-center flex-shrink-0"
              >

                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    w-10
                    h-10
                    rounded-full
                    font-semibold
                    ${
                      step >= stepNumber
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {stepNumber}
                </div>

                {stepNumber < 4 && (
                  <div
                    className={`
                      w-12
                      sm:w-24
                      h-1
                      mx-2
                      ${
                        step >
                        stepNumber
                          ? 'bg-primary-600'
                          : 'bg-gray-200'
                      }
                    `}
                  />
                )}

              </div>
            )
          )}

        </div>

        <div className="flex justify-center mt-2 text-xs sm:text-sm text-gray-600">

          <span className="w-20 sm:w-24 text-center">
            Select Seat
          </span>

          <span className="w-20 sm:w-24 text-center">
            Details
          </span>

          <span className="w-20 sm:w-24 text-center">
            Payment
          </span>

          <span className="w-20 sm:w-24 text-center">
            Ticket
          </span>

        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ====================================================
            MAIN
        ==================================================== */}

        <div className="lg:col-span-2">

          {/* STEP 1 */}

          {step === 1 && (
            <SeatSelection
              busId={
                selectedBus?.busId ||
                initialBusId
              }

              seatLayout={
                seatLayout
              }

              selectedSeat={
                selectedSeat
              }

              onSeatSelect={
                handleSeatSelect
              }

              onSeatDeselect={
                handleSeatDeselect
              }

              monitoredSeat={
                null
              }

              recommendedSeats={
                recommendations.map(
                  (item) =>
                    item?.seatNumber
                )
              }

              aisleAfter={
                aisleAfter
              }

              busType={busType}
            />
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <PassengerDetailsForm
              onSubmit={
                handlePassengerSubmit
              }

              onCancel={() =>
                setStep(1)
              }
            />
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <PaymentForm
              amount={
                // Backend-authoritative total: booking.fare = baseFare + gstAmount
                // calculated by bookingService.createBooking() from schedule.fare in DB.
                Number(pendingBooking?.fare ?? 0)
              }

              onPaymentComplete={
                handlePaymentComplete
              }

              onCancel={() => {
                // User backed out of payment.
                // Cancel the pending booking via the existing cancellation API so
                // the seat is released back to 'available' before returning to Step 2.
                // This prevents a stuck 'pending' booking from blocking the seat.
                if (pendingBooking?._id) {
                  bookingService
                    .cancelBooking(
                      pendingBooking._id,
                      'Payment cancelled by user'
                    )
                    .catch((err) =>
                      console.warn(
                        '[SmartSeat] Could not cancel pending booking on back:',
                        err
                      )
                    );
                }
                setPendingBooking(null);
                setStep(2);
              }}
            />
          )}

          {/* STEP 4 */}

          {step === 4 &&
            bookingResult && (
              <Ticket
                booking={
                  bookingResult
                }

                onDownload={handleDownloadTicket}

                onShare={handleShareTicket}
              />
            )}

        </div>

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <div className="space-y-6">

          {/* SMARTSEAT */}

          {step === 1 &&
            selectedSeat && (
              <>

                <SmartSeatPanel
                  currentSeat={
                    selectedSeat
                  }

                  adjacentSeatInfo={
                    adjacentSeatInfo
                  }

                  monitoringEnabled={
                    isMonitoringEnabled(
                      currentScheduleId
                    )
                  }

                  onToggleMonitoring={() =>
                    setSeatMonitoring(
                      currentScheduleId,
                      !isMonitoringEnabled(
                        currentScheduleId
                      )
                    )
                  }

                  showPreferences={
                    true
                  }

                  onViewPreferences={() =>
                    navigate(
                      '/preferences'
                    )
                  }
                />

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={
                    handleProceedToDetails
                  }
                >
                  Continue to Passenger Details
                </Button>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={
                    handleFindAlternative
                  }
                >
                  Find Alternative Seats
                </Button>

              </>
            )}

          {/* SUMMARY */}

          <BookingSummary
            bus={
              selectedBus
            }

            selectedSeat={
              selectedSeat
            }

            passengerDetails={
              passengerDetails
            }

            smartSeatMonitoring={
              isMonitoringEnabled(
                currentScheduleId
              )
            }
          />

          {/* COMPLETE */}

          {step === 4 && (
            <Button
              variant="primary"
              className="w-full"
              onClick={
                handleComplete
              }
            >
              Go to My Bookings
            </Button>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingFlow;

