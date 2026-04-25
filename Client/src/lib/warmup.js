import { API_BASE_URL } from '../apiconfig';
import { queryClient } from './queryClient';
import { writeViewCache } from './viewCache';

let warmupStarted = false;

const normalize = (data) =>
  Array.isArray(data) ? data : (data?.items && Array.isArray(data.items) ? data.items : []);

const authHeaders = (token) => {
  if (!token) return {};
  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  };
};

const fetchJson = async (path, token) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });

  if (!response.ok) {
    throw new Error(`Warmup failed for ${path}`);
  }

  return response.json();
};

export const primeDashboardSummary = async (token) => {
  try {
    const dashboardSummary = await fetchJson('/dashboard/summary', token);
    queryClient.setQueryData(['dashboard-summary'], dashboardSummary);
    return dashboardSummary;
  } catch (error) {
    return null;
  }
};

export const warmOperationalCaches = async (token, { skipDashboard = false } = {}) => {
  if (warmupStarted || typeof window === 'undefined') return;
  warmupStarted = true;

  try {
    const dashboardSummary = skipDashboard
      ? queryClient.getQueryData(['dashboard-summary']) || null
      : await primeDashboardSummary(token);

    const [
      menuItems,
      orders,
      spaServices,
      activeSpaServices,
      therapists,
      activeTherapists,
      spaRooms,
      activeSpaRooms,
      appointments,
      packages,
      billings,
      bookings,
      rooms,
      payments,
      billingRooms,
      invoices,
      billingPayments,
      billingServices,
      roomRates,
      guests,
      cancellations,
      roomMaintenance,
      maintenanceCategories,
      staffMembers,
      conciergeRequests,
      specialRequests,
    ] = await Promise.all([
      fetchJson('/menu', token).catch(() => []),
      fetchJson('/orders', token).catch(() => []),
      fetchJson('/spa/services?limit=500&fields=_id,serviceName,category,description,duration,basePrice,maxCapacity,benefits,isActive,createdAt', token).catch(() => []),
      fetchJson('/spa/services?limit=500&fields=_id,serviceName,basePrice,duration,isActive&isActive=true', token).catch(() => []),
      fetchJson('/spa/therapists?limit=500&fields=_id,name,email,phone,specializations,hourlyRate,experience,availability,bio,certifications,totalAppointments,isActive', token).catch(() => []),
      fetchJson('/spa/therapists?limit=500&fields=_id,name,hourlyRate,isActive&isActive=true', token).catch(() => []),
      fetchJson('/spa/rooms?limit=500&fields=_id,roomNumber,roomType,capacity,hourlyRate,amenities,features,status,isActive', token).catch(() => []),
      fetchJson('/spa/rooms?limit=500&fields=_id,roomNumber,roomType,status,isActive&isActive=true', token).catch(() => []),
      fetchJson('/spa/appointments?expand=0&limit=500&fields=_id,appointmentId,guestId,guestName,service,serviceName,therapist,therapistName,spaRoom,spaRoomNumber,appointmentDate,startTime,endTime,duration,status,totalPrice,paymentStatus,roomNumber', token).catch(() => []),
      fetchJson('/spa/packages?expand=0&limit=500&fields=_id,packageName,description,packageType,services,originalPrice,discountType,discountValue,totalDuration,validFrom,validUntil,isActive,createdAt', token).catch(() => []),
      fetchJson('/spa/billing?expand=0&limit=500&fields=_id,billingId,appointmentId,guestId,guestName,invoiceDate,subtotal,tax,discount,total,amountPaid,amountDue,paymentStatus,paymentMethod,dueDate', token).catch(() => []),
      fetchJson('/bookings?limit=500&fields=id,status,createdAt,checkInDate,checkOutDate,roomId,totalAmount,firstName,lastName,guests,depositAmount,minibarCharges,additionalServices,damageCharges,finalAmount', token).catch(() => []),
      fetchJson('/rooms?limit=500&fields=id,roomNumber,status,occupancyStatus,type,name', token).catch(() => []),
      fetchJson('/billing/payments?limit=500&fields=id,reservationId,amount,total,status,method,type,date,createdAt', token).catch(() => []),
      fetchJson('/billing/rooms?limit=500&fields=id,name,roomNumber', token).catch(() => []),
      fetchJson('/billing/invoices?limit=500&fields=id,invoiceNumber,reservationId,issueDate,dueDate,subtotal,tax,discount,total,paidAmount', token).catch(() => []),
      fetchJson('/billing/payments?limit=500&fields=id,reservationId,amount,type,method,status,date', token).catch(() => []),
      fetchJson('/billing/services', token).catch(() => []),
      fetchJson('/room-Rates', token).catch(() => []),
      fetchJson('/guests', token).catch(() => []),
      fetchJson('/cancellations', token).catch(() => []),
      fetchJson('/roomMaintenance', token).catch(() => []),
      fetchJson('/roomMaintenance/categories', token).catch(() => []),
      fetchJson('/staffMembers', token).catch(() => []),
      fetchJson('/concierge/requests', token).catch(() => []),
      fetchJson('/specialrequests', token).catch(() => []),
    ]);

    writeViewCache('restaurant-menu-items', normalize(menuItems));
    writeViewCache('restaurant-order-menu-items', normalize(menuItems));
    writeViewCache('restaurant-orders', normalize(orders));
    writeViewCache('restaurant-kitchen-orders', normalize(orders));
    writeViewCache('spa-services', normalize(spaServices));
    writeViewCache('spa-services-active', normalize(activeSpaServices));
    writeViewCache('spa-therapists', normalize(therapists));
    writeViewCache('spa-therapists-active', normalize(activeTherapists));
    writeViewCache('spa-room-booking', normalize(spaRooms));
    writeViewCache('spa-rooms-active', normalize(activeSpaRooms));
    writeViewCache('spa-appointments', normalize(appointments));
    writeViewCache('spa-packages', normalize(packages));
    writeViewCache('spa-package-services', normalize(activeSpaServices));
    writeViewCache('spa-billings', normalize(billings));

    const normalizedBookings = normalize(bookings);
    const normalizedRooms = normalize(rooms);
    const normalizedPayments = normalize(payments);
    const normalizedRoomRates = normalize(roomRates);
    const normalizedGuests = normalize(guests);
    const normalizedCancellations = normalize(cancellations);
    const normalizedRoomMaintenance = normalize(roomMaintenance);
    const normalizedMaintenanceCategories = normalize(maintenanceCategories);
    const normalizedStaffMembers = normalize(staffMembers);
    const normalizedConciergeRequests = normalize(conciergeRequests);
    const normalizedSpecialRequests = normalize(specialRequests);

    queryClient.setQueryData(['rooms'], normalizedRooms);
    queryClient.setQueryData(['room-rates'], normalizedRoomRates);
    queryClient.setQueryData(['bookings'], normalizedBookings);
    queryClient.setQueryData(['guests'], normalizedGuests);
    queryClient.setQueryData(['cancellations'], normalizedCancellations);
    queryClient.setQueryData(['room-maintenance'], normalizedRoomMaintenance);
    queryClient.setQueryData(['maintenance-categories'], normalizedMaintenanceCategories);
    queryClient.setQueryData(['staff-members'], normalizedStaffMembers);
    queryClient.setQueryData(['concierge-requests'], normalizedConciergeRequests);
    queryClient.setQueryData(['special-requests'], normalizedSpecialRequests);

    writeViewCache('room-inventory-page', {
      rooms: normalizedRooms,
      rates: normalizedRoomRates,
    });

    writeViewCache('analytics-page', {
      bookings: normalizedBookings,
      orders: normalize(orders),
      rooms: normalizedRooms,
      payments: normalizedPayments,
    });

    const bookingRooms = normalize(billingRooms);
    const bookingPayments = normalize(billingPayments);
    let invoiceItems = normalize(invoices);
    const roomLookup = new Map(bookingRooms.map((room) => [room.id, room]));
    const mappedReservations = normalizedBookings.map((booking) => {
      const nights = Math.max(
        Math.ceil(
          (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
            (1000 * 60 * 60 * 24)
        ),
        1
      );

      return {
        id: booking.id,
        guestName: `${booking.firstName || ''} ${booking.lastName || ''}`.trim(),
        roomId: booking.roomId,
        room: roomLookup.get(booking.roomId) || { name: 'Unknown', roomNumber: 'N/A' },
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
        guests: booking.guests,
        nights,
        roomRate: Number(booking.totalAmount || 0) / nights,
        totalRoomCharges: Number(booking.totalAmount || 0),
        status: String(booking.status || '').replace('-', '_'),
        bookingDate: booking.createdAt,
        advancePayment: booking.depositAmount,
        deposit: booking.depositAmount,
        additionalCharges: [
          ...(booking.minibarCharges ? [{ serviceId: 'minibar', quantity: 1, unitPrice: booking.minibarCharges, total: booking.minibarCharges, date: booking.checkInDate }] : []),
          ...(booking.additionalServices ? [{ serviceId: 'additional_services', quantity: 1, unitPrice: booking.additionalServices, total: booking.additionalServices, date: booking.checkInDate }] : []),
          ...(booking.damageCharges ? [{ serviceId: 'damage', quantity: 1, unitPrice: booking.damageCharges, total: booking.damageCharges, date: booking.checkInDate }] : []),
        ],
        finalAmount: booking.finalAmount,
      };
    });

    const now = new Date();
    invoiceItems = invoiceItems.map((invoice) => ({
      ...invoice,
      status:
        invoice.paidAmount >= invoice.total
          ? 'paid'
          : new Date(invoice.dueDate) < now
            ? 'overdue'
            : 'pending',
      reservation: mappedReservations.find((reservation) => reservation.id === invoice.reservationId) || null,
      payments: bookingPayments.filter((payment) => payment.reservationId === invoice.reservationId),
    }));

    writeViewCache('billing-invoice-page', {
      reservations: mappedReservations,
      invoices: invoiceItems,
      payments: bookingPayments,
      rooms: bookingRooms,
      additionalServices: normalize(billingServices),
    });
  } catch (error) {
    warmupStarted = false;
    console.warn('Operational cache warmup skipped', error);
  }
};

export const resetOperationalWarmup = () => {
  warmupStarted = false;
};
