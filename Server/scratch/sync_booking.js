const mongoose = require('mongoose');
const Booking = require('../models/ReservationManagement/Booking');
const { syncBookingCreated } = require('../services/apaleoSyncService');
require('dotenv').config({ path: '../.env' });

async function syncExistingBooking(bookingId) {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-management-system');
    console.log('Connected to MongoDB');

    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      console.error(`Booking ${bookingId} not found`);
      return;
    }

    if (booking.apaleoReservationId) {
      console.log(`Booking ${bookingId} already has Apaleo ID: ${booking.apaleoReservationId}`);
      // return; // Let's try anyway if the user says it's not showing
    }

    console.log(`Syncing booking ${bookingId} to Apaleo...`);
    await syncBookingCreated(booking);
    
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

const bookingId = process.argv[2] || 'B013';
syncExistingBooking(bookingId);
