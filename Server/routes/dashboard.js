const express = require('express');
const Booking = require('../models/ReservationManagement/Booking');
const Order = require('../models/Restaurant&BarManagement/orders');
const Room = require('../models/RoomManaagemnt/Room');
const RoomMaintenance = require('../models/RoomManaagemnt/maintenance');
const StaffMember = require('../models/RoomManaagemnt/staffMember');
const { Payment } = require('../models/Billing');

const router = express.Router();

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildLastDays = (days = 30) => {
  const map = {};
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    map[key] = 0;
  }
  return map;
};

router.get('/summary', async (req, res) => {
  try {
    const today = startOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const [
      totalRooms,
      occupiedRooms,
      cleaningRooms,
      maintenanceRooms,
      todaysBookings,
      totalBookings,
      activeOrders,
      totalOrders,
      pendingOrders,
      pendingMaintenance,
      staffCount,
      recentBookings,
      recentOrders,
      recentMaintenance,
      rooms,
      bookingsByDay,
      paymentsRevenue,
      ordersRevenue,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ $or: [{ occupancyStatus: 'occupied' }, { status: 'occupied' }] }),
      Room.countDocuments({ status: 'cleaning' }),
      Room.countDocuments({ status: 'maintenance' }),
      Booking.countDocuments({ checkInDate: { $gte: today, $lt: tomorrow } }),
      Booking.countDocuments(),
      Order.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      RoomMaintenance.countDocuments({ status: { $nin: ['resolved', 'completed', 'cancelled'] } }),
      StaffMember.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('id bookingReference firstName lastName guestId guestName roomId roomNumber checkInDate checkOutDate status createdAt')
        .lean(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .select('id status table tableId customerName orderNumber total amount createdAt')
        .lean(),
      RoomMaintenance.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('id _id title issue room roomId roomNumber status resolved createdAt')
        .lean(),
      Room.find()
        .sort({ roomNumber: 1 })
        .select('id _id roomNumber name type status occupancyStatus')
        .lean(),
      Booking.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);

    const bookingsSeriesMap = buildLastDays(30);
    bookingsByDay.forEach((entry) => {
      if (entry._id in bookingsSeriesMap) bookingsSeriesMap[entry._id] = entry.count;
    });

    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms: Math.max(totalRooms - occupiedRooms, 0),
      cleaningRooms,
      maintenanceRooms,
      todaysBookings,
      totalBookings,
      activeOrders,
      totalOrders,
      pendingOrders,
      pendingMaintenance,
      staffCount,
      revenueFromPayments: paymentsRevenue[0]?.total || 0,
      revenueFromOrders: ordersRevenue[0]?.total || 0,
      bookingsSeries: Object.entries(bookingsSeriesMap).map(([date, count]) => ({ date, count })),
      rooms,
      recentBookings,
      recentOrders,
      recentMaintenance,
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
