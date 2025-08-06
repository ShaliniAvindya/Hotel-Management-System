const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  seller: { type: String, required: true },
  matchScore: { type: Number, required: true },
}, { collection: 'matches', timestamps: true });

module.exports = mongoose.model('Match', matchSchema);