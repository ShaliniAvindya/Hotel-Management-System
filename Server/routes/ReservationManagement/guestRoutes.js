const express = require('express');
const Guest = require('../../models/ReservationManagement/Guest');

const router = express.Router();

// Get all guests
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdDate: -1 });
    res.json(guests);
  } catch (err) {
    try {
      const updateRestaurantAnalytics = require('../../models/Restaurant&BarManagement/updateAnalytics');
      await updateRestaurantAnalytics({
        items: [],
        amount: 0,
        prepTime: 0,
        barDrinks: [],
      });
    } catch (err) {
      console.error('Analytics update failed (guest):', err.message);
    }
    res.status(500).json({ message: err.message });
  }
});

// Create a new guest
router.post('/', async (req, res) => {
  try {
    const guestData = req.body;
    if (!guestData.id) {
      const allIds = await Guest.find({}, { id: 1, _id: 0 });
      let maxIdNum = 0;
      allIds.forEach(g => {
        if (g.id && /^G\d+$/.test(g.id)) {
          const num = parseInt(g.id.slice(1));
          if (num > maxIdNum) maxIdNum = num;
        }
      });
      guestData.id = `G${String(maxIdNum + 1).padStart(3, '0')}`;
    }
    const existing = await Guest.findOne({ $or: [{ email: guestData.email }, { phone: guestData.phone }] });
    if (existing) return res.status(400).json({ message: 'Guest with this email or phone already exists' });

    const guest = new Guest(guestData);
    await guest.save();
    res.status(201).json(guest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findOne({ id: req.params.id });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a guest
router.put('/:id', async (req, res) => {
  try {
    const guestData = req.body;
    const guest = await Guest.findOneAndUpdate({ id: req.params.id }, guestData, { new: true });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a guest
router.delete('/:id', async (req, res) => {
  try {
    const guest = await Guest.findOneAndDelete({ id: req.params.id });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json({ message: 'Guest deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;