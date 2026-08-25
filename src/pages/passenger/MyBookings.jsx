// My Bookings page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, Select, Loading } from '../../components/common';
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
  Filter
} from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadBookings();
  }, [user, filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      let response;
      switch (filter) {
        case 'upcoming':
          response = await bookingService.getUpcomingBookings();
          break;
        case 'completed':
          response = await bookingService.getCompletedBookings();
          break;
        case 'cancelled':
          response = await bookingService.getCancelledBookings();
          break;
        default:
          response = await bookingService.getBookings();
      }

      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        loadBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your travel bookings</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['upcoming', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setFilter(tab === 'all' ? 'all' : tab);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <Bus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="mb-4">
                {activeTab === 'upcoming' 
                  ? 'You have no upcoming trips' 
                  : activeTab === 'completed'
                  ? 'You have no completed trips'
                  : 'You have no cancelled bookings'}
              </p>
              {activeTab === 'upcoming' && (
                <Link to="/search">
                  <Button variant="primary" icon={Bus}>
                    Search Buses
                  </Button>
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Card key={booking._id} hover>
              <CardBody>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.routeId?.source || 'N/A'} → {booking.routeId?.destination || 'N/A'}
                          </h3>
                          {getStatusBadge(booking.bookingStatus)}
                        </div>
                        <p className="text-sm text-gray-600">{booking.busId?.operatorName || 'Bus Operator'}</p>
                        <p className="text-sm text-gray-600">{booking.busId?.busNumber || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Date</p>
                        <p className="font-medium text-gray-900">
                          {booking.scheduleId?.departure ? formatDateTime(booking.scheduleId.departure).date : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Time</p>
                        <p className="font-medium text-gray-900">
                          {booking.scheduleId?.departure ? formatDateTime(booking.scheduleId.departure).time : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Seat</p>
                        <p className="font-medium text-primary-600">{booking.seatNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total</p>
                        <p className="font-medium text-gray-900">₹{booking.fare || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.busId?.boardingPoints?.[0] || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>
                          SmartSeat: {booking.smartSeatMonitoring ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Link to={`/ticket/${booking._id}`}>
                      <Button variant="outline" size="sm" icon={Eye}>
                        View Ticket
                      </Button>
                    </Link>
                    {booking.bookingStatus === 'confirmed' && (
                      <>
                        <Link to={`/change-seat/${booking._id}`}>
                          <Button variant="outline" size="sm">
                            Change Seat
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => cancelBooking(booking._id)}
                          icon={X}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
