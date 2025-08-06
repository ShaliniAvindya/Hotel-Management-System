import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Tag,
  Building,
  Copy,
  Eye,
  X,
  Save,
  RefreshCw,
  Grid,
  List,
  Menu,
  CheckCircle,
  AlertCircle,
  Clock,
  EyeOff,
  Bed,
  Home,
  Star,
  Mountain,
  Sparkles,
  Coffee,
  Users,
} from 'lucide-react';
import Sidebar from '../Sidebar';

const RoomRate = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const [ratePlans, setRatePlans] = useState([]);
  const [seasonalRates, setSeasonalRates] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [corporateRates, setCorporateRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('ratePlans');
  const [viewMode, setViewMode] = useState('grid');
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [showRateDetails, setShowRateDetails] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Room types from RoomStatus.jsx
  const roomTypes = [
    { id: 'single', name: 'Single Room', icon: Bed },
    { id: 'double', name: 'Double Room', icon: Bed },
    { id: 'suite', name: 'Suite', icon: Home },
    { id: 'presidential', name: 'Presidential Suite', icon: Star },
    { id: 'villa', name: 'Villa', icon: Mountain },
    { id: 'penthouse', name: 'Penthouse', icon: Sparkles },
  ];

  // Room data adapted from RoomStatus.jsx
  const initialRooms = [
    {
      id: 'R001',
      roomNumber: '101',
      type: 'single',
      name: 'Deluxe Single Room',
      basePrice: 120,
      weekendPrice: 150,
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      status: 'active',
      description: 'A comfortable single room with modern amenities and city view.',
      inclusions: ['wifi', 'tv', 'ac', 'minibar', 'phone'],
      restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
      refundable: true,
      breakfastIncluded: false,
    },
    {
      id: 'R002',
      roomNumber: '201',
      type: 'double',
      name: 'Premium Double Room',
      basePrice: 180,
      weekendPrice: 220,
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      status: 'active',
      description: 'Spacious double room with king-size bed and ocean view.',
      inclusions: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'oceanview', 'bathtub'],
      restrictions: { minStay: 2, maxStay: 21, advanceBooking: 7, cancellationDeadline: 48 },
      refundable: true,
      breakfastIncluded: true,
    },
    {
      id: 'R003',
      roomNumber: '301',
      type: 'suite',
      name: 'Executive Suite',
      basePrice: 350,
      weekendPrice: 420,
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      status: 'active',
      description: 'Luxurious suite with separate living area and premium amenities.',
      inclusions: ['wifi', 'tv', 'ac', 'kitchen', 'balcony', 'oceanview', 'bathtub', 'sofa', 'work_desk'],
      restrictions: { minStay: 2, maxStay: 30, advanceBooking: 7, cancellationDeadline: 48 },
      refundable: false,
      breakfastIncluded: true,
    },
  ];

  // Sample data for other tabs
  useEffect(() => {
    const sampleSeasonalRates = [
      {
        id: 'SR001',
        name: 'Summer Peak Season',
        description: 'Higher rates during summer peak tourist season',
        season: 'summer',
        status: 'active',
        dateRange: { start: '2025-06-01', end: '2025-08-31' },
        rateAdjustment: 50,
        applicableRoomTypes: ['single', 'double'],
      },
      {
        id: 'SR002',
        name: 'Holiday Season Premium',
        description: 'Premium rates during Christmas and New Year',
        season: 'holiday',
        status: 'active',
        dateRange: { start: '2025-12-20', end: '2026-01-05' },
        rateAdjustment: 75,
        applicableRoomTypes: ['single', 'double', 'suite'],
      },
      {
        id: 'SR003',
        name: 'Off-Season Discount',
        description: 'Reduced rates during low tourist season',
        season: 'off-season',
        status: 'active',
        dateRange: { start: '2025-01-15', end: '2025-03-15' },
        rateAdjustment: -20,
        applicableRoomTypes: ['single'],
      },
    ];

    const sampleDiscounts = [
      {
        id: 'DC001',
        name: 'Early Bird Special',
        description: '15% off for bookings made 30 days in advance',
        type: 'percentage',
        value: 15,
        code: 'EARLY15',
        status: 'active',
        conditions: {
          minAdvanceBooking: 30,
          minStay: 2,
          maxStay: 14,
          blackoutDates: ['2025-12-24', '2025-12-25', '2025-12-31', '2026-01-01'],
        },
        applicableRoomTypes: ['single', 'double'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
      },
      {
        id: 'DC002',
        name: 'Weekend Getaway',
        description: '$50 flat discount for weekend stays',
        type: 'fixed',
        value: 50,
        code: 'WEEKEND50',
        status: 'active',
        conditions: { weekendOnly: true, minStay: 2, maxStay: 3 },
        applicableRoomTypes: ['single'],
        validFrom: '2025-01-01',
        validTo: '2025-06-30',
      },
      {
        id: 'DC003',
        name: 'Extended Stay Discount',
        description: '20% off for stays of 7+ nights',
        type: 'percentage',
        value: 20,
        code: 'LONGSTAY20',
        status: 'active',
        conditions: { minStay: 7, maxStay: 30 },
        applicableRoomTypes: ['single', 'double', 'suite'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
      },
    ];

    const sampleCorporateRates = [
      {
        id: 'CR001',
        name: 'TechCorp Solutions',
        description: 'Corporate rate for TechCorp Solutions employees',
        companyName: 'TechCorp Solutions',
        contactPerson: 'John Smith',
        contactEmail: 'john.smith@techcorp.com',
        contactPhone: '+1-555-0123',
        status: 'active',
        discount: 25,
        discountType: 'percentage',
        roomTypes: ['single', 'double', 'suite'],
        inclusions: ['wifi', 'parking', 'breakfast', 'late_checkout'],
        restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
        contractStart: '2025-01-01',
        contractEnd: '2025-12-31',
      },
      {
        id: 'CR002',
        name: 'Global Marketing Inc.',
        description: 'Preferred corporate partner rate',
        companyName: 'Global Marketing Inc.',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@globalmarketing.com',
        contactPhone: '+1-555-0456',
        status: 'active',
        discount: 30,
        discountType: 'percentage',
        roomTypes: ['double', 'suite', 'presidential'],
        inclusions: ['wifi', 'parking', 'breakfast', 'minibar', 'spa_access'],
        restrictions: { minStay: 2, maxStay: 21, advanceBooking: 0, cancellationDeadline: 48 },
        contractStart: '2025-01-01',
        contractEnd: '2026-01-31',
      },
      {
        id: 'CR003',
        name: 'Medical Associates',
        description: 'Healthcare professional discount program',
        companyName: 'Medical Associates',
        contactPerson: 'Dr. Michael Brown',
        contactEmail: 'michael.brown@medassoc.com',
        contactPhone: '+1-555-0789',
        status: 'pending',
        discount: 20,
        discountType: 'percentage',
        roomTypes: ['single', 'double'],
        inclusions: ['wifi', 'parking'],
        restrictions: { minStay: 1, maxStay: 7, advanceBooking: 0, cancellationDeadline: 24 },
        contractStart: '2025-02-01',
        contractEnd: '2025-12-31',
      },
    ];

    setRatePlans(initialRooms);
    setSeasonalRates(sampleSeasonalRates);
    setDiscounts(sampleDiscounts);
    setCorporateRates(sampleCorporateRates);
    setFilteredRates(initialRooms);
  }, []);

  // Filter data based on active tab
  useEffect(() => {
    let data = [];
    switch (activeTab) {
      case 'ratePlans':
        data = ratePlans;
        break;
      case 'seasonal':
        data = seasonalRates;
        break;
      case 'discounts':
        data = discounts;
        break;
      case 'corporate':
        data = corporateRates;
        break;
      default:
        data = ratePlans;
    }

    let filtered = data;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.companyName && item.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        if (activeTab === 'ratePlans') return item.type === filterType;
        if (activeTab === 'seasonal') return item.season === filterType;
        if (activeTab === 'discounts') return item.type === filterType;
        return true;
      });
    }

    setFilteredRates(filtered);
  }, [ratePlans, seasonalRates, discounts, corporateRates, searchQuery, filterType, filterStatus, activeTab]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return EyeOff;
      case 'pending':
        return Clock;
      case 'expired':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getRoomTypeIcon = (type) => {
    const roomType = roomTypes.find(rt => rt.id === type);
    return roomType ? roomType.icon : Bed;
  };

  const getRoomTypeName = (type) => {
    const roomType = roomTypes.find(rt => rt.id === type);
    return roomType ? roomType.name : 'Unknown';
  };

  const handleAdd = (data) => {
    const newId = `${activeTab.toUpperCase().slice(0, 2)}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const newItem = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    switch (activeTab) {
      case 'ratePlans':
        setRatePlans([...ratePlans, newItem]);
        break;
      case 'seasonal':
        setSeasonalRates([...seasonalRates, newItem]);
        break;
      case 'discounts':
        setDiscounts([...discounts, newItem]);
        break;
      case 'corporate':
        setCorporateRates([...corporateRates, newItem]);
        break;
    }
    setShowRateForm(false);
  };

  const handleEdit = (data) => {
    switch (activeTab) {
      case 'ratePlans':
        setRatePlans(ratePlans.map(item => (item.id === data.id ? data : item)));
        break;
      case 'seasonal':
        setSeasonalRates(seasonalRates.map(item => (item.id === data.id ? data : item)));
        break;
      case 'discounts':
        setDiscounts(discounts.map(item => (item.id === data.id ? data : item)));
        break;
      case 'corporate':
        setCorporateRates(corporateRates.map(item => (item.id === data.id ? data : item)));
        break;
    }
    setEditingRate(null);
    setShowRateForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      switch (activeTab) {
        case 'ratePlans':
          setRatePlans(ratePlans.filter(item => item.id !== id));
          break;
        case 'seasonal':
          setSeasonalRates(seasonalRates.filter(item => item.id !== id));
          break;
        case 'discounts':
          setDiscounts(discounts.filter(item => item.id !== id));
          break;
        case 'corporate':
          setCorporateRates(corporateRates.filter(item => item.id !== id));
          break;
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const RateForm = ({ item, onSave, onCancel }) => {
    const getInitialFormData = () => {
      if (item) return item;

      switch (activeTab) {
        case 'ratePlans':
          return {
            name: '',
            description: '',
            type: 'single',
            status: 'active',
            roomTypes: ['single'],
            basePrice: 0,
            weekendPrice: 0,
            refundable: true,
            breakfastIncluded: false,
            inclusions: [],
            restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
        case 'seasonal':
          return {
            name: '',
            description: '',
            season: 'summer',
            status: 'active',
            dateRange: {
              start: new Date().toISOString().split('T')[0],
              end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            rateAdjustment: 0,
            applicableRoomTypes: [],
          };
        case 'discounts':
          return {
            name: '',
            description: '',
            type: 'percentage',
            value: 0,
            code: '',
            status: 'active',
            conditions: { minAdvanceBooking: 0, minStay: 1, maxStay: 14, weekendOnly: false, blackoutDates: [] },
            applicableRoomTypes: [],
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
        case 'corporate':
          return {
            name: '',
            description: '',
            companyName: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
            status: 'pending',
            discount: 0,
            discountType: 'percentage',
            roomTypes: [],
            inclusions: [],
            restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
            contractStart: new Date().toISOString().split('T')[0],
            contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
        default:
          return {};
      }
    };

    const [formData, setFormData] = useState(getInitialFormData());

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    const generateCode = () => {
      const prefix = formData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
      const suffix = Math.floor(Math.random() * 100);
      setFormData({ ...formData, code: `${prefix}${suffix}` });
    };

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {item ? 'Edit' : 'Add New'}{' '}
                {activeTab === 'ratePlans'
                  ? 'Rate Plan'
                  : activeTab === 'seasonal'
                  ? 'Seasonal Rate'
                  : activeTab === 'discounts'
                  ? 'Discount'
                  : 'Corporate Rate'}
              </h2>
              <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>

            {activeTab === 'ratePlans' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Plan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekend Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weekendPrice}
                      onChange={(e) => setFormData({ ...formData, weekendPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="refundable"
                      checked={formData.refundable}
                      onChange={(e) => setFormData({ ...formData, refundable: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="refundable" className="text-sm font-medium text-gray-700">
                      Refundable
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="breakfast"
                      checked={formData.breakfastIncluded}
                      onChange={(e) => setFormData({ ...formData, breakfastIncluded: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="breakfast" className="text-sm font-medium text-gray-700">
                      Breakfast Included
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seasonal' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Rate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="summer">Summer</option>
                      <option value="winter">Winter</option>
                      <option value="spring">Spring</option>
                      <option value="fall">Fall</option>
                      <option value="holiday">Holiday</option>
                      <option value="off-season">Off Season</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate Adjustment ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rateAdjustment}
                      onChange={(e) => setFormData({ ...formData, rateAdjustment: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.dateRange?.start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateRange: { ...formData.dateRange, start: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.dateRange?.end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateRange: { ...formData.dateRange, end: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Room Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roomTypes.map(roomType => {
                      const IconComponent = roomType.icon;
                      const isSelected = formData.applicableRoomTypes?.includes(roomType.id);
                      return (
                        <label
                          key={roomType.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(formData.applicableRoomTypes || []), roomType.id]
                                : (formData.applicableRoomTypes || []).filter(id => id !== roomType.id);
                              setFormData({ ...formData, applicableRoomTypes: updated });
                            }}
                            className="sr-only"
                          />
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{roomType.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'discounts' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value {formData.type === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="PROMO10"
                      />
                      <button
                        type="button"
                        onClick={generateCode}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        title="Generate Code"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Room Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roomTypes.map(roomType => {
                      const IconComponent = roomType.icon;
                      const isSelected = formData.applicableRoomTypes?.includes(roomType.id);
                      return (
                        <label
                          key={roomType.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(formData.applicableRoomTypes || []), roomType.id]
                                : (formData.applicableRoomTypes || []).filter(id => id !== roomType.id);
                              setFormData({ ...formData, applicableRoomTypes: updated });
                            }}
                            className="sr-only"
                          />
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{roomType.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'corporate' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Corporate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contact Person"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount {formData.discountType === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Room Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roomTypes.map(roomType => {
                      const IconComponent = roomType.icon;
                      const isSelected = formData.roomTypes?.includes(roomType.id);
                      return (
                        <label
                          key={roomType.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(formData.roomTypes || []), roomType.id]
                                : (formData.roomTypes || []).filter(id => id !== roomType.id);
                              setFormData({ ...formData, roomTypes: updated });
                            }}
                            className="sr-only"
                          />
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{roomType.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'ratePlans' || activeTab === 'discounts' || activeTab === 'corporate') && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activeTab === 'corporate' ? 'Contract Start' : 'Valid From'}
                    </label>
                    <input
                      type="date"
                      value={activeTab === 'corporate' ? formData.contractStart : formData.validFrom}
                      onChange={(e) => {
                        const field = activeTab === 'corporate' ? 'contractStart' : 'validFrom';
                        setFormData({ ...formData, [field]: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activeTab === 'corporate' ? 'Contract End' : 'Valid To'}
                    </label>
                    <input
                      type="date"
                      value={activeTab === 'corporate' ? formData.contractEnd : formData.validTo}
                      onChange={(e) => {
                        const field = activeTab === 'corporate' ? 'contractEnd' : 'validTo';
                        setFormData({ ...formData, [field]: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {item ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const RateCard = ({ item, onView, onEdit, onDelete }) => {
    const StatusIcon = getStatusIcon(item.status);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>

              {activeTab === 'ratePlans' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Base: ${item.basePrice}/night</span>
                    {item.weekendPrice > item.basePrice && (
                      <span className="text-blue-600">+${item.weekendPrice - item.basePrice} weekends</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      {item.refundable ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span>{item.refundable ? 'Refundable' : 'Non-refundable'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.breakfastIncluded ? (
                        <Coffee className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Breakfast {item.breakfastIncluded ? 'Included' : 'Not included'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seasonal' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {item.dateRange?.start && item.dateRange?.end
                        ? `${new Date(item.dateRange.start).toLocaleDateString()} - ${new Date(item.dateRange.end).toLocaleDateString()}`
                        : 'No date range'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className={item.rateAdjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                      {item.rateAdjustment > 0 ? '+' : ''}${item.rateAdjustment}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'discounts' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{item.code}</span>
                    <button
                      onClick={() => handleCopyCode(item.code)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy code"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{item.type === 'percentage' ? `${item.value}% off` : `${item.value} off`}</span>
                  </div>
                </div>
              )}

              {activeTab === 'corporate' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{item.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{item.discountType === 'percentage' ? `${item.discount}% discount` : `${item.discount} off`}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{item.contactPerson}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 px-6">
            <button
              onClick={() => onView(item)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RateDetails = ({ item, onClose, onEdit, onDelete }) => {
    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {activeTab === 'ratePlans' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Base Price:</span>
                        <span className="text-sm font-medium text-gray-900">${item.basePrice}/night</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Weekend Price:</span>
                        <span className="text-sm font-medium text-gray-900">${item.weekendPrice}/night</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Policies</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {item.refundable ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-900">{item.refundable ? 'Refundable' : 'Non-refundable'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.breakfastIncluded ? (
                          <Coffee className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-900">
                          Breakfast {item.breakfastIncluded ? 'Included' : 'Not included'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Restrictions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Min Stay:</span>
                        <span className="text-sm font-medium text-gray-900">{item.restrictions?.minStay} nights</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Max Stay:</span>
                        <span className="text-sm font-medium text-gray-900">{item.restrictions?.maxStay} nights</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Cancellation:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.restrictions?.cancellationDeadline}h before
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seasonal' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seasonal Rate Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Date Range:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.dateRange?.start && item.dateRange?.end
                          ? `${new Date(item.dateRange.start).toLocaleDateString()} - ${new Date(item.dateRange.end).toLocaleDateString()}`
                          : 'No date range'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Rate Adjustment:</span>
                      <span className={`text-sm font-medium ${item.rateAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.rateAdjustment > 0 ? '+' : ''}${item.rateAdjustment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'discounts' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Discount Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Promo Code:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono">{item.code}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.type === 'percentage' ? `${item.value}% off` : `${item.value} off`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Valid From:</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(item.validFrom).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Valid To:</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(item.validTo).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'corporate' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Corporate Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Company:</span>
                      <span className="text-sm font-medium text-gray-900">{item.companyName}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Contact Person:</span>
                      <span className="text-sm font-medium text-gray-900">{item.contactPerson}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.discountType === 'percentage' ? `${item.discount}% off` : `${item.discount} off`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Contract Start:</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(item.contractStart).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Contract End:</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(item.contractEnd).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(item.roomTypes || item.applicableRoomTypes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicable Room Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(item.roomTypes || item.applicableRoomTypes || []).map(roomTypeId => {
                    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
                    if (!roomType) return null;
                    const IconComponent = roomType.icon;
                    return (
                      <div key={roomTypeId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-900">{roomType.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'ratePlans':
        return { data: ratePlans, title: 'Rate Plans', icon: DollarSign };
      case 'seasonal':
        return { data: seasonalRates, title: 'Seasonal Rates', icon: Calendar };
      case 'discounts':
        return { data: discounts, title: 'Discounts', icon: Tag };
      case 'corporate':
        return { data: corporateRates, title: 'Corporate Rates', icon: Building };
      default:
        return { data: ratePlans, title: 'Rate Plans', icon: DollarSign };
    }
  };

  const getFilterOptions = () => {
    switch (activeTab) {
      case 'seasonal':
        return [
          { value: 'all', label: 'All Seasons' },
          { value: 'summer', label: 'Summer' },
          { value: 'winter', label: 'Winter' },
          { value: 'spring', label: 'Spring' },
          { value: 'fall', label: 'Fall' },
          { value: 'holiday', label: 'Holiday' },
          { value: 'off-season', label: 'Off Season' },
        ];
      case 'discounts':
        return [
          { value: 'all', label: 'All Types' },
          { value: 'percentage', label: 'Percentage' },
          { value: 'fixed', label: 'Fixed Amount' },
        ];
      default:
        return [{ value: 'all', label: 'All Types' }];
    }
  };

  const sidebarWidth = sidebarMinimized ? 4 : 16;
  const sidebarOffset = sidebarOpen ? sidebarWidth : 0;
  const tabData = getTabData();
  const TabIcon = tabData.icon;

  return (
    <div
      className="min-h-screen bg-gray-50 transition-all duration-300 ease-in-out"
      style={{
        marginLeft: `${sidebarOffset}rem`,
        width: `calc(100% - ${sidebarOffset}rem)`,
      }}
    >
      {/* Filters and Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-[4rem] z-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${tabData.title.toLowerCase()}...`}
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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <button
              onClick={() => setShowRateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New {tabData.title.slice(0, -1)}</span>
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

            {/* Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6">
          <nav className="flex space-x-1">
            {[
              { id: 'ratePlans', label: 'Rate Plans', icon: DollarSign },
              { id: 'seasonal', label: 'Seasonal Rates', icon: Calendar },
              { id: 'discounts', label: 'Discounts', icon: Tag },
              { id: 'corporate', label: 'Corporate Rates', icon: Building },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.id === 'ratePlans'
                      ? ratePlans.length
                      : tab.id === 'seasonal'
                      ? seasonalRates.length
                      : tab.id === 'discounts'
                      ? discounts.length
                      : corporateRates.length}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {filteredRates.length === 0 ? (
          <div className="text-center py-12">
            <TabIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {tabData.title.toLowerCase()} found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? `No ${tabData.title.toLowerCase()} match your current filters.`
                : `Get started by adding your first ${tabData.title.slice(0, -1).toLowerCase()}.`}
            </p>
            <button
              onClick={() => setShowRateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add New {tabData.title.slice(0, -1)}</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRates.map(item => (
              <RateCard
                key={item.id}
                item={item}
                onView={(item) => {
                  setSelectedRate(item);
                  setShowRateDetails(true);
                }}
                onEdit={(item) => {
                  setEditingRate(item);
                  setShowRateForm(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    {activeTab === 'ratePlans' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Base Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Weekend Price</th>
                      </>
                    )}
                    {activeTab === 'seasonal' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Rate Adjustment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date Range</th>
                      </>
                    )}
                    {activeTab === 'discounts' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                      </>
                    )}
                    {activeTab === 'corporate' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Discount</th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900 capitalize">{item.type || item.season || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      {activeTab === 'ratePlans' && (
                        <>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">${item.basePrice}</span>
                          </td>
                                               <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">${item.weekendPrice}</span>
                      </td>
                    </>
                  )}
                  {activeTab === 'seasonal' && (
                    <>
                      <td className="py-4 px-4">
                        <span className={`text-sm ${item.rateAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.rateAdjustment > 0 ? '+' : ''}${item.rateAdjustment}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {item.dateRange?.start && item.dateRange?.end
                            ? `${new Date(item.dateRange.start).toLocaleDateString()} - ${new Date(item.dateRange.end).toLocaleDateString()}`
                            : 'N/A'}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'discounts' && (
                    <>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900">{item.code}</span>
                          <button
                            onClick={() => handleCopyCode(item.code)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy code"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {item.type === 'percentage' ? `${item.value}%` : `$${item.value}`}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'corporate' && (
                    <>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{item.companyName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {item.discountType === 'percentage' ? `${item.discount}%` : `$${item.discount}`}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRate(item);
                          setShowRateDetails(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRate(item);
                          setShowRateForm(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {showRateForm && (
      <RateForm
        item={editingRate}
        onSave={editingRate ? handleEdit : handleAdd}
        onCancel={() => {
          setShowRateForm(false);
          setEditingRate(null);
        }}
      />
    )}

    {showRateDetails && selectedRate && (
      <RateDetails
        item={selectedRate}
        onClose={() => setShowRateDetails(false)}
        onEdit={(item) => {
          setEditingRate(item);
          setShowRateForm(true);
          setShowRateDetails(false);
        }}
        onDelete={handleDelete}
      />
    )}
  </div>


</div>
);
};

export default RoomRate;