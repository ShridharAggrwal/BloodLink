const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { sendAppointmentBookingEmail } = require('../services/emailServiceSendGrid');

// ========================
// USER ROUTES
// ========================

// Get available slots for a specific blood bank
router.get('/slots/:bankId', auth, async (req, res) => {
  try {
    const { bankId } = req.params;
    const { date } = req.query; // Optional specific date

    // Get blood bank info
    const bankResult = await pool.query(
      'SELECT id, name, address FROM blood_banks WHERE id = $1',
      [bankId]
    );

    if (bankResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    // If a specific date is provided, get slots for that date
    if (date) {
      const dayOfWeek = new Date(date).getDay();
      
      // First check for specific date slots
      let slotsResult = await pool.query(
        `SELECT id, slot_date, start_time, end_time, max_bookings, current_bookings,
                (max_bookings - current_bookings) as available_slots
         FROM appointment_slots
         WHERE blood_bank_id = $1 AND slot_date = $2 AND is_available = TRUE
         ORDER BY start_time`,
        [bankId, date]
      );

      // If no specific slots, generate from defaults
      if (slotsResult.rows.length === 0) {
        const defaultsResult = await pool.query(
          `SELECT id, day_of_week, start_time, end_time, max_bookings
           FROM default_appointment_slots
           WHERE blood_bank_id = $1 AND day_of_week = $2 AND is_active = TRUE
           ORDER BY start_time`,
          [bankId, dayOfWeek]
        );

        // Create slots from defaults for this date
        for (const defaultSlot of defaultsResult.rows) {
          await pool.query(
            `INSERT INTO appointment_slots (blood_bank_id, slot_date, start_time, end_time, max_bookings, current_bookings, is_available)
             VALUES ($1, $2, $3, $4, $5, 0, TRUE)
             ON CONFLICT (blood_bank_id, slot_date, start_time) DO NOTHING`,
            [bankId, date, defaultSlot.start_time, defaultSlot.end_time, defaultSlot.max_bookings]
          );
        }

        // Query again
        slotsResult = await pool.query(
          `SELECT id, slot_date, start_time, end_time, max_bookings, current_bookings,
                  (max_bookings - current_bookings) as available_slots
           FROM appointment_slots
           WHERE blood_bank_id = $1 AND slot_date = $2 AND is_available = TRUE
           ORDER BY start_time`,
          [bankId, date]
        );
      }

      return res.json({
        bank: bankResult.rows[0],
        date,
        slots: slotsResult.rows.filter(s => s.available_slots > 0)
      });
    }

    // Return default schedule if no date specified
    const defaultsResult = await pool.query(
      `SELECT id, day_of_week, start_time, end_time, max_bookings
       FROM default_appointment_slots
       WHERE blood_bank_id = $1 AND is_active = TRUE
       ORDER BY day_of_week, start_time`,
      [bankId]
    );

    res.json({
      bank: bankResult.rows[0],
      defaultSchedule: defaultsResult.rows
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Book an appointment (User)
router.post('/book', auth, roleCheck('user'), async (req, res) => {
  try {
    const { slotId, notes } = req.body;
    const userId = req.user.id;

    // Get user info
    const userResult = await pool.query(
      'SELECT name, email, phone, blood_group FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.blood_group) {
      return res.status(400).json({ error: 'Please update your blood group in your profile before booking' });
    }

    // Get slot info and check availability
    const slotResult = await pool.query(
      `SELECT s.*, bb.name as bank_name, bb.email as bank_email, bb.address as bank_address
       FROM appointment_slots s
       JOIN blood_banks bb ON s.blood_bank_id = bb.id
       WHERE s.id = $1`,
      [slotId]
    );

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    const slot = slotResult.rows[0];

    if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
      return res.status(400).json({ error: 'This slot is no longer available' });
    }

    // Check if user already has an appointment at this slot
    const existingResult = await pool.query(
      'SELECT id FROM appointments WHERE slot_id = $1 AND user_id = $2 AND status != $3',
      [slotId, userId, 'cancelled']
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a booking for this slot' });
    }

    // Create appointment
    const appointmentResult = await pool.query(
      `INSERT INTO appointments (slot_id, blood_bank_id, user_id, user_name, user_email, user_phone, blood_group, appointment_date, appointment_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING *`,
      [slotId, slot.blood_bank_id, userId, user.name, user.email, user.phone, user.blood_group, slot.slot_date, slot.start_time, notes]
    );

    // Update slot booking count
    await pool.query(
      'UPDATE appointment_slots SET current_bookings = current_bookings + 1 WHERE id = $1',
      [slotId]
    );

    // Send email to blood bank
    try {
      await sendAppointmentBookingEmail(slot.bank_email, {
        bankName: slot.bank_name,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        bloodGroup: user.blood_group,
        appointmentDate: slot.slot_date,
        appointmentTime: slot.start_time,
        notes: notes
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: appointmentResult.rows[0],
      bankDetails: {
        name: slot.bank_name,
        address: slot.bank_address,
        date: slot.slot_date,
        time: slot.start_time
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get user's appointments
router.get('/my-appointments', auth, roleCheck('user'), async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT a.*, bb.name as bank_name, bb.address as bank_address, bb.contact_info as bank_phone
       FROM appointments a
       JOIN blood_banks bb ON a.blood_bank_id = bb.id
       WHERE a.user_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Cancel user's appointment
router.put('/cancel/:id', auth, roleCheck('user'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify appointment belongs to user
    const appointmentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment already cancelled' });
    }

    // Update appointment status
    await pool.query(
      "UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    // Decrease slot booking count
    await pool.query(
      'UPDATE appointment_slots SET current_bookings = GREATEST(current_bookings - 1, 0) WHERE id = $1',
      [appointment.slot_id]
    );

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// ========================
// BLOOD BANK ROUTES
// ========================

// Get blood bank's default slots
router.get('/bank-defaults', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const bankId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM default_appointment_slots
       WHERE blood_bank_id = $1
       ORDER BY day_of_week, start_time`,
      [bankId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get default slots error:', error);
    res.status(500).json({ error: 'Failed to get default slots' });
  }
});

// Create/Update blood bank's default slots
router.post('/bank-defaults', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const bankId = req.user.id;
    const { slots } = req.body; // Array of { day_of_week, start_time, end_time, max_bookings }

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Slots array is required' });
    }

    // Delete existing defaults and recreate (simpler than updating)
    await pool.query('DELETE FROM default_appointment_slots WHERE blood_bank_id = $1', [bankId]);

    for (const slot of slots) {
      await pool.query(
        `INSERT INTO default_appointment_slots (blood_bank_id, day_of_week, start_time, end_time, max_bookings, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [bankId, slot.day_of_week, slot.start_time, slot.end_time, slot.max_bookings || 5]
      );
    }

    const result = await pool.query(
      `SELECT * FROM default_appointment_slots WHERE blood_bank_id = $1 ORDER BY day_of_week, start_time`,
      [bankId]
    );

    res.json({ message: 'Default slots updated', slots: result.rows });
  } catch (error) {
    console.error('Update default slots error:', error);
    res.status(500).json({ error: 'Failed to update default slots' });
  }
});

// Get blood bank's slots for a specific date
router.get('/bank-slots', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const bankId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await pool.query(
      `SELECT * FROM appointment_slots
       WHERE blood_bank_id = $1 AND slot_date = $2
       ORDER BY start_time`,
      [bankId, date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get bank slots error:', error);
    res.status(500).json({ error: 'Failed to get slots' });
  }
});

// Update a specific slot for a date
router.put('/bank-slots/:id', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const bankId = req.user.id;
    const { id } = req.params;
    const { max_bookings, is_available } = req.body;

    const result = await pool.query(
      `UPDATE appointment_slots
       SET max_bookings = COALESCE($1, max_bookings),
           is_available = COALESCE($2, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND blood_bank_id = $4
       RETURNING *`,
      [max_bookings, is_available, id, bankId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    res.json({ message: 'Slot updated', slot: result.rows[0] });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// Get blood bank's bookings
router.get('/bank-bookings', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const bankId = req.user.id;
    const { status, date } = req.query;

    let query = `SELECT a.*, s.start_time, s.end_time
                 FROM appointments a
                 JOIN appointment_slots s ON a.slot_id = s.id
                 WHERE a.blood_bank_id = $1`;
    const params = [bankId];
    let paramIndex = 2;

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (date) {
      query += ` AND a.appointment_date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get bank bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Update appointment status (Blood Bank)
router.put('/status/:id', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const bankId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const currentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND blood_bank_id = $2',
      [id, bankId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const currentAppointment = currentResult.rows[0];

    // If changing to cancelled, decrease slot count
    if (status === 'cancelled' && currentAppointment.status !== 'cancelled') {
      await pool.query(
        'UPDATE appointment_slots SET current_bookings = GREATEST(current_bookings - 1, 0) WHERE id = $1',
        [currentAppointment.slot_id]
      );
    }
    // If un-cancelling, increase slot count
    else if (currentAppointment.status === 'cancelled' && status !== 'cancelled') {
      await pool.query(
        'UPDATE appointment_slots SET current_bookings = current_bookings + 1 WHERE id = $1',
        [currentAppointment.slot_id]
      );
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({ message: 'Appointment status updated', appointment: result.rows[0] });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
