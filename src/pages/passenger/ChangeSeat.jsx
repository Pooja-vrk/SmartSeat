// Change Seat page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Loading, Modal } from '../../components/common';
import { bookingService } from '../../services/bookingService';
import { busService } from '../../services/busService';
import SeatSelection from '../../components/seat/SeatSelection';
import { ArrowLeft, Armchair, Calendar, MapPin, AlertCircle } from 'lucide-react';

const ChangeSeat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getBooking(id);
      if (response.success) {
        const booking = response.data;
        setBooking(booking);

        // Resolve busId and scheduleId — they may be populated objects or plain strings.
        const busId =
          booking.busId?._id ||
          booking.busId ||
          null;

        const scheduleId =
          booking.scheduleId?._id ||
          booking.scheduleId ||
          null;

        if (busId && scheduleId) {
          // Fetch FULL seat layout (all statuses) so booked seats appear red.
          const seatsResponse = await busService.getSeats(
            String(busId),
            String(scheduleId)
          );
          if (seatsResponse.success) {
            setSeatLayout(seatsResponse.data);
          }
        }
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error loading booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat) => {
    // SeatSelection already disables booked/reserved/unavailable seats.
    // We additionally reject the passenger's own current seat.
    if (seat.seatNumber === booking?.seatNumber) {
      setError('That is your current seat. Please choose a different seat.');
      return;
    }
    setError(null);
    setSelectedSeat(seat.seatNumber);
  };

  const handleChangeSeat = async () => {
    if (!selectedSeat) {
      setError('Please select a new seat');
      return;
    }

    if (selectedSeat === booking.seatNumber) {
      setError('Please select a different seat');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmChangeSeat = async () => {
    setChanging(true);
    setError(null);
    try {
      const response = await bookingService.changeSeat(booking._id, selectedSeat);
      if (response.success) {
        // Navigate back to My Bookings
        navigate('/my-bookings');
      } else {
        setError(response.message || 'Failed to change seat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change seat');
      console.error('Error changing seat:', err);
    } finally {
      setChanging(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading booking details..." />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Booking Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Booking</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Armchair className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-gray-600">Current Seat</span>
                </div>
                <p className="text-2xl font-bold text-primary-900">{booking.seatNumber}</p>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Route</span>
                </div>
                <p className="font-medium text-gray-900">
                  {booking.routeId?.source || 'N/A'} → {booking.routeId?.destination || 'N/A'}
                </p>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Travel Date</span>
                </div>
                <p className="font-medium text-gray-900">
                  {booking.scheduleId?.travelDate ? new Date(booking.scheduleId.travelDate).toLocaleDateString() : 'N/A'}
                </p>
                
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-medium text-gray-900">{booking.bookingId}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Seat Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Seat</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {seatLayout ? (
                <SeatSelection
                  busId={booking.busId?._id}
                  seatLayout={seatLayout}
                  selectedSeat={selectedSeat}
                  onSeatSelect={handleSeatSelect}
                  onSeatDeselect={() => setSelectedSeat(null)}
                  monitoredSeat={null}
                  recommendedSeats={[]}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Loading seat layout...
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/my-bookings')}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleChangeSeat}
                  disabled={!selectedSeat || changing}
                >
                  {changing ? 'Changing...' : 'Change Seat'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Seat Change</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to change your seat from <strong>{booking.seatNumber}</strong> to <strong>{selectedSeat}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmChangeSeat} disabled={changing}>
                {changing ? 'Processing...' : 'Confirm Change'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChangeSeat;