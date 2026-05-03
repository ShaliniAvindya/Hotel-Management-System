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
import { queryClient } from '../../lib/queryClient';
import notify from '../../utils/notify';

const RoomStatus = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const cachedRooms = queryClient.getQueryData(['rooms']) || [];
  const [rooms, setRooms] = useState(cachedRooms);
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
      const nextRooms = Array.isArray(response.data) ? response.data : [];
      setRooms(nextRooms);
      queryClient.setQueryData(['rooms'], nextRooms);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching rooms:', error);
      notify.error('Failed to fetch rooms');
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
    clean: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-100 border-green-200', icon: CheckCircle, label: 'Clean' },
    dirty: { color: 'bg-rose-50 text-rose-700 border border-rose-100 border-red-200', icon: XCircle, label: 'Dirty' },
    cleaning: { color: 'bg-gray-100 text-blue-800 border-[#c9a24a]/20', icon: Sparkles, label: 'In Cleaning' },
    'out-of-order': { color: 'bg-gray-100 text-gray-800 border-[#c9a24a]/30', icon: AlertTriangle, label: 'Out of Order' },
    maintenance: { color: 'bg-amber-50 text-amber-700 border border-amber-100 border-orange-200', icon: AlertTriangle, label: 'Maintenance' },
  };

  const getOccupancyColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'vacant': return 'bg-green-500';
      case 'out-of-order': return 'bg-gray-50/500';
      default: return 'bg-gray-50/500';
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
        notify.warning(`Room ${roomId.slice(1)} checkout complete - Cleaning required`);
        autoAssignHousekeeper(roomId);
      }
    } catch (error) {
      console.error('Error checking out room:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to checkout room';
      notify.error(msg);
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
          notify.info(`${assignedHousekeeper} assigned to Room ${roomId.slice(1)}`);
        }
      } catch (error) {
        console.error('Error assigning housekeeper:', error);
        notify.error('Failed to assign housekeeper');
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
        notify.success(`Room ${roomId.slice(1)} ${statusMessages[newStatus]}`);
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to update room status';
      notify.error(msg);
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
    return (
      <div className="bg-white border border-[#c9a24a]/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="h-1 w-full bg-[#c9a24a]" />
        <div className="p-3 sm:p-4 flex flex-col h-full">
          {/* Image Preview */}
          <div className="aspect-video bg-gray-50 rounded-lg mb-2 sm:mb-3 overflow-hidden border border-gray-100 relative">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <span className="text-xs text-slate-400">No Image Preview</span>
              </div>
            )}
            <span className={`absolute top-2 left-2 px-2 py-1 text-xs sm:text-sm font-medium rounded-full border ${statusConfig[room.status]?.color}`}>
              {statusConfig[room.status]?.label}
            </span>
            <button
              onClick={() => {
                setSelectedRoom(room);
                setShowRoomDetails(true);
              }}
              className="absolute top-2 right-2 p-2 bg-white hover:bg-gray-100 rounded-full shadow-md transition-colors"
            >
              <Eye size={18} className="text-[#0f2742]" />
            </button>

            {/* Action Buttons */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 sm:gap-2">
              {room.status !== 'clean' && (
                <button
                  onClick={() => updateRoomStatus(room.id, 'clean')}
                  className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded hover:bg-green-200 transition-colors font-medium whitespace-nowrap"
                >
                  Mark Clean
                </button>
              )}
              {room.status !== 'dirty' && (
                <button
                  onClick={() => updateRoomStatus(room.id, 'dirty')}
                  className="px-2 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-100 rounded hover:bg-red-200 transition-colors font-medium whitespace-nowrap"
                >
                  Mark Dirty
                </button>
              )}
              {room.status !== 'cleaning' && room.status !== 'out-of-order' && (
                <button
                  onClick={() => updateRoomStatus(room.id, 'cleaning')}
                  className="px-2 py-1 text-xs bg-gray-100 text-blue-800 rounded hover:bg-blue-200 transition-colors font-medium whitespace-nowrap"
                >
                  Start Cleaning
                </button>
              )}
              {room.status !== 'out-of-order' && (
                <button
                  onClick={() => updateRoomStatus(room.id, 'out-of-order')}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-800 border border-gray-300 rounded hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
                >
                  Out of Order
                </button>
              )}
              {room.occupancyStatus === 'occupied' && (
                <button
                  onClick={() => handleCheckout(room.id, room.guestName)}
                  className="px-2 py-1 text-xs bg-amber-50 text-amber-700 border border-amber-100 rounded hover:bg-orange-200 transition-colors font-medium whitespace-nowrap"
                >
                  Checkout
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#0f2742] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">{room.roomNumber}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-400">{room.type} • Floor {room.floor}</p>
                {room.guestName && <p className="text-xs text-[#0f2742] truncate font-medium">{room.guestName}</p>}
              </div>
            </div>
            {room.occupancyStatus === 'occupied' && (
              <span className="text-xs sm:text-sm text-slate-400 font-medium flex-shrink-0">Occupied</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <h3 className="font-semibold text-[#0f2742] text-sm sm:text-base truncate flex-1">{room.name}</h3>
            <span className="text-xs text-gray-500 font-medium flex-shrink-0">{room.cleaningDuration}min</span>
          </div>

          {room.status === 'cleaning' && room.cleaningStarted && (
            <div className="text-xs sm:text-sm text-blue-700 font-medium mb-2">
              Started: {new Date(room.cleaningStarted).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
          )}

          <div className="space-y-2 sm:space-y-3 flex-1">

            {room.housekeeperAssigned && (
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-[#0f2742] truncate">{room.housekeeperAssigned}</span>
              </div>
            )}

            {room.maintenanceNotes && (
              <div className="p-2 bg-gray-50/50 rounded-lg">
                <p className="text-xs text-slate-400 truncate">{room.maintenanceNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NotificationPanel = () => (
    <div className="absolute top-16 right-4 sm:right-6 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-[#c9a24a]/30 z-50">
      <div className="p-3 border-b border-[#c9a24a]/30">
        <h3 className="font-semibold text-[#0f2742] text-sm sm:text-base">Notifications</h3>
      </div>
      <div className="max-h-56 sm:max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">

            <p className="text-xs sm:text-sm">No new notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start space-x-2">
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${notification.type === 'success'
                    ? 'bg-green-500'
                    : notification.type === 'warning'
                      ? 'bg-orange-500'
                      : 'bg-gray-500'
                    }`}
                ></div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-[#0f2742] truncate">{notification.message}</p>
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
          <div className="p-4 sm:p-6 border-b border-[#c9a24a]/30 flex items-center justify-between bg-[#0f2742]">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">{selectedRoom.name}</h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Room {selectedRoom.roomNumber} Χ {selectedRoom.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowRoomDetails(false);
                setSelectedRoom(null);
              }}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#0f2742] mb-2">Current Status</label>
              <div className="flex items-center space-x-2">

                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusConfig[selectedRoom.status]?.color}`}>
                  {statusConfig[selectedRoom.status]?.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-3">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">

                    <span className="text-sm text-slate-400">Floor:</span>
                    <span className="text-sm font-medium">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">

                    <span className="text-sm text-slate-400">Capacity:</span>
                    <span className="text-sm font-medium">
                      {selectedRoom.capacity} guests (Max: {selectedRoom.maxCapacity})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">

                    <span className="text-sm text-slate-400">Size:</span>
                    <span className="text-sm font-medium">{selectedRoom.size} sq ft</span>
                  </div>
                  <div className="flex items-center space-x-2">

                    <span className="text-sm text-slate-400">Bookings:</span>
                    <span className="text-sm font-medium">{selectedRoom.bookingHistory} total</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-3">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">

                    <span className="text-sm text-slate-400">Base Price:</span>
                    <span className="text-sm font-medium">${selectedRoom.basePrice}/night</span>
                  </div>
                  <div className="flex items-center space-x-2">

                    <span className="text-sm text-slate-400">Weekend Price:</span>
                    <span className="text-sm font-medium">${selectedRoom.weekendPrice}/night</span>
                  </div>
                </div>
              </div>
            </div>

            {(selectedRoom.guestName || selectedRoom.checkInDate || selectedRoom.expectedCheckOut || selectedRoom.maintenanceNotes) && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-3">Booking & Status Details</h3>
                <div className="space-y-3">
                  {selectedRoom.guestName && (
                    <div>
                      <label className="block text-sm font-medium text-[#0f2742] mb-1">Current Guest</label>
                      <p className="text-sm text-[#0f2742] truncate">{selectedRoom.guestName}</p>
                    </div>
                  )}
                  {(selectedRoom.checkInDate || selectedRoom.expectedCheckOut) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedRoom.checkInDate && (
                        <div>
                          <label className="block text-sm font-medium text-[#0f2742] mb-1">Check-in</label>
                          <p className="text-sm text-[#0f2742]">
                            {new Date(selectedRoom.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {selectedRoom.expectedCheckOut && (
                        <div>
                          <label className="block text-sm font-medium text-[#0f2742] mb-1">Expected Check-out</label>
                          <p className="text-sm text-[#0f2742]">
                            {new Date(selectedRoom.expectedCheckOut).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedRoom.maintenanceNotes && (
                    <div>
                      <label className="block text-sm font-medium text-[#0f2742] mb-1">Maintenance Notes</label>
                      <p className="text-sm text-[#0f2742] bg-gray-50/50 p-3 rounded-lg truncate">{selectedRoom.maintenanceNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedRoom.lastCleaned && (
              <div>
                <label className="block text-sm font-medium text-[#0f2742] mb-1">Last Cleaned</label>
                <p className="text-sm text-[#0f2742]">{new Date(selectedRoom.lastCleaned).toLocaleString()}</p>
              </div>
            )}

            {selectedRoom.lastCheckOut && (
              <div>
                <label className="block text-sm font-medium text-[#0f2742] mb-1">Last Checkout</label>
                <p className="text-sm text-[#0f2742]">{new Date(selectedRoom.lastCheckOut).toLocaleString()}</p>
              </div>
            )}

            {selectedRoom.nextCheckIn && (
              <div>
                <label className="block text-sm font-medium text-[#0f2742] mb-1">Next Check-in</label>
                <p className="text-sm text-[#0f2742]">{new Date(selectedRoom.nextCheckIn).toLocaleString()}</p>
              </div>
            )}

            <div className="border-t border-[#c9a24a]/30 pt-4">
              <label className="block text-sm font-medium text-[#0f2742] mb-3">Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.status !== 'clean' && (
                  <button
                    onClick={() => {
                      updateRoomStatus(selectedRoom.id, 'clean');
                      setShowRoomDetails(false);
                    }}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm rounded-lg hover:bg-green-200"
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
                    className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 text-sm rounded-lg hover:bg-red-200"
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
                    className="px-3 py-1 bg-gray-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200"
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
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-lg hover:bg-white/10"
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
                    className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-sm rounded-lg hover:bg-orange-200"
                  >
                    Checkout
                  </button>
                )}
              </div>
            </div>

            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-3">Amenities</h3>
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
                        className="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg"
                      >
                        <IconComponent className="h-4 w-4 text-[#0f2742]" />
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedRoom.images && selectedRoom.images.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-3">Room Images</h3>
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
      className="min-h-screen bg-gray-50/50 transition-all duration-300 ease-in-out"
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

      <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
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
              className="px-3 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] flex items-center space-x-2 text-sm"
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
                className="h-4 w-4 sm:h-5 w-5 text-[#0f2742] focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs sm:text-sm text-slate-400">Auto-refresh</span>
            </div>
            <button className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-lg">

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

      <div className="px-6 py-4 bg-gray-50 border-b border-[#c9a24a]/20">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-4 h-4 sm:w-5 h-5 rounded border ${config.color}`}></div>

                <span className="text-xs sm:text-sm text-[#0f2742]">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-12">

              <h3 className="text-lg sm:text-xl font-medium text-[#0f2742] mb-2">No rooms found</h3>
              <p className="text-xs sm:text-sm text-slate-400">No rooms match your current filters.</p>
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



