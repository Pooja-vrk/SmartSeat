// Profile and preferences page - SmartSeat Passenger Control Panel

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
  Lock,
  Sparkles
} from 'lucide-react';

import './PassengerPages.css';

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
    <div className="passenger-page-container min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HERO HEADER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 text-white border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>PASSENGER ACCOUNT CONTROL</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              PROFILE & <span className="text-cyan-400">PREFERENCES</span>
            </h1>
            <p className="text-xs text-slate-400">Manage account information, SmartSeat preferences, and privacy controls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR TABS */}
          <div className="lg:col-span-1">
            <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`profile-tab-btn ${activeTab === tab.id ? 'profile-tab-active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* SUCCESS BANNER */}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm animate-fade-in">
                <Save className="w-4 h-4 text-emerald-600" />
                <span>Changes saved successfully!</span>
              </div>
            )}

            {/* PERSONAL INFO TAB */}
            {activeTab === 'personal' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Personal Information</h3>
                </div>

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
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* SMARTSEAT PREFERENCES TAB */}
            {activeTab === 'smartseat' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Shield className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">SmartSeat Telemetry Preferences</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Adjacent Seat Monitoring</p>
                      <p className="text-slate-500">Get notified when adjacent seat status changes</p>
                    </div>
                    <Switch
                      checked={preferencesData.adjacentSeatMonitoring}
                      onChange={(checked) => setPreferencesData({...preferencesData, adjacentSeatMonitoring: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Notify on Adjacent Change</p>
                      <p className="text-slate-500">Receive alerts when adjacent seat is booked</p>
                    </div>
                    <Switch
                      checked={preferencesData.notifyOnAdjacentChange}
                      onChange={(checked) => setPreferencesData({...preferencesData, notifyOnAdjacentChange: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Allow Recommendations</p>
                      <p className="text-slate-500">Receive smart seat suggestions</p>
                    </div>
                    <Switch
                      checked={preferencesData.allowRecommendations}
                      onChange={(checked) => setPreferencesData({...preferencesData, allowRecommendations: checked})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Window Seat Preference</p>
                      <p className="text-slate-500">Prefer window seats when available</p>
                    </div>
                    <Switch
                      checked={preferencesData.windowPreference}
                      onChange={(checked) => setPreferencesData({...preferencesData, windowPreference: checked})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Accessibility Priority</p>
                      <p className="text-slate-500">Prioritize accessible seats</p>
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
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Bell className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Notification Settings</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Booking Notifications</p>
                      <p className="text-slate-500">Updates about your bookings</p>
                    </div>
                    <Switch
                      checked={true}
                      onChange={() => {}}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">SmartSeat Alerts</p>
                      <p className="text-slate-500">Adjacent seat changes and recommendations</p>
                    </div>
                    <Switch
                      checked={preferencesData.notifyOnAdjacentChange}
                      onChange={(checked) => setPreferencesData({...preferencesData, notifyOnAdjacentChange: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Payment Notifications</p>
                      <p className="text-slate-500">Payment confirmations and receipts</p>
                    </div>
                    <Switch
                      checked={true}
                      onChange={() => {}}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Promotional Notifications</p>
                      <p className="text-slate-500">Offers and updates</p>
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
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Lock className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Privacy Controls</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Show Passenger Category</p>
                      <p className="text-slate-500">Allow others to see your passenger category</p>
                    </div>
                    <Switch
                      checked={preferencesData.showPassengerCategory}
                      onChange={(checked) => setPreferencesData({...preferencesData, showPassengerCategory: checked})}
                    />
                  </div>

                  <div className="p-4 bg-cyan-50/80 rounded-2xl border border-cyan-200">
                    <h4 className="font-bold text-cyan-950 mb-1">Privacy Notice</h4>
                    <p className="text-cyan-800 leading-relaxed">
                      Your personal information is protected by our privacy policy. Passenger category information is only shared when you enable this setting and is used solely for seat preference matching.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handlePreferencesSave}
                    icon={Save}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md"
                  >
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
