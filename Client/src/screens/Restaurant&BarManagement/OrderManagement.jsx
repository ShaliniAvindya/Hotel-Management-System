import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  MapPin,
  Utensils,
  Coffee,
  Car,
  Waves,
  Home,
  Phone,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  ChefHat,
  Truck,
  Bed,
  Grid,
  List,
  RefreshCw,
  FileText,
  DollarSign,
  Timer,
  User,
  Calendar,
  MessageCircle,
  Bell,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Star,
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userRole, setUserRole] = useState('front_office'); // front_office, kitchen, waiter
  const [showConfirmation, setShowConfirmation] = useState(null);

  // Order types
  const orderTypes = [
    { id: 'dine_in', name: 'Dine-in', icon: Utensils, color: 'blue', requiresTable: true },
    { id: 'room_service', name: 'Room Service', icon: Bed, color: 'purple', requiresRoom: true },
    { id: 'takeaway', name: 'Takeaway', icon: Truck, color: 'green', requiresPickup: true },
    { id: 'poolside', name: 'Poolside', icon: Waves, color: 'cyan', requiresLocation: true },
  ];

  // Order statuses with colors
  const orderStatuses = [
    { id: 'new', name: 'New', color: 'yellow', icon: Bell },
    { id: 'confirmed', name: 'Confirmed', color: 'blue', icon: CheckCircle },
    { id: 'preparing', name: 'Preparing', color: 'orange', icon: ChefHat },
    { id: 'ready', name: 'Ready', color: 'green', icon: Check },
    { id: 'served', name: 'Served', color: 'indigo', icon: Utensils },
    { id: 'billed', name: 'Billed', color: 'gray', icon: FileText },
    { id: 'cancelled', name: 'Cancelled', color: 'red', icon: XCircle },
  ];

  // Sample menu items for order creation
  const menuItems = [
    {
      id: 'MI001',
      name: 'Grilled Chicken Caesar Salad',
      price: 14.99,
      category: 'salads',
      prepTime: 15,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=100&h=100&fit=crop',
    },
    {
      id: 'MI002',
      name: 'Margherita Pizza',
      price: 16.99,
      category: 'mains',
      prepTime: 25,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
    },
    {
      id: 'MI003',
      name: 'Chocolate Lava Cake',
      price: 8.99,
      category: 'desserts',
      prepTime: 20,
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=100&h=100&fit=crop',
    },
    {
      id: 'MI004',
      name: 'Fresh Orange Juice',
      price: 4.99,
      category: 'beverages',
      prepTime: 5,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=100&h=100&fit=crop',
    },
  ];

  // Sample tables for dine-in
  const tables = [
    { id: 'T001', number: '1', capacity: 2, location: 'Main Dining' },
    { id: 'T002', number: '2', capacity: 4, location: 'Main Dining' },
    { id: 'T003', number: '3', capacity: 6, location: 'Patio' },
    { id: 'T004', number: '4', capacity: 4, location: 'VIP Section' },
    { id: 'T005', number: '5', capacity: 8, location: 'Private Room' },
  ];

  // Sample rooms for room service
  const rooms = [
    { id: 'R101', number: '101', floor: 1, type: 'Single' },
    { id: 'R102', number: '102', floor: 1, type: 'Double' },
    { id: 'R201', number: '201', floor: 2, type: 'Suite' },
    { id: 'R202', number: '202', floor: 2, type: 'Double' },
    { id: 'R301', number: '301', floor: 3, type: 'Presidential' },
  ];

  // Sample orders data
  useEffect(() => {
    const sampleOrders = [
      {
        id: 'ORD001',
        type: 'dine_in',
        status: 'preparing',
        customerName: 'John Doe',
        customerPhone: '+1 234 567 8900',
        tableId: 'T002',
        items: [
          { id: 'MI002', name: 'Margherita Pizza', price: 16.99, quantity: 1, specialInstructions: 'Extra cheese' },
          { id: 'MI004', name: 'Fresh Orange Juice', price: 4.99, quantity: 2, specialInstructions: 'No ice' },
        ],
        subtotal: 26.97,
        tax: 2.70,
        total: 29.67,
        specialInstructions: 'Customer has nut allergy',
        waiterName: 'Sarah Johnson',
        createdAt: '2024-02-06T18:30:00Z',
        updatedAt: '2024-02-06T19:00:00Z',
        estimatedTime: 25,
        priority: 'normal',
      },
      {
        id: 'ORD002',
        type: 'room_service',
        status: 'new',
        customerName: 'Alice Smith',
        customerPhone: '+1 234 567 8901',
        roomId: 'R201',
        items: [
          { id: 'MI001', name: 'Grilled Chicken Caesar Salad', price: 14.99, quantity: 1, specialInstructions: 'Dressing on the side' },
          { id: 'MI003', name: 'Chocolate Lava Cake', price: 8.99, quantity: 1, specialInstructions: '' },
        ],
        subtotal: 23.98,
        tax: 2.40,
        total: 26.38,
        specialInstructions: 'Room 201 - Please knock softly',
        deliveryTime: '2024-02-06T20:00:00Z',
        createdAt: '2024-02-06T19:15:00Z',
        updatedAt: '2024-02-06T19:15:00Z',
        estimatedTime: 20,
        priority: 'normal',
      },
      {
        id: 'ORD003',
        type: 'takeaway',
        status: 'ready',
        customerName: 'Mike Brown',
        customerPhone: '+1 234 567 8902',
        items: [
          { id: 'MI002', name: 'Margherita Pizza', price: 16.99, quantity: 2, specialInstructions: 'Well done' },
        ],
        subtotal: 33.98,
        tax: 3.40,
        total: 37.38,
        specialInstructions: 'Customer will pick up at 7:30 PM',
        pickupTime: '2024-02-06T19:30:00Z',
        createdAt: '2024-02-06T18:45:00Z',
        updatedAt: '2024-02-06T19:25:00Z',
        estimatedTime: 25,
        priority: 'high',
      },
      {
        id: 'ORD004',
        type: 'poolside',
        status: 'served',
        customerName: 'Emma Wilson',
        customerPhone: '+1 234 567 8903',
        locationDetails: 'Pool Area - Cabana 3',
        items: [
          { id: 'MI004', name: 'Fresh Orange Juice', price: 4.99, quantity: 3, specialInstructions: 'Extra ice' },
          { id: 'MI001', name: 'Grilled Chicken Caesar Salad', price: 14.99, quantity: 1, specialInstructions: '' },
        ],
        subtotal: 29.96,
        tax: 3.00,
        total: 32.96,
        specialInstructions: 'Poolside service - Cabana 3',
        waiterName: 'David Martinez',
        createdAt: '2024-02-06T17:00:00Z',
        updatedAt: '2024-02-06T17:45:00Z',
        estimatedTime: 20,
        priority: 'normal',
      },
    ];
    setOrders(sampleOrders);
    setFilteredOrders(sampleOrders);
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerPhone.includes(searchQuery)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((order) => order.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, filterType, filterStatus]);

  const getOrderTypeName = (type) => {
    const orderType = orderTypes.find((ot) => ot.id === type);
    return orderType ? orderType.name : 'Unknown';
  };

  const getOrderTypeIcon = (type) => {
    const orderType = orderTypes.find((ot) => ot.id === type);
    return orderType ? orderType.icon : ShoppingCart;
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find((s) => s.id === status);
    switch (statusObj?.color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'gray': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleAddOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedTime: orderData.items.reduce((max, item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.id);
        return Math.max(max, menuItem?.prepTime || 0);
      }, 0),
    };
    setOrders([...orders, newOrder]);
    setShowOrderForm(false);
  };

  const handleEditOrder = (orderData) => {
    setOrders(
      orders.map((order) =>
        order.id === orderData.id
          ? {
              ...orderData,
              updatedAt: new Date().toISOString(),
              estimatedTime: orderData.items.reduce((max, item) => {
                const menuItem = menuItems.find((mi) => mi.id === item.id);
                return Math.max(max, menuItem?.prepTime || 0);
              }, 0),
            }
          : order
      )
    );
    setEditingOrder(null);
    setShowOrderForm(false);
  };

  const handleDeleteOrder = (orderId) => {
    setShowConfirmation({
      title: 'Delete Order',
      message: `Are you sure you want to delete order ${orderId}? This action cannot be undone.`,
      onConfirm: () => {
        setOrders(orders.filter((order) => order.id !== orderId));
        setShowConfirmation(null);
      },
      onCancel: () => setShowConfirmation(null),
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (newStatus === 'cancelled') {
      setShowConfirmation({
        title: 'Cancel Order',
        message: `Are you sure you want to cancel order ${orderId}? This action cannot be undone.`,
        onConfirm: () => {
          setOrders(
            orders.map((order) =>
              order.id === orderId
                ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                : order
            )
          );
          setShowConfirmation(null);
        },
        onCancel: () => setShowConfirmation(null),
      });
    } else {
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );
    }
  };

  const getLocationInfo = (order) => {
    if (order.type === 'dine_in' && order.tableId) {
      const table = tables.find((t) => t.id === order.tableId);
      return table ? `Table ${table.number} (${table.location})` : 'Table not found';
    }
    if (order.type === 'room_service' && order.roomId) {
      const room = rooms.find((r) => r.id === order.roomId);
      return room ? `Room ${room.number} (Floor ${room.floor})` : 'Room not found';
    }
    if (order.type === 'poolside' && order.locationDetails) {
      return order.locationDetails;
    }
    if (order.type === 'takeaway') {
      return order.pickupTime
        ? `Pickup at ${new Date(order.pickupTime).toLocaleTimeString()}`
        : 'Pickup Counter';
    }
    return 'Location not specified';
  };

  const getAllowedStatuses = (currentStatus, role) => {
    if (role === 'kitchen') {
      return orderStatuses.filter((s) => ['confirmed', 'preparing', 'ready'].includes(s.id));
    } else if (role === 'waiter') {
      return orderStatuses.filter((s) => ['served', 'billed'].includes(s.id));
    } else if (role === 'front_office') {
      return orderStatuses.filter((s) =>
        ['new', 'confirmed', 'billed', 'cancelled'].includes(s.id)
      );
    }
    return [];
  };

  const ConfirmationPopup = ({ title, message, onConfirm, onCancel }) => {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const OrderForm = ({ order, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      order || {
        type: 'dine_in',
        customerName: '',
        customerPhone: '',
        tableId: '',
        roomId: '',
        locationDetails: '',
        items: [],
        specialInstructions: '',
        priority: 'normal',
      }
    );
    const [selectedItems, setSelectedItems] = useState(formData.items || []);

    const addMenuItem = (menuItem) => {
      const existingItem = selectedItems.find((item) => item.id === menuItem.id);
      if (existingItem) {
        setSelectedItems(
          selectedItems.map((item) =>
            item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        setSelectedItems([
          ...selectedItems,
          {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            specialInstructions: '',
          },
        ]);
      }
    };

    const removeMenuItem = (itemId) => {
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    };

    const updateItemQuantity = (itemId, quantity) => {
      if (quantity <= 0) {
        removeMenuItem(itemId);
      } else {
        setSelectedItems(
          selectedItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
      }
    };

    const updateItemInstructions = (itemId, instructions) => {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === itemId ? { ...item, specialInstructions: instructions } : item
        )
      );
    };

    const calculateTotals = () => {
      const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      return { subtotal, tax, total };
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const { subtotal, tax, total } = calculateTotals();
      const orderData = {
        ...formData,
        items: selectedItems,
        subtotal,
        tax,
        total,
      };
      onSave(orderData);
    };

    const orderType = orderTypes.find((ot) => ot.id === formData.type);

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900">
              {order ? 'Edit Order' : 'Create New Order'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Order Type & Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    {orderTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Selection */}
            {orderType?.requiresTable && (
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">Table *</label>
                <select
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Table</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Table {table.number} - {table.location} (Capacity: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {orderType?.requiresRoom && (
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} - Floor {room.floor} ({room.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {orderType?.requiresLocation && (
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Details *</label>
                <input
                  type="text"
                  value={formData.locationDetails}
                  onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Pool Area - Cabana 3"
                  required
                />
              </div>
            )}

            {/* Menu Items */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMenuItem(item)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Selected Items */}
              {selectedItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                          >
                            +
                          </button>
                          <span className="ml-2 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeMenuItem(item.id)}
                            className="ml-2 text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Special instructions for this item..."
                        value={item.specialInstructions}
                        onChange={(e) => updateItemInstructions(item.id, e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  ))}

                  {/* Order Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${calculateTotals().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (10%):</span>
                        <span className="font-medium">${calculateTotals().tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>${calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Any special instructions for this order..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                disabled={selectedItems.length === 0}
              >
                <Check className="h-4 w-4" />
                <span>{order ? 'Update Order' : 'Create Order'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const OrderDetails = ({ order, onClose, onEdit, onDelete }) => {
    const OrderTypeIcon = getOrderTypeIcon(order.type);

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <OrderTypeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order {order.id}</h2>
                <p className="text-sm text-gray-600">
                  {getOrderTypeName(order.type)} • {order.customerName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status & Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {orderStatuses.find((s) => s.id === order.status)?.name}
                </span>
                <span className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                  {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {userRole !== 'kitchen' && (
                  <button
                    onClick={() => onEdit(order)}
                    className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-1 text-sm transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                {userRole === 'front_office' && (
                  <button
                    onClick={() => onDelete(order.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1 text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Update Dropdown */}
            {(userRole === 'kitchen' || userRole === 'waiter' || userRole === 'front_office') &&
              order.status !== 'billed' &&
              order.status !== 'cancelled' && (
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {getAllowedStatuses(order.status, userRole).map((status) => {
                        const StatusIcon = status.icon;
                        return (
                          <option
                            key={status.id}
                            value={status.id}
                            disabled={order.status === status.id}
                          >
                            {status.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

            {/* Customer & Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{getLocationInfo(order)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Est. Time: {order.estimatedTime} minutes</span>
                  </div>
                  {order.waiterName && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Waiter: {order.waiterName}</span>
                    </div>
                  )}
                  {order.pickupTime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Pickup: {new Date(order.pickupTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {order.deliveryTime && (
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Delivery: {new Date(order.deliveryTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm text-gray-600">${item.price.toFixed(2)} each</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <div className="mt-2 flex items-start space-x-2">
                            <MessageCircle
                              className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0"
                            />
                            <span className="text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded">
                              {item.specialInstructions}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Instructions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800">{order.specialInstructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Total */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const OrderCard = ({ order, onView, onEdit, onDelete }) => {
    const OrderTypeIcon = getOrderTypeIcon(order.type);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    return (
      <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white hover:scale-105 transform transition-transform duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <OrderTypeIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{order.id}</h3>
              <p className="text-sm text-gray-600">{order.customerName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}
            >
              {order.priority === 'high' && (
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              )}
              {order.priority.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="relative">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border cursor-pointer ${getStatusColor(
                  order.status
                )}`}
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                {orderStatuses.find((s) => s.id === order.status)?.name}
              </span>
              {showStatusDropdown &&
                (userRole === 'kitchen' || userRole === 'waiter' || userRole === 'front_office') &&
                order.status !== 'billed' &&
                order.status !== 'cancelled' && (
                  <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-up">
                    {getAllowedStatuses(order.status, userRole).map((status) => {
                      const StatusIcon = status.icon;
                      return (
                        <button
                          key={status.id}
                          onClick={() => {
                            handleStatusChange(order.id, status.id);
                            setShowStatusDropdown(false);
                          }}
                          disabled={order.status === status.id}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${
                            order.status === status.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-blue-50 text-gray-900'
                          }`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span>{status.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
            <span className="text-sm text-gray-600">{getOrderTypeName(order.type)}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{getLocationInfo(order)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <ShoppingCart className="h-4 w-4" />
              <span>{totalItems} items</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Timer className="h-4 w-4" />
              <span>{order.estimatedTime}min</span>
            </div>
            <div className="font-semibold text-gray-900">${order.total.toFixed(2)}</div>
          </div>

          <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
        </div>

        {/* Special Instructions Indicator */}
        {order.specialInstructions && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-800 truncate">{order.specialInstructions}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {userRole === 'kitchen' && order.status === 'new' && (
              <button
                onClick={() => handleStatusChange(order.id, 'preparing')}
                className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                title="Start Preparing"
              >
                <ChefHat className="h-4 w-4" />
              </button>
            )}
            {userRole === 'kitchen' && order.status === 'preparing' && (
              <button
                onClick={() => handleStatusChange(order.id, 'ready')}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Mark Ready"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            {userRole === 'waiter' && order.status === 'ready' && (
              <button
                onClick={() => handleStatusChange(order.id, 'served')}
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Mark Served"
              >
                <Utensils className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onView(order)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {userRole !== 'kitchen' && (
              <button
                onClick={() => onEdit(order)}
                className="p-1 text-gray-400 hover:text-orange-600 rounded transition-colors"
                title="Edit Order"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {userRole === 'front_office' && (
              <button
                onClick={() => onDelete(order.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Delete Order"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const OrderListItem = ({ order, onView, onEdit, onDelete }) => {
    const OrderTypeIcon = getOrderTypeIcon(order.type);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-4 px-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <OrderTypeIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{order.id}</p>
              <p className="text-sm text-gray-600">{order.customerName}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{getOrderTypeName(order.type)}</span>
        </td>
        <td className="py-4 px-4 relative">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(
              order.status
            )}`}
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            {orderStatuses.find((s) => s.id === order.status)?.name}
          </span>
          {showStatusDropdown &&
            (userRole === 'kitchen' || userRole === 'waiter' || userRole === 'front_office') &&
            order.status !== 'billed' &&
            order.status !== 'cancelled' && (
              <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-up">
                {getAllowedStatuses(order.status, userRole).map((status) => {
                  const StatusIcon = status.icon;
                  return (
                    <button
                      key={status.id}
                      onClick={() => {
                        handleStatusChange(order.id, status.id);
                        setShowStatusDropdown(false);
                      }}
                      disabled={order.status === status.id}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${
                        order.status === status.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-blue-50 text-gray-900'
                      }`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span>{status.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{getLocationInfo(order)}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{totalItems}</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">${order.total.toFixed(2)}</span>
        </td>
        <td className="py-4 px-4">
          <span className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{order.estimatedTime}min</span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(order)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {userRole !== 'kitchen' && (
              <button
                onClick={() => onEdit(order)}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {userRole === 'front_office' && (
              <button
                onClick={() => onDelete(order.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View as:</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              >
                <option value="front_office">Front Office</option>
                <option value="kitchen">Kitchen</option>
                <option value="waiter">Waiter</option>
              </select>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Types</option>
                {orderTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                {orderStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {userRole === 'front_office' && (
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setShowOrderForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Order</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
              } transition-colors`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
              } transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterStatus('all');
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Orders Display */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No orders match your current filters.'
                  : 'No orders have been created yet.'}
              </p>
              {userRole === 'front_office' && (
                <button
                  onClick={() => {
                    setEditingOrder(null);
                    setShowOrderForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Order</span>
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onView={(order) => {
                    setSelectedOrder(order);
                    setShowOrderDetails(true);
                  }}
                  onEdit={(order) => {
                    setEditingOrder(order);
                    setShowOrderForm(true);
                  }}
                  onDelete={handleDeleteOrder}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Order</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Est. Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <OrderListItem
                      key={order.id}
                      order={order}
                      onView={(order) => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                      onEdit={(order) => {
                        setEditingOrder(order);
                        setShowOrderForm(true);
                      }}
                      onDelete={handleDeleteOrder}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showOrderForm && (
        <OrderForm
          order={editingOrder}
          onSave={editingOrder ? handleEditOrder : handleAddOrder}
          onCancel={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
        />
      )}

      {showOrderDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onEdit={(order) => {
            setEditingOrder(order);
            setShowOrderForm(true);
            setShowOrderDetails(false);
          }}
          onDelete={handleDeleteOrder}
        />
      )}

      {showConfirmation && (
        <ConfirmationPopup
          title={showConfirmation.title}
          message={showConfirmation.message}
          onConfirm={showConfirmation.onConfirm}
          onCancel={showConfirmation.onCancel}
        />
      )}
    </div>
  );
};

export default OrderManagement;