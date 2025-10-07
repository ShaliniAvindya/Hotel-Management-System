import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
import { API_BASE_URL } from '../../apiconfig';

const ROOMS_API_BASE_URL = `${API_BASE_URL}/rooms`; 
const RATES_API_BASE_URL = `${API_BASE_URL}/room-Rates`;

const RoomInventory = () => {
  const [rooms, setRooms] = useState([]);
  const [rates, setRates] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); 
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

  // Fetch rooms 
  const fetchRooms = async () => {
    try {
      const response = await axios.get(ROOMS_API_BASE_URL);
      setRooms(response.data);
      setFilteredRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchRates = async () => {
    try {
      const response = await axios.get(RATES_API_BASE_URL);
      setRates(response.data);
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRates();
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

  const handleAddRoom = async (roomData) => {
    try {
      const response = await axios.post(ROOMS_API_BASE_URL, roomData);
      if (response.status === 201) {
        const newRoom = response.data;
        // Sync to rate plan
        const existingRate = rates.find(r => r.rateType === 'ratePlan' && r.roomId === newRoom.id);
        if (existingRate) {
          const updatedRate = {
            ...existingRate,
            basePrice: newRoom.basePrice,
            weekendPrice: newRoom.weekendPrice
          };
          await axios.put(`${RATES_API_BASE_URL}/${existingRate._id}`, updatedRate);
        } else {
          const newRate = {
            rateType: 'ratePlan',
            name: `${newRoom.name}`,
            description: 'Default rate plan for the room',
            status: 'active',
            roomType: newRoom.type,
            roomId: newRoom.id,
            basePrice: newRoom.basePrice,
            weekendPrice: newRoom.weekendPrice,
            refundable: true,
            breakfastIncluded: false,
            inclusions: [],
            restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
          await axios.post(RATES_API_BASE_URL, newRate);
        }
        fetchRooms();
        fetchRates();
        setShowRoomForm(false);
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleEditRoom = async (roomData) => {
    try {
      const response = await axios.put(`${ROOMS_API_BASE_URL}/${roomData.id}`, roomData);
      if (response.status === 200) {
        const updatedRoom = response.data;
        // Sync to rate plan
        const existingRate = rates.find(r => r.rateType === 'ratePlan' && r.roomId === updatedRoom.id);
        if (existingRate) {
          const updatedRate = {
            ...existingRate,
            basePrice: updatedRoom.basePrice,
            weekendPrice: updatedRoom.weekendPrice
          };
          await axios.put(`${RATES_API_BASE_URL}/${existingRate._id}`, updatedRate);
        } else {
          const newRate = {
            rateType: 'ratePlan',
            name: `${updatedRoom.name}`,
            description: 'Default rate plan for the room',
            status: 'active',
            roomType: updatedRoom.type,
            roomId: updatedRoom.id,
            basePrice: updatedRoom.basePrice,
            weekendPrice: updatedRoom.weekendPrice,
            refundable: true,
            breakfastIncluded: false,
            inclusions: [],
            restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
          await axios.post(RATES_API_BASE_URL, newRate);
        }
        fetchRooms();
        fetchRates();
        setEditingRoom(null);
        setShowRoomForm(false);
      }
    } catch (error) {
      console.error('Error editing room:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await axios.delete(`${ROOMS_API_BASE_URL}/${roomId}`);
        if (response.status === 200) {
          // Delete associated rate plan
          const rateToDelete = rates.find(r => r.rateType === 'ratePlan' && r.roomId === roomId);
          if (rateToDelete) {
            await axios.delete(`${RATES_API_BASE_URL}/${rateToDelete._id}`);
          }
          fetchRooms();
          fetchRates();
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      }
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

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
          const response = await axios.post(
            'https://api.imgbb.com/1/upload?key=4e08e03047ee0d48610586ad270e2b39',
            formData
          );
          return response.data.data.url; 
        } catch (error) {
          console.error('Error uploading image to ImgBB:', error);
          return null;
        }
      });

      const urls = (await Promise.all(uploadPromises)).filter((url) => url !== null);
      setImageUrls((prev) => [...prev, ...urls]);
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
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
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {room ? 'Edit Room' : 'Add New Room'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 sm:p-3 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Capacity & Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Size (sq ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Room Images</h3>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Upload Images</span>
                  </button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Room ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="space-y-4">
                {Object.entries(groupedAmenities).map(([category, amenities]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {amenities.map((amenity) => {
                        const IconComponent = amenity.icon;
                        return (
                          <label
                            key={amenity.id}
                            className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
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
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <span className="text-sm sm:text-base">{amenity.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Notes */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description & Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Describe the room features, view, and special characteristics..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
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
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{room.name}</h2>
                <p className="text-sm text-gray-600">
                  Room {room.roomNumber} • {getRoomTypeName(room.type)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 sm:p-3 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Images */}
            {room.images && room.images.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Room Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {room.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${room.name} ${index + 1}`}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Room Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <span className="text-sm sm:text-base text-gray-600">Floor:</span>
                    <span className="text-sm sm:text-base font-medium">{room.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <span className="text-sm sm:text-base text-gray-600">Capacity:</span>
                    <span className="text-sm sm:text-base font-medium">
                      {room.capacity} guests (Max: {room.maxCapacity})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <span className="text-sm sm:text-base text-gray-600">Size:</span>
                    <span className="text-sm sm:text-base font-medium">{room.size} sq ft</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <span className="text-sm sm:text-base text-gray-600">Bookings:</span>
                    <span className="text-sm sm:text-base font-medium">{room.bookingHistory || 0} total</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <span className="text-sm sm:text-base text-gray-600">Base Price:</span>
                    <span className="text-sm sm:text-base font-medium">${room.basePrice}/night</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <span className="text-sm sm:text-base text-gray-600">Weekend Price:</span>
                    <span className="text-sm sm:text-base font-medium">${room.weekendPrice}/night</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {room.description && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{room.description}</p>
              </div>
            )}

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  {room.amenities.map((amenityId) => {
                    const amenity = availableAmenities.find((a) => a.id === amenityId);
                    if (!amenity) return null;
                    const IconComponent = amenity.icon;
                    return (
                      <div
                        key={amenityId}
                        className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        <span className="text-sm sm:text-base">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onEdit(room)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Edit Room</span>
              </button>
              <button
                onClick={() => onDelete(room.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Delete Room</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const RoomCard = ({ room, onView, onEdit, onDelete }) => {
    const amenitiesCount = room.amenities ? room.amenities.length : 0;
    const firstAmenities = (room.amenities || [])
      .slice(0, 2)
      .map((id) => availableAmenities.find((a) => a.id === id)?.name)
      .filter(Boolean);

    return (
      <div className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          {room.images && room.images.length > 0 ? (
            <img
              src={room.images[0]}
              alt={room.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          )}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{room.name}</h3>
          {room.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
              <span className="text-sm sm:text-base font-medium">{room.rating}</span>
            </div>
          )}
        </div>
        <div className="text-sm sm:text-base text-gray-600 mb-1">
          Room {room.roomNumber} • Floor {room.floor}
        </div>
        <div className="flex flex-wrap gap-2 text-sm sm:text-base text-gray-700 mb-1">
          <span>{room.capacity} guests</span>
          <span>Max {room.maxCapacity}</span>
          <span>{room.size} sq ft</span>
          <span className="font-semibold text-blue-600">${room.basePrice}/night</span>
        </div>
        <div className="text-sm sm:text-base text-gray-500 mb-2 truncate">
          {firstAmenities.join(' • ')}
          {amenitiesCount > 2 && (
            <span className="ml-2 text-xs sm:text-sm text-gray-400">+{amenitiesCount - 2} more</span>
          )}
        </div>
        <div className="flex justify-end items-center mt-2 space-x-2">
          <button
            onClick={() => onView(room)}
            className="p-2 sm:p-3 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onEdit(room)}
            className="p-2 sm:p-3 text-gray-400 hover:text-blue-600"
            title="Edit Room"
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onDelete(room.id)}
            className="p-2 sm:p-3 text-gray-400 hover:text-red-600"
            title="Delete Room"
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    );
  };

  const RoomListItem = ({ room, onView, onEdit, onDelete }) => {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex items-center space-x-3">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{room.name}</p>
              <p className="text-xs sm:text-sm text-gray-600">Room {room.roomNumber}</p>
            </div>
          </div>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm sm:text-base text-gray-900">{getRoomTypeName(room.type)}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm sm:text-base text-gray-900">{room.capacity}/{room.maxCapacity}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm sm:text-base text-gray-900">${room.basePrice}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm sm:text-base text-gray-900">Floor {room.floor}</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <span className="text-sm sm:text-base text-gray-900">{room.size} sq ft</span>
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          {room.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
              <span className="text-sm sm:text-base font-medium">{room.rating}</span>
            </div>
          )}
        </td>
        <td className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(room)}
              className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded"
              title="View Details"
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => onEdit(room)}
              className="p-2 sm:p-3 text-gray-600 hover:bg-gray-50 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters and Controls */}
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col items-start justify-between space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Add New Room</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <button
              onClick={fetchRooms}
              className="p-2 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Display */}
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Home className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {searchQuery || filterType !== 'all'
                  ? 'No rooms match your current filters.'
                  : 'Get started by adding your first room.'}
              </p>
              <button
                onClick={() => setShowRoomForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Add New Room</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Room</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Type</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Capacity</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Price</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Floor</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Size</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Rating</th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">Actions</th>
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