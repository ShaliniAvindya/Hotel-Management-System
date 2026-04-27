import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/context/AuthContext';
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
  Menu,
  Search,
  Filter
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../apiconfig';

const RestaurantSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  });
  const [notificationTypes, setNotificationTypes] = useState({
    reservations: true,
    walkins: true,
    orders: true,
    inventory: true,
    payments: false,
    reviews: true,
    staff: false
  });
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'staff', password: '', isAdmin: false });
  const [showAddUser, setShowAddUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const [users, setUsers] = useState([]);
  const { api } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const fetchUsers = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  };

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '', address: '', phone: '', email: '', website: '', description: '', cuisine: '', capacity: 0,
    operatingHours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    }
  });

  const [systemPreferences, setSystemPreferences] = useState({
    currency: 'USD', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', language: 'en', taxRate: 0, serviceCharge: 0,
    reservationDuration: 0, maxPartySize: 0, advanceBookingDays: 0
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


  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [userFilters, setUserFilters] = useState({ search: '', role: 'all', status: 'all' });

  const handleSave = async () => {
    try {
      await api.put(`${API_BASE_URL}/settings/restaurant`, restaurantInfo);
      await api.put(`${API_BASE_URL}/settings/system`, systemPreferences);
      setToastMsg('Settings saved successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setToastMsg('Error saving settings.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      console.error('Error saving settings:', err);
    }
  };
  const fetchSettings = async () => {
    try {
      const [restaurantRes, systemRes] = await Promise.all([
        api.get(`${API_BASE_URL}/settings/restaurant`),
        api.get(`${API_BASE_URL}/settings/system`),
      ]);
      setRestaurantInfo(prev => ({ ...prev, ...(restaurantRes.data || {}) }));
      setSystemPreferences(prev => ({ ...prev, ...(systemRes.data || {}) }));
      return { restaurant: restaurantRes.data, system: systemRes.data };
    } catch (err) {
      console.error('Error fetching settings:', err);
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Promise.all([fetchUsers(), fetchSettings()]);
      } catch (err) {
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  const handleAddUser = async () => {
    if (newUser.name && newUser.email && newUser.password) {
      try {
        // use admin create endpoint
        const payload = { name: newUser.name, email: newUser.email, password: newUser.password, role: newUser.role, isAdmin: !!newUser.isAdmin };
        const res = await api.post(`${API_BASE_URL}/users`, payload);
        const created = res.data.user || res.data;
        setUsers(prev => [...(prev || []), created]);
        setNewUser({ name: '', email: '', role: 'staff', password: '', isAdmin: false });
        setShowAddUser(false);
        toast.success('User created');
      } catch (err) {
        console.error('Error adding user:', err);
        const msg = err.response?.data?.error || err.message || 'Failed to create user';
        toast.error(msg);
      }
    } else {
      toast.error('Please fill name, email and password');
    }
  };

  const handleDeleteUser = async (userId) => {
    setConfirmDelete({ open: true, userId });
  };

  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null });

  const confirmDeleteNow = async () => {
    const userId = confirmDelete.userId;
    try {
      await api.delete(`${API_BASE_URL}/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      console.error('Error deleting user:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to delete user';
      toast.error(msg);
    } finally {
      setConfirmDelete({ open: false, userId: null });
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      const updatedFields = { status: user.status === 'active' ? 'inactive' : 'active', isActive: !(user.isActive === false) };
      const res = await api.patch(`${API_BASE_URL}/users/${userId}`, updatedFields);
      const updated = res.data.user || res.data;
      setUsers(users.map(u => u._id === userId ? updated : u));
      toast.success('User status updated');
    } catch (err) {
      console.error('Error toggling user status:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to update status';
      toast.error(msg);
    }
  };

  const openEditModal = (user) => {
    setEditUser({ ...user });
  };

  const closeEditModal = () => setEditUser(null);

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      const payload = { status: editUser.status, isActive: editUser.isActive, lastLogin: editUser.lastLogin };
      const res = await api.patch(`${API_BASE_URL}/users/${editUser._id}`, payload);
      const updated = res.data.user || res.data;
      setUsers(users.map(u => u._id === updated._id ? updated : u));
      toast.success('User updated');
      closeEditModal();
    } catch (err) {
      console.error('Error saving edit:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to save user';
      toast.error(msg);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <>
          <div className="hotel-card p-6">
            <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">System Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select 
                  value={systemPreferences.currency}
                  onChange={(e) => setSystemPreferences({...systemPreferences, currency: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                >
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select 
                  value={systemPreferences.timezone}
                  onChange={(e) => setSystemPreferences({...systemPreferences, timezone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
            </div>
          </div>
      </>
    </div>
  );

  const renderRestaurantInfo = () => (
    <div className="space-y-6">
      <>
          <div className="hotel-card p-6">
            <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Restaurant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  value={restaurantInfo.name}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={restaurantInfo.address}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={restaurantInfo.phone}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={restaurantInfo.email}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={restaurantInfo.website}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, website: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                <input
                  type="text"
                  value={restaurantInfo.cuisine}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, cuisine: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={restaurantInfo.description}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                />
              </div>
            </div>
          </div>
          <div className="hotel-card p-6">
            <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Operating Hours</h3>
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
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
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
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
      </>
    </div>
  );

  const renderUserManagement = () => {
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(userFilters.search.toLowerCase()) || 
                           user.email.toLowerCase().includes(userFilters.search.toLowerCase());
      const matchesRole = userFilters.role === 'all' || user.role === userFilters.role;
      const matchesStatus = userFilters.status === 'all' || user.status === userFilters.status;
      return matchesSearch && matchesRole && matchesStatus;
    });

    return (
    <div className="space-y-6">
      <div className="hotel-card p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#c9a24a]/30">
          <h3 className="text-base font-semibold text-[#0f2742]">User Management</h3>
          <button
            onClick={() => setShowAddUser(true)}
            className="hotel-button-primary flex items-center space-x-2 px-4 py-2 font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-gray-50/50 rounded-lg border border-gray-200/60 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userFilters.search}
                onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff</option>
                <option value="kitchen">Kitchen</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={userFilters.status}
                onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {showAddUser && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-[#0f2742] mb-4">Add New User</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
              />
              <div className="flex items-center space-x-2 p-2">
                <input type="checkbox" id="isAdmin" checked={!!newUser.isAdmin} onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})} />
                <label htmlFor="isAdmin" className="text-sm">Is Admin</label>
              </div>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
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
                className="flex items-center space-x-2 bg-[#0f2742] text-white px-4 py-2 rounded-lg hover:bg-[#153456] transition-colors font-medium text-sm"
              >
                <Check className="h-4 w-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="hotel-button-secondary flex items-center space-x-2 px-4 py-2 text-sm font-medium"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f2742]">
              <tr className="border-b border-[#c9a24a]">
                <th className="text-left py-3 px-4 font-medium text-[#c9a24a]">User</th>
                <th className="text-left py-3 px-4 font-medium text-[#c9a24a]">Role</th>
                <th className="text-left py-3 px-4 font-medium text-[#c9a24a]">Status</th>
                <th className="text-left py-3 px-4 font-medium text-[#c9a24a]">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-[#c9a24a]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                return (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
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
                        <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

      {/* Edit user modal - Styled */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#0f2742] px-6 py-4 border-b border-[#c9a24a] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button
                onClick={() => setEditUser(null)}
                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={editUser.name || ''} onChange={(e) => setEditUser({...editUser, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editUser.email || ''} onChange={(e) => setEditUser({...editUser, email: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={editUser.role || 'staff'} onChange={(e) => setEditUser({...editUser, role: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all">
                  <option value="staff">Staff</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editUser.status || 'active'} onChange={(e) => setEditUser({...editUser, status: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input type="checkbox" id="isActive" checked={!!editUser.isActive} onChange={(e) => setEditUser({...editUser, isActive: e.target.checked})} />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">User is Active</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button onClick={() => setEditUser(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm transition-colors">Cancel</button>
                <button onClick={handleEditSave} className="px-4 py-2 rounded-lg bg-[#0f2742] text-white hover:bg-[#153456] font-medium text-sm transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal - Styled */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex items-center justify-between pt-4 space-x-2">
                <button onClick={() => setConfirmDelete({ open: false, userId: null })} className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm transition-colors">Cancel</button>
                <button onClick={confirmDeleteNow} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm transition-colors">Delete User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="hotel-card p-6">
        <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Security Settings</h3>
        <div className="space-y-6">
          <div className="border-t pt-6">
            <div className="space-y-4">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Change password form component
  function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPwd, setLoadingPwd] = useState(false);

    const submit = async () => {
      if (!currentPassword || !newPassword || !confirmPassword) return toast.error('Fill all password fields');
      if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
      setLoadingPwd(true);
      try {
        const res = await api.post(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword });
        toast.success(res.data.message || 'Password changed');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } catch (err) {
        console.error('Change password error', err);
        const msg = err.response?.data?.error || err.message || 'Failed to change password';
        toast.error(msg);
      } finally { setLoadingPwd(false); }
    };

    return (
      <div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]"
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
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24a] focus:border-[#c9a24a]" />
        </div><br/>
        <button disabled={loadingPwd} onClick={submit} className="hotel-button-primary px-5 py-2.5 font-medium text-sm disabled:opacity-60">
          {loadingPwd ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    );
  }

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="hotel-card p-6">
        <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Notification Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, email: !notifications.email})}
              className={`hotel-toggle ${notifications.email ? 'hotel-toggle-on' : 'hotel-toggle-off'}`}
            >
              <span className={`hotel-toggle-thumb ${notifications.email ? 'hotel-toggle-thumb-on' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, sms: !notifications.sms})}
              className={`hotel-toggle ${notifications.sms ? 'hotel-toggle-on' : 'hotel-toggle-off'}`}
            >
              <span className={`hotel-toggle-thumb ${notifications.sms ? 'hotel-toggle-thumb-on' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Types</h4>
          <div className="space-y-3">
            {Object.entries(notificationTypes).map(([id, enabled]) => {
              const labels = {
                reservations: 'New Reservations',
                walkins: 'Walk-in Customers',
                orders: 'New Orders',
                inventory: 'Low Stock Alerts',
                payments: 'Payment Confirmations',
                reviews: 'Customer Reviews',
                staff: 'Staff Updates'
              };
              return (
                <div key={id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">{labels[id] || id}</span>
                  <button
                    onClick={() => { setNotificationTypes(prev => ({ ...prev, [id]: !prev[id] })); toast.success(`${labels[id] || id} ${!enabled ? 'enabled' : 'disabled'}`); }}
                    className={`hotel-toggle hotel-toggle-sm ${enabled ? 'hotel-toggle-on' : 'hotel-toggle-off'}`}
                  >
                    <span className={`hotel-toggle-thumb ${enabled ? 'hotel-toggle-thumb-on' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );


  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="hotel-card p-6">
        <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">System Information</h3>
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

      <div className="hotel-card p-6">
        <h3 className="text-base font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-[#fffaf0] hover:bg-[#f6edd6] border border-[#ead8a8]/60 rounded-xl transition-colors">
            <RefreshCw className="h-5 w-5 text-[#9a7624]" />
            <span className="text-sm font-medium text-[#172033]">Check for Updates</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 rounded-xl transition-colors">
            <HardDrive className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-[#172033]">Clear Cache</span>
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

  const mainMargin = sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72';

  return (
    <div className="hotel-page flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 flex items-center bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header — matches Reservation Management exactly */}
        <div className="bg-[#0f2742] shadow-sm border-b border-[#c9a24a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-white/10 p-3 rounded-lg shadow-lg">
                  <Settings className="h-8 w-8 text-[#c9a24a]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#c9a24a] font-medium">System</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
                  <p className="text-white/60">Manage your hotel system preferences.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2 text-sm">
                <button
                  onClick={async () => {
                    try {
                      setRefreshing(true);
                      await Promise.all([fetchUsers(), fetchSettings()]);
                      toast.success('Refreshed data');
                    } catch (err) {
                      const msg = err.response?.data?.error || err.message || 'Failed to refresh';
                      toast.error(msg);
                    } finally {
                      setRefreshing(false);
                    }
                  }}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-lg border border-[#c9a24a]/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2 ${refreshing ? 'opacity-60 cursor-wait' : ''}`}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-[#c9a24a] text-[#0f2742] rounded-lg font-medium hover:bg-[#d4b55f] transition-colors shadow-sm border border-[#c9a24a] px-4 py-2 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 pt-2 pb-5 overflow-x-auto">
            <nav className="flex gap-2 min-w-max" aria-label="Tabs">
              {settingSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`${
                      isActive
                        ? 'bg-[#0f2742] text-white border-[#c9a24a] shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-[#0f2742] hover:border-[#c9a24a] hover:bg-[#fffaf0]'
                    } hotel-tab flex items-center space-x-2 px-4 py-3 border font-medium text-sm`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content — consistent full width prevents layout shift */}
        <div className="flex-1">
          <div className="px-4 sm:px-6 py-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;
