// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();
const { cacheGetJson } = require('./utils/httpCache');

// --- ROUTES ---
const roomRoutes = require('./routes/RoomManaagemnt/roomRoutes');
const roomRateRoutes = require('./routes/RoomManaagemnt/roomRateRoutes');
const maintenanceRoutes = require('./routes/RoomManaagemnt/maintenanceRoutes');
const roomAvailabilityRoutes = require('./routes/RoomManaagemnt/roomAvailabilityRoutes');
const staffMember = require('./routes/RoomManaagemnt/staffMemberRoutess');
const conciergeRoutes = require('./routes/RoomManaagemnt/conciergeRoutes');

const bookingRoutes = require('./routes/ReservationManagement/bookingRoutes');
const guestRoutes = require('./routes/ReservationManagement/guestRoutes');
const checkInOutRoutes = require('./routes/ReservationManagement/checkInOutRoutes');
const Cancellation = require('./routes/ReservationManagement/cancelRoutes');
const specialRequestRoutes = require('./routes/ReservationManagement/specialRequestRoutes');

const billingRoutes = require('./routes/billingRoutes');

const menuRoutes = require('./routes/Restaurant&BarManagement/menuRoutes');
const orderRoutes = require('./routes/Restaurant&BarManagement/orderRoutes');

const exportRoutes = require('./routes/exports');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const spaRoutes = require('./routes/SpaAndWellness');
const dashboardRoutes = require('./routes/dashboard');

// --- APP ---
const app = express();

// --- MIDDLEWARE ---
app.set('etag', false);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hotel-management-system-seven-woad.vercel.app',
    'https://lushhotelcloud.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// --- ROUTES ---
app.use('/api/rooms', roomRoutes);
app.use('/api/room-rates', roomRateRoutes);
app.use('/api/roomMaintenance', maintenanceRoutes);
app.use('/api/roomAvailability', roomAvailabilityRoutes);
app.use('/api/staffMembers', staffMember);
app.use('/api/concierge', conciergeRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/checkinout', checkInOutRoutes);
app.use('/api/cancellations', Cancellation);
app.use('/api/specialrequests', specialRequestRoutes);

app.use('/api/billing', billingRoutes);

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/exports', exportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/spa', spaRoutes);

app.use('/api/dashboard', cacheGetJson({ ttlMs: 5000 }), dashboardRoutes);

// =====================================================
// 🚨 SAFE MONGODB CONNECTION (CRITICAL FOR VERCEL)
// =====================================================
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      dbName: 'hotel-management',
      maxPoolSize: 20,
      minPoolSize: 2,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// =====================================================
// HEALTH CHECK
// =====================================================
app.get(['/', '/api/health'], async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      status: 'OK',
      mongoDB: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: err.message,
    });
  }
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  });
});

// =====================================================
// 🚀 VERCEL SERVERLESS EXPORT (FINAL FIX)
// =====================================================
module.exports = async (req, res) => {
  try {
    await connectDB();

    return app(req, res);
  } catch (err) {
    console.error('❌ Vercel Crash:', err);

    res.status(500).json({
      error: 'Server crashed',
      message: err.message,
    });
  }
};
