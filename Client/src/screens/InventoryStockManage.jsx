import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  ShoppingCart,
  Truck,
  Calendar,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  RefreshCw,
  FileText,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Zap,
  Archive,
  AlertCircle,
  Info,
  Menu,
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const InventoryStockManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Sample inventory data
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 'INV001',
      name: 'Fresh Salmon',
      category: 'Seafood',
      currentStock: 25,
      minStock: 50,
      maxStock: 200,
      unit: 'lbs',
      unitCost: 18.50,
      totalValue: 462.50,
      supplier: 'Ocean Fresh Co.',
      lastUpdated: '2025-07-13 10:30',
      status: 'low',
      expiryDate: '2025-07-15',
      location: 'Cold Storage A',
      barcode: '123456789012'
    },
    {
      id: 'INV002',
      name: 'Ribeye Steak',
      category: 'Meat',
      currentStock: 80,
      minStock: 30,
      maxStock: 150,
      unit: 'lbs',
      unitCost: 24.99,
      totalValue: 1999.20,
      supplier: 'Prime Cuts Ltd.',
      lastUpdated: '2025-07-13 09:15',
      status: 'adequate',
      expiryDate: '2025-07-16',
      location: 'Cold Storage B',
      barcode: '123456789013'
    },
    {
      id: 'INV003',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      currentStock: 120,
      minStock: 40,
      maxStock: 200,
      unit: 'lbs',
      unitCost: 3.25,
      totalValue: 390.00,
      supplier: 'Farm Fresh Produce',
      lastUpdated: '2025-07-13 11:45',
      status: 'good',
      expiryDate: '2025-07-14',
      location: 'Dry Storage',
      barcode: '123456789014'
    },
    {
      id: 'INV004',
      name: 'Champagne Bottles',
      category: 'Beverages',
      currentStock: 15,
      minStock: 25,
      maxStock: 100,
      unit: 'bottles',
      unitCost: 89.99,
      totalValue: 1349.85,
      supplier: 'Wine & Spirits Co.',
      lastUpdated: '2025-07-13 08:20',
      status: 'low',
      expiryDate: '2027-07-13',
      location: 'Wine Cellar',
      barcode: '123456789015'
    },
    {
      id: 'INV005',
      name: 'Flour (All Purpose)',
      category: 'Pantry',
      currentStock: 200,
      minStock: 50,
      maxStock: 500,
      unit: 'lbs',
      unitCost: 0.75,
      totalValue: 150.00,
      supplier: 'Bakery Supply Co.',
      lastUpdated: '2025-07-13 12:00',
      status: 'good',
      expiryDate: '2025-12-31',
      location: 'Dry Storage',
      barcode: '123456789016'
    },
    {
      id: 'INV006',
      name: 'Olive Oil (Extra Virgin)',
      category: 'Pantry',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unit: 'bottles',
      unitCost: 12.99,
      totalValue: 103.92,
      supplier: 'Mediterranean Imports',
      lastUpdated: '2025-07-13 13:30',
      status: 'critical',
      expiryDate: '2026-01-15',
      location: 'Kitchen Storage',
      barcode: '123456789017'
    }
  ]);

  const [suppliers, setSuppliers] = useState([
    {
      id: 'SUP001',
      name: 'Ocean Fresh Co.',
      contact: 'Mike Johnson',
      phone: '+1-555-0123',
      email: 'mike@oceanfresh.com',
      address: '123 Harbor St, Seafood District',
      category: 'Seafood',
      rating: 4.8,
      deliveryTime: '24 hours',
      paymentTerms: 'Net 30',
      status: 'active'
    },
    {
      id: 'SUP002',
      name: 'Prime Cuts Ltd.',
      contact: 'Sarah Williams',
      phone: '+1-555-0456',
      email: 'sarah@primecuts.com',
      address: '456 Butcher Ave, Meat District',
      category: 'Meat',
      rating: 4.9,
      deliveryTime: '12 hours',
      paymentTerms: 'Net 15',
      status: 'active'
    },
    {
      id: 'SUP003',
      name: 'Farm Fresh Produce',
      contact: 'David Chen',
      phone: '+1-555-0789',
      email: 'david@farmfresh.com',
      address: '789 Garden Rd, Agriculture Zone',
      category: 'Vegetables',
      rating: 4.6,
      deliveryTime: '6 hours',
      paymentTerms: 'Net 7',
      status: 'active'
    }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 'PO001',
      supplier: 'Ocean Fresh Co.',
      orderDate: '2025-07-12',
      expectedDelivery: '2025-07-13',
      status: 'pending',
      totalAmount: 1250.00,
      items: [
        { name: 'Fresh Salmon', quantity: 50, unit: 'lbs', unitCost: 18.50, total: 925.00 },
        { name: 'Tuna Steaks', quantity: 20, unit: 'lbs', unitCost: 16.25, total: 325.00 }
      ]
    },
    {
      id: 'PO002',
      supplier: 'Prime Cuts Ltd.',
      orderDate: '2025-07-11',
      expectedDelivery: '2025-07-12',
      status: 'delivered',
      totalAmount: 2400.00,
      items: [
        { name: 'Ribeye Steak', quantity: 60, unit: 'lbs', unitCost: 24.99, total: 1499.40 },
        { name: 'Chicken Breast', quantity: 40, unit: 'lbs', unitCost: 12.50, total: 500.00 },
        { name: 'Ground Beef', quantity: 30, unit: 'lbs', unitCost: 8.99, total: 269.70 }
      ]
    }
  ]);

  const categories = ['all', 'Seafood', 'Meat', 'Vegetables', 'Beverages', 'Pantry', 'Dairy', 'Spices'];
  const statuses = ['all', 'critical', 'low', 'adequate', 'good', 'overstocked'];

  // Calculate summary statistics
  const totalItems = inventoryItems.length;
  const criticalItems = inventoryItems.filter(item => item.status === 'critical').length;
  const lowStockItems = inventoryItems.filter(item => item.status === 'low').length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'adequate': return 'bg-yellow-100 text-yellow-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <TrendingDown className="h-4 w-4" />;
      case 'adequate': return <Clock className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'overstocked': return <TrendingUp className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const AddItemModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Inventory Item</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="lbs, bottles, pieces" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );

  const PurchaseOrderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Purchase Order</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {inventoryItems.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                  <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" readOnly />
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            onClick={() => setShowPurchaseModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => setShowPurchaseModal(false)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('InventoryStockManagement rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50 p-6`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => {
                console.log('Opening sidebar');
                setSidebarOpen(true);
              }}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory & Stock Management</h1>
              <p className="text-gray-600">Manage your restaurant's inventory, track stock levels, and handle purchase orders</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical Items</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'inventory', label: 'Inventory Items', icon: Package },
                { id: 'purchase', label: 'Purchase Orders', icon: ShoppingCart },
                { id: 'suppliers', label: 'Suppliers', icon: Truck }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-wrap items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('name')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Item</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('currentStock')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Current Stock</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min/Max</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('unitCost')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Unit Cost</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('totalValue')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Total Value</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.currentStock} {item.unit}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                item.currentStock <= item.minStock ? 'bg-red-500' : 
                                item.currentStock <= item.minStock * 1.5 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.minStock} / {item.maxStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.unitCost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.totalValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="space-y-6">
            {/* Purchase Orders Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search purchase orders..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button 
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Purchase Order</span>
                </button>
              </div>
            </div>

            {/* Purchase Orders */}
            <div className="grid grid-cols-1 gap-6">
              {purchaseOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.supplier}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {order.status === 'delivered' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Delivery</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{item.name}</span>
                          <span className="text-gray-600">{item.quantity} {item.unit} × ${item.unitCost} = ${item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            {/* Suppliers Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Categories</option>
                  <option value="seafood">Seafood</option>
                  <option value="meat">Meat</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Supplier</span>
                </button>
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                        <p className="text-sm text-gray-600">{supplier.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{supplier.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{supplier.contact}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Delivery Time</p>
                      <p className="font-medium text-gray-900">{supplier.deliveryTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Terms</p>
                      <p className="font-medium text-gray-900">{supplier.paymentTerms}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddModal && <AddItemModal />}
        {showPurchaseModal && <PurchaseOrderModal />}

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => {
              console.log('Closing sidebar');
              setSidebarOpen(false);
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default InventoryStockManagement;