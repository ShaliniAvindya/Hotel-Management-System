const express = require('express');
const { Invoice, Payment } = require('../models/Billing');
const Booking = require('../models/ReservationManagement/Booking');
const Room = require('../models/RoomManaagemnt/Room');

const router = express.Router();

// Helper to validate and format dates
const validateAndFormatDate = (date) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) throw new Error('Invalid date format');
  return parsedDate.toISOString().split('T')[0];
};

// Helper to calculate invoice status
const calculateInvoiceStatus = (total, paidAmount, dueDate) => {
  if (paidAmount >= total) return 'paid';
  return new Date(dueDate) < new Date() ? 'overdue' : 'pending';
};


router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    const booking = await Booking.findOne({ id: invoiceData.reservationId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    invoiceData.issueDate = validateAndFormatDate(invoiceData.issueDate);
    invoiceData.dueDate = validateAndFormatDate(invoiceData.dueDate);

    // Generate unique invoice ID
    if (!invoiceData.id) {
      const allIds = await Invoice.find({}, { id: 1, _id: 0 });
      let maxIdNum = 0;
      allIds.forEach(i => {
        if (i.id && /^INV\d+$/.test(i.id)) {
          const num = parseInt(i.id.slice(3));
          if (num > maxIdNum) maxIdNum = num;
        }
      });
      invoiceData.id = `INV${String(maxIdNum + 1).padStart(3, '0')}`;
    }

    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = `INV-${new Date().getFullYear()}-${String((await Invoice.countDocuments()) + 1).padStart(3, '0')}`;
    }

    const additionalCharges = [
      ...(booking.minibarCharges ? [{ description: 'Minibar', quantity: 1, unitPrice: booking.minibarCharges, total: booking.minibarCharges }] : []),
      ...(booking.additionalServices ? [{ description: 'Additional Services', quantity: 1, unitPrice: booking.additionalServices, total: booking.additionalServices }] : []),
      ...(booking.damageCharges ? [{ description: 'Damage Charges', quantity: 1, unitPrice: booking.damageCharges, total: booking.damageCharges }] : []),
    ];

    const subtotal = booking.totalAmount + additionalCharges.reduce((sum, charge) => sum + charge.total, 0);
    const tax = subtotal * 0.1; 
    const total = subtotal + tax;
    const paidAmount = (await Payment.find({ reservationId: invoiceData.reservationId }))
      .reduce((sum, p) => sum + p.amount, 0);

    invoiceData.items = [
      {
        description: `Room Charges (${Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} nights)`,
        quantity: Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
        unitPrice: booking.totalAmount / Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
        total: booking.totalAmount,
      },
      ...additionalCharges,
    ];
    invoiceData.subtotal = subtotal;
    invoiceData.tax = tax;
    invoiceData.total = total;
    invoiceData.paidAmount = paidAmount;
    invoiceData.status = calculateInvoiceStatus(total, paidAmount, invoiceData.dueDate);

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const updatedData = req.body;
    if (updatedData.dueDate) updatedData.dueDate = validateAndFormatDate(updatedData.dueDate);
    updatedData.status = calculateInvoiceStatus(invoice.total, updatedData.paidAmount || invoice.paidAmount, updatedData.dueDate || invoice.dueDate);

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { id: req.params.id },
      updatedData,
      { new: true }
    );
    res.json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new payment
router.post('/payments', async (req, res) => {
  try {
    const paymentData = req.body;
    const booking = await Booking.findOne({ id: paymentData.reservationId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    paymentData.date = validateAndFormatDate(paymentData.date);

    // Generate unique payment ID
    if (!paymentData.id) {
      const allIds = await Payment.find({}, { id: 1, _id: 0 });
      let maxIdNum = 0;
      allIds.forEach(p => {
        if (p.id && /^PAY\d+$/.test(p.id)) {
          const num = parseInt(p.id.slice(3));
          if (num > maxIdNum) maxIdNum = num;
        }
      });
      paymentData.id = `PAY${String(maxIdNum + 1).padStart(3, '0')}`;
    }
    const payment = new Payment(paymentData);
    await payment.save();

    // Update invoice
    const invoice = await Invoice.findOne({ reservationId: paymentData.reservationId });
    if (invoice) {
      const totalPaid = (await Payment.find({ reservationId: paymentData.reservationId }))
        .reduce((sum, p) => sum + p.amount, 0);
      const updatedFields = {
        paidAmount: totalPaid,
        status: calculateInvoiceStatus(invoice.total, totalPaid, invoice.dueDate),
      };
      await Invoice.findOneAndUpdate(
        { id: invoice.id },
        updatedFields,
        { new: true }
      );
    }

    // Update booking's finalAmount
    const totalPaid = (await Payment.find({ reservationId: paymentData.reservationId }))
      .reduce((sum, p) => sum + p.amount, 0);
    await Booking.findOneAndUpdate(
      { id: paymentData.reservationId },
      { finalAmount: totalPaid },
      { new: true }
    );

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const services = [
      { id: 'minibar', name: 'Minibar', category: 'room', basePrice: 15 },
      { id: 'restaurant', name: 'Restaurant Dining', category: 'dining', basePrice: 45 },
      { id: 'room_service', name: 'Room Service', category: 'dining', basePrice: 35 },
      { id: 'spa', name: 'Spa Services', category: 'wellness', basePrice: 80 },
      { id: 'laundry', name: 'Laundry Service', category: 'service', basePrice: 25 },
      { id: 'parking', name: 'Parking', category: 'service', basePrice: 20 },
      { id: 'wifi_premium', name: 'Premium WiFi', category: 'technology', basePrice: 10 },
      { id: 'breakfast', name: 'Breakfast', category: 'dining', basePrice: 18 },
      { id: 'airport_transfer', name: 'Airport Transfer', category: 'transport', basePrice: 60 },
      { id: 'late_checkout', name: 'Late Checkout', category: 'service', basePrice: 30 },
      { id: 'damage', name: 'Damage Charges', category: 'service', basePrice: 0 },
    ];
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;