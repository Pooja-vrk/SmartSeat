// Main routing configuration
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public pages
import Home from '../pages/public/Home';
import Search from '../pages/public/Search';
import BusDetails from '../pages/public/BusDetails';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Help from '../pages/public/Help';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Passenger pages
import Dashboard from '../pages/passenger/Dashboard';
import MyBookings from '../pages/passenger/MyBookings';
import Notifications from '../pages/passenger/Notifications';
import Profile from '../pages/passenger/Profile';
import BookingFlow from '../pages/passenger/BookingFlow';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminBuses from '../pages/admin/AdminBuses';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminPassengers from '../pages/admin/AdminPassengers';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSettings from '../pages/admin/AdminSettings';

// Error pages
import NotFound from '../pages/error/NotFound';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route configurations
export const publicRoutes = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/search',
    element: <Search />
  },
  {
    path: '/bus/:id',
    element: <BusDetails />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/contact',
    element: <Contact />
  },
  {
    path: '/help',
    element: <Help />
  }
];

export const authRoutes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  }
];

export const passengerRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/my-bookings',
    element: (
      <ProtectedRoute>
        <MyBookings />
      </ProtectedRoute>
    )
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/preferences',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/booking/:busId/:scheduleId/seats',
    element: (
      <ProtectedRoute>
        <BookingFlow />
      </ProtectedRoute>
    )
  },
  {
    path: '/booking/:busId/:scheduleId',
    element: (
      <ProtectedRoute>
        <BookingFlow />
      </ProtectedRoute>
    )
  },
  {
    path: '/booking/:id/seats',
    element: (
      <ProtectedRoute>
        <BookingFlow />
      </ProtectedRoute>
    )
  },
  {
    path: '/booking/:id',
    element: (
      <ProtectedRoute>
        <BookingFlow />
      </ProtectedRoute>
    )
  },
  {
    path: '/ticket/:id',
    element: (
      <ProtectedRoute>
        <BookingFlow />
      </ProtectedRoute>
    )
  }
];

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/buses',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminBuses />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/buses/add',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminBuses />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/bookings',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminBookings />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/passengers',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminPassengers />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/notifications',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminNotifications />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminAnalytics />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminSettings />
      </ProtectedRoute>
    )
  }
];

export const errorRoutes = [
  {
    path: '/404',
    element: <NotFound />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

// Combine all routes
export const allRoutes = [
  ...publicRoutes,
  ...authRoutes,
  ...passengerRoutes,
  ...adminRoutes,
  ...errorRoutes
];
