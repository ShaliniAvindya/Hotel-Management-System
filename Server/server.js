const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const tablereservationRoutes = require('./routes/tablereservationRoutes');

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
app.use('/api/table-reservations', tablereservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: 'HotelManagementSystem',
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