const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

// ✅ Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing in .env");
}

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────
// ✅ API 1: Create Order
// ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    console.log("Incoming Data:", req.body);

    const { amount, items } = req.body;

    // ✅ Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const amountInPaise = Math.round(amount * 100);

    // ✅ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // ✅ Save to DB
    const payment = new Payment({
      amount: amountInPaise,
      items: items || [],
      orderId: razorpayOrder.id,
      status: 'pending',
    });

    await payment.save();

    console.log("✅ Order created:", razorpayOrder.id);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Order creation failed",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// ✅ API 2: Verify Payment
// ─────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: 'success',
        }
      );

      console.log("✅ Payment verified:", razorpay_payment_id);

      res.json({
        success: true,
        message: "Payment verified successfully",
      });

    } else {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed' }
      );

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

  } catch (error) {
    console.error("❌ VERIFY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Verification error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// ✅ API 3: Cash on Delivery
// ─────────────────────────────────────────────────────────────
const cashOnDelivery = async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const payment = new Payment({
      amount: Math.round(amount * 100),
      items: items || [],
      orderId: `cod_${Date.now()}`,
      method: 'cod',
      status: 'pending',
    });

    await payment.save();

    console.log("✅ COD Order saved");

    res.json({
      success: true,
      message: "COD order placed successfully",
      orderId: payment.orderId,
    });

  } catch (error) {
    console.error("❌ COD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "COD order failed",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  cashOnDelivery,
};