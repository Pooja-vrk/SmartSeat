// Admin notifications management page
import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Input, Select, Badge, Loading } from '../../components/common';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { Bell, Search, Send, AlertTriangle, Info } from 'lucide-react';

/* ─────────────────────────────────────────────
 *  Constants
 * ───────────────────────────────────────────── */
const TYPE_OPTIONS = [
  { value: 'delay',     label: 'Delay Alert'  },
  { value: 'system',    label: 'General / System' },
  { value: 'booking',   label: 'Booking'      },
  { value: 'smartseat', label: 'SmartSeat'    },
  { value: 'payment',   label: 'Payment'      }
];

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Passengers' }
];

const EMPTY_FORM = {
  type:         'delay',
  target:       'all',
  title:        '',
  message:      '',
  busId:        '',
  scheduleId:   '',
  delayMinutes: ''
};

/* ─────────────────────────────────────────────
 *  Helper: badge per notification type
 * ───────────────────────────────────────────── */
const getTypeBadge = (type) => {
  switch (type) {
    case 'adjacent_seat':
    case 'smartseat':
      return <Badge variant="warning">SmartSeat</Badge>;
    case 'booking':
      return <Badge variant="success">Booking</Badge>;
    case 'recommendation':
    case 'seat_update':
      return <Badge variant="info">Seat Update</Badge>;
    case 'payment':
      return <Badge variant="success">Payment</Badge>;
    case 'delay':
      return <Badge variant="danger">Delay</Badge>;
    case 'system':
      return <Badge variant="default">Contact / System</Badge>;
    default:
      return <Badge variant="default">{type}</Badge>;
  }
};

/* ═══════════════════════════════════════════════
 *  Send Notification Modal
 * ═══════════════════════════════════════════════ */
const SendNotificationModal = ({ isOpen, onClose, onSent }) => {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [buses, setBuses]         = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingBuses, setLoadingBuses]         = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [busLoadError, setBusLoadError]         = useState('');
  const [scheduleLoadError, setScheduleLoadError] = useState('');
  const [sending, setSending]     = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  /* ── fetch buses ──────────────────────────────────── */
  const fetchBuses = useCallback(async () => {
    setLoadingBuses(true);
    setBusLoadError('');
    setBuses([]);
    try {
      const res = await adminService.getBusesForNotification();
      if (res && res.success) {
        setBuses(res.data || []);
      } else {
        setBusLoadError(res?.message || 'Failed to load buses.');
      }
    } catch (err) {
      // Axios errors have err.message; adminService re-throws err.response?.data
      const msg =
        (typeof err === 'object' && err !== null && err.message)
          ? err.message
          : (typeof err === 'string' ? err : 'Unable to load buses. Please try again.');
      setBusLoadError(msg);
    } finally {
      setLoadingBuses(false);
    }
  }, []);

  /* Load buses when modal opens */
  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY_FORM);
    setSchedules([]);
    setScheduleLoadError('');
    setSuccess('');
    setError('');
    fetchBuses();
  }, [isOpen, fetchBuses]);

  /* ── fetch schedules for selected bus ────────────── */
  const fetchSchedules = useCallback(async (busId) => {
    setLoadingSchedules(true);
    setScheduleLoadError('');
    setSchedules([]);
    try {
      const res = await adminService.getSchedulesForBus(busId);
      if (res && res.success) {
        setSchedules(res.data || []);
      } else {
        setScheduleLoadError(res?.message || 'Failed to load schedules.');
      }
    } catch (err) {
      const msg =
        (typeof err === 'object' && err !== null && err.message)
          ? err.message
          : (typeof err === 'string' ? err : 'Unable to load schedules. Please try again.');
      setScheduleLoadError(msg);
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  /* Load schedules whenever busId changes */
  useEffect(() => {
    if (!form.busId) {
      setSchedules([]);
      setScheduleLoadError('');
      setForm(prev => ({ ...prev, scheduleId: '' }));
      return;
    }
    fetchSchedules(form.busId);
  }, [form.busId, fetchSchedules]);

  /* Auto-fill title/message when a schedule is picked */
  useEffect(() => {
    if (form.type !== 'delay' || !form.scheduleId || !form.delayMinutes) return;
    const sched = schedules.find(s => String(s.id) === String(form.scheduleId));
    if (!sched) return;
    const delay  = Number(form.delayMinutes);
    if (!delay || delay <= 0) return;
    const [hh, mm] = (sched.departureTime || '00:00').split(':').map(Number);
    const totalMins = hh * 60 + mm + delay;
    const newHH  = Math.floor(totalMins / 60) % 24;
    const newMM  = totalMins % 60;
    const period = newHH >= 12 ? 'PM' : 'AM';
    const displayH = newHH % 12 || 12;
    const newTime  = `${displayH}:${String(newMM).padStart(2, '0')} ${period}`;
    setForm(prev => ({
      ...prev,
      title:   'Bus Delay Alert',
      message: `Your bus from ${sched.from} to ${sched.to} is delayed by ${delay} minute${delay !== 1 ? 's' : ''}. New departure time: ${newTime}.`
    }));
  }, [form.scheduleId, form.delayMinutes, form.type, schedules]);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: val };
      /* Reset dependent fields */
      if (field === 'type') {
        next.title       = '';
        next.message     = '';
        next.busId       = '';
        next.scheduleId  = '';
        next.delayMinutes = '';
      }
      if (field === 'busId') next.scheduleId = '';
      return next;
    });
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.type)    return 'Please select a notification type.';
    if (!form.title.trim())   return 'Title is required.';
    if (!form.message.trim()) return 'Message is required.';
    if (form.type === 'delay') {
      if (!form.busId)      return 'Please select a bus.';
      if (!form.scheduleId) return 'Please select a schedule.';
      const d = Number(form.delayMinutes);
      if (!form.delayMinutes || isNaN(d) || d <= 0)
        return 'Please enter a valid delay duration (> 0 minutes).';
    } else {
      if (!form.target) return 'Please select a recipient.';
    }
    return null;
  };

  const handleSend = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        type:    form.type,
        title:   form.title.trim(),
        message: form.message.trim()
      };

      if (form.type === 'delay') {
        payload.scheduleId   = form.scheduleId;
        payload.delayMinutes = Number(form.delayMinutes);
      } else {
        payload.target = form.target;
      }

      const res = await adminService.sendNotification(payload);

      if (res.success) {
        setSuccess(res.message || 'Notification sent successfully.');
        onSent(); // refresh log
        /* Close after a brief success pause */
        setTimeout(() => {
          setForm(EMPTY_FORM);
          setSuccess('');
          onClose();
        }, 1800);
      } else {
        setError(res.message || 'Failed to send notification.');
      }
    } catch (err) {
      setError(err?.message || 'An error occurred while sending the notification.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    setForm(EMPTY_FORM);
    setSuccess('');
    setError('');
    onClose();
  };

  /* Bus options for Select */
  const busOptions = buses.map(b => ({
    value: String(b.id),
    label: `${b.busNumber} — ${b.operatorName} (${b.busType})`
  }));

  /* Schedule options for Select */
  const scheduleOptions = schedules.map(s => ({
    value: String(s.id),
    label: s.displayLabel
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send New Notification"
      size="lg"
    >
      <div className="space-y-4">

        {/* Notification Type */}
        <Select
          label="Notification Type"
          required
          value={form.type}
          onChange={handleChange('type')}
          options={TYPE_OPTIONS}
          placeholder=""
          disabled={sending}
        />

        {/* ── DELAY ALERT fields ─────────────────────── */}
        {form.type === 'delay' && (
          <>
            {/* Bus selector */}
            {loadingBuses ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Loading buses…
              </div>
            ) : busLoadError ? (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {busLoadError}
                </span>
                <button
                  type="button"
                  onClick={fetchBuses}
                  className="text-sm text-primary-600 hover:underline ml-3 whitespace-nowrap"
                >
                  Retry
                </button>
              </div>
            ) : (
              <Select
                label="Bus"
                required
                value={form.busId}
                onChange={handleChange('busId')}
                options={busOptions}
                placeholder="Select a bus"
                disabled={sending || buses.length === 0}
                helperText={buses.length === 0 ? 'No buses available in the database.' : undefined}
              />
            )}

            {/* Schedule selector — only shown once a bus is picked */}
            {form.busId && (
              loadingSchedules ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Loading schedules…
                </div>
              ) : scheduleLoadError ? (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {scheduleLoadError}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchSchedules(form.busId)}
                    className="text-sm text-primary-600 hover:underline ml-3 whitespace-nowrap"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <Select
                  label="Schedule"
                  required
                  value={form.scheduleId}
                  onChange={handleChange('scheduleId')}
                  options={scheduleOptions}
                  placeholder="Select a schedule"
                  disabled={sending || schedules.length === 0}
                  helperText={schedules.length === 0 ? 'No active schedules for this bus.' : undefined}
                />
              )
            )}

            {/* Delay minutes */}
            <Input
              label="Delay Duration (minutes)"
              type="number"
              min="1"
              required
              value={form.delayMinutes}
              onChange={handleChange('delayMinutes')}
              placeholder="e.g. 30"
              disabled={sending}
            />
          </>
        )}

        {/* ── NON-DELAY fields ──────────────────────── */}
        {form.type !== 'delay' && (
          <Select
            label="Recipients"
            required
            value={form.target}
            onChange={handleChange('target')}
            options={TARGET_OPTIONS}
            placeholder=""
            disabled={sending}
          />
        )}

        {/* Title */}
        <Input
          label="Title"
          required
          value={form.title}
          onChange={handleChange('title')}
          placeholder="Notification title"
          disabled={sending}
        />

        {/* Message */}
        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-gray-700">
            Message <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            rows={3}
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Notification message…"
            disabled={sending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={sending}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          icon={Send}
          loading={sending}
          disabled={sending || !!success}
          onClick={handleSend}
        >
          {sending ? 'Sending…' : 'Send Notification'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════
 *  Main AdminNotifications page
 * ═══════════════════════════════════════════════ */
const AdminNotifications = () => {
  const [loading, setLoading]           = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [readFilter, setReadFilter]     = useState('all');
  const [modalOpen, setModalOpen]       = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getNotifications({
        type: typeFilter === 'all' ? undefined : typeFilter,
        read: readFilter === 'all' ? undefined : readFilter === 'read'
      });
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, readFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter(notification =>
    (notification.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (notification.recipient || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (notification.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Log</h1>
            <p className="text-gray-600">View all sent notifications and send new ones</p>
          </div>
          <Button
            variant="primary"
            icon={Send}
            onClick={() => setModalOpen(true)}
          >
            Send New Notification
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all',        label: 'All Types' },
                { value: 'system',     label: 'Contact / System' },
                { value: 'booking',    label: 'Booking' },
                { value: 'delay',      label: 'Delay Alert' },
                { value: 'smartseat',  label: 'SmartSeat' },
                { value: 'payment',    label: 'Payment' }
              ]}
              placeholder=""
              className="md:w-48"
            />
            <Select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              options={[
                { value: 'all',    label: 'All Status' },
                { value: 'read',   label: 'Read' },
                { value: 'unread', label: 'Unread' }
              ]}
              placeholder=""
              className="md:w-48"
            />
          </div>
        </CardBody>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardBody>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Bell className="w-10 h-10 mb-3" />
              <p className="text-sm">No notifications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">From / Recipient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Subject / Message</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map(notification => (
                    <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{getTypeBadge(notification.type)}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {notification.type === 'system' && notification.senderName
                          ? `${notification.senderName} (${notification.senderEmail || notification.recipient})`
                          : notification.recipient}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{notification.message}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {notification.time ? new Date(notification.time).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary-600 rounded-full inline-block" />
                        )}
                        <span className="ml-2 text-sm text-gray-600">
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSent={loadNotifications}
      />
    </div>
  );
};

export default AdminNotifications;
