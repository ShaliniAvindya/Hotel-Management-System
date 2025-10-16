import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import axios from 'axios';
import { API_BASE_URL } from '../../apiconfig';

const Modal = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stations = [
    { id: 'all', name: 'All Orders', color: 'gray' },
    { id: 'hot', name: 'Hot Kitchen', color: 'red', categories: ['mains', 'soups'] },
    { id: 'cold', name: 'Cold Kitchen', color: 'blue', categories: ['salads', 'appetizers'] },
    { id: 'bar', name: 'Bar', color: 'purple', categories: ['beverages', 'alcoholic'] },
    { id: 'desserts', name: 'Desserts', color: 'pink', categories: ['desserts'] },
  ];

  const orderStatuses = [
    { id: 'new', name: 'NEW', color: 'bg-yellow-500 text-white', priority: 1 },
    { id: 'confirmed', name: 'CONFIRMED', color: 'bg-blue-500 text-white', priority: 2 },
    { id: 'preparing', name: 'PREPARING', color: 'bg-orange-500 text-white', priority: 2 },
    { id: 'ready', name: 'READY', color: 'bg-green-500 text-white', priority: 3 },
    { id: 'served', name: 'SERVED', color: 'bg-indigo-500 text-white', priority: 4 },
    { id: 'delayed', name: 'DELAYED', color: 'bg-red-500 text-white animate-pulse', priority: 5 },
    { id: 'cancelled', name: 'CANCELLED', color: 'bg-gray-500 text-white', priority: 6 },
  ];

  const orderTypes = [
    { id: 'dine_in', name: 'Dine-in', icon: Utensils, color: 'blue' },
    { id: 'room_service', name: 'Room Service', icon: Bed, color: 'purple' },
    { id: 'takeaway', name: 'Takeaway', icon: Truck, color: 'green' },
    { id: 'poolside', name: 'Poolside', icon: Waves, color: 'cyan' },
  ];

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (selectedStation === 'all') return true;
    return order.items.some((item) => {
      const station = stations.find((s) => s.id === selectedStation);
      return station?.categories?.includes(item.category);
    });
  });

  const getElapsedTime = (orderTime) => {
    console.log('orderTime:', orderTime); // Debug
    const parsedTime = new Date(orderTime);
    if (isNaN(parsedTime.getTime())) {
      console.warn('Invalid order time:', orderTime);
      return 0;
    }
    const elapsed = Math.floor((currentTime - parsedTime) / 60000);
    return Math.max(0, elapsed);
  };

  const getTimeColor = (order) => {
    const elapsed = getElapsedTime(order.createdAt);
    const estimated = order.estimatedTime;
    if (elapsed > estimated + 10) return 'text-red-600 font-bold';
    if (elapsed > estimated) return 'text-orange-600 font-semibold';
    if (elapsed > estimated * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setOrders(orders.map((or) => (or._id === orderId ? response.data : or)));
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

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
    return orderTypes.find((ot) => ot.id === type) || { name: 'Unknown', icon: Utensils, color: 'gray' };
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

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const OrderDetailsContent = ({ order }) => {
    if (!order) return null;
    const orderTypeInfo = getOrderTypeInfo(order.type);
    const OrderTypeIcon = orderTypeInfo.icon;
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const elapsedTime = getElapsedTime(order.createdAt);
    const timeColorClass = getTimeColor(order);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <OrderTypeIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{orderTypeInfo.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span>{order.customerCount} guests</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Order #{order.id}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              orderStatuses.find((s) => s.id === order.status)?.color || 'bg-gray-100 text-gray-800'
            }`}
          >
            {orderStatuses.find((s) => s.id === order.status)?.name || order.status.toUpperCase()}
          </span>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              order.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : order.priority === 'normal'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{order.customerPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{getLocationInfo(order)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Est. {order.estimatedTime} minutes</span>
              </div>
              {order.waiterName && (
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Waiter: {order.waiterName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({totalItems})</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => {
              const CategoryIcon = getCategoryIcon(item.category);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <CategoryIcon className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.quantity}x {item.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">${item.price.toFixed(2)} each</span>
                          <span className="text-sm text-gray-600">{item.cookTime}min cook time</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        stations.find((s) => s.categories?.includes(item.category))?.color === 'red'
                          ? 'bg-red-100 text-red-800'
                          : stations.find((s) => s.categories?.includes(item.category))?.color ===
                            'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : stations.find((s) => s.categories?.includes(item.category))?.color ===
                            'purple'
                          ? 'bg-purple-100 text-purple-800'
                          : stations.find((s) => s.categories?.includes(item.category))?.color ===
                            'pink'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {stations.find((s) => s.categories?.includes(item.category))?.name || 'General'}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="flex items-start space-x-2 mt-2">
                      <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded">
                        {item.notes}
                      </span>
                    </div>
                  )}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex items-start space-x-2 mt-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                          >
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
        {order.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Bell className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Special Instructions</h4>
                <p className="text-yellow-700">{order.specialInstructions}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-200">
          {order.status === 'new' || order.status === 'confirmed' ? (
            <button
              onClick={() => {
                handleStatusChange(order._id, 'preparing');
                closeOrderModal();
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center space-x-2 transition-colors font-medium"
            >
              <Play className="h-5 w-5" />
              <span>Start Preparing</span>
            </button>
          ) : order.status === 'preparing' ? (
            <>
              <button
                onClick={() => {
                  handleStatusChange(order._id, 'ready');
                  closeOrderModal();
                }}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2 transition-colors font-medium"
              >
                <Check className="h-5 w-5" />
                <span>Mark Ready</span>
              </button>
              <button
                onClick={() => {
                  handleStatusChange(order._id, 'delayed');
                  closeOrderModal();
                }}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center space-x-2 transition-colors font-medium"
              >
                <Pause className="h-5 w-5" />
                <span>Mark Delayed</span>
              </button>
            </>
          ) : order.status === 'delayed' ? (
            <button
              onClick={() => {
                handleStatusChange(order._id, 'preparing');
                closeOrderModal();
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center space-x-2 transition-colors font-medium"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Resume Preparing</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const OrderTicket = ({ order }) => {
    const elapsed = getElapsedTime(order.createdAt);
    const status = orderStatuses.find((s) => s.id === order.status);
    const orderTypeInfo = getOrderTypeInfo(order.type);

    const relevantItems = order.items.filter((item) => {
      if (selectedStation === 'all') return true;
      const station = stations.find((s) => s.id === selectedStation);
      return station?.categories?.includes(item.category);
    });

    if (relevantItems.length === 0) return null;

    return (
      <div
        className={`bg-white rounded-lg border-2 shadow-lg transition-all duration-300 ${
          order.status === 'delayed'
            ? 'border-red-500 animate-pulse'
            : order.status === 'ready'
            ? 'border-green-500'
            : order.status === 'preparing'
            ? 'border-orange-500'
            : order.status === 'confirmed'
            ? 'border-blue-500'
            : 'border-yellow-500'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-t-lg ${status?.color || 'bg-gray-100 text-gray-800'} flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            <div className="font-bold text-lg">
              {order.type === 'dine_in' && order.tableId
                ? tables.find((t) => t.id === order.tableId)?.number || 'N/A'
                : order.type === 'room_service' && order.roomId
                ? rooms.find((r) => r.id === order.roomId)?.number || 'N/A'
                : order.id}
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
            <div className="text-xs opacity-90">{order.waiterName || orderTypeInfo.name}</div>
          </div>
        </div>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Order: {order.id}</div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
            <span>{order.customerName}</span>
          </div>
        </div>
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
                        <span
                          key={idx}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                        >
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
        {order.specialInstructions && (
          <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
            <div className="flex items-start space-x-2">
              <Bell className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800 font-medium">{order.specialInstructions}</p>
            </div>
          </div>
        )}
        <div className="p-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-4">
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openOrderModal(order)}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1 transition-colors"
              title="View Order Details"
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </button>
            {(order.status === 'new' || order.status === 'confirmed') && (
              <button
                onClick={() => handleStatusChange(order._id, 'preparing')}
                className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center space-x-1 transition-colors"
              >
                <Play className="h-3 w-3" />
                <span>Start</span>
              </button>
            )}
            {order.status === 'preparing' && (
              <>
                <button
                  onClick={() => handleStatusChange(order._id, 'ready')}
                  className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center space-x-1 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  <span>Ready</span>
                </button>
                <button
                  onClick={() => handleStatusChange(order._id, 'delayed')}
                  className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center space-x-1 transition-colors"
                >
                  <Pause className="h-3 w-3" />
                  <span>Delay</span>
                </button>
              </>
            )}
            {order.status === 'delayed' && (
              <button
                onClick={() => handleStatusChange(order._id, 'preparing')}
                className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center space-x-1 transition-colors"
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

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusA = orderStatuses.find((s) => s.id === a.status);
    const statusB = orderStatuses.find((s) => s.id === b.status);
    if (statusA?.priority !== statusB?.priority) {
      return (statusA?.priority || 999) - (statusB?.priority || 999);
    }
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
            {stations.map((station) => (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStation === station.id
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {station.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders for this station</h3>
            <p className="text-gray-600">
              {selectedStation === 'all'
                ? 'No active orders in the kitchen right now.'
                : `No orders for the ${stations.find((s) => s.id === selectedStation)?.name} station.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {sortedOrders.map((order) => (
              <OrderTicket key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeOrderModal} title={`Order #${selectedOrder?.id || ''}`}>
        <OrderDetailsContent order={selectedOrder} />
      </Modal>
    </div>
  );
};

export default KitchenDisplay;