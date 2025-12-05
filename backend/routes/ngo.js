const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { geocodeAddress } = require('../services/geocodeService');

// Get NGO profile
router.get('/profile', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, owner_name, email, age, gender, address, volunteer_count,
              latitude as lat, longitude as lng
       FROM ngos WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get NGO profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update NGO profile
router.put('/profile', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const { name, owner_name, age, gender, address, volunteer_count } = req.body;

    let latitude = null, longitude = null;
    if (address) {
      const coords = await geocodeAddress(address);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    let query, params;
    if (latitude && longitude) {
      query = `UPDATE ngos 
               SET name = COALESCE($1, name),
                   owner_name = COALESCE($2, owner_name),
                   age = COALESCE($3, age),
                   gender = COALESCE($4, gender),
                   address = COALESCE($5, address),
                   latitude = $6,
                   longitude = $7,
                   volunteer_count = COALESCE($8, volunteer_count)
               WHERE id = $9
               RETURNING id, name, owner_name, email, age, gender, address, volunteer_count`;
      params = [name, owner_name, age, gender, address, latitude, longitude, volunteer_count, req.user.id];
    } else {
      query = `UPDATE ngos 
               SET name = COALESCE($1, name),
                   owner_name = COALESCE($2, owner_name),
                   age = COALESCE($3, age),
                   gender = COALESCE($4, gender),
                   address = COALESCE($5, address),
                   volunteer_count = COALESCE($6, volunteer_count)
               WHERE id = $7
               RETURNING id, name, owner_name, email, age, gender, address, volunteer_count`;
      params = [name, owner_name, age, gender, address, volunteer_count, req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ message: 'Profile updated', ngo: result.rows[0] });
  } catch (error) {
    console.error('Update NGO profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const ngo = await pool.query(
      'SELECT password FROM ngos WHERE id = $1',
      [req.user.id]
    );

    const isMatch = await bcrypt.compare(currentPassword, ngo.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE ngos SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get NGO dashboard stats
router.get('/stats', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const [activeCampaigns, totalCampaigns, ngoInfo] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM campaigns WHERE ngo_id = $1 AND status = $2', [req.user.id, 'active']),
      pool.query('SELECT COUNT(*) FROM campaigns WHERE ngo_id = $1', [req.user.id]),
      pool.query('SELECT volunteer_count FROM ngos WHERE id = $1', [req.user.id])
    ]);

    res.json({
      activeCampaigns: parseInt(activeCampaigns.rows[0].count),
      totalCampaigns: parseInt(totalCampaigns.rows[0].count),
      volunteerCount: ngoInfo.rows[0].volunteer_count
    });
  } catch (error) {
    console.error('Get NGO stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Create campaign
router.post('/campaigns', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const { title, address, start_date, end_date } = req.body;

    let latitude = null, longitude = null;
    if (address) {
      const coords = await geocodeAddress(address);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    const result = await pool.query(
      `INSERT INTO campaigns (ngo_id, title, latitude, longitude, address, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [req.user.id, title, latitude, longitude, address, start_date, end_date]
    );

    res.status(201).json({ message: 'Campaign created', campaign: result.rows[0] });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get all campaigns for NGO
router.get('/campaigns', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM campaigns 
       WHERE ngo_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Update campaign
router.put('/campaigns/:id', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, address, start_date, end_date, status } = req.body;

    // Verify campaign belongs to this NGO
    const check = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND ngo_id = $2',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    let latitude = null, longitude = null;
    if (address) {
      const coords = await geocodeAddress(address);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    let query, params;
    if (latitude && longitude) {
      query = `UPDATE campaigns 
               SET title = COALESCE($1, title),
                   address = COALESCE($2, address),
                   latitude = $3,
                   longitude = $4,
                   start_date = COALESCE($5, start_date),
                   end_date = COALESCE($6, end_date),
                   status = COALESCE($7, status)
               WHERE id = $8
               RETURNING *`;
      params = [title, address, latitude, longitude, start_date, end_date, status, id];
    } else {
      query = `UPDATE campaigns 
               SET title = COALESCE($1, title),
                   address = COALESCE($2, address),
                   start_date = COALESCE($3, start_date),
                   end_date = COALESCE($4, end_date),
                   status = COALESCE($5, status)
               WHERE id = $6
               RETURNING *`;
      params = [title, address, start_date, end_date, status, id];
    }

    const result = await pool.query(query, params);
    res.json({ message: 'Campaign updated', campaign: result.rows[0] });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/campaigns/:id', auth, roleCheck('ngo'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND ngo_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

module.exports = router;
