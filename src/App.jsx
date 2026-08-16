// Main App component with routing and providers
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';
import { SmartSeatProvider } from './context/SmartSeatContext';
import Layout from './components/layout/Layout';
import { allRoutes } from './routes';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Routes component
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SmartSeat...</p>
        </div>
      </div>
    );
  }

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

// Main App component
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
