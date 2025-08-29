const mongoose = require('mongoose');

const BillingInvoiceSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  items: [{
    description: String,
    amount: Number
  }],
  total: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BillingInvoice', BillingInvoiceSchema);
