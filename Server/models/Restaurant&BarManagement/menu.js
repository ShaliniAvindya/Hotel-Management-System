const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  portionSize: { type: String },
  availability: { type: String, default: 'all_day' },
  preparationTime: { type: Number, default: 15 },
  dietaryTags: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  allergens: { type: [String], default: [] },
  calories: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isSpecial: { type: Boolean, default: false },
  popularity: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  chef: { type: String },
  cost: { type: Number, default: 0 },
  margin: { type: Number, default: 0 },
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
