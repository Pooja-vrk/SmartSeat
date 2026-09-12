// SmartSeat Intelligent Mobility Notification Center

import { useState, useMemo } from 'react';
import { Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Check,
  Filter,
  Trash2,
  Clock,
  Sparkles,
  Ticket,
  User,
  ShieldCheck,
  CreditCard,
  Search,
  CheckCheck,
  Compass,
  ArrowRight,
  ShieldAlert,
  Inbox
} from 'lucide-react';

import '../../components/notification/NotificationCenter.css';

const Notifications = () => {
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getFilteredNotifications
  } = useNotification();

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // ==========================================================
  // FILTER & SEARCH LOGIC
  // ==========================================================

  const filteredNotifications = useMemo(() => {
    let list = notifications;

    if (filter === 'unread') {
      list = list.filter((n) => !n.read);
    } else if (filter !== 'all') {
      list = getFilteredNotifications(filter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      list = list.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(term)) ||
          (n.message && n.message.toLowerCase().includes(term)) ||
          (n.category && n.category.toLowerCase().includes(term))
      );
    }

    return list;
  }, [notifications, filter, searchTerm, getFilteredNotifications]);

  // ==========================================================
  // METRICS & STATISTICS
  // ==========================================================

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = unreadCount;

    const bookings = notifications.filter(
      (n) =>
        n.type === 'booking' ||
        (n.category && n.category.toLowerCase() === 'booking')
    ).length;

    const smartSeat = notifications.filter(
      (n) =>
        n.type === 'smartseat' ||
        n.type === 'adjacent_seat' ||
        (n.category && n.category.toLowerCase() === 'smartseat')
    ).length;

    return {
      total,
      unread,
      bookings,
      smartSeat
    };
  }, [notifications, unreadCount]);

  // ==========================================================
  // DATE GROUPING HELPER
  // ==========================================================

  const timelineGroups = useMemo(() => {
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const groups = {
      TODAY: [],
      YESTERDAY: [],
      EARLIER: []
    };

    filteredNotifications.forEach((n) => {
      const date = new Date(n.createdAt || Date.now());

      if (isSameDay(date, today)) {
        groups.TODAY.push(n);
      } else if (isSameDay(date, yesterday)) {
        groups.YESTERDAY.push(n);
      } else {
        groups.EARLIER.push(n);
      }
    });

    return groups;
  }, [filteredNotifications]);

  // ==========================================================
  // NOTIFICATION TYPE CONFIG
  // ==========================================================

  const getTypeConfig = (type, category) => {
    const lowerType = String(type || category || '').toLowerCase();

    if (lowerType.includes('booking')) {
      return {
        icon: Ticket,
        badgeBg:
          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        railClass: 'rail-booking',
        nodeColor: '#10b981',
        label: 'BOOKING CONFIRMED'
      };
    }

    if (
      lowerType.includes('smartseat') ||
      lowerType.includes('adjacent')
    ) {
      return {
        icon: Compass,
        badgeBg:
          'bg-sky-500/20 text-sky-300 border-sky-500/40',
        railClass: 'rail-smartseat',
        nodeColor: '#38bdf8',
        label: 'SMARTSEAT ALERT'
      };
    }

    if (lowerType.includes('payment')) {
      return {
        icon: CreditCard,
        badgeBg:
          'bg-lime-500/20 text-lime-300 border-lime-500/40',
        railClass: 'rail-payment',
        nodeColor: '#84cc16',
        label: 'PAYMENT SUCCESSFUL'
      };
    }

    if (
      lowerType.includes('delay') ||
      lowerType.includes('travel')
    ) {
      return {
        icon: Clock,
        badgeBg:
          'bg-amber-500/20 text-amber-300 border-amber-500/40',
        railClass: 'rail-delay',
        nodeColor: '#f59e0b',
        label: 'TRAVEL UPDATE'
      };
    }

    if (lowerType.includes('cancel')) {
      return {
        icon: AlertTriangle,
        badgeBg:
          'bg-rose-500/20 text-rose-300 border-rose-500/40',
        railClass: 'rail-cancellation',
        nodeColor: '#f43f5e',
        label: 'CANCELLATION'
      };
    }

    return {
      icon: Info,
      badgeBg:
        'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      railClass: 'rail-system',
      nodeColor: '#0284c7',
      label: 'SYSTEM NOTIFICATION'
    };
  };

  // ==========================================================
  // TIME FORMATTER
  // ==========================================================

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================================
  // SELECTION & BATCH ACTIONS
  // ==========================================================

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);

    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }

    setSelectedNotifications(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.size === 0) return;

    if (
      window.confirm(
        `Delete ${selectedNotifications.size} selected notifications?`
      )
    ) {
      selectedNotifications.forEach((id) => {
        deleteNotification(id);
      });

      setSelectedNotifications(new Set());
    }
  };

  // ==========================================================
  // RENDER NOTIFICATION CARD
  // ==========================================================

  const renderNotificationCard = (notification) => {
    const notifId = notification._id || notification.id;

    const config = getTypeConfig(
      notification.type,
      notification.category
    );

    const IconComponent = config.icon;
    const isUnread = !notification.read;

    const metadata = notification.metadata || {};

    const gender =
      metadata.gender || notification.passengerGender;

    const age =
      metadata.age || notification.passengerAge;

    const passengerName =
      metadata.passengerName || notification.passengerName;

    return (
      <div
        key={notifId}
        className={`notification-card-3d ${config.railClass} ${
          isUnread
            ? 'notification-card-unread'
            : 'opacity-90'
        }`}
      >
        <div className="flex items-start gap-4">

          {/* SELECTION CHECKBOX */}
          <input
            type="checkbox"
            checked={selectedNotifications.has(notifId)}
            onChange={() =>
              handleSelectNotification(notifId)
            }
            className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
          />

          {/* ICON BADGE */}
          <div
            className={`p-3 rounded-2xl border ${config.badgeBg} flex items-center justify-center flex-shrink-0 shadow-lg`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 min-w-0">

            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">

              <div className="flex items-center gap-2">

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${config.badgeBg}`}
                >
                  {config.label}
                </span>

                {isUnread && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    NEW ALERT
                  </span>
                )}

              </div>

              <span className="text-xs text-slate-400 font-mono">
                {formatTime(notification.createdAt)}
              </span>

            </div>

            <h4 className="font-bold text-white text-base mt-1">
              {notification.title}
            </h4>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {notification.message}
            </p>

            {/* SMART TRAVEL PASS */}
            {(notification.seatNumber ||
              metadata.from ||
              metadata.to) && (
              <div className="smart-ticket-card mt-3 text-xs space-y-2">

                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-cyan-300 font-mono text-[10px] font-bold uppercase">

                  <span>
                    SMARTSEAT PASS TELEMETRY
                  </span>

                  {notification.seatNumber && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
                      SEAT #{notification.seatNumber}
                    </span>
                  )}

                </div>

                {metadata.from && metadata.to && (
                  <div className="flex items-center justify-between text-slate-200 font-semibold py-1">

                    <span>{metadata.from}</span>

                    <ArrowRight className="w-4 h-4 text-cyan-400" />

                    <span>{metadata.to}</span>

                  </div>
                )}

              </div>
            )}

            {/* PASSENGER INFO */}
            {(passengerName || gender || age) ? (
              <div className="mt-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">

                <div className="flex items-center gap-2">

                  <User className="w-4 h-4 text-cyan-400" />

                  <span className="font-semibold text-white">
                    {passengerName || 'Passenger'}
                  </span>

                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">

                  {age && (
                    <span>
                      Age: {age}
                    </span>
                  )}

                  {gender && (
                    <span className="capitalize">
                      Gender: {gender}
                    </span>
                  )}

                </div>

              </div>
            ) : notification.type === 'booking' && (
              <div className="mt-2 text-[10px] text-slate-500 italic flex items-center gap-1">

                <ShieldAlert className="w-3 h-3 text-slate-500" />

                <span>
                  Passenger details protected by privacy rules
                </span>

              </div>
            )}

          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {isUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notifId)}
                icon={Check}
                className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-xl"
                title="Mark as Read"
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    'Delete this notification?'
                  )
                ) {
                  deleteNotification(notifId);
                }
              }}
              icon={X}
              className="text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl"
              title="Delete Notification"
            />

          </div>

        </div>
      </div>
    );
  };

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <div className="notification-center-container min-h-screen py-8 px-4 sm:px-6 lg:px-8">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HERO HEADER */}
        <div className="notification-hero-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">

          <div className="flex flex-wrap items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-2">

                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />

                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  SMARTSEAT INTELLIGENCE
                </span>

              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
                MOBILITY NOTIFICATION CENTER
              </h1>

              <p className="text-sm text-slate-300 mt-2 max-w-xl">
                Real-time journey telemetry, booking confirmations,
                SmartSeat monitoring alerts, and travel updates.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="px-4 py-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">

                <div className="flex items-center gap-2 text-cyan-400 justify-center">

                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />

                  <span className="text-2xl font-black">
                    {stats.unread}
                  </span>

                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                  UNREAD ALERTS
                </span>

              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  icon={CheckCheck}
                  className="bg-cyan-500/10 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  Mark All Read
                </Button>
              )}

            </div>

          </div>

        </div>

        {/* MOBILITY STATISTICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {/* UNREAD */}
          <div className="stat-card">

            <div className="flex items-center justify-between text-cyan-400">

              <Bell className="w-5 h-5" />

              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                ACTIVE
              </span>

            </div>

            <p className="text-2xl font-black text-white mt-2">
              {stats.unread}
            </p>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              UNREAD ALERTS
            </p>

          </div>

          {/* BOOKING ALERTS */}
          <div className="stat-card">

            <div className="flex items-center justify-between text-emerald-400">

              <Ticket className="w-5 h-5" />

              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                PASSED
              </span>

            </div>

            <p className="text-2xl font-black text-white mt-2">
              {stats.bookings}
            </p>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              BOOKING ALERTS
            </p>

          </div>

          {/* SMARTSEAT */}
          <div className="stat-card">

            <div className="flex items-center justify-between text-sky-400">

              <Compass className="w-5 h-5" />

              <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                LIVE
              </span>

            </div>

            <p className="text-2xl font-black text-white mt-2">
              {stats.smartSeat}
            </p>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              SMARTSEAT
            </p>

          </div>

          {/* TOTAL */}
          <div className="stat-card">

            <div className="flex items-center justify-between text-slate-400">

              <ShieldCheck className="w-5 h-5" />

              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                TOTAL
              </span>

            </div>

            <p className="text-2xl font-black text-white mt-2">
              {stats.total}
            </p>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              TOTAL NOTIFICATIONS
            </p>

          </div>

        </div>

        {/* SEARCH & CONTROL BAR */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* SEARCH */}
            <div className="relative flex-1 min-w-[240px]">

              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

            </div>

            {/* BATCH DELETE */}
            {selectedNotifications.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
                icon={Trash2}
                className="bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold rounded-xl"
              >
                Delete Selected (
                {selectedNotifications.size})
              </Button>
            )}

          </div>

          {/* FILTER CHIPS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">

            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" />
              FILTER:
            </span>

            {/* ONLY RELEVANT PASSENGER FILTERS */}
            {[
              {
                id: 'all',
                label: 'ALL'
              },
              {
                id: 'unread',
                label: 'UNREAD'
              },
              {
                id: 'SmartSeat',
                label: 'SMARTSEAT'
              },
              {
                id: 'Payment',
                label: 'PAYMENT'
              },
              {
                id: 'Delay',
                label: 'DELAY'
              }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`filter-chip ${
                  filter === cat.id
                    ? 'filter-chip-active'
                    : ''
                }`}
              >
                {cat.label}
              </button>
            ))}

          </div>

        </div>

        {/* TIMELINE FEED */}
        {loading ? (

          <div className="space-y-4 py-6">

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl skeleton-shimmer border border-slate-800"
              />
            ))}

          </div>

        ) : filteredNotifications.length === 0 ? (

          <div className="bg-slate-900/60 rounded-3xl p-12 border border-slate-800 text-center">

            <Inbox className="w-16 h-16 mx-auto mb-4 text-cyan-500/40" />

            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              NOTIFICATIONS CLEAR
            </h3>

            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">

              {searchTerm
                ? `No alerts matching "${searchTerm}"`
                : filter === 'all'
                ? 'You are completely caught up. No new mobility notifications.'
                : `No notifications found under ${filter} filter.`}

            </p>

          </div>

        ) : (

          <div className="space-y-8 relative">

            {/* TIMELINE CONNECTOR */}
            <div className="timeline-spine" />

            {Object.entries(timelineGroups).map(
              ([groupName, items]) => {

                if (items.length === 0) return null;

                return (
                  <div
                    key={groupName}
                    className="space-y-4 relative pl-8 sm:pl-14"
                  >

                    {/* GROUP HEADER */}
                    <div className="flex items-center gap-3">

                      <div
                        className="timeline-node"
                        style={{
                          backgroundColor:
                            groupName === 'TODAY'
                              ? '#38bdf8'
                              : '#64748b'
                        }}
                      />

                      <span className="text-xs font-black tracking-widest text-cyan-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 uppercase">
                        {groupName} • {items.length} ALERTS
                      </span>

                    </div>

                    {/* GROUP ITEMS */}
                    <div className="space-y-4">

                      {items.map((notification) =>
                        renderNotificationCard(
                          notification
                        )
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default Notifications;