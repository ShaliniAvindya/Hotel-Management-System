const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const roomRoutes = require('./routes/roomRoutes'); 
const roomRateRoutes = require('./routes/roomRateRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const roomAvailabilityRoutes = require('./routes/roomAvailabilityRoutes');
const staffMember = require('./routes/staffMemberRoutess');

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