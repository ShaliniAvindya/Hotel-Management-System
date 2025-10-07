const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  topItems: [{ name: String, count: Number }],
  kitchenPerformance: {
    avgPrepTime: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 }
  },
  barPerformance: {
    totalDrinksServed: { type: Number, default: 0 },
    topDrinks: [{ name: String, count: Number }]
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
