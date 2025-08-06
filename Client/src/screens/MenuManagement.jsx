import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  DollarSign,
  ImageIcon,
  Tag,
  Utensils,
  ChefHat,
  Globe,
  Smartphone,
  Monitor,
  MoreHorizontal,
  Copy,
  Archive,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Heart,
  ShoppingCart,
  Zap,
  Award,
  Info,
  Menu,
  ChevronDown,
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Grilled Salmon',
      category: 'Main Course',
      description: 'Fresh Atlantic salmon grilled to perfection with herbs and lemon',
      price: 28.99,
      image: '/api/placeholder/300/200',
      available: true,
      preparationTime: 25,
      allergens: ['Fish'],
      tags: ['Healthy', 'Popular', 'Gluten-Free'],
      ingredients: ['Salmon', 'Lemon', 'Herbs', 'Olive Oil'],
      nutritionInfo: { calories: 450, protein: 35, carbs: 5, fat: 30 },
      lastUpdated: '2025-07-13T10:30:00Z',
      popularity: 85,
      orders: 142,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Truffle Pasta',
      category: 'Main Course',
      description: 'Handmade pasta with black truffle, parmesan, and garlic',
      price: 32.99,
      image: '/api/placeholder/300/200',
      available: true,
      preparationTime: 20,
      allergens: ['Gluten', 'Dairy'],
      tags: ['Premium', 'Vegetarian'],
      ingredients: ['Pasta', 'Black Truffle', 'Parmesan', 'Garlic'],
      nutritionInfo: { calories: 520, protein: 18, carbs: 65, fat: 22 },
      lastUpdated: '2025-07-13T09:15:00Z',
      popularity: 92,
      orders: 89,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Caesar Salad',
      category: 'Appetizer',
      description: 'Fresh romaine lettuce, croutons, parmesan, and caesar dressing',
      price: 14.99,
      image: '/api/placeholder/300/200',
      available: false,
      preparationTime: 10,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      tags: ['Classic', 'Vegetarian'],
      ingredients: ['Romaine', 'Croutons', 'Parmesan', 'Caesar Dressing'],
      nutritionInfo: { calories: 320, protein: 12, carbs: 18, fat: 24 },
      lastUpdated: '2025-07-13T08:45:00Z',
      popularity: 78,
      orders: 203,
      rating: 4.6,
    },
    {
      id: 4,
      name: 'Chocolate Lava Cake',
      category: 'Dessert',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      price: 12.99,
      image: '/api/placeholder/300/200',
      available: true,
      preparationTime: 15,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      tags: ['Popular', 'Sweet'],
      ingredients: ['Chocolate', 'Flour', 'Eggs', 'Butter', 'Vanilla Ice Cream'],
      nutritionInfo: { calories: 580, protein: 8, carbs: 65, fat: 32 },
      lastUpdated: '2025-07-13T11:00:00Z',
      popularity: 88,
      orders: 156,
      rating: 4.7,
    },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Appetizer', count: 8, active: true },
    { id: 2, name: 'Main Course', count: 15, active: true },
    { id: 3, name: 'Dessert', count: 6, active: true },
    { id: 4, name: 'Beverages', count: 12, active: true },
    { id: 5, name: 'Salads', count: 5, active: true },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // Changed to table to match TableReservation.jsx
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, unavailable
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [lastSync, setLastSync] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
      // Simulate random availability changes
      if (Math.random() > 0.95) {
        setMenuItems((prev) =>
          prev.map((item) => ({
            ...item,
            available: Math.random() > 0.3,
            lastUpdated: new Date().toISOString(),
          }))
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Main Course',
    description: '',
    price: '',
    image: '',
    available: true,
    preparationTime: '',
    allergens: [],
    tags: [],
    ingredients: [],
    nutritionInfo: { calories: '', protein: '', carbs: '', fat: '' },
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'available' && item.available) ||
      (filterStatus === 'unavailable' && !item.available);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const item = {
        id: Date.now(),
        ...newItem,
        price: parseFloat(newItem.price),
        preparationTime: parseInt(newItem.preparationTime),
        lastUpdated: new Date().toISOString(),
        popularity: 0,
        orders: 0,
        rating: 0,
      };
      setMenuItems([...menuItems, item]);
      setNewItem({
        name: '',
        category: 'Main Course',
        description: '',
        price: '',
        image: '',
        available: true,
        preparationTime: '',
        allergens: [],
        tags: [],
        ingredients: [],
        nutritionInfo: { calories: '', protein: '', carbs: '', fat: '' },
      });
      setShowAddModal(false);
    }
  };

  const handleUpdateItem = (id, updates) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBulkUpdate = (field, value) => {
    selectedItems.forEach((id) => {
      handleUpdateItem(id, { [field]: value });
    });
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('MenuManagement rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50`}>
        {/* Main Content */}
        <div className="px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    console.log('Opening sidebar');
                    setSidebarOpen(true);
                  }}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl">
                  <Utensils className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                  <p className="text-gray-600">Manage your digital menu with real-time updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <RefreshCw size={16} />
                  <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-blue-600" />
                  <Smartphone size={16} className="text-green-600" />
                  <Monitor size={16} className="text-purple-600" />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {menuItems.filter((item) => item.available).length}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unavailable</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {menuItems.filter((item) => !item.available).length}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(menuItems.reduce((sum, item) => sum + item.rating, 0) / menuItems.length).toFixed(1)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm hover:bg-emerald-200"
                    >
                      Bulk Actions
                    </button>
                  </div>
                )}
                <button
                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
            {showBulkActions && selectedItems.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleBulkUpdate('available', true)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                  >
                    Make Available
                  </button>
                  <button
                    onClick={() => handleBulkUpdate('available', false)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                  >
                    Make Unavailable
                  </button>
                  <button
                    onClick={() => {
                      selectedItems.forEach((id) => handleDeleteItem(id));
                      setSelectedItems([]);
                      setShowBulkActions(false);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(filteredItems.map((item) => item.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Item</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Price</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Prep Time</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Tags</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter((id) => id !== item.id));
                              }
                            }}
                            className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-600 truncate max-w-40">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">{item.category}</td>
                        <td className="py-4 px-6 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">{item.preparationTime}m</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              item.available
                            )}`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-40">
                            {item.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateItem(item.id, { available: !item.available })}
                              className={`p-2 ${
                                item.available
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-red-600 hover:bg-red-50'
                              } rounded-lg transition-colors`}
                              title={item.available ? 'Make unavailable' : 'Make available'}
                            >
                              {item.available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
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

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Add Item Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Menu Item</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={newItem.preparationTime}
                      onChange={(e) => setNewItem({ ...newItem, preparationTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe the item..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.available}
                      onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Available for ordering</label>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.name || !newItem.price}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Save className="h-5 w-5 inline-block mr-2" />
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Update Indicator */}
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Updates Active</span>
            </div>
          </div>

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
    </div>
  );
};

export default MenuManagement;