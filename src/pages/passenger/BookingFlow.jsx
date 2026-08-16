// Booking flow page - handles seat selection through payment
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Loading } from '../../components/common';
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
  const { busId, id } = useParams();
  const navigate = useNavigate();
  const { selectedBus, selectedSeat, selectSeat, selectBus: setSelectedBusContext, setSearchParameters, clearBooking } = useBooking();
  const { preferences, isMonitoringEnabled, setSeatMonitoring } = useSmartSeat();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [seatLayout, setSeatLayout] = useState(null);
  const [adjacentSeatInfo, setAdjacentSeatInfo] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Handle both route patterns: new pattern (busId, scheduleId) and old pattern (id)
  // When busId exists in params, use new pattern: busId=Bus._id, id=Schedule._id
  // When only id exists, use old pattern: id=Schedule._id
  const actualBusId = busId || (selectedBus?.busId || selectedBus?._id);
  const actualScheduleId = id;

  useEffect(() => {
    loadBusData();
  }, [actualBusId, actualScheduleId]);

  const loadBusData = async () => {
    setLoading(true);
    try {
      // Get schedule details first to get bus info
      const scheduleResponse = await api.get(`/schedules/${actualScheduleId}`);
      if (scheduleResponse.success) {
        const scheduleData = scheduleResponse.data;
        const retrievedBusId = scheduleData.busId._id || scheduleData.busId;
        
        // Get bus details using retrieved busId
        const busResponse = await busService.getBus(retrievedBusId);
        if (busResponse.success) {
          const busData = busResponse.data;
          setSelectedBusContext({
            ...busData,
            _id: retrievedBusId,
            busId: retrievedBusId,
            scheduleId: actualScheduleId,
            schedule: scheduleData
          });
          
          // Get seat layout for this schedule
          const seatsResponse = await busService.getSeats(retrievedBusId, actualScheduleId);
          if (seatsResponse.success) {
            setSeatLayout(seatsResponse.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading bus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = async (seat) => {
    selectSeat(seat.seatNumber);
    
    // Get adjacent seat info
    const adjacentResponse = await busService.getAdjacentSeat(actualScheduleId, seat.seatNumber);
    if (adjacentResponse.success) {
      setAdjacentSeatInfo(adjacentResponse.data);
    }
  };

  const handleProceedToDetails = () => {
    setStep(2);
  };

  const handlePassengerSubmit = (details) => {
    setPassengerDetails(details);
    setStep(3);
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      const bookingData = {
        scheduleId: actualScheduleId,
        seatNumber: selectedSeat,
        passengerDetails: {
          name: passengerDetails.name,
          age: passengerDetails.age,
          gender: passengerDetails.gender,
          phone: passengerDetails.phone
        },
        smartSeatMonitoring: isMonitoringEnabled(actualScheduleId)
      };

      const response = await bookingService.createBooking(bookingData);
      if (response.success) {
        setBookingResult(response.data);
        setPaymentComplete(true);
        setStep(4);
      } else {
        alert(response.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  const handleFindAlternative = async () => {
    try {
      const response = await recommendationService.getSeatRecommendations(
        actualScheduleId,
        selectedSeat
      );
      if (response.success) {
        setRecommendations(response.data);
        // Could show recommendations modal here
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const handleComplete = () => {
    clearBooking();
    navigate('/my-bookings');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading booking..." />
      </div>
    );
  }

  if (!selectedBus) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              Bus not found
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= stepNumber ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-24 h-1 mx-2 ${
                  step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 text-sm text-gray-600">
          <span className="w-24 text-center">Select Seat</span>
          <span className="w-24 text-center">Details</span>
          <span className="w-24 text-center">Payment</span>
          <span className="w-24 text-center">Ticket</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <SeatSelection
              busId={actualBusId}
              seatLayout={seatLayout}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              onSeatDeselect={() => selectSeat(null)}
              monitoredSeat={null}
              recommendedSeats={recommendations.map(r => r.seatNumber)}
            />
          )}

          {step === 2 && (
            <PassengerDetailsForm
              onSubmit={handlePassengerSubmit}
              onCancel={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <PaymentForm
              amount={selectedBus.schedule?.fare || selectedBus.fare || 450}
              onPaymentComplete={handlePaymentComplete}
              onCancel={() => setStep(2)}
            />
          )}

          {step === 4 && bookingResult && (
            <Ticket
              booking={bookingResult}
              onDownload={() => console.log('Download ticket')}
              onShare={() => console.log('Share ticket')}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {step === 1 && selectedSeat && (
            <>
              <SmartSeatPanel
                currentSeat={selectedSeat}
                adjacentSeatInfo={adjacentSeatInfo}
                monitoringEnabled={isMonitoringEnabled(id)}
                onToggleMonitoring={() => setSeatMonitoring(id, !isMonitoringEnabled(id))}
                showPreferences={true}
                onViewPreferences={() => navigate('/preferences')}
              />
              
              <Button
                variant="primary"
                className="w-full"
                onClick={handleProceedToDetails}
                disabled={!selectedSeat}
              >
                Continue to Passenger Details
              </Button>
            </>
          )}

          {step >= 1 && selectedBus && (
            <BookingSummary
              bus={selectedBus}
              selectedSeat={selectedSeat}
              passengerDetails={passengerDetails}
              searchParams={{}}
              smartSeatMonitoring={isMonitoringEnabled(id)}
            />
          )}

          {step === 4 && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleComplete}
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
