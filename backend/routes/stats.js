const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get public stats for home page
router.get('/', async (req, res) => {
  try {
    const [donors, bloodBanks, ngos, donations] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE is_verified = TRUE'),
      pool.query('SELECT COUNT(*) FROM blood_banks'),
      pool.query('SELECT COUNT(*) FROM ngos'),
      pool.query('SELECT COUNT(*) FROM donations')
    ]);

    res.json({
      activeDonors: parseInt(donors.rows[0].count),
      bloodBanks: parseInt(bloodBanks.rows[0].count),
      ngos: parseInt(ngos.rows[0].count),
      livesSaved: parseInt(donations.rows[0].count) // Each donation counts as a life saved
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get all active campaigns (public)
router.get('/campaigns', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, n.name as ngo_name 
       FROM campaigns c
       JOIN ngos n ON c.ngo_id = n.id
       WHERE c.status = 'active' AND c.end_date > NOW()
       ORDER BY c.start_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Get all blood banks with stock (public)
router.get('/blood-banks', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bb.id, bb.name, bb.address, bb.contact_info,
              json_agg(json_build_object('blood_group', bs.blood_group, 'units', bs.units_available)) as stock
       FROM blood_banks bb
       LEFT JOIN blood_stock bs ON bb.id = bs.blood_bank_id
       GROUP BY bb.id
       ORDER BY bb.name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get blood banks error:', error);
    res.status(500).json({ error: 'Failed to get blood banks' });
  }
});

module.exports = router;

