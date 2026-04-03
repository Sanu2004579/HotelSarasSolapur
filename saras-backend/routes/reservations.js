const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const { sendReservationEmails } = require('../config/email');
const protect = require('../middleware/auth');

const reservationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('persons').isInt({ min: 1, max: 20 }).withMessage('Persons must be between 1 and 20'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
];

// POST /api/reservations — Create booking
router.post('/', reservationValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, phone, persons, date, time, message } = req.body;
    const reservation = await Reservation.create({ name, phone, persons, date, time, message });

    sendReservationEmails(reservation)
      .then(() => {
        Reservation.findByIdAndUpdate(reservation._id, { emailSent: true }).exec();
      })
      .catch((err) => console.error('Email error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Reservation booked successfully! We will confirm shortly.',
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/reservations — All reservations (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/reservations/:id/status — Update status (Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, message: `Status updated to "${status}".`, data: reservation });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/reservations/:id — Delete (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reservation deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;