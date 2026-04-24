import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  DollarSign,
  X,
  AlertCircle,
  Star,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';

const AppointmentTracker = ({ sidebarOpen = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [formData, setFormData] = useState({
    guestId: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    service: '',
    serviceName: '',
    therapist: '',
    therapistName: '',
    spaRoom: '',
    spaRoomNumber: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    duration: 0,
    specialRequests: '',
    roomNumber: '',
    status: 'pending',
    servicePrice: 0,
    therapistPrice: 0,
    roomPrice: 0,
    discount: 0,
    totalPrice: 0,
    paymentStatus: 'pending',
    notes: '',
    healthNotes: '',
    allergies: [],
    preferences: [],
  });

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'cyan' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'no-show', label: 'No Show', color: 'gray' },
  ];

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchTherapists();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (showModal && guests.length === 0) {
      fetchGuests();
    }
  }, [showModal, guests.length]);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, filterStatus, filterDate, appointments]);

  const fetchAppointments = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/spa/appointments?expand=0&limit=500&fields=_id,appointmentId,guestId,guestName,guestPhone,guestEmail,service,serviceName,therapist,therapistName,spaRoom,spaRoomNumber,appointmentDate,startTime,endTime,duration,status,totalPrice,paymentStatus,specialRequests,roomNumber`
      );
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      const safeAppointments = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);
      setAppointments(safeAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/spa/services?limit=500&fields=_id,serviceName,basePrice,duration,isActive&isActive=true`
      );
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchTherapists = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = bearerToken;
      }
      
      const response = await fetch(`${API_BASE_URL}/spa/therapists?limit=500&fields=_id,name,hourlyRate,isActive&isActive=true`, {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch therapists');
      const data = await response.json();
      setTherapists(Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setTherapists([]);
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/guests?limit=500&fields=_id,id,firstName,lastName,email,phone,idNumber,roomNumber`
      );
      if (!response.ok) throw new Error('Failed to fetch guests');
      const data = await response.json();
      setGuests(Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      setGuests([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/spa/rooms?limit=500&fields=_id,roomNumber,roomType,status,isActive&isActive=true`
      );
      if (!response.ok) throw new Error('Failed to fetch spa rooms');
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Error fetching spa rooms:', error);
      setRooms([]);
    }
  };

  const handleGuestSearch = (searchValue) => {
    setGuestSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      setFilteredGuests([]);
      setShowGuestDropdown(false);
      return;
    }
    
    const searchLower = searchValue.toLowerCase();
    const results = guests.filter(guest => {
      const fullName = `${guest.firstName || ''} ${guest.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        guest.email?.toLowerCase().includes(searchLower) ||
        guest.phone?.includes(searchValue) ||
        guest.idNumber?.includes(searchValue)
      );
    });
    
    setFilteredGuests(results);
    setShowGuestDropdown(true);
  };

  const handleSelectGuest = (guest) => {
    const fullName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
    setFormData({
      ...formData,
      guestId: guest._id,
      guestName: fullName,
      guestPhone: guest.phone || '',
      guestEmail: guest.email || '',
      roomNumber: guest.roomNumber || ''
    });
    setGuestSearchTerm('');
    setShowGuestDropdown(false);
    setFilteredGuests([]);
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.guestPhone.includes(searchTerm) ||
        apt.appointmentId.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toDateString();
        const filterDateStr = new Date(filterDate).toDateString();
        return aptDate === filterDateStr;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.guestId || !formData.service || !formData.appointmentDate || !formData.startTime) {
      setSubmitError('Please fill in all required fields (Guest, Service, Date, Start Time)');
      return;
    }

    try {
      const selectedService = services.find(s => s._id === formData.service);
      const selectedTherapist = therapists.find(t => t._id === formData.therapist);
      const selectedGuest = guests.find(g => g._id === formData.guestId);
      
      if (!selectedService) {
        setSubmitError('Selected service not found');
        return;
      }

      // Calculate end time based on duration
      const startDate = new Date(`2000-01-01 ${formData.startTime}`);
      const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
      const endTime = endDate.toTimeString().slice(0, 5);

      const appointmentData = {
        guestId: formData.guestId,
        guestName: selectedGuest?.firstName ? `${selectedGuest.firstName} ${selectedGuest.lastName || ''}`.trim() : formData.guestName,
        guestPhone: selectedGuest?.phone || formData.guestPhone || '',
        guestEmail: selectedGuest?.email || formData.guestEmail || '',
        roomNumber: selectedGuest?.roomNumber || formData.roomNumber || '',
        service: formData.service,
        serviceName: selectedService.serviceName,
        therapist: formData.therapist || null,
        therapistName: selectedTherapist?.name || '',
        spaRoom: formData.spaRoom || null,
        spaRoomNumber: formData.spaRoom ? rooms.find(r => r._id === formData.spaRoom)?.roomNumber : '',
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        startTime: formData.startTime,
        endTime: endTime,
        duration: selectedService.duration,
        specialRequests: formData.specialRequests || '',
        status: formData.status || 'pending',
        servicePrice: formData.servicePrice || selectedService.basePrice || 0,
        therapistPrice: formData.therapistPrice || selectedTherapist?.hourlyRate || 0,
        roomPrice: formData.roomPrice || 0,
        discount: formData.discount || 0,
        totalPrice: formData.totalPrice || selectedService.basePrice || 0,
        paymentStatus: formData.paymentStatus || 'pending',
        notes: formData.notes || '',
        healthNotes: formData.healthNotes || '',
        allergies: formData.allergies || [],
        preferences: formData.preferences || [],
      };

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setSubmitError('Please login to book an appointment');
        showNotification('Please login to book an appointment', 'error');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;

      const url = editingAppointment 
        ? `${API_BASE_URL}/spa/appointments/${editingAppointment._id}`
        : `${API_BASE_URL}/spa/appointments`;

      const response = await fetch(url, {
        method: editingAppointment ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${editingAppointment ? 'update' : 'create'} appointment`);
      }
      
      showNotification(
        editingAppointment 
          ? 'Appointment updated successfully!' 
          : 'Appointment booked successfully!',
        'success'
      );
      await fetchAppointments({ background: true });
      setShowModal(false);
      setEditingAppointment(null);
      setFormData({
        guestId: '',
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        service: '',
        serviceName: '',
        therapist: '',
        therapistName: '',
        spaRoom: '',
        spaRoomNumber: '',
        appointmentDate: '',
        startTime: '',
        endTime: '',
        duration: 0,
        specialRequests: '',
        roomNumber: '',
        status: 'pending',
        servicePrice: 0,
        therapistPrice: 0,
        roomPrice: 0,
        discount: 0,
        totalPrice: 0,
        paymentStatus: 'pending',
        notes: '',
        healthNotes: '',
        allergies: [],
        preferences: [],
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        setSubmitError('Your session has expired. Please login again.');
      } else {
        setSubmitError('Error: ' + error.message);
      }
    }
  };

  const handleDeleteAppointment = (id) => {
    setAppointmentToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to update appointment status', 'error');
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;

      const response = await fetch(`${API_BASE_URL}/spa/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const updatedAppointment = await response.json();
      setAppointments(prev => 
        prev.map(apt => apt._id === appointmentId ? updatedAppointment.appointment : apt)
      );
      showNotification(`Appointment status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      guestId: appointment.guestId,
      guestName: appointment.guestName,
      guestPhone: appointment.guestPhone || '',
      guestEmail: appointment.guestEmail || '',
      service: appointment.service,
      serviceName: appointment.serviceName || '',
      therapist: appointment.therapist || '',
      therapistName: appointment.therapistName || '',
      spaRoom: appointment.spaRoom || '',
      spaRoomNumber: appointment.spaRoomNumber || '',
      appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
      startTime: appointment.startTime || '',
      endTime: appointment.endTime || '',
      duration: appointment.duration || 0,
      specialRequests: appointment.specialRequests || '',
      roomNumber: appointment.roomNumber || '',
      status: appointment.status || 'pending',
      servicePrice: appointment.servicePrice || 0,
      therapistPrice: appointment.therapistPrice || 0,
      roomPrice: appointment.roomPrice || 0,
      discount: appointment.discount || 0,
      totalPrice: appointment.totalPrice || 0,
      paymentStatus: appointment.paymentStatus || 'pending',
      notes: appointment.notes || '',
      healthNotes: appointment.healthNotes || '',
      allergies: appointment.allergies || [],
      preferences: appointment.preferences || [],
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to delete appointments', 'error');
        setShowConfirmDialog(false);
        setAppointmentToDelete(null);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;

      const response = await fetch(`${API_BASE_URL}/spa/appointments/${appointmentToDelete}`, {
        method: 'DELETE',
        headers
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete appointment');
      }
      
      setAppointments(prev => prev.filter(a => a._id !== appointmentToDelete));
      showNotification('Appointment and associated billing permanently deleted!', 'success');
      setShowConfirmDialog(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showNotification('Your session has expired. Please login again.', 'error');
      } else {
        showNotification('Error: ' + error.message, 'error');
      }
      setShowConfirmDialog(false);
      setAppointmentToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] animate-fade-in-down">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
          }`}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <XCircle size={20} />}
            {notification.type === 'info' && <AlertCircle size={20} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Appointments</h2>
              <p className="text-sm text-gray-600">Manage spa and wellness appointments</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAppointments}
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                title="Refresh appointments"
              >
                <RefreshCw size={18} className="mr-2" /> Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                <Plus size={18} className="mr-2" />
                Book Appointment
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-4 sm:px-6 py-6">
        {loading && appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Preparing appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No appointments found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${sidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
            {filteredAppointments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition relative">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{apt.appointmentId}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Apt ID</p>
                    </div>
                    <select
                      value={apt.status}
                      onChange={(e) => handleUpdateStatus(apt._id, e.target.value)}
                      style={{
                        backgroundColor: apt.status === 'pending' ? '#fee2e2' :
                                        apt.status === 'confirmed' ? '#dbeafe' :
                                        apt.status === 'in-progress' ? '#fef3c7' :
                                        apt.status === 'completed' ? '#dcfce7' :
                                        apt.status === 'cancelled' ? '#f3f4f6' :
                                        apt.status === 'no-show' ? '#fecaca' : '#f3f4f6',
                        color: apt.status === 'pending' ? '#991b1b' :
                               apt.status === 'confirmed' ? '#1e40af' :
                               apt.status === 'in-progress' ? '#92400e' :
                               apt.status === 'completed' ? '#166534' :
                               apt.status === 'cancelled' ? '#4b5563' :
                               apt.status === 'no-show' ? '#991b1b' : '#4b5563',
                        borderColor: apt.status === 'pending' ? '#fca5a5' :
                                    apt.status === 'confirmed' ? '#93c5fd' :
                                    apt.status === 'in-progress' ? '#fcd34d' :
                                    apt.status === 'completed' ? '#86efac' :
                                    apt.status === 'cancelled' ? '#d1d5db' :
                                    apt.status === 'no-show' ? '#fca5a5' : '#d1d5db'
                      }}
                      className="px-2 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </div>

                  {/* Guest Info */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-start gap-2 mb-2">
                      <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{apt.guestName}</p>
                        <p className="text-xs text-gray-500 truncate">{apt.guestPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-start gap-2">
                      <Sparkles size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{apt.serviceName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{apt.duration || 0} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">{apt.startTime} - {apt.endTime}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-900">Rs. {apt.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 min-w-[60px] px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => handleEditAppointment(apt)}
                      className="flex-1 min-w-[60px] px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(apt._id)}
                      className="flex-1 min-w-[60px] px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && createPortal(
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingAppointment ? 'Edit Appointment' : 'Book Appointment'}
                </h2>
                <button onClick={() => {
                  setShowModal(false);
                  setEditingAppointment(null);
                }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBookAppointment} className="p-4 sm:p-6 space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{submitError}</div>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search & Select Guest *</label>
                    <div className="relative">
                      <div className="flex gap-2 items-center">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, email, phone, or identity number..."
                          value={guestSearchTerm}
                          onChange={(e) => handleGuestSearch(e.target.value)}
                          onFocus={() => guestSearchTerm && setShowGuestDropdown(true)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {showGuestDropdown && filteredGuests.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {filteredGuests.map(guest => {
                            const fullName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
                            return (
                              <button
                                key={guest._id}
                                type="button"
                                onClick={() => handleSelectGuest(guest)}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-gray-900">{fullName}</p>
                                    <p className="text-sm text-gray-600">{guest.email}</p>
                                    {guest.idNumber && (
                                      <p className="text-xs text-gray-500">ID: {guest.idNumber}</p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm">
                                    <p className="text-gray-700">{guest.phone}</p>
                                    {guest.roomNumber && (
                                      <p className="text-gray-600">Room: {guest.roomNumber}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* No results message */}
                      {showGuestDropdown && guestSearchTerm && filteredGuests.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 text-center text-gray-600">
                          No guests found matching "{guestSearchTerm}"
                        </div>
                      )}
                    </div>

                    {/* Selected Guest Info */}
                    {formData.guestId && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Selected: {formData.guestName}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Service</option>
                      {services.map(svc => (
                        <option key={svc._id} value={svc._id}>{svc.serviceName}</option>
                      ))}
                    </select>
                    {formData.service && formData.serviceName && (
                      <p className="mt-2 text-xs text-green-600 font-medium">✓ Selected: {formData.serviceName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Therapist</label>
                    <select
                      value={formData.therapist}
                      onChange={(e) => setFormData({ ...formData, therapist: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Therapist (Optional)</option>
                      {therapists.map(th => (
                        <option key={th._id} value={th._id}>{th.name}</option>
                      ))}
                    </select>
                    {formData.therapist && formData.therapistName && (
                      <p className="mt-2 text-xs text-green-600 font-medium">✓ Selected: {formData.therapistName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spa Room</label>
                    <select
                      value={formData.spaRoom}
                      onChange={(e) => setFormData({ ...formData, spaRoom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Room (Optional)</option>
                      {rooms.map(room => (
                        <option key={room._id} value={room._id}>{room.roomNumber}</option>
                      ))}
                    </select>
                    {formData.spaRoom && formData.spaRoomNumber && (
                      <p className="mt-2 text-xs text-green-600 font-medium">✓ Selected: Room {formData.spaRoomNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && createPortal(
        <div 
          onClick={() => setShowDetailModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Appointment - {selectedAppointment.appointmentId}
                </h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Guest Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.guestEmail}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Appointment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Therapist</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.therapistName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-base font-semibold text-gray-900">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-base font-semibold text-gray-900">{selectedAppointment.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="text-base font-semibold text-gray-900">${selectedAppointment.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedAppointment.specialRequests && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b">Special Requests</h3>
                  <p className="text-gray-700">{selectedAppointment.specialRequests}</p>
                </div>
              )}

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmationModal
        isOpen={showConfirmDialog}
        title="Delete Appointment Permanently"
        message="Are you sure you want to permanently delete this appointment and its associated billing record? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setAppointmentToDelete(null);
        }}
      />
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
  }
`;
document.head.appendChild(style);

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-down">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AppointmentTracker;
