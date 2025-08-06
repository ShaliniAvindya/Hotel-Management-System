import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Timer, 
  Users, 
  ChefHat,
  Utensils,
  Thermometer,
  Zap,
  AlertCircle,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Filter,
  RefreshCw,
  Bell,
  Calendar,
  User,
  Hash,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Flame,
  Snowflake,
  Coffee,
  Pizza,
  Salad,
  Soup,
  Cake,
  MapPin,
  Menu
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const KitchenDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      tableNumber: 'T-12',
      orderNumber: '#245',
      customerName: 'Sarah Johnson',
      orderTime: new Date(Date.now() - 15 * 60 * 1000),
      estimatedTime: 25,
      priority: 'high',
      status: 'preparing',
      station: 'grill',
      server: 'Alex M.',
      items: [
        { id: 1, name: 'Grilled Salmon', quantity: 1, station: 'grill', status: 'preparing', cookTime: 12, allergens: ['fish'], special: 'Medium rare' },
        { id: 2, name: 'Caesar Salad', quantity: 1, station: 'cold', status: 'ready', cookTime: 5, allergens: ['dairy', 'gluten'], special: 'No croutons' },
        { id: 3, name: 'Garlic Bread', quantity: 2, station: 'oven', status: 'preparing', cookTime: 8, allergens: ['gluten'], special: 'Extra garlic' }
      ],
      notes: 'Customer has fish allergy - NO CROSS CONTAMINATION',
      totalItems: 4
    },
    {
      id: 'ORD-002',
      tableNumber: 'T-8',
      orderNumber: '#246',
      customerName: 'Michael Chen',
      orderTime: new Date(Date.now() - 8 * 60 * 1000),
      estimatedTime: 18,
      priority: 'medium',
      status: 'new',
      station: 'grill',
      server: 'Maria L.',
      items: [
        { id: 4, name: 'Ribeye Steak', quantity: 1, station: 'grill', status: 'new', cookTime: 15, allergens: [], special: 'Well done' },
        { id: 5, name: 'Mashed Potatoes', quantity: 1, station: 'hot', status: 'new', cookTime: 10, allergens: ['dairy'], special: '' },
        { id: 6, name: 'Seasonal Vegetables', quantity: 1, station: 'hot', status: 'new', cookTime: 8, allergens: [], special: 'No carrots' }
      ],
      notes: '',
      totalItems: 3
    },
    {
      id: 'ORD-003',
      tableNumber: 'T-15',
      orderNumber: '#247',
      customerName: 'Emma Rodriguez',
      orderTime: new Date(Date.now() - 22 * 60 * 1000),
      estimatedTime: 35,
      priority: 'high',
      status: 'ready',
      station: 'cold',
      server: 'James K.',
      items: [
        { id: 7, name: 'Chicken Parmesan', quantity: 2, station: 'fry', status: 'ready', cookTime: 18, allergens: ['gluten', 'dairy'], special: '' },
        { id: 8, name: 'Caprese Salad', quantity: 1, station: 'cold', status: 'ready', cookTime: 7, allergens: ['dairy'], special: 'Balsamic reduction' },
        { id: 9, name: 'Tiramisu', quantity: 1, station: 'dessert', status: 'ready', cookTime: 3, allergens: ['dairy', 'eggs'], special: '' }
      ],
      notes: 'Table celebrating anniversary - add candle to dessert',
      totalItems: 4
    },
    {
      id: 'ORD-004',
      tableNumber: 'T-20',
      orderNumber: '#248',
      customerName: 'David Wilson',
      orderTime: new Date(Date.now() - 5 * 60 * 1000),
      estimatedTime: 22,
      priority: 'medium',
      status: 'preparing',
      station: 'hot',
      server: 'Sophie R.',
      items: [
        { id: 10, name: 'Lobster Bisque', quantity: 1, station: 'hot', status: 'preparing', cookTime: 8, allergens: ['shellfish', 'dairy'], special: '' },
        { id: 11, name: 'Beef Wellington', quantity: 1, station: 'oven', status: 'preparing', cookTime: 25, allergens: ['gluten'], special: 'Medium' },
        { id: 12, name: 'Chocolate Lava Cake', quantity: 1, station: 'dessert', status: 'new', cookTime: 12, allergens: ['dairy', 'eggs', 'gluten'], special: 'Vanilla ice cream' }
      ],
      notes: 'VIP guest - ensure perfect presentation',
      totalItems: 3
    },
    {
      id: 'ORD-005',
      tableNumber: 'T-5',
      orderNumber: '#249',
      customerName: 'Lisa Thompson',
      orderTime: new Date(Date.now() - 12 * 60 * 1000),
      estimatedTime: 15,
      priority: 'low',
      status: 'preparing',
      station: 'cold',
      server: 'Tom B.',
      items: [
        { id: 13, name: 'Greek Salad', quantity: 1, station: 'cold', status: 'preparing', cookTime: 6, allergens: ['dairy'], special: 'No olives' },
        { id: 14, name: 'Grilled Chicken', quantity: 1, station: 'grill', status: 'preparing', cookTime: 14, allergens: [], special: 'Lemon herb seasoning' }
      ],
      notes: 'Customer is vegetarian - confirmed chicken is okay',
      totalItems: 2
    },
    {
      id: 'ORD-006',
      tableNumber: 'T-18',
      orderNumber: '#250',
      customerName: 'Robert Kim',
      orderTime: new Date(Date.now() - 30 * 60 * 1000),
      estimatedTime: 20,
      priority: 'urgent',
      status: 'delayed',
      station: 'grill',
      server: 'Anna P.',
      items: [
        { id: 15, name: 'Fish and Chips', quantity: 2, station: 'fry', status: 'delayed', cookTime: 16, allergens: ['fish', 'gluten'], special: 'Mushy peas' },
        { id: 16, name: 'Onion Rings', quantity: 1, station: 'fry', status: 'delayed', cookTime: 8, allergens: ['gluten'], special: 'Crispy' }
      ],
      notes: 'Order running late - customer has been informed',
      totalItems: 3
    }
  ]);

  const [stations] = useState([
    { id: 'all', name: 'All Stations', icon: ChefHat, color: 'bg-gray-500' },
    { id: 'grill', name: 'Grill', icon: Flame, color: 'bg-red-500' },
    { id: 'cold', name: 'Cold Kitchen', icon: Snowflake, color: 'bg-blue-500' },
    { id: 'hot', name: 'Hot Kitchen', icon: Thermometer, color: 'bg-orange-500' },
    { id: 'fry', name: 'Fryer', icon: Zap, color: 'bg-yellow-500' },
    { id: 'oven', name: 'Oven', icon: Pizza, color: 'bg-purple-500' },
    { id: 'dessert', name: 'Dessert', icon: Cake, color: 'bg-pink-500' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const refreshTimer = setInterval(() => {
        // Simulate order updates
        setOrders(prevOrders => 
          prevOrders.map(order => ({
            ...order,
            items: order.items.map(item => ({
              ...item,
              cookTime: Math.max(0, item.cookTime - 0.1)
            }))
          }))
        );
      }, 6000);
      return () => clearInterval(refreshTimer);
    }
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeElapsed = (orderTime) => {
    const now = new Date();
    const elapsed = Math.floor((now - orderTime) / 1000 / 60);
    return elapsed;
  };

  const getStationIcon = (station) => {
    const stationData = stations.find(s => s.id === station);
    return stationData ? stationData.icon : ChefHat;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const updateItemStatus = (orderId, itemId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
              )
            }
          : order
      )
    );
  };

  const filteredOrders = orders.filter(order => {
    const stationMatch = selectedStation === 'all' || order.station === selectedStation || 
                        order.items.some(item => item.station === selectedStation);
    const priorityMatch = selectedPriority === 'all' || order.priority === selectedPriority;
    return stationMatch && priorityMatch;
  });

  const getItemIcon = (name) => {
    const itemName = name.toLowerCase();
    if (itemName.includes('salad')) return Salad;
    if (itemName.includes('soup') || itemName.includes('bisque')) return Soup;
    if (itemName.includes('pizza')) return Pizza;
    if (itemName.includes('coffee') || itemName.includes('drink')) return Coffee;
    if (itemName.includes('cake') || itemName.includes('dessert')) return Cake;
    return Utensils;
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('KitchenDisplay rendering');

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-100 p-4`}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
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
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
                <p className="text-gray-600">Real-time order management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    soundEnabled 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Station:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {stations.map(station => {
                const Icon = station.icon;
                return (
                  <button
                    key={station.id}
                    onClick={() => setSelectedStation(station.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedStation === station.id
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{station.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className={`p-4 border-l-4 ${getPriorityColor(order.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-bold text-lg text-gray-900">{order.tableNumber}</span>
                    <span className="text-sm text-gray-600">{order.orderNumber}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{getTimeElapsed(order.orderTime)}m</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Server: {order.server}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{order.totalItems} items</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 space-y-3">
                {order.items.map(item => {
                  const ItemIcon = getItemIcon(item.name);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ItemIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-sm text-gray-600">x{item.quantity}</span>
                          </div>
                          {item.special && (
                            <p className="text-xs text-orange-600 mt-1">Special: {item.special}</p>
                          )}
                          {item.allergens.length > 0 && (
                            <div className="flex items-center space-x-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="text-xs text-red-600">
                                Allergens: {item.allergens.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{Math.ceil(item.cookTime)}m</span>
                        <button
                          onClick={() => updateItemStatus(order.id, item.id, 
                            item.status === 'new' ? 'preparing' : 
                            item.status === 'preparing' ? 'ready' : 'new'
                          )}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Special Notes:</p>
                        <p className="text-sm text-yellow-700">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">View Details</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {order.status === 'new' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Table</p>
                    <p className="font-medium text-gray-900">{selectedOrder.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium text-gray-900">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Server</p>
                    <p className="font-medium text-gray-900">{selectedOrder.server}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Time</p>
                    <p className="font-medium text-gray-900">{selectedOrder.orderTime.toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{item.name} x{item.quantity}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Station: {item.station}</div>
                          <div>Cook Time: {Math.ceil(item.cookTime)}m</div>
                        </div>
                        {item.special && (
                          <p className="text-sm text-orange-600 mt-2">Special: {item.special}</p>
                        )}
                        {item.allergens.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-sm text-red-600">
                              Allergens: {item.allergens.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedOrder.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Notes</h3>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>New: {orders.filter(o => o.status === 'new').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Preparing: {orders.filter(o => o.status === 'preparing').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Ready: {orders.filter(o => o.status === 'ready').length}</span>
            </div>
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
  );
};

export default KitchenDisplay;