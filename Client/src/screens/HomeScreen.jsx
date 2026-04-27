import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
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
import { Chart, registerables } from 'chart.js/auto';
Chart.register(...registerables);
import { AuthContext } from '../components/context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../apiconfig';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

const Homescreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ bookings: [], rooms: [], menu: [] });
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'check-in', message: 'Room 201 ready for early check-in', time: '10 min ago', path: '/reservation-management' },
    { id: 2, type: 'maintenance', message: 'AC repair needed in Room 305', time: '25 min ago', path: '/room-management' },
    { id: 3, type: 'order', message: 'Kitchen: 3 orders pending', time: '5 min ago', path: '/restaurant-bar-management' }
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const bookingsChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const cachedDashboardSummary = queryClient.getQueryData(['dashboard-summary']);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const buildFallbackSummary = async () => {
    const [roomsRes, bookingsRes, ordersRes, maintenanceRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/rooms`),
      axios.get(`${API_BASE_URL}/bookings`),
      axios.get(`${API_BASE_URL}/orders`),
      axios.get(`${API_BASE_URL}/roomMaintenance`),
    ]);

    const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
    const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
    const maintenance = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : [];

    const today = new Date().toISOString().slice(0, 10);
    const occupiedRooms = rooms.filter(
      (r) => r.isOccupied || r.status === 'occupied' || r.occupancyStatus === 'occupied'
    ).length;
    const activeOrders = orders.filter((o) => !o.completed && o.status !== 'cancelled').length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const pendingMaintenance = maintenance.filter((m) => !m.resolved && m.status !== 'resolved').length;

    return {
      totalRooms: rooms.length,
      occupiedRooms,
      availableRooms: Math.max(rooms.length - occupiedRooms, 0),
      todaysBookings: bookings.filter((b) => b.checkInDate?.slice?.(0, 10) === today).length,
      totalBookings: bookings.length,
      activeOrders,
      totalOrders: orders.length,
      pendingOrders,
      pendingMaintenance,
      staffCount: 0,
      revenueFromPayments: 0,
      revenueFromOrders: orders.reduce((sum, o) => sum + Number(o.total || o.amount || 0), 0),
      bookingsSeries: [],
      rooms,
      recentBookings: bookings.slice(0, 10),
      recentOrders: orders.slice(0, 25),
      recentMaintenance: maintenance.slice(0, 8),
      _fallback: true,
    };
  };

  const { data: dashboardSummary = {} } = useQuery({
    queryKey: ['dashboard-summary'],
    initialData: cachedDashboardSummary,
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/summary`);
        return response.data;
      } catch (error) {
        return buildFallbackSummary();
      }
    },
  });

  const roomsData = useMemo(() => (Array.isArray(dashboardSummary.rooms) ? dashboardSummary.rooms : []), [dashboardSummary.rooms]);
  const bookingsData = useMemo(
    () => (Array.isArray(dashboardSummary.recentBookings) ? dashboardSummary.recentBookings : []),
    [dashboardSummary.recentBookings]
  );
  const ordersData = useMemo(
    () => (Array.isArray(dashboardSummary.recentOrders) ? dashboardSummary.recentOrders : []),
    [dashboardSummary.recentOrders]
  );
  const maintenanceData = useMemo(
    () => (Array.isArray(dashboardSummary.recentMaintenance) ? dashboardSummary.recentMaintenance : []),
    [dashboardSummary.recentMaintenance]
  );
  const paymentsData = [];
  const staffData = [];

  // helper: safe number coercion
  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const totalRooms = dashboardSummary?.totalRooms ?? roomsData.length;
  const occupiedRooms = dashboardSummary?.occupiedRooms ?? roomsData.filter((r) => r.isOccupied || r.status === 'occupied' || r.occupancyStatus === 'occupied').length;
  const availableRooms = dashboardSummary?.availableRooms ?? totalRooms - occupiedRooms;
  const todaysDateISO = new Date().toISOString().slice(0, 10);
  const todaysBookings = dashboardSummary?.todaysBookings ?? bookingsData.filter((b) => b.checkInDate?.slice?.(0, 10) === todaysDateISO).length;
  const activeOrders = dashboardSummary?.activeOrders ?? ordersData.filter((o) => !o.completed && o.status !== 'cancelled').length;
  const pendingMaintenance = dashboardSummary?.pendingMaintenance ?? maintenanceData.filter((m) => !m.resolved).length;
  const staffCount = dashboardSummary?.staffCount ?? staffData.length;

  const revenueFromPayments = dashboardSummary?.revenueFromPayments ?? paymentsData.reduce((s, p) => s + safeNumber(p.amount || p.total || p.value), 0);
  const revenueFromOrders = dashboardSummary?.revenueFromOrders ?? ordersData.reduce((s, o) => s + safeNumber(o.total || o.amount || o.grandTotal), 0);
  const revenueCollected = revenueFromPayments + revenueFromOrders;

  // bookings time series (last 12 months)
  const recentMonths = 12;
  const bookingsByMonthMap = {};
  for (let i = recentMonths - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    bookingsByMonthMap[key] = 0;
  }
  bookingsData.forEach((b) => {
    const kStr = b.createdAt || b.checkInDate;
    if (kStr) {
      const d = new Date(kStr);
      if (!isNaN(d.getTime())) {
        const k = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (bookingsByMonthMap.hasOwnProperty(k)) bookingsByMonthMap[k] += 1;
      }
    }
  });
  const bookingsLabels = Object.keys(bookingsByMonthMap);
  const bookingsValues = Object.values(bookingsByMonthMap);

  const revenueSplit = [
    { label: 'Payments', value: revenueFromPayments },
    { label: 'Orders', value: revenueFromOrders }
  ];

  const statStyles = {
    navy: { card: 'bg-white border-slate-200', icon: 'bg-[#0f2742] text-white', accent: 'text-[#0f2742]' },
  };

  const roomStatusStyles = {
    occupied: 'bg-rose-500',
    available: 'bg-emerald-500',
    cleaning: 'bg-amber-400',
    maintenance: 'bg-orange-500',
  };

  const resolveRoomLabel = (booking) => {
    const rid = booking.roomId || booking.room || booking.roomNumber || booking.room_id || booking.roomId?.toString?.();
    if (!rid) return booking.roomNumber || booking.room || '—';
    const room = roomsData.find(r => r.id === rid || r._id === rid || r.roomNumber === rid || String(r.id) === String(rid));
    if (room) {
      if (room.roomNumber && room.name) return `${room.roomNumber} — ${room.name}`;
      if (room.roomNumber) return room.roomNumber;
      if (room.name) return room.name;
    }
    return booking.roomNumber || booking.room || rid || '—';
  };

  const runSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults({ bookings: [], rooms: [], menu: [] });
      setSuggestionsVisible(false);
      return;
    }

    setSearchLoading(true);
    const needle = trimmed.toLowerCase();
    const bookings = bookingsData.filter((booking) =>
      [booking.guestName, booking.firstName, booking.lastName, booking.bookingReference, booking.roomNumber, resolveRoomLabel(booking)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
    const rooms = roomsData.filter((room) =>
      [room.roomNumber, room.name, room.type, room.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
    const menu = ordersData.filter((order) =>
      [order.table, order.status, order.orderNumber, order.customerName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );

    setSearchResults({ bookings, rooms, menu });
    setSuggestionsVisible(true);
    setSearchLoading(false);
  };

  // draw charts when data changes
  useEffect(() => {
    const bCtx = bookingsChartRef.current?.getContext?.('2d');
    let bookingsChart;
    if (bCtx) {
      bookingsChart = new Chart(bCtx, {
        type: 'line',
        data: {
          labels: bookingsLabels,
          datasets: [{
            label: 'Bookings',
            data: bookingsValues,
            borderColor: '#0f2742',
            backgroundColor: 'rgba(201,162,74,0.14)',
            tension: 0.35,
            pointRadius: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { maxRotation: 0, maxTicksLimit: 8 } }, y: { beginAtZero: true } }
        }
      });
    }

    const rCtx = revenueChartRef.current?.getContext?.('2d');
    let revenueChart;
    if (rCtx) {
      revenueChart = new Chart(rCtx, {
        type: 'doughnut',
        data: {
          labels: revenueSplit.map((r) => r.label),
          datasets: [{ data: revenueSplit.map((r) => r.value), backgroundColor: ['#0f2742', '#c9a24a'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    return () => {
      bookingsChart?.destroy();
      revenueChart?.destroy();
    };
  }, [bookingsLabels.join(','), bookingsValues.join(','), revenueFromPayments, revenueFromOrders]);

  const QuickActionCard = ({ icon: Icon, title, description, path }) => (
    <button
      onClick={() => navigate(path)}
      className="group relative hotel-card p-5 text-left overflow-hidden hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6edd6]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-center space-x-4">
        <div className="p-3 bg-[#0f2742] rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 group-hover:text-gray-700">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#c9a24a] transform group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </button>
  );

  const StatCard = ({ title, value, subtitle, icon: Icon = Activity }) => {
    return (
      <div className="hotel-stat-card bg-white border border-[#c9a24a]/40 p-6 hover:border-[#c9a24a]/60 transition-colors duration-300 shadow-sm rounded-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-gray-500 mb-2">{title}</p>
            <p className="text-4xl font-bold mb-1.5 tracking-tight text-[#0f2742] leading-none">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="h-13 w-13 rounded-xl bg-[#0f2742] flex items-center justify-center flex-shrink-0 ml-3 shadow-md" style={{ height: 52, width: 52 }}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const RoomStatusIndicator = ({ status, count }) => {
    const icons = {
      occupied: <Bed className="w-4 h-4 text-rose-500" />,
      available: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      cleaning: <RefreshCw className="w-4 h-4 text-amber-500" />,
      maintenance: <Wrench className="w-4 h-4 text-orange-500" />
    };
    const subtitles = {
      occupied: 'Currently in use',
      available: 'Ready for check-in',
      cleaning: 'Housekeeping',
      maintenance: 'Needs attention'
    };
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
            {icons[status] || <Bed className="w-4 h-4 text-[#0f2742]" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 capitalize">{status}</p>
            <p className="text-xs text-gray-500 font-medium">{subtitles[status]}</p>
          </div>
        </div>
        <div className="text-sm font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{count}</div>
      </div>
    );
  };

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
        <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-4 w-4 `} />
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
    <div className="hotel-page">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className="bg-white sticky top-0 z-30 border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="bg-[#0f2742] p-3 rounded-xl shadow-lg">
                    <ChefHat className="h-8 w-8 text-[#f4d891]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#9a7624] font-bold">Operations Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] leading-tight">The Luxury</h1>
                    <p className="text-sm text-gray-500 font-medium">
                      {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <div className="relative w-full md:w-auto" ref={searchRef}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reservations, tables, menu..."
                    className="hotel-input pl-12 pr-6 py-3 w-full md:w-96 transition-all duration-200 text-sm"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSuggestionsVisible(!!e.target.value); }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        await runSearch(searchQuery);
                      }
                    }}
                  />

                  {suggestionsVisible && (
                    <div className="absolute left-0 mt-2 w-full md:w-96 hotel-card shadow-xl z-40">
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">Search results for "{searchQuery}"</div>
                          <div className="text-xs text-gray-400">{searchLoading ? 'Searching...' : ''}</div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {searchResults.bookings.length} bookings, {searchResults.rooms.length} rooms, {searchResults.menu.length} orders
                        </div>
                      </div>
                      {/* category tabs that mirror sidebar sections */}
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => { navigate(`/reservation-management?q=${encodeURIComponent(searchQuery)}`); setSuggestionsVisible(false); }}
                            className="text-sm px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#f6edd6] text-gray-700"
                          >
                            Reservations
                          </button>
                          <button
                            onClick={() => { navigate(`/room-management?q=${encodeURIComponent(searchQuery)}`); setSuggestionsVisible(false); }}
                            className="text-sm px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#f6edd6] text-gray-700"
                          >
                            Rooms / Tables
                          </button>
                          <button
                            onClick={() => { navigate(`/restaurant-bar-management?q=${encodeURIComponent(searchQuery)}`); setSuggestionsVisible(false); }}
                            className="text-sm px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#f6edd6] text-gray-700"
                          >
                            Menu
                          </button>
                        </div>
                      </div>

                      <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                        <button onClick={() => { runSearch(searchQuery); }} className="text-sm text-blue-600"></button>
                        <button onClick={() => { setSuggestionsVisible(false); setSearchQuery(''); }} className="text-sm text-gray-500">Close</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button onClick={() => { navigate('/settings'); setSuggestionsVisible(false); }} className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-4 md:ml-3 md:pl-5 md:border-l border-gray-200">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-600">{user?.role ? (user.role === 'admin' ? 'Administrator' : user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Guest'}</p>
                  </div>
                  <div className="h-10 w-10 bg-[#c9a24a] rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">{(user?.name || 'G').split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      toast('Logged out');
                      navigate('/login');
                    }}
                    className="ml-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50">
          {/* Welcome Banner */}
          <div className="bg-[#0f2742] rounded-2xl p-8 flex items-center justify-between shadow-sm border border-[#0f2742]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Shalini'}!</h2>
              <p className="text-[#c9a24a] text-sm sm:text-base font-medium">Here is your property overview for {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
            </div>
            <div className="hidden sm:block p-4 bg-white/10 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-white opacity-80" />
            </div>
          </div>

          {/* Key Metrics - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Room Occupancy" value={`${occupiedRooms}/${totalRooms || 0}`} subtitle={`${totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0}% occupied`} tone="navy" icon={Bed} />
            <StatCard title="Today's Bookings" value={todaysBookings} subtitle={`${dashboardSummary?.totalBookings ?? bookingsData.length} total bookings`} tone="navy" icon={CalendarIcon} />
            <StatCard title="Revenue Collected" value={`$${revenueCollected.toLocaleString()}`} subtitle={`Payments $${revenueFromPayments.toLocaleString()}`} tone="navy" icon={DollarSign} />
            <StatCard title="Active Orders" value={activeOrders} subtitle={`${dashboardSummary?.totalOrders ?? ordersData.length} total orders`} tone="navy" icon={Utensils} />
          </div>

          {/* Second Row: Main Chart & Action Required */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Bookings Chart (Wider) */}
            <div className="lg:col-span-2 hotel-card border border-[#c9a24a]/30 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Bookings Trend (Last 12 Months)</h2>
                <div className="text-sm text-gray-500 bg-slate-50 px-3 py-1 rounded-full">Updated just now</div>
              </div>
              <div style={{ height: 280, width: '100%' }}>
                <canvas ref={bookingsChartRef} />
              </div>
            </div>

            {/* Notifications & Action Required (Side column) */}
            <div className="hotel-card border border-[#c9a24a]/30 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Action Required</h2>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">{maintenanceData.length} Tickets</span>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                {maintenanceData.length ? (
                  maintenanceData.slice(0, 8).map((m) => (
                    <div key={m._id || m.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                          <Wrench className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{m.title || m.issue || 'Maintenance'}</p>
                          <p className="text-xs text-gray-500 font-medium">Room {m.room || m.roomNumber || '—'}</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">{m.status || (m.resolved ? 'resolved' : 'pending')}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <CheckCircle className="w-8 h-8 text-emerald-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">All clear! No pending maintenance.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Third Row: Recent Reservations & Room Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Recent Bookings Table */}
            <div className="lg:col-span-2 hotel-card border border-[#c9a24a]/30 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Arrivals</h3>
                <button onClick={() => navigate('/reservation-management')} className="text-sm text-[#0f2742] font-bold hover:text-[#c9a24a] bg-slate-50 px-4 py-2 rounded-lg transition-colors border border-slate-100">View All</button>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-l-lg border-y border-slate-100">Guest Name</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-slate-100">Room</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-slate-100">Check-in</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-slate-100">Check-out</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-r-lg border-y border-slate-100">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsData.slice(0, 6).map((b) => {
                      const status = b.status || 'booked';
                      const statusClass = status === 'confirmed' || status === 'checked-in'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : status === 'cancelled' || status === 'no-show'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : status === 'checked-out'
                            ? 'bg-slate-50 text-slate-700 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-100';
                      return (
                        <tr key={b._id || b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-[#172033]">{b.guestName || b.guest?.name || '—'}</td>
                          <td className="px-4 py-4 text-gray-600 font-medium">{resolveRoomLabel(b)}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-4"><span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold capitalize ${statusClass}`}>{status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Room Status Overview (Side column) */}
            <div className="hotel-card border border-[#c9a24a]/30 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Live Room Status</h2>
                <button onClick={() => navigate('/room-management')} className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 mt-4">
                <RoomStatusIndicator status="occupied" count={occupiedRooms} />
                <RoomStatusIndicator status="available" count={availableRooms} />
                <RoomStatusIndicator status="cleaning" count={roomsData.filter(r => r.status === 'cleaning' || r.needsCleaning).length} />
                <RoomStatusIndicator status="maintenance" count={roomsData.filter(r => r.status === 'maintenance' || r.needsMaintenance).length} />
              </div>
            </div>
          </div>

          {/* Fourth Row: Active Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Restaurant Activity */}
            <div className="lg:col-span-2 hotel-card border border-[#c9a24a]/30 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Restaurant & Bar Operations</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Active Orders */}
                <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <Utensils className="w-5 h-5 text-[#c9a24a]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Active</p>
                      <p className="text-xs text-gray-500 font-medium">Current orders</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{activeOrders}</div>
                </div>

                {/* Pending Prep */}
                <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <ChefHat className="w-5 h-5 text-[#9a7624]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Pending</p>
                      <p className="text-xs text-gray-500 font-medium">To be prepared</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{dashboardSummary?.pendingOrders ?? ordersData.filter(o => o.status === 'pending').length}</div>
                </div>

                {/* Occupied Tables */}
                <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <Coffee className="w-5 h-5 text-[#0f2742]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Tables</p>
                      <p className="text-xs text-gray-500 font-medium">Occupied</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{ordersData.filter(o => o.table || o.tableId).map(o => o.table || o.tableId).length}</div>
                </div>

                {/* F&B Revenue */}
                <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Revenue</p>
                      <p className="text-xs text-gray-500 font-medium">F&B Total</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">${revenueFromOrders.toLocaleString()}</div>
                </div>

                {/* Completed Orders */}
                <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Completed</p>
                      <p className="text-xs text-gray-500 font-medium">Served orders</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{ordersData.filter(o => o.status === 'completed' || o.status === 'delivered').length}</div>
                </div>

                {/* Total Orders */}
                <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <ClipboardList className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Total</p>
                      <p className="text-xs text-gray-500 font-medium">All orders</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{ordersData.length}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-center border-t border-slate-100 pt-6">
                <button onClick={() => navigate('/restaurant-bar-management')} className="bg-gradient-to-r from-[#c9a24a] to-gray-100 text-[#0f2742] px-10 py-3 font-bold text-sm uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-3">
                  <Utensils className="w-4 h-4" />
                  <span>Manage Orders</span>
                </button>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="hotel-card border border-[#c9a24a]/30 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Revenue Split</h3>
                <div className="p-2 bg-[#fffaf0] rounded-lg border border-[#ead8a8]/30">
                  <DollarSign className="w-4 h-4 text-[#c9a24a]" />
                </div>
              </div>

              <div style={{ height: 260, width: '100%' }} className="mb-6 flex justify-center items-center relative">
                <canvas ref={revenueChartRef} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <Bed className="w-4 h-4 text-[#0f2742]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Payments</p>
                      <p className="text-[11px] text-gray-500 font-medium">Room charges</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">${revenueFromPayments.toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
                      <Utensils className="w-4 h-4 text-[#9a7624]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">F&B Orders</p>
                      <p className="text-[11px] text-gray-500 font-medium">Restaurant</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#0f2742] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">${revenueFromOrders.toLocaleString()}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0f2742]/45 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Homescreen;
