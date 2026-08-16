// Admin analytics page
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Select, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { TrendingUp, Users, Bus, IndianRupee, Calendar } from 'lucide-react';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAnalytics(period);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              Error loading analytics data
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Performance metrics and insights</p>
          </div>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'year', label: 'This Year' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.bookings}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Seat Changes</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.seatChanges}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Passenger Growth</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.passengerGrowth}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* SmartSeat Adoption */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">SmartSeat Adoption</h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                  style={{ width: `${analytics.smartSeatAdoption}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{analytics.smartSeatAdoption}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Percentage of passengers with SmartSeat monitoring enabled
          </p>
        </CardBody>
      </Card>

      {/* Route Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Route Performance</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {analytics.routePerformance.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bus className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {route.from} → {route.to}
                    </p>
                    <p className="text-sm text-gray-600">{route.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{route.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
