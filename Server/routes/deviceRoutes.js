const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const mongoose = require('mongoose');
const axios = require('axios');

router.post('/upload-imgbb', async (req, res) => {
  try {
    const { imageBase64 } = req.body; 
    if (!imageBase64) {
      return res.status(400).json({ message: 'Missing imageBase64 in request body' });
    }
    const apiKey = '4e08e03047ee0d48610586ad270e2b39'; 
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      new URLSearchParams({ image: imageBase64 }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Image upload to imgbb failed:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Image upload failed', error: error?.response?.data || error.message });
  }
});

// Create a new device
router.post('/', async (req, res) => {
  try {
    const deviceData = req.body;
    if (!deviceData.userId) {
      return res.status(400).json({ message: 'Missing required field: userId' });
    }
    try {
      deviceData.userId = new mongoose.Types.ObjectId(deviceData.userId);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    if (deviceData.sellerId) {
      try {
        deviceData.sellerId = new mongoose.Types.ObjectId(deviceData.sellerId);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid sellerId format' });
      }
    }
    const standardFields = [
      'storage', 'ram', 'camera', 'battery', 'os', 'display', 'processor', 'connectivity',
      'type', 'capacity', 'interface', 'readSpeed', 'writeSpeed'
    ];
    const details = {};
    if (deviceData.details && typeof deviceData.details === 'object') {
      standardFields.forEach(field => {
        if (deviceData.details[field] !== undefined) details[field] = deviceData.details[field];
      });
      if (Array.isArray(deviceData.details.colors)) {
        details.colors = [...deviceData.details.colors];
      } else {
        details.colors = [];
      }
      // Store custom specifications 
      if (Array.isArray(deviceData.details.customSpecs)) {
        details.customSpecs = deviceData.details.customSpecs.map(spec => ({
          name: spec.name,
          value: spec.value
        }));
        deviceData.details.customSpecs.forEach(spec => {
          if (spec && spec.name && spec.value) {
            details[spec.name] = spec.value;
          }
        });
      } else {
        details.customSpecs = [];
      }
      Object.keys(deviceData.details).forEach(key => {
        if (!standardFields.includes(key) && key !== 'colors' && key !== 'customSpecs' && details[key] === undefined) {
          details[key] = deviceData.details[key];
        }
      });
    } else {
      details.colors = [];
      details.customSpecs = [];
    }
    deviceData.details = details;

    // --- Ensure condition is always an array ---
    if (deviceData.condition !== undefined) {
      if (Array.isArray(deviceData.condition)) {
        // Already array, do nothing
      } else if (typeof deviceData.condition === 'string' && deviceData.condition.trim() !== '') {
        deviceData.condition = [deviceData.condition.trim()];
      } else if (deviceData.condition == null || deviceData.condition === '') {
        deviceData.condition = [];
      } else {
        deviceData.condition = [String(deviceData.condition)];
      }
    }

    const newDevice = new Device(deviceData);
    await newDevice.save();
    res.status(201).json({ message: 'Device created successfully', device: newDevice });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ message: 'Error creating device', error: error.message });
  }
});

// Helper function to map categories to icons
const getCategoryIcon = (category) => {
  const icons = {
    Smartphone: 'Smartphone',
    Tablet: 'Tablet',
    Laptop: 'Laptop',
    Desktop: 'Monitor',
    Other: 'HardDrive',
  };
  return icons[category] || 'HardDrive';
};

// Get all categories with item counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Device.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(
      categories.map((cat) => ({
        name: cat._id,
        count: cat.count.toString(),
        icon: getCategoryIcon(cat._id),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Get devices by category with pagination
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 9, excludeId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { category };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const devices = await Device.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('_id sellerId userId title brand category images videos condition details description price status location contactInfo createdAt')
      .populate('sellerId', 'shopName')
      .populate('userId', 'username');

    const totalItems = await Device.countDocuments(query);

    res.json({
      posts: devices.map((device) => ({
        _id: device._id,
        sellerId: device.sellerId ? device.sellerId._id : null,
        sellerName: device.sellerId ? device.sellerId.shopName : device.userId?.username || 'Unknown',
        userId: device.userId ? device.userId._id : null,
        title: device.title,
        brand: device.brand,
        category: device.category,
        images: device.images,
        videos: device.videos,
        condition: device.condition,
        details: device.details,
        description: device.description,
        price: device.price,
        status: device.status,
        location: device.location,
        contactInfo: device.contactInfo,
        createdAt: device.createdAt,
      })),
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices by category', error: error.message });
  }
});

// Get devices by sellerId or userId
router.get('/seller/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 9 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query;
    try {
      // Try parsing as ObjectId to determine if it's a valid ID
      const objectId = new mongoose.Types.ObjectId(id);
      query = { $or: [{ sellerId: objectId }, { userId: objectId }] };
    } catch (e) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch devices with pagination
    const devices = await Device.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('_id sellerId userId title brand category images videos condition details description price status location contactInfo createdAt')
      .populate('sellerId', 'shopName')
      .populate('userId', 'username');

    // Get total count for pagination
    const totalItems = await Device.countDocuments(query);

    res.json({
      posts: devices.map((device) => ({
        _id: device._id,
        sellerId: device.sellerId ? device.sellerId._id : null,
        sellerName: device.sellerId ? device.sellerId.shopName : device.userId?.username || 'Unknown',
        userId: device.userId ? device.userId._id : null,
        title: device.title,
        brand: device.brand,
        category: device.category,
        images: device.images,
        videos: device.videos,
        condition: device.condition,
        details: device.details,
        description: device.description,
        price: device.price,
        status: device.status,
        location: device.location,
        contactInfo: device.contactInfo,
        createdAt: device.createdAt,
      })),
      totalItems,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Error fetching devices', error: error.message });
  }
});

// Get all devices 
router.get('/all', async (req, res) => {
  try {
    const devices = await Device.find({})
      .limit(1000)
      .select('_id sellerId userId title brand category images videos condition details description price status location contactInfo createdAt')
      .populate('sellerId', 'shopName')
      .populate('userId', 'username');

    res.json({
      posts: devices.map((device) => ({
        _id: device._id,
        sellerId: device.sellerId ? device.sellerId._id : null,
        sellerName: device.sellerId ? device.sellerId.shopName : device.userId?.username || 'Unknown',
        userId: device.userId ? device.userId._id : null,
        title: device.title,
        brand: device.brand,
        category: device.category,
        images: device.images,
        videos: device.videos,
        condition: device.condition,
        details: device.details,
        description: device.description,
        price: device.price,
        status: device.status,
        location: device.location,
        contactInfo: device.contactInfo,
        createdAt: device.createdAt,
      })),
      totalItems: devices.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all devices', error: error.message });
  }
});

// Get single device by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id)
      .select('_id sellerId userId title brand category images videos condition details description price status location contactInfo createdAt')
      .populate('sellerId', 'shopName')
      .populate('userId', 'username');

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({
      _id: device._id,
      sellerId: device.sellerId ? device.sellerId._id : null,
      sellerName: device.sellerId ? device.sellerId.shopName : device.userId?.username || 'Unknown',
      userId: device.userId ? device.userId._id : null,
      title: device.title,
      brand: device.brand,
      category: device.category,
      images: device.images,
      videos: device.videos,
      condition: device.condition,
      details: device.details,
      description: device.description,
      price: device.price,
      status: device.status,
      location: device.location,
      contactInfo: device.contactInfo,
      createdAt: device.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching device', error: error.message });
  }
});

// Update a device by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.sellerId) {
      try {
        updateData.sellerId = new mongoose.Types.ObjectId(updateData.sellerId);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid sellerId format' });
      }
    }
    if (updateData.userId) {
      try {
        updateData.userId = new mongoose.Types.ObjectId(updateData.userId);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid userId format' });
      }
    }

    // --- Ensure condition is always an array on update ---
    if (updateData.condition !== undefined) {
      if (Array.isArray(updateData.condition)) {
        // Already array, do nothing
      } else if (typeof updateData.condition === 'string' && updateData.condition.trim() !== '') {
        updateData.condition = [updateData.condition.trim()];
      } else if (updateData.condition == null || updateData.condition === '') {
        updateData.condition = [];
      } else {
        updateData.condition = [String(updateData.condition)];
      }
    }
    const device = await Device.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select('_id sellerId userId title brand category images videos condition details description price status location contactInfo createdAt')
      .populate('sellerId', 'shopName')
      .populate('userId', 'username');

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({
      _id: device._id,
      sellerId: device.sellerId ? device.sellerId._id : null,
      sellerName: device.sellerId ? device.sellerId.shopName : device.userId?.username || 'Unknown',
      userId: device.userId ? device.userId._id : null,
      title: device.title,
      brand: device.brand,
      category: device.category,
      images: device.images,
      videos: device.videos,
      condition: device.condition,
      details: device.details,
      description: device.description,
      price: device.price,
      status: device.status,
      location: device.location,
      contactInfo: device.contactInfo,
      createdAt: device.createdAt,
    });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ message: 'Error updating device', error: error.message });
  }
});

// Delete a device by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findByIdAndDelete(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Error deleting device', error: error.message });
  }
});

module.exports = router;