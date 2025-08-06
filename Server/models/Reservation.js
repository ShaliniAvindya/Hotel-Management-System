const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationId: { type: String, required: true, unique: true },
  guest: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  table: { type: String, required: true },
  tableCapacity: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  party: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'pending', 'seated', 'completed', 'cancelled', 'no-show'], required: true },
  notes: { type: String },
  specialRequests: { type: [String], default: [] },
  loyaltyMember: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['online', 'phone', 'walk-in'], required: true },
  deposit: { type: Number, default: 0 },
  allergies: { type: [String], default: [] },
  previousVisits: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

reservationSchema.index({ reservationId: 1 }, { unique: true });
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ table: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);