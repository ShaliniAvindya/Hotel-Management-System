const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { type: String, default: 'new' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  tableId: { type: String },
  roomId: { type: String },
  locationDetails: { type: String },
  items: [{
    id: { type: String, ref: 'Menu' },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    specialInstructions: { type: String },
  }],
  subtotal: { type: Number },
  tax: { type: Number },
  total: { type: Number },
  specialInstructions: { type: String },
  waiterName: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  estimatedTime: { type: Number },
  priority: { type: String, default: 'normal' },
  pickupTime: { type: Date },
  deliveryTime: { type: Date },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;