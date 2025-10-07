const express = require('express');
const router = express.Router();
const Analytics = require('../../models/Restaurant&BarManagement/Analytics');

router.get('/', async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = new Analytics();
      await analytics.save();
    }
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update analytics
router.post('/update', async (req, res) => {
  try {
    const update = req.body;
    let analytics = await Analytics.findOne();
    if (!analytics) analytics = new Analytics();
    Object.assign(analytics, update, { lastUpdated: Date.now() });
    await analytics.save();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
