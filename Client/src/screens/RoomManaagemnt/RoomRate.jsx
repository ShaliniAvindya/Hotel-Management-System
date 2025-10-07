import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
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
import { API_BASE_URL } from '../../apiconfig';

const RATES_API_BASE_URL = `${API_BASE_URL}/room-Rates`; 
const ROOMS_API_BASE_URL = `${API_BASE_URL}/rooms`;

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong.</h3>
          <p className="text-gray-600 mb-6">Please try refreshing the page or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const RoomRate = ({ sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized }) => {
  const [rates, setRates] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('ratePlan');
  const [viewMode, setViewMode] = useState('grid');
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [showRateDetails, setShowRateDetails] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const roomTypes = [
    { id: 'single', name: 'Single Room', icon: Bed },
    { id: 'double', name: 'Double Room', icon: Bed },
    { id: 'twin', name: 'Twin Room', icon: Bed },
    { id: 'triple', name: 'Triple Room', icon: Bed },
    { id: 'suite', name: 'Suite', icon: Home },
    { id: 'presidential', name: 'Presidential Suite', icon: Star },
    { id: 'villa', name: 'Villa', icon: Mountain },
    { id: 'penthouse', name: 'Penthouse', icon: Sparkles },
  ];

  // Fetch rates from backend
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(RATES_API_BASE_URL);
        const data = Array.isArray(response.data) ? response.data : [];
        setRates(data);
      } catch (error) {
        console.error('Error fetching rates:', error);
        setRates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(ROOMS_API_BASE_URL);
        const data = Array.isArray(response.data) ? response.data : [];
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Filter rates based on search, type, and status
  useEffect(() => {
    const filtered = rates
      .filter(rate => rate.rateType === activeTab)
      .filter(rate => {
        if (!searchQuery) return true;
        return (
          (rate.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (rate.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (rate.code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (rate.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .filter(rate => filterStatus === 'all' || rate.status === filterStatus)
      .filter(rate => {
        if (filterType === 'all') return true;
        if (activeTab === 'ratePlan') return rate.roomType === filterType;
        if (activeTab === 'seasonal') return rate.season === filterType;
        if (activeTab === 'discount') return rate.type === filterType;
        return true;
      });
    setFilteredRates(filtered);
  }, [rates, searchQuery, filterType, filterStatus, activeTab]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return EyeOff;
      case 'pending': return Clock;
      case 'expired': return AlertCircle;
      default: return Clock;
    }
  };

  const getRoomTypeIcon = (type) => {
    const roomType = roomTypes.find(rt => rt.id === type);
    return roomType?.icon || Bed;
  };

  const getRoomTypeName = (type) => {
    const roomType = roomTypes.find(rt => rt.id === type);
    return roomType?.name || 'Unknown';
  };

  const handleAdd = async (data) => {
    try {
      const response = await axios.post(RATES_API_BASE_URL, data);
      setRates([...rates, response.data]);
      if (data.rateType === 'ratePlan' && data.roomId) {
        const roomRes = await axios.get(`${ROOMS_API_BASE_URL}/${data.roomId}`);
        const room = roomRes.data;
        const updatedRoom = {
          ...room,
          basePrice: data.basePrice,
          weekendPrice: data.weekendPrice
        };
        await axios.put(`${ROOMS_API_BASE_URL}/${data.roomId}`, updatedRoom);
        setRooms(rooms.map(r => r.id === data.roomId ? updatedRoom : r));
      }
      setShowRateForm(false);
    } catch (error) {
      console.error('Error adding rate:', error);
    }
  };

  const handleEdit = async (data) => {
    try {
      const response = await axios.put(`${RATES_API_BASE_URL}/${data.id}`, data);
      setRates(rates.map(item => (item.id === data.id ? response.data : item)));
      if (data.rateType === 'ratePlan' && data.roomId) {
        const roomRes = await axios.get(`${ROOMS_API_BASE_URL}/${data.roomId}`);
        const room = roomRes.data;
        const updatedRoom = {
          ...room,
          basePrice: data.basePrice,
          weekendPrice: data.weekendPrice
        };
        await axios.put(`${ROOMS_API_BASE_URL}/${data.roomId}`, updatedRoom);
        setRooms(rooms.map(r => r.id === data.roomId ? updatedRoom : r));
      }
      setEditingRate(null);
      setShowRateForm(false);
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
          await axios.delete(`${RATES_API_BASE_URL}/${id}`);
          setRates(rates.filter(item => item._id !== id));
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  const handleCopyCode = (code) => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  const RateForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(() => {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return item || {
        rateType: activeTab,
        name: '',
        description: '',
        status: 'active',
        ...(activeTab === 'ratePlan' && {
          roomType: 'single',
          roomId: '',
          basePrice: 0,
          weekendPrice: 0,
          refundable: true,
          breakfastIncluded: false,
          inclusions: [],
          restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
          validFrom: today,
          validTo: nextYear,
        }),
        ...(activeTab === 'seasonal' && {
          season: 'summer',
          dateRange: { start: today, end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          rateAdjustment: 0,
          applicableRoomTypes: [],
        }),
        ...(activeTab === 'discount' && {
          type: 'percentage',
          value: 0,
          code: '',
          conditions: { minAdvanceBooking: 0, minStay: 1, maxStay: 14, weekendOnly: false, blackoutDates: [] },
          applicableRoomTypes: [],
          validFrom: today,
          validTo: nextYear,
        }),
        ...(activeTab === 'corporate' && {
          companyName: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          discount: 0,
          discountType: 'percentage',
          applicableRoomTypes: [],
          inclusions: [],
          restrictions: { minStay: 1, maxStay: 14, advanceBooking: 0, cancellationDeadline: 24 },
          contractStart: today,
          contractEnd: nextYear,
        }),
      };
    });

    const generateCode = () => {
      const prefix = formData.name ? formData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase() : 'PROMO';
      const suffix = Math.floor(Math.random() * 100);
      setFormData({ ...formData, code: `${prefix}${suffix}` });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    const handleRoomTypeChange = (e) => {
      const newType = e.target.value;
      setFormData(prev => {
        const newData = { ...prev, roomType: newType };
        if (prev.roomId && !rooms.find(r => r.id === prev.roomId && r.type === newType)) {
          newData.roomId = '';
        }
        return newData;
      });
    };

    const handleRoomChange = (e) => {
      const id = e.target.value;
      const selected = rooms.find(r => r.id === id);
      setFormData(prev => ({
        ...prev,
        roomId: id,
        roomType: selected?.type || prev.roomType
      }));
    };

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {item ? 'Edit' : 'Add New'} {formData.rateType === 'ratePlan' ? 'Rate Plan' : formData.rateType === 'seasonal' ? 'Seasonal Rate' : formData.rateType === 'discount' ? 'Discount' : 'Corporate Rate'}
              </h2>
              <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 sm:h-5 w-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!item && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate Type *</label>
                    <select
                      value={formData.rateType}
                      onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="ratePlan">Rate Plan</option>
                      <option value="seasonal">Seasonal Rate</option>
                      <option value="discount">Discount</option>
                      <option value="corporate">Corporate Rate</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>
            {formData.rateType === 'ratePlan' && (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Rate Plan Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                    <select
                      value={formData.roomType || 'single'}
                      onChange={handleRoomTypeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                    <select
                      value={formData.roomId || ''}
                      onChange={handleRoomChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Select a room</option>
                      {rooms
                        .filter(room => room.type === formData.roomType)
                        .map(room => (
                          <option key={room.id} value={room.id}>
                            {`${room.roomNumber} - ${room.name} (${room.capacity} guests, ${room.size} sq ft)`}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice || 0}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekend Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weekendPrice || 0}
                      onChange={(e) => setFormData({ ...formData, weekendPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="refundable"
                      checked={formData.refundable || false}
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
                      checked={formData.breakfastIncluded || false}
                      onChange={(e) => setFormData({ ...formData, breakfastIncluded: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="breakfast" className="text-sm font-medium text-gray-700">
                      Breakfast Included
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Inclusions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {['wifi', 'tv', 'ac', 'minibar', 'phone', 'balcony', 'oceanview', 'bathtub', 'sofa', 'work_desk'].map(inclusion => (
                      <label
                        key={inclusion}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${formData.inclusions?.includes(inclusion) ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.inclusions?.includes(inclusion) || false}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...(formData.inclusions || []), inclusion]
                              : (formData.inclusions || []).filter(i => i !== inclusion);
                            setFormData({ ...formData, inclusions: updated });
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{inclusion.charAt(0).toUpperCase() + inclusion.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {formData.rateType === 'seasonal' && (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Seasonal Rate Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                    <select
                      value={formData.season || 'summer'}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      value={formData.rateAdjustment || 0}
                      onChange={(e) => setFormData({ ...formData, rateAdjustment: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.dateRange?.start || ''}
                      onChange={(e) => setFormData({ ...formData, dateRange: { ...formData.dateRange, start: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.dateRange?.end || ''}
                      onChange={(e) => setFormData({ ...formData, dateRange: { ...formData.dateRange, end: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Applicable Room Types</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {roomTypes.map(roomType => {
                      const IconComponent = roomType.icon || Bed;
                      const isSelected = formData.applicableRoomTypes?.includes(roomType.id) || false;
                      return (
                        <label
                          key={roomType.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
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
            {formData.rateType === 'discount' && (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Discount Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={formData.type || 'percentage'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      value={formData.value || 0}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Applicable Room Types</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {roomTypes.map(roomType => {
                      const IconComponent = roomType.icon || Bed;
                      const isSelected = formData.applicableRoomTypes?.includes(roomType.id) || false;
                      return (
                        <label
                          key={roomType.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
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
            {formData.rateType === 'corporate' && (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Corporate Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson || ''}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Contact Person"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone || ''}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType || 'percentage'}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      value={formData.discount || 0}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Applicable Room Types</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {roomTypes.map(roomType => {
                      const IconComponent = roomType.icon || Bed;
                      const isSelected = formData.applicableRoomTypes?.includes(roomType.id) || false;
                      return (
                        <label
                          key={roomType.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
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
            {(formData.rateType === 'ratePlan' || formData.rateType === 'discount' || formData.rateType === 'corporate') && (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.rateType === 'corporate' ? 'Contract Start' : 'Valid From'}
                    </label>
                    <input
                      type="date"
                      value={formData.rateType === 'corporate' ? formData.contractStart || '' : formData.validFrom || ''}
                      onChange={(e) => {
                        const field = formData.rateType === 'corporate' ? 'contractStart' : 'validFrom';
                        setFormData({ ...formData, [field]: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.rateType === 'corporate' ? 'Contract End' : 'Valid To'}
                    </label>
                    <input
                      type="date"
                      value={formData.rateType === 'corporate' ? formData.contractEnd || '' : formData.validTo || ''}
                      onChange={(e) => {
                        const field = formData.rateType === 'corporate' ? 'contractEnd' : 'validTo';
                        setFormData({ ...formData, [field]: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
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

  const RateDetails = ({ rate, onClose }) => {
    const Icon = rate.rateType === 'ratePlan' ? getRoomTypeIcon(rate.roomType) : 
                rate.rateType === 'seasonal' ? Calendar : 
                rate.rateType === 'discount' ? Tag : Building;
    const SafeIcon = Icon || Bed;
    const selectedRoom = rate.rateType === 'ratePlan' ? rooms.find(r => r.id === rate.roomId) : null;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 sm:p-3 rounded-xl">
                  <SafeIcon className="h-5 w-5 sm:h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{rate.name || 'Unnamed Rate'}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{rate.description || 'No description'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 sm:h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(rate.status)}`}>
                  {rate.status?.charAt(0).toUpperCase() + (rate.status?.slice(1) || '')}
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => {
                    setEditingRate(rate);
                    setShowRateForm(true);
                    setShowRateDetails(false);
                  }}
                  className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4 sm:h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(rate._id)}
                  className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 w-5" />
                </button>
              </div>
            </div>
            {rate.rateType === 'ratePlan' && selectedRoom && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Assigned Room</h3>
                <div className="flex items-center space-x-3">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{`${selectedRoom.roomNumber} - ${selectedRoom.name}`}</p>
                    <p className="text-sm text-gray-600">{getRoomTypeName(selectedRoom.type)} • {selectedRoom.capacity} guests</p>
                  </div>
                </div>
              </div>
            )}
            {rate.rateType === 'ratePlan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Pricing Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Base Price:</span>
                        <span className="text-sm font-medium text-gray-900">${rate.basePrice || 0}/night</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Weekend Price:</span>
                        <span className="text-sm font-medium text-gray-900">${rate.weekendPrice || 0}/night</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Policies</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {rate.refundable ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 sm:h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm text-gray-900">{rate.refundable ? 'Refundable' : 'Non-refundable'}</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {rate.breakfastIncluded ? (
                          <Coffee className="h-4 w-4 sm:h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 sm:h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-900">
                          Breakfast {rate.breakfastIncluded ? 'Included' : 'Not included'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Restrictions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Min Stay:</span>
                        <span className="text-sm font-medium text-gray-900">{rate.restrictions?.minStay || 1} nights</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Max Stay:</span>
                        <span className="text-sm font-medium text-gray-900">{rate.restrictions?.maxStay || 14} nights</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Clock className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Cancellation:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {rate.restrictions?.cancellationDeadline || 24}h before
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {rate.rateType === 'seasonal' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Seasonal Rate Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Date Range:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.dateRange?.start && rate.dateRange?.end
                          ? `${new Date(rate.dateRange.start).toLocaleDateString()} - ${new Date(rate.dateRange.end).toLocaleDateString()}`
                          : 'No date range'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Rate Adjustment:</span>
                      <span className={`text-sm font-medium ${rate.rateAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rate.rateAdjustment > 0 ? '+' : ''}${rate.rateAdjustment || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {rate.rateType === 'discount' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Discount Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Tag className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Promo Code:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono">{rate.code || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.type === 'percentage' ? `${rate.value || 0}% off` : `${rate.value || 0} off`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Valid From:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.validFrom ? new Date(rate.validFrom).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Valid To:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.validTo ? new Date(rate.validTo).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {rate.rateType === 'corporate' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Corporate Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Building className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Company:</span>
                      <span className="text-sm font-medium text-gray-900">{rate.companyName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Users className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Contact Person:</span>
                      <span className="text-sm font-medium text-gray-900">{rate.contactPerson || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <DollarSign className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.discountType === 'percentage' ? `${rate.discount || 0}% off` : `${rate.discount || 0} off`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Contract Start:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.contractStart ? new Date(rate.contractStart).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Calendar className="h-4 w-4 sm:h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Contract End:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {rate.contractEnd ? new Date(rate.contractEnd).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(rate.applicableRoomTypes?.length > 0 || rate.roomType) && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Applicable Room Types</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(rate.applicableRoomTypes || (rate.roomType ? [rate.roomType] : [])).map(roomTypeId => {
                    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
                    if (!roomType) return null;
                    const IconComponent = roomType.icon || Bed;
                    return (
                      <div key={roomTypeId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <IconComponent className="h-4 w-4 sm:h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-900">{roomType.name}</span>
                      </div>
                    );
                  })}
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
    <ErrorBoundary>
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

        <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 sticky top-[4rem] z-20">
          <div className="flex flex-col items-start sm:items-center justify-between space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              {activeTab === 'ratePlan' && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="all">All Room Types</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              )}
              {activeTab === 'seasonal' && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="all">All Seasons</option>
                  <option value="summer">Summer</option>
                  <option value="winter">Winter</option>
                  <option value="spring">Spring</option>
                  <option value="fall">Fall</option>
                  <option value="holiday">Holiday</option>
                  <option value="off-season">Off Season</option>
                </select>
              )}
              {activeTab === 'discount' && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="all">All Discount Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              )}
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button
                onClick={() => setShowRateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Rate</span>
              </button>
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
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6">
            <nav className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-1">
              {[
                { id: 'ratePlan', label: 'Rate Plans', icon: DollarSign },
                { id: 'seasonal', label: 'Seasonal Rates', icon: Calendar },
                { id: 'discount', label: 'Discounts', icon: Tag },
                { id: 'corporate', label: 'Corporate Rates', icon: Building },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 rounded-t-lg ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="sm:inline">{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {rates.filter(rate => rate.rateType === tab.id).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredRates.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 sm:h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No {activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? `No ${activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} match your current filters.`
                  : `Get started by adding your first ${activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()}.`}
              </p>
              <button
                onClick={() => setShowRateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Rate</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredRates.map(rate => {
                const Icon = rate.rateType === 'ratePlan' ? getRoomTypeIcon(rate.roomType) : 
                            rate.rateType === 'seasonal' ? Calendar : 
                            rate.rateType === 'discount' ? Tag : Building;
                const SafeIcon = Icon || Bed;
                const StatusIcon = getStatusIcon(rate.status);
                const selectedRoom = rate.rateType === 'ratePlan' ? rooms.find(r => r.id === rate.roomId) : null;
                return (
                  <div key={rate.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <SafeIcon className="h-5 w-5 sm:h-6 w-6 text-blue-600" />
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{rate.name || 'Unnamed Rate'}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(rate.status)}`}>
                              {rate.status}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 truncate">{rate.description || 'No description'}</p>
                          {rate.rateType === 'ratePlan' && (
                            <div className="space-y-2">
                              {selectedRoom && (
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                  <Bed className="h-4 w-4" />
                                  <span>{`${selectedRoom.roomNumber} - ${selectedRoom.name}`}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span>Base: ${rate.basePrice || 0}/night</span>
                                {rate.weekendPrice > rate.basePrice && (
                                  <span className="text-blue-600">+${(rate.weekendPrice || 0) - (rate.basePrice || 0)} weekends</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center space-x-4 text-xs sm:text-sm text-gray-600 gap-2">
                                <div className="flex items-center space-x-1">
                                  {rate.refundable ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                  <span>{rate.refundable ? 'Refundable' : 'Non-refundable'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {rate.breakfastIncluded ? (
                                    <Coffee className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span>Breakfast {rate.breakfastIncluded ? 'Included' : 'Not included'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {rate.rateType === 'seasonal' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {rate.dateRange?.start && rate.dateRange?.end
                                    ? `${new Date(rate.dateRange.start).toLocaleDateString()} - ${new Date(rate.dateRange.end).toLocaleDateString()}`
                                    : 'No date range'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span className={(rate.rateAdjustment || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {(rate.rateAdjustment || 0) > 0 ? '+' : ''}${rate.rateAdjustment || 0}
                                </span>
                              </div>
                            </div>
                          )}
                          {rate.rateType === 'discount' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <Tag className="h-4 w-4" />
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{rate.code || 'N/A'}</span>
                                <button
                                  onClick={() => handleCopyCode(rate.code)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Copy code"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span>{rate.type === 'percentage' ? `${rate.value || 0}% off` : `${rate.value || 0} off`}</span>
                              </div>
                            </div>
                          )}
                          {rate.rateType === 'corporate' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <Building className="h-4 w-4" />
                                <span>{rate.companyName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span>{rate.discountType === 'percentage' ? `${rate.discount || 0}% discount` : `${rate.discount || 0} off`}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{rate.contactPerson || 'N/A'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 px-4 sm:px-6">
                        <button
                          onClick={() => {
                            setSelectedRate(rate);
                            setShowRateDetails(true);
                          }}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingRate(rate);
                              setShowRateForm(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rate._id)}
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
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Status</th>
                    {activeTab === 'ratePlan' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Base Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Weekend Price</th>
                      </>
                    )}
                    {activeTab === 'seasonal' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Rate Adjustment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Date Range</th>
                      </>
                    )}
                    {activeTab === 'discount' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Code</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Value</th>
                      </>
                    )}
                    {activeTab === 'corporate' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Company</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Discount</th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map(rate => {
                    const selectedRoom = rate.rateType === 'ratePlan' ? rooms.find(r => r.id === rate.roomId) : null;
                    return (
                      <tr key={rate.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{rate.name || 'Unnamed Rate'}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{rate.description || 'No description'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs sm:text-sm text-gray-900 capitalize">
                            {rate.rateType === 'ratePlan' ? (selectedRoom ? `${selectedRoom.roomNumber} - ${selectedRoom.name}` : getRoomTypeName(rate.roomType)) :
                             rate.rateType === 'seasonal' ? rate.season :
                             rate.rateType === 'discount' ? rate.type : 'Corporate'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(rate.status)}`}>
                            {rate.status || 'Unknown'}
                          </span>
                        </td>
                        {rate.rateType === 'ratePlan' && (
                          <>
                            <td className="py-3 px-4">
                              <span className="text-xs sm:text-sm text-gray-900">${rate.basePrice || 0}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs sm:text-sm text-gray-900">${rate.weekendPrice || 0}</span>
                            </td>
                          </>
                        )}
                        {rate.rateType === 'seasonal' && (
                          <>
                            <td className="py-3 px-4">
                              <span className={`text-xs sm:text-sm ${(rate.rateAdjustment || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(rate.rateAdjustment || 0) > 0 ? '+' : ''}${rate.rateAdjustment || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {rate.dateRange?.start && rate.dateRange?.end
                                  ? `${new Date(rate.dateRange.start).toLocaleDateString()} - ${new Date(rate.dateRange.end).toLocaleDateString()}`
                                  : 'N/A'}
                              </span>
                            </td>
                          </>
                        )}
                        {rate.rateType === 'discount' && (
                          <>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs sm:text-sm font-mono text-gray-900">{rate.code || 'N/A'}</span>
                                <button
                                  onClick={() => handleCopyCode(rate.code)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Copy code"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {rate.type === 'percentage' ? `${rate.value || 0}%` : `$${rate.value || 0}`}
                              </span>
                            </td>
                          </>
                        )}
                        {rate.rateType === 'corporate' && (
                          <>
                            <td className="py-3 px-4">
                              <span className="text-xs sm:text-sm text-gray-900">{rate.companyName || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {rate.discountType === 'percentage' ? `${rate.discount || 0}%` : `$${rate.discount || 0}`}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRate(rate);
                                setShowRateDetails(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingRate(rate);
                                setShowRateForm(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rate._id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
            rate={selectedRate}
            onClose={() => setShowRateDetails(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default RoomRate;