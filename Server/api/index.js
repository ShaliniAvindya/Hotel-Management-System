// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- IMPORT ROUTES ---
const roomRoutes = require('../routes/RoomManaagemnt/roomRoutes');
const roomRateRoutes = require('../routes/RoomManaagemnt/roomRateRoutes');
const maintenanceRoutes = require('../routes/RoomManaagemnt/maintenanceRoutes');
const roomAvailabilityRoutes = require('../routes/RoomManaagemnt/roomAvailabilityRoutes');
const staffMember = require('../routes/RoomManaagemnt/staffMemberRoutess');
const bookingRoutes = require('../routes/ReservationManagement/bookingRoutes');
const guestRoutes = require('../routes/ReservationManagement/guestRoutes');
const checkInOutRoutes = require('../routes/ReservationManagement/checkInOutRoutes');
const Cancellation = require('../routes/ReservationManagement/cancelRoutes');
const specialRequestRoutes = require('../routes/ReservationManagement/specialRequestRoutes');
const billingRoutes = require('../routes/billingRoutes');
const menuRoutes = require('../routes/Restaurant&BarManagement/menuRoutes');
const orderRoutes = require('../routes/Restaurant&BarManagement/orderRoutes');
const exportRoutes = require('../routes/exports');
const settingsRoutes = require('../routes/settings');
const authRoutes = require('../routes/auth');
const usersRoutes = require('../routes/users');

// --- INITIALIZE APP ---
const app = express();

// --- MIDDLEWARE ---
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://hotel-management-system-seven-woad.vercel.app', // ✅ Add your deployed frontend URL here
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'pragma',
      'cache-control',
      'expires',
      'x-auth-token',
    ],
  })
);
app.use(express.json({ limit: '10mb' }));

// --- ROUTES ---
app.use('/api/rooms', roomRoutes);
app.use('/api/room-rates', roomRateRoutes);
app.use('/api/roomMaintenance', maintenanceRoutes);
app.use('/api/roomAvailability', roomAvailabilityRoutes);
app.use('/api/staffMembers', staffMember);
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

// --- MONGODB CONNECTION (serverless optimized) ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'hotel-management',
      bufferCommands: false, // Disable Mongoose buffering in serverless environments
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

// --- HEALTH CHECK ENDPOINT ---
app.get(['/', '/api/health'], async (req, res) => {
  const mongoStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  res.status(200).json({
    status: '✅ API Health: OK',
    mongoDB: mongoStates[mongoose.connection.readyState],
    environment: process.env.NODE_ENV || 'Development',
    timestamp: new Date().toISOString(),
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
});

// --- EXPORT HANDLER FOR VERCEL ---
module.exports = async (req, res) => {
  await connectDB(); // Ensure DB connection before handling request
  return app(req, res);
};
