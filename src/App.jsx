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
import BrandIcon from './components/layout/BrandIcon';
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
      <div className="min-h-screen flex items-center justify-center bg-[#050B1D] text-slate-100">
        <div className="text-center flex flex-col items-center">
          <div className="relative mb-5">
            <BrandIcon className="w-16 h-16 animate-pulse" />
            <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl -z-10 animate-ping opacity-30" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            SMART<span className="text-cyan-400">SEAT</span>
          </h2>

          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">
            BOOK · TRACK · TRAVEL
          </p>

          {/* Minimal futuristic glowing progress bar */}
          <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 rounded-full animate-pulse" />
          </div>
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