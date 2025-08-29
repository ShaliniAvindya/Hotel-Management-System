const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

router.get('/', async (req, res) => {
  const reservations = await Reservation.find().populate('guest room');
  res.json(reservations);
});

router.post('/', async (req, res) => {
  const reservation = new Reservation(req.body);
  await reservation.save();
  res.status(201).json(reservation);
});

router.put('/:id', async (req, res) => {
  const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(reservation);
});

router.delete('/:id', async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Reservation deleted' });
});

module.exports = router;
