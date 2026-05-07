const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const protect = require("../middleware/auth");

// POST /api/reservations — Create reservation (public)
router.post("/", async (req, res) => {
  try {
    const { name, phone, persons, date, time } = req.body;

    if (!name || !phone || !persons || !date || !time) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const newReservation = new Reservation({
      name,
      phone,
      persons,
      date,
      time,
      status: "pending",
    });
    const saved = await newReservation.save();

    res
      .status(201)
      .json({ success: true, message: "Reservation created.", data: saved });
  } catch (error) {
    console.error("Reservation create error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reservations — All reservations (Admin)
router.get("/", protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, total, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/reservations/:id/status — Update status (Admin)
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
    }
    res.json({
      success: true,
      message: `Reservation ${status}.`,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reservations/:id (Admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
    }
    res.json({ success: true, message: "Reservation deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
