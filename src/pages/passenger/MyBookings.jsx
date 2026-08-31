// My Bookings page — SmartSeat Journey Management
// Created & Designed by V.Pooja

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import {
  Bus,
  Calendar,
  MapPin,
  Armchair,
  Shield,
  Eye,
  X,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import './PassengerPages.css';

// ─────────────────────────────────────────────────────────────
// CANCELLATION DIALOG
// ─────────────────────────────────────────────────────────────

const CancelDialog = ({ booking, refundPreview, onConfirm, onClose, loading }) => {
  const route = booking?.routeId || {};
  const bus = booking?.busId || {};
  const schedule = booking?.scheduleId || {};

  const travelDate = schedule?.travelDate
    ? new Date(schedule.travelDate).toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Cancel booking">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h2 className="text-lg font-black text-white uppercase tracking-wide">CANCEL BOOKING?</h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Booking summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-sm">
            <div className="flex items-center gap-2 font-black text-slate-900 text-base">
              <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              {route.source || 'N/A'}
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              {route.destination || 'N/A'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span><strong className="text-slate-800">Bus:</strong> {bus.busNumber || 'N/A'}</span>
              <span><strong className="text-slate-800">Seat:</strong> {booking?.seatNumber || 'N/A'}</span>
              <span><strong className="text-slate-800">Date:</strong> {travelDate}</span>
              <span><strong className="text-slate-800">Dept:</strong> {schedule?.departureTime || 'N/A'}</span>
            </div>
          </div>

          {/* Refund preview */}
          {refundPreview ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">REFUND SUMMARY</span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Original Amount</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{Number(refundPreview.totalFare || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cancellation Charge</span>
                  <span className="font-mono font-semibold text-rose-600">
                    − ₹{Number(refundPreview.cancellationFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between font-black text-sm">
                  <span className="text-slate-900">Refund Amount</span>
                  <span className={`font-mono ${Number(refundPreview.refundAmount) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{Number(refundPreview.refundAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-[11px] text-amber-700 font-semibold">
                    <strong>Policy:</strong> {refundPreview.label || '—'}
                  </p>
                  <p className="text-[11px] text-amber-600 mt-0.5">{refundPreview.description || ''}</p>
                  {refundPreview.hoursBeforeDeparture !== undefined && (
                    <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {refundPreview.hoursBeforeDeparture}h before departure
                    </p>
                  )}
                </div>
                {Number(refundPreview.refundAmount) > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Refund will be initiated within 5–7 business days
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Loading refund details...</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              KEEP BOOKING
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-sm font-black uppercase tracking-wide hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {loading ? 'Cancelling...' : 'CANCEL & REFUND'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MY BOOKINGS PAGE
// ─────────────────────────────────────────────────────────────

const MyBookings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Cancellation dialog state
  const [cancelTarget, setCancelTarget] = useState(null);    // booking to cancel
  const [refundPreview, setRefundPreview] = useState(null);  // refund data
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refundPreviewLoading, setRefundPreviewLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'completed') {
        response = await bookingService.getCompletedBookings();
      } else if (activeTab === 'cancelled') {
        response = await bookingService.getCancelledBookings();
      } else {
        response = await bookingService.getUpcomingBookings();
      }
      if (response?.success) setBookings(response.data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Open cancellation dialog and load refund preview
  const openCancelDialog = async (booking) => {
    setCancelTarget(booking);
    setRefundPreview(null);
    setRefundPreviewLoading(true);
    try {
      const preview = await bookingService.getRefundPreview(booking._id);
      if (preview?.success) setRefundPreview(preview.data);
    } catch (err) {
      console.error('Refund preview error:', err);
    } finally {
      setRefundPreviewLoading(false);
    }
  };

  const closeCancelDialog = () => {
    setCancelTarget(null);
    setRefundPreview(null);
  };

  const confirmCancellation = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const response = await bookingService.cancelBooking(
        cancelTarget._id,
        'Cancelled by passenger'
      );
      if (response?.success) {
        closeCancelDialog();
        await loadBookings();
      } else {
        alert(response?.message || 'Cancellation failed. Please try again.');
      }
    } catch (err) {
      alert(err?.message || 'Cancellation failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-sky-50 text-sky-700 border-sky-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return (
      <Badge className={`${map[status] || 'bg-slate-50 text-slate-700'} text-[10px] font-bold uppercase border`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="passenger-page-container min-h-screen py-8 px-4 flex items-center justify-center">
        <Loading size="lg" text="Loading journey history..." />
      </div>
    );
  }

  return (
    <>
      {/* Cancellation dialog */}
      {cancelTarget && (
        <CancelDialog
          booking={cancelTarget}
          refundPreview={refundPreview}
          onConfirm={confirmCancellation}
          onClose={closeCancelDialog}
          loading={cancelLoading}
        />
      )}

      <div className="passenger-page-container min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HERO HEADER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 text-white border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                JOURNEY MANAGEMENT
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                MY <span className="text-cyan-400">BOOKINGS</span>
              </h1>
              <p className="text-xs text-slate-400">View, manage and cancel your travel bookings</p>
            </div>
            <Link to="/search">
              <Button variant="primary" className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20">
                ✦ Book New Bus
              </Button>
            </Link>
          </div>

          {/* TABS */}
          <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {['upcoming', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 text-cyan-400 shadow-md border border-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* BOOKING LIST */}
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
              <Bus className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">No bookings found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {activeTab === 'upcoming'
                  ? 'You have no upcoming trips.'
                  : activeTab === 'completed'
                  ? 'No completed trips yet.'
                  : 'No cancelled bookings.'}
              </p>
              {activeTab === 'upcoming' && (
                <Link to="/search">
                  <Button variant="primary" icon={Bus} className="bg-cyan-500 text-slate-950 font-bold text-xs uppercase">
                    Search Buses
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card-premium p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

                    {/* LEFT: booking info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-black text-slate-900 tracking-wide">
                              {booking.routeId?.source || 'N/A'}{' '}
                              <span className="text-cyan-500 font-normal">→</span>{' '}
                              {booking.routeId?.destination || 'N/A'}
                            </h3>
                            {getStatusBadge(booking.bookingStatus)}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {booking.busId?.operatorName || 'Bus Operator'}
                          </p>
                          <p className="text-xs font-mono font-bold text-cyan-600">
                            {booking.busId?.busNumber || 'N/A'} &nbsp;·&nbsp; {booking.busId?.busType || ''}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Travel Date</p>
                          <p className="font-bold text-xs text-slate-900">
                            {booking.scheduleId?.travelDate
                              ? new Date(booking.scheduleId.travelDate).toLocaleDateString('en-IN', {
                                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                })
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Departure</p>
                          <p className="font-bold text-xs text-slate-900">
                            {booking.scheduleId?.departureTime || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Seat</p>
                          <p className="font-bold text-xs text-cyan-700 font-mono">{booking.seatNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Fare</p>
                          <p className="font-bold text-xs text-slate-900 font-mono">₹{booking.fare || 'N/A'}</p>
                        </div>
                      </div>

                      {/* GST & refund info for cancelled */}
                      {booking.bookingStatus === 'cancelled' && booking.refundAmount != null && (
                        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                          <IndianRupee className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-amber-700 font-semibold">
                            Refund: ₹{Number(booking.refundAmount).toFixed(2)} &nbsp;·&nbsp;
                            Status: <strong className="uppercase">{booking.refundStatus || 'initiated'}</strong>
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-teal-600" />
                          <span>SmartSeat: <strong>{booking.smartSeatMonitoring ? 'ACTIVE' : 'OFF'}</strong></span>
                        </div>
                        {booking.gstRate && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">GST ({booking.gstRate}%): ₹{Number(booking.gstAmount || 0).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: actions */}
                    <div className="flex lg:flex-col gap-2.5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                      <Link to={`/ticket/${booking._id}`}>
                        <Button variant="outline" size="sm" icon={Eye} className="w-full text-xs font-bold uppercase tracking-wider text-slate-700">
                          View Ticket
                        </Button>
                      </Link>
                      {booking.bookingStatus === 'confirmed' && (
                        <>
                          <Link to={`/change-seat/${booking._id}`}>
                            <Button variant="outline" size="sm" className="w-full text-xs font-bold uppercase tracking-wider text-cyan-700 border-cyan-300">
                              Change Seat
                            </Button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => openCancelDialog(booking)}
                            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default MyBookings;
