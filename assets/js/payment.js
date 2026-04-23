// ─── Helper: Load Razorpay script dynamically ────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Main: Online Payment ────────────────────────────────────────────────
async function payOnline(amount, items) {
  try {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert('❌ Razorpay SDK failed to load.');
      return;
    }

    // ✅ STEP 1: Create Order (FIXED PORT)
    const response = await fetch('http://localhost:5001/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, items }),
    });

    const orderData = await response.json();

    if (!orderData.success) {
      alert('❌ Failed to create order: ' + orderData.message);
      return;
    }

    // ✅ STEP 2: Open Razorpay
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Hotel Saras',
      description: 'Food Order Payment',
      order_id: orderData.orderId,

      // ✅ STEP 3: VERIFY PAYMENT
      handler: async function (response) {
        try {
          const verifyRes = await fetch('http://localhost:5001/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert('✅ Payment successful! Order confirmed.');
            console.log("Payment Verified:", verifyData);
          } else {
            alert('⚠️ Payment verification failed.');
          }
        } catch (err) {
          console.error("Verification error:", err);
          alert('⚠️ Error verifying payment.');
        }
      },

      prefill: {
        name: 'Guest Customer',
        email: 'guest@example.com',
        contact: '9999999999',
      },

      theme: { color: '#c9a84c' },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response) {
      console.error("Payment Failed:", response);
      alert('❌ Payment failed: ' + response.error.description);
    });

    rzp.open();

  } catch (error) {
    console.error("Payment Error:", error);
    alert('❌ Something went wrong. Try again.');
  }
}

// ─── COD Option ──────────────────────────────────────────────────────────
async function payWithCOD(amount, items) {
  try {
    const response = await fetch('http://localhost:5001/api/payment/cash-on-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, items }),
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ COD order placed successfully!');
      console.log("COD Order:", data);
    } else {
      alert('❌Currently COD Not available : ' + data.message);
    }

  } catch (error) {
    console.error("COD Error:", error);
    alert('❌ Something went wrong.');
  }
}