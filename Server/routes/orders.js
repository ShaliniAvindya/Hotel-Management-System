const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  const orders = await Order.find().populate('guest items.menuItem');
  res.json(orders);
});

router.post('/', async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json(order);
});

router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(order);
});

router.delete('/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted' });
});

module.exports = router;
