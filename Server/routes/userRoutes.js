const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      image: user.image,
      address: user.address,
      reviews: user.reviews,
      ratings: user.ratings,
      createdAt: user.createdAt || new Date(),
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      image: user.image,
      address: user.address,
      reviews: user.reviews,
      ratings: user.ratings,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

router.post('/me/image', auth, async (req, res) => {
  try {
    const { image } = req.body; 
    if (!image) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    const imgbbResponse = await axios.post(
      'https://api.imgbb.com/1/upload?key=4e08e03047ee0d48610586ad270e2b39',
      { image },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const imageUrl = imgbbResponse.data.data.url;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { image: imageUrl },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, phone, password, isAdmin } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        details: existingUser.username === username ? 'Username already taken' : 'Email already registered',
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      reviews: [],
      ratings: 0,
      image: 'https://via.placeholder.com/150',
      address: '',
    });
    await user.save();
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        reviews: user.reviews,
        ratings: user.ratings,
        image: user.image,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        reviews: user.reviews,
        ratings: user.ratings,
        image: user.image,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('name image ratings address reviews');
    res.json(users.map(user => ({
      id: user._id,
      name: user.name,
      rating: user.ratings,
      image: user.image || 'https://via.placeholder.com/150',
      listings: Math.floor(Math.random() * 300) + 100,
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.get('/:sellerId', adminAuth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const user = await User.findById(sellerId).select('name ratings address reviews image phone email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      ratings: user.ratings,
      address: user.address,
      reviews: user.reviews,
      image: user.image,
      phone: user.phone,
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;