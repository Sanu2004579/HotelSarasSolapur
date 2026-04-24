const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, cashOnDelivery } = require('../controllers/paymentController');

router.post('/create-order',    createOrder);
router.post('/verify-payment',  verifyPayment);
router.post('/cash-on-delivery', cashOnDelivery);

module.exports = router;