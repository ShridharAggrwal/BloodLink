const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateToken, getExpiryDate } = require('../utils/helpers');
const { sendVerificationEmail } = require('../services/emailServiceSendGrid');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, gender, blood_group, address, latitude, longitude } = req.body;

    // Check if email exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Get coordinates from browser navigator or manual input
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location coordinates are required. Please allow location access or enter manually.'
      });
    }

    const finalLatitude = parseFloat(latitude);
    const finalLongitude = parseFloat(longitude);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, gender, blood_group, address, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, email`,
      [name, email, hashedPassword, phone, gender, blood_group, address, finalLatitude, finalLongitude]
    );

    // Create verification token
    const verificationToken = generateToken();
    const expiryDate = getExpiryDate(1);

    await pool.query(
      `INSERT INTO email_verifications (user_id, user_type, token, expires_at)
       VALUES ($1, 'user', $2, $3)`,
      [result.rows[0].id, verificationToken, expiryDate]
    );

    console.log('Verification token created:', verificationToken);
    console.log('Token expires at:', expiryDate);

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken)
      .then(() => console.log('✅ Verification email queued for:', email))
      .catch(err => console.error('❌ Email failed:', err.message));

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Register NGO with token
router.post('/register/ngo/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { name, owner_name, email, password, age, gender, address, volunteer_count, latitude, longitude } = req.body;

    // Validate token
    const tokenResult = await pool.query(
      `SELECT * FROM signup_tokens 
       WHERE token = $1 AND type = 'ngo' AND is_used = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired registration link' });
    }

    // Get coordinates from browser navigator or manual input
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location coordinates are required. Please allow location access or enter manually.'
      });
    }

    const finalLatitude = parseFloat(latitude);
    const finalLongitude = parseFloat(longitude);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert NGO (auto-verified since created by admin)
    const result = await pool.query(
      `INSERT INTO ngos (name, owner_name, email, password, age, gender, address, latitude, longitude, volunteer_count, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
       RETURNING id, name, email`,
      [name, owner_name, email, hashedPassword, age, gender, address, finalLatitude, finalLongitude, volunteer_count || 0]
    );

    // Mark token as used
    await pool.query(
      'UPDATE signup_tokens SET is_used = TRUE WHERE token = $1',
      [token]
    );

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: result.rows[0].id, email, role: 'ngo' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'NGO registration successful',
      token: jwtToken,
      user: { ...result.rows[0], role: 'ngo' }
    });
  } catch (error) {
    console.error('NGO registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Register Blood Bank with token
router.post('/register/blood-bank/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { name, email, password, contact_info, address, latitude, longitude } = req.body;

    // Validate token
    const tokenResult = await pool.query(
      `SELECT * FROM signup_tokens 
       WHERE token = $1 AND type = 'blood_bank' AND is_used = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired registration link' });
    }

    // Get coordinates from browser navigator or manual input
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location coordinates are required. Please allow location access or enter manually.'
      });
    }

    const finalLatitude = parseFloat(latitude);
    const finalLongitude = parseFloat(longitude);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert Blood Bank (auto-verified since created by admin)
    const result = await pool.query(
      `INSERT INTO blood_banks (name, email, password, contact_info, address, latitude, longitude, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, name, email`,
      [name, email, hashedPassword, contact_info, address, finalLatitude, finalLongitude]
    );

    // Mark token as used
    await pool.query(
      'UPDATE signup_tokens SET is_used = TRUE WHERE token = $1',
      [token]
    );

    // Initialize blood stock for all blood groups
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const bg of bloodGroups) {
      await pool.query(
        'INSERT INTO blood_stock (blood_bank_id, blood_group, units_available) VALUES ($1, $2, 0)',
        [result.rows[0].id, bg]
      );
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: result.rows[0].id, email, role: 'blood_bank' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Blood Bank registration successful',
      token: jwtToken,
      user: { ...result.rows[0], role: 'blood_bank' }
    });
  } catch (error) {
    console.error('Blood Bank registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Verifying token:', token);

    // First check if token exists at all
    const checkToken = await pool.query(
      `SELECT *, expires_at > NOW() as is_valid FROM email_verifications WHERE token = $1`,
      [token]
    );

    console.log('Token lookup result:', checkToken.rows);

    if (checkToken.rows.length === 0) {
      // Token doesn't exist - might have been used already
      return res.status(400).json({ error: 'Invalid verification link. It may have been used already.' });
    }

    if (!checkToken.rows[0].is_valid) {
      // Token expired
      await pool.query('DELETE FROM email_verifications WHERE token = $1', [token]);
      return res.status(400).json({ error: 'Verification link has expired. Please register again.' });
    }

    const { user_id, user_type } = checkToken.rows[0];

    // Update user as verified
    if (user_type === 'user') {
      await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user_id]);
    }

    // Delete verification token
    await pool.query('DELETE FROM email_verifications WHERE token = $1', [token]);

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Login (all roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let table, query;
    switch (role) {
      case 'admin':
        table = 'admins';
        query = `SELECT id, name, email, password, age, gender, address, latitude, longitude FROM ${table} WHERE email = $1`;
        break;
      case 'ngo':
        table = 'ngos';
        query = `SELECT id, name, owner_name, email, password, age, gender, address, latitude, longitude, volunteer_count, status FROM ${table} WHERE email = $1`;
        break;
      case 'blood_bank':
        table = 'blood_banks';
        query = `SELECT id, name, email, password, contact_info, address, latitude, longitude, status FROM ${table} WHERE email = $1`;
        break;
      default:
        table = 'users';
        query = `SELECT id, name, email, password, phone, gender, blood_group, address, latitude, longitude, is_verified, status FROM ${table} WHERE email = $1`;
    }

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check verification for users only
    if (role === 'user' && !user.is_verified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    // Check if account is suspended (for all user types except admin)
    if (role !== 'admin' && user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    delete user.password;
    delete user.is_verified;
    delete user.status;

    res.json({
      message: 'Login successful',
      token,
      user: { ...user, role: role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Validate signup token
router.get('/validate-token/:type/:token', async (req, res) => {
  try {
    const { type, token } = req.params;

    const result = await pool.query(
      `SELECT id FROM signup_tokens 
       WHERE token = $1 AND type = $2 AND is_used = FALSE AND expires_at > NOW()`,
      [token, type]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Forgot Password - Request reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists in users table
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal that email doesn't exist for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const user = userResult.rows[0];

    // Delete any existing reset tokens for this user
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);

    // Generate secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token
    await pool.query(
      'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // Send reset email
    const { sendPasswordResetEmail } = require('../services/emailServiceSendGrid');
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Verify Reset Token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT pr.*, u.email, u.name 
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.reset_token = $1 AND pr.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired reset token' });
    }

    res.json({ valid: true, email: result.rows[0].email });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify token and get user
    const tokenResult = await pool.query(
      'SELECT user_id FROM password_resets WHERE reset_token = $1 AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Delete used reset token
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
