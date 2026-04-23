const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:    { type: String, default: 'guest' },
  items:     { type: Array, default: [] },        // cart items
  amount:    { type: Number, required: true },     // in paise (₹1 = 100 paise)
  orderId:   { type: String, required: true },     // from Razorpay
  paymentId: { type: String, default: null },      // filled after success
  signature: { type: String, default: null },      // for verification
  method:    { type: String, enum: ['online', 'cod'], default: 'online' },
  status:    { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
}, { timestamps: true }); // adds createdAt, updatedAt automatically

module.exports = mongoose.model('Payment', paymentSchema);