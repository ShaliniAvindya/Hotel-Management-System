import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Calendar, Star, AlertCircle, X, CheckCircle, XCircle, Trash2, Edit, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';

const TherapistScheduling = ({ sidebarOpen = false }) => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [therapistToDelete, setTherapistToDelete] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    monday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
    tuesday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
    wednesday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
    thursday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
    friday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
    saturday: { startTime: '10:00', endTime: '16:00', isAvailable: false },
    sunday: { startTime: '10:00', endTime: '16:00', isAvailable: false },
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specializations: [],
    hourlyRate: 0,
    experience: 0,
    availability: [],
    bio: '',
    certifications: []
  });
  const [tempCertification, setTempCertification] = useState({
    name: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: ''
  });
  const [tempCustomSpecialization, setTempCustomSpecialization] = useState('');

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/spa/therapists?limit=500&fields=_id,name,email,phone,specializations,hourlyRate,experience,availability,bio,certifications,totalAppointments,isActive`
      );
      if (!response.ok) throw new Error('Failed to fetch therapists');
      const data = await response.json();
      const safeTherapists = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);
      setTherapists(safeTherapists);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setTherapists([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const filteredTherapists = therapists.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTherapist = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.hourlyRate) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to add a therapist', 'error');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;

      const availability = {
        Monday: {
          start: scheduleData.monday.startTime,
          end: scheduleData.monday.endTime,
          available: scheduleData.monday.isAvailable
        },
        Tuesday: {
          start: scheduleData.tuesday.startTime,
          end: scheduleData.tuesday.endTime,
          available: scheduleData.tuesday.isAvailable
        },
        Wednesday: {
          start: scheduleData.wednesday.startTime,
          end: scheduleData.wednesday.endTime,
          available: scheduleData.wednesday.isAvailable
        },
        Thursday: {
          start: scheduleData.thursday.startTime,
          end: scheduleData.thursday.endTime,
          available: scheduleData.thursday.isAvailable
        },
        Friday: {
          start: scheduleData.friday.startTime,
          end: scheduleData.friday.endTime,
          available: scheduleData.friday.isAvailable
        },
        Saturday: {
          start: scheduleData.saturday.startTime,
          end: scheduleData.saturday.endTime,
          available: scheduleData.saturday.isAvailable
        },
        Sunday: {
          start: scheduleData.sunday.startTime,
          end: scheduleData.sunday.endTime,
          available: scheduleData.sunday.isAvailable
        },
      };

      const specializations = formData.specializations.filter(s => s !== 'other');

      const therapistData = {
        ...formData,
        specializations,
        availability,
        isActive: true
      };

      const method = editingTherapist ? 'PUT' : 'POST';
      const url = editingTherapist 
        ? `${API_BASE_URL}/spa/therapists/${editingTherapist._id}`
        : `${API_BASE_URL}/spa/therapists`;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(therapistData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save therapist');
      }
      
      showNotification(editingTherapist ? 'Therapist updated successfully!' : 'Therapist added successfully!', 'success');
      await fetchTherapists({ background: true });
      setShowModal(false);
      setEditingTherapist(null);
      setFormData({ name: '', email: '', phone: '', specializations: [], hourlyRate: 0, experience: 0, availability: [] });
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

  const handleDeleteTherapist = (therapistId) => {
    setTherapistToDelete(therapistId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!therapistToDelete) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to delete therapist', 'error');
        setShowConfirmDialog(false);
        setTherapistToDelete(null);
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/spa/therapists/${therapistToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': bearerToken, 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete therapist');
      }
      
      setTherapists(prev => prev.filter(t => t._id !== therapistToDelete));
      showNotification('Therapist deleted successfully!', 'success');
      setShowConfirmDialog(false);
      setTherapistToDelete(null);
    } catch (error) {
      console.error('Error deleting therapist:', error);
      showNotification('Error deleting therapist: ' + error.message, 'error');
      setShowConfirmDialog(false);
      setTherapistToDelete(null);
    }
  };

  const handleToggleTherapist = async (therapistId, currentStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to update therapist', 'error');
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/spa/therapists/${therapistId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': bearerToken, 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to toggle therapist');
      }
      
      const updatedTherapists = therapists.map(t => 
        t._id === therapistId ? { ...t, isActive: !t.isActive } : t
      );
      setTherapists(updatedTherapists);
      showNotification(`Therapist ${responseData.therapist.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error toggling therapist:', error);
      showNotification('Error updating therapist: ' + error.message, 'error');
    }
  };

  const handleEditTherapist = (therapist) => {
    setEditingTherapist(therapist);
    setFormData({
      name: therapist.name,
      email: therapist.email,
      phone: therapist.phone || '',
      specializations: therapist.specializations || [],
      hourlyRate: therapist.hourlyRate || 0,
      experience: therapist.experience || 0,
      availability: therapist.availability || [],
      bio: therapist.bio || '',
      certifications: therapist.certifications || []
    });
    
    if (therapist.availability) {
      const availability = therapist.availability;
      setScheduleData({
        monday: {
          startTime: availability.Monday?.start || '09:00',
          endTime: availability.Monday?.end || '17:00',
          isAvailable: availability.Monday?.available !== false
        },
        tuesday: {
          startTime: availability.Tuesday?.start || '09:00',
          endTime: availability.Tuesday?.end || '17:00',
          isAvailable: availability.Tuesday?.available !== false
        },
        wednesday: {
          startTime: availability.Wednesday?.start || '09:00',
          endTime: availability.Wednesday?.end || '17:00',
          isAvailable: availability.Wednesday?.available !== false
        },
        thursday: {
          startTime: availability.Thursday?.start || '09:00',
          endTime: availability.Thursday?.end || '17:00',
          isAvailable: availability.Thursday?.available !== false
        },
        friday: {
          startTime: availability.Friday?.start || '09:00',
          endTime: availability.Friday?.end || '17:00',
          isAvailable: availability.Friday?.available !== false
        },
        saturday: {
          startTime: availability.Saturday?.start || '10:00',
          endTime: availability.Saturday?.end || '16:00',
          isAvailable: availability.Saturday?.available !== false
        },
        sunday: {
          startTime: availability.Sunday?.start || '10:00',
          endTime: availability.Sunday?.end || '16:00',
          isAvailable: availability.Sunday?.available !== false
        },
      });
    }
    
    setTempCertification({
      name: '',
      issueDate: '',
      expiryDate: '',
      certificateNumber: ''
    });
    setTempCustomSpecialization('');
    setShowModal(true);
  };

  const handleViewSchedule = (therapist) => {
    setSelectedTherapist(therapist);
    setShowScheduleModal(true);
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

      <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Therapist Management</h2>
              <p className="text-sm text-gray-600">Manage your spa team and schedules</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchTherapists}
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                title="Refresh therapists"
              >
                <RefreshCw size={18} className="mr-2" /> Refresh
              </button>
              <button 
                onClick={() => {
                  setEditingTherapist(null);
                  setFormData({ name: '', email: '', phone: '', specializations: [], hourlyRate: 0, experience: 0, availability: [], bio: '', certifications: [] });
                  setTempCertification({ name: '', issueDate: '', expiryDate: '', certificateNumber: '' });
                  setTempCustomSpecialization('');
                  setScheduleData({
                    monday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
                    tuesday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
                    wednesday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
                    thursday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
                    friday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
                    saturday: { startTime: '10:00', endTime: '16:00', isAvailable: false },
                    sunday: { startTime: '10:00', endTime: '16:00', isAvailable: false },
                  });
                  setShowModal(true);
                }}
                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition">
                <Plus size={18} className="mr-2" /> Add Therapist
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search therapists by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {loading && therapists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Preparing therapists...</p>
          </div>
        ) : filteredTherapists.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No therapists found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${sidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-6`}>
            {filteredTherapists.map(therapist => (
              <div key={therapist._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
                {therapist.profileImage && (
                  <img src={therapist.profileImage} alt={therapist.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{therapist.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{therapist.email}</p>
                  
                  {therapist.bio && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{therapist.bio}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Experience</p>
                      <p className="font-semibold text-gray-900">{therapist.experience || 0} yrs</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Hourly Rate</p>
                      <p className="font-semibold text-green-600">Rs. {therapist.hourlyRate}/hr</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Appointments</p>
                      <p className="font-semibold text-gray-900">{therapist.totalAppointments || 0}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-1 items-center">
                      {therapist.specializations && therapist.specializations.length > 0 ? (
                        <>
                          {therapist.specializations.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              {spec}
                            </span>
                          ))}
                          {therapist.specializations.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              +{therapist.specializations.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No specializations</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center flex-wrap">
                    <button 
                      onClick={() => handleViewSchedule(therapist)}
                      className="flex-1 min-w-[60px] px-3 py-2 text-orange-600 hover:bg-orange-50 rounded text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Calendar size={16} /> View
                    </button>
                    <button
                      onClick={() => handleEditTherapist(therapist)}
                      className="flex-1 min-w-[60px] px-3 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    
                    <button
                      onClick={() => handleToggleTherapist(therapist._id, therapist.isActive)}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        therapist.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={therapist.isActive ? 'Active' : 'Inactive'}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          therapist.isActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteTherapist(therapist._id)}
                      className="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition"
                      title="Delete Permanently"
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
                  {editingTherapist ? 'Edit Therapist' : 'Add Therapist'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTherapist} className="p-4 sm:p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Therapist Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., +94701234567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (Rs.) *</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Specializations</label>
                    <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                      {['massage', 'facial', 'body-treatment', 'therapy', 'wellness', 'other'].map((spec) => (
                        <div key={spec} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`spec-${spec}`}
                            checked={formData.specializations.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, specializations: [...formData.specializations, spec] });
                              } else {
                                setFormData({ ...formData, specializations: formData.specializations.filter(s => s !== spec) });
                              }
                            }}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                          />
                          <label htmlFor={`spec-${spec}`} className="ml-3 text-sm text-gray-700 cursor-pointer capitalize">
                            {spec.replace('-', ' ')}
                          </label>
                        </div>
                      ))}
                      
                      {/* Custom Specializations */}
                      {formData.specializations.filter(s => !['massage', 'facial', 'body-treatment', 'therapy', 'wellness', 'other'].includes(s)).map((customSpec, idx) => (
                        <div key={`custom-${idx}`} className="flex items-center bg-orange-50 p-2 rounded border border-orange-200">
                          <span className="text-sm text-gray-700 flex-1 capitalize">{customSpec}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                specializations: formData.specializations.filter(s => s !== customSpec)
                              });
                            }}
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Custom Specialization */}
                    {formData.specializations.includes('other') && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={tempCustomSpecialization}
                          onChange={(e) => setTempCustomSpecialization(e.target.value)}
                          placeholder="Enter custom specialization..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (tempCustomSpecialization.trim() && !formData.specializations.includes(tempCustomSpecialization.toLowerCase())) {
                                setFormData({
                                  ...formData,
                                  specializations: [...formData.specializations, tempCustomSpecialization.toLowerCase()]
                                });
                                setTempCustomSpecialization('');
                                showNotification('Custom specialization added!', 'success');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempCustomSpecialization.trim() && !formData.specializations.includes(tempCustomSpecialization.toLowerCase())) {
                              setFormData({
                                ...formData,
                                specializations: [...formData.specializations, tempCustomSpecialization.toLowerCase()]
                              });
                              setTempCustomSpecialization('');
                              showNotification('Custom specialization added!', 'success');
                            } else if (formData.specializations.includes(tempCustomSpecialization.toLowerCase())) {
                              showNotification('This specialization already exists!', 'error');
                            } else {
                              showNotification('Please enter a specialization name', 'error');
                            }
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm whitespace-nowrap"
                        >
                          <Plus size={14} className="inline mr-1" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Enter therapist bio..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                
                {/* Add Certification Form */}
                <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-white">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Certification</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Certification Name"
                      value={tempCertification.name}
                      onChange={(e) => setTempCertification({ ...tempCertification, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Certificate Number"
                      value={tempCertification.certificateNumber}
                      onChange={(e) => setTempCertification({ ...tempCertification, certificateNumber: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Issue Date"
                      value={tempCertification.issueDate}
                      onChange={(e) => setTempCertification({ ...tempCertification, issueDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      value={tempCertification.expiryDate}
                      onChange={(e) => setTempCertification({ ...tempCertification, expiryDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (tempCertification.name && tempCertification.certificateNumber) {
                        setFormData({
                          ...formData,
                          certifications: [...formData.certifications, tempCertification]
                        });
                        setTempCertification({ name: '', issueDate: '', expiryDate: '', certificateNumber: '' });
                        showNotification('Certification added!', 'success');
                      } else {
                        showNotification('Please fill in certification name and number', 'error');
                      }
                    }}
                    className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                  >
                    <Plus size={14} className="inline mr-2" /> Add Certification
                  </button>
                </div>

                {/* Certifications List */}
                {formData.certifications.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Current Certifications ({formData.certifications.length})</h4>
                    {formData.certifications.map((cert, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                          <p className="text-xs text-gray-600">Certificate #: {cert.certificateNumber}</p>
                          {cert.issueDate && <p className="text-xs text-gray-600">Issued: {cert.issueDate}</p>}
                          {cert.expiryDate && <p className="text-xs text-gray-600">Expires: {cert.expiryDate}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              certifications: formData.certifications.filter((_, i) => i !== idx)
                            });
                          }}
                          className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Remove certification"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {editingTherapist ? 'Update Therapist' : 'Add Therapist'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTherapist(null);
                    setFormData({ name: '', email: '', phone: '', specializations: [], hourlyRate: 0, experience: 0, availability: [], bio: '', certifications: [] });
                    setTempCertification({ name: '', issueDate: '', expiryDate: '', certificateNumber: '' });
                    setTempCustomSpecialization('');
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

      {showScheduleModal && selectedTherapist && createPortal(
        <div 
          onClick={() => setShowScheduleModal(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Schedule - {selectedTherapist.name}
                </h2>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {Object.entries(scheduleData).map(([day, data]) => (
                <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 capitalize">{day}</h3>
                  </div>
                  <label className="flex items-center gap-2 mr-4">
                    <input
                      type="checkbox"
                      checked={data.isAvailable}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        [day]: { ...data, isAvailable: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Available</span>
                  </label>
                  {data.isAvailable && (
                    <>
                      <input
                        type="time"
                        value={data.startTime}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          [day]: { ...data, startTime: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="text-gray-400 px-2">to</span>
                      <input
                        type="time"
                        value={data.endTime}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          [day]: { ...data, endTime: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      if (!token) {
                        showNotification('Please login to update schedule', 'error');
                        return;
                      }

                      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                      const availability = {
                        Monday: {
                          start: scheduleData.monday.startTime,
                          end: scheduleData.monday.endTime,
                          available: scheduleData.monday.isAvailable
                        },
                        Tuesday: {
                          start: scheduleData.tuesday.startTime,
                          end: scheduleData.tuesday.endTime,
                          available: scheduleData.tuesday.isAvailable
                        },
                        Wednesday: {
                          start: scheduleData.wednesday.startTime,
                          end: scheduleData.wednesday.endTime,
                          available: scheduleData.wednesday.isAvailable
                        },
                        Thursday: {
                          start: scheduleData.thursday.startTime,
                          end: scheduleData.thursday.endTime,
                          available: scheduleData.thursday.isAvailable
                        },
                        Friday: {
                          start: scheduleData.friday.startTime,
                          end: scheduleData.friday.endTime,
                          available: scheduleData.friday.isAvailable
                        },
                        Saturday: {
                          start: scheduleData.saturday.startTime,
                          end: scheduleData.saturday.endTime,
                          available: scheduleData.saturday.isAvailable
                        },
                        Sunday: {
                          start: scheduleData.sunday.startTime,
                          end: scheduleData.sunday.endTime,
                          available: scheduleData.sunday.isAvailable
                        },
                      };

                      const response = await fetch(`${API_BASE_URL}/spa/therapists/${selectedTherapist._id}`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': bearerToken,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          ...selectedTherapist,
                          availability
                        })
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update schedule');
                      }

                      showNotification('Schedule updated successfully!', 'success');
                      await fetchTherapists({ background: true });
                      setShowScheduleModal(false);
                    } catch (error) {
                      console.error('Error updating schedule:', error);
                      showNotification('Error: ' + error.message, 'error');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Save Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showConfirmDialog && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Therapist</h2>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-gray-700 text-sm sm:text-base">Are you sure you want to delete this therapist? This action cannot be undone.</p>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setTherapistToDelete(null);
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

export default TherapistScheduling;
