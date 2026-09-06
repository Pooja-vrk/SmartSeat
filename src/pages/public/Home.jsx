// Home page — SmartSeat Premium Smart Mobility Landing Experience
// Created & Designed by V.Pooja

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Calendar,
  Search,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  Armchair,
  Bell,
  Star,
  Zap,
  Award,
  TrendingUp,
  ChevronRight,
  Route,
  Moon,
  Sunset
} from 'lucide-react';

import { busService } from '../../services/busService';
import './Home.css';

// ─────────────────────────────────────────────
// STATIC DATA  (no hard-coded business values)
// ─────────────────────────────────────────────

const WHY_CARDS = [
  {
    step: '01',
    title: 'CHOOSE',
    accent: 'hc-cyan',
    Icon: Armchair,
    description: 'Pick the seat that feels right — window, aisle, front or rear. Your comfort, your call.',
  },
  {
    step: '02',
    title: 'CONNECT',
    accent: 'hc-emerald',
    Icon: Navigation,
    description: 'Stay connected with live journey updates, smart notifications and real-time seat status.',
  },
  {
    step: '03',
    title: 'TRAVEL',
    accent: 'hc-amber',
    Icon: Bus,
    description: 'Turn every trip into a smoother experience with intelligent 3D seat awareness.',
  },
  {
    step: '04',
    title: 'MANAGE',
    accent: 'hc-coral',
    Icon: ShieldCheck,
    description: 'Control your bookings, change seats, download tickets and manage journeys with ease.',
  },
];

const JOURNEY_FLOW = [
  { step: '01', title: 'SEARCH',  desc: 'Find your route and date',          Icon: Search,      color: 'jf-cyan'    },
  { step: '02', title: 'CHOOSE',  desc: 'Select your perfect seat',           Icon: Armchair,    color: 'jf-teal'    },
  { step: '03', title: 'BOOK',    desc: 'Confirm details and payment',        Icon: CheckCircle2, color: 'jf-emerald' },
  { step: '04', title: 'TRAVEL',  desc: 'Enjoy smart journey experience',     Icon: Bus,         color: 'jf-amber'   },
];

const BUS_EXPERIENCES = [
  {
    id: 'seater',
    label: 'SEATER',
    tag: 'Simple • Efficient • Comfortable',
    Icon: Armchair,
    accent: 'be-cyan',
    desc: 'Upright seating, great for short trips. Stay alert and arrive fresh.',
    dot: '#06b6d4',
  },
  {
    id: 'semi',
    label: 'SEMI SLEEPER',
    tag: 'Relax • Recline • Travel',
    Icon: Sunset,
    accent: 'be-teal',
    desc: 'Reclining comfort for mid-range journeys. The sweet spot of bus travel.',
    dot: '#14b8a6',
  },
  {
    id: 'sleeper',
    label: 'SLEEPER',
    tag: 'Rest • Recharge • Arrive Refreshed',
    Icon: Moon,
    accent: 'be-violet',
    desc: 'Full-length berths for overnight travel. Wake up at your destination, refreshed.',
    dot: '#8b5cf6',
  },
];

const STATS = [
  { label: 'AVAILABLE ROUTES',    Icon: Route,      color: 'st-cyan'    },
  { label: 'ACTIVE BUSES',        Icon: Bus,        color: 'st-teal'    },
  { label: 'SMART SEATS',         Icon: Armchair,   color: 'st-emerald' },
  { label: 'TRAVEL EXPERIENCES',  Icon: Star,       color: 'st-amber'   },
];

const SEAT_STATES = [
  { label: 'AVAILABLE',    cls: 'sp-available', desc: 'Ready to book' },
  { label: 'SELECTED',     cls: 'sp-selected',  desc: 'Your choice'   },
  { label: 'BOOKED',       cls: 'sp-booked',    desc: 'Occupied'      },
  { label: 'HELD',         cls: 'sp-held',      desc: 'AI suggested'  },
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const Home = () => {
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '', passengers: 1 });
  const [routes, setRoutes] = useState([]);

  // Fetch real routes for dropdown population
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await busService.getRoutes();
        if (response.success && Array.isArray(response.data)) {
          setRoutes(response.data);
        }
      } catch (err) {
        console.error('Error fetching routes for search dropdowns:', err);
      }
    };
    fetchRoutes();
  }, []);

  // Derive real city lists from API data
  const fromCities = Array.from(
    new Set(routes.map(r => r.source).filter(Boolean))
  ).sort();

  const toCities = searchParams.from
    ? Array.from(
        new Set(
          routes
            .filter(r => r.source === searchParams.from)
            .map(r => r.destination)
            .filter(Boolean)
        )
      ).sort()
    : [];

  // Preserve existing handler logic exactly
  const handleFromChange = (e) => {
    const newFrom = e.target.value;
    const newToCities = newFrom
      ? Array.from(
          new Set(
            routes
              .filter(r => r.source === newFrom)
              .map(r => r.destination)
              .filter(Boolean)
          )
        )
      : [];
    const isToValid = newToCities.includes(searchParams.to);
    setSearchParams(prev => ({ ...prev, from: newFrom, to: isToValid ? prev.to : '' }));
  };

  // Preserve existing search handler exactly — now includes passengers count
  const handleSearch = (e) => {
    e.preventDefault();
    const passengers = Number(searchParams.passengers) || 1;
    window.location.href = `/search?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${encodeURIComponent(searchParams.date)}&passengers=${passengers}`;
  };

  return (
    <div className="ss-home">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="ss-hero" aria-label="Hero">
        {/* ambient glows */}
        <div className="ss-hero__glow ss-hero__glow--cyan"  aria-hidden="true" />
        <div className="ss-hero__glow ss-hero__glow--teal"  aria-hidden="true" />
        <div className="ss-hero__glow ss-hero__glow--emerald" aria-hidden="true" />

        <div className="ss-hero__inner">

          {/* ── LEFT: text ── */}
          <div className="ss-hero__content">
            {/* smart mobility badge */}
            <div className="ss-hero__badge" aria-label="SmartSeat Mobility Experience">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" aria-hidden="true" />
              <span>✦ SMART MOBILITY EXPERIENCE</span>
            </div>

            {/* headline */}
            <h1 className="ss-hero__headline">
              Your Journey.{' '}
              <span className="ss-hero__hl-cyan">Your Seat.</span>{' '}
              <span className="ss-hero__hl-teal">Your SmartWay.</span>
            </h1>

            {/* sub-copy */}
            <div className="ss-hero__sub">
              <p className="ss-hero__sub-bold">
                Search smarter. Choose better. Travel your way.
              </p>
              <p className="ss-hero__sub-body">
                Discover buses, choose the exact seat you want, and manage your entire
                journey through one intelligent travel platform.
              </p>
            </div>

            {/* creator signature */}
            <div className="ss-hero__signature">
              <span className="ss-hero__sig-line" aria-hidden="true" />
              <div className="ss-hero__sig-text">
                <span className="ss-hero__sig-label">Designed &amp; Developed by</span>
                <span className="ss-hero__sig-name">V.Pooja</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="ss-hero__ctas">
              <a
                href="/search"
                className="ss-cta-primary"
                aria-label="Search available buses"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>EXPLORE BUSES</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <Link to="/about" className="ss-cta-ghost">
                <span>Learn More</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: telemetry visual ── */}
          <div className="ss-hero__visual" aria-hidden="true">

            <div className="ss-telemcard">
              {/* header row */}
              <div className="ss-telemcard__header">
                <div className="ss-telemcard__live">
                  <span className="ss-telemcard__live-dot" />
                  <span className="ss-telemcard__live-label">LIVE TELEMETRY</span>
                </div>
                <span className="ss-telemcard__cabin-tag">SMARTSEAT CABIN</span>
              </div>

              {/* route strip */}
              <div className="ss-telemcard__route">
                <div className="ss-telemcard__city">
                  <span className="ss-telemcard__city-dot ss-telemcard__city-dot--cyan" />
                  <span className="ss-telemcard__city-name">DEPARTURE</span>
                </div>
                <div className="ss-telemcard__route-line">
                  <Bus className="w-3.5 h-3.5 ss-telemcard__route-bus" />
                  <div className="ss-telemcard__route-track" />
                </div>
                <div className="ss-telemcard__city">
                  <span className="ss-telemcard__city-dot ss-telemcard__city-dot--teal" />
                  <span className="ss-telemcard__city-name">DESTINATION</span>
                </div>
              </div>

              {/* seat state grid */}
              <div className="ss-telemcard__body">
                <p className="ss-telemcard__body-label">SEAT STATUS OVERVIEW</p>
                <div className="ss-telemcard__seats">
                  {SEAT_STATES.map(s => (
                    <div key={s.label} className={`ss-telemcard__seat ${s.cls}`}>
                      <Armchair className="w-5 h-5" />
                      <span className="ss-telemcard__seat-label">{s.label}</span>
                      <span className="ss-telemcard__seat-desc">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* footer strip */}
              <div className="ss-telemcard__footer">
                <span className="ss-telemcard__footer-item">
                  <span className="ss-telemcard__footer-dot ss-telemcard__footer-dot--cyan" />
                  LIVE SEATS
                </span>
                <span className="ss-telemcard__footer-item">
                  <span className="ss-telemcard__footer-dot ss-telemcard__footer-dot--teal" />
                  SMART BOOKING
                </span>
                <span className="ss-telemcard__footer-item">
                  <span className="ss-telemcard__footer-dot ss-telemcard__footer-dot--emerald" />
                  EASY MANAGE
                </span>
              </div>
            </div>

            {/* floating accent nodes */}
            <div className="ss-hero__float-node ss-hero__float-node--1" />
            <div className="ss-hero__float-node ss-hero__float-node--2" />
            <div className="ss-hero__float-node ss-hero__float-node--3" />
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 2 — JOURNEY SEARCH CARD
      ══════════════════════════════════════════════════════ */}
      <section className="ss-search-section" aria-label="Plan your journey">
        <div className="ss-search-section__inner">

          <div className="ss-search-card">
            {/* card header */}
            <div className="ss-search-card__header">
              <div className="ss-search-card__header-icon">
                <Compass className="w-5 h-5 text-cyan-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="ss-search-card__title">PLAN YOUR JOURNEY</h2>
                <p className="ss-search-card__sub">Find the perfect bus and seat for your route</p>
              </div>
            </div>

            {/* search form — all handlers preserved exactly */}
            <form onSubmit={handleSearch} className="ss-search-form" noValidate>

              {/* FROM */}
              <div className="ss-search-form__field">
                <label className="ss-search-form__label" htmlFor="home-from">
                  FROM
                </label>
                <div className="ss-search-form__input-wrap">
                  <MapPin className="ss-search-form__icon ss-search-form__icon--cyan" aria-hidden="true" />
                  <select
                    id="home-from"
                    className="ss-search-form__select"
                    value={searchParams.from}
                    onChange={handleFromChange}
                    required
                    aria-label="Departure city"
                  >
                    <option value="">Select departure city</option>
                    {fromCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TO */}
              <div className="ss-search-form__field">
                <label className="ss-search-form__label" htmlFor="home-to">
                  TO
                </label>
                <div className="ss-search-form__input-wrap">
                  <MapPin className="ss-search-form__icon ss-search-form__icon--teal" aria-hidden="true" />
                  <select
                    id="home-to"
                    className="ss-search-form__select"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                    disabled={!searchParams.from}
                    required
                    aria-label="Destination city"
                    aria-disabled={!searchParams.from}
                  >
                    <option value="">
                      {!searchParams.from ? 'Select departure city first' : 'Select destination city'}
                    </option>
                    {toCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DATE */}
              <div className="ss-search-form__field">
                <label className="ss-search-form__label" htmlFor="home-date">
                  DATE
                </label>
                <div className="ss-search-form__input-wrap">
                  <Calendar className="ss-search-form__icon ss-search-form__icon--emerald" aria-hidden="true" />
                  <input
                    id="home-date"
                    type="date"
                    className="ss-search-form__select"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                    required
                    aria-label="Travel date"
                  />
                </div>
              </div>

              {/* PASSENGERS */}
              <div className="ss-search-form__field">
                <label className="ss-search-form__label" htmlFor="home-passengers">
                  PASSENGERS
                </label>
                <div className="ss-search-form__input-wrap" style={{ paddingLeft: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      background: '#fff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '0.875rem',
                      overflow: 'hidden',
                      height: '48px',
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease passengers"
                      onClick={() =>
                        setSearchParams(prev => ({
                          ...prev,
                          passengers: Math.max(1, Number(prev.passengers) - 1),
                        }))
                      }
                      style={{
                        width: '44px',
                        height: '100%',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#0891b2',
                        background: 'transparent',
                        border: 'none',
                        cursor: searchParams.passengers <= 1 ? 'not-allowed' : 'pointer',
                        opacity: searchParams.passengers <= 1 ? 0.35 : 1,
                        flexShrink: 0,
                      }}
                      disabled={searchParams.passengers <= 1}
                    >
                      −
                    </button>
                    <span
                      id="home-passengers"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#0f172a',
                        userSelect: 'none',
                      }}
                    >
                      {searchParams.passengers} {searchParams.passengers === 1 ? 'Passenger' : 'Passengers'}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase passengers"
                      onClick={() =>
                        setSearchParams(prev => ({
                          ...prev,
                          passengers: Math.min(6, Number(prev.passengers) + 1),
                        }))
                      }
                      style={{
                        width: '44px',
                        height: '100%',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#0891b2',
                        background: 'transparent',
                        border: 'none',
                        cursor: searchParams.passengers >= 6 ? 'not-allowed' : 'pointer',
                        opacity: searchParams.passengers >= 6 ? 0.35 : 1,
                        flexShrink: 0,
                      }}
                      disabled={searchParams.passengers >= 6}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="ss-search-form__submit-wrap">
                <button type="submit" className="ss-search-form__submit">
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span>SEARCH BUSES</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* quick trust strip */}
            <div className="ss-search-card__trust">
              <div className="ss-trust-pill ss-trust-pill--cyan">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>LIVE AVAILABILITY</span>
              </div>
              <div className="ss-trust-pill ss-trust-pill--teal">
                <Armchair className="w-3.5 h-3.5" aria-hidden="true" />
                <span>REAL-TIME SEATS</span>
              </div>
              <div className="ss-trust-pill ss-trust-pill--emerald">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>SECURE BOOKING</span>
              </div>
              <div className="ss-trust-pill ss-trust-pill--amber">
                <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                <span>SMART ALERTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 3 — BUS TYPE EXPERIENCE
      ══════════════════════════════════════════════════════ */}
      <section className="ss-section ss-bus-exp-section" aria-label="Bus travel experiences">
        <div className="ss-section__inner">
          <div className="ss-section__head">
            <span className="ss-section__eyebrow">TRAVEL YOUR WAY</span>
            <h2 className="ss-section__title">
              Three Experiences.<br />
              <span className="ss-section__title-accent">One Smart Platform.</span>
            </h2>
            <p className="ss-section__desc">
              From quick daytime trips to overnight journeys — SmartSeat covers every
              style of travel.
            </p>
          </div>

          <div className="ss-bus-exp-grid">
            {BUS_EXPERIENCES.map((exp) => {
              const Icon = exp.Icon;
              return (
                <div key={exp.id} className={`ss-bus-exp-card ${exp.accent}`}>
                  <div className="ss-bus-exp-card__icon-wrap">
                    <Icon className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <div className="ss-bus-exp-card__dot" style={{ background: exp.dot }} aria-hidden="true" />
                  <h3 className="ss-bus-exp-card__label">{exp.label}</h3>
                  <p className="ss-bus-exp-card__tag">{exp.tag}</p>
                  <div className="ss-bus-exp-card__divider" aria-hidden="true" />
                  <p className="ss-bus-exp-card__desc">{exp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 4 — WHY SMARTSEAT (TRAVEL DIFFERENTLY)
      ══════════════════════════════════════════════════════ */}
      <section className="ss-section ss-why-section" aria-label="Why SmartSeat">
        <div className="ss-section__inner">
          <div className="ss-section__head">
            <span className="ss-section__eyebrow">WHY SMARTSEAT</span>
            <h2 className="ss-section__title">
              Travel Differently.
            </h2>
            <p className="ss-section__desc">
              Travel isn&apos;t just about getting there.
              It&apos;s about <em>choosing</em> how you get there.
            </p>
          </div>

          <div className="ss-why-grid">
            {WHY_CARDS.map((card) => {
              const Icon = card.Icon;
              return (
                <div key={card.step} className={`ss-why-card ${card.accent}`}>
                  <div className="ss-why-card__meta">
                    <span className="ss-why-card__step">{card.step}</span>
                    <div className="ss-why-card__icon-wrap">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="ss-why-card__title">{card.title}</h3>
                  <p className="ss-why-card__desc">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 5 — SMART JOURNEY FLOW (SEARCH → TRAVEL)
      ══════════════════════════════════════════════════════ */}
      <section className="ss-section ss-flow-section" aria-label="How SmartSeat works">
        <div className="ss-section__inner">
          <div className="ss-section__head">
            <span className="ss-section__eyebrow">SMART WORKFLOW</span>
            <h2 className="ss-section__title">
              Your Journey in Four Steps.
            </h2>
            <p className="ss-section__desc">
              From searching to arriving — everything stays simple and transparent.
            </p>
          </div>

          <div className="ss-flow-grid">
            {JOURNEY_FLOW.map((node, idx) => {
              const Icon = node.Icon;
              return (
                <div key={node.step} className="ss-flow-node-wrap">
                  <div className={`ss-flow-node ${node.color}`}>
                    <div className="ss-flow-node__num">{node.step}</div>
                    <div className="ss-flow-node__icon">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h3 className="ss-flow-node__title">{node.title}</h3>
                    <p className="ss-flow-node__desc">{node.desc}</p>
                  </div>
                  {idx < JOURNEY_FLOW.length - 1 && (
                    <div className="ss-flow-connector" aria-hidden="true">
                      <div className="ss-flow-connector__line" />
                      <ArrowRight className="w-3.5 h-3.5 ss-flow-connector__arrow" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 6 — 3D SEAT PREVIEW TEASER
      ══════════════════════════════════════════════════════ */}
      <section className="ss-seat-section" aria-label="3D seat preview">
        <div className="ss-seat-section__glow" aria-hidden="true" />

        <div className="ss-seat-section__inner">

          {/* text */}
          <div className="ss-seat-section__content">
            <span className="ss-section__eyebrow ss-eyebrow--light">3D SEAT EXPERIENCE</span>
            <h2 className="ss-seat-section__title">
              Don&apos;t Just Book a Bus.{' '}
              <span className="ss-seat-section__title-accent">Choose Your Seat.</span>
            </h2>
            <p className="ss-seat-section__desc">
              Explore a smarter way to travel with our interactive 3D seat-selection.
              See real-time cushion depth, window position, and adjacent seat status
              before you book.
            </p>

            <div className="ss-seat-section__features">
              {[
                { label: 'Window vs Aisle view',   Icon: Compass   },
                { label: 'Adjacent seat awareness', Icon: Bell      },
                { label: 'Real-time availability',  Icon: TrendingUp },
                { label: 'AI seat suggestions',     Icon: Award     },
              ].map(f => {
                const FIcon = f.Icon;
                return (
                  <div key={f.label} className="ss-seat-section__feature">
                    <FIcon className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    <span>{f.label}</span>
                  </div>
                );
              })}
            </div>

            <Link to="/search" className="ss-cta-primary ss-cta-primary--dark">
              <Armchair className="w-4 h-4" aria-hidden="true" />
              <span>EXPLORE SEATS</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* visual seat showcase */}
          <div className="ss-seat-showcase" aria-label="Seat state examples">

            {/* 3D-effect bus cabin mockup */}
            <div className="ss-cabin" aria-label="Bus cabin preview">
              <div className="ss-cabin__header">
                <span className="ss-cabin__label">BUS CABIN</span>
                <span className="ss-cabin__live">● LIVE</span>
              </div>
              <div className="ss-cabin__grid">
                {/* Row 1 */}
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-cabin__aisle" aria-hidden="true" />
                <div className="ss-3d-seat ss-3d-seat--selected" aria-label="Selected seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                {/* Row 2 */}
                <div className="ss-3d-seat ss-3d-seat--booked" aria-label="Booked seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-cabin__aisle" aria-hidden="true" />
                <div className="ss-3d-seat ss-3d-seat--held" aria-label="Held/AI recommended seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-3d-seat ss-3d-seat--booked" aria-label="Booked seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                {/* Row 3 */}
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-cabin__aisle" aria-hidden="true" />
                <div className="ss-3d-seat ss-3d-seat--available" aria-label="Available seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
                <div className="ss-3d-seat ss-3d-seat--selected" aria-label="Selected seat">
                  <div className="ss-3d-seat__backrest" />
                  <div className="ss-3d-seat__cushion" />
                  <div className="ss-3d-seat__left-arm" />
                  <div className="ss-3d-seat__right-arm" />
                </div>
              </div>
              {/* legend */}
              <div className="ss-cabin__legend">
                <span className="ss-cabin__legend-item ss-cabin__legend-item--available">AVAILABLE</span>
                <span className="ss-cabin__legend-item ss-cabin__legend-item--selected">SELECTED</span>
                <span className="ss-cabin__legend-item ss-cabin__legend-item--booked">BOOKED</span>
                <span className="ss-cabin__legend-item ss-cabin__legend-item--held">AI PICK</span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 7 — SMARTSEAT STATISTICS
      ══════════════════════════════════════════════════════ */}
      <section className="ss-stats-section" aria-label="SmartSeat platform statistics">
        <div className="ss-stats-section__inner">
          <div className="ss-stats-section__head">
            <span className="ss-section__eyebrow">PLATFORM OVERVIEW</span>
            <h2 className="ss-section__title ss-section__title--sm">
              Built for Real Travel.
            </h2>
          </div>
          <div className="ss-stats-grid">
            {STATS.map((s) => {
              const Icon = s.Icon;
              return (
                <div key={s.label} className={`ss-stat-card ${s.color}`}>
                  <div className="ss-stat-card__icon">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="ss-stat-card__label">{s.label}</div>
                  <div className="ss-stat-card__sub">Live on SmartSeat</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 8 — CREATOR SIGNATURE
      ══════════════════════════════════════════════════════ */}
      <section className="ss-creator-section" aria-label="Creator identity">
        <div className="ss-creator-section__glow" aria-hidden="true" />
        <div className="ss-creator-section__inner">

          <div className="ss-creator-card">
            <div className="ss-creator-card__top-line" aria-hidden="true" />

            <div className="ss-creator-card__eyebrow">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>A SMARTER WAY TO TRAVEL</span>
            </div>

            <blockquote className="ss-creator-card__quote">
              &ldquo;Built with curiosity,<br />designed for better journeys.&rdquo;
            </blockquote>

            <div className="ss-creator-card__divider" aria-hidden="true" />

            <div className="ss-creator-card__identity">
              <div className="ss-creator-card__brand">
                <Bus className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                <span className="ss-creator-card__brand-name">SMARTSEAT</span>
              </div>
              <div className="ss-creator-card__byline">
                <span className="ss-creator-card__byline-label">Created &amp; Designed by</span>
                <span className="ss-creator-card__byline-name">V.Pooja</span>
              </div>
            </div>

            <p className="ss-creator-card__tagline">
              Smart Mobility &bull; Intelligent Travel &bull; Better Seating
            </p>
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 9 — FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="ss-cta-section" aria-label="Final call to action">
        <div className="ss-cta-section__glow-left"  aria-hidden="true" />
        <div className="ss-cta-section__glow-right" aria-hidden="true" />

        <div className="ss-cta-section__inner">
          <Sparkles className="ss-cta-section__sparkle" aria-hidden="true" />

          <h2 className="ss-cta-section__headline">
            Ready for Your<br />
            <span className="ss-cta-section__hl-accent">Next Journey?</span>
          </h2>

          <div className="ss-cta-section__steps">
            <span>Choose your route.</span>
            <span className="ss-cta-section__step-dot" aria-hidden="true" />
            <span>Choose your comfort.</span>
            <span className="ss-cta-section__step-dot" aria-hidden="true" />
            <span>Choose your seat.</span>
          </div>

          <a href="/search" className="ss-cta-section__btn" aria-label="Explore available buses">
            <Compass className="w-5 h-5" aria-hidden="true" />
            <span>EXPLORE BUSES</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>

          <div className="ss-cta-section__sig">
            <span className="ss-cta-section__sig-brand">SMARTSEAT</span>
            <span className="ss-cta-section__sig-sep" aria-hidden="true" />
            <span className="ss-cta-section__sig-by">by V.Pooja</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
