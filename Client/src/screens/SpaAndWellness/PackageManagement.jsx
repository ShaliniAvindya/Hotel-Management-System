import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, Trash2, AlertCircle, DollarSign, X, RefreshCw, Eye, Minus } from 'lucide-react';
import { API_BASE_URL } from '../../apiconfig';
import { readViewCache, writeViewCache } from '../../lib/viewCache';

const PackageManagement = ({ sidebarOpen = false }) => {
  const cachedPackages = readViewCache('spa-packages', { fallback: [] });
  const cachedServices = readViewCache('spa-package-services', { fallback: [] });
  const [packages, setPackages] = useState(cachedPackages);
  const [loading, setLoading] = useState(() => cachedPackages.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [availableServices, setAvailableServices] = useState(cachedServices);
  const [serviceInput, setServiceInput] = useState({ serviceId: '', count: 1 });
  const [servicesLoading, setServicesLoading] = useState(false);
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    packageType: 'bundle',
    services: [],
    originalPrice: 0,
    discountType: 'percentage',
    discountValue: 0,
    totalDuration: 0,
    validFrom: '',
    validUntil: ''
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/spa/services?limit=500&fields=_id,serviceName,duration,basePrice,isActive&isActive=true`
      );
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setAvailableServices(Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchServices();
  }, []);

  useEffect(() => {
    writeViewCache('spa-packages', packages);
  }, [packages]);

  useEffect(() => {
    writeViewCache('spa-package-services', availableServices);
  }, [availableServices]);

  const handleAddService = () => {
    if (!serviceInput.serviceId) {
      showNotification('Please select a service', 'error');
      return;
    }

    const serviceExists = formData.services.some(
      service => service.serviceId === serviceInput.serviceId
    );

    if (serviceExists) {
      showNotification('Service already added to this package', 'error');
      return;
    }

    const newService = {
      serviceId: serviceInput.serviceId,
      quantity: parseInt(serviceInput.count) || 1,
      discount: 0
    };

    setFormData({
      ...formData,
      services: [...formData.services, newService]
    });

    // Reset the input
    setServiceInput({ serviceId: '', count: 1 });
  };

  const handleRemoveService = (serviceId) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s.serviceId !== serviceId)
    });
  };

  const handleUpdateServiceQuantity = (serviceId, quantity) => {
    const updatedServices = formData.services.map(service =>
      service.serviceId === serviceId
        ? { ...service, quantity: Math.max(1, parseInt(quantity) || 1) }
        : service
    );
    setFormData({ ...formData, services: updatedServices });
  };

  const getServiceName = (serviceId) => {
    const service = availableServices.find(s => s._id === serviceId);
    return service ? service.serviceName : 'Unknown Service';
  };

  const getServiceDuration = (serviceId) => {
    const service = availableServices.find(s => s._id === serviceId);
    return service ? service.duration : 0;
  };

  const fetchPackages = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/spa/packages?expand=0&limit=500&fields=_id,packageName,description,packageType,services,originalPrice,discountType,discountValue,totalDuration,validFrom,validUntil,isActive,createdAt`
      );
      if (!response.ok) throw new Error('Failed to fetch packages');
      const data = await response.json();
      const safePackages = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);
      setPackages(safePackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const filteredPackages = packages.filter(p => {
    const matchesSearch = p.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.packageType === filterType;
    return matchesSearch && matchesType;
  });

  const getDiscountPercentage = (original, discounted) => {
    if (!original || !discounted) return 0;
    return ((original - discounted) / original * 100).toFixed(0);
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to create a package', 'error');
        setShowModal(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = bearerToken;

      const url = editingPackage 
        ? `${API_BASE_URL}/spa/packages/${editingPackage._id}`
        : `${API_BASE_URL}/spa/packages`;

      const response = await fetch(url, {
        method: editingPackage ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save package');
      }
      
      showNotification(editingPackage ? 'Package updated successfully!' : 'Package created successfully!', 'success');
      await fetchPackages({ background: true });
      setShowModal(false);
      setEditingPackage(null);
      setFormData({ packageName: '', description: '', packageType: 'bundle', services: [], originalPrice: 0, discountType: 'percentage', discountValue: 0, totalDuration: 0, validFrom: '', validUntil: '' });
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showNotification('Your session has expired. Please login again.', 'error');
      } else {
        showNotification('Error saving package: ' + error.message, 'error');
      }
    }
  };

  const handleViewPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageDetails(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    const formattedServices = Array.isArray(pkg.services) 
      ? pkg.services.map(service => ({
          serviceId: service.serviceId || service,
          quantity: service.quantity || 1,
          discount: service.discount || 0
        }))
      : [];
    
    setFormData({
      packageName: pkg.packageName,
      description: pkg.description,
      packageType: pkg.packageType,
      services: formattedServices,
      originalPrice: pkg.originalPrice,
      discountType: pkg.discountType || 'percentage',
      discountValue: pkg.discountValue || 0,
      totalDuration: pkg.totalDuration || 0,
      validFrom: pkg.validFrom ? pkg.validFrom.split('T')[0] : '',
      validUntil: pkg.validUntil ? pkg.validUntil.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDeletePackage = (packageId) => {
    setPackageToDelete(packageId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to delete package', 'error');
        setShowConfirmDialog(false);
        setPackageToDelete(null);
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/spa/packages/${packageToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': bearerToken, 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete package');
      }
      
      setPackages(prev => prev.filter(p => p._id !== packageToDelete));
      showNotification('Package deleted successfully!', 'success');
      setShowConfirmDialog(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error('Error deleting package:', error);
      showNotification('Error deleting package: ' + error.message, 'error');
      setShowConfirmDialog(false);
      setPackageToDelete(null);
    }
  };

  const handleTogglePackage = async (packageId, currentStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        showNotification('Please login to update package', 'error');
        return;
      }

      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/spa/packages/${packageId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': bearerToken, 'Content-Type': 'application/json' }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to toggle package');
      }
      
      const updatedPackages = packages.map(p => 
        p._id === packageId ? { ...p, isActive: !p.isActive } : p
      );
      setPackages(updatedPackages);
      showNotification(`Package ${responseData.package.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error toggling package:', error);
      showNotification('Error updating package: ' + error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Spa Packages</h2>
              <p className="text-sm text-gray-600">Create and manage spa service packages</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchPackages}
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                title="Refresh packages"
              >
                <RefreshCw size={18} className="mr-2" /> Refresh
              </button>
              <button 
                onClick={() => {
                  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                  if (!token) {
                    showNotification('Please login to create a package', 'error');
                    return;
                  }
                  setShowModal(true);
                }}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition">
                <Plus size={18} className="mr-2" /> Create Package
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="single-service">Single Service</option>
              <option value="bundle">Bundle</option>
              <option value="membership">Membership</option>
              <option value="package-deal">Package Deal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {loading && packages.length === 0 ? (
          <div className="text-center py-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-64 rounded-xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No packages found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${sidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
            {filteredPackages.map(pkg => (
              <div key={pkg._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition relative">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.packageName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                  {pkg.services && pkg.services.length > 0 && (
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Services Included:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.services.slice(0, 2).map((service, idx) => {
                          const serviceName = typeof service === 'string' 
                            ? service 
                            : getServiceName(service.serviceId);
                          const quantity = typeof service === 'string' 
                            ? 1 
                            : service.quantity || 1;
                          return (
                            <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {serviceName} {quantity > 1 ? `(x${quantity})` : ''}
                            </span>
                          );
                        })}
                        {pkg.services.length > 2 && (
                          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                            +{pkg.services.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-700"><span className="font-medium">Type:</span> {pkg.packageType}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Duration:</span> {pkg.totalDuration} minutes</p>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Original Price</p>
                        <p className="text-sm text-gray-600 font-medium">Rs. {pkg.originalPrice?.toFixed(2)}</p>
                      </div>
                      {pkg.discountType === 'percentage' && pkg.discountValue > 0 && (
                        <>
                          <span className="text-gray-300">→</span>
                          <div>
                            <p className="text-xs text-green-600 mb-1">Discount: {pkg.discountValue}%</p>
                            <p className="text-sm text-green-600 font-bold">Rs. {(pkg.originalPrice * (1 - pkg.discountValue / 100)).toFixed(2)}</p>
                          </div>
                        </>
                      )}
                      {pkg.discountType === 'price' && pkg.discountValue > 0 && (
                        <>
                          <span className="text-gray-300">→</span>
                          <div>
                            <p className="text-xs text-green-600 mb-1">Final Price</p>
                            <p className="text-sm text-green-600 font-bold">Rs. {pkg.discountValue?.toFixed(2)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => handleViewPackage(pkg)}
                      className="flex-1 min-w-[60px] px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                      <Eye size={16} /> View
                    </button>
                    <button 
                      onClick={() => handleEditPackage(pkg)}
                      className="flex-1 min-w-[60px] px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleTogglePackage(pkg._id, pkg.isActive)}
                      className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pkg.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={pkg.isActive ? 'Active' : 'Inactive'}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          pkg.isActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg._id)}
                      className="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
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

      {/* Package Details Modal */}
      {showPackageDetails && selectedPackage && createPortal(
        <div 
          onClick={() => setShowPackageDetails(false)}
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{selectedPackage.packageName}</h2>
                  <p className="text-sm text-gray-600">Package Details</p>
                </div>
              </div>
              <button
                onClick={() => setShowPackageDetails(false)}
                className="p-2 sm:p-3 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Package Name</p>
                    <p className="text-base font-medium text-gray-900">{selectedPackage.packageName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {selectedPackage.packageType.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Original Price</p>
                    <p className="text-base font-medium text-gray-900">Rs. {selectedPackage.originalPrice?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Discount Type</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {selectedPackage.discountType === 'percentage' ? 'Percentage' : 'Price'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {selectedPackage.discountType === 'percentage' ? 'Discount (%)' : 'Final Price'}
                    </p>
                    <p className="text-base font-medium text-green-600">
                      {selectedPackage.discountType === 'percentage' 
                        ? `${selectedPackage.discountValue || 0}%`
                        : `Rs. ${selectedPackage.discountValue?.toFixed(2) || '0.00'}`
                      }
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Services Included</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.services && selectedPackage.services.length > 0 ? (
                        selectedPackage.services.map((service, idx) => {
                          const serviceName = typeof service === 'string' 
                            ? service 
                            : getServiceName(service.serviceId);
                          const quantity = typeof service === 'string' 
                            ? 1 
                            : service.quantity || 1;
                          return (
                            <span key={idx} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                              {serviceName} {quantity > 1 ? `(x${quantity})` : ''}
                            </span>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-600">No services specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedPackage.description && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedPackage.description}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Validity Period</h3>
                  <p className="text-sm text-gray-700">
                    {selectedPackage.validFrom ? (
                      <>
                        <span className="font-medium">From:</span> {new Date(selectedPackage.validFrom).toLocaleDateString()}<br />
                        <span className="font-medium">To:</span> {selectedPackage.validUntil ? new Date(selectedPackage.validUntil).toLocaleDateString() : 'Ongoing'}
                      </>
                    ) : (
                      <span>No time limit</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Duration</h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{selectedPackage.totalDuration || 0}</span> minutes
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Status</h3>
                  <p className="text-sm text-gray-700">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPackage.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedPackage.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPackageDetails(false);
                    handleEditPackage(selectedPackage);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Edit Package
                </button>
                <button
                  onClick={() => setShowPackageDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showModal && createPortal(
        <div 
          onClick={() => {
            setShowModal(false);
            setEditingPackage(null);
            setServiceInput({ serviceId: '', count: 1 });
            setFormData({ packageName: '', description: '', packageType: 'bundle', services: [], originalPrice: 0, discountType: 'percentage', discountValue: 0, totalDuration: 0, validFrom: '', validUntil: '' });
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{editingPackage ? 'Edit Package' : 'Create Package'}</h2>
                <button onClick={() => {
                  setShowModal(false);
                  setEditingPackage(null);
                  setServiceInput({ serviceId: '', count: 1 });
                  setFormData({ packageName: '', description: '', packageType: 'bundle', services: [], originalPrice: 0, discountType: 'percentage', discountValue: 0, totalDuration: 0, validFrom: '', validUntil: '' });
                }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddPackage} className="p-4 sm:p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Package Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Ultimate Relaxation Bundle"
                      value={formData.packageName}
                      onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Type *</label>
                    <select
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="single-service">Single Service</option>
                      <option value="bundle">Bundle</option>
                      <option value="membership">Membership</option>
                      <option value="package-deal">Package Deal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (Rs.) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 5000"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="price">Discounted Price (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.discountType === 'percentage' ? 'Discount (%)' : 'Final Price (Rs.)'}
                    </label>
                    <input
                      type="number"
                      placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 4000'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Duration (minutes)</label>
                    <input
                      type="number"
                      placeholder="e.g., 120"
                      value={formData.totalDuration}
                      onChange={(e) => setFormData({ ...formData, totalDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Services Included *</label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <select
                        value={serviceInput.serviceId}
                        onChange={(e) => setServiceInput({ ...serviceInput, serviceId: e.target.value })}
                        disabled={servicesLoading}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a service...</option>
                        {availableServices.map(service => (
                          <option key={service._id} value={service._id}>
                            {service.serviceName} ({service.duration} min) - Rs. {service.basePrice}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={serviceInput.count}
                        onChange={(e) => setServiceInput({ ...serviceInput, count: e.target.value })}
                        placeholder="Sessions"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      
                      <button
                        type="button"
                        onClick={handleAddService}
                        disabled={servicesLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2 min-w-fit"
                      >
                        <Plus size={18} /> Add
                      </button>
                    </div>

                    {/* Added Services List */}
                    {formData.services.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {formData.services.map((service) => (
                          <div
                            key={service.serviceId}
                            className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {getServiceName(service.serviceId)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Sessions: {service.quantity} | Duration: {getServiceDuration(service.serviceId) * service.quantity} min
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={service.quantity}
                                onChange={(e) => handleUpdateServiceQuantity(service.serviceId, e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveService(service.serviceId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Remove service"
                              >
                                <Minus size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600 text-sm">
                        No services added yet. Click "Add" to add services to this package.
                      </div>
                    )}

                    {formData.services.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Total Services:</span> {formData.services.length} | 
                          <span className="font-medium ml-2">Total Duration:</span> {formData.services.reduce((sum, s) => sum + (getServiceDuration(s.serviceId) * s.quantity), 0)} min
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      placeholder="Package description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                    setServiceInput({ serviceId: '', count: 1 });
                    setFormData({ packageName: '', description: '', packageType: 'bundle', services: [], originalPrice: 0, discountType: 'percentage', discountValue: 0, totalDuration: 0, validFrom: '', validUntil: '' });
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

      {/* Notification */}
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
                <h2 className="text-lg font-semibold text-gray-900">Delete Package</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-700 text-sm sm:text-base">Are you sure you want to delete this package? This action cannot be undone.</p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPackageToDelete(null);
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

export default PackageManagement;
