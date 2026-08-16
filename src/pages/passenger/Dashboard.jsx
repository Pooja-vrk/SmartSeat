// Passenger dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingService } from '../../services/bookingService';
import { 
  Bus, 
  Calendar, 
  MapPin, 
  Clock, 
  Bell,
  Armchair,
  TrendingUp,
  Shield,
  Search,
  User,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { unreadCount, loadNotifications } = useNotification();
  const [loading, setLoading] = useState(true);
  const [upcomingTrip, setUpcomingTrip] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    smartSeatEnabled: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load upcoming bookings
      const upcomingResponse = await bookingService.getUpcomingBookings();
      if (upcomingResponse.success) {
        setUpcomingTrip(upcomingResponse.data[0] || null);
        setRecentBookings(upcomingResponse.data.slice(0, 3));
      }

      // Load all bookings for stats
      const allBookingsResponse = await bookingService.getBookings();
      if (allBookingsResponse.success) {
        const bookings = allBookingsResponse.data;
        const now = new Date();
        setStats({
          totalBookings: bookings.length,
          upcomingTrips: bookings.filter(b => b.scheduleId?.departure && new Date(b.scheduleId.departure) > now).length,
          smartSeatEnabled: bookings.filter(b => b.smartSeatMonitoring).length
        });
      }

      // Load notifications
      loadNotifications();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your travel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Bus className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">SmartSeat Active</p>
                <p className="text-3xl font-bold text-gray-900">{stats.smartSeatEnabled}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Trip */}
          {upcomingTrip ? (
            <Card className="border-primary-200 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Trip</h3>
                  <Badge variant="success">Confirmed</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{upcomingTrip.busId?.operatorName || 'Bus Operator'}</p>
                    <p className="text-lg font-bold text-gray-900">{upcomingTrip.routeId?.source || 'N/A'} → {upcomingTrip.routeId?.destination || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Seat</p>
                    <p className="text-lg font-bold text-primary-600">{upcomingTrip.seatNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-green-700">Departure</p>
                    </div>
                    {upcomingTrip.scheduleId?.departure ? (
                      <>
                        <p className="font-semibold text-green-900">{formatDateTime(upcomingTrip.scheduleId.departure).date}</p>
                        <p className="text-sm text-green-800">{formatDateTime(upcomingTrip.scheduleId.departure).time}</p>
                      </>
                    ) : (
                      <p className="text-sm text-green-800">N/A</p>
                    )}
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-700">Boarding</p>
                    </div>
                    <p className="font-semibold text-blue-900">{upcomingTrip.busId?.boardingPoints?.[0] || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-600">
                      SmartSeat: {upcomingTrip.smartSeatMonitoring ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <Link to={`/booking/${upcomingTrip._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500">
                  <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No upcoming trips</p>
                  <Link to="/search">
                    <Button variant="primary" size="sm" className="mt-4" icon={Search}>
                      Search Buses
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <Link to="/my-bookings">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map(booking => (
                    <div key={booking._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{booking.routeId?.source || 'N/A'} → {booking.routeId?.destination || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{booking.busId?.operatorName || 'Bus Operator'}</p>
                        </div>
                        <Badge variant={booking.bookingStatus === 'confirmed' ? 'success' : 'default'}>
                          {booking.bookingStatus || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {booking.scheduleId?.departure ? formatDateTime(booking.scheduleId.departure).date : 'N/A'}
                        </span>
                        <span className="font-medium text-primary-600">Seat {booking.seatNumber || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent bookings
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Link to="/search" className="block">
                  <Button variant="outline" className="w-full" icon={Search}>
                    Search Buses
                  </Button>
                </Link>
                <Link to="/my-bookings" className="block">
                  <Button variant="outline" className="w-full" icon={Bus}>
                    My Bookings
                  </Button>
                </Link>
                <Link to="/notifications" className="block">
                  <Button variant="outline" className="w-full" icon={Bell}>
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button variant="outline" className="w-full" icon={User}>
                    Profile
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Notifications Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="danger">{unreadCount} new</Badge>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <Link to="/notifications">
                <Button variant="primary" className="w-full" icon={Bell}>
                  View All Notifications
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* SmartSeat Status */}
          <Card className="bg-primary-50 border-primary-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-primary-900">SmartSeat Status</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-primary-800 mb-3">
                {stats.smartSeatEnabled > 0 
                  ? `Active on ${stats.smartSeatEnabled} booking(s)`
                  : 'Not enabled on any bookings'
                }
              </p>
              <Link to="/preferences">
                <Button variant="outline" size="sm" className="w-full bg-white">
                  Configure Preferences
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
