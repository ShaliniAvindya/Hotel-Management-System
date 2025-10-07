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

const SpecialRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, bookingsResponse, requestsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/rooms`),
          axios.get(`${API_BASE_URL}/bookings`),
          axios.get(`${API_BASE_URL}/specialrequests`),
        ]);

        setRooms(roomsResponse.data);
        setBookings(bookingsResponse.data);
        setRequests(requestsResponse.data);
        setFilteredRequests(requestsResponse.data);
      } catch (err) {
        setError('Failed to fetch data from the server');
        setTimeout(() => setError(''), 3000);
      }
    };
    fetchData();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          request.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.roomNumber.includes(searchQuery)
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
      setRequests((prev) => [...prev, response.data]);
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
      setRequests((prev) => prev.map((request) => (request.id === requestData.id ? response.data : request)));
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
        setRequests(requests.filter((request) => request.id !== requestId));
        setSuccess('Special request deleted successfully');
        setTimeout(() => {
          setShowRequestDetails(false);
          setSelectedRequest(null);
          setSuccess('');
          window.location.reload();
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
        guestName: selectedBooking?.guestName || '',
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
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-labelledby="request-form-title"
      >
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 id="request-form-title" className="text-xl font-semibold text-gray-900">
              {request ? 'Edit Special Request' : 'Add New Special Request'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close form"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Booking Reference *
                </label>
                <select
                  id="bookingId"
                  value={formData.bookingId}
                  onChange={(e) => handleBookingChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-required="true"
                >
                  <option value="">Select booking...</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.bookingReference} - {booking.guestName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="guestName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Name
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={formData.guestName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="roomNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Number
                </label>
                <input
                  id="roomNumber"
                  type="text"
                  value={formData.roomNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Request Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {requestTypes
                    .filter((t) => t.id !== 'all')
                    .map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide detailed information about the special request..."
                required
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {requestStatuses
                    .filter((s) => s.id !== 'all')
                    .map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date
                </label>
                <input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate ? formData.dueDate.slice(0, 16) : ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="assignedTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assigned To
              </label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Front Office">Front Office</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Guest Services">Guest Services</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Staff Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Internal notes for staff..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Cancel form"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                aria-label={request ? 'Update request' : 'Create request'}
              >
                <Save className="h-4 w-4" />
                <span>{request ? 'Update Request' : 'Create Request'}</span>
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
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-labelledby="request-details-title"
      >
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 id="request-details-title" className="text-xl font-semibold text-gray-900">
                  {request.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {request.guestName} - Room {request.roomNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close details"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    statusConfig?.color === 'green'
                      ? 'bg-green-100 text-green-800'
                      : statusConfig?.color === 'blue'
                      ? 'bg-blue-100 text-blue-800'
                      : statusConfig?.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800'
                      : statusConfig?.color === 'red'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusConfig?.name}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Type</h3>
                <div className="flex items-center space-x-2">
                  {typeConfig?.icon && <typeConfig.icon className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm font-medium">{typeConfig?.name}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h3>
                <span className="text-sm font-medium">{request.assignedTo}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Guest:</span>
                  <span className="text-sm font-medium">{request.guestName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Room:</span>
                  <span className="text-sm font-medium">{request.roomNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </span>
                </div>
                {request.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Due:</span>
                    <span className="text-sm font-medium">
                      {new Date(request.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>

            {request.notes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Staff Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onEdit(request)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                aria-label="Edit request"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Request</span>
              </button>
              <button
                onClick={() => onDelete(request.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                aria-label="Delete request"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">{request.title}</h3>
            <p className="text-sm text-gray-600">
              {request.guestName} - Room {request.roomNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                statusConfig?.color === 'green'
                  ? 'bg-green-100 text-green-800'
                  : statusConfig?.color === 'blue'
                  ? 'bg-blue-100 text-blue-800'
                  : statusConfig?.color === 'yellow'
                  ? 'bg-yellow-100 text-yellow-800'
                  : statusConfig?.color === 'red'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusConfig?.name}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
            {typeConfig?.icon && <typeConfig.icon className="h-4 w-4" />}
            <span>{typeConfig?.name}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>Assigned: {request.assignedTo}</span>
          {request.dueDate && (
            <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onView(request)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
            aria-label={`View details for ${request.title}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(request)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit Request"
            aria-label={`Edit ${request.title}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(request.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete Request"
            aria-label={`Delete ${request.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search requests by guest name, title, description, or room number"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              {requestStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by type"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            aria-label="Add new request"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Request</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Refresh"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-xl font-semibold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold text-gray-900">
                  {requests.filter((r) => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-semibold text-gray-900">
                  {requests.filter((r) => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">
                  {requests.filter((r) => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No requests match your current filters.'
                  : 'Start by creating your first special request.'}
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                aria-label="Add new request"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Request</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onView={(request) => {
                    setSelectedRequest(request);
                    setShowRequestDetails(true);
                  }}
                  onEdit={(request) => {
                    setEditingRequest(request);
                    setShowRequestForm(true);
                  }}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default SpecialRequests;