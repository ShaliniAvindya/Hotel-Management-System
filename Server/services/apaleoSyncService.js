const { getConfig, ensureToken, apiPut, apiPost, apiGet, apiDelete } = require('./apaleoService');
const Room = require('../models/RoomManaagemnt/Room');

/**
 * Automatically creates a new Unit (Room) in Apaleo when added to HMS.
 */
async function syncRoomAdded(room) {
  try {
    const config = await getConfig();
    if (!config.connected || !config.propertyId) return;

    // 1. Find the mapping for this local room type
    const mapping = config.roomMappings.find(m => m.localRoomType === room.type);
    if (!mapping) {
      console.log(`[Apaleo Sync] No mapping found for room type: ${room.type}`);
      return;
    }

    // 2. Build multilingual description based on Property "DNA"
    // Your property (Hotel Vienna) uses 'de' and 'en'
    const languages = ['de', 'en'];

    const roomObj = room.toObject ? room.toObject() : room;
    const description = {};
    languages.forEach(lang => {
      description[lang] = roomObj.description || `Room ${roomObj.id}`;
    });

    console.log(`[Apaleo Sync Debug] Sending Final Sync for ${roomObj.id} with languages:`, Object.keys(description));

    // 3. Create the Unit in Apaleo
    const token = await ensureToken(config);
    const result = await apiPost('/inventory/v1/units', {
      propertyId: config.propertyId,
      name: roomObj.id, 
      description: description,
      unitGroupId: mapping.apaleoUnitTypeId,
      status: 'Clean',
      maxPersons: roomObj.maxCapacity || roomObj.capacity || 1
    }, token);

    // 4. SAVE the Apaleo Unit ID back to our database
    if (result && result.id) {
      await Room.findOneAndUpdate({ id: roomObj.id }, { apaleoUnitId: result.id });
      console.log(`[Apaleo Sync] Successfully created Unit ${roomObj.id} in Apaleo (ID: ${result.id})`);
    }
  } catch (err) {
    console.error('[Apaleo Sync Error] Failed to create unit in Apaleo:', err.message);
  }
}

/**
 * Automatically deletes a Unit in Apaleo when deleted in HMS.
 */
async function syncRoomDeleted(room) {
  try {
    const config = await getConfig();
    if (!config.connected || !config.propertyId) return;

    // Use the saved Apaleo ID if it exists
    const unitId = room.apaleoUnitId || room.id;

    const token = await ensureToken(config);
    await apiDelete(`/inventory/v1/units/${unitId}`, token);
    console.log(`[Apaleo Sync] Successfully deleted Unit ${unitId} from Apaleo`);
  } catch (err) {
    console.error(`[Apaleo Sync Error] Failed to delete unit:`, err.message);
  }
}

/**
 * Automatically updates a Unit in Apaleo when changed in HMS.
 */
async function syncRoomUpdated(room) {
  try {
    const config = await getConfig();
    if (!config.connected || !config.propertyId) return;

    // Use the saved Apaleo ID
    if (!room.apaleoUnitId) {
       console.log(`[Apaleo Sync] Skipping update: No Apaleo ID found for room ${room.id}`);
       return;
    }

    const mapping = config.roomMappings.find(m => m.localRoomType === room.type);
    if (!mapping) return;

    const token = await ensureToken(config);
    const roomObj = room.toObject ? room.toObject() : room;
    
    const description = { de: roomObj.description || `Room ${roomObj.id}`, en: roomObj.description || `Room ${roomObj.id}` };

    await apiPut(`/inventory/v1/units/${room.apaleoUnitId}`, {
      description: description,
      unitGroupId: mapping.apaleoUnitTypeId,
      status: roomObj.status === 'clean' ? 'Clean' : 'Dirty',
      maxPersons: roomObj.maxCapacity || roomObj.capacity || 1
    }, token);

    console.log(`[Apaleo Sync] Successfully updated Unit ${room.apaleoUnitId} in Apaleo`);
  } catch (err) {
    console.error(`[Apaleo Sync Error] Failed to update unit ${room.id}:`, err.message);
  }
}

/**
 * Pushes a local HMS booking to Apaleo as a Reservation.
 * This blocks the room on Booking.com.
 */
async function syncBookingCreated(booking) {
  try {
    const config = await getConfig();
    if (!config.connected || !config.propertyId) {
      console.log('[Apaleo Sync] Skipping: Apaleo not connected or propertyId missing');
      return;
    }

    // We only sync walk-in or manual bookings (don't sync what came FROM OTA back to OTA)
    if (booking.bookingSource === 'OTA' || booking.apaleoReservationId) {
      console.log(`[Apaleo Sync] Skipping sync for booking ${booking.id}: Source is OTA or already synced.`);
      return;
    }

    const token = await ensureToken(config);
    const bookingObj = booking.toObject ? booking.toObject() : booking;

    // Find the mapped rate plan for this property
    const ratePlans = await apiGet(`/rateplan/v1/rate-plans?propertyId=${config.propertyId}&pageSize=1`, token);
    const ratePlanId = ratePlans.ratePlans?.[0]?.id;

    if (!ratePlanId) {
      console.warn('[Apaleo Sync] Skipping Booking Push: No Rate Plan found in Apaleo');
      return;
    }

    const payload = {
      propertyId: config.propertyId,
      arrival: bookingObj.checkInDate.toISOString().split('T')[0],
      departure: bookingObj.checkOutDate.toISOString().split('T')[0],
      adults: bookingObj.guests || 1,
      children: 0,
      comment: bookingObj.specialRequests || 'Walk-in from HMS',
      primaryGuest: {
        firstName: bookingObj.firstName,
        lastName: bookingObj.lastName || 'Guest',
        email: bookingObj.guestEmail || undefined
      },
      travelPurpose: 'Leisure',
      status: 'Confirmed'
    };

    // Use the unit group mapped to this room type
    let roomType = bookingObj.roomType;
    if (!roomType && bookingObj.roomId) {
      const room = await Room.findOne({ id: bookingObj.roomId }).select('type').lean();
      roomType = room?.type;
    }

    if (!roomType) {
      console.warn(`[Apaleo Sync] Skipping Booking Push for ${bookingObj.id}: Could not determine room type for room ${bookingObj.roomId}`);
      return;
    }

    const mapping = config.roomMappings.find(m => m.localRoomType === roomType);
    if (mapping) {
        console.log(`[Apaleo Sync] Pushing booking ${bookingObj.id} to Apaleo for unit group ${mapping.apaleoUnitTypeId}`);
        const res = await apiPost('/booking/v1/reservations', {
            ...payload,
            ratePlanId: ratePlanId
        }, token);
        
        if (res && res.id) {
            console.log(`[Apaleo Sync] Successfully pushed Booking ${bookingObj.id} to Apaleo (Reservation ID: ${res.id})`);
            // Save the Apaleo ID back to our booking
            const Booking = require('../models/ReservationManagement/Booking');
            await Booking.findOneAndUpdate({ id: bookingObj.id }, { apaleoReservationId: res.id });
        }
    } else {
        console.warn(`[Apaleo Sync] Skipping Booking Push for ${bookingObj.id}: No Apaleo mapping found for room type "${roomType}"`);
    }
  } catch (err) {
    console.error(`[Apaleo Sync Error] Failed to push booking to Apaleo:`, err.message);
  }
}

/**
 * Pushes availability/occupancy blocks to Apaleo.
 * Called when a booking is made or room status changes to maintenance.
 */
async function syncAvailability(fromDate, toDate) {
    // Logic to calculate availability slices and push to /availability/v1/units
    console.log(`[Apaleo Sync] Syncing availability from ${fromDate} to ${toDate}`);
}

/**
 * Pushes rate updates to Apaleo.
 */
async function syncRate(apaleoRatePlanId, priceUpdates) {
  try {
    const config = await getConfig();
    if (!config.connected || !config.propertyId) return;

    const token = await ensureToken(config);
    // Path: /rateplan/v1/rate-plans/{id}/rates
    await apiPut(`/rateplan/v1/rate-plans/${apaleoRatePlanId}/rates`, priceUpdates, token);
    console.log(`[Apaleo Sync] Rates updated for plan ${apaleoRatePlanId}`);
  } catch (err) {
    console.error('[Apaleo Sync Error] Rate sync failed:', err.message);
  }
}

module.exports = {
  syncRoomAdded,
  syncRoomDeleted,
  syncRoomUpdated,
  syncBookingCreated,
  syncAvailability,
  syncRate
};
