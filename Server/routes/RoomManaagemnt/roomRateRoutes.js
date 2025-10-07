const express = require('express');
const router = express.Router();
const RoomRates = require('../../models/RoomManaagemnt/roomRate');
const mongoose = require('mongoose');

// Get all room rates
router.get('/', async (req, res) => {
  try {
    const rates = await RoomRates.find();
    res.json(rates);
  } catch (error) {
    console.error('Error fetching room rates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rate = await RoomRates.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.json(rate);
  } catch (error) {
    console.error('Error fetching room rate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room rate
router.post('/', async (req, res) => {
  try {
    const rate = new RoomRates(req.body);
    await rate.save();
    res.status(201).json(rate);
  } catch (error) {
    console.error('Error creating room rate:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// Update a room rate
router.put('/:id', async (req, res) => {
  try {
    let rate;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      rate = await RoomRates.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      rate = await RoomRates.findOneAndUpdate({ roomId: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
    }
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.json(rate);
  } catch (error) {
    console.error('Error updating room rate:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let deletedRate;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedRate = await RoomRates.findOneAndDelete({ _id: id });
    } else {
      deletedRate = await RoomRates.findOneAndDelete({ roomId: id });
    }
    if (!deletedRate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.json({ message: 'Rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting room rate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;