// Admin dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { 
  Bus, 
  Users, 
  Calendar, 
  TrendingUp, 
  Shield,
  Bell,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              Error loading dashboard data
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { overview, recentBookings, recentNotifications, popularRoutes } = dashboardData;

  const statCards = [
    {
      title: 'Total Buses',
      value: overview.totalBuses,
      icon: Bus,
      color: 'primary',
      change: '+12%',
      positive: true
    },
    {
      title: 'Active Buses',
      value: overview.activeBuses,
      icon: Shield,
      color: 'success',
      change: '+8%',
      positive: true
    },
    {
      title: "Today's Bookings",
      value: overview.todayBookings,
      icon: Calendar,
      color: 'info',
      change: '+23%',
      positive: true
    },
    {
      title: 'Active Passengers',
      value: overview.activePassengers,
      icon: Users,
      color: 'secondary',
      change: '+15%',
      positive: true
    },
    {
      title: 'Seat Changes',
      value: overview.seatChanges,
      icon: TrendingUp,
      color: 'warning',
      change: '+5%',
      positive: true
    },
    {
      title: 'SmartSeat Notifications',
      value: overview.smartSeatNotifications,
      icon: Bell,
      color: 'primary',
      change: '+18%',
      positive: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of SmartSeat operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className={`flex items-center mt-2 text-sm ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.positive ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentBookings.map(booking => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{booking.passenger}</p>
                      <p className="text-sm text-gray-600">{booking.bus}</p>
                    </div>
                    <span className="text-sm font-medium text-primary-600">
                      ₹{booking.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Seat {booking.seat}</span>
                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
              <Link to="/admin/notifications">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentNotifications.map(notification => (
                <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.recipient}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.time).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Popular Routes */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Popular Routes</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bookings</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {popularRoutes.map((route, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {route.from} → {route.to}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{route.bookings}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">₹{route.revenue.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/buses/add">
              <Button variant="outline" className="w-full" icon={Bus}>
                Add Bus
              </Button>
            </Link>
            <Link to="/admin/bookings">
              <Button variant="outline" className="w-full" icon={Calendar}>
                View Bookings
              </Button>
            </Link>
            <Link to="/admin/passengers">
              <Button variant="outline" className="w-full" icon={Users}>
                Manage Passengers
              </Button>
            </Link>
            <Link to="/admin/notifications">
              <Button variant="outline" className="w-full" icon={Bell}>
                Send Notification
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
