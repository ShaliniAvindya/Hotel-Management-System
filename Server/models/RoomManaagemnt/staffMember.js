const mongoose = require('mongoose');

const staffMemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialties: { type: [String], default: [] }
}, { timestamps: true });

staffMemberSchema.index({ name: 1 });
staffMemberSchema.index({ createdAt: -1 });

module.exports = mongoose.model('roomStaff', staffMemberSchema, 'roomStaff');
