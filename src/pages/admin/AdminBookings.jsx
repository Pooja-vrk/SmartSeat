// Admin bookings management page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input, Select, Badge, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { Bus, User, Calendar, Search, Filter } from 'lucide-react';

const AdminBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBookings({ status: statusFilter === 'all' ? undefined : statusFilter });
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Bookings</h1>
        <p className="text-gray-600">View and manage all passenger bookings</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              className="md:w-48"
            />
          </div>
        </CardBody>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Booking ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Passenger</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bus</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Seat</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">SmartSeat</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{booking.id}</td>
                    <td className="py-3 px-4 text-gray-600">{booking.passengerName}</td>
                    <td className="py-3 px-4 text-gray-600">{booking.busNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{booking.seat}</td>
                    <td className="py-3 px-4 text-gray-600">{booking.date}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">₹{booking.amount}</td>
                    <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${
                        booking.smartSeatMonitoring ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {booking.smartSeatMonitoring ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminBookings;
