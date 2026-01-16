const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://blood-link-mu.vercel.app',
    'https://bharakt.in',
    'https://www.bharakt.in',
    'https://admin.bharakt.in',
    'https://ngo.bharakt.in',
    'https://bloodbank.bharakt.in'
  ].filter(Boolean),
  credentials: true
}));
// Increase limit to 10MB for base64 image uploads (prescription verification)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/blood-bank', require('./routes/bloodBank'));
app.use('/api/blood-requests', require('./routes/bloodRequest'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/stats', require('./routes/stats'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bharakt API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

