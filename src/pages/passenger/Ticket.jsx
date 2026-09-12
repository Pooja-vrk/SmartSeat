// Ticket page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Loading } from '../../components/common';
import Ticket from '../../components/booking/Ticket';
import { bookingService } from '../../services/bookingService';
import { ArrowLeft } from 'lucide-react';

const TicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getBooking(id);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!booking) return;

    const b = booking;

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

    const bus =
      (b.busId && typeof b.busId === 'object' ? b.busId : null) ||
      b.bus || schedule?.busId || {};

    const passenger = b.passengerDetails || {};
    const email = passenger.email || b.passengerEmail || (typeof b.userId === 'object' ? b.userId?.email : null) || 'N/A';

    const from  = route?.source || route?.from || 'N/A';
    const to    = route?.destination || route?.to || 'N/A';
    const boardingPointName = (typeof b.boardingPoint === 'object' ? b.boardingPoint?.name : b.boardingPoint) || from;
    const droppingPointName = (typeof b.droppingPoint === 'object' ? b.droppingPoint?.name : b.droppingPoint) || to;
    const boardingTime = (typeof b.boardingPoint === 'object' ? b.boardingPoint?.time : null) || schedule?.departureTime || 'N/A';
    const droppingTime = (typeof b.droppingPoint === 'object' ? b.droppingPoint?.time : null) || schedule?.arrivalTime || 'N/A';
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
      `Email:         ${email}`,
      `Phone:         ${passenger.phone || 'N/A'}`,
      '',
      '-- JOURNEY INFORMATION -----------------',
      `From:          ${from}`,
      `To:            ${to}`,
      `Boarding Point:${boardingPointName}`,
      `Boarding Time: ${boardingTime}`,
      `Dropping Point:${droppingPointName}`,
      `Dropping Time: ${droppingTime}`,
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

  const handleShare = async () => {
    if (!booking) return;

    const b = booking;
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
    const bus   =
      (b.busId && typeof b.busId === 'object' ? b.busId : null) ||
      b.bus   || schedule?.busId   || {};

    const from  = route?.source || route?.from || 'N/A';
    const to    = route?.destination || route?.to || 'N/A';
    const boardingPointName = (typeof b.boardingPoint === 'object' ? b.boardingPoint?.name : b.boardingPoint) || from;
    const droppingPointName = (typeof b.droppingPoint === 'object' ? b.droppingPoint?.name : b.droppingPoint) || to;
    const boardingTime = (typeof b.boardingPoint === 'object' ? b.boardingPoint?.time : null) || schedule?.departureTime || 'N/A';
    const droppingTime = (typeof b.droppingPoint === 'object' ? b.droppingPoint?.time : null) || schedule?.arrivalTime || 'N/A';
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
      `Boarding Point: ${boardingPointName}\n` +
      `Boarding Time: ${boardingTime}\n` +
      `Dropping Point: ${droppingPointName}\n` +
      `Dropping Time: ${droppingTime}\n` +
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading ticket..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <p>Booking not found</p>
              <Button variant="outline" onClick={() => navigate('/my-bookings')} className="mt-4">
                Back to My Bookings
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/my-bookings')} icon={ArrowLeft}>
          Back to My Bookings
        </Button>
      </div>
      <Ticket 
        booking={booking} 
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  );
};

export default TicketPage;