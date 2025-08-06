import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Home,
  Bed,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Plus,
  Bell,
  Settings,
  Utensils,
  Coffee,
  Car,
  Wrench,
  ClipboardList,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Star,
  RefreshCw,
  Eye,
  Edit,
  ChefHat,
  Wine,
  ShoppingCart,
  Menu,
  Search,
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronRight,
  Zap,
} from 'lucide-react';

const Homescreen = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'check-in', message: 'Room 201 ready for early check-in', time: '10 min ago', path: '/reservation-management' },
    { id: 2, type: 'maintenance', message: 'AC repair needed in Room 305', time: '25 min ago', path: '/room-management' },
    { id: 3, type: 'order', message: 'Kitchen: 3 orders pending', time: '5 min ago', path: '/restaurant-bar-management' }
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const dashboardStats = {
    rooms: {
      total: 50,
      occupied: 32,
      available: 15,
      maintenance: 2,
      cleaning: 1
    },
    bookings: {
      today: 8,
      tomorrow: 12,
      thisWeek: 45,
      checkingIn: 5,
      checkingOut: 7
    },
    restaurant: {
      activeOrders: 12,
      pendingOrders: 4,
      todayRevenue: 2850,
      tablesOccupied: 8
    },
    revenue: {
      today: 15600,
      thisMonth: 245000,
      occupancyRate: 64
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const QuickActionCard = ({ icon: Icon, title, description, path, color = "blue" }) => (
    <button
      onClick={() => navigate(path)}
      className={`group relative bg-white p-5 rounded-2xl border border-gray-100 hover:border-${color}-200 hover:shadow-xl transition-all duration-300 text-left overflow-hidden hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative flex items-center space-x-4">
        <div className={`p-3 bg-gradient-to-br from-${color}-100 to-${color}-50 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 group-hover:text-gray-700">{description}</p>
        </div>
        <ChevronRight className={`h-5 w-5 text-gray-400 group-hover:text-${color}-600 transform group-hover:translate-x-1 transition-all duration-300`} />
      </div>
    </button>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
    <div className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${color}-100 to-transparent opacity-30 rounded-bl-full`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform duration-300">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-4 bg-gradient-to-br from-${color}-100 to-${color}-50 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-7 w-7 text-${color}-600`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const RoomStatusIndicator = ({ status, count, color }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <div className={`w-4 h-4 rounded-full bg-${color}-500 shadow-sm`}></div>
        <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
      </div>
      <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg">{count}</span>
    </div>
  );

  const NotificationItem = ({ notification }) => {
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'check-in': return CheckCircle;
        case 'maintenance': return Wrench;
        case 'order': return ChefHat;
        default: return Bell;
      }
    };

    const getNotificationColor = (type) => {
      switch (type) {
        case 'check-in': return 'green';
        case 'maintenance': return 'orange';
        case 'order': return 'blue';
        default: return 'gray';
      }
    };

    const Icon = getNotificationIcon(notification.type);
    const color = getNotificationColor(notification.type);

    return (
      <button
        onClick={() => navigate(notification.path)}
        className="group flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl w-full text-left transition-all duration-200 hover:-translate-y-0.5"
      >
        <div className={`p-2 bg-${color}-100 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {notification.time}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'ml-16' : 'ml-64'}`}>
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">The Luxury</h1>
                    <p className="text-gray-600 font-medium">Hotel Management System</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="relative hidden md:block">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reservations, tables, menu..."
                    className="pl-12 pr-6 py-3 w-96 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                    onChange={(e) => console.log('Search:', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notifications.length}
                    </span>
                  </button>
                  <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">Alex Chef</p>
                    <p className="text-xs text-gray-600">Restaurant Manager</p>
                  </div>
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">AC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Bed}
              title="Room Occupancy"
              value={`${dashboardStats.rooms.occupied}/${dashboardStats.rooms.total}`}
              subtitle={`${dashboardStats.revenue.occupancyRate}% occupied`}
              color="blue"
              trend="+5% from last week"
            />
            <StatCard
              icon={CalendarIcon}
              title="Today's Bookings"
              value={dashboardStats.bookings.today}
              subtitle={`${dashboardStats.bookings.checkingIn} check-ins, ${dashboardStats.bookings.checkingOut} check-outs`}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              title="Today's Revenue"
              value={`$${dashboardStats.revenue.today.toLocaleString()}`}
              subtitle="Rooms + F&B"
              color="emerald"
              trend="+12% from yesterday"
            />
            <StatCard
              icon={Utensils}
              title="Restaurant Orders"
              value={dashboardStats.restaurant.activeOrders}
              subtitle={`${dashboardStats.restaurant.pendingOrders} pending`}
              color="orange"
            />
          </div>

          {/* Enhanced Dashboard Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Room Status Overview */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Room Status</h2>
                </div>
                <button 
                  onClick={() => navigate('/room-management')}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <RoomStatusIndicator status="occupied" count={dashboardStats.rooms.occupied} color="red" />
                <RoomStatusIndicator status="available" count={dashboardStats.rooms.available} color="green" />
                <RoomStatusIndicator status="cleaning" count={dashboardStats.rooms.cleaning} color="yellow" />
                <RoomStatusIndicator status="maintenance" count={dashboardStats.rooms.maintenance} color="orange" />
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ready for guests</span>
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                    {dashboardStats.rooms.available} rooms
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="space-y-4">
                <QuickActionCard
                  icon={Plus}
                  title="New Booking"
                  description="Create walk-in reservation"
                  path="/reservation-management"
                  color="blue"
                />
                <QuickActionCard
                  icon={CheckCircle}
                  title="Check-in Guest"
                  description="Process guest arrival"
                  path="/reservation-management"
                  color="green"
                />
                <QuickActionCard
                  icon={ShoppingCart}
                  title="New Order"
                  description="Restaurant/Room service"
                  path="/restaurant-bar-management"
                  color="orange"
                />
                <QuickActionCard
                  icon={Wrench}
                  title="Report Issue"
                  description="Room maintenance request"
                  path="/room-management"
                  color="red"
                />
              </div>
            </div>

            {/* Enhanced Notifications */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Bell className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                </div>
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm">
                  {notifications.length} new
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
              <button className="mt-6 w-full text-center py-3 text-sm text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200">
                View all notifications
              </button>
            </div>
          </div>

          {/* Enhanced Activity Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Check-ins */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Today's Check-ins</h2>
                </div>
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                  {dashboardStats.bookings.checkingIn} pending
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', room: '201', time: '2:00 PM', status: 'confirmed' },
                  { name: 'Sarah Johnson', room: '305', time: '3:30 PM', status: 'pending' },
                  { name: 'Mike Davis', room: '102', time: '4:15 PM', status: 'confirmed' }
                ].map((checkin, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{checkin.name}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Room {checkin.room} • {checkin.time}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-2 text-xs font-bold rounded-xl ${
                      checkin.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {checkin.status}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/reservation-management')}
                className="mt-6 w-full text-center py-3 text-sm text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200"
              >
                View All Check-ins
              </button>
            </div>

            {/* Restaurant Activity */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Restaurant Activity</h2>
                </div>
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                  Live updates
                </span>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/restaurant-bar-management')}
                  className="group flex items-center justify-between w-full text-left p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <ChefHat className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="font-semibold text-gray-900">Kitchen Orders</p>
                      <p className="text-sm text-gray-600">4 orders in queue</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-xl">Active</span>
                    <ChevronRight className="h-4 w-4 text-orange-600" />
                  </div>
                </button>

                <button
                  onClick={() => navigate('/restaurant-bar-management')}
                  className="group flex items-center justify-between w-full text-left p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <Wine className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="font-semibold text-gray-900">Bar Service</p>
                      <p className="text-sm text-gray-600">Table 5 - 2 cocktails</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1 rounded-xl">Preparing</span>
                    <ChevronRight className="h-4 w-4 text-purple-600" />
                  </div>
                </button>

                <button
                  onClick={() => navigate('/restaurant-bar-management')}
                  className="group flex items-center justify-between w-full text-left p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <Coffee className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <p className="font-semibold text-gray-900">Room Service</p>
                      <p className="text-sm text-gray-600">Room 203 - Breakfast</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-xl">Ready</span>
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  </div>
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Today's F&B Revenue:</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                    ${dashboardStats.restaurant.todayRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/room-management')}
              className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Bed className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Room Management</h3>
                  <p className="text-sm text-gray-600">Manage rooms & bookings</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/reservation-management')}
              className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Reservations</h3>
                  <p className="text-sm text-gray-600">View booking calendar</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/restaurant-bar-management')}
              className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Utensils className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Restaurant</h3>
                  <p className="text-sm text-gray-600">Menu & order management</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/billing-management')}
              className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Billing</h3>
                  <p className="text-sm text-gray-600">Manage invoices & payments</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homescreen;
