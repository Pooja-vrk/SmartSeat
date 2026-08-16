// Admin settings page
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Switch, Loading } from '../../components/common';
import { adminService } from '../../services/adminService';
import { Settings, Save, Mail, Phone, MapPin, Shield } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'SmartSeat',
    supportEmail: 'support@smartseat.com',
    supportPhone: '+91 1800-123-4567',
    enableSmartSeat: true,
    enableRecommendations: true,
    enableNotifications: true,
    maxSeatChanges: 3,
    seatChangeCutoffHours: 24
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await adminService.updateSettings(settings);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure system-wide settings</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <Save className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">Settings saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Site Name"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable SmartSeat</p>
                  <p className="text-sm text-gray-600">Enable SmartSeat features system-wide</p>
                </div>
                <Switch
                  checked={settings.enableSmartSeat}
                  onChange={(checked) => setSettings({...settings, enableSmartSeat: checked})}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable Recommendations</p>
                  <p className="text-sm text-gray-600">Enable seat recommendation engine</p>
                </div>
                <Switch
                  checked={settings.enableRecommendations}
                  onChange={(checked) => setSettings({...settings, enableRecommendations: checked})}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable Notifications</p>
                  <p className="text-sm text-gray-600">Enable push notification system</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onChange={(checked) => setSettings({...settings, enableNotifications: checked})}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Support Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                icon={Mail}
              />
              <Input
                label="Support Phone"
                value={settings.supportPhone}
                onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                icon={Phone}
              />
            </div>
          </CardBody>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Booking Settings</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Maximum Seat Changes"
                type="number"
                value={settings.maxSeatChanges}
                onChange={(e) => setSettings({...settings, maxSeatChanges: parseInt(e.target.value)})}
                helperText="Maximum number of seat changes allowed per booking"
              />
              <Input
                label="Seat Change Cutoff (Hours)"
                type="number"
                value={settings.seatChangeCutoffHours}
                onChange={(e) => setSettings({...settings, seatChangeCutoffHours: parseInt(e.target.value)})}
                helperText="Hours before departure when seat changes are disabled"
              />
            </div>
          </CardBody>
        </Card>

        {/* Save Button */}
        <Card className="lg:col-span-2">
          <CardBody>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              icon={Save}
              className="w-full md:w-auto"
            >
              Save Settings
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
