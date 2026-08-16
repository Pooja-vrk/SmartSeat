// Notification Context for managing notification state
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
      
      // Subscribe to real-time notifications
      socketService.subscribeToNotifications((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    
    return () => {
      if (user) {
        socketService.unsubscribe('notification:new');
      }
    };
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [user]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await notificationService.markNotificationRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await notificationService.markAllNotificationsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        const notification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const getFilteredNotifications = useCallback((category) => {
    if (!category) return notifications;
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getFilteredNotifications
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
