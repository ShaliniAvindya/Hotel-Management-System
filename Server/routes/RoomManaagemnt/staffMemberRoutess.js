const express = require('express');
const StaffMember = require('../../models/RoomManaagemnt/staffMember');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const staff = await StaffMember.find().sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff members:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const staff = await StaffMember.findOne({ id: req.params.id });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff member:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const staffData = req.body;
    if (!staffData.id) {
      const lastStaff = await StaffMember.findOne().sort({ createdAt: -1 });
      const lastId = lastStaff ? parseInt(lastStaff.id.slice(2)) : 0;
      staffData.id = `SM${String(lastId + 1).padStart(3, '0')}`;
    }
    const staff = new StaffMember(staffData);
    await staff.save();
    res.status(201).json(staff);
  } catch (err) {
    console.error('Error creating staff member:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const staff = await StaffMember.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    console.error('Error updating staff member:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const staff = await StaffMember.findOneAndDelete({ id: req.params.id });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) {
    console.error('Error deleting staff member:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;