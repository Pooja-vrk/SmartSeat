// Bus details page
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, Loading } from '../../components/common';
import { busService } from '../../services/busService';
import api from '../../services/api';
import { useBooking } from '../../context/BookingContext';
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
  const navigate = useNavigate();
  const { selectBus, setSearchParameters } = useBooking();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusDetails = async () => {
      setLoading(true);
      try {
        // The id parameter is the scheduleId from Search
        const scheduleResponse = await api.get(`/schedules/${id}`);
        if (scheduleResponse.success) {
          const scheduleData = scheduleResponse.data;
          // Combine schedule data with bus data for display
          const combinedBusData = {
            ...scheduleData.busId,
            _id: scheduleData.busId._id,
            id: scheduleData.busId._id,
            scheduleId: scheduleData._id,
            schedule: scheduleData,
            route: scheduleData.routeId,
            travelDate: scheduleData.travelDate,
            availableSeats: scheduleData.availableSeats,
            fare: scheduleData.fare
          };
          setBus(combinedBusData);
          selectBus(combinedBusData);
        }
      } catch (error) {
        console.error('Error fetching bus details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [id, selectBus]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('wifi')) return Wifi;
    if (amenityLower.includes('water') || amenityLower.includes('bottle')) return Droplets;
    if (amenityLower.includes('food') || amenityLower.includes('meal') || amenityLower.includes('snack')) return Utensils;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return Wind;
    if (amenityLower.includes('charging') || amenityLower.includes('usb')) return Phone;
    if (amenityLower.includes('blanket') || amenityLower.includes('pillow')) return Shield;
    
    return CheckCircle;
  };

  const handleProceedToSeatSelection = () => {
    // The id parameter is the scheduleId from Search
    const scheduleId = id;
    const busId = bus._id || bus.id;
    // Set search parameters for booking flow
    setSearchParameters({
      from: bus.route?.source || bus.route?.from,
      to: bus.route?.destination || bus.route?.to,
      date: bus.travelDate || bus.schedule?.departure?.split('T')[0]
    });
    // Pass both busId and scheduleId to BookingFlow
    navigate(`/booking/${busId}/${scheduleId}/seats`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading bus details..." />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Bus not found</p>
              <Link to="/search">
                <Button variant="outline" size="sm" className="mt-4">
                  Back to Search
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
              <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
                <Link to="/search" className="hover:text-primary-600">Search</Link>
                <span>/</span>
                <span className="text-gray-900">{bus.operatorName}</span>
              </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{bus.operatorName}</h1>
            <p className="text-lg text-gray-600">{bus.busNumber}</p>
          </div>
          <Badge variant="info" className="text-lg px-4 py-2">{bus.busType}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route and Schedule */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Route & Schedule</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <p className="text-xs text-gray-600">From</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{bus.route?.source || bus.route?.from}</p>
                  <p className="text-sm text-gray-600">{formatTime(`${bus.travelDate}T${bus.schedule?.departureTime}`)}</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-px bg-gray-300 relative mb-2">
                    <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-600 bg-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{bus.route?.estimatedDuration}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{bus.route?.distance}</p>
                </div>
                
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <p className="text-xs text-gray-600">To</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{bus.route?.destination || bus.route?.to}</p>
                  <p className="text-sm text-gray-600">{formatTime(`${bus.travelDate}T${bus.schedule?.arrivalTime}`)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-700">Departure Date</p>
                  </div>
                  <p className="font-semibold text-green-900">{formatDate(bus.travelDate)}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700">Available Seats</p>
                  </div>
                  <p className="font-semibold text-blue-900">{bus.availableSeats} / {bus.seatConfiguration?.totalSeats}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(bus.amenities || []).map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Icon className="w-5 h-5 text-primary-600" />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
              {(!bus.amenities || bus.amenities.length === 0) && (
                <p className="text-sm text-gray-500">No amenities information available</p>
              )}
            </CardBody>
          </Card>

          {/* Boarding Points */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Boarding Points</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {(bus.boardingPoints || []).map((point, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
                {(!bus.boardingPoints || bus.boardingPoints.length === 0) && (
                  <p className="text-sm text-gray-500">No boarding points information available</p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Dropping Points */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Dropping Points</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {(bus.droppingPoints || []).map((point, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
                {(!bus.droppingPoints || bus.droppingPoints.length === 0) && (
                  <p className="text-sm text-gray-500">No dropping points information available</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="border-primary-200 shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-primary-600">₹{bus.fare}</p>
                <p className="text-sm text-gray-600">per seat</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium">₹{Math.round(bus.fare * 0.9)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">₹{Math.round(bus.fare * 0.1)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{bus.fare}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleProceedToSeatSelection}
                icon={Armchair}
                disabled={bus.availableSeats === 0}
              >
                {bus.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
              </Button>
            </CardBody>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Rating & Reviews</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(bus.rating || 4.0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">{bus.rating || 4.0}</span>
              </div>
              <p className="text-sm text-gray-600">
                Based on passenger reviews
              </p>
            </CardBody>
          </Card>

          {/* SmartSeat Info */}
          <Card className="bg-primary-50 border-primary-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-primary-900">SmartSeat Enabled</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-primary-800 mb-3">
                This bus supports SmartSeat features:
              </p>
              <ul className="space-y-2 text-sm text-primary-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Real-time adjacent seat monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Smart seat recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Easy seat changes</span>
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
