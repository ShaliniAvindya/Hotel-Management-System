const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  reservationId: { type: String, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  items: [invoiceItemSchema],
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  reservationId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['advance', 'deposit', 'partial', 'full_payment'],
    required: true,
  },
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'check'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  date: { type: Date, required: true },
  reference: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Payment: mongoose.model('Payment', paymentSchema),
};
