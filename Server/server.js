const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const roomRoutes = require('./routes/RoomManaagemnt/roomRoutes'); 
const roomRateRoutes = require('./routes/RoomManaagemnt/roomRateRoutes');
const maintenanceRoutes = require('./routes/RoomManaagemnt/maintenanceRoutes');
const roomAvailabilityRoutes = require('./routes/RoomManaagemnt/roomAvailabilityRoutes');
const staffMember = require('./routes/RoomManaagemnt/staffMemberRoutess');
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

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'pragma', 'cache-control', 'expires', 'x-auth-token'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: 'hotel-management',
  })
  .then(() => console.log('DB connect successful'))
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});