const express = require('express');
const RoomAvailability = require('../../models/RoomManaagemnt/RoomAvailability');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const availabilities = await RoomAvailability.find().sort({ createdAt: -1 });
    res.json(availabilities);
  } catch (err) {
    console.error('Error fetching room availabilities:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const availability = await RoomAvailability.findOne({ roomId: req.params.roomId });
    if (!availability) return res.status(404).json({ message: 'Room availability not found' });
    res.json(availability);
  } catch (err) {
    console.error('Error fetching room availability:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const availabilityData = req.body;
    const availability = new RoomAvailability(availabilityData);
    await availability.save();
    res.status(201).json(availability);
  } catch (err) {
    console.error('Error creating room availability:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

router.put('/:roomId', async (req, res) => {
  try {
    const availability = await RoomAvailability.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: { availability: req.body.availability } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(availability);
  } catch (err) {
    console.error('Error updating room availability:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

router.delete('/:roomId', async (req, res) => {
  try {
    const availability = await RoomAvailability.findOneAndDelete({ roomId: req.params.roomId });
    if (!availability) return res.status(404).json({ message: 'Room availability not found' });
    res.json({ message: 'Room availability deleted successfully' });
  } catch (err) {
    console.error('Error deleting room availability:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
