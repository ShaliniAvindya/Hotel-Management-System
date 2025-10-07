const express = require('express');
const RoomMaintenance = require('../../models/RoomManaagemnt/maintenance');

const router = express.Router();

// GET all
router.get('/', async (req, res) => {
  try {
    const tickets = await RoomMaintenance.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching maintenance tickets:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await RoomMaintenance.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await RoomMaintenance.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error('Error fetching maintenance ticket:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST new maintenance ticket
router.post('/', async (req, res) => {
  try {
    const ticketData = req.body;
    let newId;
    let attempts = 0;
    do {
      const lastTicket = await RoomMaintenance.findOne().sort({ createdAt: -1 });
      const lastId = lastTicket ? parseInt(lastTicket.id.slice(2)) : 0;
      newId = `MT${String(lastId + 1 + attempts).padStart(3, '0')}`;
      attempts++;
    } while (await RoomMaintenance.exists({ id: newId }));
    ticketData.id = newId;
    const ticket = new RoomMaintenance(ticketData);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.error('Error creating maintenance ticket:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

// PUT 
router.put('/:id', async (req, res) => {
  try {
    const ticket = await RoomMaintenance.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error('Error updating maintenance ticket:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ticket = await RoomMaintenance.findOneAndDelete({ id: req.params.id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting maintenance ticket:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
