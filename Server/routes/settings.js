const express = require('express');
const router = express.Router();
const RestaurantInfo = require('../models/RestaurantInfo');
const SystemPreferences = require('../models/SystemPreferences');

// GET restaurant info
router.get('/restaurant', async (req, res) => {
  let info = await RestaurantInfo.findOne();
  if (!info) {
    info = new RestaurantInfo({
      name: '', address: '', phone: '', email: '', website: '', description: '', cuisine: '', capacity: 0,
      operatingHours: {
        monday: { open: '', close: '', closed: false },
        tuesday: { open: '', close: '', closed: false },
        wednesday: { open: '', close: '', closed: false },
        thursday: { open: '', close: '', closed: false },
        friday: { open: '', close: '', closed: false },
        saturday: { open: '', close: '', closed: false },
        sunday: { open: '', close: '', closed: false }
      }
    });
    await info.save();
  }
  res.json(info);
});

router.put('/restaurant', async (req, res) => {
  let info = await RestaurantInfo.findOne();
  if (!info) info = new RestaurantInfo(req.body);
  else Object.assign(info, req.body);
  await info.save();
  res.json(info);
});

// GET system preferences
router.get('/system', async (req, res) => {
  let prefs = await SystemPreferences.findOne();
  if (!prefs) {
    prefs = new SystemPreferences({
      currency: '', timezone: '', dateFormat: '', timeFormat: ''
    });
    await prefs.save();
  }
  res.json(prefs);
});

// PUT system preferences
router.put('/system', async (req, res) => {
  let prefs = await SystemPreferences.findOne();
  if (!prefs) prefs = new SystemPreferences(req.body);
  else Object.assign(prefs, req.body);
  await prefs.save();
  res.json(prefs);
});

module.exports = router;