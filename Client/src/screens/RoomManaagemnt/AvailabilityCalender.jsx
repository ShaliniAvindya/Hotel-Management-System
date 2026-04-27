import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  Wrench,
  X,
  Users,
  Bed,
  Home,
  Star,
  Mountain,
  Sparkles,
  Wifi,
  Tv,
  AirVent,
  Thermometer,
  Coffee,
  Utensils,
  Bath,
  Sun,
  Waves,
  TreePine,
  Phone,
  Car,
  Shirt,
  WashingMachine,
  Microwave,
  Refrigerator,
  Volume2,
  Baby,
  Accessibility,
  PawPrint,
  Sofa,
  Shield,
  Eye,
  Edit,
  MapPin,
  DollarSign,
  Split,
} from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';
import { queryClient } from '../../lib/queryClient';

const AvailabilityCalendar = ({ sidebarOpen, sidebarMinimized }) => {
  const cachedRooms = queryClient.getQueryData(['rooms']) || [];
  const cachedBookings = queryClient.getQueryData(['bookings']) || [];
  const cachedMaintenance = queryClient.getQueryData(['room-maintenance']) || [];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [loading, setLoading] = useState(
    () => cachedRooms.length === 0 && cachedBookings.length === 0 && cachedMaintenance.length === 0
  );
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState(cachedRooms);
  const [bookings, setBookings] = useState(cachedBookings);
  const [roomMaintenance, setRoomMaintenance] = useState(cachedMaintenance);

  const availableAmenities = [
    { id: 'wifi', name: 'Free WiFi', icon: Wifi, category: 'technology' },
    { id: 'tv', name: 'Flat Screen TV', icon: Tv, category: 'technology' },
    { id: 'ac', name: 'Air Conditioning', icon: AirVent, category: 'climate' },
    { id: 'heating', name: 'Heating', icon: Thermometer, category: 'climate' },
    { id: 'minibar', name: 'Mini Bar', icon: Coffee, category: 'dining' },
    { id: 'kitchen', name: 'Kitchenette', icon: Utensils, category: 'dining' },
    { id: 'microwave', name: 'Microwave', icon: Microwave, category: 'dining' },
    { id: 'refrigerator', name: 'Refrigerator', icon: Refrigerator, category: 'dining' },
    { id: 'bathtub', name: 'Bathtub', icon: Bath, category: 'bathroom' },
    { id: 'shower', name: 'Private Shower', icon: Bath, category: 'bathroom' },
    { id: 'balcony', name: 'Balcony', icon: Sun, category: 'view' },
    { id: 'oceanview', name: 'Ocean View', icon: Waves, category: 'view' },
    { id: 'mountainview', name: 'Mountain View', icon: Mountain, category: 'view' },
    { id: 'gardenview', name: 'Garden View', icon: TreePine, category: 'view' },
    { id: 'phone', name: 'Telephone', icon: Phone, category: 'technology' },
    { id: 'room_service', name: '24/7 Room Service', icon: Utensils, category: 'service' },
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

  const statusConfig = {
    available: { color: 'bg-green-100 border-green-300 text-green-800', icon: CheckCircle, label: 'Available' },
    occupied: { color: 'bg-red-100 border-red-300 text-red-800', icon: Users, label: 'Occupied' },
    reserved: { color: 'bg-gray-100 border-blue-300 text-blue-800', icon: Calendar, label: 'Reserved' },
    checkout: { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: Clock, label: 'Check-out' },
    cleaning: { color: 'bg-purple-100 border-purple-300 text-purple-800', icon: RefreshCw, label: 'Cleaning' },
    maintenance: { color: 'bg-orange-100 border-orange-300 text-orange-800', icon: Wrench, label: 'Maintenance' },
    blocked: { color: 'bg-gray-100 border-gray-300 text-gray-800', icon: X, label: 'Blocked' },
  };

  const roomTypes = [
    { id: 'single', name: 'Single Room', icon: Bed, defaultCapacity: 1 },
    { id: 'double', name: 'Double Room', icon: Bed, defaultCapacity: 2 },
    { id: 'twin', name: 'Twin Room', icon: Bed, defaultCapacity: 2 },
    { id: 'triple', name: 'Triple Room', icon: Bed, defaultCapacity: 3 },
    { id: 'suite', name: 'Suite', icon: Home, defaultCapacity: 4 },
    { id: 'presidential', name: 'Presidential Suite', icon: Star, defaultCapacity: 6 },
    { id: 'villa', name: 'Villa', icon: Mountain, defaultCapacity: 8 },
    { id: 'penthouse', name: 'Penthouse', icon: Sparkles, defaultCapacity: 10 },
  ];

  const fetchData = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      setError(null);
      const [roomsRes, bookingsRes, maintenanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/rooms`),
        axios.get(`${API_BASE_URL}/bookings`),
        axios.get(`${API_BASE_URL}/roomMaintenance`),
      ]);
      const nextRooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
      const nextBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const nextMaintenance = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : [];
      setRooms(nextRooms);
      setBookings(nextBookings);
      setRoomMaintenance(nextMaintenance);
      queryClient.setQueryData(['rooms'], nextRooms);
      queryClient.setQueryData(['bookings'], nextBookings);
      queryClient.setQueryData(['room-maintenance'], nextMaintenance);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDaysInMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), day));
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getDateKey = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRoomStatus = (roomId, date) => {
    if (!date) return { status: 'available', guest: null, booking: null };
    const dateKey = getDateKey(date);
    const todayKey = getDateKey(new Date());

    // Check maintenance tickets first
    const maintenanceTickets = roomMaintenance.filter(
      (ticket) =>
        ticket.roomId === roomId &&
        ticket.status !== 'completed' &&
        ticket.roomUnavailable &&
        dateKey >= ticket.scheduledStartDate &&
        (!ticket.scheduledEndDate || dateKey <= ticket.scheduledEndDate)
    );

    if (maintenanceTickets.length > 0) {
      return { status: 'maintenance', guest: null, booking: null };
    }

    // Check manual status 
    const room = rooms.find((r) => r.id === roomId);
    if (room && dateKey === todayKey) {
      if (room.status === 'cleaning') {
        return { status: 'cleaning', guest: null, booking: null };
      } else if (room.status === 'blocked') {
        return { status: 'blocked', guest: null, booking: null };
      }
    }

    // Check for bookings
    const overlappingBooking = bookings.find((booking) => {
      if (booking.status === 'cancelled' || booking.status === 'no-show' || booking.status === 'checked-out') return false;
      if (booking.roomId === roomId) {
        return getDateKey(new Date(booking.checkInDate)) <= dateKey && dateKey <= getDateKey(new Date(booking.checkOutDate));
      } else if (booking.splitStays && booking.splitStays.length > 0) {
        return booking.splitStays.some(
          (stay) => stay.roomId === roomId && getDateKey(new Date(stay.checkIn)) <= dateKey && dateKey <= getDateKey(new Date(stay.checkOut))
        );
      }
      return false;
    });

    if (overlappingBooking) {
      let status = 'available';
      if (overlappingBooking.status === 'confirmed') {
        status = 'reserved';
      } else if (overlappingBooking.status === 'checked-in') {
        status = 'occupied';
      }
      // Check if this is the check-out date
      const isCheckoutDate =
        dateKey === getDateKey(new Date(overlappingBooking.checkOutDate)) ||
        (overlappingBooking.splitStays &&
          overlappingBooking.splitStays.some(
            (stay) => stay.roomId === roomId && dateKey === getDateKey(new Date(stay.checkOut))
          ));
      if (isCheckoutDate) {
        status = 'checkout';
      }
      return {
        status,
        guest: `${overlappingBooking.firstName} ${overlappingBooking.lastName || ''}`,
        booking: overlappingBooking,
      };
    }

    // Automatically set cleaning status for check-out date
    const hasCheckout = bookings.some((booking) => {
      if (booking.status === 'cancelled' || booking.status === 'no-show' || booking.status === 'checked-out') return false;
      if (booking.roomId === roomId) {
        return dateKey === getDateKey(new Date(booking.checkOutDate));
      } else if (booking.splitStays && booking.splitStays.length > 0) {
        return booking.splitStays.some(
          (stay) => stay.roomId === roomId && dateKey === getDateKey(new Date(stay.checkOut))
        );
      }
      return false;
    });

    if (hasCheckout) {
      return { status: 'cleaning', guest: null, booking: null };
    }

    return { status: 'available', guest: null, booking: null };
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesRoomType = filterRoomType === 'all' || room.type === filterRoomType;
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const daysInMonth = getDaysInMonth(currentDate);
      matchesStatus = daysInMonth.some((day) => {
        if (!day) return false;
        const status = getRoomStatus(room.id, day);
        return status && status.status === filterStatus;
      });
    }
    return matchesRoomType && matchesStatus;
  });

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleCellClick = (room, date) => {
    if (!date) return;
    setSelectedRoom(room);
    setSelectedDate(date);
    setShowRoomDetails(true);
  };

  const handleStatusUpdate = async (roomId, date, statusData) => {
    const dateKey = getDateKey(date);
    try {
      const todayKey = getDateKey(new Date());
      if (dateKey === todayKey) {
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          const activeTickets = roomMaintenance.filter(
            (t) => t.roomId === roomId && t.status !== 'completed' && t.roomUnavailable
          );
          const startDates = activeTickets
            .map((t) => t.scheduledStartDate)
            .filter((d) => d)
            .sort();
          const maintenanceStartDate = statusData.status === 'maintenance' ? dateKey : startDates[0] || null;
          const maintenanceNotes = activeTickets.length > 0 ? activeTickets.map((t) => t.title).join('; ') : '';

          const updatedRoom = {
            ...room,
            status: statusData.status === 'available' ? 'clean' : statusData.status,
            occupancyStatus:
              statusData.status === 'occupied' ? 'occupied' :
                statusData.status === 'maintenance' ? 'out-of-order' :
                  statusData.status === 'blocked' ? 'out-of-order' : 'vacant',
            guestName: statusData.guest || null,
            checkInDate: statusData.checkIn || null,
            expectedCheckOut: statusData.checkOut || null,
            maintenanceStartDate,
            maintenanceNotes,
          };
          await axios.put(`${API_BASE_URL}/rooms/${roomId}`, updatedRoom);
          setRooms(rooms.map((r) => (r.id === roomId ? updatedRoom : r)));
        }
      }
    } catch (err) {
      console.error('Error updating room status:', err);
      setError('Failed to update room status. Please try again.');
    }
    setShowStatusForm(false);
  };

  const StatusForm = ({ room, date, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      status: getRoomStatus(room.id, date)?.status || 'available',
      guest: getRoomStatus(room.id, date)?.guest || '',
      checkIn: getRoomStatus(room.id, date)?.checkIn || '',
      checkOut: getRoomStatus(room.id, date)?.checkOut || '',
      rate: getRoomStatus(room.id, date)?.rate || '',
      notes: getRoomStatus(room.id, date)?.notes || '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        status: formData.status,
        guest: formData.status === 'occupied' || formData.status === 'reserved' ? formData.guest : null,
        checkIn: formData.status === 'occupied' ? formData.checkIn : null,
        checkOut: formData.status === 'occupied' ? formData.checkOut : null,
        rate: formData.status === 'occupied' || formData.status === 'reserved' ? parseFloat(formData.rate) || null : null,
        notes: formData.status === 'maintenance' || formData.status === 'cleaning' ? formData.notes : null,
      });
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-[#c9a24a]/30 flex items-center justify-between bg-[#0f2742]">
            <h2 className="text-xl font-semibold text-white">Update Room Status</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >

            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>
            {(formData.status === 'occupied' || formData.status === 'reserved') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={formData.guest}
                    onChange={(e) => setFormData({ ...formData, guest: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {formData.status === 'occupied' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
            {(formData.status === 'maintenance' || formData.status === 'cleaning') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-0 py-2 text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-0 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456]"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const RoomDetailsModal = () => {
    if (!showRoomDetails || !selectedRoom || !selectedDate) return null;
    const roomData = getRoomStatus(selectedRoom.id, selectedDate);
    const StatusIcon = statusConfig[roomData.status]?.icon || CheckCircle;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-[#c9a24a]/30 flex flex-col sm:flex-row items-center justify-between bg-[#0f2742] gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">

              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedRoom.name}</h2>
                <p className="text-sm text-slate-400">
                  Room {selectedRoom.roomNumber} â€¢ {roomTypes.find((rt) => rt.id === selectedRoom.type)?.name || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowStatusForm(true);
                  setShowRoomDetails(false);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center space-x-2 transition-colors border border-white/10"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm">Edit Status</span>
              </button>
              <div className="w-px h-8 bg-white/10 mx-1" />
              <button
                onClick={() => setShowRoomDetails(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >

              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-[#9a7624] uppercase tracking-[0.2em] mb-1">Date</label>
                <p className="text-base font-semibold text-[#0f2742]">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9a7624] uppercase tracking-[0.2em] mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="h-4 w-4 text-slate-400" />
                  <span className={`inline-flex px-3 py-0.5 text-xs font-bold rounded-full border ${statusConfig[roomData.status]?.color}`}>
                    {statusConfig[roomData.status]?.label}
                  </span>
                </div>
              </div>
            </div>

            {selectedRoom.maintenanceNotes && roomData.status === 'maintenance' && (
              <div>
                <label className="block text-[10px] font-bold text-[#9a7624] uppercase tracking-[0.2em] mb-1">Maintenance Notes</label>
                <p className="text-sm text-[#0f2742] bg-gray-50 p-4 rounded-lg border border-gray-100">{selectedRoom.maintenanceNotes}</p>
              </div>
            )}

            {selectedRoom.images && selectedRoom.images.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-[#0f2742] mb-3">Room Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedRoom.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedRoom.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-100 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
              <div>
                <h3 className="text-base font-bold text-[#0f2742] mb-4 flex items-center space-x-2">

                  <span>Room Information</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">

                      <span className="text-sm text-slate-500">Floor Level</span>
                    </div>
                    <span className="text-sm font-bold text-[#0f2742]">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Guest Capacity</span>
                    </div>
                    <span className="text-sm font-bold text-[#0f2742]">{selectedRoom.capacity} Guests (Max: {selectedRoom.maxCapacity})</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Room Size</span>
                    </div>
                    <span className="text-sm font-bold text-[#0f2742]">{selectedRoom.size} sq ft</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0f2742] mb-4 flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-[#c9a24a]" />
                  <span>Pricing Details</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-slate-500">Base Nightly Rate</span>
                    <span className="text-sm font-bold text-[#0f2742]">${selectedRoom.basePrice}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-slate-500">Weekend Rate</span>
                    <span className="text-sm font-bold text-[#0f2742]">${selectedRoom.weekendPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedRoom.description && (
              <div className="pt-6 border-t border-gray-50">
                <h3 className="text-base font-bold text-[#0f2742] mb-3">Room Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-gray-50 p-4 rounded-lg">{selectedRoom.description}</p>
              </div>
            )}

            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div className="pt-6 border-t border-gray-50">
                <h3 className="text-base font-bold text-[#0f2742] mb-3">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedRoom.amenities.map((amenityId) => {
                    const amenity = availableAmenities.find((a) => a.id === amenityId);
                    if (!amenity) return null;
                    const IconComponent = amenity.icon;
                    return (
                      <div key={amenityId} className="flex items-center space-x-2 p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <IconComponent className="h-3.5 w-3.5 text-[#c9a24a]" />
                        <span className="text-xs text-slate-600 font-medium">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(roomData.guest || roomData.checkIn || roomData.checkOut || roomData.rate || roomData.notes) && (
              <div className="pt-6 border-t border-[#c9a24a]/20">
                <h3 className="text-base font-bold text-[#0f2742] mb-4">Active Booking / Status Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                  {roomData.guest && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#9a7624] uppercase tracking-widest mb-1">Guest Name</span>
                      <span className="text-sm font-bold text-[#0f2742]">{roomData.guest}</span>
                    </div>
                  )}
                  {roomData.rate && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#9a7624] uppercase tracking-widest mb-1">Applied Rate</span>
                      <span className="text-sm font-bold text-[#0f2742]">${roomData.rate}</span>
                    </div>
                  )}
                  {roomData.checkIn && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#9a7624] uppercase tracking-widest mb-1">Check-in</span>
                      <span className="text-sm font-bold text-[#0f2742]">{new Date(roomData.checkIn).toLocaleDateString()}</span>
                    </div>
                  )}
                  {roomData.checkOut && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#9a7624] uppercase tracking-widest mb-1">Check-out</span>
                      <span className="text-sm font-bold text-[#0f2742]">{new Date(roomData.checkOut).toLocaleDateString()}</span>
                    </div>
                  )}
                  {roomData.notes && (
                    <div className="col-span-full flex flex-col pt-2 border-t border-gray-200/50 mt-2">
                      <span className="text-[10px] font-bold text-[#9a7624] uppercase tracking-widest mb-1">Status Notes</span>
                      <span className="text-sm text-[#0f2742] italic">"{roomData.notes}"</span>
                    </div>
                  )}
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
  const daysInMonth = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="h-screen bg-gray-50 transition-all duration-300 ease-in-out flex flex-col pb-12"
      style={{ marginLeft: `${sidebarOffset}rem`, width: `calc(100% - ${sidebarOffset}rem)` }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => sidebarOpen(false)}
        ></div>
      )}
      {error && (
        <div className="px-0 py-3 bg-red-100 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="px-6 py-3 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Room Types</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterRoomType('all');
              }}
              className="px-4 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] flex items-center space-x-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {formatDate(currentDate)}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => fetchData({ background: true })}
              className="p-2 text-slate-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-b border-[#c9a24a]/20">
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border ${config.color}`}></div>

                <span className="text-sm text-gray-700">{config.label}</span>
              </div>
            );
          })}
          <div className="flex items-center space-x-2">

            <span className="text-sm text-gray-700">Split Stay</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 px-0 py-0">
        <div className="bg-white border-t border-[#c9a24a]/30 overflow-x-auto flex-1">
          <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
            <div className="p-2 font-bold text-[#0f2742] border-r border-[#c9a24a]/10 sticky left-0 bg-gray-50 z-10 text-sm text-center">Room</div>
            {weekDays.map((day, index) => (
              <div key={day} className="p-4 font-medium text-gray-900 text-center border-r border-gray-200 last:border-r-0 text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200"></div>
          <div className="flex-1 overflow-y-auto overflow-y-auto">
            {loading && rooms.length === 0 ? (
              <div className="grid gap-3 p-4">
                <div className="h-16 rounded-lg bg-white border border-gray-200" />
                <div className="h-16 rounded-lg bg-white border border-gray-200" />
                <div className="h-16 rounded-lg bg-white border border-gray-200" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-12">

                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-sm text-slate-400">No rooms match your current filters.</p>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const weeks = [];
                let currentWeek = [];
                daysInMonth.forEach((date, index) => {
                  currentWeek.push(date);
                  if (currentWeek.length === 7 || index === daysInMonth.length - 1) {
                    weeks.push([...currentWeek]);
                    currentWeek = [];
                  }
                });

                return weeks.map((week, weekIndex) => (
                  <div key={`${room.id}-${weekIndex}`} className="grid grid-cols-[120px_repeat(7,1fr)] border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="p-4 border-r border-gray-200 bg-white sticky left-0 z-10">
                      {weekIndex === 0 && (
                        <div className="flex flex-col space-y-0.5 items-center text-center">
                          <span className="text-[10px] font-bold text-[#9a7624] tracking-widest uppercase">Room {room.roomNumber}</span>
                          <p className="font-semibold text-xs text-[#0f2742] leading-tight line-clamp-2">{room.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase">{roomTypes.find((rt) => rt.id === room.type)?.name || 'Unknown'}</p>
                        </div>
                      )}
                    </div>
                    {week.map((date, dayIndex) => {
                      const roomStatus = getRoomStatus(room.id, date);
                      const statusColor = roomStatus ? statusConfig[roomStatus.status]?.color : 'bg-gray-50';
                      const isFirstDay = roomStatus.booking && (
                        getDateKey(new Date(roomStatus.booking.checkInDate)) === getDateKey(date) ||
                        (roomStatus.booking.splitStays && roomStatus.booking.splitStays.some(
                          (stay) => getDateKey(new Date(stay.checkIn)) === getDateKey(date)
                        ))
                      );
                      const isSplitStay = roomStatus.booking?.splitStays?.some(
                        (stay) => stay.roomId === room.id && getDateKey(new Date(stay.checkIn)) <= getDateKey(date) && getDateKey(date) <= getDateKey(new Date(stay.checkOut))
                      );

                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] cursor-pointer transition-colors relative ${date ? 'hover:bg-gray-100' : ''}`}
                          onClick={() => date && handleCellClick(room, date)}
                        >
                          {date && (
                            <>
                              <div className="absolute top-1 left-1 text-xs bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-gray-700">
                                {date.getDate()}
                              </div>
                              <div className={`w-full h-full rounded border ${statusColor} flex items-center justify-center pt-4`}>
                                <div className="text-center">
                                  {roomStatus.guest && roomStatus.status !== 'cleaning' && roomStatus.status !== 'maintenance' && roomStatus.status !== 'blocked' && (
                                    <>
                                      <p className="text-xs font-medium truncate">{roomStatus.guest}</p>
                                      <p className="text-xs truncate opacity-90">{roomStatus.booking?.bookingReference || 'N/A'}</p>
                                      <div className="flex items-center justify-center space-x-1 mt-1">

                                        <span className="text-xs">{roomStatus.booking?.guests || 1}</span>


                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ));
              })
            )}
          </div>
        </div>
      </div>

      {showStatusForm && selectedRoom && selectedDate && (
        <StatusForm
          room={selectedRoom}
          date={selectedDate}
          onSave={(statusData) => handleStatusUpdate(selectedRoom.id, selectedDate, statusData)}
          onCancel={() => setShowStatusForm(false)}
        />
      )}
      {showRoomDetails && <RoomDetailsModal />}
    </div>
  );
};

export default AvailabilityCalendar;



