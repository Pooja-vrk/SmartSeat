// Admin buses management page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input, Select, Modal, ModalHeader, ModalBody, ModalFooter, Loading, Badge } from '../../components/common';
import { adminService } from '../../services/adminService';
import { busService } from '../../services/busService';
import { 
  Bus, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  Clock,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const AdminBuses = () => {
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    operator: '',
    busNumber: '',
    busType: '',
    registrationNumber: '',
    routeFrom: '',
    routeTo: '',
    totalSeats: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ── Schedule creation ──────────────────────────────────────
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleBus, setScheduleBus] = useState(null);   // bus being scheduled
  const [routes, setRoutes] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    routeId: '',
    travelDate: '',
    departureTime: '',
    arrivalTime: '',
    fare: ''
  });
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBuses();
      if (response.success) {
        setBuses(response.data);
      }
    } catch (error) {
      console.error('Error loading buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await busService.getRoutes();
      if (response?.success) {
        setRoutes(response.data || []);
      }
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  const openScheduleModal = (bus) => {
    setScheduleBus(bus);
    setScheduleForm({ routeId: '', travelDate: '', departureTime: '', arrivalTime: '', fare: '' });
    setScheduleError('');
    if (routes.length === 0) loadRoutes();
    setShowScheduleModal(true);
  };

  const handleAddSchedule = async () => {
    setScheduleError('');
    const { routeId, travelDate, departureTime, arrivalTime, fare } = scheduleForm;

    if (!routeId)        { setScheduleError('Please select a route');            return; }
    if (!travelDate)     { setScheduleError('Travel date is required');           return; }
    if (!departureTime)  { setScheduleError('Departure time is required');        return; }
    if (!arrivalTime)    { setScheduleError('Arrival time is required');          return; }
    if (!fare || Number(fare) < 0) { setScheduleError('Valid fare is required');  return; }

    setScheduleLoading(true);
    try {
      // Dates are stored as UTC midnight so the search date filter matches.
      const utcDate = new Date(travelDate + 'T00:00:00.000Z');

      const response = await adminService.createSchedule({
        busId:         scheduleBus._id || scheduleBus.id,
        routeId,
        travelDate:    utcDate.toISOString(),
        departureTime,
        arrivalTime,
        fare:          Number(fare),
        isActive:      true,
        availableSeats: scheduleBus.totalSeats || scheduleBus.seatConfiguration?.totalSeats || 40
      });

      if (response.success) {
        setShowScheduleModal(false);
        setScheduleBus(null);
        loadBuses();   // refresh to update hasSchedule badge
      } else {
        setScheduleError(response.message || 'Failed to create schedule');
      }
    } catch (error) {
      setScheduleError(error?.message || 'Failed to create schedule. Please try again.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleAddBus = async () => {
    setFormError('');
    setFormSuccess('');

    // Basic client-side validation
    if (!formData.operator.trim()) {
      setFormError('Operator name is required');
      return;
    }
    if (!formData.busNumber.trim()) {
      setFormError('Bus number is required');
      return;
    }
    if (!formData.busType) {
      setFormError('Bus type is required');
      return;
    }
    if (!formData.totalSeats || Number(formData.totalSeats) < 1) {
      setFormError('Total seats must be a positive number');
      return;
    }

    try {
      const cols = 4;
      const rows = Math.ceil(Number(formData.totalSeats) / cols);

      const response = await adminService.createBus({
        operator:           formData.operator,
        busNumber:          formData.busNumber,
        busType:            formData.busType,
        registrationNumber: formData.registrationNumber.trim() || undefined,
        totalSeats:         parseInt(formData.totalSeats),
        rows,
        columns:            cols,
        aisleAfter:         2,
        boardingPoints:     formData.routeFrom ? [formData.routeFrom] : [],
        droppingPoints:     formData.routeTo   ? [formData.routeTo]   : [],
        amenities:          ['WiFi', 'USB Charging', 'Water Bottle']
      });

      if (response.success) {
        setShowAddModal(false);
        setFormData({ operator: '', busNumber: '', busType: '', registrationNumber: '', routeFrom: '', routeTo: '', totalSeats: '' });
        setFormError('');
        loadBuses();
      }
    } catch (error) {
      setFormError(error?.message || 'Failed to add bus. Please try again.');
      console.error('Error adding bus:', error);
    }
  };

  const handleEditBus = async () => {
    setFormError('');
    try {
      const response = await adminService.updateBus(selectedBus.id || selectedBus._id, {
        operator:  formData.operator,
        busNumber: formData.busNumber,
        busType:   formData.busType,
        boardingPoints: formData.routeFrom ? [formData.routeFrom] : undefined,
        droppingPoints: formData.routeTo   ? [formData.routeTo]   : undefined
      });

      if (response.success) {
        setShowEditModal(false);
        setSelectedBus(null);
        loadBuses();
      }
    } catch (error) {
      setFormError(error?.message || 'Failed to update bus.');
      console.error('Error updating bus:', error);
    }
  };

  const handleDeleteBus = async () => {
    try {
      const response = await adminService.deleteBus(selectedBus.id || selectedBus._id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedBus(null);
        loadBuses();
      }
    } catch (error) {
      console.error('Error deleting bus:', error);
    }
  };

  const openEditModal = (bus) => {
    setSelectedBus(bus);
    setFormError('');
    setFormData({
      operator:           bus.operator || bus.operatorName || '',
      busNumber:          bus.busNumber || '',
      busType:            bus.busType || '',
      registrationNumber: bus.registrationNumber || '',
      routeFrom:          bus.route?.from || bus.boardingPoints?.[0] || '',
      routeTo:            bus.route?.to   || bus.droppingPoints?.[0] || '',
      totalSeats:         bus.totalSeats || bus.seatConfiguration?.totalSeats || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (bus) => {
    setSelectedBus(bus);
    setShowDeleteModal(true);
  };

  const filteredBuses = buses.filter(bus => {
    const operator  = (bus.operator || '').toLowerCase();
    const busNumber = (bus.busNumber || '').toLowerCase();
    const routeFrom = (bus.route?.from || '').toLowerCase();
    const routeTo   = (bus.route?.to   || '').toLowerCase();
    const query     = searchQuery.toLowerCase();

    const matchesSearch =
      operator.includes(query) ||
      busNumber.includes(query) ||
      routeFrom.includes(query) ||
      routeTo.includes(query);

    const matchesStatus =
      statusFilter === 'all' || bus.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading buses..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Buses</h1>
            <p className="text-gray-600">Add, edit, and remove buses from the system</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)} icon={Plus}>
            Add Bus
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
                placeholder="Search buses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              className="md:w-48"
            />
          </div>
        </CardBody>
      </Card>

      {/* Buses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map(bus => (
          <Card key={bus.id} hover>
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bus.operator}</h3>
                    <p className="text-sm text-gray-600">{bus.busNumber}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bus.status === 'active' ? 'bg-green-100 text-green-800' :
                    bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bus.status}
                  </span>
                  {bus.hasSchedule === false && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <AlertTriangle className="w-3 h-3" />
                      No Schedule
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium text-gray-900">
                    {bus.route.from} → {bus.route.to}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">{bus.busType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Seats</span>
                  <span className="font-medium text-gray-900">{bus.totalSeats}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(bus)}
                  icon={Edit}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => openDeleteModal(bus)}
                  icon={Trash2}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
              {bus.hasSchedule === false && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openScheduleModal(bus)}
                  icon={Calendar}
                  className="w-full mt-2"
                >
                  Add Schedule to make searchable
                </Button>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add Bus Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setFormError(''); }}
        title="Add New Bus"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}
            <Input
              label="Operator Name"
              placeholder="Enter operator name"
              value={formData.operator}
              onChange={(e) => setFormData({...formData, operator: e.target.value})}
              required
            />
            <Input
              label="Bus Number"
              placeholder="e.g. ST-2024-001"
              value={formData.busNumber}
              onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
              required
            />
            <Input
              label="Registration Number"
              placeholder="e.g. MH-01-AB-1234 (optional — auto-generated if empty)"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
            />
            <Select
              label="Bus Type"
              placeholder="Select bus type"
              value={formData.busType}
              onChange={(e) => setFormData({...formData, busType: e.target.value})}
              required
              options={[
                { value: 'AC Sleeper', label: 'AC Sleeper' },
                { value: 'AC Seater', label: 'AC Seater' },
                { value: 'Non-AC Sleeper', label: 'Non-AC Sleeper' },
                { value: 'Non-AC Seater', label: 'Non-AC Seater' },
                { value: 'AC Multi-Axle', label: 'AC Multi-Axle' }
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From (Boarding)"
                placeholder="Departure city"
                value={formData.routeFrom}
                onChange={(e) => setFormData({...formData, routeFrom: e.target.value})}
              />
              <Input
                label="To (Dropping)"
                placeholder="Destination city"
                value={formData.routeTo}
                onChange={(e) => setFormData({...formData, routeTo: e.target.value})}
              />
            </div>
            <Input
              label="Total Seats"
              type="number"
              placeholder="e.g. 40"
              value={formData.totalSeats}
              onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowAddModal(false); setFormError(''); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddBus}>
            Add Bus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Bus Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setFormError(''); }}
        title="Edit Bus"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}
            <Input
              label="Operator Name"
              value={formData.operator}
              onChange={(e) => setFormData({...formData, operator: e.target.value})}
              required
            />
            <Input
              label="Bus Number"
              value={formData.busNumber}
              onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
              required
            />
            <Select
              label="Bus Type"
              value={formData.busType}
              onChange={(e) => setFormData({...formData, busType: e.target.value})}
              required
              options={[
                { value: 'AC Sleeper', label: 'AC Sleeper' },
                { value: 'AC Seater', label: 'AC Seater' },
                { value: 'Non-AC Sleeper', label: 'Non-AC Sleeper' },
                { value: 'Non-AC Seater', label: 'Non-AC Seater' },
                { value: 'AC Multi-Axle', label: 'AC Multi-Axle' }
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From"
                value={formData.routeFrom}
                onChange={(e) => setFormData({...formData, routeFrom: e.target.value})}
                required
              />
              <Input
                label="To"
                value={formData.routeTo}
                onChange={(e) => setFormData({...formData, routeTo: e.target.value})}
                required
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowEditModal(false); setFormError(''); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditBus}>
            Update Bus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-700">
            Are you sure you want to delete bus <strong>{selectedBus?.busNumber}</strong>? 
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBus}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Schedule Modal — makes a bus appear in Search results */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setScheduleError(''); }}
        title={`Add Schedule — ${scheduleBus?.operator} (${scheduleBus?.busNumber})`}
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              A schedule assigns this bus to a route, date, and time. Once created the bus will appear in Search Buses.
            </div>

            {scheduleError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {scheduleError}
              </div>
            )}

            <Select
              label="Route"
              placeholder="Select a route"
              value={scheduleForm.routeId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, routeId: e.target.value })}
              required
              options={routes.map(r => ({
                value: r._id,
                label: `${r.source} → ${r.destination}`
              }))}
            />

            <Input
              label="Travel Date"
              type="date"
              value={scheduleForm.travelDate}
              onChange={(e) => setScheduleForm({ ...scheduleForm, travelDate: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Departure Time"
                type="time"
                value={scheduleForm.departureTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })}
                required
              />
              <Input
                label="Arrival Time"
                type="time"
                value={scheduleForm.arrivalTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, arrivalTime: e.target.value })}
                required
              />
            </div>

            <Input
              label="Fare (₹)"
              type="number"
              placeholder="e.g. 450"
              value={scheduleForm.fare}
              onChange={(e) => setScheduleForm({ ...scheduleForm, fare: e.target.value })}
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowScheduleModal(false); setScheduleError(''); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSchedule} disabled={scheduleLoading}>
            {scheduleLoading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminBuses;
