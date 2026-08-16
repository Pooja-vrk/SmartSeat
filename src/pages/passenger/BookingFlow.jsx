// Booking flow page
// Handles seat selection -> passenger details -> payment -> ticket

import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  Card,
  CardBody,
  Button,
  Loading
} from '../../components/common';

import {
  useBooking
} from '../../context/BookingContext';

import {
  useSmartSeat
} from '../../context/SmartSeatContext';

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
  const {
    busId,
    scheduleId,
    id
  } = useParams();

  const navigate = useNavigate();

  const {
    selectedBus,
    selectedSeat,
    selectSeat,
    selectBus,
    clearBooking
  } = useBooking();

  const {
    isMonitoringEnabled,
    setSeatMonitoring
  } = useSmartSeat();

  const [step, setStep] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [seatLayout, setSeatLayout] =
    useState([]);

  const [adjacentSeatInfo, setAdjacentSeatInfo] =
    useState(null);

  const [passengerDetails, setPassengerDetails] =
    useState(null);

  const [bookingResult, setBookingResult] =
    useState(null);

  const [recommendations, setRecommendations] =
    useState([]);

  const [errorMessage, setErrorMessage] =
    useState('');

  // ==========================================================
  // IDS
  // ==========================================================

  const actualScheduleId =
    scheduleId || id;

  const actualBusId =
    busId ||
    selectedBus?.busId ||
    selectedBus?._id ||
    selectedBus?.id;

  // ==========================================================
  // LOAD SCHEDULE + BUS + REAL SEATS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadBookingData = async () => {
      if (!actualScheduleId) {
        setLoading(false);
        setErrorMessage(
          'Schedule ID is missing.'
        );
        return;
      }

      setLoading(true);
      setErrorMessage('');

      // Reset stale seat state when entering
      // a new booking flow.
      selectSeat(null);
      setAdjacentSeatInfo(null);
      setRecommendations([]);

      try {
        // ------------------------------------------------------
        // 1. GET SCHEDULE
        // ------------------------------------------------------

        const scheduleResponse =
          await api.get(
            `/schedules/${actualScheduleId}`
          );

        if (
          !scheduleResponse?.success ||
          !scheduleResponse?.data
        ) {
          throw new Error(
            scheduleResponse?.message ||
              'Schedule could not be loaded.'
          );
        }

        const scheduleData =
          scheduleResponse.data;

        // ------------------------------------------------------
        // 2. GET BUS ID FROM SCHEDULE
        // ------------------------------------------------------

        const scheduleBusId =
          scheduleData?.busId?._id ||
          scheduleData?.busId;

        const resolvedBusId =
          actualBusId || scheduleBusId;

        if (!resolvedBusId) {
          throw new Error(
            'Bus information is missing from this schedule.'
          );
        }

        // ------------------------------------------------------
        // 3. GET BUS DETAILS
        // ------------------------------------------------------

        const busResponse =
          await busService.getBus(
            resolvedBusId
          );

        if (
          !busResponse?.success ||
          !busResponse?.data
        ) {
          throw new Error(
            busResponse?.message ||
              'Bus details could not be loaded.'
          );
        }

        const busData =
          busResponse.data;

        // ------------------------------------------------------
        // 4. BUILD BOOKING BUS OBJECT
        // ------------------------------------------------------

        const bookingBus = {
          ...busData,

          _id: resolvedBusId,
          id: resolvedBusId,
          busId: resolvedBusId,

          scheduleId:
            actualScheduleId,

          schedule: scheduleData,

          route:
            scheduleData.routeId,

          travelDate:
            scheduleData.travelDate,

          availableSeats:
            scheduleData.availableSeats,

          fare:
            scheduleData.fare
        };

        if (!cancelled) {
          selectBus(bookingBus);
        }

        // ------------------------------------------------------
        // 5. GET REAL SEATS
        // ------------------------------------------------------

        const seatsResponse =
          await busService.getSeats(
            resolvedBusId,
            actualScheduleId
          );

        if (
          !seatsResponse?.success
        ) {
          throw new Error(
            seatsResponse?.message ||
              'Seat layout could not be loaded.'
          );
        }

        const seats =
          Array.isArray(
            seatsResponse.data
          )
            ? seatsResponse.data
            : [];

        if (!cancelled) {
          setSeatLayout(seats);

          if (seats.length === 0) {
            setErrorMessage(
              'No seats were found for this schedule.'
            );
          }
        }

        console.log(
          'SmartSeat real seat layout:',
          {
            scheduleId:
              actualScheduleId,

            busId:
              resolvedBusId,

            seatCount:
              seats.length,

            seats
          }
        );
      } catch (error) {
        console.error(
          'Booking flow loading error:',
          error
        );

        if (!cancelled) {
          setSeatLayout([]);

          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              'Unable to load booking information.'
          );
        }
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
    actualScheduleId,
    actualBusId,
    selectBus,
    selectSeat
  ]);

  // ==========================================================
  // SEAT SELECT
  // ==========================================================

  const handleSeatSelect = (seat) => {
    if (!seat) {
      return;
    }

    selectSeat(
      seat.seatNumber
    );

    if (seat.adjacentSeat) {
      const adjacentSeat =
        seatLayout.find(
          (item) =>
            item.seatNumber ===
            seat.adjacentSeat
        );

      setAdjacentSeatInfo({
        adjacentSeatNumber:
          seat.adjacentSeat,

        adjacentSeatStatus:
          adjacentSeat?.type ||
          'unknown'
      });
    } else {
      setAdjacentSeatInfo(null);
    }
  };

  // ==========================================================
  // SEAT DESELECT
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
      alert(
        'Please select a seat first.'
      );
      return;
    }

    setStep(2);
  };

  // ==========================================================
  // PASSENGER DETAILS
  // ==========================================================

  const handlePassengerSubmit = (
    details
  ) => {
    setPassengerDetails(details);
    setStep(3);
  };

  // ==========================================================
  // PAYMENT COMPLETE
  // ==========================================================

  const handlePaymentComplete =
    async () => {
      if (!selectedSeat) {
        alert(
          'Please select a seat.'
        );
        return;
      }

      if (!passengerDetails) {
        alert(
          'Passenger details are missing.'
        );
        return;
      }

      try {
        const bookingData = {
          scheduleId:
            actualScheduleId,

          seatNumber:
            selectedSeat,

          passengerDetails: {
            name:
              passengerDetails.name ||
              passengerDetails.fullName ||
              '',

            age:
              Number(
                passengerDetails.age
              ),

            gender:
              passengerDetails.gender,

            phone:
              passengerDetails.phone
          },

          smartSeatMonitoring:
            isMonitoringEnabled(
              actualScheduleId
            )
        };

        console.log(
          'Creating booking:',
          bookingData
        );

        const response =
          await bookingService.createBooking(
            bookingData
          );

        if (
          response?.success
        ) {
          setBookingResult(
            response.data
          );

          setStep(4);
        } else {
          alert(
            response?.message ||
              'Booking failed.'
          );
        }
      } catch (error) {
        console.error(
          'Booking creation error:',
          error
        );

        alert(
          error?.response?.data?.message ||
            error?.message ||
            'Booking failed. Please try again.'
        );
      }
    };

  // ==========================================================
  // RECOMMENDATIONS
  // ==========================================================

  const handleFindAlternative =
    async () => {
      if (
        !actualScheduleId ||
        !selectedSeat
      ) {
        return;
      }

      try {
        const response =
          await recommendationService
            .getSeatRecommendations(
              actualScheduleId,
              selectedSeat
            );

        if (
          response?.success
        ) {
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
          'Recommendation error:',
          error
        );
      }
    };

  // ==========================================================
  // COMPLETE
  // ==========================================================

  const handleComplete = () => {
    clearBooking();
    navigate('/my-bookings');
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
  // BUS ERROR
  // ==========================================================

  if (!selectedBus) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold text-gray-800">
                Unable to load bus
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {errorMessage ||
                  'Bus information is unavailable.'}
              </p>

              <Button
                variant="primary"
                className="mt-5"
                onClick={() =>
                  navigate('/search')
                }
              >
                Back to Search
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

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
          ERROR
      ====================================================== */}

      {errorMessage &&
        seatLayout.length === 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          </div>
        )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN */}

        <div className="lg:col-span-2">

          {/* STEP 1 */}

          {step === 1 && (
            <SeatSelection
              busId={actualBusId}
              seatLayout={seatLayout}
              selectedSeat={selectedSeat}
              onSeatSelect={
                handleSeatSelect
              }
              onSeatDeselect={
                handleSeatDeselect
              }
              monitoredSeat={null}
              recommendedSeats={
                recommendations.map(
                  (item) =>
                    item.seatNumber
                )
              }
              aisleAfter={
                selectedBus
                  ?.seatConfiguration
                  ?.aisleAfter ?? 2
              }
              errorMessage={
                errorMessage
              }
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
                selectedBus?.schedule
                  ?.fare ||
                selectedBus?.fare ||
                0
              }
              onPaymentComplete={
                handlePaymentComplete
              }
              onCancel={() =>
                setStep(2)
              }
            />
          )}

          {/* STEP 4 */}

          {step === 4 &&
            bookingResult && (
              <Ticket
                booking={
                  bookingResult
                }
                onDownload={() =>
                  console.log(
                    'Download ticket'
                  )
                }
                onShare={() =>
                  console.log(
                    'Share ticket'
                  )
                }
              />
            )}
        </div>

        {/* SIDEBAR */}

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
                      actualScheduleId
                    )
                  }

                  onToggleMonitoring={() =>
                    setSeatMonitoring(
                      actualScheduleId,
                      !isMonitoringEnabled(
                        actualScheduleId
                      )
                    )
                  }

                  showPreferences={true}

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
            bus={selectedBus}
            selectedSeat={
              selectedSeat
            }
            passengerDetails={
              passengerDetails
            }
            searchParams={{}}
            smartSeatMonitoring={
              isMonitoringEnabled(
                actualScheduleId
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