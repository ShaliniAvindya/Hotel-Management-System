import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChefHat,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Camera,
  Coffee,
  Utensils,
  Wine,
  Cookie,
  Soup,
  Pizza,
  Salad,
  Star,
  DollarSign,
  Eye,
  X,
  Save,
  RefreshCw,
  Grid,
  List,
  ImageIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Tag,
  Leaf,
  Flame,
  Wheat,
  Timer,
  Scale,
  Info,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../apiconfig';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterDietary, setFilterDietary] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(null);

  // Categories with icons and colors
  const categories = [
    { id: 'appetizers', name: 'Appetizers', icon: Soup, color: 'orange' },
    { id: 'mains', name: 'Main Courses', icon: Pizza, color: 'red' },
    { id: 'desserts', name: 'Desserts', icon: Cookie, color: 'pink' },
    { id: 'beverages', name: 'Beverages', icon: Coffee, color: 'blue' },
    { id: 'alcoholic', name: 'Alcoholic Drinks', icon: Wine, color: 'purple' },
    { id: 'salads', name: 'Salads & Sides', icon: Salad, color: 'green' },
    { id: 'soups', name: 'Soups', icon: Soup, color: 'yellow' },
    { id: 'combos', name: 'Combos & Meals', icon: Utensils, color: 'indigo' },
  ];

  // Dietary tags with icons
  const dietaryTags = [
    { id: 'vegetarian', name: 'Vegetarian', icon: Leaf, color: 'green' },
    { id: 'vegan', name: 'Vegan', icon: Leaf, color: 'green' },
    { id: 'gluten_free', name: 'Gluten Free', icon: Wheat, color: 'yellow' },
    { id: 'dairy_free', name: 'Dairy Free', icon: Coffee, color: 'blue' },
    { id: 'spicy', name: 'Spicy', icon: Flame, color: 'red' },
    { id: 'keto', name: 'Keto Friendly', icon: Award, color: 'purple' },
    { id: 'low_calorie', name: 'Low Calorie', icon: Scale, color: 'blue' },
    { id: 'protein_rich', name: 'High Protein', icon: TrendingUp, color: 'orange' },
  ];

  // Availability periods
  const availabilityPeriods = [
    { id: 'all_day', name: 'All Day' },
    { id: 'breakfast', name: 'Breakfast Only' },
    { id: 'lunch', name: 'Lunch Only' },
    { id: 'dinner', name: 'Dinner Only' },
    { id: 'brunch', name: 'Brunch Only' },
    { id: 'late_night', name: 'Late Night' },
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/menu`);
        setMenuItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };
    fetchMenuItems();
  }, []);

  // Filter items
  useEffect(() => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    if (filterAvailability !== 'all') {
      if (filterAvailability === 'active') {
        filtered = filtered.filter((item) => item.isActive);
      } else if (filterAvailability === 'inactive') {
        filtered = filtered.filter((item) => !item.isActive);
      } else if (filterAvailability === 'special') {
        filtered = filtered.filter((item) => item.isSpecial);
      }
    }

    if (filterDietary !== 'all') {
      filtered = filtered.filter((item) => item.dietaryTags.includes(filterDietary));
    }

    setFilteredItems(filtered);
  }, [menuItems, searchQuery, filterCategory, filterAvailability, filterDietary]);

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    switch (category?.color) {
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'pink': return 'bg-pink-100 text-pink-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'indigo': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDietaryColor = (tagId) => {
    const tag = dietaryTags.find((t) => t.id === tagId);
    switch (tag?.color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/menu`, {
        ...itemData,
        id: `MI${String(menuItems.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        popularity: 0,
        margin: itemData.price > 0 ? ((itemData.price - itemData.cost) / itemData.price * 100).toFixed(1) : 0,
      });
      setMenuItems([...menuItems, response.data]);
      setShowItemForm(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleEditItem = async (itemData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/menu/${itemData._id}`, {
        ...itemData,
        updatedAt: new Date().toISOString(),
        margin: itemData.price > 0 ? ((itemData.price - itemData.cost) / itemData.price * 100).toFixed(1) : 0,
      });
      setMenuItems(menuItems.map((item) => (item._id === itemData._id ? response.data : item)));
      setEditingItem(null);
      setShowItemForm(false);
    } catch (error) {
      console.error('Error editing menu item:', error);
    }
  };

  const handleDeleteItem = (itemId) => {
    setShowConfirmation({
      title: 'Delete Menu Item',
      message: `Are you sure you want to delete this menu item? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/menu/${itemId}`);
          setMenuItems(menuItems.filter((item) => item._id !== itemId));
          setShowConfirmation(null);
        } catch (error) {
          console.error('Error deleting menu item:', error);
        }
      },
      onCancel: () => setShowConfirmation(null),
    });
  };

  const handleToggleActive = (itemId) => {
    const item = menuItems.find((item) => item._id === itemId);
    setShowConfirmation({
      title: item.isActive ? 'Deactivate Menu Item' : 'Activate Menu Item',
      message: `Are you sure you want to ${item.isActive ? 'deactivate' : 'activate'} "${item.name}"?`,
      onConfirm: async () => {
        try {
          const response = await axios.put(`${API_BASE_URL}/menu/${itemId}`, { isActive: !item.isActive, updatedAt: new Date().toISOString() });
          setMenuItems(menuItems.map((it) => (it._id === itemId ? response.data : it)));
          setShowConfirmation(null);
        } catch (error) {
          console.error('Error toggling active status:', error);
        }
      },
      onCancel: () => setShowConfirmation(null),
    });
  };

  const handleToggleSpecial = (itemId) => {
    const item = menuItems.find((item) => item._id === itemId);
    setShowConfirmation({
      title: item.isSpecial ? 'Remove Special Status' : 'Mark as Special',
      message: `Are you sure you want to ${
        item.isSpecial ? 'remove the special status from' : 'mark as special'
      } "${item.name}"?`,
      onConfirm: async () => {
        try {
          const response = await axios.put(`${API_BASE_URL}/menu/${itemId}`, { isSpecial: !item.isSpecial, updatedAt: new Date().toISOString() });
          setMenuItems(menuItems.map((it) => (it._id === itemId ? response.data : it)));
          setShowConfirmation(null);
        } catch (error) {
          console.error('Error toggling special status:', error);
        }
      },
      onCancel: () => setShowConfirmation(null),
    });
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

  const MenuItemForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      item || {
        name: '',
        description: '',
        category: 'mains',
        price: 0,
        cost: 0,
        portionSize: '',
        availability: 'all_day',
        preparationTime: 15,
        dietaryTags: [],
        ingredients: [],
        allergens: [],
        calories: 0,
        isActive: true,
        isSpecial: false,
        images: [],
        chef: '',
      }
    );

    const [selectedDietaryTags, setSelectedDietaryTags] = useState(formData.dietaryTags || []);
    const [ingredientInput, setIngredientInput] = useState('');
    const [allergenInput, setAllergenInput] = useState('');
    const [imageUrls, setImageUrls] = useState(formData.images || []);
    const fileInputRef = useRef(null);

    const handleDietaryTagToggle = (tagId) => {
      const updated = selectedDietaryTags.includes(tagId)
        ? selectedDietaryTags.filter((id) => id !== tagId)
        : [...selectedDietaryTags, tagId];
      setSelectedDietaryTags(updated);
      setFormData({ ...formData, dietaryTags: updated });
    };

    const addIngredient = () => {
      if (ingredientInput.trim()) {
        const updated = [...formData.ingredients, ingredientInput.trim()];
        setFormData({ ...formData, ingredients: updated });
        setIngredientInput('');
      }
    };

    const removeIngredient = (index) => {
      const updated = formData.ingredients.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients: updated });
    };

    const addAllergen = () => {
      if (allergenInput.trim()) {
        const updated = [...formData.allergens, allergenInput.trim()];
        setFormData({ ...formData, allergens: updated });
        setAllergenInput('');
      }
    };

    const removeAllergen = (index) => {
      const updated = formData.allergens.filter((_, i) => i !== index);
      setFormData({ ...formData, allergens: updated });
    };

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        try {
          const response = await axios.post(
            'https://api.imgbb.com/1/upload?key=4e08e03047ee0d48610586ad270e2b39',
            formDataUpload
          );
          const newUrl = response.data.data.url;
          setImageUrls((prev) => [...prev, newUrl]);
          setFormData((prev) => ({ ...prev, images: [...prev.images, newUrl] }));
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };

    const removeImage = (index) => {
      const updatedUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(updatedUrls);
      setFormData({ ...formData, images: updatedUrls });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...formData, images: imageUrls });
    };

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900">
              {item ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., Grilled Chicken Caesar Salad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    {availabilityPeriods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Describe the dish, its ingredients, and preparation..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chef/Creator</label>
                  <input
                    type="text"
                    value={formData.chef}
                    onChange={(e) => setFormData({ ...formData, chef: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Chef name"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Portions */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Portions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portion Size</label>
                  <input
                    type="text"
                    value={formData.portionSize}
                    onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., 300g, 12 inch, 250ml"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Tags */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dietaryTags.map((tag) => {
                      const IconComponent = tag.icon;
                      return (
                        <label
                          key={tag.id}
                          className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedDietaryTags.includes(tag.id)
                              ? 'bg-orange-100 border-orange-300 text-orange-900'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDietaryTags.includes(tag.id)}
                            onChange={() => handleDietaryTagToggle(tag.id)}
                            className="sr-only"
                          />
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{tag.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories (per serving)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., 420"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Add ingredient"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white border border-gray-300"
                      >
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Allergens */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergens</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Add allergen"
                  />
                  <button
                    type="button"
                    onClick={addAllergen}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 border border-red-300 text-red-800"
                      >
                        {allergen}
                        <button
                          type="button"
                          onClick={() => removeAllergen(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Images</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Images</span>
                  </button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Item ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status & Special Flags */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Flags</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (Available for ordering)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isSpecial"
                    checked={formData.isSpecial}
                    onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isSpecial" className="text-sm font-medium text-gray-700">
                    Chef's Special / Featured Item
                  </label>
                </div>
              </div>
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
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{item ? 'Update Item' : 'Add Item'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const MenuItemDetails = ({ item, onClose, onEdit, onDelete }) => {
    const category = categories.find((c) => c.id === item.category);
    const CategoryIcon = category?.icon || ChefHat;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CategoryIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-600">
                  {getCategoryName(item.category)} • ID: {item.id}
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
            {/* Images */}
            {item.images && item.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${item.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Status and Flags */}
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
              {item.isSpecial && (
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Chef's Special
                </span>
              )}
              {item.popularity > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{item.popularity}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg shadow-sm">{item.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Portions</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Sale Price:</span>
                    <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                  </div>
                  {item.cost > 0 && (
                    <>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Cost Price:</span>
                        <span className="text-sm font-medium">${item.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Margin:</span>
                        <span className="text-sm font-medium">{item.margin}%</span>
                      </div>
                    </>
                  )}
                  {item.portionSize && (
                    <div className="flex items-center space-x-2">
                      <Scale className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Portion Size:</span>
                      <span className="text-sm font-medium">{item.portionSize}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Prep Time:</span>
                    <span className="text-sm font-medium">{item.preparationTime} min</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Availability:</span>
                    <span className="text-sm font-medium capitalize">
                      {availabilityPeriods.find((p) => p.id === item.availability)?.name}
                    </span>
                  </div>
                  {item.calories > 0 && (
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Calories:</span>
                      <span className="text-sm font-medium">{item.calories}</span>
                    </div>
                  )}
                  {item.chef && (
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Chef:</span>
                      <span className="text-sm font-medium">{item.chef}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Tags */}
            {item.dietaryTags && item.dietaryTags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dietary Information</h3>
                <div className="flex flex-wrap gap-2">
                  {item.dietaryTags.map((tagId) => {
                    const tag = dietaryTags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    const IconComponent = tag.icon;
                    return (
                      <span
                        key={tagId}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getDietaryColor(
                          tagId
                        )}`}
                      >
                        <IconComponent className="h-3 w-3" />
                        <span>{tag.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-sm bg-white rounded border border-gray-200"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Allergens</h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Contains:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-sm bg-red-100 text-red-800 rounded border border-red-300"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onEdit(item)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Item</span>
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const MenuItemCard = ({ item, onView, onEdit, onDelete, onToggleActive, onToggleSpecial }) => {
    const category = categories.find((c) => c.id === item.category);

    return (
      <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white hover:scale-105 transform transition-transform duration-200">
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Camera className="h-8 w-8 text-gray-400" />
          )}
          {!item.isActive && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Inactive</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 text-base line-clamp-2">{item.name}</h3>
            {item.isSpecial && (
              <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0 ml-2" />
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                item.category
              )}`}
            >
              {category?.name}
            </span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</div>
              {item.cost > 0 && (
                <div className="text-xs text-gray-500">{item.margin}% margin</div>
              )}
            </div>
          </div>

          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.dietaryTags.slice(0, 3).map((tagId) => {
                const tag = dietaryTags.find((t) => t.id === tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tagId}
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${getDietaryColor(tagId)}`}
                  >
                    {tag.name}
                  </span>
                );
              })}
              {item.dietaryTags.length > 3 && (
                <span className="text-xs text-gray-400">+{item.dietaryTags.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{item.preparationTime} min</span>
            <span>{availabilityPeriods.find((p) => p.id === item.availability)?.name}</span>
            {item.popularity > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{item.popularity}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onToggleActive(item._id)}
                className={`p-1 rounded ${
                  item.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                } transition-colors`}
                title={item.isActive ? 'Mark Inactive' : 'Mark Active'}
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => onToggleSpecial(item._id)}
                className={`p-1 rounded ${
                  item.isSpecial ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'
                } transition-colors`}
                title={item.isSpecial ? 'Remove Special' : 'Mark as Special'}
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                onClick={() => onView(item)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1 text-gray-400 hover:text-orange-600 rounded transition-colors"
                title="Edit Item"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Delete Item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MenuItemListItem = ({ item, onView, onEdit, onDelete, onToggleActive, onToggleSpecial }) => {
    const category = categories.find((c) => c.id === item.category);

    return (
      <tr
        className={`border-b border-gray-100 hover:bg-gray-50 ${
          !item.isActive ? 'opacity-60' : ''
        } transition-colors`}
      >
        <td className="py-4 px-4">
          <div className="flex items-center space-x-3">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.isSpecial && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>
              <p className="text-sm text-gray-600">ID: {item.id}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
              item.category
            )}`}
          >
            {category?.name}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</div>
          {item.cost > 0 && (
            <div className="text-xs text-gray-500">${item.cost.toFixed(2)} cost</div>
          )}
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900">{item.preparationTime} min</span>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-900 capitalize">
            {availabilityPeriods.find((p) => p.id === item.availability)?.name}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-wrap gap-1">
            {item.dietaryTags.slice(0, 2).map((tagId) => {
              const tag = dietaryTags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${getDietaryColor(tagId)}`}
                >
                  {tag.name}
                </span>
              );
            })}
            {item.dietaryTags.length > 2 && (
              <span className="text-xs text-gray-400">+{item.dietaryTags.length - 2}</span>
            )}
          </div>
        </td>
        <td className="py-4 px-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleActive(item._id)}
              className={`p-1 rounded ${
                item.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
              } transition-colors`}
              title={item.isActive ? 'Mark Inactive' : 'Mark Active'}
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => onView(item)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64 transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="special">Chef's Special</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterDietary}
                onChange={(e) => setFilterDietary(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="all">All Dietary</option>
                {dietaryTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-400 hover:bg-gray-100'
                } transition-colors`}
                title="Grid View"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-400 hover:bg-gray-100'
                } transition-colors`}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowItemForm(true);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items Display */}
      <div className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items found.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterAvailability('all');
                setFilterDietary('all');
              }}
              className="mt-4 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onView={(item) => {
                  setSelectedItem(item);
                  setShowItemDetails(true);
                }}
                onEdit={(item) => {
                  setEditingItem(item);
                  setShowItemForm(true);
                }}
                onDelete={handleDeleteItem}
                onToggleActive={handleToggleActive}
                onToggleSpecial={handleToggleSpecial}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Prep Time</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Dietary</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <MenuItemListItem
                    key={item._id}
                    item={item}
                    onView={(item) => {
                      setSelectedItem(item);
                      setShowItemDetails(true);
                    }}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowItemForm(true);
                    }}
                    onDelete={handleDeleteItem}
                    onToggleActive={handleToggleActive}
                    onToggleSpecial={handleToggleSpecial}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showItemForm && (
        <MenuItemForm
          item={editingItem}
          onSave={editingItem ? handleEditItem : handleAddItem}
          onCancel={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showItemDetails && selectedItem && (
        <MenuItemDetails
          item={selectedItem}
          onClose={() => {
            setShowItemDetails(false);
            setSelectedItem(null);
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setShowItemForm(true);
            setShowItemDetails(false);
          }}
          onDelete={handleDeleteItem}
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

export default MenuManagement;