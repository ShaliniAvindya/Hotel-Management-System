const express = require('express');
const router = express.Router();
const Match = require('../models/notifications');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({ userId: req.user.id });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;