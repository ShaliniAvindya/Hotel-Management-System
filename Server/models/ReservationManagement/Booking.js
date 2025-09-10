const mongoose = require('mongoose');

const splitStaySchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
});

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingReference: { type: String, required: true, unique: true },
  guestId: { type: String, default: '' },
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  guestEmail: { type: String, default: '' },
  guestPhone: { type: String, default: '' },
  roomId: { type: String, default: '' },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'confirmed',
  },
  bookingSource: {
    type: String,
    enum: ['walk-in', 'phone', 'email', 'online'],
    default: 'walk-in',
  },
  specialRequests: { type: String, default: '' },
  splitStays: { type: [splitStaySchema], default: [] },
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '12:00' },
  isEarlyCheckIn: { type: Boolean, default: false },
  isLateCheckOut: { type: Boolean, default: false },
  actualCheckInTime: { type: Date, default: null },
  actualCheckOutTime: { type: Date, default: null },
  checkInNotes: { type: String, default: '' },
  checkOutNotes: { type: String, default: '' },
  keyCardNumber: { type: String, default: '' },
  depositAmount: { type: Number, default: 0 },
  damageCharges: { type: Number, default: 0 },
  minibarCharges: { type: Number, default: 0 },
  additionalServices: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'non-refundable'],
    default: 'flexible',
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
