const mongoose = require('mongoose');

const roomMappingSchema = new mongoose.Schema({
  localRoomType: { type: String, required: true },
  apaleoUnitTypeId: { type: String, required: true },
  apaleoUnitTypeName: { type: String, default: '' }
}, { _id: false });

const apaleoConfigSchema = new mongoose.Schema({
  accessToken: { type: String, default: '' },
  tokenExpiry: { type: Date },
  propertyId: { type: String, default: '' },
  connected: { type: Boolean, default: false },
  lastSync: { type: Date },
  roomMappings: [roomMappingSchema]
}, { timestamps: true });

module.exports = mongoose.model('ApaleoConfig', apaleoConfigSchema);
