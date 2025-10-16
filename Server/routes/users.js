const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return current authenticated user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: create a new user
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, isAdmin, isActive, status } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role || 'guest', isAdmin: !!isAdmin, isActive: isActive !== undefined ? !!isActive : true, status: status || 'active' });
    await user.save();
    res.status(201).json({ message: 'User created', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: toggle admin status
router.put('/:id/toggle-admin', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ message: 'User admin status updated', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update user fields 
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.role !== undefined) updates.role = req.body.role;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.lastLogin !== undefined) updates.lastLogin = req.body.lastLogin;
   if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ error: 'Email already in use by another user' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
