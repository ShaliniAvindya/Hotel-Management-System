import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  User,
  Calendar,
  Bed,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Home,
  Utensils,
  Users,
  Gift,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';
import { queryClient } from '../../lib/queryClient';

const SpecialRequests = () => {
  const cachedRequests = queryClient.getQueryData(['special-requests']) || [];
  const cachedRooms = queryClient.getQueryData(['rooms']) || [];
  const cachedBookings = queryClient.getQueryData(['bookings']) || [];
  const [requests, setRequests] = useState(cachedRequests);
  const [filteredRequests, setFilteredRequests] = useState(cachedRequests);
  const [rooms, setRooms] = useState(cachedRooms);
  const [bookings, setBookings] = useState(cachedBookings);
  const [loading, setLoading] = useState(
    () => cachedRequests.length === 0 && cachedRooms.length === 0 && cachedBookings.length === 0
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request types
  const requestTypes = [
    { id: 'all', name: 'All Types', icon: MessageSquare },
    { id: 'room_setup', name: 'Room Setup', icon: Bed },
    { id: 'celebration', name: 'Celebration', icon: Gift },
    { id: 'dietary', name: 'Dietary', icon: Utensils },
    { id: 'accessibility', name: 'Accessibility', icon: Users },
    { id: 'arrival', name: 'Arrival/Departure', icon: Clock },
    { id: 'housekeeping', name: 'Housekeeping', icon: Home },
    { id: 'other', name: 'Other', icon: MessageSquare },
  ];

  const requestStatuses = [
    { id: 'all', name: 'All Status', color: 'gray' },
    { id: 'pending', name: 'Pending', color: 'yellow' },
    { id: 'in_progress', name: 'In Progress', color: 'blue' },
    { id: 'completed', name: 'Completed', color: 'green' },
    { id: 'cancelled', name: 'Cancelled', color: 'red' },
  ];

  const refreshData = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const [roomsResponse, bookingsResponse, requestsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/rooms`),
        axios.get(`${API_BASE_URL}/bookings`),
        axios.get(`${API_BASE_URL}/specialrequests`),
      ]);

      const nextRooms = Array.isArray(roomsResponse.data) ? roomsResponse.data : [];
      const nextBookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
      const nextRequests = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];
      setRooms(nextRooms);
      setBookings(nextBookings);
      setRequests(nextRequests);
      setFilteredRequests(nextRequests);
      queryClient.setQueryData(['rooms'], nextRooms);
      queryClient.setQueryData(['bookings'], nextBookings);
      queryClient.setQueryData(['special-requests'], nextRequests);
    } catch (err) {
      setError('Failed to fetch data from the server');
      setTimeout(() => setError(''), 3000);
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          request.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.roomNumber?.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((request) => request.type === typeFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter, typeFilter]);

  const handleAddRequest = async (requestData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/specialrequests`, requestData);
      const nextRequests = [...requests, response.data];
      setRequests(nextRequests);
      queryClient.setQueryData(['special-requests'], nextRequests);
      setSuccess('Special request created successfully');
      setTimeout(() => {
        setShowRequestForm(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create special request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditRequest = async (requestData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/specialrequests/${requestData.id}`, requestData);
      const nextRequests = requests.map((request) => (request.id === requestData.id ? response.data : request));
      setRequests(nextRequests);
      queryClient.setQueryData(['special-requests'], nextRequests);
      setSuccess('Special request updated successfully');
      setTimeout(() => {
        setEditingRequest(null);
        setShowRequestForm(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update special request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await axios.delete(`${API_BASE_URL}/specialrequests/${requestId}`);
        const nextRequests = requests.filter((request) => request.id !== requestId);
        setRequests(nextRequests);
        queryClient.setQueryData(['special-requests'], nextRequests);
        setSuccess('Special request deleted successfully');
        setTimeout(() => {
          setShowRequestDetails(false);
          setSelectedRequest(null);
          setSuccess('');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete special request');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const getStatusColor = (status) => {
    const statusConfig = requestStatuses.find((s) => s.id === status);
    return statusConfig ? statusConfig.color : 'gray';
  };

  const RequestForm = ({ request, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      request || {
        bookingId: '',
        guestName: '',
        roomNumber: '',
        type: 'other',
        title: '',
        description: '',
        status: 'pending',
        dueDate: '',
        assignedTo: 'Front Office',
        notes: '',
      }
    );
    const [formError, setFormError] = useState('');

    const handleBookingChange = (bookingId) => {
      const selectedBooking = bookings.find((b) => b.id === bookingId);
      const selectedRoom = selectedBooking?.roomId
        ? rooms.find((r) => r.id === selectedBooking.roomId)
        : null;

      setFormData({
        ...formData,
        bookingId,
        guestName: selectedBooking?.guestName || `${selectedBooking?.firstName || ''} ${selectedBooking?.lastName || ''}`.trim(),
        roomNumber:
          selectedBooking?.splitStays?.length > 0
            ? 'Multiple Rooms'
            : selectedRoom?.roomNumber || '',
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.title.trim() || !formData.description.trim() || !formData.bookingId) {
        setFormError('Please fill in all required fields');
        return;
      }
      onSave({ ...formData, id: request?.id });
      setFormError('');
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onCancel}>
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 id="request-form-title" className="text-xl sm:text-2xl font-bold text-white">
                    {request ? 'Edit Special Request' : 'Add New Request'}
                  </h2>
                  <p className="text-sm text-white/70 font-normal">Capture guest preferences and requirements</p>
                </div>
              </div>
              <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors" aria-label="Close form">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center space-x-3 animate-shake">
                <AlertCircle className="h-5 w-5" />
                <span className="font-bold text-sm">{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">Booking Reference *</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#c9a24a] transition-colors" />
                  <select
                    id="bookingId"
                    value={formData.bookingId}
                    onChange={(e) => handleBookingChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742]"
                    required
                  >
                    <option value="">Select booking...</option>
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.bookingReference} - {booking.guestName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742]"
                >
                  {requestTypes.filter((t) => t.id !== 'all').map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                <input
                  id="guestName"
                  type="text"
                  value={formData.guestName}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  id="roomNumber"
                  type="text"
                  value={formData.roomNumber}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Request Title *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Honeymoon Setup, Extra Pillows"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742]"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Detail the guest's specific requirements..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742]"
                >
                  {requestStatuses.filter((s) => s.id !== 'all').map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate ? formData.dueDate.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">Assigned Department</label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742]"
              >
                {['Front Office', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Guest Services', 'Management'].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Staff Notes (Internal)</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Internal coordination notes..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-sm font-medium text-[#0f2742] resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm text-slate-600"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#0f2742] text-white rounded-xl hover:bg-[#153456] transition-colors text-sm font-medium flex items-center space-x-2 shadow-lg shadow-[#0f2742]/20"
              >
                <Save className="h-4 w-4" />
                <span>{request ? 'Update Request' : 'Save Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const RequestDetails = ({ request, onClose, onEdit, onDelete }) => {
    const statusConfig = requestStatuses.find((s) => s.id === request.status);
    const typeConfig = requestTypes.find((t) => t.id === request.type);

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 id="request-details-title" className="text-xl sm:text-2xl font-bold text-white line-clamp-1">{request.title}</h2>
                  <p className="text-sm text-white/70 font-medium">{request.guestName} - Room {request.roomNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(request)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                  title="Edit Request"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${request.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  request.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                  {statusConfig?.name}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-[#0f2742]/10 rounded-lg">
                    {typeConfig?.icon && <typeConfig.icon className="h-4 w-4 text-[#0f2742]" />}
                  </div>
                  <span className="text-sm font-medium text-[#0f2742]">{typeConfig?.name}</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h3>
                <span className="text-sm font-semibold text-[#0f2742]">{request.assignedTo}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Request Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-[#c9a24a]" />
                  <span className="text-sm font-medium text-gray-500 w-24">Guest:</span>
                  <span className="text-sm font-medium text-[#0f2742]">{request.guestName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Bed className="h-4 w-4 text-[#c9a24a]" />
                  <span className="text-sm font-medium text-gray-500 w-24">Room:</span>
                  <span className="text-sm font-medium text-[#0f2742]">{request.roomNumber}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-[#c9a24a]" />
                  <span className="text-sm font-medium text-gray-500 w-24">Created:</span>
                  <span className="text-sm font-medium text-[#0f2742]">
                    {new Date(request.requestDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
                {request.dueDate && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-[#c9a24a]" />
                    <span className="text-sm font-medium text-gray-500 w-24">Due Date:</span>
                    <span className="text-sm font-medium text-[#0f2742]">
                      {new Date(request.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Description</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-700 leading-relaxed min-h-[100px]">
                  {request.description}
                </div>
              </div>

              {request.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Internal Staff Notes</h3>
                  <div className="bg-[#0f2742]/5 border border-[#0f2742]/10 rounded-xl p-4 text-sm font-medium text-[#0f2742]">
                    {request.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                onClick={() => onDelete(request.id)}
                className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors font-semibold text-sm flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Request</span>
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm text-slate-600"
                >
                  Close Window
                </button>
                <button
                  onClick={() => onEdit(request)}
                  className="px-6 py-2.5 bg-[#0f2742] text-white rounded-xl hover:bg-[#153456] transition-colors font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-[#0f2742]/20"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const RequestCard = ({ request, onView, onEdit, onDelete }) => {
    const statusConfig = requestStatuses.find((s) => s.id === request.status);
    const typeConfig = requestTypes.find((t) => t.id === request.type);

    return (
      <div className="bg-white border border-[#c9a24a]/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300 group">
        <div className="h-1 w-full bg-[#c9a24a]" />
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#0f2742] text-base sm:text-lg group-hover:text-[#c9a24a] transition-colors truncate">{request.title}</h3>
              <p className="text-sm text-gray-600 font-medium">
                {request.guestName} • Room {request.roomNumber}
              </p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${request.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              request.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
              {statusConfig?.name}
            </span>
          </div>

          <div className="mb-4 space-y-3 text-sm text-gray-600 font-medium">
            <div className="flex items-center">
              <div className="p-1.5 bg-[#0f2742]/5 rounded-lg mr-2">
                {typeConfig?.icon && <typeConfig.icon className="h-4 w-4 text-[#c9a24a]" />}
              </div>
              <span>{typeConfig?.name}</span>
            </div>
            <p className="line-clamp-2 leading-relaxed h-10">
              {request.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-3">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1 text-[#c9a24a]" />
              <span>{request.assignedTo}</span>
            </div>
            {request.dueDate && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-[#c9a24a]" />
                <span>{new Date(request.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(request)}
            className="p-2 text-slate-400 hover:text-[#0f2742] hover:bg-[#0f2742]/5 rounded-lg transition-all"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(request)}
            className="p-2 text-slate-400 hover:text-[#c9a24a] hover:bg-[#c9a24a]/5 rounded-lg transition-all"
            title="Edit Request"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(request.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete Request"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 transition-all duration-300 ease-in-out">
      <div className="px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742] appearance-none cursor-pointer"
                >
                  {requestStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742] appearance-none cursor-pointer"
                >
                  {requestTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center justify-center px-6 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors text-sm w-full sm:w-auto"
              >
                <Plus size={18} className="mr-2" />
                New Request
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredRequests.length} requests
            </div>
            <button
              onClick={() => refreshData()}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8 py-8">
        {loading && requests.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white border border-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white border border-[#c9a24a]/30 rounded-xl p-12 text-center shadow-sm">
            <div className="p-4 bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-[#0f2742] mb-2">No Requests Found</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              No special requests match your current filters. Try adjusting your search or add a new request.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onView={(req) => {
                  setSelectedRequest(req);
                  setShowRequestDetails(true);
                }}
                onEdit={(req) => {
                  setEditingRequest(req);
                  setShowRequestForm(true);
                }}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {showRequestForm && (
        <RequestForm
          request={editingRequest}
          onSave={editingRequest ? handleEditRequest : handleAddRequest}
          onCancel={() => {
            setShowRequestForm(false);
            setEditingRequest(null);
          }}
        />
      )}

      {showRequestDetails && selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => {
            setShowRequestDetails(false);
            setSelectedRequest(null);
          }}
          onEdit={(request) => {
            setEditingRequest(request);
            setShowRequestForm(true);
            setShowRequestDetails(false);
          }}
          onDelete={handleDeleteRequest}
        />
      )}

      {/* Message Toasts */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-rose-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-up z-50">
          <AlertCircle className="h-5 w-5 text-rose-200" />
          <span className="font-bold text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-[#0f2742] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-up z-50">
          <CheckCircle className="h-5 w-5 text-[#c9a24a]" />
          <span className="font-bold text-sm">{success}</span>
        </div>
      )}
    </div>
  );
};

export default SpecialRequests;
