const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

// GET /api/reservations
router.get('/reservations', async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const query = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { guest: new RegExp(search, 'i') },
        { reservationId: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const reservations = await Reservation.find(query).sort({ time: 1 });

    const formattedReservations = reservations.map((r) => ({
      id: r.reservationId,
      guest: r.guest,
      email: r.email,
      phone: r.phone,
      table: r.table,
      tableCapacity: r.tableCapacity,
      date: r.date.toISOString().split('T')[0],
      time: r.time,
      duration: r.duration,
      party: r.party,
      status: r.status,
      notes: r.notes,
      specialRequests: r.specialRequests,
      loyaltyMember: r.loyaltyMember,
      createdAt: r.createdAt.toISOString(),
      source: r.source,
      deposit: r.deposit,
      allergies: r.allergies,
      previousVisits: r.previousVisits,
    }));

    res.json(formattedReservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reservations
router.post('/reservations', async (req, res) => {
  try {
    const { guest, email, phone, table, date, time, party, notes, specialRequests, deposit, allergies, source } = req.body;

    // Static table data for validation
    const allTables = [
      { id: 'T1', capacity: 2, location: 'Window' },
      { id: 'T2', capacity: 2, location: 'Window' },
      { id: 'T3', capacity: 4, location: 'Main Hall' },
      { id: 'T4', capacity: 4, location: 'Main Hall' },
      { id: 'T5', capacity: 6, location: 'Private Room' },
      { id: 'T6', capacity: 6, location: 'Private Room' },
      { id: 'T7', capacity: 8, location: 'Patio' },
      { id: 'T8', capacity: 8, location: 'Patio' },
    ];

    let tableId = table;
    let tableCapacity = 0;
    if (!tableId) {
      // Auto-assign table
      const availableTable = allTables.find((t) => {
        if (t.capacity < party) return false;
        const isReserved = Reservation.findOne({
          date: new Date(date),
          time,
          table: t.id,
          status: { $in: ['pending', 'confirmed', 'seated'] },
        });
        return !isReserved;
      });

      if (!availableTable) return res.status(400).json({ error: 'No available table for the party size' });
      tableId = availableTable.id;
      tableCapacity = availableTable.capacity;
    } else {
      const selectedTable = allTables.find((t) => t.id === tableId);
      if (!selectedTable) return res.status(400).json({ error: 'Invalid table selected' });
      
      const isReserved = await Reservation.findOne({
        date: new Date(date),
        time,
        table: tableId,
        status: { $in: ['pending', 'confirmed', 'seated'] },
      });
      
      if (isReserved) return res.status(400).json({ error: 'Selected table is already reserved' });
      tableCapacity = selectedTable.capacity;
    }

    const reservation = new Reservation({
      reservationId: `RSV${Date.now()}`,
      guest,
      email,
      phone,
      table: tableId,
      tableCapacity,
      date: new Date(date),
      time,
      duration: 120,
      party,
      status: 'pending',
      notes,
      specialRequests: specialRequests || [],
      loyaltyMember: false,
      source: source || 'online',
      deposit: deposit || 0,
      allergies: allergies || [],
      previousVisits: 0,
      createdBy: null,
    });

    await reservation.save();

    const notification = new Notification({
      type: 'reservation',
      message: `New reservation created for ${guest}`,
      details: `${guest} - Table ${tableId}, ${time}`,
      relatedId: reservation._id,
      relatedCollection: 'Reservations',
    });
    await notification.save();

    res.status(201).json({
      id: reservation.reservationId,
      guest: reservation.guest,
      email: reservation.email,
      phone: reservation.phone,
      table: reservation.table,
      tableCapacity: reservation.tableCapacity,
      date: reservation.date.toISOString().split('T')[0],
      time: reservation.time,
      duration: reservation.duration,
      party: reservation.party,
      status: reservation.status,
      notes: reservation.notes,
      specialRequests: reservation.specialRequests,
      loyaltyMember: reservation.loyaltyMember,
      createdAt: reservation.createdAt.toISOString(),
      source: reservation.source,
      deposit: reservation.deposit,
      allergies: reservation.allergies,
      previousVisits: reservation.previousVisits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reservations/:id
router.put('/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { guest, email, phone, table, date, time, party, notes, specialRequests, deposit, allergies, status } = req.body;

    const reservation = await Reservation.findOne({ reservationId: id });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    // Static table data for validation
    const allTables = [
      { id: 'T1', capacity: 2, location: 'Window' },
      { id: 'T2', capacity: 2, location: 'Window' },
      { id: 'T3', capacity: 4, location: 'Main Hall' },
      { id: 'T4', capacity: 4, location: 'Main Hall' },
      { id: 'T5', capacity: 6, location: 'Private Room' },
      { id: 'T6', capacity: 6, location: 'Private Room' },
      { id: 'T7', capacity: 8, location: 'Patio' },
      { id: 'T8', capacity: 8, location: 'Patio' },
    ];

    let tableId = reservation.table;
    let tableCapacity = reservation.tableCapacity;
    if (table && table !== reservation.table) {
      const selectedTable = allTables.find((t) => t.id === table);
      if (!selectedTable) return res.status(400).json({ error: 'Invalid table selected' });

      const isReserved = await Reservation.findOne({
        date: new Date(date || reservation.date),
        time: time || reservation.time,
        table,
        status: { $in: ['pending', 'confirmed', 'seated'] },
        reservationId: { $ne: id },
      });

      if (isReserved) return res.status(400).json({ error: 'Selected table is already reserved' });
      tableId = selectedTable.id;
      tableCapacity = selectedTable.capacity;
    }

    reservation.guest = guest || reservation.guest;
    reservation.email = email || reservation.email;
    reservation.phone = phone || reservation.phone;
    reservation.table = tableId;
    reservation.tableCapacity = tableCapacity;
    reservation.date = date ? new Date(date) : reservation.date;
    reservation.time = time || reservation.time;
    reservation.party = party || reservation.party;
    reservation.notes = notes || reservation.notes;
    reservation.specialRequests = specialRequests || reservation.specialRequests;
    reservation.deposit = deposit !== undefined ? deposit : reservation.deposit;
    reservation.allergies = allergies || reservation.allergies;
    reservation.status = status || reservation.status;
    reservation.updatedAt = new Date();

    await reservation.save();

    res.json({
      id: reservation.reservationId,
      guest: reservation.guest,
      email: reservation.email,
      phone: reservation.phone,
      table: reservation.table,
      tableCapacity: reservation.tableCapacity,
      date: reservation.date.toISOString().split('T')[0],
      time: reservation.time,
      duration: reservation.duration,
      party: reservation.party,
      status: reservation.status,
      notes: reservation.notes,
      specialRequests: reservation.specialRequests,
      loyaltyMember: reservation.loyaltyMember,
      createdAt: reservation.createdAt.toISOString(),
      source: reservation.source,
      deposit: reservation.deposit,
      allergies: reservation.allergies,
      previousVisits: reservation.previousVisits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reservations/:id
router.delete('/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findOne({ reservationId: id });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    await Reservation.deleteOne({ reservationId: id });
    res.json({ message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reservations/:id/status
router.put('/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findOne({ reservationId: id });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    reservation.status = status;
    reservation.updatedAt = new Date();
    await reservation.save();

    if (['confirmed', 'seated', 'cancelled', 'no-show'].includes(status)) {
      const notification = new Notification({
        type: 'reservation',
        message: `Reservation ${status} for ${reservation.guest}`,
        details: `${reservation.guest} - Table ${reservation.table}, ${reservation.time}`,
        relatedId: reservation._id,
        relatedCollection: 'Reservations',
      });
      await notification.save();
    }

    res.json({
      id: reservation.reservationId,
      guest: reservation.guest,
      email: reservation.email,
      phone: reservation.phone,
      table: reservation.table,
      tableCapacity: reservation.tableCapacity,
      date: reservation.date.toISOString().split('T')[0],
      time: reservation.time,
      duration: reservation.duration,
      party: reservation.party,
      status: reservation.status,
      notes: reservation.notes,
      specialRequests: reservation.specialRequests,
      loyaltyMember: reservation.loyaltyMember,
      createdAt: reservation.createdAt.toISOString(),
      source: reservation.source,
      deposit: reservation.deposit,
      allergies: reservation.allergies,
      previousVisits: reservation.previousVisits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;