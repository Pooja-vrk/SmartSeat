// Footer component — SmartSeat Premium Multi-Column Footer
// Created & Designed by V.Pooja

import { Link } from 'react-router-dom';
import {
  Bus,
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  Armchair,
  BookOpen,
  Bell,
  HelpCircle,
  FileText,
  Lock,
  XCircle,
  Phone,
  Share2,
  Zap
} from 'lucide-react';
import Logo from './Logo';
import './NavbarFooter.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ss-footer" aria-label="Site footer">

      <div className="ss-footer__inner">

        {/* ══════════════════════════════════════════════════════
            BRAND HERO CARD
        ══════════════════════════════════════════════════════ */}
        <div className="ss-footer__brand-card">
          <div className="ss-footer__brand-card-inner">

            <div>
              <Logo size="lg" />

              <h2 className="ss-footer__brand-headline">
                Your Journey.{' '}
                <span className="fc-cyan">Your Seat.</span>{' '}
                <span className="fc-teal">Your SmartWay.</span>
              </h2>

              <p className="ss-footer__brand-sub">
                Travel smarter, choose better, and make every journey yours
                with intelligent 3D seat selection and real-time journey management.
              </p>
            </div>

            <Link to="/search" className="ss-footer__brand-cta" aria-label="Find your bus">
              <span>FIND YOUR BUS</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

          </div>

          {/* decorative route strip */}
          <div className="ss-footer__route-strip" aria-hidden="true">
            <div className="ss-footer__route-node">
              <span className="ss-footer__route-dot" style={{ background: '#22d3ee' }} />
              <span>BANGALORE</span>
            </div>
            <div className="ss-footer__route-line" />
            <div className="ss-footer__route-node">
              <span className="ss-footer__route-dot" style={{ background: '#2dd4bf' }} />
              <span>CHENNAI</span>
            </div>
            <div className="ss-footer__route-line" />
            <div className="ss-footer__route-node">
              <span className="ss-footer__route-dot" style={{ background: '#34d399' }} />
              <span>KOCHI</span>
            </div>
            <div className="ss-footer__route-line" />
            <div className="ss-footer__route-node">
              <span className="ss-footer__route-dot" style={{ background: '#a78bfa' }} />
              <span>HYDERABAD</span>
            </div>
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════
            FOUR-COLUMN NAVIGATION GRID
        ══════════════════════════════════════════════════════ */}
        <div className="ss-footer__columns">

          {/* ── Column 1: SMARTSEAT ── */}
          <div>
            <h3 className="ss-footer__col-heading">
              <Compass className="w-4 h-4" aria-hidden="true" />
              SMARTSEAT
            </h3>
            <p className="ss-footer__col-text">
              Smart mobility for smarter journeys. Experience the future of bus
              travel with 3D seat awareness, real-time alerts, and effortless
              booking management.
            </p>
            <div className="ss-footer__socials" aria-label="Social links">
              <a
                href="#"
                className="ss-footer__social-btn"
                aria-label="Share SmartSeat"
                onClick={(e) => e.preventDefault()}
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </a>
              <Link to="/search" className="ss-footer__social-btn" aria-label="Search buses">
                <Compass className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/notifications" className="ss-footer__social-btn" aria-label="Notifications">
                <Bell className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>


          {/* ── Column 2: EXPLORE ── */}
          <div>
            <h3 className="ss-footer__col-heading">
              EXPLORE
            </h3>
            <ul className="flex flex-col gap-1.5" role="list">
              <li>
                <Link to="/" className="ss-footer-link">
                  <Bus className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="ss-footer-link">
                  <Compass className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Search Buses
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="ss-footer-link">
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="ss-footer-link">
                  <Bell className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Notifications
                </Link>
              </li>
              <li>
                <Link to="/about" className="ss-footer-link">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  About SmartSeat
                </Link>
              </li>
            </ul>
          </div>


          {/* ── Column 3: SUPPORT ── */}
          <div>
            <h3 className="ss-footer__col-heading">
              SUPPORT
            </h3>
            <ul className="flex flex-col gap-1.5" role="list">
              <li>
                <Link to="/contact" className="ss-footer-link">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/help" className="ss-footer-link">
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Help &amp; FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="ss-footer-link">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="ss-footer-link">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="ss-footer-link">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-50" aria-hidden="true" />
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>


          {/* ── Column 4: CREATOR — V.Pooja ── */}
          <div>
            <h3 className="ss-footer__col-heading">
              CREATOR
            </h3>

            <div className="ss-footer__creator-card">
              <div className="ss-footer__creator-badge">
                <Zap className="w-3 h-3" aria-hidden="true" />
                <span>DESIGNED BY</span>
              </div>

              <div className="ss-footer__creator-name" aria-label="Created by V.Pooja">
                <span>V.Pooja</span>
              </div>

              <p className="ss-footer__creator-desc">
                Created &amp; Designed for a Smart Mobility Experience.
                Built with curiosity, crafted for better journeys.
              </p>

              <div className="ss-footer__creator-tag">
                Smart Mobility Experience
              </div>
            </div>

          </div>

        </div>


        {/* ══════════════════════════════════════════════════════
            TRUST STRIP
        ══════════════════════════════════════════════════════ */}
        <div className="ss-footer__trust" aria-label="Platform features">
          <div className="ss-footer__trust-item">
            <Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            SMART BOOKING
          </div>
          <div className="ss-footer__trust-item">
            <Armchair className="w-4 h-4 text-teal-400" aria-hidden="true" />
            REAL-TIME SEATS
          </div>
          <div className="ss-footer__trust-item">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            SECURE JOURNEYS
          </div>
          <div className="ss-footer__trust-item">
            <Bell className="w-4 h-4 text-amber-400" aria-hidden="true" />
            LIVE ALERTS
          </div>
          <div className="ss-footer__trust-item">
            <Compass className="w-4 h-4 text-sky-400" aria-hidden="true" />
            EASY MANAGEMENT
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════
            BOTTOM BAR
        ══════════════════════════════════════════════════════ */}
        <div className="ss-footer__bottom">
          <p className="ss-footer__bottom-copyright">
            &copy; {currentYear} SmartSeat. All rights reserved.
          </p>

          <div className="ss-footer__bottom-credit">
            <span>Created &amp; Designed by</span>
            <strong>V.Pooja</strong>
            <span className="ss-footer__bottom-tag" aria-hidden="true">✦</span>
          </div>

          <p className="ss-footer__bottom-tag">
            SMART MOBILITY &bull; BETTER JOURNEYS
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
