const express = require('express');
const router = express.Router();
const Order = require('../../models/Restaurant&BarManagement/orders');

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || '-createdAt';
    const fields = req.query.fields; // comma-separated list
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const q = Order.find(filter);
    if (fields) q.select(fields.split(',').join(' '));
    const orders = await q.sort(sort).skip(skip).limit(limit).lean();

    // Backward compatible response (array), paging via headers.
    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(orders.length));
    res.setHeader('Cache-Control', 'private, max-age=10');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const order = new Order(req.body);
  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
