import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Filter, Edit, Trash2, AlertCircle, X, RefreshCw, Eye, Power, Sparkles, CheckCircle, Star } from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';
import { readViewCache, writeViewCache } from '../../lib/viewCache';

const SpaRoomBooking = ({ sidebarOpen = false }) => {
  const cachedRooms = readViewCache('spa-room-booking', { fallback: [] });
  const [rooms, setRooms] = useState(cachedRooms);
  const [loading, setLoading] = useState(() => cachedRooms.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [notification, setNotification] = useState(null);
  const [tempAmenity, setTempAmenity] = useState('');
  const [tempFeature, setTempFeature] = useState('');
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'single',
    capacity: 1,
    hourlyRate: 0,
    amenities: [],
    features: [],
    status: 'available'
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    writeViewCache('spa-room-booking', rooms);
  }, [rooms]);

  const fetchRooms = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/spa/rooms?limit=500&fields=_id,roomNumber,roomType,capacity,hourlyRate,amenities,features,status,isActive`
      );
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      const safeRooms = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);
      setRooms(safeRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || r.roomType === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      occupied: 'bg-blue-50 text-blue-700 border-blue-200',
      maintenance: 'bg-[#fffaf0] text-[#8a681b] border-[#ead8a8]',
      closed: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      if (!formData.roomNumber || !formData.hourlyRate) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to add/edit room', 'error');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;

      const method = editingRoom ? 'PUT' : 'POST';
      const url = editingRoom 
        ? `${API_BASE_URL}/spa/rooms/${editingRoom._id}`
        : `${API_BASE_URL}/spa/rooms`;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save room');
      }
      
      showNotification(editingRoom ? 'Room updated successfully!' : 'Room added successfully!', 'success');
      await fetchRooms({ background: true });
      setShowModal(false);
      setEditingRoom(null);
      setFormData({ roomNumber: '', roomType: 'single', capacity: 1, hourlyRate: 0, amenities: [], features: [], status: 'available' });
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showNotification('Your session has expired. Please login again.', 'error');
      } else {
        showNotification('Error: ' + error.message, 'error');
      }
    }
  };

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      hourlyRate: room.hourlyRate,
      amenities: room.amenities || [],
      features: room.features || [],
      status: room.status
    });
    setShowModal(true);
  };

  const handleDeleteRoom = (roomId) => {
    setRoomToDelete(roomId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to delete room', 'error');
        setShowConfirmDialog(false);
        setRoomToDelete(null);
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/spa/rooms/${roomToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': bearerToken, 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete room');
      }
      
      setRooms(prev => prev.filter(r => r._id !== roomToDelete));
      showNotification('Room deleted successfully!', 'success');
      setShowConfirmDialog(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error('Error deleting room:', error);
      showNotification('Error deleting room: ' + error.message, 'error');
      setShowConfirmDialog(false);
      setRoomToDelete(null);
    }
  };

  const handleToggleRoom = async (roomId, currentStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to update room', 'error');
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/spa/rooms/${roomId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': bearerToken, 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to toggle room');
      }
      
      const updatedRooms = rooms.map(r => 
        r._id === roomId ? { ...r, isActive: !r.isActive } : r
      );
      setRooms(updatedRooms);
      showNotification(`Room ${responseData.room.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error toggling room:', error);
      showNotification('Error updating room: ' + error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 transition-all duration-300 ease-in-out">
      <div className="px-4 sm:px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 flex-1 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              >
                <option value="all">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingRoom(null);
                setFormData({ roomNumber: '', roomType: 'single', capacity: 1, hourlyRate: 0, amenities: [], features: [], status: 'available' });
                setShowModal(true);
              }}
              className="flex items-center justify-center px-6 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors text-sm w-full sm:w-auto ml-auto"
            >
              <Plus size={18} className="mr-2" /> Add Room
            </button>
          </div>
          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredRooms.length} rooms
            </div>
            <button
              onClick={fetchRooms}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {loading && rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-52 rounded-xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No rooms found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${sidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
            {filteredRooms.map(room => (
              <div key={room._id} className="border border-[#c9a24a]/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white flex flex-col h-full group">
                <div className="h-1 w-full bg-[#c9a24a]" />
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#0f2742] text-base sm:text-lg mb-1 truncate group-hover:text-[#c9a24a] transition-colors">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">{room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                      room.status === 'available' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : room.status === 'occupied'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : room.status === 'maintenance'
                        ? 'bg-[#f6edd6] text-[#8a681b] border-[#ead8a8]'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                  </div>

                  {/* Data display - 2 wise layout */}
                  <div className="space-y-3 mb-5 text-sm text-gray-600 font-medium">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium text-gray-900">{room.capacity} persons</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Star size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Rate</p>
                          <p className="text-sm font-bold text-green-600">Rs. {room.hourlyRate}/hr</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Sparkles size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Amenities</p>
                          <p className="text-sm font-medium text-gray-900">{room.amenities?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Features</p>
                          <p className="text-sm font-medium text-gray-900">{room.features?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons at bottom */}
                  <div className="flex items-center justify-end gap-1 pt-4 mt-auto border-t border-gray-100">
                    <button
                      onClick={() => handleViewRoom(room)}
                      className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-gray-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleRoom(room._id, room.isActive)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title={room.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showModal && createPortal(
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
              <button onClick={() => {
                setShowModal(false);
                setEditingRoom(null);
              }} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="p-4 sm:p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="suite">Suite</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (persons) *</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (Rs.) *</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Amenities Section */}
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Amenities</h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempAmenity}
                      onChange={(e) => setTempAmenity(e.target.value)}
                      placeholder="e.g., Air Conditioning, Shower"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempAmenity.trim() && !formData.amenities.includes(tempAmenity)) {
                            setFormData({ ...formData, amenities: [...formData.amenities, tempAmenity] });
                            setTempAmenity('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempAmenity.trim() && !formData.amenities.includes(tempAmenity)) {
                          setFormData({ ...formData, amenities: [...formData.amenities, tempAmenity] });
                          setTempAmenity('');
                        }
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2">
                          {amenity}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, amenities: formData.amenities.filter((_, i) => i !== idx) })}
                            className="hover:text-teal-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features Section */}
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Features</h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempFeature}
                      onChange={(e) => setTempFeature(e.target.value)}
                      placeholder="e.g., Hot Tub, Sauna"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempFeature.trim() && !formData.features.includes(tempFeature)) {
                            setFormData({ ...formData, features: [...formData.features, tempFeature] });
                            setTempFeature('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempFeature.trim() && !formData.features.includes(tempFeature)) {
                          setFormData({ ...formData, features: [...formData.features, tempFeature] });
                          setTempFeature('');
                        }
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2">
                          {feature}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) })}
                            className="hover:text-teal-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRoom(null);
                    setFormData({ roomNumber: '', roomType: 'single', capacity: 1, hourlyRate: 0, amenities: [], features: [], status: 'available' });
                    setTempAmenity('');
                    setTempFeature('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showRoomModal && selectedRoom && createPortal(
        <div 
          onClick={() => setShowRoomModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Room Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEditRoom(selectedRoom);
                    setShowRoomModal(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a24a] hover:bg-[#b8903e] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button onClick={() => setShowRoomModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Number</p>
                    <p className="text-base font-medium text-gray-900">{selectedRoom.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Type</p>
                    <p className="text-base font-medium text-gray-900">{selectedRoom.roomType.charAt(0).toUpperCase() + selectedRoom.roomType.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Capacity</p>
                    <p className="text-base font-medium text-gray-900">{selectedRoom.capacity} persons</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                    <p className="text-base font-medium text-gray-900">Rs. {selectedRoom.hourlyRate}/hour</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Status</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedRoom.status)}`}>
                    {selectedRoom.status}
                  </span>
                </div>
              </div>

              {/* Amenities & Features */}
              {(selectedRoom.amenities?.length > 0 || selectedRoom.features?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Amenities</h3>
                      <div className="space-y-2 text-sm">
                        {selectedRoom.amenities.map((amenity, idx) => (
                          <p key={idx} className="text-gray-700">âœ“ {amenity}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRoom.features && selectedRoom.features.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Features</h3>
                      <div className="space-y-2 text-sm">
                        {selectedRoom.features.map((feature, idx) => (
                          <p key={idx} className="text-gray-700">âœ“ {feature}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-[9999]">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
          }`}>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {showConfirmDialog && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Room</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-700 text-sm sm:text-base">Are you sure you want to delete this room? This action cannot be undone.</p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setRoomToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SpaRoomBooking;

