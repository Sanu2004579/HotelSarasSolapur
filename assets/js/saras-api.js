const API_BASE = 'http://localhost:5000/api';
const UPI_ID = 'saniya@upi';
const UPI_NAME = 'Saras Restaurant';

// ── Menu Items ────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 1, name: 'Greek Salad', price: 200, category: 'Salad' },
  { id: 2, name: 'Cheese Noodles', price: 250, category: 'Main' },
  { id: 3, name: 'Veg Biryani', price: 100, category: 'Main' },
  { id: 4, name: 'Palak Paneer', price: 390, category: 'Main' },
  { id: 5, name: 'Crab Stuffed Avocado', price: 250, category: 'Starter' },
  { id: 6, name: 'Vegetable Curry', price: 490, category: 'Main' },
  { id: 7, name: 'Veg Paneer Momos', price: 200, category: 'Special' },
];

let selectedItems = {};
let currentBookingData = {};

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.getElementById('saras-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'saras-toast';
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; z-index: 99999;
    background: ${type === 'success' ? '#c9a96e' : '#e74c3c'};
    color: ${type === 'success' ? '#111' : '#fff'};
    padding: 16px 24px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
    box-shadow: 0 6px 30px rgba(0,0,0,0.4);
    transform: translateY(80px); opacity: 0; transition: all 0.4s ease;
    max-width: 360px; line-height: 1.5;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; });
  setTimeout(() => { toast.style.transform = 'translateY(80px)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4500);
}

// ── Step 1: Menu Selection Popup ──────────────────────────────
function showMenuPopup(bookingData) {
  currentBookingData = bookingData;
  selectedItems = {};

  const existing = document.getElementById('saras-menu-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'saras-menu-popup';
  popup.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
  `;

  popup.innerHTML = `
    <div style="
      background: #111; border: 1px solid #2a2a2a;
      border-top: 3px solid #c9a96e; border-radius: 16px;
      width: 90%; max-width: 500px; max-height: 85vh;
      overflow-y: auto; position: relative;
    ">
      <div style="padding: 24px 24px 16px; border-bottom: 1px solid #1a1a1a; position: sticky; top: 0; background: #111; z-index: 1;">
        <button onclick="document.getElementById('saras-menu-popup').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#666;font-size:22px;cursor:pointer;">✕</button>
        <p style="color:#c9a96e;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Step 1 of 2</p>
        <h2 style="color:#fff;font-size:22px;font-family:'Forum',serif;letter-spacing:2px;">Select Your Food</h2>
        <p style="color:#888;font-size:13px;margin-top:4px;">Choose items you want to order</p>
      </div>

      <div style="padding: 20px 24px;">
        ${MENU_ITEMS.map(item => `
          <div style="
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 0; border-bottom: 1px solid #1a1a1a;
          ">
            <div>
              <p style="color:#fff;font-size:14px;font-weight:600;">${item.name}</p>
              <p style="color:#c9a96e;font-size:13px;">₹${item.price} <span style="color:#555;font-size:11px;margin-left:6px;">${item.category}</span></p>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button onclick="changeQty(${item.id}, -1)" style="
                width:28px;height:28px;border-radius:50%;background:#1a1a1a;
                border:1px solid #333;color:#fff;cursor:pointer;font-size:16px;
                display:flex;align-items:center;justify-content:center;
              ">−</button>
              <span id="qty-${item.id}" style="color:#fff;font-size:14px;font-weight:600;min-width:20px;text-align:center;">0</span>
              <button onclick="changeQty(${item.id}, 1)" style="
                width:28px;height:28px;border-radius:50%;background:#c9a96e;
                border:none;color:#111;cursor:pointer;font-size:16px;
                display:flex;align-items:center;justify-content:center;
              ">+</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="padding: 16px 24px; border-top: 1px solid #1a1a1a; position: sticky; bottom: 0; background: #111;">
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
          <span style="color:#888;font-size:14px;">Total Amount:</span>
          <span id="menu-total" style="color:#c9a96e;font-size:18px;font-weight:700;">₹0</span>
        </div>
        <button onclick="proceedToPayment()" style="
          width:100%;background:linear-gradient(135deg,#c9a96e,#a07840);
          color:#111;border:none;border-radius:8px;padding:14px;
          font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;
          cursor:pointer;letter-spacing:1px;
        ">Continue to Payment →</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

// ── Change quantity ───────────────────────────────────────────
window.changeQty = function(itemId, change) {
  const item = MENU_ITEMS.find(m => m.id === itemId);
  if (!item) return;

  const current = selectedItems[itemId] ? selectedItems[itemId].quantity : 0;
  const newQty = Math.max(0, current + change);

  if (newQty === 0) {
    delete selectedItems[itemId];
  } else {
    selectedItems[itemId] = { ...item, quantity: newQty };
  }

  document.getElementById(`qty-${itemId}`).textContent = newQty;

  const total = Object.values(selectedItems).reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById('menu-total').textContent = `₹${total}`;
};

// ── Step 2: Payment Popup ─────────────────────────────────────
window.proceedToPayment = function() {
  const items = Object.values(selectedItems);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    showToast('Please select at least one item!', 'error');
    return;
  }

  document.getElementById('saras-menu-popup').remove();

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Food Order - Saras Restaurant')}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

  const popup = document.createElement('div');
  popup.id = 'saras-payment-popup';
  popup.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
  `;

  popup.innerHTML = `
    <div style="
      background: #111; border: 1px solid #2a2a2a;
      border-top: 3px solid #c9a96e; border-radius: 16px;
      padding: 32px; max-width: 400px; width: 90%; text-align: center;
      position: relative;
    ">
      <button onclick="document.getElementById('saras-payment-popup').remove()" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#666;font-size:22px;cursor:pointer;">✕</button>

      <p style="color:#c9a96e;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Step 2 of 2</p>
      <h2 style="color:#fff;font-size:22px;font-family:'Forum',serif;letter-spacing:2px;margin-bottom:4px;">Payment</h2>

      <!-- Order Summary -->
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px;margin:16px 0;text-align:left;">
        <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Order Summary — Table ${currentBookingData.tableNumber}</p>
        ${items.map(i => `
          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2a2a2a;">
            <span style="color:#ccc;font-size:13px;">${i.name} x${i.quantity}</span>
            <span style="color:#c9a96e;font-size:13px;">₹${i.price * i.quantity}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding:10px 0 0;">
          <span style="color:#fff;font-weight:700;">Total</span>
          <span style="color:#c9a96e;font-weight:700;font-size:18px;">₹${totalAmount}</span>
        </div>
      </div>

      <!-- QR Code -->
      <img src="${qrUrl}" width="160" height="160" style="border-radius:8px;margin-bottom:14px;" />

      <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:14px;">
        <p style="color:#888;font-size:11px;margin-bottom:4px;">UPI ID</p>
        <p style="color:#c9a96e;font-size:15px;font-weight:600;">${UPI_ID}</p>
      </div>

      <a href="${upiLink}" style="
        display:block;background:linear-gradient(135deg,#c9a96e,#a07840);
        color:#111;padding:13px;border-radius:8px;text-decoration:none;
        font-weight:700;font-size:14px;margin-bottom:10px;
      ">📱 Pay with UPI App</a>

      <button onclick="confirmOrder(${JSON.stringify(items).replace(/"/g, '&quot;')}, ${totalAmount})" style="
        width:100%;background:#1a1a1a;border:1px solid #c9a96e;
        color:#c9a96e;padding:12px;border-radius:8px;cursor:pointer;
        font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;
      ">✅ I Have Paid — Confirm Order</button>

      <p style="color:#555;font-size:11px;margin-top:12px;">Pay first then click confirm</p>
    </div>
  `;

  document.body.appendChild(popup);
};

// ── Confirm Order ─────────────────────────────────────────────
window.confirmOrder = async function(items, totalAmount) {
  try {
    const orderData = {
      ...currentBookingData,
      items: items,
      totalAmount: totalAmount,
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
    };

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    document.getElementById('saras-payment-popup').remove();

    if (data.success) {
      showToast('🎉 Order placed! See you soon at Saras!');
      document.querySelector('form.form-left').reset();
    } else {
      showToast(data.message || 'Order failed. Please try again.', 'error');
    }
  } catch {
    showToast('Cannot connect to server. Please call +8010476915', 'error');
  }
};

// ── Reservation Form ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // Add table number field to form
  const dateInput = document.querySelector('input[name="reservation-date"]');
  if (dateInput) {
    const tableDiv = document.createElement('div');
    tableDiv.className = 'icon-wrapper';
    tableDiv.style.marginTop = '10px';
    tableDiv.innerHTML = `
      <ion-icon name="restaurant-outline" aria-hidden="true"></ion-icon>
      <select name="table-number" class="input-field">
        ${Array.from({length: 20}, (_, i) => `<option value="${i+1}">Table ${i+1}</option>`).join('')}
      </select>
      <ion-icon name="chevron-down" aria-hidden="true"></ion-icon>
    `;
    dateInput.closest('.input-wrapper').appendChild(tableDiv);
  }

  const reservationForm = document.querySelector('form.form-left');

  if (reservationForm) {
    reservationForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const name    = document.querySelector('input[name="name"]') ? document.querySelector('input[name="name"]').value.trim() : '';
      const phone   = document.querySelector('input[name="phone"]') ? document.querySelector('input[name="phone"]').value.trim() : '';
      const date    = document.querySelector('input[name="reservation-date"]') ? document.querySelector('input[name="reservation-date"]').value : '';
      const table   = document.querySelector('select[name="table-number"]') ? document.querySelector('select[name="table-number"]').value : '1';
      const message = document.querySelector('textarea[name="message"]') ? document.querySelector('textarea[name="message"]').value.trim() : '';

      if (!name)  { showToast('Please enter your name.', 'error'); return; }
      if (!phone) { showToast('Please enter your phone number.', 'error'); return; }
      if (!date)  { showToast('Please select a date.', 'error'); return; }

      currentBookingData = {
        name, phone, date, message,
        tableNumber: parseInt(table),
        time: '07:00pm',
      };

      // Show menu selection first
      showMenuPopup(currentBookingData);
    });
  }

  // ── Newsletter ────────────────────────────────────────────────
  const newsletterBtn = document.querySelector('.footer button[type="submit"]');
  const emailInput = document.querySelector('.footer input[type="email"]');

  if (newsletterBtn && emailInput) {
    newsletterBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('🎉 Subscribed! Check your inbox for 25% discount.');
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