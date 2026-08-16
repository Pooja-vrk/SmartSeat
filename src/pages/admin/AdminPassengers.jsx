// Admin passengers management page
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { User, Search, Shield, Calendar } from 'lucide-react';

const AdminPassengers = () => {
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPassengers();
      if (response.success) {
        setPassengers(response.data);
      }
    } catch (error) {
      console.error('Error loading passengers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPassengers = passengers.filter(passenger =>
    passenger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passenger.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passenger.phone.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading passengers..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Passengers</h1>
        <p className="text-gray-600">View and manage passenger accounts</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardBody>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search passengers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardBody>
      </Card>

      {/* Passengers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPassengers.map(passenger => (
          <Card key={passenger.id} hover>
            <CardBody>
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{passenger.name}</h3>
                  <p className="text-sm text-gray-600">{passenger.email}</p>
                  <p className="text-sm text-gray-600">{passenger.phone}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-medium text-gray-900">{passenger.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Bookings</span>
                  <span className="font-medium text-gray-900">{passenger.activeBookings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(passenger.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">SmartSeat</span>
                </div>
                <Badge variant={passenger.smartSeatEnabled ? 'success' : 'default'}>
                  {passenger.smartSeatEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPassengers;
