const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  relationship: { type: String, default: '' },
});

const stayHistorySchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  roomId: { type: String, required: true },
  roomNumber: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
});

const guestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, 
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, default: '' },
  nationality: { type: String, default: '' },
  idType: { type: String, enum: ['passport', 'drivers_license', 'national_id', 'other'], default: 'passport' },
  idNumber: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  vipLevel: { type: String, enum: ['none', 'bronze', 'silver', 'gold', 'platinum'], default: 'none' },
  status: { type: String, enum: ['active', 'checked-out', 'blacklisted', 'inactive'], default: 'active' },
  preferences: { type: [String], default: [] },
  specialRequests: { type: [String], default: [] },
  emergencyContact: { type: emergencyContactSchema, default: {} },
  notes: { type: String, default: '' },
  totalStays: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastStay: { type: Date, default: null },
  stayHistory: { type: [stayHistorySchema], default: [] },
  createdDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);