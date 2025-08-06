import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Wine,
  Coffee,
  Plus,
  Minus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Package,
  Droplets,
  Flame,
  Leaf,
  Calendar,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Scale,
  Thermometer,
  Timer,
  Award,
  Star,
  DollarSign,
  Percent,
  Hash,
  Info,
  Grid,
  List,
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Something went wrong.</h3>
          <p className="text-gray-600">Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const BarOperations = () => {
  const [barStock, setBarStock] = useState([]);
  const [cocktailRecipes, setCocktailRecipes] = useState([]);
  const [miniBarItems, setMiniBarItems] = useState([]);
  const [servingLogs, setServingLogs] = useState([]);
  const [guestRooms, setGuestRooms] = useState([]);
  const [userRole, setUserRole] = useState('manager');
  const [activeTab, setActiveTab] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(null);

  // Categories and Types
  const stockCategories = [
    { id: 'spirits', name: 'Spirits', icon: Wine, color: 'amber' },
    { id: 'wine', name: 'Wine', icon: Wine, color: 'purple' },
    { id: 'beer', name: 'Beer', icon: Coffee, color: 'orange' },
    { id: 'cocktail_mix', name: 'Cocktail Mix', icon: Droplets, color: 'blue' },
    { id: 'non_alcoholic', name: 'Non-Alcoholic', icon: Coffee, color: 'green' },
    { id: 'garnish', name: 'Garnish & Extras', icon: Leaf, color: 'emerald' },
  ];

  const servingCategories = [
    { id: 'cocktail', name: 'Cocktail', icon: Wine },
    { id: 'straight', name: 'Straight Pour', icon: Droplets },
    { id: 'wine_glass', name: 'Wine Glass', icon: Wine },
    { id: 'bottle', name: 'Bottle Service', icon: Wine },
    { id: 'minibar', name: 'Mini-bar', icon: Package },
  ];

  // Sample Data
  useEffect(() => {
    const sampleStock = [
      {
        id: 'BS001',
        name: 'Johnnie Walker Black Label',
        category: 'spirits',
        type: 'Whiskey',
        currentStock: 12,
        minimumStock: 5,
        maximumStock: 25,
        unitPrice: 89.99,
        bottleSize: '750ml',
        alcoholContent: 40,
        supplier: 'Premium Spirits Ltd',
        location: 'Main Bar - A1',
        expiryDate: '2026-12-31',
        lastRestocked: '2024-08-01',
        totalValue: 1079.88,
        isLowStock: false,
        isExpiringSoon: false,
        servingsPerBottle: 25,
        costPerServing: 3.60,
      },
      {
        id: 'BS002',
        name: 'Dom Pérignon Vintage',
        category: 'wine',
        type: 'Champagne',
        currentStock: 3,
        minimumStock: 2,
        maximumStock: 10,
        unitPrice: 199.99,
        bottleSize: '750ml',
        alcoholContent: 12.5,
        supplier: 'Fine Wines Import',
        location: 'Wine Cellar - C3',
        expiryDate: '2028-06-15',
        lastRestocked: '2024-07-15',
        totalValue: 599.97,
        isLowStock: true,
        isExpiringSoon: false,
        servingsPerBottle: 6,
        costPerServing: 33.33,
      },
      {
        id: 'BS003',
        name: 'Craft IPA Selection',
        category: 'beer',
        type: 'IPA',
        currentStock: 48,
        minimumStock: 24,
        maximumStock: 96,
        unitPrice: 4.99,
        bottleSize: '330ml',
        alcoholContent: 6.5,
        supplier: 'Local Brewery Co',
        location: 'Beer Fridge - B2',
        expiryDate: '2024-12-20',
        lastRestocked: '2024-08-05',
        totalValue: 239.52,
        isLowStock: false,
        isExpiringSoon: true,
        servingsPerBottle: 1,
        costPerServing: 4.99,
      },
      {
        id: 'BS004',
        name: 'Premium Tonic Water',
        category: 'cocktail_mix',
        type: 'Mixer',
        currentStock: 24,
        minimumStock: 12,
        maximumStock: 48,
        unitPrice: 2.49,
        bottleSize: '200ml',
        alcoholContent: 0,
        supplier: 'Beverage Distributors',
        location: 'Main Bar - M1',
        expiryDate: '2025-03-10',
        lastRestocked: '2024-07-30',
        totalValue: 59.76,
        isLowStock: false,
        isExpiringSoon: false,
        servingsPerBottle: 2,
        costPerServing: 1.25,
      },
      {
        id: 'BS005',
        name: 'Fresh Lime Wedges',
        category: 'garnish',
        type: 'Citrus',
        currentStock: 8,
        minimumStock: 5,
        maximumStock: 15,
        unitPrice: 3.99,
        bottleSize: '1kg',
        alcoholContent: 0,
        supplier: 'Fresh Produce Market',
        location: 'Bar Fridge - G1',
        expiryDate: '2024-08-10',
        lastRestocked: '2024-08-06',
        totalValue: 31.92,
        isLowStock: true,
        isExpiringSoon: true,
        servingsPerBottle: 40,
        costPerServing: 0.10,
      },
    ];

    const sampleRecipes = [
      {
        id: 'CR001',
        name: 'Classic Mojito',
        category: 'cocktail',
        description: 'Refreshing rum cocktail with mint and lime',
        difficulty: 'Easy',
        prepTime: 3,
        alcoholContent: 15,
        price: 14.99,
        cost: 4.25,
        margin: 71.6,
        glassType: 'Highball',
        garnish: 'Fresh mint sprig, lime wheel',
        method: 'Muddle mint with lime juice, add rum and simple syrup, top with soda water',
        popularity: 4.8,
        ingredients: [
          { itemId: 'BS001', name: 'White Rum', quantity: 60, unit: 'ml' },
          { itemId: 'BS004', name: 'Fresh Lime Juice', quantity: 30, unit: 'ml' },
          { itemId: 'BS005', name: 'Simple Syrup', quantity: 20, unit: 'ml' },
          { itemId: 'BS006', name: 'Fresh Mint', quantity: 8, unit: 'leaves' },
          { itemId: 'BS007', name: 'Soda Water', quantity: 90, unit: 'ml' },
        ],
        tags: ['refreshing', 'summer', 'classic'],
        allergens: [],
        isActive: true,
        isSpecial: false,
        createdAt: '2024-01-15',
      },
      {
        id: 'CR002',
        name: 'Old Fashioned',
        category: 'cocktail',
        description: 'Classic whiskey cocktail with bitters and orange',
        difficulty: 'Medium',
        prepTime: 5,
        alcoholContent: 35,
        price: 18.99,
        cost: 6.50,
        margin: 65.8,
        glassType: 'Rocks Glass',
        garnish: 'Orange peel, maraschino cherry',
        method: 'Muddle sugar with bitters, add whiskey, stir with ice, strain',
        popularity: 4.6,
        ingredients: [
          { itemId: 'BS001', name: 'Bourbon Whiskey', quantity: 75, unit: 'ml' },
          { itemId: 'BS008', name: 'Simple Syrup', quantity: 10, unit: 'ml' },
          { itemId: 'BS009', name: 'Angostura Bitters', quantity: 3, unit: 'dashes' },
          { itemId: 'BS010', name: 'Orange Peel', quantity: 1, unit: 'piece' },
        ],
        tags: ['classic', 'strong', 'sophisticated'],
        allergens: [],
        isActive: true,
        isSpecial: true,
        createdAt: '2024-01-10',
      },
    ];

    const sampleMiniBar = [
      {
        id: 'MB001',
        roomNumber: '201',
        guestName: 'John Smith',
        checkInDate: '2024-08-05',
        checkOutDate: '2024-08-08',
        items: [
          {
            id: 'MBI001',
            name: 'Premium Vodka Miniature',
            category: 'spirits',
            price: 15.99,
            cost: 4.50,
            quantity: 2,
            consumed: 1,
            lastRestocked: '2024-08-05',
            expiryDate: '2025-12-31',
          },
          {
            id: 'MBI002',
            name: 'Red Wine (187ml)',
            category: 'wine',
            price: 12.99,
            cost: 3.80,
            quantity: 1,
            consumed: 0,
            lastRestocked: '2024-08-05',
            expiryDate: '2025-08-15',
          },
          {
            id: 'MBI003',
            name: 'Craft Beer',
            category: 'beer',
            price: 8.99,
            cost: 2.10,
            quantity: 3,
            consumed: 2,
            lastRestocked: '2024-08-05',
            expiryDate: '2024-11-20',
          },
        ],
        totalValue: 51.95,
        consumedValue: 33.97,
        status: 'occupied',
      },
      {
        id: 'MB002',
        roomNumber: '305',
        guestName: 'Maria Garcia',
        checkInDate: '2024-08-06',
        checkOutDate: '2024-08-10',
        items: [
          {
            id: 'MBI004',
            name: 'Champagne Split (187ml)',
            category: 'wine',
            price: 24.99,
            cost: 8.20,
            quantity: 1,
            consumed: 1,
            lastRestocked: '2024-08-06',
            expiryDate: '2026-01-15',
          },
          {
            id: 'MBI005',
            name: 'Premium Gin Miniature',
            category: 'spirits',
            price: 16.99,
            cost: 5.10,
            quantity: 1,
            consumed: 0,
            lastRestocked: '2024-08-06',
            expiryDate: '2026-03-20',
          },
        ],
        totalValue: 41.98,
        consumedValue: 24.99,
        status: 'occupied',
      },
    ];

    const sampleServingLogs = [
      {
        id: 'SL001',
        timestamp: '2024-08-06T19:30:00Z',
        bartender: 'James Wilson',
        customerInfo: {
          type: 'walk_in',
          name: 'Table 12',
          age: null,
          verified: true,
        },
        items: [
          {
            recipeId: 'CR001',
            name: 'Classic Mojito',
            quantity: 2,
            unitPrice: 14.99,
            totalPrice: 29.98,
            ingredients: [
              { itemId: 'BS001', name: 'White Rum', quantityUsed: 120, unit: 'ml' },
              { itemId: 'BS005', name: 'Fresh Mint', quantityUsed: 16, unit: 'leaves' },
            ],
          },
        ],
        totalAmount: 29.98,
        paymentMethod: 'room_charge',
        notes: 'Extra mint requested',
        ageVerified: true,
        restrictions: [],
      },
      {
        id: 'SL002',
        timestamp: '2024-08-06T20:15:00Z',
        bartender: 'Sarah Chen',
        customerInfo: {
          type: 'room_service',
          name: 'Room 201',
          roomNumber: '201',
          guestName: 'John Smith',
        },
        items: [
          {
            recipeId: 'CR002',
            name: 'Old Fashioned',
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99,
            ingredients: [
              { itemId: 'BS001', name: 'Bourbon Whiskey', quantityUsed: 75, unit: 'ml' },
            ],
          },
        ],
        totalAmount: 18.99,
        paymentMethod: 'room_charge',
        notes: 'Delivered to room',
        ageVerified: true,
        restrictions: [],
      },
    ];

    setBarStock(sampleStock);
    setCocktailRecipes(sampleRecipes);
    setMiniBarItems(sampleMiniBar);
    setServingLogs(sampleServingLogs);
  }, []);

  // Helper Functions
  const getCategoryColor = (category) => {
    const cat = stockCategories.find(c => c.id === category);
    switch (cat?.color) {
      case 'amber': return 'bg-amber-100 text-amber-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'emerald': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (item) => {
    if (item.currentStock <= item.minimumStock) return 'low';
    if (item.currentStock >= item.maximumStock * 0.9) return 'high';
    return 'normal';
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const StockModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || {
      name: '',
      category: 'spirits',
      type: '',
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      unitPrice: 0,
      bottleSize: '',
      alcoholContent: 0,
      supplier: '',
      location: '',
      expiryDate: '',
      servingsPerBottle: 1,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const stockItem = {
        ...formData,
        id: item?.id || `BS${String(barStock.length + 1).padStart(3, '0')}`,
        totalValue: formData.currentStock * formData.unitPrice,
        costPerServing: formData.unitPrice / formData.servingsPerBottle,
        isLowStock: formData.currentStock <= formData.minimumStock,
        isExpiringSoon: isExpiringSoon(formData.expiryDate),
        lastRestocked: item?.lastRestocked || new Date().toISOString().split('T')[0],
      };
      onSave(stockItem);
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {item ? 'Edit Stock Item' : 'Add New Stock Item'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {stockCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type/Brand</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Size</label>
                <input
                  type="text"
                  value={formData.bottleSize}
                  onChange={(e) => setFormData({...formData, bottleSize: e.target.value})}
                  placeholder="e.g., 750ml, 1L"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({...formData, minimumStock: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.maximumStock}
                  onChange={(e) => setFormData({...formData, maximumStock: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Content (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.alcoholContent}
                  onChange={(e) => setFormData({...formData, alcoholContent: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servings per Bottle</label>
                <input
                  type="number"
                  min="1"
                  value={formData.servingsPerBottle}
                  onChange={(e) => setFormData({...formData, servingsPerBottle: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {item ? 'Update' : 'Add'} Item
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const ServingModal = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      bartender: '',
      customerType: 'walk_in',
      customerName: '',
      roomNumber: '',
      guestName: '',
      items: [],
      ageVerified: false,
      notes: '',
    });

    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [quantity, setQuantity] = useState(1);

    const addItem = () => {
      const recipe = cocktailRecipes.find(r => r.id === selectedRecipe);
      if (recipe) {
        const newItem = {
          recipeId: recipe.id,
          name: recipe.name,
          quantity: quantity,
          unitPrice: recipe.price,
          totalPrice: recipe.price * quantity,
          ingredients: recipe.ingredients.map(ing => ({
            ...ing,
            quantityUsed: ing.quantity * quantity
          }))
        };
        setFormData({
          ...formData,
          items: [...formData.items, newItem]
        });
        setSelectedRecipe('');
        setQuantity(1);
      }
    };

    const removeItem = (index) => {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const totalAmount = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const servingLog = {
        id: `SL${String(servingLogs.length + 1).padStart(3, '0')}`,
        timestamp: new Date().toISOString(),
        bartender: formData.bartender,
        customerInfo: {
          type: formData.customerType,
          name: formData.customerType === 'room_service' ? `Room ${formData.roomNumber}` : formData.customerName,
          roomNumber: formData.roomNumber || null,
          guestName: formData.guestName || null,
        },
        items: formData.items,
        totalAmount,
        paymentMethod: formData.customerType === 'room_service' ? 'room_charge' : 'cash',
        notes: formData.notes,
        ageVerified: formData.ageVerified,
        restrictions: [],
      };

      // Update stock levels
      formData.items.forEach(item => {
        item.ingredients.forEach(ingredient => {
          const stockItem = barStock.find(s => s.name.toLowerCase().includes(ingredient.name.toLowerCase()));
          if (stockItem) {
            const servingsUsed = ingredient.quantityUsed / ingredient.quantity;
            const newStock = Math.max(0, stockItem.currentStock - (servingsUsed / stockItem.servingsPerBottle));
            const updatedStock = {
              ...stockItem,
              currentStock: newStock,
              isLowStock: newStock <= stockItem.minimumStock,
            };
            setBarStock(prev => prev.map(s => s.id === stockItem.id ? updatedStock : s));
          }
        });
      });

      onSave(servingLog);
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Record New Service</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bartender *</label>
                <input
                  type="text"
                  required
                  value={formData.bartender}
                  onChange={(e) => setFormData({...formData, bartender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select
                  required
                  value={formData.customerType}
                  onChange={(e) => setFormData({...formData, customerType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="walk_in">Walk-in/Bar Service</option>
                  <option value="room_service">Room Service</option>
                  <option value="event">Event Service</option>
                </select>
              </div>

              {formData.customerType === 'room_service' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer/Table *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="e.g., Table 12, John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.ageVerified}
                  onChange={(e) => setFormData({...formData, ageVerified: e.target.checked})}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-yellow-800">
                  Age verification completed (21+ for alcoholic beverages) *
                </span>
              </label>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-1">
                  <select
                    value={selectedRecipe}
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select drink/recipe</option>
                    {cocktailRecipes.filter(r => r.isActive).map(recipe => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name} - ${recipe.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedRecipe}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-lg font-bold">
                    Total: ${formData.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special instructions or notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formData.items.length === 0 || !formData.ageVerified}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Service
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  // Stock Management Functions
  const handleStockAdd = (stockData) => {
    setBarStock([...barStock, stockData]);
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleStockEdit = (stockData) => {
    setBarStock(barStock.map(item => item.id === stockData.id ? stockData : item));
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleStockDelete = (itemId) => {
    setShowConfirmation({
      title: 'Delete Stock Item',
      message: 'Are you sure you want to delete this stock item? This action cannot be undone.',
      onConfirm: () => {
        setBarStock(barStock.filter(item => item.id !== itemId));
        setShowConfirmation(null);
      },
      onCancel: () => setShowConfirmation(null),
    });
  };

  const handleRecipeAdd = (recipeData) => {
    setCocktailRecipes([...cocktailRecipes, recipeData]);
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleRecipeEdit = (recipeData) => {
    setCocktailRecipes(cocktailRecipes.map(item => item.id === recipeData.id ? recipeData : item));
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleRecipeDelete = (recipeId) => {
    setShowConfirmation({
      title: 'Delete Recipe',
      message: 'Are you sure you want to delete this recipe? This action cannot be undone.',
      onConfirm: () => {
        setCocktailRecipes(cocktailRecipes.filter(item => item.id !== recipeId));
        setShowConfirmation(null);
      },
      onCancel: () => setShowConfirmation(null),
    });
  };

  const handleServingAdd = (servingData) => {
    setServingLogs([servingData, ...servingLogs]);
    setShowModal(false);
  };

  const restockMiniBar = (roomId, itemId) => {
    setMiniBarItems(miniBarItems.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          items: room.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                consumed: 0,
                lastRestocked: new Date().toISOString().split('T')[0]
              };
            }
            return item;
          })
        };
      }
      return room;
    }));
  };

  // Filter functions
  const getFilteredStock = () => {
    return barStock.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getFilteredRecipes = () => {
    return cocktailRecipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  // Render Components
  const StockCard = ({ item }) => {
    const status = getStockStatus(item);
    const category = stockCategories.find(c => c.id === item.category);
    const CategoryIcon = category?.icon || Package;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-5 w-5 text-gray-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
              {category?.name}
            </span>
          </div>
          {status === 'low' && (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
          {item.isExpiringSoon && (
            <Clock className="h-5 w-5 text-orange-500" />
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{item.type} • {item.bottleSize}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stock Level:</span>
            <span className={`font-medium ${
              status === 'low' ? 'text-red-600' : status === 'high' ? 'text-green-600' : 'text-gray-900'
            }`}>
              {item.currentStock} / {item.maximumStock}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                status === 'low' ? 'bg-red-500' : status === 'high' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(item.currentStock / item.maximumStock) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Unit Price:</span>
            <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-medium">${item.totalValue.toFixed(2)}</span>
          </div>

          {item.alcoholContent > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Alcohol:</span>
              <span className="font-medium">{item.alcoholContent}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setSelectedItem(item);
                setModalType('stock');
                setShowModal(true);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleStockDelete(item.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RecipeCard = ({ recipe }) => {
    const difficultyColor = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Wine className="h-5 w-5 text-gray-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
            {recipe.isSpecial && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            recipe.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {recipe.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium text-green-600">${recipe.price.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cost:</span>
            <span className="font-medium">${recipe.cost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Margin:</span>
            <span className="font-medium text-blue-600">{recipe.margin.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Prep Time:</span>
            <span className="font-medium">{recipe.prepTime} min</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Glass:</span>
            <span className="font-medium">{recipe.glassType}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setSelectedItem(recipe);
                setModalType('recipe');
                setShowModal(true);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRecipeDelete(recipe.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RecipeModal = ({ recipe, onSave, onCancel }) => {
    const [formData, setFormData] = useState(recipe || {
      name: '',
      category: 'cocktail',
      description: '',
      difficulty: 'Easy',
      prepTime: 3,
      alcoholContent: 0,
      price: 0,
      cost: 0,
      glassType: '',
      garnish: '',
      method: '',
      ingredients: [],
      tags: [],
      allergens: [],
      isActive: true,
      isSpecial: false,
    });

    const [ingredientInput, setIngredientInput] = useState({ name: '', quantity: '', unit: 'ml' });

    const addIngredient = () => {
      if (ingredientInput.name && ingredientInput.quantity) {
        setFormData({
          ...formData,
          ingredients: [...formData.ingredients, {...ingredientInput, id: Date.now()}]
        });
        setIngredientInput({ name: '', quantity: '', unit: 'ml' });
      }
    };

    const removeIngredient = (index) => {
      setFormData({
        ...formData,
        ingredients: formData.ingredients.filter((_, i) => i !== index)
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const recipeData = {
        ...formData,
        id: recipe?.id || `CR${String(cocktailRecipes.length + 1).padStart(3, '0')}`,
        margin: formData.price > 0 ? ((formData.price - formData.cost) / formData.price * 100) : 0,
        popularity: recipe?.popularity || 0,
        createdAt: recipe?.createdAt || new Date().toISOString().split('T')[0],
      };
      onSave(recipeData);
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {recipe ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({...formData, prepTime: parseInt(e.target.value) || 3})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Content (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.alcoholContent}
                  onChange={(e) => setFormData({ ...formData, alcoholContent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Glass Type</label>
                <input
                  type="text"
                  value={formData.glassType}
                  onChange={(e) => setFormData({ ...formData, glassType: e.target.value })}
                  placeholder="e.g., Martini Glass, Highball"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <textarea
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Garnish</label>
                <input
                  type="text"
                  value={formData.garnish}
                  onChange={(e) => setFormData({ ...formData, garnish: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., refreshing, summer, classic"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergens (comma-separated)</label>
                <input
                  type="text"
                  value={formData.allergens.join(', ')}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value.split(',').map(allergen => allergen.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., nuts, gluten"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ingredients</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredientInput.name}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={ingredientInput.quantity}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, quantity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={ingredientInput.unit}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, unit: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                  <option value="dash">dash</option>
                  <option value="piece">piece</option>
                  <option value="leaves">leaves</option>
                </select>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>

              {formData.ingredients.length > 0 && (
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span>{ingredient.name} - {ingredient.quantity} {ingredient.unit}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 border-t pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isSpecial}
                  onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">House Special</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{recipe ? 'Update' : 'Add'} Recipe</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const MiniBarModal = ({ room, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      ...room,
      items: room.items.map(item => ({ ...item })),
    });

    const handleItemChange = (itemId, field, value) => {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.id === itemId ? { ...item, [field]: parseInt(value) || 0 } : item
        ),
      });
    };

    const restockItem = (itemId) => {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.id === itemId
            ? { ...item, consumed: 0, lastRestocked: new Date().toISOString().split('T')[0] }
            : item
        ),
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedRoom = {
        ...formData,
        totalValue: formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        consumedValue: formData.items.reduce((sum, item) => sum + item.price * item.consumed, 0),
      };
      onSave(updatedRoom);
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-xl font-semibold text-gray-900">Mini-Bar: Room {room.roomNumber}</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={formData.guestName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <input
                    type="text"
                    value={formData.status}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
                  <input
                    type="text"
                    value={new Date(formData.checkInDate).toLocaleDateString()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                  <input
                    type="text"
                    value={new Date(formData.checkOutDate).toLocaleDateString()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Mini-Bar Items</h3>
              {formData.items.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <p className="text-sm text-gray-600">{item.category} • ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Consumed:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.consumed}
                        onChange={(e) => handleItemChange(item.id, 'consumed', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => restockItem(item.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">${formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consumed Value:</span>
                  <span className="font-medium">${formData.items.reduce((sum, item) => sum + item.price * item.consumed, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
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

  const MiniBarCard = ({ room }) => {
    const totalConsumed = room.items.reduce((sum, item) => sum + item.consumed, 0);
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow hover:scale-105 transform transition-transform duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Room {room.roomNumber}</h3>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              room.status === 'occupied' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{room.guestName}</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{room.items.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Consumed:</span>
            <span className="font-medium text-red-600">{totalConsumed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-medium">${room.totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Consumed Value:</span>
            <span className="font-medium">${room.consumedValue.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Check-In: {new Date(room.checkInDate).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => {
              setSelectedItem(room);
              setModalType('minibar');
              setShowModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Manage Mini-Bar"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const ServingLog = ({ log }) => {
    const category = servingCategories.find(c => c.id === log.items[0]?.category) || servingCategories[0];
    const CategoryIcon = category?.icon || Wine;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-5 w-5 text-gray-600" />
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {category.name}
            </span>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {log.paymentMethod.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{log.customerInfo.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{log.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium text-green-600">${log.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Bartender:</span>
            <span className="font-medium">{log.bartender}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{new Date(log.timestamp).toLocaleString()}</span>
          </div>
          {log.notes && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {log.notes}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Age Verified: {log.ageVerified ? 'Yes' : 'No'}</span>
          </div>
          <button
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
            onClick={() => {
              setSelectedItem(log);
              setModalType('serving-details');
              setShowModal(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const ServingDetailsModal = ({ log, onCancel }) => {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Serving Details: {log.customerInfo.name}</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="mt-1 text-gray-900">{log.customerInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type</label>
                <p className="mt-1 text-gray-900">{log.customerInfo.type.replace('_', ' ').toUpperCase()}</p>
              </div>
              {log.customerInfo.roomNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <p className="mt-1 text-gray-900">{log.customerInfo.roomNumber}</p>
                </div>
              )}
              {log.customerInfo.guestName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                  <p className="mt-1 text-gray-900">{log.customerInfo.guestName}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Bartender</label>
                <p className="mt-1 text-gray-900">{log.bartender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="mt-1 text-gray-900">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <p className="mt-1 text-gray-900">{log.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age Verified</label>
                <p className="mt-1 text-gray-900">{log.ageVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Items Served</h3>
              <div className="space-y-3">
                {log.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="text-right text-lg font-bold">
                  Total: ${log.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {log.notes && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-600">{log.notes}</p>
              </div>
            )}
          </div>

          <div className="p-6 flex justify-end border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Main Render
  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
            {/* Tabs */}
            <div className="">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full">
                {['Stock', 'Recipes', 'Mini-Bar', 'Serving'].map((tab, idx) => {
                  const tabKey = tab.toLowerCase().replace(/-/g, '');
                  return (
                    <button
                      key={tabKey}
                      onClick={() => {
                        setActiveTab(tabKey);
                        setSearchQuery('');
                        setFilterCategory('all');
                        setViewMode('grid');
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        activeTab === tabKey
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
                <div className="flex items-center space-x-4">
                  {userRole === 'manager' && (
                    <button
                      onClick={() => {
                        setModalType(activeTab === 'stock' ? 'stock' : activeTab === 'recipes' ? 'recipe' : 'serving');
                        setSelectedItem(null);
                        setShowModal(true);
                      }}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>
                        {activeTab === 'stock' ? 'Add Stock' : activeTab === 'recipes' ? 'Add Recipe' : 'Record Service'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              {activeTab === 'stock' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {stockCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Rendering */}
          {activeTab === 'stock' && (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {getFilteredStock().length > 0 ? (
                getFilteredStock().map(item => (
                  <StockCard key={item.id} item={item} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No stock items found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {getFilteredRecipes().length > 0 ? (
                getFilteredRecipes().map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No recipes found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'minibar' && (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {miniBarItems.length > 0 ? (
                miniBarItems.map(room => (
                  <MiniBarCard key={room.id} room={room} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No mini-bar items found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'serving' && (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {servingLogs.length > 0 ? (
                servingLogs.map(log => (
                  <ServingLog key={log.id} log={log} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No serving logs found.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        {showModal && modalType === 'stock' && (
          <StockModal
            item={selectedItem}
            onSave={selectedItem ? handleStockEdit : handleStockAdd}
            onCancel={() => {
              setShowModal(false);
              setSelectedItem(null);
            }}
          />
        )}

        {showModal && modalType === 'recipe' && (
          <RecipeModal
            recipe={selectedItem}
            onSave={selectedItem ? handleRecipeEdit : handleRecipeAdd}
            onCancel={() => {
              setShowModal(false);
              setSelectedItem(null);
            }}
          />
        )}

        {showModal && modalType === 'minibar' && (
          <MiniBarModal
            room={selectedItem}
            onSave={(updatedRoom) => {
              setMiniBarItems(miniBarItems.map(room => room.id === updatedRoom.id ? updatedRoom : room));
              setShowModal(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setShowModal(false);
              setSelectedItem(null);
            }}
          />
        )}

        {showModal && modalType === 'serving' && (
          <ServingModal
            onSave={handleServingAdd}
            onCancel={() => {
              setShowModal(false);
              setSelectedItem(null);
            }}
          />
        )}

        {showModal && modalType === 'serving-details' && (
          <ServingDetailsModal
            log={selectedItem}
            onCancel={() => {
              setShowModal(false);
              setSelectedItem(null);
            }}
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
    </ErrorBoundary>
  );
};

export default BarOperations;