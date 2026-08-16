// Header component with navigation
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common';
import Logo from './Logo';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isPassenger } = useAuth();
  const { unreadCount } = useNotification();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Search Buses', path: '/search' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const passengerLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Bookings', path: '/my-bookings' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Profile', path: '/profile' },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin' },
    { name: 'Buses', path: '/admin/buses' },
    { name: 'Bookings', path: '/admin/bookings' },
    { name: 'Passengers', path: '/admin/passengers' },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink(link.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isPassenger() && (
              <>
                {passengerLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink(link.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}

            {isAdmin() && (
              <>
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink(link.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationDropdown(!notificationDropdown)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>

                  {notificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="px-4 py-2 text-sm text-gray-500">
                        {unreadCount > 0 ? (
                          <Link to="/notifications" className="text-primary-600 hover:underline">
                            View {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                          </Link>
                        ) : (
                          <span>No new notifications</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserDropdown(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveLink(link.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {isPassenger() && (
                <>
                  {passengerLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActiveLink(link.path)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}

              {isAdmin() && (
                <>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActiveLink(link.path)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4 pt-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
