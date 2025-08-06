import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  X, 
  Check,
  Utensils,
  Coffee,
  Wine,
  IceCream,
  Star,
  ChefHat,
  Calculator,
  Printer,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Menu
} from 'lucide-react';
import Sidebar from '../screens/Sidebar'; // Adjust path if needed, e.g., '../components/Sidebar'

const POSSystem = () => {
  const [activeCategory, setActiveCategory] = useState('appetizers');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [selectedTable, setSelectedTable] = useState('T-12');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [discount, setDiscount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'appetizers', name: 'Appetizers', icon: Utensils },
    { id: 'mains', name: 'Main Course', icon: ChefHat },
    { id: 'desserts', name: 'Desserts', icon: IceCream },
    { id: 'beverages', name: 'Beverages', icon: Coffee },
    { id: 'wine', name: 'Wine & Spirits', icon: Wine }
  ];

  const menuItems = {
    appetizers: [
      { id: 'APP001', name: 'Bruschetta Trio', price: 12.99, description: 'Classic tomato, mushroom, and olive tapenade', image: '🍅', popular: true },
      { id: 'APP002', name: 'Calamari Rings', price: 15.99, description: 'Crispy squid rings with marinara sauce', image: '🦑', popular: false },
      { id: 'APP003', name: 'Cheese Platter', price: 18.99, description: 'Selection of artisanal cheeses with crackers', image: '🧀', popular: true },
      { id: 'APP004', name: 'Wings Buffalo', price: 13.99, description: 'Spicy buffalo wings with blue cheese dip', image: '🍗', popular: false },
      { id: 'APP005', name: 'Spinach Dip', price: 11.99, description: 'Creamy spinach and artichoke dip', image: '🥬', popular: false },
      { id: 'APP006', name: 'Shrimp Cocktail', price: 16.99, description: 'Fresh shrimp with cocktail sauce', image: '🍤', popular: true }
    ],
    mains: [
      { id: 'MAIN001', name: 'Grilled Salmon', price: 28.99, description: 'Atlantic salmon with lemon butter sauce', image: '🐟', popular: true },
      { id: 'MAIN002', name: 'Ribeye Steak', price: 34.99, description: '12oz prime ribeye with garlic mashed potatoes', image: '🥩', popular: true },
      { id: 'MAIN003', name: 'Chicken Parmesan', price: 22.99, description: 'Breaded chicken breast with marinara and mozzarella', image: '🍗', popular: false },
      { id: 'MAIN004', name: 'Lobster Ravioli', price: 26.99, description: 'Homemade ravioli with lobster in cream sauce', image: '🦞', popular: true },
      { id: 'MAIN005', name: 'Vegetarian Pasta', price: 19.99, description: 'Penne with seasonal vegetables in olive oil', image: '🍝', popular: false },
      { id: 'MAIN006', name: 'Fish & Chips', price: 21.99, description: 'Beer-battered cod with hand-cut fries', image: '🍟', popular: false }
    ],
    desserts: [
      { id: 'DES001', name: 'Chocolate Lava Cake', price: 8.99, description: 'Warm chocolate cake with vanilla ice cream', image: '🍰', popular: true },
      { id: 'DES002', name: 'Tiramisu', price: 7.99, description: 'Classic Italian dessert with mascarpone', image: '🍮', popular: true },
      { id: 'DES003', name: 'Cheesecake', price: 6.99, description: 'New York style cheesecake with berry compote', image: '🍰', popular: false },
      { id: 'DES004', name: 'Crème Brûlée', price: 8.99, description: 'Vanilla custard with caramelized sugar', image: '🍮', popular: false },
      { id: 'DES005', name: 'Ice Cream Sundae', price: 5.99, description: 'Three scoops with toppings', image: '🍨', popular: false }
    ],
    beverages: [
      { id: 'BEV001', name: 'Fresh Orange Juice', price: 4.99, description: 'Freshly squeezed orange juice', image: '🍊', popular: true },
      { id: 'BEV002', name: 'Cappuccino', price: 3.99, description: 'Espresso with steamed milk foam', image: '☕', popular: true },
      { id: 'BEV003', name: 'Iced Tea', price: 2.99, description: 'House-made iced tea with lemon', image: '🧊', popular: false },
      { id: 'BEV004', name: 'Sparkling Water', price: 2.49, description: 'San Pellegrino sparkling water', image: '💧', popular: false },
      { id: 'BEV005', name: 'Soda', price: 2.99, description: 'Coca-Cola, Pepsi, Sprite', image: '🥤', popular: false }
    ],
    wine: [
      { id: 'WIN001', name: 'House Red Wine', price: 8.99, description: 'Cabernet Sauvignon - Glass', image: '🍷', popular: true },
      { id: 'WIN002', name: 'House White Wine', price: 8.99, description: 'Chardonnay - Glass', image: '🍷', popular: true },
      { id: 'WIN003', name: 'Craft Beer', price: 5.99, description: 'Local IPA on tap', image: '🍺', popular: false },
      { id: 'WIN004', name: 'Whiskey', price: 12.99, description: 'Premium bourbon - 2oz', image: '🥃', popular: false },
      { id: 'WIN005', name: 'Cocktail Special', price: 11.99, description: 'Signature mojito', image: '🍹', popular: true }
    ]
  };

  const tables = ['T-1', 'T-2', 'T-3', 'T-4', 'T-5', 'T-6', 'T-7', 'T-8', 'T-9', 'T-10', 'T-11', 'T-12'];

  const addToOrder = (item) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemId) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromOrder(itemId);
    } else {
      setCurrentOrder(currentOrder.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getSubtotal = () => {
    return currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getDiscountAmount = () => {
    return getSubtotal() * (discount / 100);
  };

  const getTotal = () => {
    return getSubtotal() + getTax() - getDiscountAmount();
  };

  const filteredItems = menuItems[activeCategory]?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePayment = () => {
    setShowPayment(false);
    setShowReceipt(true);
    // Reset order after payment
    setTimeout(() => {
      setCurrentOrder([]);
      setShowReceipt(false);
      setCustomerInfo({ name: '', phone: '', email: '' });
      setOrderNote('');
      setDiscount(0);
    }, 5000);
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setOrderNote('');
    setDiscount(0);
  };

  const mainMargin = sidebarMinimized ? 'lg:ml-16' : 'lg:ml-64';

  console.log('POSSystem rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
      />
      <div className={`${mainMargin} transition-all duration-300 min-h-screen bg-gray-50 flex`}>
        {/* Menu Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 p-4">
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
                  <p className=" text-gray-600">Order Management</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="bg-white border-b border-gray-200 px-4">
            <div className="flex space-x-1">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToOrder(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">{item.image}</div>
                    {item.popular && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
              <button
                onClick={clearOrder}
                className="text-red-600 hover:text-red-800 p-1 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Table: {selectedTable}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-auto">
            {currentOrder.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items in order</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {currentOrder.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <button
                        onClick={() => removeFromOrder(item.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Notes */}
          {currentOrder.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <textarea
                placeholder="Order notes..."
                className="w-full h-16 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>
          )}

          {/* Order Total */}
          {currentOrder.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Discount:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span>%</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Calculator className="h-5 w-5" />
                <span>Process Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payment Processing</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <DollarSign className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">Card</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Complete Payment</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-md">
              <div className="text-center mb-6">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <Check className="h-10 w-10 text-green-600 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Order has been processed</p>
              </div>

              <div className="border-t border-b border-gray-200 py-4 my-4">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg">Bella Vista Restaurant</h4>
                  <p className="text-sm text-gray-600">123 Main Street, Downtown</p>
                  <p className="text-sm text-gray-600">Tel: (555) 123-4567</p>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Order #:</span>
                    <span>ORD-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Table:</span>
                    <span>{selectedTable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{currentTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {currentOrder.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        )}

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

export default POSSystem;