// Passenger dashboard - SmartSeat Mobility Control Panel

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingService } from '../../services/bookingService';
import { 
  Bus, 
  Calendar, 
  MapPin, 
  Clock, 
  Bell,
  Armchair,
  TrendingUp,
  Shield,
  Search,
  User,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

import './PassengerPages.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { unreadCount, loadNotifications } = useNotification();
  const [loading, setLoading] = useState(true);
  const [upcomingTrip, setUpcomingTrip] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    smartSeatEnabled: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load upcoming bookings
      const upcomingResponse = await bookingService.getUpcomingBookings();
      if (upcomingResponse.success) {
        setUpcomingTrip(upcomingResponse.data[0] || null);
        setRecentBookings(upcomingResponse.data.slice(0, 3));
      }

      // Load all bookings for stats
      const allBookingsResponse = await bookingService.getBookings();
      if (allBookingsResponse.success) {
        const bookings = allBookingsResponse.data;
        const now = new Date();
        setStats({
          totalBookings: bookings.length,
          upcomingTrips: bookings.filter(b => b.scheduleId?.departure && new Date(b.scheduleId.departure) > now).length,
          smartSeatEnabled: bookings.filter(b => b.smartSeatMonitoring).length
        });
      }

      // Load notifications
      loadNotifications();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (loading) {
    return (
      <div className="passenger-page-container min-h-screen py-8 px-4 flex items-center justify-center">
        <Loading size="lg" text="Loading dashboard telemetry..." />
      </div>
    );
  }

  return (
    <div className="passenger-page-container min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* WELCOME HEADER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 text-white border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SMARTSEAT PASSENGER CONTROL</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Welcome back, <span className="text-cyan-400">{user?.name}!</span>
            </h1>
            <p className="text-xs text-slate-400">Here's what's happening with your travel telemetry</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/search">
              <Button variant="primary" className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20">
                ✦ Book New Trip
              </Button>
            </Link>
          </div>
        </div>

        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stats-card-3d">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Bookings</p>
                <p className="text-3xl font-black text-slate-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl stats-icon-cyan flex items-center justify-center">
                <Bus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card-3d">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Upcoming Trips</p>
                <p className="text-3xl font-black text-slate-900">{stats.upcomingTrips}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl stats-icon-green flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card-3d">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SmartSeat Active</p>
                <p className="text-3xl font-black text-slate-900">{stats.smartSeatEnabled}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl stats-icon-teal flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* UPCOMING TRIP CARD */}
            {upcomingTrip ? (
              <div className="upcoming-trip-card p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">UPCOMING TRIP</h3>
                  </div>
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-bold">
                    Confirmed
                  </Badge>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-mono font-bold text-cyan-600 mb-0.5">{upcomingTrip.busId?.operatorName || 'Bus Operator'}</p>
                    <p className="text-xl font-black text-slate-900">
                      {upcomingTrip.routeId?.source || 'N/A'} <span className="text-cyan-500 font-normal">→</span> {upcomingTrip.routeId?.destination || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-200">
                    <p className="text-[10px] text-cyan-700 font-bold uppercase">SEAT</p>
                    <p className="text-lg font-black text-cyan-800">{upcomingTrip.seatNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">Departure</p>
                    </div>
                    {upcomingTrip.scheduleId?.departure ? (
                      <>
                        <p className="font-bold text-xs text-emerald-950">{formatDateTime(upcomingTrip.scheduleId.departure).date}</p>
                        <p className="text-xs text-emerald-800">{formatDateTime(upcomingTrip.scheduleId.departure).time}</p>
                      </>
                    ) : (
                      <p className="text-xs text-emerald-800">N/A</p>
                    )}
                  </div>
                  
                  <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4 text-sky-600" />
                      <p className="text-[10px] font-bold text-sky-700 uppercase">Boarding Point</p>
                    </div>
                    <p className="font-bold text-xs text-sky-950 truncate">{upcomingTrip.busId?.boardingPoints?.[0] || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                    <Shield className="w-4 h-4 text-cyan-600" />
                    <span>SmartSeat Monitoring: <strong className="text-slate-900">{upcomingTrip.smartSeatMonitoring ? 'Active' : 'Off'}</strong></span>
                  </div>
                  <Link to={`/booking/${upcomingTrip._id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      View Details →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
                <Bus className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">No upcoming trips</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Book your next journey with 3D seat telemetry.</p>
                <Link to="/search">
                  <Button variant="primary" size="sm" icon={Search} className="bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
                    Search Buses
                  </Button>
                </Link>
              </div>
            )}

            {/* RECENT BOOKINGS FEED */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Bookings</h3>
                <Link to="/my-bookings">
                  <Button variant="ghost" size="sm" className="text-xs text-cyan-600 hover:text-cyan-700 font-bold">
                    View All →
                  </Button>
                </Link>
              </div>

              {recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map(booking => (
                    <div key={booking._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm text-slate-900">
                            {booking.routeId?.source || 'N/A'} <span className="text-cyan-500 font-normal">→</span> {booking.routeId?.destination || 'N/A'}
                          </p>
                          <p className="text-xs font-medium text-slate-500">{booking.busId?.operatorName || 'Bus Operator'}</p>
                        </div>
                        <Badge variant={booking.bookingStatus === 'confirmed' ? 'success' : 'default'} className="text-[10px] uppercase font-bold">
                          {booking.bookingStatus || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">
                          {booking.scheduleId?.departure ? formatDateTime(booking.scheduleId.departure).date : 'N/A'}
                        </span>
                        <span className="font-bold text-cyan-700 font-mono">Seat {booking.seatNumber || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No recent bookings recorded.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            
            {/* QUICK ACTIONS CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Quick Actions</h3>
              <div className="space-y-2.5">
                <Link to="/search" className="block">
                  <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider text-slate-700 justify-start" icon={Search}>
                    Search Buses
                  </Button>
                </Link>
                <Link to="/my-bookings" className="block">
                  <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider text-slate-700 justify-start" icon={Bus}>
                    My Bookings
                  </Button>
                </Link>
                <Link to="/notifications" className="block">
                  <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider text-slate-700 justify-between" icon={Bell}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider text-slate-700 justify-start" icon={User}>
                    Profile Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* NOTIFICATIONS PREVIEW */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="danger" className="text-[10px] font-bold">{unreadCount} UNREAD</Badge>
                )}
              </div>
              <Link to="/notifications">
                <Button variant="primary" className="w-full bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider" icon={Bell}>
                  Open Notification Center
                </Button>
              </Link>
            </div>

            {/* SMARTSEAT TELEMETRY STATUS */}
            <div className="bg-gradient-to-br from-cyan-950 to-slate-950 text-white p-6 rounded-3xl border border-cyan-500/30 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Shield className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-wider">SMARTSEAT TELEMETRY</h3>
              </div>
              <p className="text-xs text-slate-300">
                {stats.smartSeatEnabled > 0 
                  ? `Active monitoring enabled on ${stats.smartSeatEnabled} booking(s)`
                  : 'Monitoring currently inactive'
                }
              </p>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="w-full bg-slate-900 text-cyan-300 border-cyan-500/40 text-xs font-bold uppercase tracking-wider">
                  Configure Settings
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
