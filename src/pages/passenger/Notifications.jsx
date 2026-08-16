// Notifications page
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Select } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Check,
  Filter,
  Trash2
} from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getFilteredNotifications 
  } = useNotification();
  
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  const filteredNotifications = getFilteredNotifications(
    filter === 'all' ? null : filter
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'adjacent_seat':
        return AlertTriangle;
      case 'booking':
        return CheckCircle;
      case 'recommendation':
        return Info;
      case 'payment':
        return CheckCircle;
      case 'seat_update':
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'adjacent_seat':
        return 'text-yellow-600 bg-yellow-100';
      case 'booking':
        return 'text-green-600 bg-green-100';
      case 'recommendation':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'seat_update':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (notificationId) => {
    if (window.confirm('Delete this notification?')) {
      deleteNotification(notificationId);
    }
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.size === 0) return;
    
    if (window.confirm(`Delete ${selectedNotifications.size} selected notifications?`)) {
      selectedNotifications.forEach(id => deleteNotification(id));
      setSelectedNotifications(new Set());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                icon={Check}
              >
                Mark All Read
              </Button>
            )}
            {selectedNotifications.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
                icon={Trash2}
              >
                Delete Selected ({selectedNotifications.size})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {['all', 'SmartSeat', 'Booking', 'Payment', 'System'].map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p>
                {filter === 'all' 
                  ? 'You have no notifications' 
                  : `No ${filter} notifications`}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(notification => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <Card 
                key={notification.id} 
                className={`transition-all ${
                  !notification.read ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
                }`}
              >
                <CardBody>
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 rounded text-primary-600"
                    />

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary-600 rounded-full" />
                          )}
                          <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                      {notification.category && (
                        <Badge variant="info" className="text-xs">
                          {notification.category}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          icon={Check}
                          className="text-gray-500 hover:text-gray-700"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        icon={X}
                        className="text-gray-500 hover:text-red-600"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
