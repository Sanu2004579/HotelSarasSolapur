require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const app = express();

// ── Connect to MongoDB ────────────────────────────────────────────
connectDB();

// ── Seed default admin on first run ──────────────────────────────
const seedAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@saras.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      });
      console.log(`✅ Default admin created: ${process.env.ADMIN_EMAIL || 'admin@saras.com'}`);
    }
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
};
setTimeout(seedAdmin, 2000);

// ── Global Middlewares ────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reservations from this IP.' },
});

app.use('/api/', apiLimiter);
app.use('/api/reservations', reservationLimiter);

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/newsletter',   require('./routes/newsletter'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/orders',       require('./routes/orders'));

// ── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🍽️ Saras Restaurant API is running!' });
});

// ── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Saras Backend running on http://localhost:${PORT}`);
});