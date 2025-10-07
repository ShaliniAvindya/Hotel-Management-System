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
const restaurantBarAnalyticsRoutes = require('../routes/Restaurant&BarManagement/analyticsRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: [
    'http://localhost:5173',                      
    'https://hotel-management-system-seven-woad.vercel.app' // Live frontend
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','pragma','cache-control','expires','x-auth-token'],
}));

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
app.use('/api/restaurant-bar/analytics', restaurantBarAnalyticsRoutes);
app.use('/api/billing', billingRoutes);

// --- HEALTH CHECK ENDPOINT ---
app.get(['/', '/api/health'], async (req, res) => {
  try {
    const mongoStates = ['Disconnected','Connected','Connecting','Disconnecting'];
    const state = mongoose.connection.readyState;
    res.status(200).json({
      status: '✅ API Health: OK',
      mongoDB: mongoStates[state],
      environment: process.env.NODE_ENV || 'Development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: '❌ API Health: Failed',
      error: error.message
    });
  }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- MONGODB CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'hotel-management' });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

// Initial connection
connectDB();

// Connection event logs
mongoose.connection.on('connected', () => console.log('🟢 MongoDB Connected'));
mongoose.connection.on('disconnected', () => console.log('🔴 MongoDB Disconnected'));
mongoose.connection.on('error', (err) => console.error('⚠️ MongoDB Error:', err));

setInterval(() => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⏳ Reconnecting MongoDB...');
    connectDB();
  }
}, 5 * 60 * 1000);

module.exports = app;
