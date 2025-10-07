const express = require('express');
const Booking = require('../../models/ReservationManagement/Booking');
const Room = require('../../models/RoomManaagemnt/Room');
const Guest = require('../../models/ReservationManagement/Guest');
const RoomAvailability = require('../../models/RoomManaagemnt/RoomAvailability');

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    if (!bookingData.firstName) {
      return res.status(400).json({ message: 'Guest first name is required' });
    }

    if (!bookingData.id) {
      const allIds = await Booking.find({}, { id: 1, _id: 0 });
      let maxIdNum = 0;
      allIds.forEach(b => {
        if (b.id && /^B\d+$/.test(b.id)) {
          const num = parseInt(b.id.slice(1));
          if (num > maxIdNum) maxIdNum = num;
        }
      });
      bookingData.id = `B${String(maxIdNum + 1).padStart(3, '0')}`;
    }
    if (!bookingData.bookingReference) {
      bookingData.bookingReference = `HTL2024${String(Math.random()).slice(2, 8)}`;
    }

    let guestId = bookingData.guestId; 
    let guest = await Guest.findOne({ $or: [{ email: bookingData.guestEmail }, { phone: bookingData.guestPhone }] });
    if (!guest) {
      console.log('Creating new guest for:', bookingData.guestEmail, bookingData.guestPhone);
      const newGuestData = {
        firstName: bookingData.firstName || 'Unknown',
        lastName: bookingData.lastName || 'Guest',
        email: bookingData.guestEmail || '',
        phone: bookingData.guestPhone || '',
        address: '',
        nationality: '',
        idType: 'passport',
        idNumber: '',
        dateOfBirth: '',
        vipLevel: 'none',
        status: 'active',
        preferences: [],
        specialRequests: bookingData.specialRequests ? [bookingData.specialRequests] : [],
        emergencyContact: { name: '', phone: '', relationship: '' },
        notes: '',
        totalStays: 1,
        totalSpent: bookingData.totalAmount || 0,
        lastStay: bookingData.checkOutDate,
        stayHistory: [{
          id: bookingData.id,
          roomId: bookingData.roomId,
          roomNumber: (await Room.findOne({ id: bookingData.roomId }))?.roomNumber || '',
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          amount: bookingData.totalAmount || 0,
          status: bookingData.status
        }],
        createdDate: new Date(),
      };
      const allGuestIds = await Guest.find({}, { id: 1, _id: 0 });
      let maxGuestIdNum = 0;
      allGuestIds.forEach(g => {
        if (g.id && /^G\d+$/.test(g.id)) {
          const num = parseInt(g.id.slice(1));
          if (num > maxGuestIdNum) maxGuestIdNum = num;
        }
      });
      newGuestData.id = `G${String(maxGuestIdNum + 1).padStart(3, '0')}`;
      try {
        guest = new Guest(newGuestData);
        await guest.save();
        console.log('New guest saved:', guest.id);
      } catch (err) {
        console.error('Failed to save guest:', err.message);
        return res.status(400).json({ message: 'Failed to create guest', error: err.message });
      }
    } else {
      // Update existing guest
      console.log('Updating existing guest:', guest.id);
      guest.totalStays += 1;
      guest.totalSpent += bookingData.totalAmount || 0;
      guest.lastStay = bookingData.checkOutDate > guest.lastStay ? bookingData.checkOutDate : guest.lastStay;
      guest.stayHistory.push({
        id: bookingData.id,
        roomId: bookingData.roomId,
        roomNumber: (await Room.findOne({ id: bookingData.roomId }))?.roomNumber || '',
        checkIn: bookingData.checkInDate,
        checkOut: bookingData.checkOutDate,
        amount: bookingData.totalAmount || 0,
        status: bookingData.status
      });
      try {
        await guest.save();
        console.log('Guest updated:', guest.id);
      } catch (err) {
        console.error('Failed to update guest:', err.message);
        return res.status(400).json({ message: 'Failed to update guest', error: err.message });
      }
    }
    bookingData.guestId = guest.id;

    // Validate room availability
    if (!bookingData.splitStays || bookingData.splitStays.length === 0) {
      const room = await Room.findOne({ id: bookingData.roomId });
      if (!room) return res.status(404).json({ message: 'Room not found' });
      const isAvailable = await checkRoomAvailability(bookingData.roomId, bookingData.checkInDate, bookingData.checkOutDate);
      if (!isAvailable) return res.status(400).json({ message: 'Room is not available for the selected dates' });
    } else {
      for (const stay of bookingData.splitStays) {
        const room = await Room.findOne({ id: stay.roomId });
        if (!room) return res.status(404).json({ message: `Room ${stay.roomId} not found` });
        const isAvailable = await checkRoomAvailability(stay.roomId, stay.checkIn, stay.checkOut);
        if (!isAvailable) return res.status(400).json({ message: `Room ${stay.roomId} is not available for the selected dates` });
      }
    }

    const booking = new Booking(bookingData);
    await booking.save();
    console.log('Booking created:', booking.id, 'with guestId:', guest.id);
      try {
        const updateRestaurantAnalytics = require('../../models/Restaurant&BarManagement/updateAnalytics');
        await updateRestaurantAnalytics({
          amount: bookingData.totalAmount,
          items: bookingData.items || [],
          prepTime: bookingData.prepTime || 0,
          barDrinks: bookingData.barDrinks || []
        });
      } catch (err) {
        console.error('Analytics update failed:', err.message);
      }

    await updateRoomAvailabilityForBooking(booking);

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const bookingData = req.body;
    const existingBooking = await Booking.findOne({ id: req.params.id });
    if (!existingBooking) return res.status(404).json({ message: 'Booking not found' });

    let guest = await Guest.findOne({ id: existingBooking.guestId });
    if (guest) {
      if (
        bookingData.firstName !== existingBooking.firstName ||
        bookingData.lastName !== existingBooking.lastName ||
        bookingData.guestEmail !== existingBooking.guestEmail ||
        bookingData.guestPhone !== existingBooking.guestPhone
      ) {
        guest.firstName = bookingData.firstName || 'Unknown';
        guest.lastName = bookingData.lastName || 'Guest';
        guest.email = bookingData.guestEmail || '';
        guest.phone = bookingData.guestPhone || '';
      }
      const stayIndex = guest.stayHistory.findIndex(s => s.id === req.params.id);
      if (stayIndex !== -1) {
        const oldAmount = guest.stayHistory[stayIndex].amount;
        const room = await Room.findOne({ id: bookingData.roomId });
        guest.totalSpent = guest.totalSpent - oldAmount + (bookingData.totalAmount || 0);
        guest.lastStay = bookingData.checkOutDate > guest.lastStay ? bookingData.checkOutDate : guest.lastStay;
        guest.stayHistory[stayIndex] = {
          id: req.params.id, 
          roomId: bookingData.roomId || existingBooking.roomId, 
          roomNumber: room?.roomNumber || '', 
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          amount: bookingData.totalAmount || 0,
          status: bookingData.status
        };
        await guest.save();
      }
    }

    if (!bookingData.splitStays || bookingData.splitStays.length === 0) {
      const room = await Room.findOne({ id: bookingData.roomId });
      if (!room) return res.status(404).json({ message: 'Room not found' });
      const isAvailable = await checkRoomAvailability(bookingData.roomId, bookingData.checkInDate, bookingData.checkOutDate, req.params.id);
      if (!isAvailable) return res.status(400).json({ message: 'Room is not available for the selected dates' });
    } else {
      for (const stay of bookingData.splitStays) {
        const room = await Room.findOne({ id: stay.roomId });
        if (!room) return res.status(404).json({ message: `Room ${stay.roomId} not found` });
        const isAvailable = await checkRoomAvailability(stay.roomId, stay.checkIn, stay.checkOut, req.params.id);
        if (!isAvailable) return res.status(400).json({ message: `Room ${stay.roomId} is not available for the selected dates` });
      }
    }

    const booking = await Booking.findOneAndUpdate({ id: req.params.id }, bookingData, { new: true });
    await updateRoomAvailabilityForBooking(booking);
    res.json(booking);
  } catch (err) {
    console.error('Error updating booking:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.guestId) {
      const guest = await Guest.findOne({ id: booking.guestId });
      if (guest) {
        guest.totalStays -= 1;
        guest.totalSpent -= booking.totalAmount;
        const stayIndex = guest.stayHistory.findIndex(s => s.id === req.params.id);
        if (stayIndex !== -1) {
          guest.stayHistory[stayIndex].status = 'cancelled';
        }
        if (guest.stayHistory.length > 0) {
          guest.lastStay = guest.stayHistory.reduce((latest, stay) => {
            return stay.checkOut > latest && stay.status !== 'cancelled' ? stay.checkOut : latest;
          }, new Date(0));
        } else {
          guest.lastStay = null;
        }
        await guest.save();
      }
    }

    await updateRoomAvailabilityForBooking(booking);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check room availability
async function checkRoomAvailability(roomId, checkIn, checkOut, excludeBookingId = null) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const bookings = await Booking.find({
    status: { $ne: 'cancelled' },
    $or: [
      {
        roomId,
        checkInDate: { $lt: end },
        checkOutDate: { $gt: start }
      },
      {
        splitStays: {
          $elemMatch: {
            roomId,
            checkIn: { $lt: end },
            checkOut: { $gt: start }
          }
        }
      }
    ]
  });
  return !bookings.some((booking) => {
    if (excludeBookingId && (booking.id === excludeBookingId || booking._id.toString() === excludeBookingId)) return false;
    if (booking.roomId === roomId) {
      const bookingStart = new Date(booking.checkInDate);
      const bookingEnd = new Date(booking.checkOutDate);
      if (start < bookingEnd && end > bookingStart) return true;
    }
    return booking.splitStays.some(
      (stay) =>
        stay.roomId === roomId &&
        new Date(stay.checkIn) < end &&
        new Date(stay.checkOut) > start
    );
  });
}

async function updateRoomAvailabilityForBooking(booking) {
  const updateForRoom = async (roomId, checkIn, checkOut, status) => {
    const availability = await RoomAvailability.findOne({ roomId });
    let availabilityData = availability ? availability.availability : [];

    let currentDate = new Date(checkIn);
    while (currentDate < new Date(checkOut)) {
      const dateKey = currentDate.toISOString().split('T')[0];
      availabilityData = availabilityData.filter(entry => entry.date !== dateKey);
      availabilityData.push({ date: dateKey, status: status });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await RoomAvailability.updateOne(
      { roomId },
      { availability: availabilityData },
      { upsert: true }
    );
  };

  if (booking.splitStays.length > 0) {
    for (const stay of booking.splitStays) {
      await updateForRoom(stay.roomId, stay.checkIn, stay.checkOut, booking.status === 'confirmed' ? 'reserved' : booking.status === 'checked-in' ? 'occupied' : booking.status === 'checked-out' ? 'checkout' : 'available');
    }
  } else {
    await updateForRoom(booking.roomId, booking.checkInDate, booking.checkOutDate, booking.status === 'confirmed' ? 'reserved' : booking.status === 'checked-in' ? 'occupied' : booking.status === 'checked-out' ? 'checkout' : 'available');
  }
}

module.exports = router;