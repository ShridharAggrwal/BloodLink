const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Haversine formula to calculate distance in meters
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get Blood Bank profile
router.get('/profile', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, contact_info, address, latitude as lat, longitude as lng, profile_image_url
       FROM blood_banks WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blood Bank not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get Blood Bank profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update Blood Bank profile
router.put('/profile', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const { name, contact_info, address, latitude, longitude, profile_image_url } = req.body;

    const result = await pool.query(
      `UPDATE blood_banks 
       SET name = COALESCE($1, name),
           contact_info = COALESCE($2, contact_info),
           address = COALESCE($3, address),
           latitude = COALESCE($4, latitude),
           longitude = COALESCE($5, longitude),
           profile_image_url = COALESCE($6, profile_image_url)
       WHERE id = $7
       RETURNING id, name, email, contact_info, address, latitude, longitude, profile_image_url`,
      [name, contact_info, address, latitude, longitude, profile_image_url, req.user.id]
    );
    res.json({ message: 'Profile updated', bloodBank: result.rows[0] });
  } catch (error) {
    console.error('Update Blood Bank profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const bloodBank = await pool.query(
      'SELECT password FROM blood_banks WHERE id = $1',
      [req.user.id]
    );

    const isMatch = await bcrypt.compare(currentPassword, bloodBank.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE blood_banks SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get blood stock
router.get('/stock', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blood_stock 
       WHERE blood_bank_id = $1 
       ORDER BY blood_group`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
});

// Update blood stock
router.put('/stock', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const { blood_group, units_available } = req.body;

    const result = await pool.query(
      `UPDATE blood_stock 
       SET units_available = $1, updated_at = CURRENT_TIMESTAMP
       WHERE blood_bank_id = $2 AND blood_group = $3
       RETURNING *`,
      [units_available, req.user.id, blood_group]
    );

    if (result.rows.length === 0) {
      // Insert if not exists
      const insertResult = await pool.query(
        `INSERT INTO blood_stock (blood_bank_id, blood_group, units_available)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.user.id, blood_group, units_available]
      );
      return res.json({ message: 'Stock updated', stock: insertResult.rows[0] });
    }

    res.json({ message: 'Stock updated', stock: result.rows[0] });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Get incoming blood requests (within 35km)
router.get('/requests', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    // Get blood bank location
    const bbResult = await pool.query(
      'SELECT latitude, longitude FROM blood_banks WHERE id = $1',
      [req.user.id]
    );

    const bbLat = bbResult.rows[0]?.latitude;
    const bbLng = bbResult.rows[0]?.longitude;

    if (!bbLat || !bbLng) {
      return res.json([]);
    }

    // Get all active requests
    const requestsResult = await pool.query(
      `SELECT * FROM blood_requests 
       WHERE status = 'active'
         AND latitude IS NOT NULL 
         AND longitude IS NOT NULL
       ORDER BY created_at DESC`
    );

    // Filter requests within 35km
    const requests = requestsResult.rows
      .map(r => ({
        ...r,
        distance: haversineDistance(bbLat, bbLng, r.latitude, r.longitude)
      }))
      .filter(r => r.distance <= 35000)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get dashboard stats
router.get('/stats', auth, roleCheck('blood_bank'), async (req, res) => {
  try {
    const stockResult = await pool.query(
      'SELECT SUM(units_available) as total FROM blood_stock WHERE blood_bank_id = $1',
      [req.user.id]
    );

    // Get blood bank location for request count
    const bbResult = await pool.query(
      'SELECT latitude, longitude FROM blood_banks WHERE id = $1',
      [req.user.id]
    );

    const bbLat = bbResult.rows[0]?.latitude;
    const bbLng = bbResult.rows[0]?.longitude;

    let pendingRequests = 0;
    if (bbLat && bbLng) {
      const requestsResult = await pool.query(
        `SELECT latitude, longitude FROM blood_requests 
         WHERE status = 'active' AND latitude IS NOT NULL AND longitude IS NOT NULL`
      );
      pendingRequests = requestsResult.rows.filter(r =>
        haversineDistance(bbLat, bbLng, r.latitude, r.longitude) <= 35000
      ).length;
    }

    res.json({
      totalUnits: parseInt(stockResult.rows[0].total) || 0,
      pendingRequests
    });
  } catch (error) {
    console.error('Get Blood Bank stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
