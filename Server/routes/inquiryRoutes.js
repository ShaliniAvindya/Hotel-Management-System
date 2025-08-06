const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    res.json([]); 
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;