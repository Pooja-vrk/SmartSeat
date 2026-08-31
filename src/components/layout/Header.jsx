// Header component - SmartSeat Premium Mobility Navbar

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Bell, LogOut, Settings,
  ChevronDown, Bus, Sparkles, MapPin,
  BookOpen, LayoutDashboard, UserCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './NavbarFooter.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isPassenger } = useAuth();
  const { unreadCount } = useNotification();

  const navLinks = [
    { name: 'Home',         path: '/' },
    { name: 'Search Buses', path: '/search' },
    { name: 'About',        path: '/about' },
    { name: 'Contact',      path: '/contact' },
  ];

  const passengerLinks = [
    { name: 'Dashboard',     path: '/dashboard',    icon: LayoutDashboard },
    { name: 'My Bookings',   path: '/my-bookings',  icon: BookOpen },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile',       path: '/profile',       icon: UserCircle2 },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin' },
    { name: 'Buses',           path: '/admin/buses' },
    { name: 'Bookings',        path: '/admin/bookings' },
    { name: 'Passengers',      path: '/admin/passengers' },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path ||
      (path !== '/' && location.pathname.startsWith(path + '/'));
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
  };

  return (
    <header className="ss-navbar">

      {/* ── animated top-bar gradient ── */}
      <div className="ss-navbar__topline" aria-hidden="true" />

      <div className="ss-navbar__inner">

        {/* ══════════════════════════════════════════
            BRAND LOGO + TAGLINE
        ══════════════════════════════════════════ */}
        <Link to="/" className="ss-navbar__brand" aria-label="SmartSeat — Home">
          {/* icon */}
          <div className="ss-navbar__brand-icon">
            <Bus className="w-5 h-5" />
            <Sparkles className="w-3 h-3 ss-navbar__brand-spark" aria-hidden="true" />
          </div>
          {/* wordmark */}
          <div className="ss-navbar__brand-text">
            <span className="ss-navbar__brand-name">
              SMART<span className="ss-navbar__brand-accent">SEAT</span>
            </span>
            <span className="ss-navbar__brand-tagline">Smart Mobility</span>
          </div>
        </Link>

        {/* ══════════════════════════════════════════
            DESKTOP NAV LINKS
        ══════════════════════════════════════════ */}
        <nav className="ss-navbar__nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`ss-nav-link ${isActiveLink(link.path) ? 'ss-nav-link--active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {isPassenger() && passengerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`ss-nav-link ${isActiveLink(link.path) ? 'ss-nav-link--active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin() && adminLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`ss-nav-link ${isActiveLink(link.path) ? 'ss-nav-link--active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* ══════════════════════════════════════════
            RIGHT ACTIONS — authenticated
        ══════════════════════════════════════════ */}
        <div className="ss-navbar__actions">
          {isAuthenticated ? (
            <>
              {/* ── notification bell ── */}
              <div className="ss-navbar__bell-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationDropdown(!notificationDropdown);
                    setUserDropdown(false);
                  }}
                  className="ss-navbar__bell-btn"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  aria-expanded={notificationDropdown}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <>
                      <span className="ss-navbar__bell-ping" aria-hidden="true" />
                      <span className="ss-navbar__bell-badge" aria-live="polite">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </>
                  )}
                </button>

                {notificationDropdown && (
                  <div className="ss-dropdown" role="menu" aria-label="Notifications panel">
                    <div className="ss-dropdown__header">
                      <span className="ss-dropdown__header-title">NOTIFICATIONS</span>
                      <span className="ss-dropdown__header-badge">{unreadCount} UNREAD</span>
                    </div>
                    <div className="ss-dropdown__body">
                      {unreadCount > 0 ? (
                        <Link
                          to="/notifications"
                          className="ss-dropdown__link"
                          onClick={() => setNotificationDropdown(false)}
                        >
                          View {unreadCount} notification{unreadCount > 1 ? 's' : ''} →
                        </Link>
                      ) : (
                        <span className="ss-dropdown__empty">No new notifications</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── user profile pill ── */}
              <div className="ss-navbar__user-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdown(!userDropdown);
                    setNotificationDropdown(false);
                  }}
                  className="ss-navbar__user-pill"
                  aria-expanded={userDropdown}
                  aria-label="User account menu"
                >
                  {/* avatar */}
                  <div className="ss-navbar__avatar">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  {/* identity */}
                  <div className="ss-navbar__user-identity">
                    <span className="ss-navbar__user-name">{user?.name}</span>
                    <span className="ss-navbar__user-role">
                      {isAdmin() ? 'ADMIN' : 'PASSENGER'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>

                {userDropdown && (
                  <div className="ss-dropdown ss-dropdown--user" role="menu">
                    <div className="ss-dropdown__header">
                      <span className="ss-dropdown__header-label">LOGGED IN AS</span>
                      <span className="ss-dropdown__header-email">
                        {user?.email || user?.name}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="ss-dropdown__item"
                      onClick={() => setUserDropdown(false)}
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-cyan-400" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="ss-dropdown__item ss-dropdown__item--danger"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── V.Pooja creator pill (desktop) ── */}
              <div className="ss-navbar__creator-pill" aria-label="Created by V.Pooja">
                <span className="ss-navbar__creator-dot" aria-hidden="true" />
                <div className="ss-navbar__creator-text">
                  <span className="ss-navbar__creator-name">V.Pooja</span>
                  <span className="ss-navbar__creator-sub">Smart Travel</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="ss-btn ss-btn--ghost">
                Login
              </Link>
              <Link to="/register" className="ss-btn ss-btn--primary">
                ✦ Register
              </Link>

              {/* ── V.Pooja creator pill (desktop, unauthenticated) ── */}
              <div className="ss-navbar__creator-pill" aria-label="Created by V.Pooja">
                <span className="ss-navbar__creator-dot" aria-hidden="true" />
                <div className="ss-navbar__creator-text">
                  <span className="ss-navbar__creator-name">V.Pooja</span>
                  <span className="ss-navbar__creator-sub">Smart Travel</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════
            MOBILE HAMBURGER
        ══════════════════════════════════════════ */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ss-navbar__hamburger"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen
            ? <X className="w-6 h-6" />
            : <Menu className="w-6 h-6" />
          }
        </button>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="ss-mobile-drawer" role="navigation" aria-label="Mobile navigation">

          {/* brand row in drawer */}
          <div className="ss-mobile-drawer__brand">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              SMARTSEAT
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest">
              by V.Pooja
            </span>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`ss-mobile-link ${isActiveLink(link.path) ? 'ss-mobile-link--active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {isPassenger() && passengerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`ss-mobile-link ${isActiveLink(link.path) ? 'ss-mobile-link--active' : ''}`}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span>{link.name}</span>
                {link.path === '/notifications' && unreadCount > 0 && (
                  <span className="ss-mobile-link__badge">{unreadCount}</span>
                )}
              </Link>
            );
          })}

          {isAdmin() && adminLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`ss-mobile-link ${isActiveLink(link.path) ? 'ss-mobile-link--active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {/* auth actions */}
          {isAuthenticated ? (
            <div className="ss-mobile-drawer__auth">
              <div className="ss-mobile-drawer__user">
                <div className="ss-navbar__avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
                <div>
                  <p className="text-xs font-bold text-white">{user?.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    {isAdmin() ? 'ADMIN' : 'PASSENGER'}
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="ss-mobile-link"
              >
                <Settings className="w-4 h-4" /> Profile Settings
              </Link>
              <button
                type="button"
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="ss-mobile-link ss-mobile-link--danger"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="ss-mobile-drawer__auth">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="ss-btn ss-btn--ghost w-full text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="ss-btn ss-btn--primary w-full text-center"
              >
                ✦ Register
              </Link>
            </div>
          )}

          {/* creator identity in mobile */}
          <div className="ss-mobile-drawer__creator">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-400">Created by</span>
            <span className="text-[11px] font-black text-cyan-300">V.Pooja</span>
          </div>

        </div>
      )}
    </header>
  );
};

export default Header;
