import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Clock,
  Search,
  RefreshCw,
  Bell,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
  Users,
  UserCheck,
  LogIn,
  LogOut,
  Plus,
  X,
  Edit,
  Eye,
  Filter,
  Bed,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Bath,
  Utensils,
  Star,
  Mountain,
  Waves,
  TreePine,
  Sparkles as SparklesIcon,
  Sofa,
  Microwave,
  Refrigerator,
  WashingMachine,
  Shirt,
  Sun,
  Phone,
  Car,
  Volume2,
  Baby,
  Accessibility,
  PawPrint,
  Shield,
  MapPin,
  DollarSign,
  Menu,
  Settings,
  Calendar,
} from 'lucide-react';
import Sidebar from '../Sidebar';

const RoomStatus = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date(2025, 7, 5)); // August 5, 2025
  const [showNotifications, setShowNotifications] = useState(false);

  // Room data from RoomInventory.jsx
  const initialRooms = [
    {
      id: 'R001',
      roomNumber: '101',
      type: 'single',
      name: 'Deluxe Single Room',
      capacity: 1,
      maxCapacity: 2,
      basePrice: 120,
      weekendPrice: 150,
      floor: 1,
      size: 250,
      description: 'A comfortable single room with modern amenities and city view.',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'phone'],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&h=300&fit=crop',
      ],
      lastCleaned: '2025-08-05T10:00:00Z',
      maintenanceNotes: '',
      bookingHistory: 45,
      rating: 4.2,
      status: 'clean',
      occupancyStatus: 'vacant',
      nextCheckIn: '2025-08-05T15:00:00Z',
      lastCheckOut: '2025-08-05T11:00:00Z',
      housekeeperAssigned: 'Maria Santos',
      cleaningDuration: 30,
      guestName: null,
    },
    {
      id: 'R002',
      roomNumber: '201',
      type: 'double',
      name: 'Premium Double Room',
      capacity: 2,
      maxCapacity: 3,
      basePrice: 180,
      weekendPrice: 220,
      floor: 2,
      size: 350,
      description: 'Spacious double room with king-size bed and ocean view.',
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'oceanview', 'bathtub'],
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop',
      ],
      lastCleaned: '2025-08-04T14:00:00Z',
      maintenanceNotes: '',
      bookingHistory: 78,
      rating: 4.7,
      status: 'dirty',
      occupancyStatus: 'vacant',
      nextCheckIn: '2025-08-05T16:00:00Z',
      lastCheckOut: '2025-08-05T11:30:00Z',
      housekeeperAssigned: null,
      cleaningDuration: 45,
    },
    {
      id: 'R003',
      roomNumber: '301',
      type: 'suite',
      name: 'Executive Suite',
      capacity: 4,
      maxCapacity: 6,
      basePrice: 350,
      weekendPrice: 420,
      floor: 3,
      size: 600,
      description: 'Luxurious suite with separate living area and premium amenities.',
      amenities: ['wifi', 'tv', 'ac', 'kitchen', 'balcony', 'oceanview', 'bathtub', 'sofa', 'work_desk'],
      images: [
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=300&fit=crop',
      ],
      lastCleaned: null,
      maintenanceNotes: 'AC unit needs servicing',
      bookingHistory: 32,
      rating: 4.9,
      status: 'cleaning',
      occupancyStatus: 'vacant',
      nextCheckIn: '2025-08-05T17:00:00Z',
      lastCheckOut: '2025-08-05T12:00:00Z',
      housekeeperAssigned: 'Rosa Martinez',
      cleaningStarted: '2025-08-05T12:30:00Z',
      cleaningDuration: 60,
    },
  ];

  // Available amenities from RoomInventory.jsx
  const availableAmenities = [
    { id: 'wifi', name: 'Free WiFi', icon: Wifi, category: 'technology' },
    { id: 'tv', name: 'Flat Screen TV', icon: Tv, category: 'technology' },
    { id: 'ac', name: 'Air Conditioning', icon: AirVent, category: 'climate' },
    { id: 'minibar', name: 'Mini Bar', icon: Coffee, category: 'dining' },
    { id: 'kitchen', name: 'Kitchenette', icon: Utensils, category: 'dining' },
    { id: 'microwave', name: 'Microwave', icon: Microwave, category: 'dining' },
    { id: 'refrigerator', name: 'Refrigerator', icon: Refrigerator, category: 'dining' },
    { id: 'bathtub', name: 'Bathtub', icon: Bath, category: 'bathroom' },
    { id: 'balcony', name: 'Balcony', icon: Sun, category: 'view' },
    { id: 'oceanview', name: 'Ocean View', icon: Waves, category: 'view' },
    { id: 'mountainview', name: 'Mountain View', icon: Mountain, category: 'view' },
    { id: 'gardenview', name: 'Garden View', icon: TreePine, category: 'view' },
    { id: 'phone', name: 'Telephone', icon: Phone, category: 'technology' },
    { id: 'parking', name: 'Free Parking', icon: Car, category: 'service' },
    { id: 'laundry', name: 'Laundry Service', icon: Shirt, category: 'service' },
    { id: 'washer', name: 'Washing Machine', icon: WashingMachine, category: 'service' },
    { id: 'soundproof', name: 'Soundproofing', icon: Volume2, category: 'comfort' },
    { id: 'baby_crib', name: 'Baby Crib Available', icon: Baby, category: 'family' },
    { id: 'accessible', name: 'Wheelchair Accessible', icon: Accessibility, category: 'accessibility' },
    { id: 'pet_friendly', name: 'Pet Friendly', icon: PawPrint, category: 'policy' },
    { id: 'sofa', name: 'Sofa/Seating Area', icon: Sofa, category: 'comfort' },
    { id: 'work_desk', name: 'Work Desk', icon: Shield, category: 'business' },
  ];

  useEffect(() => {
    setRooms(initialRooms);
    setLastUpdated(new Date(2025, 7, 5)); // August 5, 2025

    const interval = setInterval(() => {
      if (autoRefresh) {
        setLastUpdated(new Date(2025, 7, 5));
        simulateRealTimeUpdates();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const simulateRealTimeUpdates = () => {
    setRooms(prevRooms => {
      return prevRooms.map(room => {
        if (Math.random() < 0.1 && room.status === 'cleaning') {
          const newRoom = {
            ...room,
            status: 'clean',
            lastCleaned: new Date(2025, 7, 5).toISOString(),
            cleaningStarted: null,
          };
          addNotification(`Room ${room.roomNumber} cleaning completed`, 'success');
          return newRoom;
        }
        return room;
      });
    });
  };

  const statusConfig = {
    clean: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Clean',
    },
    dirty: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      label: 'Dirty',
    },
    cleaning: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Sparkles,
      label: 'In Cleaning',
    },
    'out-of-order': {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertTriangle,
      label: 'Out of Order',
    },
  };

  const getOccupancyColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500';
      case 'vacant':
        return 'bg-green-500';
      case 'out-of-order':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(2025, 7, 5),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const handleCheckout = (roomId, guestName) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              status: 'dirty',
              occupancyStatus: 'vacant',
              lastCheckOut: new Date(2025, 7, 5).toISOString(),
              guestName: null,
              checkInDate: null,
              expectedCheckOut: null,
            }
          : room
      )
    );

    addNotification(`Room ${roomId.slice(1)} checkout complete - Cleaning required`, 'warning');
    autoAssignHousekeeper(roomId);
  };

  const autoAssignHousekeeper = (roomId) => {
    const availableHousekeepers = ['Maria Santos', 'Rosa Martinez', 'Linda Johnson', 'Carmen Rodriguez'];
    const assignedHousekeeper = availableHousekeepers[Math.floor(Math.random() * availableHousekeepers.length)];

    setTimeout(() => {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === roomId
            ? { ...room, housekeeperAssigned: assignedHousekeeper }
            : room
        )
      );
      addNotification(`${assignedHousekeeper} assigned to Room ${roomId.slice(1)}`, 'info');
    }, 2000);
  };

  const updateRoomStatus = (roomId, newStatus) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              status: newStatus,
              ...(newStatus === 'cleaning' && { cleaningStarted: new Date(2025, 7, 5).toISOString() }),
              ...(newStatus === 'clean' && { lastCleaned: new Date(2025, 7, 5).toISOString(), cleaningStarted: null }),
              ...(newStatus === 'out-of-order' && { maintenanceNotes: room.maintenanceNotes || 'Reason not specified' }),
            }
          : room
      )
    );

    const statusMessages = {
      clean: 'marked as clean',
      dirty: 'marked as dirty',
      cleaning: 'cleaning started',
      'out-of-order': 'marked out of order',
    };

    addNotification(`Room ${roomId.slice(1)} ${statusMessages[newStatus]}`, 'success');
    setLastUpdated(new Date(2025, 7, 5));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.housekeeperAssigned && room.housekeeperAssigned.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const RoomCard = ({ room }) => {
    const StatusIcon = statusConfig[room.status]?.icon || CheckCircle;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{room.roomNumber}</span>
              </div>
              <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full ${getOccupancyColor(room.occupancyStatus)}`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-600">{room.type} • Floor {room.floor}</p>
              {room.guestName && <p className="text-xs text-blue-600">{room.guestName}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedRoom(room);
              setShowRoomDetails(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className="h-4 w-4 text-gray-500" />
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig[room.status]?.color}`}>
                {statusConfig[room.status]?.label}
              </span>
            </div>
            {room.occupancyStatus === 'occupied' && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Occupied</span>
              </div>
            )}
          </div>

          {room.housekeeperAssigned && (
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{room.housekeeperAssigned}</span>
            </div>
          )}

          {room.status === 'cleaning' && room.cleaningStarted && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Started:{' '}
                {new Date(room.cleaningStarted).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )}

          {room.nextCheckIn && (
            <div className="flex items-center space-x-2">
              <LogIn className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Next:{' '}
                {new Date(room.nextCheckIn).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )}

          {room.maintenanceNotes && (
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">{room.maintenanceNotes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex space-x-1 flex-wrap gap-2">
              {room.status !== 'clean' && (
                <button
                  onClick={() => updateRoomStatus(room.id, 'clean')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Mark Clean
                </button>
              )}
              {room.status !== 'cleaning' && room.status !== 'out-of-order' && (
                <button
                  onClick={() => updateRoomStatus(room.id, 'cleaning')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Start Cleaning
                </button>
              )}
              {room.occupancyStatus === 'occupied' && (
                <button
                  onClick={() => handleCheckout(room.id, room.guestName)}
                  className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                >
                  Checkout
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{room.cleaningDuration}min</span>
          </div>
        </div>
      </div>
    );
  };

  const NotificationPanel = () => (
    <div className="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
              <div className="flex items-start space-x-2">
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${
                    notification.type === 'success'
                      ? 'bg-green-500'
                      : notification.type === 'warning'
                      ? 'bg-orange-500'
                      : 'bg-blue-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const RoomDetailsModal = () => {
    if (!showRoomDetails || !selectedRoom) return null;

    const StatusIcon = statusConfig[selectedRoom.status]?.icon || CheckCircle;

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-600">
                  Room {selectedRoom.roomNumber} • {selectedRoom.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowRoomDetails(false);
                setSelectedRoom(null);
              }}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-5 w-5 text-gray-500" />
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusConfig[selectedRoom.status]?.color}`}>
                  {statusConfig[selectedRoom.status]?.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Floor:</span>
                    <span className="text-sm font-medium">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">
                      {selectedRoom.capacity} guests (Max: {selectedRoom.maxCapacity})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="text-sm font-medium">{selectedRoom.size} sq ft</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Bookings:</span>
                    <span className="text-sm font-medium">{selectedRoom.bookingHistory} total</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <span className="text-sm font-medium">${selectedRoom.basePrice}/night</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Weekend Price:</span>
                    <span className="text-sm font-medium">${selectedRoom.weekendPrice}/night</span>
                  </div>
                </div>
              </div>
            </div>

            {(selectedRoom.guestName || selectedRoom.checkInDate || selectedRoom.expectedCheckOut || selectedRoom.maintenanceNotes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking & Status Details</h3>
                <div className="space-y-3">
                  {selectedRoom.guestName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Guest</label>
                      <p className="text-sm text-gray-900">{selectedRoom.guestName}</p>
                    </div>
                  )}
                  {(selectedRoom.checkInDate || selectedRoom.expectedCheckOut) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRoom.checkInDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedRoom.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {selectedRoom.expectedCheckOut && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Check-out</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedRoom.expectedCheckOut).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedRoom.maintenanceNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRoom.maintenanceNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedRoom.lastCleaned && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Cleaned</label>
                <p className="text-sm text-gray-900">{new Date(selectedRoom.lastCleaned).toLocaleString()}</p>
              </div>
            )}

            {selectedRoom.lastCheckOut && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Checkout</label>
                <p className="text-sm text-gray-900">{new Date(selectedRoom.lastCheckOut).toLocaleString()}</p>
              </div>
            )}

            {selectedRoom.nextCheckIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Check-in</label>
                <p className="text-sm text-gray-900">{new Date(selectedRoom.nextCheckIn).toLocaleString()}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.status !== 'clean' && (
                  <button
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, 'clean');
                      setShowRoomDetails(false);
                    }}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg hover:bg-green-200"
                  >
                    Mark Clean
                  </button>
                )}
                {selectedRoom.status !== 'dirty' && selectedRoom.status !== 'out-of-order' && (
                  <button
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, 'dirty');
                      setShowRoomDetails(false);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200"
                  >
                    Mark Dirty
                  </button>
                )}
                {selectedRoom.status !== 'cleaning' && selectedRoom.status !== 'out-of-order' && (
                  <button
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, 'cleaning');
                      setShowRoomDetails(false);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200"
                  >
                    Start Cleaning
                  </button>
                )}
                {selectedRoom.status !== 'out-of-order' && (
                  <button
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, 'out-of-order');
                      setShowRoomDetails(false);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-lg hover:bg-gray-200"
                  >
                    Out of Order
                  </button>
                )}
                {selectedRoom.occupancyStatus === 'occupied' && (
                  <button
                    onClick={() => {
                      handleCheckout(selectedRoom.id, selectedRoom.guestName);
                      setShowRoomDetails(false);
                    }}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-lg hover:bg-orange-200"
                  >
                    Process Checkout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  // Calculate sidebar offset
  const sidebarWidth = sidebarMinimized ? 4 : 16; // rem
  const sidebarOffset = sidebarOpen ? sidebarWidth : 0;

  return (
    <div
      className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out"
      style={{
        marginLeft: `${sidebarOffset}rem`,
        width: `calc(100% - ${sidebarOffset}rem)`,
      }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Filters and Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="clean">Clean</option>
                <option value="dirty">Dirty</option>
                <option value="cleaning">In Cleaning</option>
                <option value="out-of-order">Out of Order</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1 rounded ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredRooms.length} of {rooms.length} rooms
          {filterStatus !== 'all' && <span className="ml-2 text-blue-600">(filtered)</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600">No rooms match your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showRoomDetails && <RoomDetailsModal />}
    </div>
  );
};

export default RoomStatus;