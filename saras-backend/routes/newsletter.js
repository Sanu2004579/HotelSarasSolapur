const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const { sendNewsletterWelcome } = require('../config/email');
const protect = require('../middleware/auth');

// POST /api/newsletter — Subscribe
router.post(
  '/',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email } = req.body;

      const existing = await Subscriber.findOne({ email });
      if (existing) {
        if (existing.isActive) {
          return res.status(400).json({ success: false, message: 'This email is already subscribed.' });
        }
        existing.isActive = true;
        await existing.save();
        return res.json({ success: true, message: 'You have been re-subscribed! 🎉' });
      }

      const subscriber = await Subscriber.create({ email });

      sendNewsletterWelcome(email).catch((err) =>
        console.error('Newsletter email error:', err.message)
      );

      res.status(201).json({
        success: true,
        message: 'Subscribed successfully! Check your inbox for a 25% discount. 🎉',
        data: subscriber,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// GET /api/newsletter — All subscribers (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, total: subscribers.length, data: subscribers });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/newsletter/:id — Unsubscribe (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Subscriber.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subscriber removed.' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;