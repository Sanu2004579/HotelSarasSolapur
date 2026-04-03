const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Customer info
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    tableNumber: { type: Number, required: true, min: 1, max: 20 },
    date: { type: Date, required: true },
    time: { type: String, required: true },

    // Order items
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    // Payment
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'UPI' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },

    // Order status
    status: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'received',
    },

    message: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);