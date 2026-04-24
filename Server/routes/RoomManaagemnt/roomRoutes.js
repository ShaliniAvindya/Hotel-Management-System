const express = require('express');
const Room = require('../../models/RoomManaagemnt/Room');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || '-createdAt';
    const fields = req.query.fields; // comma-separated list

    const q = Room.find();
    if (fields) q.select(fields.split(',').join(' '));
    const rooms = await q.sort(sort).skip(skip).limit(limit).lean();

    // Keep backward compatible response (array), expose paging via headers.
    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(rooms.length));
    res.setHeader('Cache-Control', 'private, max-age=10');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const roomData = req.body;
    if (!roomData.id) {
      const lastRoom = await Room.findOne().sort({ createdAt: -1 }).select('id').lean();
      const lastId = lastRoom ? parseInt(lastRoom.id.slice(1)) : 0;
      roomData.id = `R${String(lastId + 1).padStart(3, '0')}`;
    }
    const room = new Room(roomData);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findOne({ id: req.params.id }).lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ id: req.params.id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
