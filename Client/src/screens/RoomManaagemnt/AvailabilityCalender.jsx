import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

const AvailabilityCalendar = ({ sidebarOpen, sidebarMinimized }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // August 1, 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Room data from RoomInventory.jsx
  const [rooms, setRooms] = useState([
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
      lastCleaned: '2024-01-15T10:00:00Z',
      maintenanceNotes: '',
      bookingHistory: 45,
      rating: 4.2,
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
      lastCleaned: '2024-01-14T14:00:00Z',
      maintenanceNotes: '',
      bookingHistory: 78,
      rating: 4.7,
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
      lastCleaned: '2024-01-13T09:00:00Z',
      maintenanceNotes: 'AC unit needs servicing',
      bookingHistory: 32,
      rating: 4.9,
    },
  ]);

  // Available amenities from RoomInventory.jsx
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

  // Sample availability data
  const [availability, setAvailability] = useState({});

  // Generate sample availability data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const generateAvailability = () => {
          const data = {};
          const today = new Date(2025, 7, 1); // Start from August 1, 2025

          rooms.forEach(room => {
            data[room.id] = {};

            for (let i = -30; i < 30; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              const dateKey = date.toISOString().split('T')[0];

              const rand = Math.random();
              let status = 'available';

              if (rand < 0.4) status = 'occupied';
              else if (rand < 0.55) status = 'reserved';
              else if (rand < 0.65) status = 'checkout';
              else if (rand < 0.75) status = 'cleaning';
              else if (rand < 0.8) status = 'maintenance';
              else if (rand < 0.85) status = 'blocked';

              data[room.id][dateKey] = {
                status,
                guest: status === 'occupied' || status === 'reserved' ? `Guest ${Math.floor(Math.random() * 100)}` : null,
                checkIn: status === 'occupied' && rand < 0.7 ? dateKey : null,
                checkOut: status === 'occupied' && rand < 0.7 ?
                  new Date(date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
                rate: status === 'occupied' || status === 'reserved' ? Math.floor(Math.random() * 200) + 100 : null,
                notes: status === 'maintenance' ? 'AC repair needed' :
                       status === 'cleaning' ? 'Deep cleaning' : null,
              };
            }
          });

          return data;
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        setAvailability(generateAvailability());
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch room availability. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rooms]);

  const statusConfig = {
    available: {
      color: 'bg-green-100 border-green-300 text-green-800',
      icon: CheckCircle,
      label: 'Available',
    },
    occupied: {
      color: 'bg-red-100 border-red-300 text-red-800',
      icon: Users,
      label: 'Occupied',
    },
    reserved: {
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      icon: Calendar,
      label: 'Reserved',
    },
    checkout: {
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      icon: Clock,
      label: 'Check-out',
    },
    cleaning: {
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      icon: RefreshCw,
      label: 'Cleaning',
    },
    maintenance: {
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      icon: Wrench,
      label: 'Maintenance',
    },
    blocked: {
      color: 'bg-gray-100 border-gray-300 text-gray-800',
      icon: X,
      label: 'Blocked',
    },
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getRoomStatus = (roomId, date) => {
    if (!date || !availability[roomId]) return null;
    const dateKey = getDateKey(date);
    return availability[roomId][dateKey] || { status: 'available' };
  };

  const filteredRooms = rooms.filter(room => {
    const matchesRoomType = filterRoomType === 'all' || room.type === filterRoomType;
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const daysInMonth = getDaysInMonth(currentDate);
      matchesStatus = daysInMonth.some(day => {
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

  const handleStatusUpdate = (roomId, date, statusData) => {
    const dateKey = getDateKey(date);
    setAvailability(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [dateKey]: {
          ...prev[roomId][dateKey],
          ...statusData,
        },
      },
    }));
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

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Update Room Status</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const RoomDetailsModal = () => {
    if (!showRoomDetails || !selectedRoom || !selectedDate) return null;

    const roomData = getRoomStatus(selectedRoom.id, selectedDate);
    const StatusIcon = statusConfig[roomData.status]?.icon || CheckCircle;

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-600">
                  Room {selectedRoom.roomNumber} • {roomTypes.find(rt => rt.id === selectedRoom.type)?.name || 'Unknown'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRoomDetails(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <p className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-5 w-5 text-gray-600" />
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${statusConfig[roomData.status]?.color}`}>
                  {statusConfig[roomData.status]?.label}
                </span>
              </div>
            </div>

            {selectedRoom.images && selectedRoom.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

            {selectedRoom.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRoom.description}</p>
              </div>
            )}

            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedRoom.amenities.map((amenityId) => {
                    const amenity = availableAmenities.find((a) => a.id === amenityId);
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

            {(roomData.guest || roomData.checkIn || roomData.checkOut || roomData.rate || roomData.notes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="space-y-3">
                  {roomData.guest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guest</label>
                      <p className="text-sm text-gray-900">{roomData.guest}</p>
                    </div>
                  )}
                  {(roomData.checkIn || roomData.checkOut) && (
                    <div className="grid grid-cols-2 gap-4">
                      {roomData.checkIn && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                          <p className="text-sm text-gray-900">
                            {new Date(roomData.checkIn).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {roomData.checkOut && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                          <p className="text-sm text-gray-900">
                            {new Date(roomData.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {roomData.rate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                      <p className="text-sm text-gray-900">${roomData.rate}</p>
                    </div>
                  )}
                  {roomData.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{roomData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowStatusForm(true);
                  setShowRoomDetails(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Status</span>
              </button>
              <button
                onClick={() => setShowRoomDetails(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  // Calculate left offset based on sidebar state
  const sidebarWidth = sidebarMinimized ? 4 : 16; // rem
  const sidebarOffset = sidebarOpen ? sidebarWidth : 0;

  // Calendar layout
  const daysInMonth = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out"
      style={{
        marginLeft: `${sidebarOffset}rem`,
        width: `calc(100% - ${sidebarOffset}rem)`,
      }}
    >
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => sidebarOpen(false)} // Assumes sidebarOpen is a setter function
        ></div>
      )}

      {error && (
        <div className="px-6 py-4 bg-red-100 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
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
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Room Types</option>
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterRoomType('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
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
              onClick={() => setCurrentDate(new Date(2025, 7, 1))}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border ${config.color}`}></div>
                <Icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <div className="grid grid-cols-[150px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-50 z-10 text-sm">Room</div>
            {weekDays.map((day, index) => (
              <div key={day} className="p-4 font-medium text-gray-900 text-center border-r border-gray-200 last:border-r-0 text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[150px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
          </div>
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-sm text-gray-600">No rooms match your current filters.</p>
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
                  <div key={`${room.id}-${weekIndex}`} className="grid grid-cols-[150px_repeat(7,1fr)] border-b border-gray-100 hover:bg-gray-50">
                    <div className="p-4 border-r border-gray-200 bg-white sticky left-0 z-10">
                      {weekIndex === 0 && (
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{room.roomNumber}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{room.name}</p>
                            <p className="text-xs text-gray-600">{roomTypes.find(rt => rt.id === room.type)?.name || 'Unknown'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {week.map((date, dayIndex) => {
                      const roomStatus = getRoomStatus(room.id, date);
                      const statusColor = roomStatus ? statusConfig[roomStatus.status]?.color : 'bg-gray-50';

                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] cursor-pointer transition-colors relative ${
                            date ? 'hover:bg-gray-100' : ''
                          }`}
                          onClick={() => date && handleCellClick(room, date)}
                        >
                          {date && roomStatus && (
                            <>
                              <div className="absolute top-1 left-1 text-xs bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-gray-700">
                                {date.getDate()}
                              </div>
                              <div className={`w-full h-full rounded border ${statusColor} flex items-center justify-center pt-4`}>
                                <div className="text-center">
                                  {roomStatus.guest && (
                                    <p className="text-xs truncate">{roomStatus.guest}</p>
                                  )}
                                  {roomStatus.rate && (
                                    <p className="text-sm font-medium">${roomStatus.rate}</p>
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