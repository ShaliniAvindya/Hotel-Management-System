const mongoose = require('mongoose');

const staffMemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialties: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('roomStaff', staffMemberSchema, 'roomStaff');
