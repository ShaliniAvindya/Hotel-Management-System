import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  X,
  Save,
  User,
  UserCheck,
  Users,
  Eye,
} from 'lucide-react';
import { API_BASE_URL } from '../../../apiconfig';

const RequestHandling = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [formData, setFormData] = useState({
    guestName: '',
    guestId: '',
    roomNumber: '',
    requestType: 'room-service',
    description: '',
    priority: 'medium',
    requiredByDate: '',
  });

  const requestTypes = [
    { value: 'laundry', label: 'Laundry' },
    { value: 'room-service', label: 'Room Service' },
    { value: 'luggage', label: 'Luggage Handling' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'information', label: 'Information' },
    { value: 'other', label: 'Other' },
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'assigned', label: 'Assigned', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'cyan' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'blue' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' },
  ];

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, filterStatus, filterPriority, requests]);

  useEffect(() => {
    const uniqueSpecialties = [...new Set(staffMembers.flatMap(staff => staff.specialties || []))];
    setSpecialties(uniqueSpecialties);
  }, [staffMembers]);

  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = staffMembers.filter(staff => 
        staff.specialties && staff.specialties.includes(selectedSpecialty)
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]);
    }
  }, [selectedSpecialty, staffMembers]);

  const refreshData = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const [requestsRes, staffRes] = await Promise.all([
        fetch(`${API_BASE_URL}/concierge/requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`${API_BASE_URL}/staffMembers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
      ]);

      if (!requestsRes.ok) throw new Error('Failed to fetch requests');
      if (!staffRes.ok) throw new Error('Failed to fetch staff');

      const [requestsData, staffData] = await Promise.all([requestsRes.json(), staffRes.json()]);
      setRequests(requestsData);
      setStaffMembers(staffData);
    } catch (error) {
      console.error('Error refreshing concierge data:', error);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/concierge/requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staffMembers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaffMembers(data);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.roomNumber.includes(searchTerm) ||
        req.id.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(req => req.priority === filterPriority);
    }

    setFilteredRequests(filtered);
  };

  const handleAddNew = () => {
    setSelectedRequest(null);
    setFormData({
      guestName: '',
      guestId: '',
      roomNumber: '',
      requestType: 'room-service',
      description: '',
      priority: 'medium',
      requiredByDate: '',
    });
    setShowModal(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setFormData({
      guestName: request.guestName,
      guestId: request.guestId,
      roomNumber: request.roomNumber,
      requestType: request.requestType,
      description: request.description,
      priority: request.priority,
      requiredByDate: request.requiredByDate ? request.requiredByDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedRequest
        ? `${API_BASE_URL}/concierge/requests/${selectedRequest.id}`
        : `${API_BASE_URL}/concierge/requests`;

      const method = selectedRequest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save request');
      
      await refreshData({ background: true });
      setShowModal(false);
    } catch (error) {
      console.error('Error saving request:', error);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/concierge/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete request');
      await refreshData({ background: true });
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleOpenAssignModal = (request) => {
    setSelectedRequest(request);
    setSelectedSpecialty('');
    setSelectedStaff('');
    setShowAssignModal(true);
  };

  const handleOpenDetailModal = (request) => {
    setDetailRequest(request);
    setShowDetailModal(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/concierge/requests/${selectedRequest.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          assignedTo: selectedStaff,
          status: 'assigned'
        })
      });

      if (!response.ok) throw new Error('Failed to assign request');
      await refreshData({ background: true });
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign request');
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concierge/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      await refreshData({ background: true });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getAssignedStaffName = (assignedTo) => {
    if (!assignedTo) return 'Unassigned';
    const staff = staffMembers.find(s => s.id === assignedTo || s.name === assignedTo);
    return staff ? staff.name : assignedTo;
  };

  const getProgressColor = (progress) => {
    if (progress < 33) return 'red';
    if (progress < 66) return 'yellow';
    return 'green';
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'gray';
  };

  const getStatusBadgeInfo = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj || { value: status, label: status.charAt(0).toUpperCase() + status.slice(1), color: 'gray' };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Guest Requests</h2>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Request
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name, room number, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Filter by Work Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Filter by Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Preparing requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-8 px-6 pb-20">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col"
            >
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-8 flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900 truncate">{request.id}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-${getPriorityColor(request.priority)}-100 text-${getPriorityColor(request.priority)}-700 flex-shrink-0`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 flex-1 text-sm">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2 text-gray-500 mb-1">
                      <span className="text-xs font-semibold uppercase">Guest: <span className="text-gray-800 font-lg truncate ml-1">{request.guestName}</span></span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2 text-gray-500 mb-1">
                      <span className="text-xs font-semibold uppercase">Room NO:<span className="text-gray-800 font-lg ml-1">{request.roomNumber}</span></span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2 text-gray-500 mb-1">
                      <span className="text-xs font-semibold uppercase">Type:<span className="text-gray-800 font-lg capitalize truncate ml-1">{request.requestType.replace('-', ' ')}</span> </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2 text-gray-500 mb-1">
                      <span className="text-xs font-semibold uppercase">Date: <span className="text-gray-800 font-lg ml-1">{new Date(request.requestDate).toLocaleDateString()}</span></span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">Note: {request.description}</p>
                </div>

                <div className="space-y-3">
                  {/* Assigned Status */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck size={14} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">Assigned To</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {request.assignedTo ? getAssignedStaffName(request.assignedTo) : 'Unassigned'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {request.assignedTo && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase">Progress</span>
                        <span className={`text-xs font-bold text-${getProgressColor(request.progressPercentage || 0)}-600`}>
                          {request.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${getProgressColor(request.progressPercentage || 0)}-500 h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${request.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {request.assignedTo && request.notes && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Latest Update from {getAssignedStaffName(request.assignedTo)}</p>
                      <p className="text-xs text-blue-800 leading-relaxed line-clamp-2">{request.notes}</p>
                      {request.lastUpdated && (
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(request.lastUpdated).toLocaleDateString()} {new Date(request.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Staff Work Status Dropdown */}
                  {request.assignedTo && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Staff Work Status</label>
                      <select
                        value={request.status || 'pending'}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-${getStatusColor(request.status || 'pending')}-50 text-${getStatusColor(request.status || 'pending')}-700`}
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDetailModal(request)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleOpenAssignModal(request)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                    >
                      <Users size={16} className="mr-1" />
                      Assign
                    </button>
                    <button
                      onClick={() => handleEdit(request)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                    >
                      <Trash2 size={16} className="mr-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedRequest ? 'Edit Request' : 'New Request'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name *</label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest ID *</label>
                    <input
                      type="text"
                      value={formData.guestId}
                      onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Type *</label>
                    <select
                      value={formData.requestType}
                      onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      {requestTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Required By Date</label>
                    <input
                      type="date"
                      value={formData.requiredByDate}
                      onChange={(e) => setFormData({ ...formData, requiredByDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      rows="4"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  <Save size={20} className="mr-2" />
                  Save Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedRequest && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowAssignModal(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Assign Request to Staff
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Request Details */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Request ID:</span></p>
                    <p className="text-base font-semibold text-gray-900">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Guest Name:</span></p>
                    <p className="text-base font-semibold text-gray-900">{selectedRequest.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Room Number:</span></p>
                    <p className="text-base font-semibold text-gray-900">{selectedRequest.roomNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Staff Assignment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Specialty/Division *</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">-- Select Specialty --</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Staff Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff Member *</label>
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      disabled={!selectedSpecialty}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Staff --</option>
                      {filteredStaff.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {filteredStaff.length === 0 && selectedSpecialty && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      No staff members available for this specialty.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaff}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <UserCheck size={18} className="mr-2" />
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {showDetailModal && detailRequest && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Request Details - {detailRequest.id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Guest Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Guest Name</p>
                    <p className="text-base font-semibold text-gray-900">{detailRequest.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guest ID</p>
                    <p className="text-base font-semibold text-gray-900">{detailRequest.guestId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Number</p>
                    <p className="text-base font-semibold text-gray-900">{detailRequest.roomNumber}</p>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Request Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Request Type</p>
                    <p className="text-base font-semibold text-gray-900 capitalize">{detailRequest.requestType.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className={`text-base font-semibold inline-block px-3 py-1 rounded-full bg-${getPriorityColor(detailRequest.priority)}-100 text-${getPriorityColor(detailRequest.priority)}-700`}>
                      {detailRequest.priority.charAt(0).toUpperCase() + detailRequest.priority.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-base font-semibold inline-block px-3 py-1 rounded-full bg-${getStatusColor(detailRequest.status)}-100 text-${getStatusColor(detailRequest.status)}-700`}>
                      {getStatusBadgeInfo(detailRequest.status).label}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-base text-gray-800">{detailRequest.description}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Timeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(detailRequest.requestDate).toLocaleDateString()} {new Date(detailRequest.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Required By Date</p>
                    <p className="text-base font-semibold text-gray-900">
                      {detailRequest.requiredByDate ? new Date(detailRequest.requiredByDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  {detailRequest.assignedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Assigned Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(detailRequest.assignedDate).toLocaleDateString()} {new Date(detailRequest.assignedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {detailRequest.completedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Completed Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(detailRequest.completedDate).toLocaleDateString()} {new Date(detailRequest.completedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {detailRequest.assignedTo && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Assignment & Progress</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Assigned To</p>
                      <p className="text-base font-semibold text-gray-900">{getAssignedStaffName(detailRequest.assignedTo)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-${getProgressColor(detailRequest.progressPercentage || 0)}-500 h-2 rounded-full`}
                              style={{ width: `${detailRequest.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`text-sm font-bold text-${getProgressColor(detailRequest.progressPercentage || 0)}-600`}>
                          {detailRequest.progressPercentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(detailRequest.notes || detailRequest.staffNotes) && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Notes</h3>
                  <div className="space-y-3">
                    {detailRequest.notes && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-700 mb-2">Latest Update Notes</p>
                        <p className="text-sm text-blue-800">{detailRequest.notes}</p>
                        {detailRequest.lastUpdated && (
                          <p className="text-xs text-blue-600 mt-2">
                            Updated: {new Date(detailRequest.lastUpdated).toLocaleDateString()} {new Date(detailRequest.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}
                    {detailRequest.staffNotes && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-700 mb-2">Staff Notes</p>
                        <p className="text-sm text-purple-800">{detailRequest.staffNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">System Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created At</p>
                    <p className="text-gray-900">{new Date(detailRequest.createdAt).toLocaleDateString()} {new Date(detailRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Updated At</p>
                    <p className="text-gray-900">{new Date(detailRequest.updatedAt).toLocaleDateString()} {new Date(detailRequest.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RequestHandling;
