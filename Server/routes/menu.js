const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

router.get('/', async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
});

router.post('/', async (req, res) => {
  const item = new MenuItem(req.body);
  await item.save();
  res.status(201).json(item);
});

router.put('/:id', async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Menu item deleted' });
});

module.exports = router;
