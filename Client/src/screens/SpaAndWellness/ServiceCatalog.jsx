import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Filter, Edit, Trash2, AlertCircle, X, Eye, Sparkles, CheckCircle, XCircle, Power, RefreshCw, Calendar, Star } from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';
import { readViewCache, writeViewCache } from '../../lib/viewCache';

const ServiceCatalog = ({ sidebarOpen = false }) => {
  const cachedServices = readViewCache('spa-services', { fallback: [] });
  const [services, setServices] = useState(cachedServices);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(() => cachedServices.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, filterCategory, services]);

  useEffect(() => {
    writeViewCache('spa-services', services);
  }, [services]);

  const fetchServices = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/spa/services?limit=500&fields=_id,serviceName,category,description,duration,basePrice,maxCapacity,benefits,isActive,createdAt`
      );
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      const safeServices = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);
      setServices(safeServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;
    if (searchTerm) {
      filtered = filtered.filter(s => s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(s => s.category === filterCategory);
    }
    setFilteredServices(filtered);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      duration: service.duration,
      basePrice: service.basePrice,
      maxCapacity: service.maxCapacity || 1,
      benefits: service.benefits || []
    });
    setTempBenefit('');
    setShowServiceForm(true);
  };

  const [serviceFormData, setServiceFormData] = useState({
    serviceName: '',
    category: 'massage',
    description: '',
    duration: 60,
    basePrice: 0,
    maxCapacity: 1,
    benefits: []
  });
  const [tempBenefit, setTempBenefit] = useState('');

  const handleDeleteService = async (serviceId) => {
    setServiceToDelete(serviceId);
    setShowConfirmDialog(true);
  };

  const handleToggleService = async (serviceId, currentStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to update services', 'error');
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Toggling service:', serviceId);
      
      const response = await fetch(`${API_BASE_URL}/spa/services/${serviceId}/toggle`, {
        method: 'PATCH',
        headers: { 
          'Authorization': bearerToken,
          'Content-Type': 'application/json'
        }
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to toggle service status');
      }
      
      const updatedServices = services.map(s => 
        s._id === serviceId ? { ...s, isActive: !s.isActive } : s
      );
      setServices(updatedServices);
      filterServices();
      
      showNotification(`Service ${responseData.service.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error toggling service:', error);
      showNotification('Error updating service: ' + error.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to delete services', 'error');
        setShowConfirmDialog(false);
        setServiceToDelete(null);
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Attempting to delete service:', serviceToDelete);
      console.log('Token:', bearerToken.substring(0, 20) + '...');
      
      const response = await fetch(`${API_BASE_URL}/spa/services/${serviceToDelete}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': bearerToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response status:', response.status);
      
      const responseData = await response.json();
      console.log('Delete response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to delete service (Status: ${response.status})`);
      }
      
      setServices(prevServices => 
        prevServices.filter(s => s._id !== serviceToDelete)
      );
      setFilteredServices(prevServices =>
        prevServices.filter(s => s._id !== serviceToDelete)
      );
      
      showNotification('Service deleted successfully!', 'success');
      setShowConfirmDialog(false);
      setServiceToDelete(null);
      fetchServices({ background: true });
    } catch (error) {
      console.error('Error deleting service:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showNotification('Your session has expired. Please login again.', 'error');
      } else {
        showNotification('Error deleting service: ' + error.message, 'error');
      }
      setShowConfirmDialog(false);
      setServiceToDelete(null);
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    try {
      if (!serviceFormData.serviceName || !serviceFormData.basePrice || !serviceFormData.duration || !serviceFormData.description) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to manage services', 'error');
        return;
      }
      
      const url = editingService 
        ? `${API_BASE_URL}/spa/services/${editingService._id}`
        : `${API_BASE_URL}/spa/services`;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      // Only add Bearer prefix if token doesn't already have it
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;
        
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(serviceFormData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save service');
      }
      showNotification(editingService ? 'Service updated successfully!' : 'Service added successfully!', 'success');
      await fetchServices({ background: true });
      setShowServiceForm(false);
      setEditingService(null);
      setTempBenefit('');
      setServiceFormData({ serviceName: '', category: 'massage', description: '', duration: 60, basePrice: 0, maxCapacity: 1, benefits: [] });
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showNotification('Your session has expired. Please login again.', 'error');
      } else {
        showNotification('Error saving service: ' + error.message, 'error');
      }
    }
  };

  const ServiceModal = ({ service, onClose }) => {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c9a24a]/30">
          <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#c9a24a]/20 rounded-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#c9a24a]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">{service.serviceName}</h2>
                <p className="text-sm text-gray-300">Service Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowServiceDetails(false);
                  handleEditService(service);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a24a] hover:bg-[#b8903e] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={onClose}
                className="p-2 sm:p-3 hover:bg-white/10 rounded-lg transition-colors text-white" aria-label="Close"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Name</p>
                  <p className="text-base font-medium text-gray-900">{service.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <span className="inline-block px-3 py-1 bg-[#fffaf0] text-[#8a681b] text-sm font-semibold rounded-full border border-[#ead8a8]">
                    {service.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-base font-medium text-gray-900">{service.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Base Price</p>
                  <p className="text-base font-medium text-green-600">${service.basePrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{service.description}</p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Requirements</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Max Capacity:</span> <span className="font-medium">{service.maxCapacity} guests</span></p>
                </div>
              </div>
              {service.benefits && service.benefits.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Benefits</h3>
                  <div className="space-y-2 text-sm">
                    {service.benefits.map((benefit, idx) => (
                      <p key={idx} className="text-gray-700">âœ“ {benefit}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>,
      document.body
    );
  };

  const ServiceCard = ({ service }) => {
    return (
      <div className="border border-[#c9a24a]/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300 bg-white group">
        <div className="h-1 w-full bg-[#c9a24a]" />
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#0f2742] text-base sm:text-lg mb-1 truncate group-hover:text-[#c9a24a] transition-colors">
                {service.serviceName}
              </h3>
              <p className="text-sm text-gray-600 font-medium">{service.category}</p>
            </div>
            <span className={`flex-shrink-0 inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
              service.isActive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Data display - 2 wise layout */}
          <div className="space-y-3 mb-5 text-sm text-gray-600 font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium text-gray-900">{service.duration} min</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Max Guests</p>
                  <p className="text-sm font-medium text-gray-900">{service.maxCapacity || 1}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-sm font-bold text-green-600">${service.basePrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-[#c9a24a] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{service.isActive ? 'Available' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons at bottom */}
          <div className="flex items-center justify-end gap-1 pt-4 mt-auto border-t border-gray-100">
            <button
              onClick={() => handleViewService(service)}
              className="p-2 text-gray-400 hover:text-[#0f2742] hover:bg-gray-50 rounded-lg transition-all"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => handleEditService(service)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleToggleService(service._id, service.isActive)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title={service.isActive ? 'Deactivate' : 'Activate'}
            >
              <Power size={18} />
            </button>
            <button
              onClick={() => handleDeleteService(service._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) => {
    if (!isOpen) return null;
    
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-gray-700 text-sm sm:text-base">{message}</p>
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full bg-white/80"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 transition-all duration-300 ease-in-out">
      {notification && (
        <div className="fixed top-4 right-4 z-[9999]">
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

      {/* Filters and Controls */}
      <div className="px-4 sm:px-6 py-4 bg-white w-full border-b border-[#c9a24a]/30 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 flex-1 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a] transition-all text-[#0f2742]"
              >
                <option value="all">All Categories</option>
                <option value="massage">Massage</option>
                <option value="facial">Facial</option>
                <option value="body-treatment">Body Treatment</option>
                <option value="therapy">Therapy</option>
                <option value="wellness">Wellness</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setShowServiceForm(true);
              }}
              className="flex items-center justify-center px-6 py-2 bg-[#0f2742] text-white rounded-lg hover:bg-[#153456] transition-colors text-sm w-full sm:w-auto ml-auto"
            >
              <Plus size={18} className="mr-2" /> Add Service
            </button>
          </div>
          <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredServices.length} services
            </div>
            <button
              onClick={fetchServices}
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
        {loading && services.length === 0 ? (
          <div className="text-center py-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-56 rounded-xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No services found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${sidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
            {filteredServices.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showServiceDetails && selectedService && (
        <ServiceModal service={selectedService} onClose={() => setShowServiceDetails(false)} />
      )}
      <ConfirmationModal
        isOpen={showConfirmDialog}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setServiceToDelete(null);
        }}
      />
      {showServiceForm && createPortal(
        <div 
          onClick={() => {
            setShowServiceForm(false);
            setEditingService(null);
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2742] z-10 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => {
                setShowServiceForm(false);
                setEditingService(null);
              }} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="p-4 sm:p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Swedish Massage"
                      value={serviceFormData.serviceName}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, serviceName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select 
                      value={serviceFormData.category}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      required
                    >
                      <option value="massage">Massage</option>
                      <option value="facial">Facial</option>
                      <option value="body-treatment">Body Treatment</option>
                      <option value="therapy">Therapy</option>
                      <option value="wellness">Wellness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 60"
                      value={serviceFormData.duration}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="15"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (Rs.) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 2500"
                      value={serviceFormData.basePrice}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, basePrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      placeholder="Service description..."
                      value={serviceFormData.description}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                    <input
                      type="number"
                      placeholder="e.g., 1"
                      value={serviceFormData.maxCapacity}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, maxCapacity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter a benefit"
                        value={tempBenefit}
                        onChange={(e) => setTempBenefit(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tempBenefit.trim()) {
                              setServiceFormData({ ...serviceFormData, benefits: [...serviceFormData.benefits, tempBenefit.trim()] });
                              setTempBenefit('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempBenefit.trim()) {
                            setServiceFormData({ ...serviceFormData, benefits: [...serviceFormData.benefits, tempBenefit.trim()] });
                            setTempBenefit('');
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {serviceFormData.benefits?.map((benefit, index) => (
                        <div key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {benefit}
                          <button
                            type="button"
                            onClick={() => setServiceFormData({ ...serviceFormData, benefits: serviceFormData.benefits.filter((_, i) => i !== index) })}
                            className="text-purple-600 hover:text-purple-900 font-bold"
                          >
                            Ã—
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
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
    </div>
  );
};

export default ServiceCatalog;

