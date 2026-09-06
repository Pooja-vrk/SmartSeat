// BookingFlow.jsx
// SmartSeat booking flow
// Seat Selection -> Passenger Details -> Payment -> Ticket

import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

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

// ─────────────────────────────────────────────────────────────
// MultiPassengerForm — collects details for N passengers,
// one form section per passenger, each tied to a seat number.
// Reuses the same field set as PassengerDetailsForm.
// ─────────────────────────────────────────────────────────────

const EMPTY_PAX = () => ({
  fullName: '', email: '', phone: '', age: '', gender: '', passengerCategory: 'general'
});

const MultiPassengerForm = ({ passengerCount, selectedSeats, initialData, submitting, onSubmit, onCancel }) => {
  const [passengers, setPassengers] = React.useState(() => {
    const base = Array.from({ length: passengerCount }, (_, i) => initialData?.[i] || EMPTY_PAX());
    return base;
  });
  const [errors, setErrors] = React.useState(() => Array.from({ length: passengerCount }, () => ({})));

  const updateField = (paxIdx, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === paxIdx ? { ...p, [field]: value } : p));
    setErrors(prev => prev.map((e, i) => i === paxIdx ? { ...e, [field]: '' } : e));
  };

  const validate = () => {
    let allValid = true;
    const newErrors = passengers.map(p => {
      const e = {};
      if (!p.fullName.trim())   { e.fullName = 'Name is required'; allValid = false; }
      if (!p.email.trim())      { e.email = 'Email is required'; allValid = false; }
      else if (!/\S+@\S+\.\S+/.test(p.email)) { e.email = 'Invalid email'; allValid = false; }
      if (!p.phone.trim())      { e.phone = 'Phone is required'; allValid = false; }
      if (!p.age)               { e.age = 'Age is required'; allValid = false; }
      else if (parseInt(p.age) < 1 || parseInt(p.age) > 120) { e.age = 'Invalid age'; allValid = false; }
      if (!p.gender)            { e.gender = 'Gender is required'; allValid = false; }
      return e;
    });
    setErrors(newErrors);
    return allValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(passengers);
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {passengers.map((pax, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* header */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <h3 className="text-sm font-bold text-slate-900">Passenger {idx + 1}</h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
              Seat {selectedSeats[idx] || '—'}
            </span>
          </div>

          {/* fields */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
              <input
                type="text" required
                value={pax.fullName}
                onChange={e => updateField(idx, 'fullName', e.target.value)}
                placeholder="Enter full name"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors[idx]?.fullName ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
              {errors[idx]?.fullName && <p className="text-xs text-red-600 mt-1">{errors[idx].fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
              <input
                type="email" required
                value={pax.email}
                onChange={e => updateField(idx, 'email', e.target.value)}
                placeholder="email@example.com"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors[idx]?.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
              {errors[idx]?.email && <p className="text-xs text-red-600 mt-1">{errors[idx].email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone *</label>
              <input
                type="tel" required
                value={pax.phone}
                onChange={e => updateField(idx, 'phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors[idx]?.phone ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
              {errors[idx]?.phone && <p className="text-xs text-red-600 mt-1">{errors[idx].phone}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Age *</label>
              <input
                type="number" required min={1} max={120}
                value={pax.age}
                onChange={e => updateField(idx, 'age', e.target.value)}
                placeholder="25"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors[idx]?.age ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
              {errors[idx]?.age && <p className="text-xs text-red-600 mt-1">{errors[idx].age}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
              <select
                required
                value={pax.gender}
                onChange={e => updateField(idx, 'gender', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors[idx]?.gender ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              >
                <option value="">Select gender</option>
                {genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors[idx]?.gender && <p className="text-xs text-red-600 mt-1">{errors[idx].gender}</p>}
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'Booking…' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
};

const BookingFlow = () => {
  const { busId, busID, scheduleId, id } = useParams();
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Number of passengers from the search URL (default 1)
  const passengerCount = Math.min(6, Math.max(1, Number(urlSearchParams.get('passengers') || 1)));

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

  // Multi-seat selection: array of seat numbers (used when passengerCount > 1)
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Multi-passenger details: array of passenger objects, one per seat
  // passengerCount === 1 → uses passengerDetails (single object, existing path)
  // passengerCount  > 1 → uses multiPassengerDetails (array)
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [multiPassengerDetails, setMultiPassengerDetails] = useState([]);

  const [bookingResult, setBookingResult] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [seatSelectionError, setSeatSelectionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        // 0. BOOKING-ID RESOLUTION
        //
        // Dashboard links to /booking/:bookingId (a Booking _id).
        // Try to resolve it as a booking first so we can extract
        // the real scheduleId before hitting the schedule API.
        // ======================================================

        let resolvedScheduleIdFromBooking = null;
        let resolvedBusIdFromBooking = null;

        try {
          const maybeBookingRes = await bookingService.getBooking(initialScheduleId);
          if (maybeBookingRes?.success && maybeBookingRes?.data) {
            const bk = maybeBookingRes.data;
            const sid = bk.scheduleId?._id || bk.scheduleId || null;
            const bid = bk.busId?._id || bk.busId || null;
            if (sid && String(sid) !== String(initialScheduleId)) {
              // initialScheduleId was a booking _id, not a schedule _id
              resolvedScheduleIdFromBooking = String(sid);
              resolvedBusIdFromBooking = bid ? String(bid) : null;
              console.log('[SmartSeat] Resolved booking ID to scheduleId:', resolvedScheduleIdFromBooking);
            }
          }
        } catch {
          // Not a booking ID — continue to schedule resolution below
        }

        // ======================================================
        // 1. LOAD SCHEDULE
        // ======================================================

        let scheduleData = null;
        // Use the booking-resolved scheduleId if available, else the URL param
        let resolvedScheduleId = resolvedScheduleIdFromBooking || initialScheduleId;

        try {
          scheduleData = await loadSchedule(
            resolvedScheduleId
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
  // SEAT SELECT  (supports single and multi-passenger)
  // ==========================================================

  const handleSeatSelect = (seat) => {
    if (!seat?.seatNumber) return;
    setSeatSelectionError('');

    if (passengerCount === 1) {
      // Single-passenger: existing behaviour — use BookingContext
      selectSeat(seat.seatNumber);
      if (seat?.adjacentSeat) {
        const adj = seatLayout.find(s => s?.seatNumber === seat.adjacentSeat);
        setAdjacentSeatInfo({
          adjacentSeatNumber: seat.adjacentSeat,
          adjacentSeatStatus: adj?.type || adj?.status || 'unknown',
        });
      } else {
        setAdjacentSeatInfo(null);
      }
    } else {
      // Multi-passenger: manage selectedSeats array
      setSelectedSeats(prev => {
        // Toggle off if already selected
        if (prev.includes(seat.seatNumber)) {
          return prev.filter(s => s !== seat.seatNumber);
        }
        // Reject if already at capacity
        if (prev.length >= passengerCount) {
          setSeatSelectionError(`You can only select ${passengerCount} seat${passengerCount > 1 ? 's' : ''} for ${passengerCount} passenger${passengerCount > 1 ? 's' : ''}.`);
          return prev;
        }
        return [...prev, seat.seatNumber];
      });
    }
  };

  // ==========================================================
  // DESELECT
  // Single mode: called with no args by SeatSelection onClick
  // Multi mode:  called with a seat number string
  // ==========================================================

  const handleSeatDeselect = (seatNumberOrUndefined) => {
    if (passengerCount === 1) {
      selectSeat(null);
      setAdjacentSeatInfo(null);
    } else if (typeof seatNumberOrUndefined === 'string') {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumberOrUndefined));
      setSeatSelectionError('');
    }
  };

  // Derive the "active" selected seat for SeatSelection prop (single mode)
  const activeSingleSeat = passengerCount === 1 ? selectedSeat : null;

  // ==========================================================
  // STEP 1 -> STEP 2
  // ==========================================================

  const handleProceedToDetails = () => {
    if (passengerCount === 1) {
      if (!selectedSeat) {
        setSeatSelectionError('Please select a seat to continue.');
        return;
      }
    } else {
      if (selectedSeats.length < passengerCount) {
        setSeatSelectionError(`Please select ${passengerCount} seats. (${selectedSeats.length} / ${passengerCount} selected)`);
        return;
      }
    }
    setSeatSelectionError('');
    setStep(2);
  };

  // ==========================================================
  // PASSENGER DETAILS → CREATE BOOKING(S) → PAYMENT
  //
  // Single passenger  → one booking (existing behaviour).
  // Multi-passenger   → N bookings, each with its own details.
  //   • If any booking fails, ALL previously-created bookings
  //     are cancelled so no seats are left in a partial state.
  //   • submitting flag prevents double-submit.
  // ==========================================================

  const handlePassengerSubmit = async (details) => {
    if (submitting) return;
    if (!details) { alert('Please enter passenger details.'); return; }

    const seatsToBook = passengerCount === 1
      ? (selectedSeat ? [selectedSeat] : [])
      : selectedSeats;

    if (seatsToBook.length === 0) { alert('Please select a seat first.'); return; }

    setSubmitting(true);
    // Store whichever passenger details format was submitted
    if (passengerCount === 1) {
      setPassengerDetails(details);
    }
    // multiPassengerDetails is already set by the multi-form before submit

    const scheduleIdToUse = selectedBus?.scheduleId || initialScheduleId;

    const rollbackAll = (bookings) => {
      bookings.forEach(b => {
        bookingService.cancelBooking(b._id, 'Multi-seat booking failed — partial rollback')
          .catch((err) => console.warn('[SmartSeat] Rollback failed for', b._id, err?.message));
      });
    };

    try {
      const createdBookings = [];

      for (let i = 0; i < seatsToBook.length; i++) {
        const seatNum = seatsToBook[i];

        // Resolve per-passenger details
        // Single: use the single `details` object
        // Multi:  use multiPassengerDetails[i], fall back to `details` if missing
        const paxDetails = passengerCount === 1
          ? details
          : (multiPassengerDetails[i] || details);

        const bookingData = {
          scheduleId: scheduleIdToUse,
          seatNumber: seatNum,
          passengerDetails: {
            name:   paxDetails?.fullName || paxDetails?.name || '',
            age:    Number(paxDetails?.age),
            gender: paxDetails?.gender || '',
            phone:  paxDetails?.phone || '',
            email:  paxDetails?.email || '',
          },
          smartSeatMonitoring: isMonitoringEnabled(scheduleIdToUse),
        };

        let response;
        try {
          response = await bookingService.createBooking(bookingData);
        } catch (seatError) {
          rollbackAll(createdBookings);
          if (passengerCount > 1) setSelectedSeats([]);
          throw seatError;
        }

        if (!response?.success) {
          rollbackAll(createdBookings);
          if (passengerCount > 1) setSelectedSeats([]);
          throw new Error(response?.message || `Seat ${seatNum} could not be booked.`);
        }

        createdBookings.push(response.data);
      }

      if (passengerCount === 1) {
        setPendingBooking(createdBookings[0]);
      } else {
        const combinedFare    = createdBookings.reduce((sum, b) => sum + Number(b.fare      ?? 0), 0);
        const combinedBase    = createdBookings.reduce((sum, b) => sum + Number(b.baseFare  ?? 0), 0);
        const combinedGst     = createdBookings.reduce((sum, b) => sum + Number(b.gstAmount ?? 0), 0);
        const firstBooking    = createdBookings[0];
        const gstRateDisplay  = Number(firstBooking?.gstRate ?? 0);

        setPendingBooking({
          _multiBooking:  true,
          bookings:       createdBookings,
          seatNumbers:    seatsToBook,
          ...firstBooking,
          seatNumber:     seatsToBook.join(', '),
          fare:           combinedFare,
          baseFare:       combinedBase,
          gstAmount:      combinedGst,
          gstRate:        gstRateDisplay,
        });
      }
      setStep(3);

    } catch (error) {
      console.error('[SmartSeat] Booking creation error:', error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'One or more selected seats are no longer available. Please select your seats again.';
      alert(msg);
    } finally {
      setSubmitting(false);
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
    setSelectedSeats([]);
    setMultiPassengerDetails([]);
    setSeatSelectionError('');
    navigate('/my-bookings');
  };

  const handleBackToSearch = () => {
    clearBooking();
    setSelectedSeats([]);
    setMultiPassengerDetails([]);
    setSeatSelectionError('');
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
            <>
              {/* Multi-seat progress indicator */}
              {passengerCount > 1 && (
                <div className={`mb-4 p-3 rounded-xl border text-sm font-semibold ${
                  selectedSeats.length === passengerCount
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
                }`}>
                  {selectedSeats.length === passengerCount
                    ? `✓ ${passengerCount} of ${passengerCount} seats selected`
                    : `Select ${passengerCount} seats — ${selectedSeats.length} / ${passengerCount} selected`}
                </div>
              )}

              {/* Seat selection error */}
              {seatSelectionError && (
                <div className="mb-3 p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 text-sm text-rose-300">
                  {seatSelectionError}
                </div>
              )}

              <SeatSelection
                busId={selectedBus?.busId || initialBusId}
                seatLayout={seatLayout}
                selectedSeat={activeSingleSeat}
                selectedSeats={passengerCount > 1 ? selectedSeats : undefined}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
                monitoredSeat={null}
                recommendedSeats={recommendations.map(item => item?.seatNumber)}
                aisleAfter={aisleAfter}
                busType={busType}
              />
            </>
          )}

          {/* STEP 2 */}

          {step === 2 && passengerCount === 1 && (
            <PassengerDetailsForm
              onSubmit={handlePassengerSubmit}
              onCancel={() => {
                setSeatSelectionError('');
                setStep(1);
              }}
            />
          )}

          {/* STEP 2 — MULTI-PASSENGER FORM */}

          {step === 2 && passengerCount > 1 && (
            <MultiPassengerForm
              passengerCount={passengerCount}
              selectedSeats={selectedSeats}
              initialData={multiPassengerDetails}
              submitting={submitting}
              onSubmit={(allDetails) => {
                setMultiPassengerDetails(allDetails);
                // Trigger booking creation with the first passenger's details
                // (handlePassengerSubmit will use multiPassengerDetails per seat)
                handlePassengerSubmit(allDetails[0]);
              }}
              onCancel={() => {
                setSeatSelectionError('');
                setStep(1);
              }}
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
                // User backed out of payment — cancel pending booking(s) to release seat(s)
                if (pendingBooking?._multiBooking) {
                  pendingBooking.bookings?.forEach(b => {
                    bookingService.cancelBooking(b._id, 'Payment cancelled by user').catch(() => {});
                  });
                } else if (pendingBooking?._id) {
                  bookingService
                    .cancelBooking(pendingBooking._id, 'Payment cancelled by user')
                    .catch((err) => console.warn('[SmartSeat] Could not cancel pending booking on back:', err));
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

          {/* SMARTSEAT + CONTINUE */}

          {step === 1 && (
            <>
              {/* SmartSeat panel — single mode only, shown when a seat is picked */}
              {passengerCount === 1 && selectedSeat && (
                <SmartSeatPanel
                  currentSeat={selectedSeat}
                  adjacentSeatInfo={adjacentSeatInfo}
                  monitoringEnabled={isMonitoringEnabled(currentScheduleId)}
                  onToggleMonitoring={() =>
                    setSeatMonitoring(currentScheduleId, !isMonitoringEnabled(currentScheduleId))
                  }
                  showPreferences={true}
                  onViewPreferences={() => navigate('/preferences')}
                />
              )}

              {/* Seat progress summary (multi-passenger) */}
              {passengerCount > 1 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    Passengers: {passengerCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(selectedSeats.length / passengerCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                      {selectedSeats.length} / {passengerCount}
                      {selectedSeats.length === passengerCount && ' ✓'}
                    </span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedSeats.map(s => (
                        <span
                          key={s}
                          onClick={() => handleSeatDeselect(s)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200 text-xs font-bold cursor-pointer hover:bg-red-100 hover:text-red-700 hover:border-red-200 transition-colors"
                          title={`Click to deselect ${s}`}
                        >
                          {s} ×
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedSeats.length < passengerCount && (
                    <p className="text-xs text-gray-500">
                      Select {passengerCount - selectedSeats.length} more seat{passengerCount - selectedSeats.length > 1 ? 's' : ''} to continue.
                    </p>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={handleProceedToDetails}
                disabled={
                  passengerCount === 1
                    ? !selectedSeat
                    : selectedSeats.length < passengerCount
                }
              >
                {passengerCount > 1 && selectedSeats.length < passengerCount
                  ? `Select ${passengerCount - selectedSeats.length} more seat${passengerCount - selectedSeats.length > 1 ? 's' : ''}`
                  : 'Continue to Passenger Details'}
              </Button>

              {passengerCount === 1 && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleFindAlternative}
                >
                  Find Alternative Seats
                </Button>
              )}
            </>
          )}

          {/* SUMMARY */}

          <BookingSummary
            bus={selectedBus}
            selectedSeat={passengerCount === 1 ? selectedSeat : null}
            selectedSeats={passengerCount > 1 ? selectedSeats : undefined}
            passengerCount={passengerCount}
            passengerDetails={passengerDetails}
            multiPassengerDetails={passengerCount > 1 ? multiPassengerDetails : undefined}
            smartSeatMonitoring={isMonitoringEnabled(currentScheduleId)}
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

