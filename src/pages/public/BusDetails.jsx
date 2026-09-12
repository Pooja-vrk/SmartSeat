// Bus details page

import {
  useEffect,
  useState
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom';

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Loading
} from '../../components/common';

import api from '../../services/api';

import {
  useBooking
} from '../../context/BookingContext';

import {
  Bus,
  Clock,
  MapPin,
  Users,
  Star,
  Armchair,
  Calendar,
  Shield,
  Wifi,
  Utensils,
  Droplets,
  Wind,
  Phone,
  CheckCircle
} from 'lucide-react';

const BusDetails = () => {
  const { id } = useParams();
  const [busDetailsSearchParams] = useSearchParams();

  const navigate =
    useNavigate();

  const {
    selectBus,
    setSearchParameters
  } = useBooking();

  const [bus, setBus] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  // ==========================================================
  // LOAD SCHEDULE + BUS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchBusDetails =
      async () => {
        if (!id) {
          setLoading(false);
          setErrorMessage(
            'Schedule ID is missing.'
          );
          return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
          // --------------------------------------------------
          // Get schedule
          // --------------------------------------------------

          const scheduleResponse =
            await api.get(
              `/schedules/${id}`
            );

          if (
            !scheduleResponse?.success ||
            !scheduleResponse?.data
          ) {
            throw new Error(
              scheduleResponse?.message ||
                'Schedule not found.'
            );
          }

          const scheduleData =
            scheduleResponse.data;

          // --------------------------------------------------
          // Resolve bus ID
          // --------------------------------------------------

          const busId =
            scheduleData?.busId?._id ||
            scheduleData?.busId;

          if (!busId) {
            throw new Error(
              'Bus information is missing from the schedule.'
            );
          }

          // --------------------------------------------------
          // Get complete bus
          // --------------------------------------------------

          const busResponse =
            await api.get(
              `/buses/${busId}`
            );

          if (
            !busResponse?.success ||
            !busResponse?.data
          ) {
            throw new Error(
              busResponse?.message ||
                'Bus details not found.'
            );
          }

          const busData =
            busResponse.data;

          // --------------------------------------------------
          // Combine
          // --------------------------------------------------

          const combinedBusData = {
            ...busData,

            _id: busId,
            id: busId,
            busId,

            scheduleId:
              scheduleData._id,

            schedule:
              scheduleData,

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
            setBus(
              combinedBusData
            );

            selectBus(
              combinedBusData
            );
          }
        } catch (error) {
          console.error(
            'Error fetching bus details:',
            error
          );

          if (!cancelled) {
            setBus(null);

            setErrorMessage(
              error?.response?.data
                ?.message ||
                error?.message ||
                'Unable to load bus details.'
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchBusDetails();

    return () => {
      cancelled = true;
    };
  }, [id, selectBus]);

  // ==========================================================
  // DATE / TIME
  // ==========================================================

  const createDateTime = (
    date,
    time
  ) => {
    if (!date || !time) {
      return null;
    }

    const datePart =
      new Date(date)
        .toISOString()
        .split('T')[0];

    const result =
      new Date(
        `${datePart}T${time}`
      );

    return Number.isNaN(
      result.getTime()
    )
      ? null
      : result;
  };

  const formatTime = (
    value
  ) => {
    if (!value) {
      return 'N/A';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'N/A';
    }

    return date.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return 'N/A';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'N/A';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  };

  // ==========================================================
  // AMENITY ICON
  // ==========================================================

  const getAmenityIcon = (
    amenity
  ) => {
    const value =
      String(
        amenity || ''
      ).toLowerCase();

    if (
      value.includes('wifi')
    ) {
      return Wifi;
    }

    if (
      value.includes('water') ||
      value.includes('bottle')
    ) {
      return Droplets;
    }

    if (
      value.includes('food') ||
      value.includes('meal') ||
      value.includes('snack')
    ) {
      return Utensils;
    }

    if (
      value.includes('ac') ||
      value.includes('air')
    ) {
      return Wind;
    }

    if (
      value.includes('charging') ||
      value.includes('usb')
    ) {
      return Phone;
    }

    if (
      value.includes('blanket') ||
      value.includes('pillow')
    ) {
      return Shield;
    }

    return CheckCircle;
  };

  // ==========================================================
  // PROCEED
  // ==========================================================

  const handleProceedToSeatSelection =
    () => {
      if (!bus) {
        return;
      }

      const scheduleId =
        bus.scheduleId || id;

      const busId =
        bus.busId ||
        bus._id ||
        bus.id;

      if (
        !scheduleId ||
        !busId
      ) {
        alert(
          'Bus or schedule information is missing.'
        );
        return;
      }

      const boardingPoint = busDetailsSearchParams.get('boardingPoint') || '';
      const droppingPoint = busDetailsSearchParams.get('droppingPoint') || '';
      const passengers = busDetailsSearchParams.get('passengers') || '';

      setSearchParameters({
        from:
          bus.route?.source ||
          bus.route?.from ||
          '',

        to:
          bus.route?.destination ||
          bus.route?.to ||
          '',

        date:
          bus.travelDate ||
          '',

        boardingPoint,
        droppingPoint,
        passengers
      });

      const params = new URLSearchParams();
      if (boardingPoint) params.set('boardingPoint', boardingPoint);
      if (droppingPoint) params.set('droppingPoint', droppingPoint);
      if (passengers && Number(passengers) > 1) params.set('passengers', passengers);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      navigate(
        `/booking/${busId}/${scheduleId}/seats${queryString}`
      );
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading
          size="lg"
          text="Loading bus details..."
        />
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (!bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />

              <h3 className="font-semibold text-gray-800">
                Bus not found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {errorMessage ||
                  'Unable to load this bus.'}
              </p>

              <Link to="/search">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Back to Search
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ==========================================================
  // SCHEDULE VALUES
  // ==========================================================

  const departure =
    bus.schedule?.departure
      ? new Date(
          bus.schedule.departure
        )
      : createDateTime(
          bus.travelDate,
          bus.schedule?.departureTime
        );

  const arrival =
    bus.schedule?.arrival
      ? new Date(
          bus.schedule.arrival
        )
      : createDateTime(
          bus.travelDate,
          bus.schedule?.arrivalTime
        );

  const from =
    bus.route?.source ||
    bus.route?.from ||
    'N/A';

  const to =
    bus.route?.destination ||
    bus.route?.to ||
    'N/A';

  const duration =
    bus.schedule?.duration ||
    bus.route?.estimatedDuration ||
    'N/A';

  const fare =
    Number(
      bus.fare || 0
    );

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link
          to="/search"
          className="hover:text-primary-600"
        >
          Search
        </Link>

        <span>/</span>

        <span className="text-gray-900">
          {bus.operatorName}
        </span>
      </div>

      {/* Header */}

      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {bus.operatorName}
            </h1>

            <p className="text-lg text-gray-600">
              {bus.busNumber}
            </p>
          </div>

          <Badge
            variant="info"
            className="text-lg px-4 py-2"
          >
            {bus.busType}
          </Badge>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN */}

        <div className="lg:col-span-2 space-y-6">

          {/* ROUTE */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Route & Schedule
              </h3>
            </CardHeader>

            <CardBody>
              <div className="flex items-center justify-between mb-6">

                {/* FROM */}

                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-green-600" />

                    <p className="text-xs text-gray-600">
                      From
                    </p>
                  </div>

                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {from}
                  </p>

                  <p className="text-sm text-gray-600">
                    {formatTime(
                      departure
                    )}
                  </p>
                </div>

                {/* MIDDLE */}

                <div className="flex-1 flex flex-col items-center px-3">

                  <div className="w-full h-px bg-gray-300 relative mb-2">
                    <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-600 bg-white" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />

                    <span>
                      {duration}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {bus.route?.distance
                      ? `${bus.route.distance} km`
                      : ''}
                  </p>

                </div>

                {/* TO */}

                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-600" />

                    <p className="text-xs text-gray-600">
                      To
                    </p>
                  </div>

                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {to}
                  </p>

                  <p className="text-sm text-gray-600">
                    {formatTime(
                      arrival
                    )}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600" />

                    <p className="text-xs text-green-700">
                      Departure Date
                    </p>
                  </div>

                  <p className="font-semibold text-green-900">
                    {formatDate(
                      bus.travelDate
                    )}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />

                    <p className="text-xs text-blue-700">
                      Available Seats
                    </p>
                  </div>

                  <p className="font-semibold text-blue-900">
                    {bus.availableSeats ??
                      0}{' '}
                    /{' '}
                    {bus.seatConfiguration
                      ?.totalSeats ??
                      0}
                  </p>
                </div>

              </div>

              {(busDetailsSearchParams.get('boardingPoint') || busDetailsSearchParams.get('droppingPoint')) && (
                <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-900 font-medium">
                    <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>Selected Stops: <strong>{busDetailsSearchParams.get('boardingPoint') || from}</strong> → <strong>{busDetailsSearchParams.get('droppingPoint') || to}</strong></span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* AMENITIES */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Amenities
              </h3>
            </CardHeader>

            <CardBody>
              {bus.amenities?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {bus.amenities.map(
                    (
                      amenity,
                      index
                    ) => {
                      const Icon =
                        getAmenityIcon(
                          amenity
                        );

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <Icon className="w-5 h-5 text-primary-600" />

                          <span className="text-sm text-gray-700">
                            {amenity}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No amenities information available.
                </p>
              )}
            </CardBody>
          </Card>

          {/* BOARDING */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Boarding Points
              </h3>
            </CardHeader>

            <CardBody>
              {bus.boardingPoints?.length ? (
                <div className="space-y-3">
                  {bus.boardingPoints.map(
                    (
                      point,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {index + 1}
                        </div>

                        <span className="text-gray-700">
                          {point}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No boarding points information available.
                </p>
              )}
            </CardBody>
          </Card>

          {/* DROPPING */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Dropping Points
              </h3>
            </CardHeader>

            <CardBody>
              {bus.droppingPoints?.length ? (
                <div className="space-y-3">
                  {bus.droppingPoints.map(
                    (
                      point,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-semibold text-sm">
                          {index + 1}
                        </div>

                        <span className="text-gray-700">
                          {point}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No dropping points information available.
                </p>
              )}
            </CardBody>
          </Card>

        </div>

        {/* SIDEBAR */}

        <div className="space-y-6">

          {/* PRICE */}

          <Card className="border-primary-200 shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Pricing
              </h3>
            </CardHeader>

            <CardBody>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-primary-600">
                  ₹{fare}
                </p>

                <p className="text-sm text-gray-600">
                  per seat
                </p>
              </div>

              <div className="space-y-2 mb-4">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Base Fare
                  </span>

                  <span className="font-medium">
                    ₹
                    {Math.round(
                      fare * 0.9
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Taxes & Fees
                  </span>

                  <span className="font-medium">
                    ₹
                    {Math.round(
                      fare * 0.1
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                  <span>
                    Total
                  </span>

                  <span>
                    ₹{fare}
                  </span>
                </div>

              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={
                  handleProceedToSeatSelection
                }
                icon={Armchair}
                disabled={
                  Number(
                    bus.availableSeats
                  ) <= 0
                }
              >
                {Number(
                  bus.availableSeats
                ) <= 0
                  ? 'Sold Out'
                  : 'Select Seats'}
              </Button>
            </CardBody>
          </Card>

          {/* RATING */}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Rating & Reviews
              </h3>
            </CardHeader>

            <CardBody>
              <div className="flex items-center gap-2 mb-4">

                <div className="flex items-center gap-1">
                  {[...Array(5)].map(
                    (_, index) => (
                      <Star
                        key={index}
                        className={`w-5 h-5 ${
                          index <
                          Math.floor(
                            bus.rating ||
                              4
                          )
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    )
                  )}
                </div>

                <span className="text-lg font-bold text-gray-900">
                  {bus.rating ||
                    4}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                Based on passenger reviews
              </p>
            </CardBody>
          </Card>

          {/* SMARTSEAT */}

          <Card className="bg-primary-50 border-primary-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />

                <h3 className="text-lg font-semibold text-primary-900">
                  SmartSeat Enabled
                </h3>
              </div>
            </CardHeader>

            <CardBody>
              <p className="text-sm text-primary-800 mb-3">
                This bus supports SmartSeat features:
              </p>

              <ul className="space-y-2 text-sm text-primary-700">

                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />

                  <span>
                    Real-time adjacent seat monitoring
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />

                  <span>
                    Smart seat recommendations
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />

                  <span>
                    Easy seat changes
                  </span>
                </li>

              </ul>
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default BusDetails;