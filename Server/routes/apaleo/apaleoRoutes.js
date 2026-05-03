const express = require('express');
const router = express.Router();
const ApaleoConfig = require('../../models/ApaleoConfig');
const Booking = require('../../models/ReservationManagement/Booking');
const Room = require('../../models/RoomManaagemnt/Room');
const { getConfig, fetchToken, ensureToken, apiGet } = require('../../services/apaleoService');

router.get('/config', async (req, res) => {
  try {
    const config = await getConfig();
    res.json({
      envConfigured: !!(process.env.APALEO_CLIENT_ID && process.env.APALEO_CLIENT_SECRET),
      environment: process.env.APALEO_ENVIRONMENT || 'sandbox',
      connected: config.connected,
      propertyId: config.propertyId || '',
      lastSync: config.lastSync,
      roomMappings: config.roomMappings || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/connect', async (req, res) => {
  try {
    const { accessToken, expiresIn } = await fetchToken();

    let config = await ApaleoConfig.findOne();
    if (!config) config = new ApaleoConfig();

    config.accessToken = accessToken;
    config.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    config.connected = true;
    await config.save();

    res.json({ success: true, message: 'Connected to Apaleo successfully' });
  } catch (err) {
    res.status(400).json({
      message: err.message.includes('.env')
        ? err.message
        : 'Connection failed. Check APALEO_CLIENT_ID / APALEO_CLIENT_SECRET in .env',
      detail: err.message,
    });
  }
});

// DELETE disconnect
router.delete('/disconnect', async (req, res) => {
  try {
    const config = await ApaleoConfig.findOne();
    if (config) {
      config.connected = false;
      config.accessToken = '';
      config.tokenExpiry = null;
      await config.save();
    }
    res.json({ success: true, message: 'Disconnected from Apaleo' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET properties
router.get('/properties', async (req, res) => {
  try {
    const config = await getConfig();
    if (!config.connected) return res.status(400).json({ message: 'Not connected to Apaleo' });
    const token = await ensureToken(config);
    const data = await apiGet('/inventory/v1/properties?pageSize=20', token);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET unit types (room types) for a property
router.get('/unit-types', async (req, res) => {
  try {
    const config = await getConfig();
    if (!config.connected) return res.status(400).json({ message: 'Not connected to Apaleo' });
    const token = await ensureToken(config);
    const propertyId = req.query.propertyId || config.propertyId;
    if (!propertyId) return res.status(400).json({ message: 'Property ID is required' });
    const data = await apiGet(`/inventory/v1/unit-groups?propertyId=${propertyId}&pageSize=500`, token);
    res.json({ ...data, unitTypes: data.unitGroups || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET rate plans for a property
router.get('/rate-plans', async (req, res) => {
  try {
    const config = await getConfig();
    if (!config.connected) return res.status(400).json({ message: 'Not connected to Apaleo' });
    const token = await ensureToken(config);
    const propertyId = req.query.propertyId || config.propertyId;
    if (!propertyId) return res.status(400).json({ message: 'Property ID is required' });
    const data = await apiGet(`/rateplan/v1/rate-plans?propertyId=${propertyId}&pageSize=50`, token);
    // Apaleo returns ratePlans array
    res.json({ ...data, ratePlans: data.ratePlans || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET availability 
router.get('/availability', async (req, res) => {
  try {
    const config = await getConfig();
    if (!config.connected) return res.status(400).json({ message: 'Not connected to Apaleo' });
    const token = await ensureToken(config);
    const propertyId = req.query.propertyId || config.propertyId;
    if (!propertyId) return res.status(400).json({ message: 'Property ID is required' });
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'from and to are required' });
    const data = await apiGet(
      `/availability/v1/occupancy?propertyId=${propertyId}&from=${from}&to=${to}`,
      token
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET reservations
router.get('/reservations', async (req, res) => {
  try {
    const config = await getConfig();
    if (!config.connected) return res.status(400).json({ message: 'Not connected to Apaleo' });
    const token = await ensureToken(config);
    const propertyId = req.query.propertyId || config.propertyId;
    if (!propertyId) return res.status(400).json({ message: 'Property ID is required' });

    const { from, to, status, pageNumber = 1, pageSize = 20 } = req.query;
    let qs = `?propertyIds=${propertyId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (from) qs += `&dateFilter=arrival&from=${from}`;
    if (to) qs += `&to=${to}`;
    if (status) qs += `&reservationStatuses=${status}`;

    const data = await apiGet(`/booking/v1/reservations${qs}`, token);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST save active property + room mappings
router.post('/save-config', async (req, res) => {
  try {
    const { propertyId, roomMappings } = req.body;
    let config = await ApaleoConfig.findOne();
    if (!config) config = new ApaleoConfig();

    if (propertyId !== undefined) config.propertyId = propertyId;
    if (roomMappings !== undefined) config.roomMappings = roomMappings;
    config.lastSync = new Date();
    await config.save();

    res.json({ success: true, message: 'Configuration saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST webhook — register this URL in Apaleo Developer Portal
router.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Always acknowledge immediately
  
  const event = req.body;
  console.log('[Apaleo Webhook]', event?.topic, event?.id);

  if (event?.topic?.includes('reservation')) {
    try {
      const config = await getConfig();
      if (!config.connected) return;
      const token = await ensureToken(config);

      // 1. Fetch full reservation details
      const resData = await apiGet(`/booking/v1/reservations/${event.id}`, token);
      
      // 2. Check if already exists
      const existing = await Booking.findOne({ apaleoReservationId: resData.id });
      
      const bookingData = {
        apaleoReservationId: resData.id,
        bookingReference: resData.bookingId || `AP-${resData.id.slice(0,8)}`,
        firstName: resData.primaryGuest?.firstName || 'Guest',
        lastName: resData.primaryGuest?.lastName || 'OTA',
        guestEmail: resData.primaryGuest?.email || '',
        guestPhone: resData.primaryGuest?.phoneNumber || '',
        checkInDate: resData.arrival,
        checkOutDate: resData.departure,
        guests: resData.adults + (resData.children || 0),
        totalAmount: resData.totalAmount?.amount || 0,
        status: resData.status === 'Confirmed' ? 'confirmed' : 
                resData.status === 'Canceled' ? 'cancelled' : 'confirmed',
        bookingSource: 'OTA',
        specialRequests: resData.comment || ''
      };

      if (existing) {
        await Booking.findByIdAndUpdate(existing._id, bookingData);
        console.log(`[Apaleo Sync] Updated Reservation ${resData.id}`);
      } else {
        // Generate a unique sequential ID for HMS
        const count = await Booking.countDocuments();
        bookingData.id = `B${String(count + 1).padStart(4, '0')}`;
        const newBooking = new Booking(bookingData);
        await newBooking.save();
        console.log(`[Apaleo Sync] Created New Reservation ${bookingData.id}`);
      }
    } catch (err) {
      console.error('[Apaleo Webhook Error]', err.message);
    }
  }
});

module.exports = router;
