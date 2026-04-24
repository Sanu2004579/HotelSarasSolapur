const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const protect = require('../middleware/auth');

// POST /api/orders — Create order
router.post('/', async (req, res) => {
  try {
    const { name, phone, tableNumber, date, time, items, message, paymentMethod } = req.body;

    if (!name || !phone || !tableNumber || !date || !time || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields and select at least one item.' });
    }
     // Check if table already booked on same date
const bookingDate = new Date(date);
const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

const existingOrder = await Order.findOne({
  tableNumber,
  date: { $gte: startOfDay, $lte: endOfDay },
  status: { $nin: ['cancelled'] },
});

if (existingOrder) {
  return res.status(400).json({
    success: false,
    tableBooked: true,
    message: `Table ${tableNumber} is already booked on this date by ${existingOrder.name}. Please choose a different table or date!`,
  });
}
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      name, phone, tableNumber, date, time,
      items, totalAmount, message, paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/orders — All orders (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, data: orders });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/orders/:id/status — Update status (Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['received', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: `Order status updated to "${status}".`, data: order });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/orders/:id — Delete (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;