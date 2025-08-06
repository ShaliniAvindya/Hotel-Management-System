const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableId: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tableSchema.index({ tableId: 1 }, { unique: true });
tableSchema.index({ status: 1 });

module.exports = mongoose.model('Table', tableSchema);