const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, status, checkInDate, checkOutDate, pageNumber = 1, pageSize = 20 } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    if (checkInDate) {
      const start = new Date(checkInDate); start.setUTCHours(0, 0, 0, 0);
      const end   = new Date(checkInDate); end.setUTCHours(23, 59, 59, 999);
      query.checkInDate = { $gte: start, $lte: end };
    }
    if (checkOutDate) {
      const start = new Date(checkOutDate); start.setUTCHours(0, 0, 0, 0);
      const end   = new Date(checkOutDate); end.setUTCHours(23, 59, 59, 999);
      query.checkOutDate = { $gte: start, $lte: end };
    }

    const skip = (parseInt(pageNumber) - 1) * parseInt(pageSize);

    const leads = await Lead.find(query)
      .sort({ leadDate: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();

    const count = await Lead.countDocuments(query);

    res.json({
      leads,
      count,
      pageNumber: parseInt(pageNumber),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single lead
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create lead
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, country, status, source, notes, interestedInDates, numberOfGuests, roomType, budget, facebookLeadId, metaData } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }
    let existingLead = null;
    if (facebookLeadId) {
      existingLead = await Lead.findOne({ facebookLeadId });
    } else {
      existingLead = await Lead.findOne({ email });
    }

    if (existingLead) {
      return res.status(400).json({ error: 'Lead already exists' });
    }

    const lead = new Lead({
      firstName,
      lastName: lastName || '',
      email,
      phone,
      city: city || '',
      country: country || '',
      status: status || 'new',
      source: source || 'meta',
      notes: notes || '',
      interestedInDates: interestedInDates || '',
      numberOfGuests: numberOfGuests || null,
      roomType: roomType || '',
      budget: budget || null,
      facebookLeadId: facebookLeadId || null,
      metaData: metaData || {}
    });

    await lead.save();
    res.status(201).json({ message: 'Lead created', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, country, status, notes, interestedInDates, numberOfGuests, roomType, budget, assignedTo, isFollowedUp, followUpDate, checkInDate, checkOutDate } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phone,
        city,
        country,
        status,
        notes,
        interestedInDates,
        numberOfGuests,
        roomType,
        budget,
        assignedTo,
        isFollowedUp,
        followUpDate,
        checkInDate: checkInDate ? new Date(checkInDate) : null,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead updated', lead });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update lead status
router.patch('/:id/status', optionalAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead status updated', lead });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete lead
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/stats/summary', optionalAuth, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ status: 'new' });
    const contactedLeads = await Lead.countDocuments({ status: 'contacted' });
    const interestedLeads = await Lead.countDocuments({ status: 'interested' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });

    res.json({
      totalLeads,
      qualifiedLeads,
      contactedLeads,
      interestedLeads,
      convertedLeads,
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
