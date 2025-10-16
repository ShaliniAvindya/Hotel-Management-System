const express = require('express');
const Booking = require('../models/ReservationManagement/Booking');
const Order = require('../models/Restaurant&BarManagement/orders');
const Room = require('../models/RoomManaagemnt/Room');
const { Payment } = require('../models/Billing');

const router = express.Router();

// Stream CSV for analytics
router.get('/analytics', async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  if (format !== 'csv') return res.status(400).json({ message: 'Only csv format supported' });

  try {
    res.setHeader('Content-Type', 'text/csv');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${ts}.csv"`);

    res.write('metric,value\n');
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPayments = await Payment.countDocuments();
    res.write(`totalRooms,${totalRooms}\n`);
    res.write(`totalBookings,${totalBookings}\n`);
    res.write(`totalOrders,${totalOrders}\n`);
    res.write(`totalPayments,${totalPayments}\n`);
    res.write('\n');

    // Stream Bookings header then rows
    res.write('Bookings\n');
    res.write('id,guest,roomId,checkInDate,checkOutDate,status,totalAmount,createdAt\n');
    const bookingsCursor = Booking.find().cursor();
    for await (const b of bookingsCursor) {
      const line = [
        b.id || '',
        (b.firstName && b.lastName) ? `${b.firstName} ${b.lastName}` : (b.guestId || ''),
        b.roomId || '',
        b.checkInDate ? new Date(b.checkInDate).toISOString() : '',
        b.checkOutDate ? new Date(b.checkOutDate).toISOString() : '',
        b.status || '',
        b.totalAmount || '',
        b.createdAt ? new Date(b.createdAt).toISOString() : ''
      ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') + '\n';
      if (!res.write(line)) await new Promise(r => res.once('drain', r));
    }
    res.write('\n');

    res.write('Orders\n');
    res.write('id,type,customerName,tableId,roomId,total,createdAt\n');
    const ordersCursor = Order.find().cursor();
    for await (const o of ordersCursor) {
      const line = [o.id || '', o.type || '', o.customerName || '', o.tableId || '', o.roomId || '', o.total || '', o.createdAt ? new Date(o.createdAt).toISOString() : '']
        .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') + '\n';
      if (!res.write(line)) await new Promise(r => res.once('drain', r));
    }
    res.write('\n');

    // Stream Payments
    res.write('Payments\n');
    res.write('id,reservationId,amount,type,method,status,date,reference\n');
    const paymentsCursor = Payment.find().cursor();
    for await (const p of paymentsCursor) {
      const line = [p.id || '', p.reservationId || '', p.amount || '', p.type || '', p.method || '', p.status || '', p.date ? new Date(p.date).toISOString() : '', p.reference || '']
        .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') + '\n';
      if (!res.write(line)) await new Promise(r => res.once('drain', r));
    }

    res.end();
  } catch (err) {
    console.error('Export stream error', err);
    if (!res.headersSent) res.status(500).json({ message: 'Export failed' });
    else res.end();
  }
});

module.exports = router;
