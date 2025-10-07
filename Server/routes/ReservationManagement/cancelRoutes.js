const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../../models/ReservationManagement/Booking');
const Room = require('../../models/RoomManaagemnt/Room'); 
const Cancellation = require('../../models/ReservationManagement/Cancellation'); 

const router = express.Router();

// Cancellation policies
const cancellationPolicies = {
  flexible: { refundPercentage: 100, minHoursBefore: 24, penaltyFee: 0 },
  moderate: { refundPercentage: 50, minHoursBefore: 48, penaltyFee: 25 },
  strict: { refundPercentage: 25, minHoursBefore: 168, penaltyFee: 50 },
  'non-refundable': { refundPercentage: 0, minHoursBefore: 0, penaltyFee: 0 },
};

// Calculate refund based on policy
const calculateRefund = (booking, reason) => {
  const policy = cancellationPolicies[booking.cancellationPolicy] || cancellationPolicies['flexible'];
  const checkInDate = new Date(booking.checkInDate);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

  if (['medical-emergency', 'hotel-maintenance', 'overbooking'].includes(reason)) {
    return {
      refund: booking.totalAmount * 0.9,
      penalty: booking.totalAmount * 0.1,
    };
  }

  if (reason === 'no-show' && hoursUntilCheckIn < 0) {
    return {
      refund: 0,
      penalty: booking.totalAmount,
    };
  }

  if (hoursUntilCheckIn >= policy.minHoursBefore) {
    return {
      refund: booking.totalAmount * (policy.refundPercentage / 100),
      penalty: policy.penaltyFee,
    };
  } else {
    return {
      refund: Math.max(0, booking.totalAmount * (policy.refundPercentage / 100) - policy.penaltyFee),
      penalty: policy.penaltyFee,
    };
  }
};

// Get all
router.get('/', async (req, res) => {
  try {
    const cancellations = await Cancellation.find()
      .populate({
        path: 'originalBookingId',
        model: 'Booking',
        select: 'id bookingReference guestName guestEmail guestPhone roomId checkInDate checkOutDate guests totalAmount splitStays'
      })
      .sort({ createdAt: -1 });
    
    res.json(cancellations);
  } catch (err) {
    console.error('Error fetching cancellations:', err);
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking
router.post('/cancel/:id', async (req, res) => {
  try {
    const { reason, reasonNote, refundMethod } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'checked-in') {
      return res.status(400).json({ message: 'Booking cannot be cancelled in current status' });
    }

    const refundCalc = calculateRefund(booking, reason);
    
    const cancellation = new Cancellation({
      id: `C${String((await Cancellation.countDocuments()) + 1).padStart(3, '0')}`,
      originalBookingId: booking._id,
      type: 'cancellation',
      reason,
      reasonNote,
      refundAmount: refundCalc.refund,
      penaltyFee: refundCalc.penalty,
      refundMethod,
      status: 'pending',
      processedBy: req.user?.name || 'System', 
      cancellationDate: new Date(),
    });

    await cancellation.save();

    // Update booking status
    await Booking.findOneAndUpdate(
      { id: booking.id },
      { 
        status: 'cancelled',
        refundAmount: refundCalc.refund,
        penaltyFee: refundCalc.penalty
      },
      { new: true }
    );

    // Update room status
    const roomUpdate = {
      occupancyStatus: 'vacant',
      status: 'clean',
      guestName: null,
      checkInDate: null,
      expectedCheckOut: null,
    };

    if (booking.roomId) {
      await Room.findOneAndUpdate({ id: booking.roomId }, roomUpdate);
    } else if (booking.splitStays && booking.splitStays.length > 0) {
      for (const stay of booking.splitStays) {
        await Room.findOneAndUpdate({ id: stay.roomId }, roomUpdate);
      }
    }

    // Populate the booking data for the response
    await cancellation.populate({
      path: 'originalBookingId',
      model: 'Booking',
      select: 'id bookingReference guestName guestEmail guestPhone roomId checkInDate checkOutDate guests totalAmount splitStays'
    });

      try {
        const updateRestaurantAnalytics = require('../../models/Restaurant&BarManagement/updateAnalytics');
        await updateRestaurantAnalytics({
          items: [],
          amount: 0,
          prepTime: 0,
          barDrinks: [],
        });
      } catch (err) {
        console.error('Analytics update failed (cancellation):', err.message);
      }
      res.status(201).json(cancellation);
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(400).json({ message: err.message });
  }
});

// Mark as no-show
router.post('/noshow/:id', async (req, res) => {
  try {
    const { contactAttempts, lastContactTime, notes } = req.body;
    
    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'checked-in') {
      return res.status(400).json({ message: 'Booking cannot be marked as no-show in current status' });
    }

    const refundCalc = calculateRefund(booking, 'no-show');
    
    // Create no-show record
    const noShow = new Cancellation({
      id: `NS${String((await Cancellation.countDocuments()) + 1).padStart(3, '0')}`,
      originalBookingId: booking._id,
      type: 'no-show',
      contactAttempts: contactAttempts || 0,
      lastContactTime: lastContactTime ? new Date(lastContactTime) : new Date(),
      notes,
      refundAmount: refundCalc.refund,
      penaltyFee: refundCalc.penalty,
      status: 'confirmed',
      processedBy: req.user?.name || 'System',
      noShowDate: new Date(),
    });

    await noShow.save();

    await Booking.findOneAndUpdate(
      { id: booking.id },
      { 
        status: 'no-show',
        refundAmount: refundCalc.refund,
        penaltyFee: refundCalc.penalty
      },
      { new: true }
    );

    // Update room status
    const roomUpdate = {
      occupancyStatus: 'vacant',
      status: 'clean',
      guestName: null,
      checkInDate: null,
      expectedCheckOut: null,
    };

    if (booking.roomId) {
      await Room.findOneAndUpdate({ id: booking.roomId }, roomUpdate);
    } else if (booking.splitStays && booking.splitStays.length > 0) {
      for (const stay of booking.splitStays) {
        await Room.findOneAndUpdate({ id: stay.roomId }, roomUpdate);
      }
    }

    await noShow.populate({
      path: 'originalBookingId',
      model: 'Booking',
      select: 'id bookingReference guestName guestEmail guestPhone roomId checkInDate checkOutDate guests totalAmount splitStays'
    });

      try {
        const updateRestaurantAnalytics = require('../../models/Restaurant&BarManagement/updateAnalytics');
        await updateRestaurantAnalytics({
          items: [],
          amount: 0,
          prepTime: 0,
          barDrinks: [],
        });
      } catch (err) {
        console.error('Analytics update failed (no-show):', err.message);
      }
      res.status(201).json(noShow);
  } catch (err) {
    console.error('Error marking no-show:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;