const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'admin', 'staff'], default: 'guest' },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ isActive: 1, createdAt: -1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
