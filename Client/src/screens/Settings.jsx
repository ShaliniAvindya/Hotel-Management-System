import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Utensils, 
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Printer,
  CreditCard,
  FileText,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  User,
  Crown,
  UserCheck,
  ChefHat,
  Palette,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Tablet,
  Lock,
  Key,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  Zap,
  Volume2,
  VolumeX,
  Calendar,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Receipt,
  Package,
  ShoppingCart,
  Home,
  Camera,
  Image,
  Languages,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Menu
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const RestaurantSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  });
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'staff' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, name: 'Alex Chef', email: 'alex@bellavista.com', role: 'admin', status: 'active', lastLogin: '2025-07-13' },
    { id: 2, name: 'Sarah Manager', email: 'sarah@bellavista.com', role: 'manager', status: 'active', lastLogin: '2025-07-12' },
    { id: 3, name: 'Mike Waiter', email: 'mike@bellavista.com', role: 'staff', status: 'active', lastLogin: '2025-07-13' },
    { id: 4, name: 'Emma Kitchen', email: 'emma@bellavista.com', role: 'kitchen', status: 'inactive', lastLogin: '2025-07-10' }
  ]);

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Bella Vista Restaurant & Bar',
    address: '123 Downtown Street, City Center',
    phone: '+1 (555) 123-4567',
    email: 'info@bellavista.com',
    website: 'www.bellavista.com',
    description: 'Fine dining restaurant with authentic Italian cuisine',
    cuisine: 'Italian',
    capacity: 45,
    operatingHours: {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }
  });

  const [systemPreferences, setSystemPreferences] = useState({
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    taxRate: 8.5,
    serviceCharge: 15,
    reservationDuration: 120,
    maxPartySize: 12,
    advanceBookingDays: 30
  });

  const settingSections = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'restaurant', label: 'Restaurant Info', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Settings', icon: Monitor }
  ];

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800',
    kitchen: 'bg-orange-100 text-orange-800'
  };

  const roleIcons = {
    admin: Crown,
    manager: UserCheck,
    staff: User,
    kitchen: ChefHat
  };

  const handleSave = () => {
    console.log('Settings saved');
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, {
        id: users.length + 1,
        ...newUser,
        status: 'active',
        lastLogin: new Date().toISOString().split('T')[0]
      }]);
      setNewUser({ name: '', email: '', role: 'staff' });
      setShowAddUser(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select 
              value={systemPreferences.currency}
              onChange={(e) => setSystemPreferences({...systemPreferences, currency: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select 
              value={systemPreferences.timezone}
              onChange={(e) => setSystemPreferences({...systemPreferences, timezone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select 
              value={systemPreferences.dateFormat}
              onChange={(e) => setSystemPreferences({...systemPreferences, dateFormat: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select 
              value={systemPreferences.timeFormat}
              onChange={(e) => setSystemPreferences({...systemPreferences, timeFormat: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={systemPreferences.taxRate}
              onChange={(e) => setSystemPreferences({...systemPreferences, taxRate: parseFloat(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge (%)</label>
            <input
              type="number"
              step="0.1"
              value={systemPreferences.serviceCharge}
              onChange={(e) => setSystemPreferences({...systemPreferences, serviceCharge: parseFloat(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Duration (minutes)</label>
            <input
              type="number"
              value={systemPreferences.reservationDuration}
              onChange={(e) => setSystemPreferences({...systemPreferences, reservationDuration: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Party Size</label>
            <input
              type="number"
              value={systemPreferences.maxPartySize}
              onChange={(e) => setSystemPreferences({...systemPreferences, maxPartySize: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestaurantInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
            <input
              type="text"
              value={restaurantInfo.name}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={restaurantInfo.address}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, address: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={restaurantInfo.phone}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={restaurantInfo.email}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={restaurantInfo.website}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, website: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
            <input
              type="text"
              value={restaurantInfo.cuisine}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, cuisine: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={restaurantInfo.description}
              onChange={(e) => setRestaurantInfo({...restaurantInfo, description: e.target.value})}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
        <div className="space-y-4">
          {Object.entries(restaurantInfo.operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-900 capitalize">{day}</span>
                </div>
                <button
                  onClick={() => setRestaurantInfo({
                    ...restaurantInfo,
                    operatingHours: {
                      ...restaurantInfo.operatingHours,
                      [day]: { ...hours, closed: !hours.closed }
                    }
                  })}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    hours.closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {hours.closed ? 'Closed' : 'Open'}
                </button>
              </div>
              {!hours.closed && (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => setRestaurantInfo({
                      ...restaurantInfo,
                      operatingHours: {
                        ...restaurantInfo.operatingHours,
                        [day]: { ...hours, open: e.target.value }
                      }
                    })}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => setRestaurantInfo({
                      ...restaurantInfo,
                      operatingHours: {
                        ...restaurantInfo.operatingHours,
                        [day]: { ...hours, close: e.target.value }
                      }
                    })}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>

        {showAddUser && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New User</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="staff">Staff</option>
                <option value="kitchen">Kitchen</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={handleAddUser}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="h-4 w-4 text-gray-600" />
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{user.lastLogin}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setTwoFactorAuth(!twoFactorAuth)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup your data daily</p>
            </div>
            <button
              onClick={() => setAutoBackup(!autoBackup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoBackup ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoBackup ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Change Password</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, email: !notifications.email})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.email ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive push notifications on your device</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, push: !notifications.push})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.push ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, sms: !notifications.sms})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.sms ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.sms ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Desktop Notifications</h4>
              <p className="text-sm text-gray-600">Show desktop notifications</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, desktop: !notifications.desktop})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.desktop ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.desktop ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Types</h4>
          <div className="space-y-3">
            {[
              { id: 'reservations', label: 'New Reservations', enabled: true },
              { id: 'walkins', label: 'Walk-in Customers', enabled: true },
              { id: 'orders', label: 'New Orders', enabled: true },
              { id: 'inventory', label: 'Low Stock Alerts', enabled: true },
              { id: 'payments', label: 'Payment Confirmations', enabled: false },
              { id: 'reviews', label: 'Customer Reviews', enabled: true },
              { id: 'staff', label: 'Staff Updates', enabled: false }
            ].map(notification => (
              <div key={notification.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-900">{notification.label}</span>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notification.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    notification.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );


  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Software Version</span>
              <span className="text-sm font-medium text-gray-900">v2.4.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Update</span>
              <span className="text-sm font-medium text-gray-900">July 10, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database Size</span>
              <span className="text-sm font-medium text-gray-900">2.3 GB</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium text-gray-900">4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">15 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">License</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Check for Updates</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Download className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Export Data</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Upload className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Import Data</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <HardDrive className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-900">Clear Cache</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'restaurant': return renderRestaurantInfo();
      case 'users': return renderUserManagement();
      case 'security': return renderSecurity();
      case 'notifications': return renderNotifications();
      case 'system': return renderSystemSettings();
      default: return renderGeneralSettings();
    }
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('RestaurantSettings rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50`}>
        {/* Header */}
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => {
                  console.log('Opening sidebar');
                  setSidebarOpen(true);
                }}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-600">Manage your restaurant system preferences</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
                <nav className="space-y-1">
                  {settingSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderContent()}
              
              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;