const mongoose = require('mongoose');

// Spa Service 
const spaServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['massage', 'facial', 'body-treatment', 'therapy', 'wellness', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 480, 
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxCapacity: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    benefits: [String],
  },
  { timestamps: true }
);
spaServiceSchema.index({ category: 1, isActive: 1 });
spaServiceSchema.index({ createdAt: -1 });

// Therapist 
const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    specializations: [
      {
        type: String,
        trim: true,
      },
    ],
    certifications: [
      {
        name: String,
        issueDate: Date,
        expiryDate: Date,
        certificateNumber: String,
      },
    ],
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    bio: String,
    availability: {
      Monday: { start: String, end: String, available: Boolean },
      Tuesday: { start: String, end: String, available: Boolean },
      Wednesday: { start: String, end: String, available: Boolean },
      Thursday: { start: String, end: String, available: Boolean },
      Friday: { start: String, end: String, available: Boolean },
      Saturday: { start: String, end: String, available: Boolean },
      Sunday: { start: String, end: String, available: Boolean },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalAppointments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
therapistSchema.index({ isActive: 1, name: 1 });
therapistSchema.index({ createdAt: -1 });

// Spa Room 
const spaRoomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    roomType: {
      type: String,
      enum: ['single', 'double', 'suite', 'vip'],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: [String],
    features: [String],
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'reserved'],
      default: 'available',
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
spaRoomSchema.index({ status: 1, isActive: 1 });
spaRoomSchema.index({ roomType: 1, isActive: 1 });
spaRoomSchema.index({ createdAt: -1 });

// Spa Package 
const spaPackageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    packageType: {
      type: String,
      enum: ['single-service', 'bundle', 'membership', 'package-deal'],
      required: true,
    },
    services: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'SpaService',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    totalDuration: {
      type: Number,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['price', 'percentage'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    validFrom: Date,
    validUntil: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
spaPackageSchema.index({ isActive: 1, packageType: 1 });
spaPackageSchema.index({ createdAt: -1 });

// Spa Appointment 
const spaAppointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestPhone: String,
    guestEmail: String,
    roomNumber: String,
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpaService',
      required: true,
    },
    serviceName: String,
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
    },
    therapistName: String,
    spaRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpaRoom',
    },
    spaRoomNumber: String,
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpaPackage',
    },
    packageName: String,
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    servicePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    therapistPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    roomPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    notes: String,
    specialRequests: String,
    healthNotes: String,
    allergies: [String],
    preferences: [String],
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
spaAppointmentSchema.index({ appointmentDate: -1, status: 1 });
spaAppointmentSchema.index({ guestId: 1, appointmentDate: -1 });
spaAppointmentSchema.index({ therapist: 1, appointmentDate: 1, startTime: 1 });
spaAppointmentSchema.index({ spaRoom: 1, appointmentDate: 1, startTime: 1 });
spaAppointmentSchema.index({ createdAt: -1 });

// Spa Billing 
const spaBillingSchema = new mongoose.Schema(
  {
    billingId: {
      type: String,
      unique: true,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpaAppointment',
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
    },
    guestPhone: {
      type: String,
    },
    guestAddress: {
      type: String,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        subtotal: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'cheque', 'other'],
    },
    notes: String,
    dueDate: Date,
  },
  { timestamps: true }
);
spaBillingSchema.index({ appointmentId: 1 });
spaBillingSchema.index({ guestId: 1, createdAt: -1 });
spaBillingSchema.index({ paymentStatus: 1, dueDate: 1 });
spaBillingSchema.index({ createdAt: -1 });

module.exports = {
  SpaService: mongoose.model('SpaService', spaServiceSchema),
  Therapist: mongoose.model('Therapist', therapistSchema),
  SpaRoom: mongoose.model('SpaRoom', spaRoomSchema),
  SpaPackage: mongoose.model('SpaPackage', spaPackageSchema),
  SpaAppointment: mongoose.model('SpaAppointment', spaAppointmentSchema),
  SpaBilling: mongoose.model('SpaBilling', spaBillingSchema),
};
