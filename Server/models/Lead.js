const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  city: { type: String },
  country: { type: String },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'converted', 'not-interested'],
    default: 'new'
  },
  source: { type: String, default: 'meta' },
  platform: { type: String, enum: ['facebook', 'instagram', 'direct', 'other'], default: 'facebook' },
  leadDate: { type: Date, default: Date.now },
  checkInDate: { type: Date },
  checkOutDate: { type: Date }, 
  notes: { type: String }, 
  interestedInDates: { type: String },
  numberOfGuests: { type: Number },
  roomType: { type: String },
  budget: { type: Number },
  facebookLeadId: { type: String, unique: true, sparse: true },
  metaData: { type: mongoose.Schema.Types.Mixed },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  followUpDate: { type: Date },
  isFollowedUp: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ facebookLeadId: 1 });
LeadSchema.index({ leadDate: -1 });

module.exports = mongoose.model('Lead', LeadSchema);
