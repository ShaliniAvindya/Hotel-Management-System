const mongoose = require('mongoose');

const restrictionsSchema = new mongoose.Schema({
  minStay: { type: Number, default: 1 },
  maxStay: { type: Number, default: 14 },
  advanceBooking: { type: Number, default: 0 },
  cancellationDeadline: { type: Number, default: 24 },
});

const dateRangeSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

const roomRatesSchema = new mongoose.Schema({
  rateType: {
    type: String,
    enum: ['ratePlan', 'seasonal', 'discount', 'corporate'],
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'expired'],
    default: 'active',
  },
  // Rate Plan fields
  roomType: { type: String, enum: ['single', 'double', 'twin', 'triple', 'suite', 'presidential', 'villa', 'penthouse'] },
  roomId: { type: String },
  basePrice: { type: Number, min: 0 },
  weekendPrice: { type: Number, min: 0 },
  refundable: { type: Boolean, default: true },
  breakfastIncluded: { type: Boolean, default: false },
  inclusions: [{ type: String }],
  restrictions: { type: restrictionsSchema },
  validFrom: { type: Date },
  validTo: { type: Date },
  // Seasonal Rate fields
  season: { type: String, enum: ['summer', 'winter', 'spring', 'fall', 'holiday', 'off-season'] },
  dateRange: { type: dateRangeSchema },
  rateAdjustment: { type: Number },
  // Discount fields
  type: { type: String, enum: ['percentage', 'fixed'] },
  value: { type: Number, min: 0 },
  code: { type: String },
  conditions: {
    minAdvanceBooking: { type: Number, default: 0 },
    minStay: { type: Number, default: 1 },
    maxStay: { type: Number, default: 14 },
    weekendOnly: { type: Boolean, default: false },
    blackoutDates: [{ type: Date }],
  },
  // Corporate Rate fields
  companyName: { type: String },
  contactPerson: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  discount: { type: Number, min: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  contractStart: { type: Date },
  contractEnd: { type: Date },
  applicableRoomTypes: [{ type: String, enum: ['single', 'double', 'twin', 'triple', 'suite', 'presidential', 'villa', 'penthouse'] }],
}, { timestamps: true });

module.exports = mongoose.model('RoomRates', roomRatesSchema, 'roomRates');
