// Main App component with routing and providers

import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';
import { SmartSeatProvider } from './context/SmartSeatContext';

import Layout from './components/layout/Layout';
import { allRoutes } from './routes';


// ============================================================
// Scroll to top on route change
// ============================================================

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};


// ============================================================
// Routes component
// ============================================================

const AppRoutes = () => {
  const { loading } = useAuth();
  const location = useLocation();

  // Authentication pages have their own standalone layouts
  // and their own navbar/header.
  const authPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ];

  const isAuthPage = authPaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
  );


  // ==========================================================
  // Authentication loading
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">

          <div
            className="
              w-12 h-12
              border-4
              border-primary-600
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
              mb-4
            "
          />

          <p className="text-gray-600">
            Loading SmartSeat...
          </p>

        </div>
      </div>
    );
  }


  // ==========================================================
  // AUTH ROUTES
  //
  // Login/Register/etc. already contain their own headers.
  // Therefore DO NOT wrap them inside Layout.
  // ==========================================================

  if (isAuthPage) {
    return (
      <Routes>
        {allRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    );
  }


  // ==========================================================
  // NORMAL ROUTES
  //
  // Keep the existing Layout for every normal page.
  // ==========================================================

  return (
    <Layout>
      <Routes>
        {allRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </Layout>
  );
};


// ============================================================
// Main App component
// ============================================================

const App = () => {
  return (
    <Router>

      <ScrollToTop />

      <AuthProvider>
        <BookingProvider>
          <NotificationProvider>
            <SmartSeatProvider>

              <AppRoutes />

            </SmartSeatProvider>
          </NotificationProvider>
        </BookingProvider>
      </AuthProvider>

    </Router>
  );
};


export default App;