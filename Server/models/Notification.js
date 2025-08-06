const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['reservation', 'system', 'alert'], required: true },
  message: { type: String, required: true },
  details: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  relatedCollection: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);