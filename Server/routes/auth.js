const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userObj = { name, email, password: hashedPassword };
    if (role) userObj.role = role; 
    const user = new User(userObj);
    await user.save();
    // create token and return user info
  const token = jwt.sign({ id: user._id, role: user.role, isAdmin: !!user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: !!user.isAdmin } });
  } catch (err) {
    // detect duplicate key (email)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: messages });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role, isAdmin: !!user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: !!user.isAdmin } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Change password for authenticated user
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
