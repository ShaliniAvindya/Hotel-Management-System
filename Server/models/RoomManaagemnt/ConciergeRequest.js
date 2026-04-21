const mongoose = require('mongoose');

const conciergeRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  guestName: { type: String, required: true },
  guestId: { type: String, required: true },
  roomNumber: { type: String, required: true },
  requestType: {
    type: String,
    enum: ['laundry', 'room-service', 'luggage', 'maintenance', 'housekeeping', 'transportation', 'information', 'other'],
    required: true
  },
  description: { type: String, required: false },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestDate: { type: Date, default: Date.now },
  requiredByDate: { type: Date, required: false },
  assignedTo: { type: String, default: null },
  assignedDate: { type: Date, default: null },
  completedDate: { type: Date, default: null },
  notes: { type: String, default: '' },
  staffNotes: { type: String, default: '' },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  lastUpdated: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

conciergeRequestSchema.index({ createdAt: -1 });
conciergeRequestSchema.index({ status: 1, createdAt: -1 });
conciergeRequestSchema.index({ roomNumber: 1, createdAt: -1 });
conciergeRequestSchema.index({ guestId: 1 });

module.exports = mongoose.model('ConciergeRequest', conciergeRequestSchema);
