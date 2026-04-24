// ═══════════════════════════════════════════════════════════════
//  saras-api.js  —  Hotel Saras Frontend Logic
//  Handles: Reservation form → Menu popup → Razorpay payment → COD
//           + Newsletter subscription
// ═══════════════════════════════════════════════════════════════

const API_BASE  = 'http://localhost:5001/api';
const UPI_NAME  = 'Saras Restaurant';

// ── Menu Items ────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 1, name: 'Greek Salad',           price: 200, category: 'Salad'   },
  { id: 2, name: 'Cheese Noodles',         price: 250, category: 'Main'    },
  { id: 3, name: 'Veg Biryani',            price: 100, category: 'Main'    },
  { id: 4, name: 'Palak Paneer',           price: 390, category: 'Main'    },
  { id: 5, name: 'Crab Stuffed Avocado',   price: 250, category: 'Starter' },
  { id: 6, name: 'Vegetable Curry',        price: 490, category: 'Main'    },
  { id: 7, name: 'Veg Paneer Momos',       price: 200, category: 'Special' },
];

let selectedItems      = {};
let currentBookingData = {};

// ── Toast notification ────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.getElementById('saras-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'saras-toast';
  toast.style.cssText = `
    position:fixed; bottom:30px; right:30px; z-index:99999;
    background:${type === 'success' ? '#c9a96e' : '#e74c3c'};
    color:${type === 'success' ? '#111' : '#fff'};
    padding:16px 24px; border-radius:8px;
    font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600;
    box-shadow:0 6px 30px rgba(0,0,0,0.4);
    transform:translateY(80px); opacity:0; transition:all 0.4s ease;
    max-width:360px; line-height:1.5;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

// ═══════════════════════════════════════════════════════════════
//  STEP 1 — Menu selection popup
// ═══════════════════════════════════════════════════════════════
function showMenuPopup(bookingData) {
  currentBookingData = bookingData;
  selectedItems      = {};

  const existing = document.getElementById('saras-menu-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'saras-menu-popup';
  popup.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.9); z-index:999999;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Sans',sans-serif;
  `;

  popup.innerHTML = `
    <div style="
      background:#111; border:1px solid #2a2a2a;
      border-top:3px solid #c9a96e; border-radius:16px;
      width:90%; max-width:500px; max-height:85vh;
      overflow-y:auto; position:relative;
    ">
      <!-- Header -->
      <div style="padding:24px 24px 16px; border-bottom:1px solid #1a1a1a;
                  position:sticky; top:0; background:#111; z-index:1;">
        <button onclick="document.getElementById('saras-menu-popup').remove()"
          style="position:absolute;top:16px;right:16px;background:none;border:none;
                 color:#666;font-size:22px;cursor:pointer;">✕</button>
        <p style="color:#c9a96e;font-size:11px;letter-spacing:3px;
                  text-transform:uppercase;margin-bottom:4px;">Step 1 of 2</p>
        <h2 style="color:#fff;font-size:22px;font-family:'Forum',serif;
                   letter-spacing:2px;">Select Your Food</h2>
        <p style="color:#888;font-size:13px;margin-top:4px;">
          Choose items you want to order
        </p>
      </div>

      <!-- Items list -->
      <div style="padding:20px 24px;">
        ${MENU_ITEMS.map(item => `
          <div style="display:flex; align-items:center; justify-content:space-between;
                      padding:14px 0; border-bottom:1px solid #1a1a1a;">
            <div>
              <p style="color:#fff;font-size:14px;font-weight:600;">${item.name}</p>
              <p style="color:#c9a96e;font-size:13px;">
                ₹${item.price}
                <span style="color:#555;font-size:11px;margin-left:6px;">${item.category}</span>
              </p>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button onclick="changeQty(${item.id}, -1)"
                style="width:28px;height:28px;border-radius:50%;background:#1a1a1a;
                       border:1px solid #333;color:#fff;cursor:pointer;font-size:16px;
                       display:flex;align-items:center;justify-content:center;">−</button>
              <span id="qty-${item.id}"
                style="color:#fff;font-size:14px;font-weight:600;
                       min-width:20px;text-align:center;">0</span>
              <button onclick="changeQty(${item.id}, 1)"
                style="width:28px;height:28px;border-radius:50%;background:#c9a96e;
                       border:none;color:#111;cursor:pointer;font-size:16px;
                       display:flex;align-items:center;justify-content:center;">+</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer with total + button -->
      <div style="padding:16px 24px; border-top:1px solid #1a1a1a;
                  position:sticky; bottom:0; background:#111;">
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
          <span style="color:#888;font-size:14px;">Total Amount:</span>
          <span id="menu-total" style="color:#c9a96e;font-size:18px;font-weight:700;">₹0</span>
        </div>
        <button onclick="proceedToPayment()"
          style="width:100%;background:linear-gradient(135deg,#c9a96e,#a07840);
                 color:#111;border:none;border-radius:8px;padding:14px;
                 font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;
                 cursor:pointer;letter-spacing:1px;">
          Continue to Payment →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

// ── Change quantity (called by +/− buttons) ───────────────────
window.changeQty = function (itemId, change) {
  const item    = MENU_ITEMS.find(m => m.id === itemId);
  if (!item) return;

  const current = selectedItems[itemId] ? selectedItems[itemId].quantity : 0;
  const newQty  = Math.max(0, current + change);

  if (newQty === 0) {
    delete selectedItems[itemId];
  } else {
    selectedItems[itemId] = { ...item, quantity: newQty };
  }

  document.getElementById(`qty-${itemId}`).textContent = newQty;

  const total = Object.values(selectedItems)
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById('menu-total').textContent = `₹${total}`;
};

// ═══════════════════════════════════════════════════════════════
//  STEP 2 — Payment popup  (Razorpay online  OR  Cash on Delivery)
// ═══════════════════════════════════════════════════════════════
window.proceedToPayment = function () {
  const items       = Object.values(selectedItems);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    showToast('Please select at least one item!', 'error');
    return;
  }

  // Close menu popup, open payment popup
  document.getElementById('saras-menu-popup').remove();

  const popup = document.createElement('div');
  popup.id = 'saras-payment-popup';
  popup.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.9); z-index:999999;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Sans',sans-serif;
  `;

  popup.innerHTML = `
    <div style="
      background:#111; border:1px solid #2a2a2a;
      border-top:3px solid #c9a96e; border-radius:16px;
      padding:32px; max-width:420px; width:90%;
      text-align:center; position:relative;
    ">
      <button onclick="document.getElementById('saras-payment-popup').remove()"
        style="position:absolute;top:14px;right:16px;background:none;border:none;
               color:#666;font-size:22px;cursor:pointer;">✕</button>

      <p style="color:#c9a96e;font-size:11px;letter-spacing:3px;
                text-transform:uppercase;margin-bottom:4px;">Step 2 of 2</p>
      <h2 style="color:#fff;font-size:22px;font-family:'Forum',serif;
                 letter-spacing:2px;margin-bottom:4px;">Payment</h2>

      <!-- Order summary -->
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;
                  padding:14px;margin:16px 0;text-align:left;">
        <p style="color:#888;font-size:11px;text-transform:uppercase;
                  letter-spacing:1px;margin-bottom:10px;">
          Order Summary — Table ${currentBookingData.tableNumber}
        </p>
        ${items.map(i => `
          <div style="display:flex;justify-content:space-between;
                      padding:4px 0;border-bottom:1px solid #2a2a2a;">
            <span style="color:#ccc;font-size:13px;">${i.name} ×${i.quantity}</span>
            <span style="color:#c9a96e;font-size:13px;">₹${i.price * i.quantity}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding:10px 0 0;">
          <span style="color:#fff;font-weight:700;">Total</span>
          <span style="color:#c9a96e;font-weight:700;font-size:18px;">₹${totalAmount}</span>
        </div>
      </div>

      <!-- Pay online button (triggers Razorpay) -->
      <button id="btn-pay-online"
        onclick="payWithRazorpay()"
        style="width:100%;background:linear-gradient(135deg,#c9a96e,#a07840);
               color:#111;border:none;border-radius:8px;padding:14px;
               font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;
               cursor:pointer;letter-spacing:1px;margin-bottom:10px;">
        💳 Pay Online ₹${totalAmount}
      </button>

      <!-- Cash on Delivery button -->
      <button onclick="payWithCOD()"
        style="width:100%;background:#1a1a1a;border:1px solid #c9a96e;
               color:#c9a96e;padding:13px;border-radius:8px;cursor:pointer;
               font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;">
        🏠 Cash on Delivery
      </button>

      <p style="color:#555;font-size:11px;margin-top:14px;">
        Payments secured by Razorpay
      </p>
    </div>
  `;

  // Store items on window so payment functions can access them
  window._sarasPayItems       = items;
  window._sarasPayTotal       = totalAmount;

  document.body.appendChild(popup);
};

// ═══════════════════════════════════════════════════════════════
//  Razorpay — load script dynamically (only once)
// ═══════════════════════════════════════════════════════════════
function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Already loaded?
    if (window.Razorpay) { resolve(true); return; }
    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ═══════════════════════════════════════════════════════════════
//  Online Payment — full Razorpay flow
// ═══════════════════════════════════════════════════════════════
window.payWithRazorpay = async function () {
  const items       = window._sarasPayItems;
  const totalAmount = window._sarasPayTotal;

  // Disable button while loading
  const btn = document.getElementById('btn-pay-online');
  if (btn) { btn.textContent = 'Loading...'; btn.disabled = true; }

  // 1. Load Razorpay SDK
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    showToast('Payment service unavailable. Please try again.', 'error');
    if (btn) { btn.textContent = `💳 Pay Online ₹${totalAmount}`; btn.disabled = false; }
    return;
  }

  // 2.  backend will create an order
  let orderData;
  try {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ amount: totalAmount, items }),
    });
    orderData = await res.json();
  } catch {
    showToast('Cannot connect to server. Please try again.', 'error');
    if (btn) { btn.textContent = `💳 Pay Online ₹${totalAmount}`; btn.disabled = false; }
    return;
  }

  if (!orderData.success) {
    showToast('Could not create order. Please try again.', 'error');
    if (btn) { btn.textContent = `💳 Pay Online ₹${totalAmount}`; btn.disabled = false; }
    return;
  }

  // 3. Open Razorpay checkout popup
  const options = {
    key:         orderData.keyId,      // rzp_test_... from your .env
    amount:      orderData.amount,     // in paise
    currency:    'INR',
    name:        'Hotel Saras',
    description: `Table ${currentBookingData.tableNumber} — Food Order`,
    order_id:    orderData.orderId,

    prefill: {
      name:    currentBookingData.name  || '',
      contact: currentBookingData.phone || '',
    },

    theme: { color: '#c9a96e' },

    // 4. On payment success — verify with backend
    handler: async function (response) {
      try {
        const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          // 5. Save full order to DB
          await saveOrderToDB(items, totalAmount, 'online', 'paid');

          const popup = document.getElementById('saras-payment-popup');
          if (popup) popup.remove();

          showToast('🎉 Payment successful! Your order is confirmed.');
          resetForm();
        } else {
          showToast('⚠️ Payment could not be verified. Please contact support.', 'error');
        }
      } catch {
        showToast('Verification error. Please call +8010476915', 'error');
      }
    },
  };

  const rzp = new window.Razorpay(options);

  // Handle popup closed / payment failed
  rzp.on('payment.failed', function (response) {
    showToast('❌ Payment failed: ' + response.error.description, 'error');
    if (btn) { btn.textContent = `💳 Pay Online ₹${totalAmount}`; btn.disabled = false; }
  });

  rzp.open();
};

// ═══════════════════════════════════════════════════════════════
//  Cash on Delivery
// ═══════════════════════════════════════════════════════════════
window.payWithCOD = async function () {
  const items       = window._sarasPayItems;
  const totalAmount = window._sarasPayTotal;

  await saveOrderToDB(items, totalAmount, 'cod', 'pending');

  const popup = document.getElementById('saras-payment-popup');
  if (popup) popup.remove();

  showToast('✅ COD order placed! Pay when your food arrives.');
  resetForm();
};

// ═══════════════════════════════════════════════════════════════
//  Save order to backend DB  (shared by both payment methods)
// ═══════════════════════════════════════════════════════════════
async function saveOrderToDB(items, totalAmount, paymentMethod, paymentStatus) {
  try {
    const orderData = {
      ...currentBookingData,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
    };

    const res  = await fetch(`${API_BASE}/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(orderData),
    });
    const data = await res.json();

    // ── Table already booked! ──────────────────────────────
    if (!data.success && data.tableBooked) {
      document.getElementById('saras-payment-popup').remove();
      showTableBookedPopup(data.message, currentBookingData.tableNumber);
      return;
    }

    document.getElementById('saras-payment-popup').remove();

    if (!data.success) {
      console.warn('Order save issue:', data.message);
    }
  } catch (err) {
    // Non-fatal — payment already succeeded, just log
    console.error('Could not save order to DB:', err);
  }
};
// ── Table Already Booked Popup ────────────────────────────────
function showTableBookedPopup(message, tableNumber) {
  const existing = document.getElementById('saras-table-booked-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'saras-table-booked-popup';
  popup.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
  `;

  popup.innerHTML = `
    <div style="
      background: #111; border: 1px solid #e05252;
      border-top: 3px solid #e05252; border-radius: 16px;
      padding: 40px 32px; max-width: 420px; width: 90%;
      text-align: center; position: relative;
    ">
      <div style="font-size: 60px; margin-bottom: 16px;">🚫</div>

      <h2 style="color:#e05252; font-size:22px; font-family:'Forum',serif;
        letter-spacing:2px; margin-bottom:12px;">
        Table ${tableNumber} Already Booked!
      </h2>

      <p style="color:#ccc; font-size:14px; line-height:1.7; margin-bottom:24px;">
        ${message}
      </p>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:8px;
        padding:16px; margin-bottom:24px;">
        <p style="color:#888; font-size:12px; margin-bottom:8px;">Please try:</p>
        <p style="color:#c9a96e; font-size:14px;">
          📅 Choose a different <strong>date</strong><br>
          🪑 Choose a different <strong>table number</strong>
        </p>
      </div>

      <button onclick="document.getElementById('saras-table-booked-popup').remove()" style="
        width:100%; background:linear-gradient(135deg,#c9a96e,#a07840);
        color:#111; border:none; border-radius:8px; padding:14px;
        font-family:'DM Sans',sans-serif; font-size:15px; font-weight:700;
        cursor:pointer; letter-spacing:1px;
      ">← Choose Different Table</button>
    </div>
  `;

  document.body.appendChild(popup);
}
// ── Reservation Form ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // ── Add Table Number dropdown to reservation form ────────────
  const dateInput = document.querySelector('input[name="reservation-date"]');
  if (dateInput) {
    const tableDiv = document.createElement('div');
    tableDiv.className = 'icon-wrapper';
    tableDiv.style.marginTop = '10px';
    tableDiv.innerHTML = `
      <ion-icon name="restaurant-outline" aria-hidden="true"></ion-icon>
      <select name="table-number" class="input-field">
        ${Array.from({ length: 20 }, (_, i) =>
          `<option value="${i + 1}">Table ${i + 1}</option>`
        ).join('')}
      </select>
      <ion-icon name="chevron-down" aria-hidden="true"></ion-icon>
    `;
    dateInput.closest('.input-wrapper').appendChild(tableDiv);
  }

  // ── Reservation form submit ───────────────────────────────────
  const reservationForm = document.querySelector('form.form-left');
  if (reservationForm) {
    reservationForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const name    = document.querySelector('input[name="name"]')?.value.trim()          || '';
      const phone   = document.querySelector('input[name="phone"]')?.value.trim()         || '';
      const date    = document.querySelector('input[name="reservation-date"]')?.value     || '';
      const time    = document.querySelector('select[name="person"] + * select, select[name="time"]')?.value || '07:00pm';
      const table   = document.querySelector('select[name="table-number"]')?.value        || '1';
      const message = document.querySelector('textarea[name="message"]')?.value.trim()    || '';

      if (!name)  { showToast('Please enter your name.',         'error'); return; }
      if (!phone) { showToast('Please enter your phone number.', 'error'); return; }
      if (!date)  { showToast('Please select a date.',           'error'); return; }

      currentBookingData = {
        name,
        phone,
        date,
        message,
        tableNumber:  parseInt(table),
        time,
      };

      showMenuPopup(currentBookingData);
    });
  }

  // ── Newsletter subscribe ──────────────────────────────────────
  const newsletterBtn  = document.querySelector('.footer button[type="submit"]');
  const emailInput     = document.querySelector('.footer input[type="email"]');

  if (newsletterBtn && emailInput) {
    newsletterBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      try {
        const res  = await fetch(`${API_BASE}/newsletter`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('🎉 Subscribed! Check your inbox for 10% discount.');
          emailInput.value = '';
        } else {
          showToast(data.message || 'Subscription failed.', 'error');
        }
      } catch {
        showToast('Unable to connect. Please try again later.', 'error');
      }
    });
  }

});