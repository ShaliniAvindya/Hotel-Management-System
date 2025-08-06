const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: false }, // Shop's _id (optional)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User's _id (seller/owner)
  title: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true, enum: ['Smartphone', 'Tablet', 'Laptop', 'Desktop', 'Other'] },
  images: [{ type: String }],
  videos: [{ type: String }],
  condition: [{ type: String }],
  details: {
    type: Object,
    default: {},
  },
  description: { type: String },
  price: { type: Number, required: true },
  status: { type: String, default: 'active', enum: ['active', 'deactivated', 'sold'] },
  createdAt: { type: Date, default: Date.now },
  location: { type: String },
  contactInfo: {
    phone: { type: String },
    email: { type: String },
    preferredContact: { type: String, default: 'phone' },
  },
});

module.exports = mongoose.model('Device', deviceSchema);