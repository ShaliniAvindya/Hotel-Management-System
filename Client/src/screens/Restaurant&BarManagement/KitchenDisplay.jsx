import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChefHat,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  MapPin,
  MessageCircle,
  Timer,
  Play,
  Check,
  Pause,
  RefreshCw,
  Bell,
  Utensils,
  Coffee,
  Wine,
  Cookie,
  Soup,
  Pizza,
  Eye,
  X,
  User,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  Bed,
  Waves,
} from 'lucide-react';

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const stations = [
    { id: 'all', name: 'All Orders', color: 'gray' },
    { id: 'hot', name: 'Hot Kitchen', color: 'red', categories: ['mains', 'soups'] },
    { id: 'cold', name: 'Cold Kitchen', color: 'blue', categories: ['salads', 'appetizers'] },
    { id: 'bar', name: 'Bar', color: 'purple', categories: ['beverages', 'alcoholic'] },
    { id: 'desserts', name: 'Desserts', color: 'pink', categories: ['desserts'] },
  ];

  // Order statuses 
  const orderStatuses = [
    { id: 'new', name: 'NEW', color: 'bg-yellow-500 text-white', priority: 1 },
    { id: 'confirmed', name: 'CONFIRMED', color: 'bg-blue-500 text-white', priority: 2 },
    { id: 'acknowledged', name: 'PREPARING', color: 'bg-orange-500 text-white', priority: 2 },
    { id: 'preparing', name: 'PREPARING', color: 'bg-orange-500 text-white', priority: 2 },
    { id: 'ready', name: 'READY', color: 'bg-green-500 text-white', priority: 3 },
    { id: 'served', name: 'SERVED', color: 'bg-indigo-500 text-white', priority: 4 },
    { id: 'delayed', name: 'DELAYED', color: 'bg-red-500 text-white animate-pulse', priority: 5 },
    { id: 'cancelled', name: 'CANCELLED', color: 'bg-gray-500 text-white', priority: 6 },
  ];

  // Order types 
  const orderTypes = [
    { id: 'dine_in', name: 'Dine-in', icon: Utensils, color: 'blue' },
    { id: 'room_service', name: 'Room Service', icon: Bed, color: 'purple' },
    { id: 'takeaway', name: 'Takeaway', icon: Truck, color: 'green' },
    { id: 'poolside', name: 'Poolside', icon: Waves, color: 'cyan' },
  ];

  // Sample tables and rooms data
  const tables = [
    { id: 'T001', number: '1', capacity: 2, location: 'Main Dining' },
    { id: 'T002', number: '2', capacity: 4, location: 'Main Dining' },
    { id: 'T003', number: '3', capacity: 6, location: 'Patio' },
    { id: 'T004', number: '4', capacity: 4, location: 'VIP Section' },
    { id: 'T005', number: '5', capacity: 8, location: 'Private Room' },
  ];

  const rooms = [
    { id: 'R101', number: '101', floor: 1, type: 'Single' },
    { id: 'R102', number: '102', floor: 1, type: 'Double' },
    { id: 'R201', number: '201', floor: 2, type: 'Suite' },
    { id: 'R202', number: '202', floor: 2, type: 'Double' },
    { id: 'R301', number: '301', floor: 3, type: 'Presidential' },
  ];

  // Enhanced sample orders
  useEffect(() => {
    const sampleOrders = [
      {
        id: 'ORD001',
        type: 'dine_in',
        status: 'preparing',
        priority: 'normal',
        customerName: 'John Doe',
        customerPhone: '+1 234 567 8900',
        customerCount: 4,
        tableId: 'T002',
        orderTime: new Date(Date.now() - 12 * 60000).toISOString(),
        estimatedTime: 25,
        waiterName: 'Sarah Johnson',
        items: [
          {
            id: 'MI002',
            name: 'Margherita Pizza',
            category: 'mains',
            quantity: 2,
            station: 'hot',
            cookTime: 25,
            price: 16.99,
            notes: 'Extra cheese, thin crust',
            allergens: ['Dairy', 'Gluten'],
            specialInstructions: 'Extra cheese'
          },
          {
            id: 'MI004',
            name: 'Fresh Orange Juice',
            category: 'beverages',
            quantity: 2,
            station: 'bar',
            cookTime: 5,
            price: 4.99,
            notes: 'No ice',
            allergens: [],
            specialInstructions: 'No ice'
          }
        ],
        subtotal: 26.97,
        tax: 2.70,
        total: 29.67,
        specialInstructions: 'Customer has nut allergy - please ensure no cross contamination',
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: 'ORD002',
        type: 'room_service',
        status: 'new',
        priority: 'high',
        customerName: 'Alice Smith',
        customerPhone: '+1 234 567 8901',
        customerCount: 1,
        roomId: 'R201',
        orderTime: new Date(Date.now() - 8 * 60000).toISOString(),
        estimatedTime: 20,
        deliveryTime: new Date(Date.now() + 12 * 60000).toISOString(),
        items: [
          {
            id: 'MI001',
            name: 'Grilled Chicken Caesar Salad',
            category: 'salads',
            quantity: 1,
            station: 'cold',
            cookTime: 15,
            price: 14.99,
            notes: 'Dressing on the side',
            allergens: ['Dairy'],
            specialInstructions: 'Dressing on the side'
          },
          {
            id: 'MI003',
            name: 'Chocolate Lava Cake',
            category: 'desserts',
            quantity: 1,
            station: 'desserts',
            cookTime: 20,
            price: 8.99,
            notes: 'Extra vanilla ice cream',
            allergens: ['Dairy', 'Eggs'],
            specialInstructions: ''
          }
        ],
        subtotal: 23.98,
        tax: 2.40,
        total: 26.38,
        specialInstructions: 'Room 201 - Please knock softly, guest is sleeping',
        createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
      {
        id: 'ORD003',
        type: 'takeaway',
        status: 'ready',
        priority: 'high',
        customerName: 'Mike Brown',
        customerPhone: '+1 234 567 8902',
        customerCount: 1,
        orderTime: new Date(Date.now() - 30 * 60000).toISOString(),
        estimatedTime: 25,
        pickupTime: new Date(Date.now() + 5 * 60000).toISOString(),
        items: [
          {
            id: 'MI002',
            name: 'Margherita Pizza',
            category: 'mains',
            quantity: 2,
            station: 'hot',
            cookTime: 25,
            price: 16.99,
            notes: 'Well done',
            allergens: ['Dairy', 'Gluten'],
            specialInstructions: 'Well done'
          }
        ],
        subtotal: 33.98,
        tax: 3.40,
        total: 37.38,
        specialInstructions: 'Customer will pick up at 7:30 PM - call when ready',
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        id: 'ORD004',
        type: 'poolside',
        status: 'confirmed',
        priority: 'normal',
        customerName: 'Emma Wilson',
        customerPhone: '+1 234 567 8903',
        customerCount: 3,
        locationDetails: 'Pool Area - Cabana 3',
        orderTime: new Date(Date.now() - 15 * 60000).toISOString(),
        estimatedTime: 20,
        waiterName: 'David Martinez',
        items: [
          {
            id: 'MI004',
            name: 'Fresh Orange Juice',
            category: 'beverages',
            quantity: 3,
            station: 'bar',
            cookTime: 5,
            price: 4.99,
            notes: 'Extra ice',
            allergens: [],
            specialInstructions: 'Extra ice'
          },
          {
            id: 'MI001',
            name: 'Grilled Chicken Caesar Salad',
            category: 'salads',
            quantity: 1,
            station: 'cold',
            cookTime: 15,
            price: 14.99,
            notes: '',
            allergens: ['Dairy'],
            specialInstructions: ''
          }
        ],
        subtotal: 29.96,
        tax: 3.00,
        total: 32.96,
        specialInstructions: 'Poolside service - Cabana 3, sunny day so provide extra napkins',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: 'ORD005',
        type: 'dine_in',
        status: 'delayed',
        priority: 'high',
        customerName: 'Robert Johnson',
        customerPhone: '+1 234 567 8904',
        customerCount: 6,
        tableId: 'T005',
        orderTime: new Date(Date.now() - 40 * 60000).toISOString(),
        estimatedTime: 30,
        waiterName: 'Maria Garcia',
        items: [
          {
            id: 'MI002',
            name: 'Margherita Pizza',
            category: 'mains',
            quantity: 3,
            station: 'hot',
            cookTime: 25,
            price: 16.99,
            notes: 'One with extra cheese, two regular',
            allergens: ['Dairy', 'Gluten'],
            specialInstructions: 'One with extra cheese, two regular'
          },
          {
            id: 'MI001',
            name: 'Grilled Chicken Caesar Salad',
            category: 'salads',
            quantity: 2,
            station: 'cold',
            cookTime: 15,
            price: 14.99,
            notes: 'No croutons on one',
            allergens: ['Dairy'],
            specialInstructions: 'No croutons on one'
          },
          {
            id: 'MI003',
            name: 'Chocolate Lava Cake',
            category: 'desserts',
            quantity: 2,
            station: 'desserts',
            cookTime: 20,
            price: 8.99,
            notes: '',
            allergens: ['Dairy', 'Eggs'],
            specialInstructions: ''
          }
        ],
        subtotal: 98.94,
        tax: 9.89,
        total: 108.83,
        specialInstructions: 'VIP table - anniversary celebration, please prioritize',
        createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 35 * 60000).toISOString(),
      }
    ];
    setOrders(sampleOrders);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = selectedStation === 'all' 
    ? orders 
    : orders.filter(order => 
        order.items.some(item => {
          const station = stations.find(s => s.id === selectedStation);
          return station?.categories?.includes(item.category);
        })
      );

  // Calculate elapsed time
  const getElapsedTime = (orderTime) => {
    const elapsed = Math.floor((currentTime - new Date(orderTime)) / 60000);
    return elapsed;
  };

  const getTimeColor = (order) => {
    const elapsed = getElapsedTime(order.orderTime);
    const estimated = order.estimatedTime;
    
    if (elapsed > estimated + 10) return 'text-red-600 font-bold';
    if (elapsed > estimated) return 'text-orange-600 font-semibold';
    if (elapsed > estimated * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      mains: Pizza,
      salads: Utensils,
      appetizers: Soup,
      desserts: Cookie,
      beverages: Coffee,
      alcoholic: Wine,
      soups: Soup,
    };
    return icons[category] || Utensils;
  };

  const getOrderTypeInfo = (type) => {
    return orderTypes.find(ot => ot.id === type) || { name: 'Unknown', icon: Utensils, color: 'gray' };
  };

  const getLocationInfo = (order) => {
    if (order.type === 'dine_in' && order.tableId) {
      const table = tables.find(t => t.id === order.tableId);
      return table ? `Table ${table.number} (${table.location})` : 'Table not found';
    }
    if (order.type === 'room_service' && order.roomId) {
      const room = rooms.find(r => r.id === order.roomId);
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

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const orderTypeInfo = getOrderTypeInfo(order.type);
    const OrderTypeIcon = orderTypeInfo.icon;
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <OrderTypeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order {order.id}</h2>
                <p className="text-sm text-gray-600">
                  {orderTypeInfo.name} • {order.customerName}
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  orderStatuses.find(s => s.id === order.status)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {orderStatuses.find(s => s.id === order.status)?.name || order.status.toUpperCase()}
                </span>
                <span className={`text-sm font-medium ${
                  order.priority === 'high' ? 'text-red-600' : 
                  order.priority === 'normal' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
                </span>
              </div>
              <div className={`text-sm font-medium ${getTimeColor(order)}`}>
                {getElapsedTime(order.orderTime)}min / {order.estimatedTime}min
              </div>
            </div>

            {/* Customer & Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
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
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.customerCount} guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{getLocationInfo(order)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Created: {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
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
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{totalItems} items total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {order.items.map((item, index) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  return (
                    <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <CategoryIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">{item.quantity}x {item.name}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">${item.price.toFixed(2)} each</span>
                              <span className="text-sm text-gray-600">Cook time: {item.cookTime}min</span>
                              <span className="text-sm font-medium text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          stations.find(s => s.categories?.includes(item.category))?.color === 'red' ? 'bg-red-100 text-red-800' :
                          stations.find(s => s.categories?.includes(item.category))?.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          stations.find(s => s.categories?.includes(item.category))?.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                          stations.find(s => s.categories?.includes(item.category))?.color === 'pink' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stations.find(s => s.categories?.includes(item.category))?.name || 'General'}
                        </span>
                      </div>
                      
                      {item.notes && (
                        <div className="flex items-start space-x-2 mt-2">
                          <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            {item.notes}
                          </span>
                        </div>
                      )}

                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex items-start space-x-2 mt-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map((allergen, idx) => (
                              <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Instructions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Bell className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800 font-medium">{order.specialInstructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Total */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
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

            {/* Action Buttons*/}
            <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
              {order.status === 'new' || order.status === 'confirmed' ? (
                <button
                  onClick={() => {
                    handleStatusChange(order.id, 'preparing');
                    onClose();
                  }}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-2 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Preparing</span>
                </button>
              ) : order.status === 'preparing' ? (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(order.id, 'ready');
                      onClose();
                    }}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark Ready</span>
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(order.id, 'delayed');
                      onClose();
                    }}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2 transition-colors"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Mark Delayed</span>
                  </button>
                </>
              ) : order.status === 'delayed' ? (
                <button
                  onClick={() => {
                    handleStatusChange(order.id, 'preparing');
                    onClose();
                  }}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-2 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Resume Preparing</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Order ticket component
  const OrderTicket = ({ order }) => {
    const elapsed = getElapsedTime(order.orderTime);
    const status = orderStatuses.find(s => s.id === order.status);
    const orderTypeInfo = getOrderTypeInfo(order.type);
    
    const relevantItems = selectedStation === 'all' 
      ? order.items 
      : order.items.filter(item => {
          const station = stations.find(s => s.id === selectedStation);
          return station?.categories?.includes(item.category);
        });

    if (relevantItems.length === 0) return null;

    return (
      <div className={`bg-white rounded-lg border-2 shadow-lg transition-all duration-300 ${
        order.status === 'delayed' ? 'border-red-500 animate-pulse' : 
        order.status === 'ready' ? 'border-green-500' :
        order.status === 'preparing' ? 'border-orange-500' :
        order.status === 'confirmed' ? 'border-blue-500' :
        'border-yellow-500'
      }`}>
        {/* Ticket Header */}
        <div className={`px-4 py-3 rounded-t-lg ${status?.color || 'bg-gray-100 text-gray-800'} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="font-bold text-lg">
              {order.type === 'dine_in' && order.tableId ? 
                tables.find(t => t.id === order.tableId)?.number || 'N/A' :
                order.type === 'room_service' && order.roomId ?
                rooms.find(r => r.id === order.roomId)?.number || 'N/A' :
                order.id
              }
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">{order.customerCount}</span>
            </div>
            {order.priority === 'high' && (
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                HIGH
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold">{status?.name || order.status.toUpperCase()}</div>
            <div className="text-xs opacity-90">
              {order.waiterName || orderTypeInfo.name}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              Order: {order.id}
            </div>
            <div className={`text-sm font-medium ${getTimeColor(order)}`}>
              {elapsed}min / {order.estimatedTime}min
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(order.orderTime).toLocaleTimeString()}</span>
            <span>{order.customerName}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-4 space-y-3">
          {relevantItems.map((item, index) => {
            const CategoryIcon = getCategoryIcon(item.category);
            return (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.cookTime}min</span>
                  </div>
                </div>
                
                {item.notes && (
                  <div className="flex items-start space-x-2 mt-2">
                    <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      {item.notes}
                    </span>
                  </div>
                )}

                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex items-start space-x-2 mt-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen, idx) => (
                        <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
            <div className="flex items-start space-x-2">
              <Bell className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800 font-medium">
                {order.specialInstructions}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {order.type === 'room_service' ? (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Room Service</span>
              </div>
            ) : order.type === 'takeaway' ? (
              <div className="flex items-center space-x-1">
                <Truck className="h-3 w-3" />
                <span>Takeaway</span>
              </div>
            ) : order.type === 'poolside' ? (
              <div className="flex items-center space-x-1">
                <Waves className="h-3 w-3" />
                <span>Poolside</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Utensils className="h-3 w-3" />
                <span>Dine-in</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {/* View Details Button */}
            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowOrderDetails(true);
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1 transition-colors"
              title="View Order Details"
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </button>

            {(order.status === 'new' || order.status === 'confirmed') && (
              <button
                onClick={() => handleStatusChange(order.id, 'preparing')}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center space-x-1 transition-colors"
              >
                <Play className="h-3 w-3" />
                <span>Start</span>
              </button>
            )}
            
            {order.status === 'preparing' && (
              <>
                <button
                  onClick={() => handleStatusChange(order.id, 'ready')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center space-x-1 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  <span>Ready</span>
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, 'delayed')}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center space-x-1 transition-colors"
                >
                  <Pause className="h-3 w-3" />
                  <span>Delay</span>
                </button>
              </>
            )}

            {order.status === 'delayed' && (
              <button
                onClick={() => handleStatusChange(order.id, 'preparing')}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resume</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Sort orders by priority and time
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusA = orderStatuses.find(s => s.id === a.status);
    const statusB = orderStatuses.find(s => s.id === b.status);
    
    if (statusA?.priority !== statusB?.priority) {
      return (statusA?.priority || 999) - (statusB?.priority || 999);
    }
        if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0;
    }
          
    return new Date(a.orderTime) - new Date(b.orderTime);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          {/* Station Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {stations.map(station => {
              const stationOrders = station.id === 'all' 
                ? orders.length 
                : orders.filter(order => 
                    order.items.some(item => station.categories?.includes(item.category))
                  ).length;
              return (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    selectedStation === station.id
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {station.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kitchen Display Grid */}
      <div className="p-6">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders for this station</h3>
            <p className="text-gray-600">
              {selectedStation === 'all' 
                ? 'No active orders in the kitchen right now.'
                : `No orders for the ${stations.find(s => s.id === selectedStation)?.name} station.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {sortedOrders.map(order => (
              <OrderTicket key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={showOrderDetails ? selectedOrder : null}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default KitchenDisplay;