const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNumber: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  maxCapacity: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  weekendPrice: { type: Number, required: true },
  floor: { type: Number, required: true },
  size: { type: Number, required: true },
  description: { type: String, required: true },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  lastCleaned: { type: Date, default: null },
  maintenanceNotes: { type: String, default: '' },
  bookingHistory: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['clean', 'dirty', 'cleaning', 'maintenance', 'out-of-order', 'available'],
    default: 'clean',
  },
  occupancyStatus: {
    type: String,
    enum: ['occupied', 'vacant', 'out-of-order'],
    default: 'vacant',
  },
  nextCheckIn: { type: Date, default: null },
  lastCheckOut: { type: Date, default: null },
  housekeeperAssigned: { type: String, default: null },
  cleaningStarted: { type: Date, default: null },
  cleaningDuration: { type: Number, default: 30 },
  guestName: { type: String, default: null },
  checkInDate: { type: Date, default: null },
  expectedCheckOut: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);