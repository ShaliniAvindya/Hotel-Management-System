const express = require('express');
const router = express.Router();
const { SpaService, Therapist, SpaRoom, SpaPackage, SpaAppointment, SpaBilling } = require('../models/SpaAndWellness');
const { auth } = require('../middleware/auth');

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ==================== SPA SERVICES ====================

router.get('/services', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || '-createdAt';
    const fields = req.query.fields; // comma-separated list
    const isActive = req.query.isActive;

    const filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const q = SpaService.find(filter);
    if (fields) q.select(fields.split(',').join(' '));
    const services = await q.sort(sort).skip(skip).limit(limit).lean();
    console.log('Fetched services:', services.length, 'Services');
    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(services.length));
    res.setHeader('Cache-Control', 'private, max-age=30');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get service by ID
router.get('/services/:id', async (req, res) => {
  try {
    const service = await SpaService.findById(req.params.id).lean();
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/services', auth, async (req, res) => {
  const service = new SpaService(req.body);
  try {
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/services/:id', auth, async (req, res) => {
  try {
    const service = await SpaService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/services/:id/toggle', auth, async (req, res) => {
  try {
    console.log('Toggle request received for service:', req.params.id);
    
    const service = await SpaService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    service.isActive = !service.isActive;
    const updatedService = await service.save();
    
    console.log('Service toggled successfully:', req.params.id, 'isActive:', updatedService.isActive);
    res.status(200).json({ 
      success: true,
      message: `Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully`, 
      service: updatedService 
    });
  } catch (error) {
    console.error('Error toggling service:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete service permanently
router.delete('/services/:id', auth, async (req, res) => {
  try {
    console.log('Delete request received for service:', req.params.id);
    console.log('User:', req.user);
    
    const service = await SpaService.findByIdAndDelete(req.params.id);
    
    if (!service) {
      console.log('Service not found:', req.params.id);
      return res.status(404).json({ message: 'Service not found' });
    }
    
    console.log('Service permanently deleted:', req.params.id);
    res.status(200).json({ 
      success: true,
      message: 'Service permanently deleted from database', 
      service: service 
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== THERAPISTS ====================

router.get('/therapists', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || 'name';
    const fields = req.query.fields; // comma-separated list
    const isActive = req.query.isActive;

    const filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const q = Therapist.find(filter);
    if (fields) q.select(fields.split(',').join(' '));
    const therapists = await q.sort(sort).skip(skip).limit(limit).lean();

    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(therapists.length));
    res.setHeader('Cache-Control', 'private, max-age=30');
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/therapists/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id).lean();
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });
    res.json(therapist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create therapist
router.post('/therapists', auth, async (req, res) => {
  const therapist = new Therapist(req.body);
  try {
    const newTherapist = await therapist.save();
    res.status(201).json(newTherapist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update therapist
router.put('/therapists/:id', auth, async (req, res) => {
  try {
    const therapist = await Therapist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });
    res.json(therapist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle therapist active/inactive
router.patch('/therapists/:id/toggle', auth, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });
    therapist.isActive = !therapist.isActive;
    const updatedTherapist = await therapist.save();
    res.status(200).json({ 
      success: true,
      message: `Therapist ${updatedTherapist.isActive ? 'activated' : 'deactivated'} successfully`, 
      therapist: updatedTherapist 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/therapists/:id', auth, async (req, res) => {
  try {
    const therapist = await Therapist.findByIdAndDelete(req.params.id);
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });
    res.status(200).json({ success: true, message: 'Therapist permanently deleted', therapist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SPA ROOMS ====================

router.get('/rooms', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || 'roomNumber';
    const fields = req.query.fields; // comma-separated list
    const isActive = req.query.isActive;

    const filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const q = SpaRoom.find(filter);
    if (fields) q.select(fields.split(',').join(' '));
    const rooms = await q.sort(sort).skip(skip).limit(limit).lean();

    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(rooms.length));
    res.setHeader('Cache-Control', 'private, max-age=30');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await SpaRoom.findById(req.params.id).lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/rooms', auth, async (req, res) => {
  const room = new SpaRoom(req.body);
  try {
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/rooms/:id', auth, async (req, res) => {
  try {
    const room = await SpaRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle spa room active/inactive
router.patch('/rooms/:id/toggle', auth, async (req, res) => {
  try {
    const room = await SpaRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    room.isActive = !room.isActive;
    const updatedRoom = await room.save();
    res.status(200).json({ 
      success: true,
      message: `Room ${updatedRoom.isActive ? 'activated' : 'deactivated'} successfully`, 
      room: updatedRoom 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/rooms/:id', auth, async (req, res) => {
  try {
    const room = await SpaRoom.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ success: true, message: 'Room permanently deleted', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SPA PACKAGES ====================

router.get('/packages', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || '-createdAt';
    const fields = req.query.fields; // comma-separated list
    const expand = req.query.expand !== '0'; // keep existing behavior by default

    const q = SpaPackage.find();
    if (fields) q.select(fields.split(',').join(' '));
    if (expand) q.populate('services.serviceId');

    const packages = await q.sort(sort).skip(skip).limit(limit).lean();

    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(packages.length));
    res.setHeader('Cache-Control', 'private, max-age=30');
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/packages/:id', async (req, res) => {
  try {
    const pkg = await SpaPackage.findById(req.params.id).populate('services.serviceId').lean();
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create package
router.post('/packages', auth, async (req, res) => {
  const pkg = new SpaPackage(req.body);
  try {
    const newPackage = await pkg.save();
    await newPackage.populate('services.serviceId');
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update package
router.put('/packages/:id', auth, async (req, res) => {
  try {
    const pkg = await SpaPackage.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('services.serviceId');
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle package active/inactive
router.patch('/packages/:id/toggle', auth, async (req, res) => {
  try {
    const pkg = await SpaPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    pkg.isActive = !pkg.isActive;
    const updatedPackage = await pkg.save();
    await updatedPackage.populate('services.serviceId');
    res.status(200).json({ 
      success: true,
      message: `Package ${updatedPackage.isActive ? 'activated' : 'deactivated'} successfully`, 
      package: updatedPackage 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/packages/:id', auth, async (req, res) => {
  try {
    const pkg = await SpaPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json({ success: true, message: 'Package permanently deleted', package: pkg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SPA APPOINTMENTS ====================

router.get('/appointments', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || '-appointmentDate -createdAt';
    const fields = req.query.fields; // comma-separated list
    const status = req.query.status;
    const guestId = req.query.guestId;
    const expand = req.query.expand !== '0'; // keep existing behavior by default

    const filter = {};
    if (status) filter.status = status;
    if (guestId) filter.guestId = guestId;

    const q = SpaAppointment.find(filter);
    if (fields) q.select(fields.split(',').join(' '));
    if (expand) {
      q.populate('service', 'serviceName basePrice')
        .populate('therapist', 'name hourlyRate')
        .populate('spaRoom', 'roomNumber hourlyRate')
        .populate('package', 'packageName discountedPrice');
    }

    const appointments = await q.sort(sort).skip(skip).limit(limit).lean();

    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(appointments.length));
    res.setHeader('Cache-Control', 'private, max-age=10');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await SpaAppointment.findById(req.params.id)
      .populate('service', 'serviceName basePrice')
      .populate('therapist', 'name hourlyRate')
      .populate('spaRoom', 'roomNumber hourlyRate')
      .populate('package', 'packageName discountedPrice')
      .lean();
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/appointments', auth, async (req, res) => {
  const appointmentId = generateId('APT');
  const appointment = new SpaAppointment({ ...req.body, appointmentId });
  try {
    const newAppointment = await appointment.save();
    await newAppointment.populate('service therapist spaRoom package');
    try {
      const billingId = generateId('BIL');
      const billingItems = [];
      if (newAppointment.servicePrice > 0) {
        billingItems.push({
          description: newAppointment.serviceName || 'Spa Service',
          quantity: 1,
          unitPrice: newAppointment.servicePrice,
          subtotal: newAppointment.servicePrice,
        });
      }
      
      // Add therapist charge
      if (newAppointment.therapistPrice > 0) {
        billingItems.push({
          description: `Therapist: ${newAppointment.therapistName || 'Professional'}`,
          quantity: 1,
          unitPrice: newAppointment.therapistPrice,
          subtotal: newAppointment.therapistPrice,
        });
      }
      
      // Add room charge
      if (newAppointment.roomPrice > 0) {
        billingItems.push({
          description: `Spa Room: ${newAppointment.spaRoomNumber || 'Spa Room'}`,
          quantity: 1,
          unitPrice: newAppointment.roomPrice,
          subtotal: newAppointment.roomPrice,
        });
      }
      
      const subtotal = newAppointment.servicePrice + newAppointment.therapistPrice + newAppointment.roomPrice;
      const tax = subtotal * 0.10;
      const discountAmount = newAppointment.discount || 0;
      const total = subtotal + tax - discountAmount;
      
      const billingData = {
        billingId,
        appointmentId: newAppointment._id,
        guestId: newAppointment.guestId,
        guestName: newAppointment.guestName,
        invoiceDate: new Date(),
        items: billingItems,
        subtotal: subtotal,
        tax: tax,
        discount: discountAmount,
        total: total,
        amountPaid: 0,
        amountDue: total,
        paymentStatus: newAppointment.paymentStatus || 'pending',
        notes: ``,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      
      const newBilling = new SpaBilling(billingData);
      await newBilling.save();
      console.log('Billing record created for appointment:', appointmentId);
    } catch (billingError) {
      console.error('Error creating billing record:', billingError);
    }
    
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment
router.put('/appointments/:id', auth, async (req, res) => {
  try {
    const appointment = await SpaAppointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('service therapist spaRoom package');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    try {
      const existingBilling = await SpaBilling.findOne({ appointmentId: appointment._id });
      if (existingBilling) {
        const billingItems = [];
        
        if (appointment.servicePrice > 0) {
          billingItems.push({
            description: appointment.serviceName || 'Spa Service',
            quantity: 1,
            unitPrice: appointment.servicePrice,
            subtotal: appointment.servicePrice,
          });
        }
        
        if (appointment.therapistPrice > 0) {
          billingItems.push({
            description: `Therapist: ${appointment.therapistName || 'Professional'}`,
            quantity: 1,
            unitPrice: appointment.therapistPrice,
            subtotal: appointment.therapistPrice,
          });
        }
        
        if (appointment.roomPrice > 0) {
          billingItems.push({
            description: `Spa Room: ${appointment.spaRoomNumber || 'Spa Room'}`,
            quantity: 1,
            unitPrice: appointment.roomPrice,
            subtotal: appointment.roomPrice,
          });
        }
        
        const subtotal = appointment.servicePrice + appointment.therapistPrice + appointment.roomPrice;
        const tax = subtotal * 0.10;
        const discountAmount = appointment.discount || 0;
        const total = subtotal + tax - discountAmount;
        
        await SpaBilling.findByIdAndUpdate(existingBilling._id, {
          items: billingItems,
          subtotal: subtotal,
          tax: tax,
          discount: discountAmount,
          total: total,
          amountDue: total - (existingBilling.amountPaid || 0),
          paymentStatus: appointment.paymentStatus || 'pending',
        });
        console.log('Billing record updated for appointment:', appointment.appointmentId);
      }
    } catch (billingError) {
      console.error('Error updating billing record:', billingError);
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/appointments/:id', auth, async (req, res) => {
  try {
    const appointment = await SpaAppointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Also delete associated billing record
    try {
      await SpaBilling.deleteOne({ appointmentId: appointment._id });
      console.log('Associated billing record deleted');
    } catch (billingError) {
      console.error('Warning: Could not delete associated billing:', billingError);
    }
    
    res.json({ message: 'Appointment and associated billing permanently deleted', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const appointment = await SpaAppointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('service therapist spaRoom package');
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    res.json({ message: 'Appointment status updated', appointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== SPA BILLING ====================

router.get('/billing', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const sort = req.query.sort || '-createdAt';
    const fields = req.query.fields; // comma-separated list
    const paymentStatus = req.query.paymentStatus;
    const expand = req.query.expand !== '0'; // keep existing behavior by default

    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const q = SpaBilling.find(filter);
    if (fields) q.select(fields.split(',').join(' '));
    if (expand) {
      q.populate('appointmentId', 'appointmentId guestName guestPhone guestEmail packageName therapistName serviceName')
        .populate('guestId', 'name email phone');
    }

    const billings = await q.sort(sort).skip(skip).limit(limit).lean();

    res.setHeader('X-Limit', String(limit));
    res.setHeader('X-Skip', String(skip));
    res.setHeader('X-Count', String(billings.length));
    res.setHeader('Cache-Control', 'private, max-age=10');
    res.json(billings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get billing by ID
router.get('/billing/:id', async (req, res) => {
  try {
    const billing = await SpaBilling.findById(req.params.id)
      .populate('appointmentId', 'appointmentId guestName guestPhone guestEmail packageName therapistName serviceName')
      .populate('guestId', 'name email phone')
      .lean();
    if (!billing) return res.status(404).json({ message: 'Billing record not found' });
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get billing by appointment ID
router.get('/billing/appointment/:appointmentId', async (req, res) => {
  try {
    const billing = await SpaBilling.findOne({ appointmentId: req.params.appointmentId })
      .populate('appointmentId', 'appointmentId guestName guestPhone guestEmail')
      .populate('guestId', 'firstName lastName email phone')
      .lean();
    if (!billing) return res.status(404).json({ message: 'Billing record not found for this appointment' });
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create billing record
router.post('/billing', auth, async (req, res) => {
  const billingId = generateId('BIL');
  const billing = new SpaBilling({ ...req.body, billingId });
  try {
    const newBilling = await billing.save();
    await newBilling.populate('appointmentId guestId');
    res.status(201).json(newBilling);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update billing record
router.put('/billing/:id', auth, async (req, res) => {
  try {
    const billing = await SpaBilling.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('appointmentId guestId');
    if (!billing) return res.status(404).json({ message: 'Billing record not found' });
    res.json(billing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/billing/:id', auth, async (req, res) => {
  try {
    await SpaBilling.findByIdAndDelete(req.params.id);
    res.json({ message: 'Billing record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
