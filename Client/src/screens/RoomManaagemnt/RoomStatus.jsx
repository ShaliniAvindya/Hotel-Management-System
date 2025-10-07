import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { API_BASE_URL } from '../../apiconfig';

const RoomStatus = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`);
      setRooms(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => {
      if (autoRefresh) fetchRooms();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const statusConfig = {
    clean: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Clean' },
    dirty: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Dirty' },
    cleaning: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Sparkles, label: 'In Cleaning' },
    'out-of-order': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle, label: 'Out of Order' },
    maintenance: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Maintenance' },
  };

  const getOccupancyColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'vacant': return 'bg-green-500';
      case 'out-of-order': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const handleCheckout = async (roomId, guestName) => {
    try {
      const roomToUpdate = rooms.find(room => room.id === roomId);
      if (!roomToUpdate) return;

      const updatedRoom = {
        ...roomToUpdate,
        status: 'dirty',
        occupancyStatus: 'vacant',
        lastCheckOut: new Date().toISOString(),
        guestName: null,
        checkInDate: null,
        expectedCheckOut: null,
      };

      // Update Room
      const roomResponse = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, updatedRoom);

      // Update RoomAvailability
      const today = new Date().toISOString().split('T')[0];
      const availabilityResponse = await axios.get(`${API_BASE_URL}/roomAvailability/${roomId}`);
      let availabilityData = availabilityResponse.data ? availabilityResponse.data.availability : [];
      availabilityData = availabilityData.filter(entry => entry.date !== today);
      availabilityData.push({ date: today, status: 'checkout' });

      await axios.put(`${API_BASE_URL}/roomAvailability/${roomId}`, { availability: availabilityData });

      if (roomResponse.status === 200) {
        fetchRooms();
        addNotification(`Room ${roomId.slice(1)} checkout complete - Cleaning required`, 'warning');
        autoAssignHousekeeper(roomId);
      }
    } catch (error) {
      console.error('Error checking out room:', error);
    }
  };

  const autoAssignHousekeeper = async (roomId) => {
    const availableHousekeepers = ['Maria Santos', 'Rosa Martinez', 'Linda Johnson', 'Carmen Rodriguez'];
    const assignedHousekeeper = availableHousekeepers[Math.floor(Math.random() * availableHousekeepers.length)];

    setTimeout(async () => {
      try {
        const roomToUpdate = rooms.find(room => room.id === roomId);
        if (!roomToUpdate) return;

        const updatedRoom = { ...roomToUpdate, housekeeperAssigned: assignedHousekeeper };
        const response = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, updatedRoom);
        if (response.status === 200) {
          fetchRooms();
          addNotification(`${assignedHousekeeper} assigned to Room ${roomId.slice(1)}`, 'info');
        }
      } catch (error) {
        console.error('Error assigning housekeeper:', error);
      }
    }, 2000);
  };

  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      const roomToUpdate = rooms.find(room => room.id === roomId);
      if (!roomToUpdate) return;

      const updatedRoom = {
        ...roomToUpdate,
        status: newStatus,
        ...(newStatus === 'cleaning' && { cleaningStarted: new Date().toISOString() }),
        ...(newStatus === 'clean' && { lastCleaned: new Date().toISOString(), cleaningStarted: null }),
        ...(newStatus === 'out-of-order' && { maintenanceNotes: roomToUpdate.maintenanceNotes || 'Reason not specified' }),
        occupancyStatus: newStatus === 'maintenance' || newStatus === 'out-of-order' ? 'out-of-order' : roomToUpdate.occupancyStatus,
      };

      // Update Room
      const roomResponse = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, updatedRoom);

      // Update RoomAvailability
      const today = new Date().toISOString().split('T')[0];
      const availabilityResponse = await axios.get(`${API_BASE_URL}/roomAvailability/${roomId}`);
      let availabilityData = availabilityResponse.data ? availabilityResponse.data.availability : [];
      availabilityData = availabilityData.filter(entry => entry.date !== today);
      const availabilityStatus = newStatus === 'out-of-order' ? 'maintenance' : 
                                newStatus === 'clean' ? 'available' : 
                                newStatus === 'cleaning' ? 'cleaning' : 
                                newStatus;
      availabilityData.push({ date: today, status: availabilityStatus });

      await axios.put(`${API_BASE_URL}/roomAvailability/${roomId}`, { availability: availabilityData });

      if (roomResponse.status === 200) {
        fetchRooms();
        const statusMessages = {
          clean: 'marked as clean',
          dirty: 'marked as dirty',
          cleaning: 'cleaning started',
          'out-of-order': 'marked out of order',
          maintenance: 'marked for maintenance',
        };
        addNotification(`Room ${roomId.slice(1)} ${statusMessages[newStatus]}`, 'success');
      }
    } catch (error) {
      console.error('Error updating room status:', error);
    }
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">{room.roomNumber}</span>
              </div>
              <div className={`absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full ${getOccupancyColor(room.occupancyStatus)}`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{room.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{room.type} • Floor {room.floor}</p>
              {room.guestName && <p className="text-xs text-blue-600 truncate">{room.guestName}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedRoom(room);
              setShowRoomDetails(true);
            }}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <StatusIcon className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
              <span className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full border ${statusConfig[room.status]?.color}`}>
                {statusConfig[room.status]?.label}
              </span>
            </div>
            {room.occupancyStatus === 'occupied' && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600">Occupied</span>
              </div>
            )}
          </div>

          {room.housekeeperAssigned && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <UserCheck className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-700 truncate">{room.housekeeperAssigned}</span>
            </div>
          )}

          {room.status === 'cleaning' && room.cleaningStarted && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Clock className="h-4 w-4 sm:h-5 w-5 text-blue-500" />
              <span className="text-xs sm:text-sm text-blue-700">
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
            <div className="flex items-center space-x-1 sm:space-x-2">
              <LogIn className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-700">
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
              <p className="text-xs text-gray-600 truncate">{room.maintenanceNotes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 gap-2">
            <div className="flex flex-wrap gap-1 sm:gap-2">
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
    <div className="absolute top-16 right-4 sm:right-6 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
      </div>
      <div className="max-h-56 sm:max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs sm:text-sm">No new notifications</p>
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
                  <p className="text-xs sm:text-sm text-gray-900 truncate">{notification.message}</p>
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

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{selectedRoom.name}</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Room {selectedRoom.roomNumber} • {selectedRoom.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowRoomDetails(false);
                setSelectedRoom(null);
              }}
              className="p-2 sm:p-3 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusConfig[selectedRoom.status]?.color}`}>
                  {statusConfig[selectedRoom.status]?.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Floor:</span>
                    <span className="text-sm font-medium">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">
                      {selectedRoom.capacity} guests (Max: {selectedRoom.maxCapacity})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="text-sm font-medium">{selectedRoom.size} sq ft</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Bookings:</span>
                    <span className="text-sm font-medium">{selectedRoom.bookingHistory} total</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <span className="text-sm font-medium">${selectedRoom.basePrice}/night</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Weekend Price:</span>
                    <span className="text-sm font-medium">${selectedRoom.weekendPrice}/night</span>
                  </div>
                </div>
              </div>
            </div>

            {(selectedRoom.guestName || selectedRoom.checkInDate || selectedRoom.expectedCheckOut || selectedRoom.maintenanceNotes) && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Booking & Status Details</h3>
                <div className="space-y-3">
                  {selectedRoom.guestName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Guest</label>
                      <p className="text-sm text-gray-900 truncate">{selectedRoom.guestName}</p>
                    </div>
                  )}
                  {(selectedRoom.checkInDate || selectedRoom.expectedCheckOut) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg truncate">{selectedRoom.maintenanceNotes}</p>
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
                    Mark Out of Order
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
                    Checkout
                  </button>
                )}
              </div>
            </div>

            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedRoom.amenities.map((amenityId) => {
                    const amenity = [
                      { id: 'wifi', name: 'Free WiFi', icon: Wifi },
                      { id: 'tv', name: 'Flat Screen TV', icon: Tv },
                      { id: 'ac', name: 'Air Conditioning', icon: AirVent },
                      { id: 'minibar', name: 'Mini Bar', icon: Coffee },
                      { id: 'bathtub', name: 'Bathtub', icon: Bath },
                      { id: 'kitchen', name: 'Kitchenette', icon: Utensils },
                      { id: 'microwave', name: 'Microwave', icon: Microwave },
                      { id: 'refrigerator', name: 'Refrigerator', icon: Refrigerator },
                      { id: 'shower', name: 'Private Shower', icon: Bath },
                      { id: 'balcony', name: 'Balcony', icon: Sun },
                      { id: 'oceanview', name: 'Ocean View', icon: Waves },
                      { id: 'mountainview', name: 'Mountain View', icon: Mountain },
                      { id: 'gardenview', name: 'Garden View', icon: TreePine },
                      { id: 'phone', name: 'Telephone', icon: Phone },
                      { id: 'parking', name: 'Free Parking', icon: Car },
                      { id: 'laundry', name: 'Laundry Service', icon: Shirt },
                      { id: 'washer', name: 'Washing Machine', icon: WashingMachine },
                      { id: 'soundproof', name: 'Soundproofing', icon: Volume2 },
                      { id: 'baby_crib', name: 'Baby Crib Available', icon: Baby },
                      { id: 'accessible', name: 'Wheelchair Accessible', icon: Accessibility },
                      { id: 'pet_friendly', name: 'Pet Friendly', icon: PawPrint },
                      { id: 'sofa', name: 'Sofa/Seating Area', icon: Sofa },
                      { id: 'work_desk', name: 'Work Desk', icon: Shield },
                    ].find((a) => a.id === amenityId);
                    if (!amenity) return null;
                    const IconComponent = amenity.icon;
                    return (
                      <div
                        key={amenityId}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <IconComponent className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedRoom.images && selectedRoom.images.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Room Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedRoom.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedRoom.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const sidebarWidth = sidebarMinimized ? 4 : 16;
  const sidebarOffset = sidebarOpen ? sidebarWidth : 0;

  return (
    <div
      className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out"
      style={{
        marginLeft: `${sidebarOffset}rem`,
        width: `calc(100% - ${sidebarOffset}rem)`,
      }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="h-4 w-4 sm:h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-600">Auto-refresh</span>
            </div>
            <button className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            <span className="text-xs sm:text-sm text-gray-500">
              Last updated:{' '}
              {lastUpdated.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-4 h-4 sm:w-5 h-5 rounded border ${config.color}`}></div>
                <Icon className="h-4 w-4 sm:h-5 w-5 text-gray-600" />
                <span className="text-xs sm:text-sm text-gray-700">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Home className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-xs sm:text-sm text-gray-600">No rooms match your current filters.</p>
            </div>
          ) : (
            filteredRooms.map((room) => <RoomCard key={room.id} room={room} />)
          )}
        </div>
      </div>

      {notifications.length > 0 && <NotificationPanel />}
      {showRoomDetails && <RoomDetailsModal />}
    </div>
  );
};

export default RoomStatus;