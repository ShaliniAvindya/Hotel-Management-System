const express = require('express');
const Booking = require('../../models/ReservationManagement/Booking');
const Room = require('../../models/RoomManaagemnt/Room');

const router = express.Router();

// Check-in a guest
router.put('/checkin/:id', async (req, res) => {
  try {
    const checkInData = req.body;
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      {
        status: 'checked-in',
        actualCheckInTime: checkInData.actualCheckInTime,
        checkInNotes: checkInData.notes,
        keyCardNumber: checkInData.keyCardNumber,
        depositAmount: checkInData.depositAmount,
        isEarlyCheckIn: checkInData.isEarlyCheckIn || false
      },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update room status to occupied
    const roomUpdate = {
      occupancyStatus: 'occupied',
      guestName: booking.guestName,
      checkInDate: booking.checkInDate,
      expectedCheckOut: booking.checkOutDate
    };
    if (booking.roomId) {
      await Room.findOneAndUpdate(
        { id: booking.roomId },
        roomUpdate
      );
    } else if (booking.splitStays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const currentStay = booking.splitStays.find(
        stay => stay.checkIn.toISOString().split('T')[0] <= today && stay.checkOut.toISOString().split('T')[0] >= today
      );
      if (currentStay) {
        await Room.findOneAndUpdate(
          { id: currentStay.roomId },
          roomUpdate
        );
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Check-out a guest
router.put('/checkout/:id', async (req, res) => {
  try {
    const checkOutData = req.body;
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      {
        status: 'checked-out',
        actualCheckOutTime: checkOutData.actualCheckOutTime,
        checkOutNotes: checkOutData.notes,
        damageCharges: checkOutData.damageCharges,
        minibarCharges: checkOutData.minibarCharges,
        additionalServices: checkOutData.additionalServices,
        finalAmount: checkOutData.finalAmount,
        refundAmount: checkOutData.refundAmount,
        isLateCheckOut: checkOutData.isLateCheckOut || false
      },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update room status to cleaning
    const roomUpdate = {
      occupancyStatus: 'vacant',
      status: 'cleaning',
      guestName: null,
      checkInDate: null,
      expectedCheckOut: null,
      lastCheckOut: new Date()
    };
    if (booking.roomId) {
      await Room.findOneAndUpdate(
        { id: booking.roomId },
        roomUpdate
      );
    } else if (booking.splitStays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const currentStay = booking.splitStays.find(
        stay => stay.checkIn.toISOString().split('T')[0] <= today && stay.checkOut.toISOString().split('T')[0] >= today
      );
      if (currentStay) {
        await Room.findOneAndUpdate(
          { id: currentStay.roomId },
          roomUpdate
        );
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;