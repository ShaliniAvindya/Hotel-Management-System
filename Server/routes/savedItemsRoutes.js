const express = require('express');
const router = express.Router();
const SavedItem = require('../models/savedItem');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const savedItems = await SavedItem.find({ userId: req.user.id });
    res.json(savedItems);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;