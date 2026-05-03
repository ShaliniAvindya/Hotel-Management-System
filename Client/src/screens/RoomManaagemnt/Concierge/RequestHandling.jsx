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
  RefreshCw,
  Badge,
  Calendar,
} from 'lucide-react';
import { API_BASE_URL } from '../../../apiconfig';
import { queryClient } from '../../../lib/queryClient';
import notify from '../../../utils/notify';

const RequestHandling = () => {
  const cachedRequests = queryClient.getQueryData(['concierge-requests']) || [];
  const cachedStaffMembers = queryClient.getQueryData(['staff-members']) || [];
  const [requests, setRequests] = useState(cachedRequests);
  const [filteredRequests, setFilteredRequests] = useState(cachedRequests);
  const [loading, setLoading] = useState(() => cachedRequests.length === 0 && cachedStaffMembers.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [staffMembers, setStaffMembers] = useState(cachedStaffMembers);
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
    { value: 'pending', label: 'Pending', color: 'green' },
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

  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token
      ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
      : {};
  };

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
            ...getAuthHeader(),
          }
        }),
        fetch(`${API_BASE_URL}/staffMembers`, {
          headers: {
            ...getAuthHeader(),
          }
        }),
      ]);

      if (!requestsRes.ok) throw new Error('Failed to fetch requests');
      if (!staffRes.ok) throw new Error('Failed to fetch staff');

      const [requestsData, staffData] = await Promise.all([requestsRes.json(), staffRes.json()]);
      const nextRequests = Array.isArray(requestsData) ? requestsData : [];
      const nextStaffMembers = Array.isArray(staffData) ? staffData : [];
      setRequests(nextRequests);
      setStaffMembers(nextStaffMembers);
      queryClient.setQueryData(['concierge-requests'], nextRequests);
      queryClient.setQueryData(['staff-members'], nextStaffMembers);
    } catch (error) {
      console.error('Error refreshing concierge data:', error);
      notify.error('Failed to fetch concierge data');
    } finally {
      if (!background) setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/concierge/requests`, {
        headers: {
          ...getAuthHeader(),
        }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      const nextRequests = Array.isArray(data) ? data : [];
      setRequests(nextRequests);
      queryClient.setQueryData(['concierge-requests'], nextRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      notify.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staffMembers`, {
        headers: {
          ...getAuthHeader(),
        }
      });
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      const nextStaffMembers = Array.isArray(data) ? data : [];
      setStaffMembers(nextStaffMembers);
      queryClient.setQueryData(['staff-members'], nextStaffMembers);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      notify.error('Failed to fetch staff members');
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.roomNumber?.includes(searchTerm) ||
        req.id?.includes(searchTerm)
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
          ...getAuthHeader(),
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save request');

      await refreshData({ background: true });
      setShowModal(false);
      notify.success(selectedRequest ? 'Request updated successfully' : 'Request created successfully');
    } catch (error) {
      console.error('Error saving request:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to save request';
      notify.error(msg);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/concierge/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        }
      });

      if (!response.ok) throw new Error('Failed to delete request');
      await refreshData({ background: true });
      notify.deleted('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete request';
      notify.error(msg);
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
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          assignedTo: selectedStaff,
          status: 'assigned'
        })
      });

      if (!response.ok) throw new Error('Failed to assign request');
      await refreshData({ background: true });
      setShowAssignModal(false);
      notify.success('Staff assigned successfully');
    } catch (error) {
      console.error('Error assigning request:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to assign request';
      notify.error(msg);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concierge/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      await refreshData({ background: true });
      notify.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to update status';
      notify.error(msg);
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
      <div className="px-4 sm:px-6 py-4 bg-white border border-[#c9a24a]/30 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap flex-1 w-full">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guest, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all"
          >
            <option value="all">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center px-6 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors font-semibold text-sm w-full sm:w-auto ml-auto"
          >
            <Plus size={18} className="mr-2" />
            New Request
          </button>
          
          <button
            onClick={() => refreshData()}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg hidden sm:block"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 px-6 pb-20 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-48 rounded-xl bg-white border border-[#c9a24a]/30" />
          <div className="h-48 rounded-xl bg-white border border-[#c9a24a]/30" />
          <div className="h-48 rounded-xl bg-white border border-[#c9a24a]/30" />
          <div className="h-48 rounded-xl bg-white border border-[#c9a24a]/30" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-slate-500">No requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-20">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-[#c9a24a]/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300 group"
            >
              <div className="h-1 w-full bg-[#c9a24a]" />
              <div className="p-4 flex flex-col h-full">
                {/* Header: Title/ID and Priority */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#0f2742] text-base sm:text-lg mb-1 truncate group-hover:text-[#c9a24a] transition-colors">
                      {request.guestName}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">#{request.id} • Room {request.roomNumber}</p>
                  </div>
                  <span className={`flex-shrink-0 inline-flex px-3 py-1 text-sm font-bold rounded-full border ${getPriorityColor(request.priority) === 'red' ? 'bg-red-50 border-red-200 text-red-700' : getPriorityColor(request.priority) === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' : getPriorityColor(request.priority) === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 mb-5 line-clamp-2 italic leading-relaxed">
                  "{request.description}"
                </p>

                {/* Info List - Maintenance Style */}
                <div className="space-y-3 mb-5 text-sm text-gray-600 font-medium">
                  <div className="flex items-center space-x-3">
                    <Badge size={16} className="text-[#c9a24a]" />
                    <span className="capitalize">Type: {request.requestType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-[#c9a24a]" />
                    <span>Date: {new Date(request.requestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserCheck size={16} className="text-[#c9a24a]" />
                    <span className="truncate">Assigned: {request.assignedTo ? getAssignedStaffName(request.assignedTo) : 'Unassigned'}</span>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className={`text-sm font-bold text-${getProgressColor(request.progressPercentage || 0)}-600`}>
                      {request.progressPercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`bg-${getProgressColor(request.progressPercentage || 0)}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${request.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Latest Update Note - if exists */}
                {request.assignedTo && request.notes && (
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 mb-5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Latest Update</span>
                    </div>
                    <p className="text-sm text-blue-800 line-clamp-2 leading-relaxed">
                      {request.notes}
                    </p>
                  </div>
                )}

                {/* Work Status Dropdown - Slim Professional */}
                {request.assignedTo && (
                  <div className="mb-5">
                    <select
                      value={request.status || 'pending'}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c9a24a] text-sm font-bold shadow-sm transition-all ${getStatusBadgeInfo(request.status).color === 'yellow' ? 'bg-yellow-50 text-yellow-700' : getStatusBadgeInfo(request.status).color === 'blue' ? 'bg-blue-50 text-blue-700' : getStatusBadgeInfo(request.status).color === 'cyan' ? 'bg-cyan-50 text-cyan-700' : getStatusBadgeInfo(request.status).color === 'green' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                  <button
                    onClick={() => handleOpenDetailModal(request)}
                    className="flex items-center space-x-1.5 text-[#0f2742] hover:text-[#c9a24a] text-sm sm:text-base font-bold transition-colors"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenAssignModal(request)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Assign Staff"
                    >
                      <Users size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(request)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
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
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedRequest ? 'Edit Request' : 'New Request'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              <div className="bg-slate-50/50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4">Guest Information</h3>
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

              <div className="bg-slate-50/50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4">Request Details</h3>
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

              <div className="flex gap-3 pt-4 border-t border-[#c9a24a]/30">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors font-medium text-sm sm:text-base"
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
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Assign Request to Staff
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Request Details */}
              <div className="bg-slate-50/50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4">Request Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500"><span className="font-semibold">Request ID:</span></p>
                    <p className="text-base font-semibold text-[#0f2742]">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500"><span className="font-semibold">Guest Name:</span></p>
                    <p className="text-base font-semibold text-[#0f2742]">{selectedRequest.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500"><span className="font-semibold">Room Number:</span></p>
                    <p className="text-base font-semibold text-[#0f2742]">{selectedRequest.roomNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4">Staff Assignment</h3>
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

              <div className="flex gap-3 pt-4 border-t border-[#c9a24a]/30">
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaff}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors font-medium text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto border border-[#c9a24a]/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Request Details - {detailRequest.id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Guest Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Guest Name</p>
                    <p className="text-base font-semibold text-[#0f2742]">{detailRequest.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Guest ID</p>
                    <p className="text-base font-semibold text-[#0f2742]">{detailRequest.guestId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Room Number</p>
                    <p className="text-base font-semibold text-[#0f2742]">{detailRequest.roomNumber}</p>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Request Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Request Type</p>
                    <p className="text-base font-semibold text-[#0f2742] capitalize">{detailRequest.requestType.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Priority</p>
                    <p className={`text-base font-semibold inline-block px-3 py-1 rounded-full bg-${getPriorityColor(detailRequest.priority)}-100 text-${getPriorityColor(detailRequest.priority)}-700`}>
                      {detailRequest.priority.charAt(0).toUpperCase() + detailRequest.priority.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className={`text-base font-semibold inline-block px-3 py-1 rounded-full bg-${getStatusColor(detailRequest.status)}-100 text-${getStatusColor(detailRequest.status)}-700`}>
                      {getStatusBadgeInfo(detailRequest.status).label}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-slate-500">Description</p>
                    <p className="text-base text-gray-800">{detailRequest.description}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Timeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Request Date</p>
                    <p className="text-base font-semibold text-[#0f2742]">
                      {new Date(detailRequest.requestDate).toLocaleDateString()} {new Date(detailRequest.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Required By Date</p>
                    <p className="text-base font-semibold text-[#0f2742]">
                      {detailRequest.requiredByDate ? new Date(detailRequest.requiredByDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  {detailRequest.assignedDate && (
                    <div>
                      <p className="text-sm text-slate-500">Assigned Date</p>
                      <p className="text-base font-semibold text-[#0f2742]">
                        {new Date(detailRequest.assignedDate).toLocaleDateString()} {new Date(detailRequest.assignedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {detailRequest.completedDate && (
                    <div>
                      <p className="text-sm text-slate-500">Completed Date</p>
                      <p className="text-base font-semibold text-[#0f2742]">
                        {new Date(detailRequest.completedDate).toLocaleDateString()} {new Date(detailRequest.completedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {detailRequest.assignedTo && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Assignment & Progress</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Assigned To</p>
                      <p className="text-base font-semibold text-[#0f2742]">{getAssignedStaffName(detailRequest.assignedTo)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Progress</p>
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
                  <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">Notes</h3>
                  <div className="space-y-3">
                    {detailRequest.notes && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-[#c9a24a]/20">
                        <p className="text-sm font-semibold text-blue-700 mb-2">Latest Update Notes</p>
                        <p className="text-sm text-blue-800">{detailRequest.notes}</p>
                        {detailRequest.lastUpdated && (
                          <p className="text-xs text-[#0f2742] mt-2">
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
                <h3 className="text-base sm:text-lg font-semibold text-[#0f2742] mb-4 pb-2 border-b border-[#c9a24a]/30">System Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Created At</p>
                    <p className="text-[#0f2742]">{new Date(detailRequest.createdAt).toLocaleDateString()} {new Date(detailRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Updated At</p>
                    <p className="text-[#0f2742]">{new Date(detailRequest.updatedAt).toLocaleDateString()} {new Date(detailRequest.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#c9a24a]/30">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors font-medium text-sm sm:text-base"
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
