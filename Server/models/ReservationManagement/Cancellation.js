const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  originalBookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking',
    required: true 
  },
  type: { 
    type: String, 
    enum: ['cancellation', 'no-show'],
    required: true 
  },
  reason: { type: String },
  reasonNote: { type: String },
  refundMethod: { type: String, default: 'original' },
  contactAttempts: { type: Number, default: 0 },
  lastContactTime: { type: Date, default: null },
  notes: { type: String },
  refundAmount: { type: Number, default: 0 },
  penaltyFee: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processed', 'confirmed'], 
    default: 'pending' 
  },
  processedBy: { type: String, default: 'System' },
  cancellationDate: { type: Date, default: Date.now },
  noShowDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

cancellationSchema.index({ createdAt: -1 });
cancellationSchema.index({ originalBookingId: 1 });
cancellationSchema.index({ status: 1, createdAt: -1 });
cancellationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Cancellation', cancellationSchema);
