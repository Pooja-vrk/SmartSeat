// Admin buses management page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input, Select, Modal, ModalHeader, ModalBody, ModalFooter, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { 
  Bus, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  Clock
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
    routeFrom: '',
    routeTo: '',
    totalSeats: ''
  });

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

  const handleAddBus = async () => {
    try {
      const response = await adminService.createBus({
        operator: formData.operator,
        busNumber: formData.busNumber,
        busType: formData.busType,
        route: {
          from: formData.routeFrom,
          to: formData.routeTo
        },
        totalSeats: parseInt(formData.totalSeats),
        seatLayout: {
          rows: 10,
          columns: 4,
          aisleAfter: 2
        },
        amenities: ['WiFi', 'USB Charging', 'Water Bottle']
      });

      if (response.success) {
        setShowAddModal(false);
        setFormData({
          operator: '',
          busNumber: '',
          busType: '',
          routeFrom: '',
          routeTo: '',
          totalSeats: ''
        });
        loadBuses();
      }
    } catch (error) {
      console.error('Error adding bus:', error);
    }
  };

  const handleEditBus = async () => {
    try {
      const response = await adminService.updateBus(selectedBus.id, {
        operator: formData.operator,
        busNumber: formData.busNumber,
        busType: formData.busType,
        route: {
          from: formData.routeFrom,
          to: formData.routeTo
        }
      });

      if (response.success) {
        setShowEditModal(false);
        setSelectedBus(null);
        loadBuses();
      }
    } catch (error) {
      console.error('Error updating bus:', error);
    }
  };

  const handleDeleteBus = async () => {
    try {
      const response = await adminService.deleteBus(selectedBus.id);
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
    setFormData({
      operator: bus.operator,
      busNumber: bus.busNumber,
      busType: bus.busType,
      routeFrom: bus.route.from,
      routeTo: bus.route.to,
      totalSeats: bus.totalSeats
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (bus) => {
    setSelectedBus(bus);
    setShowDeleteModal(true);
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route.to.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;
    
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bus.status === 'active' ? 'bg-green-100 text-green-800' :
                  bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bus.status}
                </span>
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
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add Bus Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Bus"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Operator Name"
              placeholder="Enter operator name"
              value={formData.operator}
              onChange={(e) => setFormData({...formData, operator: e.target.value})}
              required
            />
            <Input
              label="Bus Number"
              placeholder="Enter bus number"
              value={formData.busNumber}
              onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
              required
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
                label="From"
                placeholder="Departure city"
                value={formData.routeFrom}
                onChange={(e) => setFormData({...formData, routeFrom: e.target.value})}
                required
              />
              <Input
                label="To"
                placeholder="Destination city"
                value={formData.routeTo}
                onChange={(e) => setFormData({...formData, routeTo: e.target.value})}
                required
              />
            </div>
            <Input
              label="Total Seats"
              type="number"
              placeholder="Enter total seats"
              value={formData.totalSeats}
              onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
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
        onClose={() => setShowEditModal(false)}
        title="Edit Bus"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
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
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
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
    </div>
  );
};

export default AdminBuses;
