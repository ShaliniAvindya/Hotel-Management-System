const express = require('express');
const router = express.Router();
const BillingInvoice = require('../models/BillingInvoice');

// Get all invoices
router.get('/', async (req, res) => {
  const invoices = await BillingInvoice.find().populate('guest reservation');
  res.json(invoices);
});

// Create invoice
router.post('/', async (req, res) => {
  const invoice = new BillingInvoice(req.body);
  await invoice.save();
  res.status(201).json(invoice);
});

// Update invoice
router.put('/:id', async (req, res) => {
  const invoice = await BillingInvoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(invoice);
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  await BillingInvoice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Invoice deleted' });
});

module.exports = router;
