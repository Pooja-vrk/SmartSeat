// Admin notifications management page
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select, Badge, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { Bell, Search, Filter, Send } from 'lucide-react';

const AdminNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [typeFilter, readFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getNotifications({
        type: typeFilter === 'all' ? undefined : typeFilter,
        read: readFilter === 'all' ? undefined : readFilter === 'read'
      });
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type) => {
    switch (type) {
      case 'adjacent_seat':
      case 'smartseat':
        return <Badge variant="warning">SmartSeat</Badge>;
      case 'booking':
        return <Badge variant="success">Booking</Badge>;
      case 'recommendation':
      case 'seat_update':
        return <Badge variant="info">Seat Update</Badge>;
      case 'payment':
        return <Badge variant="success">Payment</Badge>;
      case 'delay':
        return <Badge variant="danger">Delay</Badge>;
      case 'system':
        return <Badge variant="default">Contact / System</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Log</h1>
            <p className="text-gray-600">View all sent notifications</p>
          </div>
          <Button variant="primary" icon={Send}>
            Send New Notification
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all',        label: 'All Types' },
                { value: 'system',     label: 'Contact / System' },
                { value: 'booking',    label: 'Booking' },
                { value: 'delay',      label: 'Delay Alert' },
                { value: 'smartseat',  label: 'SmartSeat' },
                { value: 'payment',    label: 'Payment' }
              ]}
              className="md:w-48"
            />
            <Select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'read', label: 'Read' },
                { value: 'unread', label: 'Unread' }
              ]}
              className="md:w-48"
            />
          </div>
        </CardBody>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">From / Recipient</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Subject / Message</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map(notification => (
                  <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{getTypeBadge(notification.type)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {notification.type === 'system' && notification.senderName
                        ? `${notification.senderName} (${notification.senderEmail || notification.recipient})`
                        : notification.recipient}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{notification.message}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(notification.time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full inline-block" />
                      )}
                      <span className="ml-2 text-sm text-gray-600">
                        {notification.read ? 'Read' : 'Unread'}
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

export default AdminNotifications;
