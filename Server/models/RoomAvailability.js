const mongoose = require('mongoose');

const availabilityEntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, 
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'checkout', 'cleaning', 'maintenance', 'blocked'],
    required: true,
  },
  guest: { type: String, default: null },
  checkIn: { type: String, default: null }, 
  checkOut: { type: String, default: null },  
  rate: { type: Number, default: null },
  notes: { type: String, default: null },
});

const roomAvailabilitySchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  availability: [availabilityEntrySchema],
}, { timestamps: true });

module.exports = mongoose.model('roomAvailability', roomAvailabilitySchema, 'roomAvailability');
