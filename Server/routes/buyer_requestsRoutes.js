const express = require('express');
const router = express.Router();
const Expectation = require('../models/buyer_requests');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

router.get('/', auth, async (req, res) => {
  try {
    const expectations = await Expectation.find({ userId: req.user.id });
    res.json(expectations);
  } catch (error) {
    console.error('Error fetching expectations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const expectation = new Expectation({
      ...req.body,
      userId: req.user.id,
      isActive: true,
      matchCount: 0,
      createdAt: new Date(),
    });
    await expectation.save();
    res.status(201).json(expectation);
  } catch (error) {
    console.error('Error creating expectation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid expectation ID' });
    }
    const expectation = await Expectation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!expectation) return res.status(404).json({ message: 'Expectation not found' });
    res.json(expectation);
  } catch (error) {
    console.error('Error updating expectation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid expectation ID' });
    }
    const expectation = await Expectation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expectation) return res.status(404).json({ message: 'Expectation not found' });
    res.json({ message: 'Expectation deleted' });
  } catch (error) {
    console.error('Error deleting expectation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;