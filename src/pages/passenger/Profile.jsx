// Profile and preferences page
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select, Switch } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useSmartSeat } from '../../context/SmartSeatContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell,
  Settings,
  Save,
  MapPin,
  Armchair,
  Lock
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { preferences, updatePreferences } = useSmartSeat();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [preferencesData, setPreferencesData] = useState(preferences);

  useEffect(() => {
    setPreferencesData(preferences);
  }, [preferences]);

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const response = await updateProfile(profileData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = () => {
    updatePreferences(preferencesData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'smartseat', label: 'SmartSeat', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Preferences</h1>
        <p className="text-gray-600">Manage your account and SmartSeat settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <div className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <Save className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">Changes saved successfully!</p>
            </div>
          )}

          {activeTab === 'personal' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    icon={User}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    icon={Mail}
                    disabled
                    helperText="Email cannot be changed"
                  />
                  <Input
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    icon={Phone}
                  />
                  <Button
                    variant="primary"
                    onClick={handleProfileSave}
                    loading={loading}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'smartseat' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">SmartSeat Preferences</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Adjacent Seat Monitoring</p>
                      <p className="text-sm text-gray-600">Get notified when adjacent seat changes</p>
                    </div>
                    <Switch
                      checked={preferencesData.adjacentSeatMonitoring}
                      onChange={(checked) => setPreferencesData({...preferencesData, adjacentSeatMonitoring: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Notify on Adjacent Change</p>
                      <p className="text-sm text-gray-600">Receive alerts when adjacent seat is booked</p>
                    </div>
                    <Switch
                      checked={preferencesData.notifyOnAdjacentChange}
                      onChange={(checked) => setPreferencesData({...preferencesData, notifyOnAdjacentChange: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Allow Recommendations</p>
                      <p className="text-sm text-gray-600">Receive smart seat suggestions</p>
                    </div>
                    <Switch
                      checked={preferencesData.allowRecommendations}
                      onChange={(checked) => setPreferencesData({...preferencesData, allowRecommendations: checked})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Section
                    </label>
                    <Select
                      value={preferencesData.sectionPreference}
                      onChange={(e) => setPreferencesData({...preferencesData, sectionPreference: e.target.value})}
                      options={[
                        { value: 'front', label: 'Front Section' },
                        { value: 'middle', label: 'Middle Section' },
                        { value: 'rear', label: 'Rear Section' }
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Window Seat Preference</p>
                      <p className="text-sm text-gray-600">Prefer window seats when available</p>
                    </div>
                    <Switch
                      checked={preferencesData.windowPreference}
                      onChange={(checked) => setPreferencesData({...preferencesData, windowPreference: checked})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Adjacent Condition
                    </label>
                    <Select
                      value={preferencesData.preferredAdjacentCondition}
                      onChange={(e) => setPreferencesData({...preferencesData, preferredAdjacentCondition: e.target.value})}
                      options={[
                        { value: 'empty', label: 'Empty adjacent seat' },
                        { value: 'any', label: 'No preference' },
                        { value: 'same_category', label: 'Same category preference' }
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Accessibility Priority</p>
                      <p className="text-sm text-gray-600">Prioritize accessible seats</p>
                    </div>
                    <Switch
                      checked={preferencesData.accessibilityPriority}
                      onChange={(checked) => setPreferencesData({...preferencesData, accessibilityPriority: checked})}
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handlePreferencesSave}
                    icon={Save}
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Booking Notifications</p>
                      <p className="text-sm text-gray-600">Updates about your bookings</p>
                    </div>
                    <Switch
                      checked={true}
                      onChange={() => {}}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">SmartSeat Alerts</p>
                      <p className="text-sm text-gray-600">Adjacent seat changes and recommendations</p>
                    </div>
                    <Switch
                      checked={preferencesData.notifyOnAdjacentChange}
                      onChange={(checked) => setPreferencesData({...preferencesData, notifyOnAdjacentChange: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Payment Notifications</p>
                      <p className="text-sm text-gray-600">Payment confirmations and receipts</p>
                    </div>
                    <Switch
                      checked={true}
                      onChange={() => {}}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Promotional Notifications</p>
                      <p className="text-sm text-gray-600">Offers and updates</p>
                </div>
                    <Switch
                      checked={false}
                      onChange={() => {}}
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handlePreferencesSave}
                    icon={Save}
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Show Passenger Category</p>
                      <p className="text-sm text-gray-600">Allow others to see your passenger category</p>
                    </div>
                    <Switch
                      checked={preferencesData.showPassengerCategory}
                      onChange={(checked) => setPreferencesData({...preferencesData, showPassengerCategory: checked})}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
                    <p className="text-sm text-blue-800">
                      Your personal information is protected by our privacy policy. Passenger category information is only shared when you enable this setting and is used solely for seat preference matching.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handlePreferencesSave}
                    icon={Save}
                  >
                    Save Privacy Settings
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
