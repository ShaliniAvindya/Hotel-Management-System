const mongoose = require('mongoose');

const specialRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  guestName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ['room_setup', 'celebration', 'dietary', 'accessibility', 'arrival', 'housekeeping', 'other'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  dueDate: { type: Date, default: null },
  assignedTo: {
    type: String,
    enum: ['Front Office', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Guest Services', 'Management'],
    default: 'Front Office',
  },
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Staff' },
  requestDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SpecialRequest', specialRequestSchema);