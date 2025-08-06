import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Camera,
  Bed,
  Users,
  Wifi,
  Tv,
  Car,
  Coffee,
  Bath,
  AirVent,
  Phone,
  Utensils,
  Star,
  MapPin,
  DollarSign,
  Eye,
  X,
  Save,
  RefreshCw,
  Grid,
  List,
  ImageIcon,
  Calendar,
  Shield,
  Thermometer,
  Volume2,
  Baby,
  Accessibility,
  PawPrint,
  Mountain,
  Waves,
  TreePine,
  Sparkles,
  Sofa,
  Microwave,
  Refrigerator,
  WashingMachine,
  Shirt,
  Wind,
  Sun,
} from 'lucide-react';

const RoomInventory = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Room types
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

  // Available amenities
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

  // Sample room data
  useEffect(() => {
    const sampleRooms = [
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
    ];
    setRooms(sampleRooms);
    setFilteredRooms(sampleRooms);
  }, []);

  // Filter rooms
  useEffect(() => {
    let filtered = rooms;

    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((room) => room.type === filterType);
    }

    setFilteredRooms(filtered);
  }, [rooms, searchQuery, filterType]);

  const getRoomTypeName = (type) => {
    const roomType = roomTypes.find((rt) => rt.id === type);
    return roomType ? roomType.name : 'Unknown';
  };

  const handleAddRoom = (roomData) => {
    const newRoom = {
      ...roomData,
      id: `R${String(rooms.length + 1).padStart(3, '0')}`,
      lastCleaned: new Date().toISOString(),
      bookingHistory: 0,
      rating: 0,
    };
    setRooms([...rooms, newRoom]);
    setShowRoomForm(false);
  };

  const handleEditRoom = (roomData) => {
    setRooms(rooms.map((room) => (room.id === roomData.id ? roomData : room)));
    setEditingRoom(null);
    setShowRoomForm(false);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter((room) => room.id !== roomId));
    }
  };

  const RoomForm = ({ room, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      room || {
        roomNumber: '',
        type: 'single',
        name: '',
        capacity: 1,
        maxCapacity: 2,
        basePrice: 0,
        weekendPrice: 0,
        floor: 1,
        size: 0,
        description: '',
        amenities: [],
        images: [],
        maintenanceNotes: '',
      }
    );
    const [selectedAmenities, setSelectedAmenities] = useState(formData.amenities || []);
    const [imageUrls, setImageUrls] = useState(formData.images || []);
    const fileInputRef = useRef(null);

    const handleAmenityToggle = (amenityId) => {
      const updated = selectedAmenities.includes(amenityId)
        ? selectedAmenities.filter((id) => id !== amenityId)
        : [...selectedAmenities, amenityId];
      setSelectedAmenities(updated);
      setFormData({ ...formData, amenities: updated });
    };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newUrl = event.target.result;
          setImageUrls((prev) => [...prev, newUrl]);
          setFormData((prev) => ({ ...prev, images: [...prev.images, newUrl] }));
        };
        reader.readAsDataURL(file);
      });
    };

    const removeImage = (index) => {
      const updatedUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(updatedUrls);
      setFormData({ ...formData, images: updatedUrls });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...formData, images: imageUrls });
    };

    const groupedAmenities = availableAmenities.reduce((acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    }, {});

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">
              {room ? 'Edit Room' : 'Add New Room'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Capacity & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Size (sq ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (per night)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekend Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weekendPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, weekendPrice: parseFloat(e.target.value) })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Images</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Images</span>
                  </button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Room ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="space-y-4">
                {Object.entries(groupedAmenities).map(([category, amenities]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {amenities.map((amenity) => {
                        const IconComponent = amenity.icon;
                        return (
                          <label
                            key={amenity.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                              selectedAmenities.includes(amenity.id)
                                ? 'bg-blue-100 border-blue-300 text-blue-900'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedAmenities.includes(amenity.id)}
                              onChange={() => handleAmenityToggle(amenity.id)}
                              className="sr-only"
                            />
                            <IconComponent className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{amenity.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Notes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description & Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the room features, view, and special characteristics..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
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
                {room ? 'Update Room' : 'Add Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const RoomDetails = ({ room, onClose, onEdit, onDelete }) => {
    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{room.name}</h2>
                <p className="text-sm text-gray-600">
                  Room {room.roomNumber} • {getRoomTypeName(room.type)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Images */}
            {room.images && room.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${room.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Room Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Floor:</span>
                    <span className="text-sm font-medium">{room.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">
                      {room.capacity} guests (Max: {room.maxCapacity})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="text-sm font-medium">{room.size} sq ft</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Bookings:</span>
                    <span className="text-sm font-medium">{room.bookingHistory} total</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <span className="text-sm font-medium">${room.basePrice}/night</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Weekend Price:</span>
                    <span className="text-sm font-medium">${room.weekendPrice}/night</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {room.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{room.description}</p>
              </div>
            )}

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenityId) => {
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

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onEdit(room)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Room</span>
              </button>
              <button
                onClick={() => onDelete(room.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Room</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const RoomCard = ({ room, onView, onEdit, onDelete }) => {
    // Get amenities count and first two amenities
    const amenitiesCount = room.amenities ? room.amenities.length : 0;
    const firstAmenities = (room.amenities || [])
      .slice(0, 2)
      .map((id) => availableAmenities.find((a) => a.id === id)?.name)
      .filter(Boolean);

    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          {room.images && room.images.length > 0 ? (
            <img
              src={room.images[0]}
              alt={room.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Camera className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-base">{room.name}</h3>
          {room.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{room.rating}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          Room {room.roomNumber} • Floor {room.floor}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-1">
          <span>{room.capacity} guests</span>
          <span>Max {room.maxCapacity}</span>
          <span>{room.size} sq ft</span>
          <span className="font-semibold text-blue-600">${room.basePrice}/night</span>
        </div>
        <div className="text-sm text-gray-500 mb-2">
          {firstAmenities.join(' • ')}
          {amenitiesCount > 2 && (
            <span className="ml-2 text-xs text-gray-400">+{amenitiesCount - 2} more</span>
          )}
        </div>
        <div className="flex justify-end items-center mt-2 space-x-2">
          <button
            onClick={() => onView(room)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(room)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit Room"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(room.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete Room"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const RoomListItem = ({ room, onView, onEdit, onDelete }) => {
    return (
          <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-4 px-4">
          <div className="flex items-center space-x-3">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
            <div>
              <p className="font-medium text-gray-900">{room.name}</p>
              <p className="text-sm text-gray-600">Room {room.roomNumber}</p>
            </div>
          </td>
     
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{getRoomTypeName(room.type)}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{room.capacity}/{room.maxCapacity}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">${room.basePrice}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">Floor {room.floor}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{room.size} sq ft</span>
        </td>
        <td className="py-4 px-4">
          {room.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{room.rating}</span>
            </div>
          )}
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(room)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(room)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters and Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowRoomForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Room</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Display */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all'
                  ? 'No rooms match your current filters.'
                  : 'Get started by adding your first room.'}
              </p>
              <button
                onClick={() => setShowRoomForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Room</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onView={(room) => {
                    setSelectedRoom(room);
                    setShowRoomDetails(true);
                  }}
                  onEdit={(room) => {
                    setEditingRoom(room);
                    setShowRoomForm(true);
                  }}
                  onDelete={handleDeleteRoom}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Capacity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Floor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <RoomListItem
                      key={room.id}
                      room={room}
                      onView={(room) => {
                        setSelectedRoom(room);
                        setShowRoomDetails(true);
                      }}
                      onEdit={(room) => {
                        setEditingRoom(room);
                        setShowRoomForm(true);
                      }}
                      onDelete={handleDeleteRoom}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRoomForm && (
        <RoomForm
          room={editingRoom}
          onSave={editingRoom ? handleEditRoom : handleAddRoom}
          onCancel={() => {
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
        />
      )}

      {showRoomDetails && selectedRoom && (
        <RoomDetails
          room={selectedRoom}
          onClose={() => {
            setShowRoomDetails(false);
            setSelectedRoom(null);
          }}
          onEdit={(room) => {
            setEditingRoom(room);
            setShowRoomForm(true);
            setShowRoomDetails(false);
          }}
          onDelete={handleDeleteRoom}
        />
      )}
    </div>
  );
};

export default RoomInventory;