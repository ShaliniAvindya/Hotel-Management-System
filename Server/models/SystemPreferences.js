const mongoose = require('mongoose');

const SystemPreferencesSchema = new mongoose.Schema({
  currency: String,
  timezone: String,
  dateFormat: String,
  timeFormat: String,
  language: String,
});

module.exports = mongoose.model('SystemPreferences', SystemPreferencesSchema);