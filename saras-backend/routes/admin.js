const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const protect = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(admin._id);
    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// GET /api/admin/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const Reservation = require('../models/Reservation');
    const Subscriber = require('../models/Subscriber');
    const Order = require('../models/Order');

    const [
      totalReservations,
      pendingReservations,
      confirmedReservations,
      totalSubscribers,
      recentReservations,
    ] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'confirmed' }),
      Subscriber.countDocuments({ isActive: true }),
      Order.countDocuments(),
Order.countDocuments({ status: 'received' }),
      Reservation.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalReservations,
        pendingReservations,
        confirmedReservations,
        totalSubscribers,
        totalOrders: (await Order.countDocuments()),
pendingOrders: (await Order.countDocuments({ status: 'received' })),
        recentReservations,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;