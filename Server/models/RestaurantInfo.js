const mongoose = require('mongoose');

const RestaurantInfoSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  description: String,
  cuisine: String,
  capacity: Number,
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  }
});

module.exports = mongoose.model('RestaurantInfo', RestaurantInfoSchema);