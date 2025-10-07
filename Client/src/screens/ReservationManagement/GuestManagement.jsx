import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  User,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  X,
  Save,
  RefreshCw,
  Grid,
  List,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Star,
  Crown,
  Award,
  History,
  Heart,
  Users,
  Bed,
  UserCheck,
  Flag,
  Gift,
  Clock,
  CheckCircle,
  Shield,
  Coffee,
  Car,
  Wifi,
  AirVent,
  Baby,
  PawPrint,
  Utensils
} from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';

const GuestForm = ({ guest, onSave, onCancel, rooms }) => {
  const [formData, setFormData] = useState(
    guest || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      idType: 'passport',
      idNumber: '',
      dateOfBirth: '',
      vipLevel: 'none',
      status: 'active',
      preferences: [],
      specialRequests: [],
      emergencyContact: { name: '', phone: '', relationship: '' },
      notes: ''
    }
  );
  const [selectedPreferences, setSelectedPreferences] = useState(formData.preferences || []);
  const [specialRequests, setSpecialRequests] = useState(
    Array.isArray(formData.specialRequests)
      ? formData.specialRequests.join('\n')
      : (formData.specialRequests || '')
  );

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Italy',
    'Spain', 'Netherlands', 'South Korea', 'Singapore', 'UAE', 'Other'
  ];

  const vipLevels = [
    { id: 'none', name: 'Regular Guest', color: 'gray', icon: User },
    { id: 'bronze', name: 'Bronze VIP', color: 'orange', icon: Award },
    { id: 'silver', name: 'Silver VIP', color: 'gray', icon: Star },
    { id: 'gold', name: 'Gold VIP', color: 'yellow', icon: Crown },
    { id: 'platinum', name: 'Platinum VIP', color: 'purple', icon: Gift }
  ];

  const guestStatuses = [
    { id: 'all', name: 'All Guests', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'blue' },
    { id: 'blacklisted', name: 'Blacklisted', color: 'red' },
    { id: 'inactive', name: 'Inactive', color: 'gray' }
  ];

  const preferenceCategories = [
    {
      id: 'room',
      name: 'Room Preferences',
      options: [
        { id: 'high_floor', name: 'High Floor', icon: Shield },
        { id: 'low_floor', name: 'Low Floor', icon: Shield },
        { id: 'ocean_view', name: 'Ocean View', icon: Eye },
        { id: 'city_view', name: 'City View', icon: Eye },
        { id: 'quiet_room', name: 'Quiet Room', icon: Shield },
        { id: 'connecting_rooms', name: 'Connecting Rooms', icon: Users }
      ]
    },
    {
      id: 'amenities',
      name: 'Amenity Preferences',
      options: [
        { id: 'wifi', name: 'High-Speed WiFi', icon: Wifi },
        { id: 'ac', name: 'Air Conditioning', icon: AirVent },
        { id: 'minibar', name: 'Mini Bar', icon: Coffee },
        { id: 'room_service', name: 'Room Service', icon: Utensils },
        { id: 'parking', name: 'Parking Space', icon: Car },
        { id: 'baby_crib', name: 'Baby Crib', icon: Baby }
      ]
    },
    {
      id: 'dietary',
      name: 'Dietary Preferences',
      options: [
        { id: 'vegetarian', name: 'Vegetarian', icon: Heart },
        { id: 'vegan', name: 'Vegan', icon: Heart },
        { id: 'gluten_free', name: 'Gluten Free', icon: Heart },
        { id: 'kosher', name: 'Kosher', icon: Heart },
        { id: 'halal', name: 'Halal', icon: Heart },
        { id: 'diabetic', name: 'Diabetic Friendly', icon: Heart }
      ]
    },
    {
      id: 'special',
      name: 'Special Requirements',
      options: [
        { id: 'wheelchair_accessible', name: 'Wheelchair Accessible', icon: Shield },
        { id: 'pet_friendly', name: 'Pet Friendly', icon: PawPrint },
        { id: 'no_smoking', name: 'Non-Smoking', icon: Shield },
        { id: 'early_checkin', name: 'Early Check-in', icon: Calendar },
        { id: 'late_checkout', name: 'Late Check-out', icon: Calendar }
      ]
    }
  ];

  const handlePreferenceToggle = (preferenceId) => {
    const updated = selectedPreferences.includes(preferenceId)
      ? selectedPreferences.filter(id => id !== preferenceId)
      : [...selectedPreferences, preferenceId];
    setSelectedPreferences(updated);
    setFormData({ ...formData, preferences: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields.');
      return;
    }
    const requestsArray = specialRequests.split('\n').filter(req => req.trim());
    onSave({
      ...formData,
      preferences: selectedPreferences,
      specialRequests: requestsArray
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {guest ? 'Edit Guest' : 'Add New Guest'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Nationality</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full address..."
                />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Guest Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIP Level</label>
                <select
                  value={formData.vipLevel}
                  onChange={(e) => setFormData({ ...formData, vipLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vipLevels.map((level) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {guestStatuses.filter(s => s.id !== 'all').map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spouse, Parent, Friend"
                />
              </div>
            </div>
          </div>

          {/* Guest Preferences */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Preferences</h3>
            <div className="space-y-4">
              {preferenceCategories.map(category => (
                <div key={category.id}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {category.options.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedPreferences.includes(option.id)
                              ? 'bg-blue-100 border-blue-300 text-blue-900'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPreferences.includes(option.id)}
                            onChange={() => handlePreferenceToggle(option.id)}
                            className="sr-only"
                          />
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{option.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Requests & Notes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests & Notes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests (one per line)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Extra towels&#10;Late check-in&#10;Hypoallergenic pillows"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Internal notes about guest preferences, behavior, etc."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{guest ? 'Update Guest' : 'Add Guest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const GuestDetails = ({ guest, rooms, onClose, onEdit, onDelete }) => {
  const vipLevels = [
    { id: 'none', name: 'Regular Guest', color: 'gray', icon: User },
    { id: 'bronze', name: 'Bronze VIP', color: 'orange', icon: Award },
    { id: 'silver', name: 'Silver VIP', color: 'gray', icon: Star },
    { id: 'gold', name: 'Gold VIP', color: 'yellow', icon: Crown },
    { id: 'platinum', name: 'Platinum VIP', color: 'purple', icon: Gift }
  ];
  const guestStatuses = [
    { id: 'all', name: 'All Guests', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'blue' },
    { id: 'blacklisted', name: 'Blacklisted', color: 'red' },
    { id: 'inactive', name: 'Inactive', color: 'gray' }
  ];
  const preferenceCategories = [
    {
      id: 'room',
      name: 'Room Preferences',
      options: [
        { id: 'high_floor', name: 'High Floor', icon: Shield },
        { id: 'low_floor', name: 'Low Floor', icon: Shield },
        { id: 'ocean_view', name: 'Ocean View', icon: Eye },
        { id: 'city_view', name: 'City View', icon: Eye },
        { id: 'quiet_room', name: 'Quiet Room', icon: Shield },
        { id: 'connecting_rooms', name: 'Connecting Rooms', icon: Users }
      ]
    },
    {
      id: 'amenities',
      name: 'Amenity Preferences',
      options: [
        { id: 'wifi', name: 'High-Speed WiFi', icon: Wifi },
        { id: 'ac', name: 'Air Conditioning', icon: AirVent },
        { id: 'minibar', name: 'Mini Bar', icon: Coffee },
        { id: 'room_service', name: 'Room Service', icon: Utensils },
        { id: 'parking', name: 'Parking Space', icon: Car },
        { id: 'baby_crib', name: 'Baby Crib', icon: Baby }
      ]
    },
    {
      id: 'dietary',
      name: 'Dietary Preferences',
      options: [
        { id: 'vegetarian', name: 'Vegetarian', icon: Heart },
        { id: 'vegan', name: 'Vegan', icon: Heart },
        { id: 'gluten_free', name: 'Gluten Free', icon: Heart },
        { id: 'kosher', name: 'Kosher', icon: Heart },
        { id: 'halal', name: 'Halal', icon: Heart },
        { id: 'diabetic', name: 'Diabetic Friendly', icon: Heart }
      ]
    },
    {
      id: 'special',
      name: 'Special Requirements',
      options: [
        { id: 'wheelchair_accessible', name: 'Wheelchair Accessible', icon: Shield },
        { id: 'pet_friendly', name: 'Pet Friendly', icon: PawPrint },
        { id: 'no_smoking', name: 'Non-Smoking', icon: Shield },
        { id: 'early_checkin', name: 'Early Check-in', icon: Calendar },
        { id: 'late_checkout', name: 'Late Check-out', icon: Calendar }
      ]
    }
  ];

  const vipLevel = vipLevels.find(v => v.id === guest.vipLevel) || vipLevels[0];
  const statusInfo = guestStatuses.find(s => s.id === guest.status) || guestStatuses[0];
  const VipIcon = vipLevel.icon;

  const getPreferenceName = (prefId) => {
    for (const category of preferenceCategories) {
      const pref = category.options.find(opt => opt.id === prefId);
      if (pref) return pref.name;
    }
    return prefId;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              vipLevel.color === 'yellow' ? 'bg-yellow-100' :
              vipLevel.color === 'purple' ? 'bg-purple-100' :
              vipLevel.color === 'orange' ? 'bg-orange-100' :
              'bg-blue-100'
            }`}>
              <VipIcon className={`h-5 w-5 ${
                vipLevel.color === 'yellow' ? 'text-yellow-600' :
                vipLevel.color === 'purple' ? 'text-purple-600' :
                vipLevel.color === 'orange' ? 'text-orange-600' :
                'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{guest.firstName} {guest.lastName}</h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  vipLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  vipLevel.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                  vipLevel.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {vipLevel.name}
                </span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                  statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {statusInfo.name}
                </span>
              </div>
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
          {/* Guest Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stays</p>
                  <p className="text-xl font-semibold text-gray-900">{guest.totalStays}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-xl font-semibold text-gray-900">${guest.totalSpent}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Stay</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {guest.lastStay ? new Date(guest.lastStay).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{guest.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium">{guest.phone}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-medium">{guest.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Full Name:</span>
                <span className="text-sm font-medium">{guest.firstName} {guest.lastName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Date of Birth:</span>
                <span className="text-sm font-medium">
                  {guest.dateOfBirth ? new Date(guest.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Nationality:</span>
                <span className="text-sm font-medium">{guest.nationality || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">ID:</span>
                <span className="text-sm font-medium">
                  {guest.idType.replace('_', ' ').toUpperCase()} - {guest.idNumber || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {guest.emergencyContact && (guest.emergencyContact.name || guest.emergencyContact.phone) && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium">{guest.emergencyContact.name || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium">{guest.emergencyContact.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Relationship:</span>
                  <span className="text-sm font-medium">{guest.emergencyContact.relationship || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Guest Preferences */}
          {guest.preferences && guest.preferences.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Guest Preferences</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {guest.preferences.map(prefId => (
                  <div key={prefId} className="bg-white rounded-lg p-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{getPreferenceName(prefId)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Requests & Notes */}
          {(guest.specialRequests?.length > 0 || guest.notes) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests & Notes</h3>
              <div className="space-y-3">
                {guest.specialRequests?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Special Requests:</h4>
                    <ul className="space-y-1">
                      {guest.specialRequests.map((request, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{request}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guest.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Internal Notes:</h4>
                    <p className="text-gray-700 bg-white p-3 rounded-lg">{guest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stay History */}
          {guest.stayHistory && guest.stayHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <History className="h-5 w-5 text-green-600" />
                <span>Stay History</span>
              </h3>
              <div className="space-y-3">
                {guest.stayHistory.map((stay, index) => {
                  const room = rooms.find(r => r.id === stay.roomId);
                  return (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Bed className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Room {stay.roomNumber} - {room?.name || 'Unknown Room'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(stay.checkIn).toLocaleDateString()} - {new Date(stay.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${stay.amount}</p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            stay.status === 'completed' ? 'bg-green-100 text-green-800' :
                            stay.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stay.status.charAt(0).toUpperCase() + stay.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEdit(guest)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Guest</span>
            </button>
            <button
              onClick={() => onDelete(guest.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const GuestCard = ({ guest, onView, onEdit, onDelete }) => {
  const vipLevels = [
    { id: 'none', name: 'Regular Guest', color: 'gray', icon: User },
    { id: 'bronze', name: 'Bronze VIP', color: 'orange', icon: Award },
    { id: 'silver', name: 'Silver VIP', color: 'gray', icon: Star },
    { id: 'gold', name: 'Gold VIP', color: 'yellow', icon: Crown },
    { id: 'platinum', name: 'Platinum VIP', color: 'purple', icon: Gift }
  ];
  const guestStatuses = [
    { id: 'all', name: 'All Guests', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'blue' },
    { id: 'blacklisted', name: 'Blacklisted', color: 'red' },
    { id: 'inactive', name: 'Inactive', color: 'gray' }
  ];
  const vipLevel = vipLevels.find(v => v.id === guest.vipLevel) || vipLevels[0];
  const statusInfo = guestStatuses.find(s => s.id === guest.status) || guestStatuses[0];
  const VipIcon = vipLevel.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {guest.firstName} {guest.lastName}
            </h3>
            <p className="text-sm text-gray-600">{guest.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {guest.vipLevel !== 'none' && (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              vipLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              vipLevel.color === 'purple' ? 'bg-purple-100 text-purple-800' :
              vipLevel.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {vipLevel.name}
            </span>
          )}
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
            statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {statusInfo.name}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Phone:</span>
          <span className="font-medium">{guest.phone}</span>
        </div>
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <span className="text-gray-600">Address:</span>
          <span className="font-medium">{guest.address || 'Not provided'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Total Stays:</span>
          <span className="font-medium">{guest.totalStays}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Total Spent:</span>
          <span className="font-semibold text-green-600">${guest.totalSpent}</span>
        </div>
        {guest.lastStay && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Last Stay:</span>
            <span className="font-medium">{new Date(guest.lastStay).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(guest)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(guest)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit Guest"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(guest.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete Guest"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const GuestListItem = ({ guest, onView, onEdit, onDelete }) => {
  const vipLevels = [
    { id: 'none', name: 'Regular Guest', color: 'gray', icon: User },
    { id: 'bronze', name: 'Bronze VIP', color: 'orange', icon: Award },
    { id: 'silver', name: 'Silver VIP', color: 'gray', icon: Star },
    { id: 'gold', name: 'Gold VIP', color: 'yellow', icon: Crown },
    { id: 'platinum', name: 'Platinum VIP', color: 'purple', icon: Gift }
  ];
  const guestStatuses = [
    { id: 'all', name: 'All Guests', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'blue' },
    { id: 'blacklisted', name: 'Blacklisted', color: 'red' },
    { id: 'inactive', name: 'Inactive', color: 'gray' }
  ];
  const vipLevel = vipLevels.find(v => v.id === guest.vipLevel) || vipLevels[0];
  const statusInfo = guestStatuses.find(s => s.id === guest.status) || guestStatuses[0];
  const VipIcon = vipLevel.icon;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            vipLevel.color === 'yellow' ? 'bg-yellow-100' :
            vipLevel.color === 'purple' ? 'bg-purple-100' :
            vipLevel.color === 'orange' ? 'bg-orange-100' :
            'bg-blue-100'
          }`}>
            <VipIcon className={`h-4 w-4 ${
              vipLevel.color === 'yellow' ? 'text-yellow-600' :
              vipLevel.color === 'purple' ? 'text-purple-600' :
              vipLevel.color === 'orange' ? 'text-orange-600' :
              'text-blue-600'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{guest.firstName} {guest.lastName}</p>
            <p className="text-sm text-gray-600">{guest.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-gray-900">{guest.phone}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-gray-900">{guest.address || 'Not provided'}</span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          vipLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          vipLevel.color === 'purple' ? 'bg-purple-100 text-purple-800' :
          vipLevel.color === 'orange' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {vipLevel.name}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
          statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
          statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {statusInfo.name}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-gray-900">{guest.totalStays}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm font-semibold text-green-600">${guest.totalSpent}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-gray-900">
          {guest.lastStay ? new Date(guest.lastStay).toLocaleDateString() : 'Never'}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(guest)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(guest)}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(guest.id)}
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

const GuestManagement = () => {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [rooms, setRooms] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const guestStatuses = [
    { id: 'all', name: 'All Guests', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'checked-out', name: 'Checked Out', color: 'blue' },
    { id: 'blacklisted', name: 'Blacklisted', color: 'red' },
    { id: 'inactive', name: 'Inactive', color: 'gray' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [guestsRes, roomsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/guests`),
          axios.get(`${API_BASE_URL}/rooms`)
        ]);
        setGuests(guestsRes.data);
        setFilteredGuests(guestsRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = guests;

    if (searchQuery) {
      filtered = filtered.filter(
        (guest) =>
          guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.phone.includes(searchQuery) ||
          guest.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((guest) => guest.status === filterStatus);
    }

    setFilteredGuests(filtered);
  }, [guests, searchQuery, filterStatus]);

  const handleAddGuest = async (guestData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/guests`, guestData);
      setGuests([...guests, response.data]);
      setShowGuestForm(false);
    } catch (err) {
      alert('Failed to add guest');
    }
  };

  const handleEditGuest = async (guestData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/guests/${guestData.id}`, guestData);
      setGuests(guests.map((guest) => (guest.id === guestData.id ? response.data : guest)));
      setEditingGuest(null);
      setShowGuestForm(false);
    } catch (err) {
      alert('Failed to update guest');
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await axios.delete(`${API_BASE_URL}/guests/${guestId}`);
        setGuests(guests.filter((guest) => guest.id !== guestId));
      } catch (err) {
        alert('Failed to delete guest');
      }
    }
  };

  const totalGuests = guests.length;
  const vipGuests = guests.filter(g => g.vipLevel !== 'none').length;
  const activeGuests = guests.filter(g => g.status === 'active').length;
  const avgStaysPerGuest = guests.length > 0 ? (guests.reduce((sum, g) => sum + g.totalStays, 0) / guests.length).toFixed(1) : 0;

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Stats */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Guests</p>
                <p className="text-xl font-semibold text-gray-900">{totalGuests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">VIP Guests</p>
                <p className="text-xl font-semibold text-gray-900">{vipGuests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Guests</p>
                <p className="text-xl font-semibold text-gray-900">{activeGuests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Stays</p>
                <p className="text-xl font-semibold text-gray-900">{avgStaysPerGuest}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {guestStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowGuestForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Guest</span>
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

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== 'all'
                  ? 'No guests match your current filters.'
                  : 'Get started by adding your first guest.'}
              </p>
              <button
                onClick={() => setShowGuestForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Guest</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onView={(guest) => {
                    setSelectedGuest(guest);
                    setShowGuestDetails(true);
                  }}
                  onEdit={(guest) => {
                    setEditingGuest(guest);
                    setShowGuestForm(true);
                  }}
                  onDelete={handleDeleteGuest}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Guest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Address</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">VIP Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stays</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Total Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Stay</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <GuestListItem
                      key={guest.id}
                      guest={guest}
                      onView={(guest) => {
                        setSelectedGuest(guest);
                        setShowGuestDetails(true);
                      }}
                      onEdit={(guest) => {
                        setEditingGuest(guest);
                        setShowGuestForm(true);
                      }}
                      onDelete={handleDeleteGuest}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

           {/* Modals */}
      {showGuestForm && (
        <GuestForm
          guest={editingGuest}
          rooms={rooms}
          onSave={editingGuest ? handleEditGuest : handleAddGuest}
          onCancel={() => {
            setShowGuestForm(false);
            setEditingGuest(null);
          }}
        />
      )}

      {showGuestDetails && selectedGuest && (
        <GuestDetails
          guest={selectedGuest}
          rooms={rooms}
          onClose={() => setShowGuestDetails(false)}
          onEdit={(guest) => {
            setEditingGuest(guest);
            setShowGuestForm(true);
            setShowGuestDetails(false);
          }}
          onDelete={handleDeleteGuest}
        />
      )}
    </div>
  );
};

export default GuestManagement;