const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: Number,
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available'
  }
});

module.exports = mongoose.model('Table', tableSchema);