const express = require('express');
const ConciergeRequest = require('../../models/RoomManaagemnt/ConciergeRequest');

const router = express.Router();

// ============== CONCIERGE REQUESTS ==============

router.get('/requests', async (req, res) => {
  try {
    const requests = await ConciergeRequest.find().sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/requests/status/:status', async (req, res) => {
  try {
    const requests = await ConciergeRequest.find({ status: req.params.status }).sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get concierge requests by room
router.get('/requests/room/:roomNumber', async (req, res) => {
  try {
    const requests = await ConciergeRequest.find({ roomNumber: req.params.roomNumber }).sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/requests/:id', async (req, res) => {
  try {
    const request = await ConciergeRequest.findOne({ id: req.params.id }).lean();
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new concierge request
router.post('/requests', async (req, res) => {
  try {
    const requestData = req.body;
    if (!requestData.id) {
      const lastRequest = await ConciergeRequest.findOne().sort({ createdAt: -1 }).select('id').lean();
      const lastId = lastRequest ? parseInt(lastRequest.id.slice(2)) : 0;
      requestData.id = `CR${String(lastId + 1).padStart(4, '0')}`;
    }
    const conciergeRequest = new ConciergeRequest(requestData);
    await conciergeRequest.save();
    res.status(201).json(conciergeRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/requests/:id', async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const request = await ConciergeRequest.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Assign request to staff
router.patch('/requests/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const request = await ConciergeRequest.findOneAndUpdate(
      { id: req.params.id },
      {
        assignedTo,
        assignedDate: Date.now(),
        status: 'assigned'
      },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update request status
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    if (status === 'completed') {
      updateData.completedDate = Date.now();
    }
    const request = await ConciergeRequest.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/requests/:id/update', async (req, res) => {
  try {
    const { progressPercentage, notes } = req.body;
    const updateData = {
      progressPercentage: progressPercentage,
      notes: notes,
      lastUpdated: Date.now(),
      updatedAt: Date.now()
    };
    const request = await ConciergeRequest.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await ConciergeRequest.findOneAndDelete({ id: req.params.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
