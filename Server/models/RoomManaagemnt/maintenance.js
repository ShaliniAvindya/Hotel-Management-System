const mongoose = require('mongoose');

const roomMaintenanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  reportedBy: { type: String, required: true },
  reportedByType: { type: String, required: true },
  reporterContact: { type: String },
  assignedTo: { type: String },
  assignedToContact: { type: String },
  estimatedCost: { type: Number, default: 0 },
  actualCost: { type: Number, default: 0 },
  estimatedTime: { type: Number, default: 0 },
  actualTime: { type: Number, default: 0 },
  notes: { type: String },
  images: { type: [String], default: [] },
  roomUnavailable: { type: Boolean, default: false },
  scheduledStartDate: { type: String, required: true }, 
  scheduledEndDate: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('roomMaintenance', roomMaintenanceSchema, 'roomMaintenance');