const express = require('express');
const router = express.Router();
const axios = require('axios');
const Lead = require('../models/Lead');

router.get('/facebook', (req, res) => {
  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✓ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('✗ Webhook verification failed');
    res.status(403).json({ error: 'Invalid verify token' });
  }
});

// Webhook POST endpoint
router.post('/facebook', async (req, res) => {
  try {
    const { object, entry } = req.body;
    res.status(200).json({ status: 'received' });
    if (object !== 'page' || !entry || !Array.isArray(entry)) {
      return;
    }

    for (const entryItem of entry) {
      if (entryItem.changes && Array.isArray(entryItem.changes)) {
        for (const change of entryItem.changes) {
          if (change.field === 'leadgen' && change.value?.leadgen_id) {
            console.log('Found lead:', change.value.leadgen_id);
            await fetchAndProcessLeadFromMeta(change.value.leadgen_id, entryItem.id);
          }
        }
        continue;
      }
    }
  } catch (err) {
    console.error('❌ [WEBHOOK ERROR]', err.message);
    console.error('   Stack:', err.stack);
    res.status(200).json({ status: 'error', message: err.message });
  }
});

// Fetch lead data from Meta API using leadgen_id
const fetchAndProcessLeadFromMeta = async (leadgenId, pageId) => {
  try {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('✗ FACEBOOK_PAGE_ACCESS_TOKEN not set');
      return;
    }

    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}&fields=id,created_time,ad_id,form_id,field_data`
    );
    const leadData = response.data;
    let platform = 'facebook';
    if (leadData.form_id) {
      try {
        const formResp = await axios.get(
          `https://graph.facebook.com/v19.0/${leadData.form_id}?access_token=${accessToken}&fields=platform`
        );
        if (formResp.data?.platform) {
          platform = formResp.data.platform.toLowerCase();
        }
      } catch {
      }
    }

    await processMetaLead(leadData, platform);
  } catch (err) {
    console.error('✗ Error fetching from Meta API:', err.message);
  }
};

const processMetaLead = async (leadData, platform = 'facebook') => {
  try {
    const { id: facebookLeadId, created_time, field_data } = leadData;
    
    if (!facebookLeadId) {
      return;
    }
    let leadDate = new Date();
    if (created_time) {
      if (typeof created_time === 'number') {
        leadDate = new Date(created_time * 1000);
      } else if (typeof created_time === 'string') {
        leadDate = new Date(created_time);
      }
    }

    const sanitize = (val) => {
      if (!val || typeof val !== 'string') return val;
      if (/test\s+lead|dummy\s+data/i.test(val)) return '';
      return val.trim();
    };

    const resolveCountry = (code) => {
      if (!code || code.length !== 2) return code || '';
      try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code;
      } catch {
        return code;
      }
    };

    // Extract field data
    const fieldMap = {};
    if (field_data && Array.isArray(field_data)) {
      field_data.forEach(field => {
        const value = Array.isArray(field.values) ? field.values[0] : field.value;
        fieldMap[field.name] = sanitize(value);
      });
    }
    const fullName = fieldMap.full_name || '';
    const nameParts = fullName.split(/\s+/).filter(p => p.length > 0);
    const firstName = fieldMap.first_name || fieldMap.firstName || nameParts[0] || '';
    const lastName = fieldMap.last_name || fieldMap.lastName || nameParts.slice(1).join(' ') || '';

    const email = fieldMap.email || fieldMap.email_address || '';
    const phone = fieldMap.phone_number || fieldMap.phone || '';
    const existingLead = await Lead.findOne({ facebookLeadId });
    if (existingLead) {
      return;
    }

    let checkInDate = null;
    let checkOutDate = null;
    const dateStr = fieldMap.check_in_date || fieldMap.arrival_date || fieldMap.desired_checkin_date;
    if (dateStr) {
      checkInDate = new Date(dateStr);
    }
    const checkOutStr = fieldMap.check_out_date || fieldMap.departure_date || fieldMap.desired_checkout_date;
    if (checkOutStr) {
      checkOutDate = new Date(checkOutStr);
    }

    const newLead = new Lead({
      firstName,
      lastName,
      email,
      phone,
      city: fieldMap.city || fieldMap.city_name || '',
      country: resolveCountry(fieldMap.country || fieldMap.country_name || ''),
      status: 'new',
      source: 'meta',
      platform,
      facebookLeadId: facebookLeadId,
      leadDate: leadDate,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      interestedInDates: dateStr || '',
      numberOfGuests: fieldMap.number_of_guests ? parseInt(fieldMap.number_of_guests) : null,
      roomType: fieldMap.room_type || fieldMap.preferred_room_type || '',
      budget: fieldMap.budget ? parseFloat(fieldMap.budget) : null,
      metaData: {
        raw: leadData,
        fields: fieldMap,
        receivedAt: new Date()
      },
      notes: ''
    });

    await newLead.save();
    console.log('✓ Lead saved:', firstName, email);
  } catch (err) {
    console.error('✗ Error saving lead:', err.message);
  }
};


module.exports = router;
