const express = require('express');
const mongoose = require('mongoose');
const SpecialRequest = require('../../models/ReservationManagement/SpecialRequest');
const Booking = require('../../models/ReservationManagement/Booking');
const Room = require('../../models/RoomManaagemnt/Room');

const router = express.Router();

// Get all
router.get('/', async (req, res) => {
  try {
    const requests = await SpecialRequest.find();
    res.json(requests);
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
      console.error('Analytics update failed (special request):', err.message);
    }
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await SpecialRequest.findOne({ id: req.params.id });
    if (!request) return res.status(404).json({ message: 'Special request not found' });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new request
router.post('/', async (req, res) => {
  try {
    const { bookingId, type, title, description, status, dueDate, assignedTo, notes } = req.body;
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let roomNumber = '';
    if (booking.roomId) {
      const room = await Room.findOne({ id: booking.roomId });
      if (!room) return res.status(404).json({ message: 'Room not found' });
      roomNumber = room.roomNumber;
    } else if (booking.splitStays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const currentStay = booking.splitStays.find(
        (stay) => stay.checkIn.toISOString().split('T')[0] <= today && stay.checkOut.toISOString().split('T')[0] >= today
      );
      if (currentStay) {
        const room = await Room.findOne({ id: currentStay.roomId });
        if (!room) return res.status(404).json({ message: 'Room not found for split stay' });
        roomNumber = room.roomNumber;
      } else {
        roomNumber = 'Multiple Rooms';
      }
    }

    const requestCount = await SpecialRequest.countDocuments();
    const newRequest = new SpecialRequest({
      id: `SR${String(requestCount + 1).padStart(3, '0')}`,
      bookingId,
      guestName: booking.guestName,
      roomNumber,
      type,
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo,
      notes,
      createdBy: 'Staff',
      requestDate: new Date(),
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a request
router.put('/:id', async (req, res) => {
  try {
    const { bookingId, type, title, description, status, dueDate, assignedTo, notes } = req.body;
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let roomNumber = '';
    if (booking.roomId) {
      const room = await Room.findOne({ id: booking.roomId });
      if (!room) return res.status(404).json({ message: 'Room not found' });
      roomNumber = room.roomNumber;
    } else if (booking.splitStays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const currentStay = booking.splitStays.find(
        (stay) => stay.checkIn.toISOString().split('T')[0] <= today && stay.checkOut.toISOString().split('T')[0] >= today
      );
      if (currentStay) {
        const room = await Room.findOne({ id: currentStay.roomId });
        if (!room) return res.status(404).json({ message: 'Room not found for split stay' });
        roomNumber = room.roomNumber;
      } else {
        roomNumber = 'Multiple Rooms';
      }
    }

    const updatedRequest = await SpecialRequest.findOneAndUpdate(
      { id: req.params.id },
      {
        bookingId,
        guestName: booking.guestName,
        roomNumber,
        type,
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        notes,
      },
      { new: true }
    );

    if (!updatedRequest) return res.status(404).json({ message: 'Special request not found' });
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedRequest = await SpecialRequest.findOneAndDelete({ id: req.params.id });
    if (!deletedRequest) return res.status(404).json({ message: 'Special request not found' });
    res.json({ message: 'Special request deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;