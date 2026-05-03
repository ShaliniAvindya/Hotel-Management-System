const CACHE_PREFIX = 'hotel-management-view-cache-v3';
const LEGACY_CACHE_PREFIXES = ['hotel-management-view-cache-v2'];
const DEFAULT_MAX_AGE_MS = 10 * 60 * 1000;

const pick = (value, keys) => {
  if (!value || typeof value !== 'object') return {};
  return keys.reduce((result, key) => {
    if (value[key] !== undefined) {
      result[key] = value[key];
    }
    return result;
  }, {});
};

const sanitizeAdditionalCharge = (charge) =>
  pick(charge, ['id', 'serviceId', 'quantity', 'unitPrice', 'total', 'date']);

const sanitizeRoom = (room) => pick(room, ['id', 'name', 'roomNumber', 'status', 'type']);

const sanitizeInventoryRoom = (room) => ({
  ...pick(room, [
    'id',
    'roomNumber',
    'name',
    'type',
    'status',
    'occupancyStatus',
    'floor',
    'capacity',
    'maxCapacity',
    'basePrice',
    'weekendPrice',
    'description',
    'size',
    'bedType',
    'bathroomType',
  ]),
  amenities: Array.isArray(room?.amenities) ? room.amenities : [],
  features: Array.isArray(room?.features) ? room.features : [],
  images: Array.isArray(room?.images) ? room.images : [],
});

const sanitizeRoomRate = (rate) => ({
  ...pick(rate, [
    '_id',
    'id',
    'rateType',
    'name',
    'description',
    'status',
    'roomType',
    'roomId',
    'basePrice',
    'weekendPrice',
    'validFrom',
    'validTo',
    'refundable',
    'breakfastIncluded',
  ]),
  inclusions: Array.isArray(rate?.inclusions) ? rate.inclusions : [],
  restrictions:
    rate?.restrictions && typeof rate.restrictions === 'object' ? rate.restrictions : undefined,
});

const sanitizeBillingReservation = (reservation) => ({
  ...pick(reservation, [
    'id',
    'guestName',
    'roomId',
    'checkIn',
    'checkOut',
    'guests',
    'nights',
    'roomRate',
    'totalRoomCharges',
    'status',
    'bookingDate',
    'advancePayment',
    'deposit',
    'finalAmount',
  ]),
  room: sanitizeRoom(reservation?.room),
  additionalCharges: Array.isArray(reservation?.additionalCharges)
    ? reservation.additionalCharges.map(sanitizeAdditionalCharge)
    : [],
});

const sanitizeBillingPayment = (payment) =>
  pick(payment, ['id', 'reservationId', 'amount', 'type', 'method', 'status', 'date']);

const sanitizeBillingInvoice = (invoice) => ({
  ...pick(invoice, [
    'id',
    'invoiceNumber',
    'reservationId',
    'issueDate',
    'dueDate',
    'subtotal',
    'tax',
    'discount',
    'total',
    'paidAmount',
    'status',
  ]),
  reservation: invoice?.reservation ? sanitizeBillingReservation(invoice.reservation) : null,
  payments: Array.isArray(invoice?.payments) ? invoice.payments.map(sanitizeBillingPayment) : [],
});

const sanitizeSpaAppointment = (appointment) =>
  pick(appointment, [
    '_id',
    'appointmentId',
    'guestId',
    'guestName',
    'service',
    'serviceName',
    'therapist',
    'therapistName',
    'spaRoom',
    'spaRoomNumber',
    'appointmentDate',
    'startTime',
    'endTime',
    'duration',
    'status',
    'totalPrice',
    'paymentStatus',
    'roomNumber',
  ]);

const sanitizeSpaBilling = (billing) =>
  pick(billing, [
    '_id',
    'billingId',
    'appointmentId',
    'guestId',
    'guestName',
    'invoiceDate',
    'subtotal',
    'tax',
    'discount',
    'total',
    'amountPaid',
    'amountDue',
    'paymentStatus',
    'paymentMethod',
    'dueDate',
  ]);

const sanitizeLead = (lead) =>
  pick(lead, [
    '_id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'city',
    'country',
    'status',
    'source',
    'platform',
    'leadDate',
    'checkInDate',
    'checkOutDate',
    'notes',
    'interestedInDates',
    'numberOfGuests',
    'roomType',
    'budget',
    'facebookLeadId',
    'assignedTo',
    'followUpDate',
    'isFollowedUp',
    'createdAt',
    'updatedAt',
  ]);

const sanitizeAnalyticsSnapshot = (snapshot) => ({
  bookings: Array.isArray(snapshot?.bookings)
    ? snapshot.bookings.map((booking) =>
        pick(booking, ['id', 'status', 'createdAt', 'checkInDate', 'checkOutDate', 'roomId', 'totalAmount'])
      )
    : [],
  orders: Array.isArray(snapshot?.orders) ? snapshot.orders : [],
  rooms: Array.isArray(snapshot?.rooms) ? snapshot.rooms.map(sanitizeRoom) : [],
  payments: Array.isArray(snapshot?.payments)
    ? snapshot.payments.map((payment) =>
        pick(payment, ['id', 'reservationId', 'amount', 'total', 'status', 'method', 'type', 'date', 'createdAt'])
      )
    : [],
});

const cacheSanitizers = {
  'billing-invoice-page': (snapshot) => ({
    reservations: Array.isArray(snapshot?.reservations)
      ? snapshot.reservations.map(sanitizeBillingReservation)
      : [],
    invoices: Array.isArray(snapshot?.invoices) ? snapshot.invoices.map(sanitizeBillingInvoice) : [],
    payments: Array.isArray(snapshot?.payments) ? snapshot.payments.map(sanitizeBillingPayment) : [],
    rooms: Array.isArray(snapshot?.rooms) ? snapshot.rooms.map(sanitizeRoom) : [],
    additionalServices: Array.isArray(snapshot?.additionalServices) ? snapshot.additionalServices : [],
  }),
  'meta-leads': (leads) =>
    Array.isArray(leads) ? leads.map(sanitizeLead) : [],
  'spa-appointments': (appointments) =>
    Array.isArray(appointments) ? appointments.map(sanitizeSpaAppointment) : [],
  'spa-billings': (billings) =>
    Array.isArray(billings) ? billings.map(sanitizeSpaBilling) : [],
  'analytics-page': sanitizeAnalyticsSnapshot,
  'room-inventory-page': (snapshot) => ({
    rooms: Array.isArray(snapshot?.rooms) ? snapshot.rooms.map(sanitizeInventoryRoom) : [],
    rates: Array.isArray(snapshot?.rates) ? snapshot.rates.map(sanitizeRoomRate) : [],
  }),
};

const sanitizeCacheValue = (key, data) => {
  const sanitizer = cacheSanitizers[key];
  return sanitizer ? sanitizer(data) : data;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
};

const clearLegacyViewCaches = () => {
  const storage = getStorage();
  if (!storage) return;

  try {
    const keysToRemove = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (LEGACY_CACHE_PREFIXES.some((prefix) => key?.startsWith(`${prefix}:`))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear legacy cached view data', error);
  }
};

clearLegacyViewCaches();

export const readViewCache = (key, { fallback = null, maxAgeMs = DEFAULT_MAX_AGE_MS } = {}) => {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(`${CACHE_PREFIX}:${key}`);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > maxAgeMs) {
      storage.removeItem(`${CACHE_PREFIX}:${key}`);
      return fallback;
    }

    return parsed.data ?? fallback;
  } catch (error) {
    console.warn(`Failed to read cached view data for ${key}`, error);
    return fallback;
  }
};

export const writeViewCache = (key, data) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      `${CACHE_PREFIX}:${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        data: sanitizeCacheValue(key, data),
      })
    );
  } catch (error) {
    console.warn(`Failed to write cached view data for ${key}`, error);
  }
};

export const clearViewCache = () => {
  const storage = getStorage();
  if (!storage) return;

  try {
    const keysToRemove = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(`${CACHE_PREFIX}:`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear cached view data', error);
  }
};
