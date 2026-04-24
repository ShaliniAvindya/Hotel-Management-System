const express = require('express');
const router = express.Router();
const Menu = require('../../models/Restaurant&BarManagement/menu');

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 500, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || 'category name';
    const fields = req.query.fields; // comma-separated list

    const q = Menu.find();
    if (fields) q.select(fields.split(',').join(' '));
    const items = await q.sort(sort).skip(skip).limit(limit).lean();

    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(items.length));
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const item = new Menu(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
