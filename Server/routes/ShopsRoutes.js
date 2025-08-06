const express = require('express');
const router = express.Router();
const Shop = require('../models/Shops');
const axios = require('axios');

// Create a new shop
router.post('/', async (req, res) => {
  try {
    const {
      shopName,
      logo, 
      phone,
      business_email,
      tagline,
      description,
      website,
      address,
      socialMedia,
      credentials,
      ratings,
      reviews,
      location,
      userId,
      sellerId,
    } = req.body;

    let logoUrl = '';
    if (logo) {
      const params = new URLSearchParams();
      params.append('image', logo.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
      const imgbbRes = await axios.post(
        'https://api.imgbb.com/1/upload?key=4e08e03047ee0d48610586ad270e2b39',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      logoUrl = imgbbRes.data.data.url;
    }

    // Create shop with a temporary sellerId 
    const mongoose = require('mongoose');
    const tempSellerId = new mongoose.Types.ObjectId();
    const shop = new Shop({
      shopName,
      logo: logoUrl,
      phone,
      business_email,
      tagline,
      description,
      website,
      address,
      socialMedia,
      credentials,
      ratings: ratings || 0,
      reviews: reviews || [],
      location,
      userId: userId,
      sellerId: tempSellerId 
    });
    await shop.save();
    // After save, set sellerId = shop._id and update the shop
    shop.sellerId = shop._id;
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ message: 'Failed to create shop', error: error.message });
  }
});

// Get all shops with post count
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find().select(
      'shopName logo ratings tagline address reviews socialMedia verified badges responseTime location'
    );
    const shopsWithCounts = await Promise.all(
      shops.map(async (shop) => {
        const postCount = await require('../models/Device').countDocuments({
          $or: [{ sellerId: shop._id }, { userId: shop._id }],
        });
        return {
          id: shop._id,
          name: shop.shopName,
          tagline: shop.tagline || '',
          rating: shop.ratings,
          image: shop.logo || 'https://via.placeholder.com/150',
          listings: postCount,
          location: shop.location,
        };
      })
    );
    res.json(shopsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shops', error: error.message });
  }
});

// Get single shop by ID
router.get('/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const shop = await Shop.findById(sellerId).select(
      'shopName logo ratings address reviews phone business_email tagline description website socialMedia verified badges responseTime location userId sellerId'
    );
    if (!shop) {
      const user = await require('../models/user').findById(sellerId).select(
        'name username email phone address reviews ratings image'
      );
      if (!user) {
        return res.status(404).json({ message: 'Shop or user not found' });
      }
      res.json({
        _id: user._id,
        shopName: user.name || user.username || '',
        logo: user.image || 'https://via.placeholder.com/150',
        ratings: user.ratings || 0,
        address: user.address || '',
        reviews: user.reviews || [],
        phone: user.phone || '',
        business_email: user.email || '',
        tagline: '',
        description: '',
        website: '',
        socialMedia: {},
        location: '',
        verified: false,
        badges: [],
        responseTime: '',
        isUser: true, 
      });
      return;
    }
    res.json({
      _id: shop._id,
      shopName: shop.shopName,
      logo: shop.logo,
      ratings: shop.ratings,
      address: shop.address,
      reviews: shop.reviews,
      phone: shop.phone,
      business_email: shop.business_email,
      tagline: shop.tagline,
      description: shop.description,
      website: shop.website,
      socialMedia: shop.socialMedia,
      location: shop.location,
      userId: shop.userId,
      sellerId: shop.sellerId,
      isUser: false,
    });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Error fetching shop', error: error.message });
  }
});

// Get shop by userId
router.get('/by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined' || userId === undefined) {
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }
    // Find the shop where userId matches
    const shop = await Shop.findOne({ userId });
    if (!shop) {
      return res.status(404).json({ message: 'No shop found for this user' });
    }
    res.json({
      _id: shop._id,
      shopName: shop.shopName,
      logo: shop.logo,
      ratings: shop.ratings,
      address: shop.address,
      reviews: shop.reviews,
      phone: shop.phone,
      business_email: shop.business_email,
      tagline: shop.tagline,
      description: shop.description,
      website: shop.website,
      socialMedia: shop.socialMedia,
      location: shop.location,
      userId: shop.userId,
      sellerId: shop.sellerId,
      isUser: false,
    });
  } catch (error) {
    console.error('Error fetching shop by userId:', error);
    res.status(500).json({ message: 'Error fetching shop', error: error.message });
  }
});

// Update shop by ID
router.put('/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const update = { ...req.body };
    if (update.socialMedia && typeof update.socialMedia === 'object') {
      Object.keys(update.socialMedia).forEach(key => {
        if (typeof update.socialMedia[key] !== 'string' || update.socialMedia[key].trim() === '') {
          delete update.socialMedia[key];
        } else {
          update.socialMedia[key] = update.socialMedia[key].trim();
        }
      });
      if (Object.keys(update.socialMedia).length === 0) {
        delete update.socialMedia;
      }
    }
    let shop;
    try {
      shop = await Shop.findByIdAndUpdate(sellerId, update, { new: true });
    } catch (e) {
      return res.status(400).json({ message: 'Invalid sellerId format' });
    }
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop', error: error.message });
  }
});

// Delete shop by ID
router.delete('/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const shop = await Shop.findByIdAndDelete(sellerId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    await require('../models/Device').deleteMany({ sellerId: shop._id });
    res.json({ message: 'Shop and associated products deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop', error: error.message });
  }
});

module.exports = router;