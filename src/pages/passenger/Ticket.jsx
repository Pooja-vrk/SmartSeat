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

    // Build a plain-text ticket summary and trigger a browser print-to-PDF.
    // This avoids adding a PDF library dependency.
    const b = booking;

    const schedule =
      b.scheduleId && typeof b.scheduleId === 'object'
        ? b.scheduleId
        : b.schedule || {};

    const route =
      b.route || schedule?.routeId || {};

    const bus =
      b.bus || schedule?.busId || {};

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
      '╔══════════════════════════════════════╗',
      '         SmartSeat — Digital Ticket     ',
      '╚══════════════════════════════════════╝',
      '',
      `Booking ID:    ${b.bookingId || b._id || 'N/A'}`,
      `Status:        ${b.bookingStatus || 'confirmed'}`,
      '',
      '── PASSENGER ───────────────────────────',
      `Name:          ${passenger.name || 'N/A'}`,
      `Phone:         ${passenger.phone || 'N/A'}`,
      '',
      '── JOURNEY ─────────────────────────────',
      `From:          ${from}`,
      `To:            ${to}`,
      `Date:          ${travelDate}`,
      `Departure:     ${schedule?.departureTime || 'N/A'}`,
      `Arrival:       ${schedule?.arrivalTime   || 'N/A'}`,
      '',
      '── BUS ──────────────────────────────────',
      `Operator:      ${operator}`,
      `Bus Number:    ${busNo}`,
      `Bus Type:      ${bus?.busType || 'N/A'}`,
      '',
      '── SEAT ─────────────────────────────────',
      `Seat Number:   ${b.seatNumber || 'N/A'}`,
      '',
      '── FARE ─────────────────────────────────',
      fareLines,
      '',
      '─────────────────────────────────────────',
      'Please carry a valid ID proof for boarding',
      'Support: +91 1800-123-4567',
    ].join('\n');

    // Open a small printable window
    const printWindow = window.open('', '_blank', 'width=520,height=700');
    if (!printWindow) {
      // Fallback: download as .txt if popup blocked
      const blob = new Blob([content], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `SmartSeat-Ticket-${b.bookingId || 'ticket'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SmartSeat Ticket — ${b.bookingId || ''}</title>
        <style>
          body { font-family: monospace; white-space: pre; padding: 24px; font-size: 13px; line-height: 1.6; }
          @media print { body { padding: 8px; } }
        </style>
      </head>
      <body>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShare = async () => {
    if (!booking) return;

    const b = booking;
    const schedule =
      b.scheduleId && typeof b.scheduleId === 'object'
        ? b.scheduleId
        : b.schedule || {};
    const route = b.route || schedule?.routeId || {};
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
      `SmartSeat Booking\n` +
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
        // User cancelled share — not an error
        if (err?.name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Booking details copied to clipboard!');
      } catch {
        // Last resort: select text from a temporary element
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