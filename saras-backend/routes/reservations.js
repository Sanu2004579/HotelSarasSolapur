const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// CREATE reservation
router.post('/', async (req, res) => {
  try {
    console.log("📥 DATA RECEIVED:", req.body);

    const newReservation = new Reservation({
      name: req.body.name,
      phone: req.body.phone,
      persons: req.body.persons,
      date: req.body.date,
      time: req.body.time,
      status: "pending"
    });

    const saved = await newReservation.save();

    console.log("✅ SAVED TO DB:", saved);

    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET all reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;