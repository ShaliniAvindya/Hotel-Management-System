const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

router.get('/', async (req, res) => {
  const inquiries = await Inquiry.find();
  res.json(inquiries);
});

router.post('/', async (req, res) => {
  const inquiry = new Inquiry(req.body);
  await inquiry.save();
  res.status(201).json(inquiry);
});

router.put('/:id', async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(inquiry);
});

router.delete('/:id', async (req, res) => {
  await Inquiry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Inquiry deleted' });
});

module.exports = router;
