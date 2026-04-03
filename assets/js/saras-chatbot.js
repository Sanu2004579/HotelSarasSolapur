(function () {

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Forum&family=DM+Sans:wght@300;400;500;600&display=swap');

    #saras-chat-btn {
      position: fixed; bottom: 30px; left: 30px;
      width: 60px; height: 60px;
      background: linear-gradient(135deg, #c9a96e, #a07840);
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; cursor: pointer; z-index: 9998;
      box-shadow: 0 4px 20px rgba(201,169,110,0.4);
      transition: transform 0.3s, box-shadow 0.3s; border: none;
    }
    #saras-chat-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(201,169,110,0.6); }

    #saras-chat-bubble {
      position: fixed; bottom: 100px; left: 30px;
      background: #c9a96e; color: #111;
      padding: 8px 14px; border-radius: 20px;
      font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
      z-index: 9997; white-space: nowrap;
      animation: bubblePop 0.4s ease;
    }
    @keyframes bubblePop {
      from { transform: scale(0.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    #saras-chat-window {
      position: fixed; bottom: 100px; left: 30px;
      width: 360px; height: 520px;
      background: #0d0d0d; border: 1px solid #2a2a2a;
      border-top: 2px solid #c9a96e; border-radius: 16px;
      display: none; flex-direction: column; z-index: 9999;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6); overflow: hidden;
      font-family: 'DM Sans', sans-serif;
      animation: chatSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes chatSlideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    #saras-chat-window.open { display: flex; }

    .chat-header {
      background: linear-gradient(135deg, #141414, #1a1a1a);
      padding: 16px 18px; display: flex; align-items: center;
      gap: 12px; border-bottom: 1px solid #222;
    }
    .chat-avatar {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #c9a96e, #a07840);
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-family: 'Forum', serif;
      font-size: 18px; color: #111; font-weight: bold; flex-shrink: 0;
    }
    .chat-header-name { color: #c9a96e; font-size: 15px; font-weight: 600; font-family: 'Forum', serif; letter-spacing: 1px; }
    .chat-header-status { color: #4caf7d; font-size: 11px; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
    .chat-header-status::before { content: ''; width: 6px; height: 6px; background: #4caf7d; border-radius: 50%; display: inline-block; }
    .chat-close { background: none; border: none; color: #666; cursor: pointer; font-size: 20px; padding: 4px; line-height: 1; transition: color 0.2s; margin-left: auto; }
    .chat-close:hover { color: #c9a96e; }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: #2a2a2a transparent;
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

    .msg { display: flex; gap: 8px; align-items: flex-end; animation: msgFade 0.3s ease; }
    @keyframes msgFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .msg.user { flex-direction: row-reverse; }
    .msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #c9a96e, #a07840); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #111; font-weight: bold; flex-shrink: 0; }
    .msg.user .msg-avatar { background: #222; color: #c9a96e; border: 1px solid #333; }
    .msg-bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.6; }
    .msg.bot .msg-bubble { background: #1a1a1a; color: #e0e0e0; border: 1px solid #2a2a2a; border-bottom-left-radius: 4px; }
    .msg.user .msg-bubble { background: linear-gradient(135deg, #c9a96e, #a07840); color: #111; border-bottom-right-radius: 4px; font-weight: 500; }

    .quick-btns { padding: 8px 16px 12px; display: flex; flex-wrap: wrap; gap: 6px; }
    .quick-btn {
      background: #1a1a1a; border: 1px solid #c9a96e;
      color: #c9a96e; padding: 6px 12px; border-radius: 16px;
      font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .quick-btn:hover { background: #c9a96e; color: #111; }

    .chat-input-row {
      padding: 12px 16px; border-top: 1px solid #1a1a1a;
      display: flex; gap: 8px; align-items: center; background: #0d0d0d;
    }
    .chat-input {
      flex: 1; background: #1a1a1a; border: 1px solid #2a2a2a;
      border-radius: 24px; padding: 10px 16px; color: #e0e0e0;
      font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #c9a96e; }
    .chat-input::placeholder { color: #555; }
    .chat-send {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #c9a96e, #a07840);
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s; flex-shrink: 0; font-size: 16px;
    }
    .chat-send:hover { transform: scale(1.1); }

    @media (max-width: 480px) {
      #saras-chat-window { width: calc(100vw - 20px); left: 10px; bottom: 90px; }
    }
  `;
  document.head.appendChild(style);

  const html = `
    <div id="saras-chat-bubble">👋 Ask me anything!</div>
    <button id="saras-chat-btn" aria-label="Open chat">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M15,10 Q10,10 10,15 L10,60 Q10,65 15,65 L35,65 L50,82 L65,65 L85,65 Q90,65 90,60 L90,15 Q90,10 85,10 Z"
          fill="#111" stroke="#c9a96e" stroke-width="3"/>
        <text x="50" y="48" font-family="Georgia,serif" font-size="38" font-weight="bold"
          fill="#c9a96e" text-anchor="middle" dominant-baseline="middle">S</text>
      </svg>
    </button>
    <div id="saras-chat-window">
      <div class="chat-header">
        <div class="chat-avatar">S</div>
        <div>
          <div class="chat-header-name">Saras Assistant</div>
          <div class="chat-header-status">Online</div>
        </div>
        <button class="chat-close" id="saras-chat-close">✕</button>
      </div>
      <div class="chat-messages" id="saras-chat-messages"></div>
      <div class="quick-btns" id="saras-quick-btns">
        <button class="quick-btn" onclick="sarasAsk('menu')">📋 Menu</button>
        <button class="quick-btn" onclick="sarasAsk('hours')">🕐 Hours</button>
        <button class="quick-btn" onclick="sarasAsk('booking')">📅 Booking</button>
        <button class="quick-btn" onclick="sarasAsk('location')">📍 Location</button>
        <button class="quick-btn" onclick="sarasAsk('special')">⭐ Special Dish</button>
        <button class="quick-btn" onclick="sarasAsk('contact')">📞 Contact</button>
        <button class="quick-btn" onclick="sarasAsk('prices')">💰 Prices</button>
        <button class="quick-btn" onclick="sarasAsk('whatsapp')">💬 WhatsApp</button>
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="saras-chat-input" placeholder="Type your question..." />
        <button class="chat-send" id="saras-chat-send">➤</button>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // ── FAQ Answers ───────────────────────────────────────────────
  const faqs = {
    menu: `🍽️ <b>Our Menu:</b><br>
- Greek Salad — ₹200<br>
- Cheese Noodles — ₹250<br>
- Veg Biryani — ₹100<br>
- Palak Paneer — ₹390 🆕<br>
- Crab Stuffed Avocado — ₹250<br>
- Vegetable Curry — ₹490<br>
- Veg Paneer Momos — ₹200 ⭐`,

    hours: `🕐 <b>Opening Hours:</b><br>
- Daily: 8:00 AM – 10:00 PM<br>
- Lunch: 11:00 AM – 2:30 PM<br>
- Dinner: 5:00 PM – 10:00 PM<br><br>
We are open 7 days a week! 😊`,

    booking: `📅 <b>How to Book a Table:</b><br>
- Fill the reservation form on this website<br>
- Or call us at <b>+8010476915</b><br>
- Or WhatsApp us!<br><br>
We will confirm your booking shortly! ✅`,

    location: `📍 <b>Our Location:</b><br>
Gat No 76/2/A, Basaveshwar Nagar,<br>
Belati, Solapur - 413002,<br>
Maharashtra, India<br><br>
<a href="https://maps.google.com/maps?q=Gat+No+76/2/A+Basaveshwar+Nagar+Belati+Solapur" target="_blank" style="color:#c9a96e;">📍 Open in Google Maps</a>`,

    special: `⭐ <b>Today's Special:</b><br>
<b>Veg Paneer Momos</b><br>
~~₹400~~ now only <b style="color:#c9a96e;">₹200</b><br><br>
Soft, fluffy momos stuffed with fresh paneer and spices. Must try! 😋`,

    contact: `📞 <b>Contact Us:</b><br>
- Phone: <b>+8010476915</b><br>
- Email: saras@restaurant.com<br>
- Address: Basaveshwar Nagar, Solapur<br><br>
We are happy to help! 😊`,

    prices: `💰 <b>Our Prices:</b><br>
- Veg Biryani — ₹100<br>
- Greek Salad — ₹200<br>
- Paneer Momos — ₹200 ⭐<br>
- Cheese Noodles — ₹250<br>
- Avocado — ₹250<br>
- Palak Paneer — ₹390<br>
- Veg Curry — ₹490`,

    whatsapp: `💬 <b>WhatsApp Us:</b><br>
Click the green WhatsApp button on the bottom right of the page!<br><br>
Or directly message us at:<br>
<b>+8010476915</b> 📱`,

    hello: `👋 Hello! Welcome to <b>Saras Restaurant</b>!<br><br>
How can I help you today? You can ask me about our menu, hours, location, booking, or prices! 😊`,

    hi: `👋 Hi there! Welcome to <b>Saras Restaurant</b>!<br><br>
I'm here to help! Ask me anything about our food, timings, or reservations 😊`,

    thanks: `😊 You're welcome! Is there anything else I can help you with?<br><br>
We look forward to serving you at Saras Restaurant! 🍽️`,

    bye: `👋 Goodbye! Hope to see you soon at <b>Saras Restaurant</b>!<br><br>
Have a wonderful day! 😊`,
  };

  // ── Smart keyword matching ────────────────────────────────────
  function getAnswer(input) {
    const text = input.toLowerCase();

    if (text.match(/menu|food|dish|eat|item|biryani|paneer|salad|noodle|momos|curry|avocado/)) return faqs.menu;
    if (text.match(/hour|time|open|close|timing|when|lunch|dinner/)) return faqs.hours;
    if (text.match(/book|reserv|table|seat|order/)) return faqs.booking;
    if (text.match(/locat|address|where|map|find|solapur|direction/)) return faqs.location;
    if (text.match(/special|today|offer|deal|discount/)) return faqs.special;
    if (text.match(/contact|call|phone|email|reach/)) return faqs.contact;
    if (text.match(/price|cost|rate|rupee|₹|cheap|expensive|afford/)) return faqs.prices;
    if (text.match(/whatsapp|chat|message|msg/)) return faqs.whatsapp;
    if (text.match(/hello|helo|hii|hey/)) return faqs.hello;
    if (text.match(/^hi$|^hi |^hi,/)) return faqs.hi;
    if (text.match(/thank|thanks|thnk|thx/)) return faqs.thanks;
    if (text.match(/bye|goodbye|cya|see you/)) return faqs.bye;

    return `🤔 I'm not sure about that! Here's what I can help with:<br><br>
📋 Menu &nbsp;|&nbsp; 🕐 Hours &nbsp;|&nbsp; 📅 Booking<br>
📍 Location &nbsp;|&nbsp; 💰 Prices &nbsp;|&nbsp; 📞 Contact<br><br>
Or call us directly: <b>+8010476915</b> 😊`;
  }

  // ── Add messages ──────────────────────────────────────────────
  function addBot(text) {
    const m = document.getElementById('saras-chat-messages');
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `<div class="msg-avatar">S</div><div class="msg-bubble">${text}</div>`;
    m.appendChild(div);
    m.scrollTop = m.scrollHeight;
  }

  function addUser(text) {
    const m = document.getElementById('saras-chat-messages');
    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML = `<div class="msg-avatar">👤</div><div class="msg-bubble">${text}</div>`;
    m.appendChild(div);
    m.scrollTop = m.scrollHeight;
  }

  function respond(userText) {
    if (!userText.trim()) return;
    addUser(userText);
    document.getElementById('saras-chat-input').value = '';
    setTimeout(() => addBot(getAnswer(userText)), 500);
  }

  window.sarasAsk = function(topic) {
    const labels = { menu:'What is your menu?', hours:'What are your opening hours?', booking:'How do I book a table?', location:'Where are you located?', special:'What is the special dish?', contact:'How can I contact you?', prices:'What are your prices?', whatsapp:'How to WhatsApp you?' };
    addUser(labels[topic] || topic);
    setTimeout(() => addBot(faqs[topic] || getAnswer(topic)), 500);
  };

  // ── Toggle ────────────────────────────────────────────────────
  let isOpen = false;
  let bubbleTimer;

  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById('saras-chat-window');
    const bubble = document.getElementById('saras-chat-bubble');
    if (isOpen) {
      win.classList.add('open');
      if (bubble) bubble.style.display = 'none';
      clearTimeout(bubbleTimer);
      const msgs = document.getElementById('saras-chat-messages');
      if (msgs.children.length === 0) {
        setTimeout(() => addBot(`👋 Welcome to <b>Saras Restaurant!</b><br><br>I can help you with our menu, timings, bookings, and more! What would you like to know? 😊`), 300);
      }
    } else {
      win.classList.remove('open');
    }
  }

  document.getElementById('saras-chat-btn').addEventListener('click', toggleChat);
  document.getElementById('saras-chat-close').addEventListener('click', toggleChat);
  document.getElementById('saras-chat-send').addEventListener('click', () => respond(document.getElementById('saras-chat-input').value.trim()));
  document.getElementById('saras-chat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') respond(document.getElementById('saras-chat-input').value.trim()); });

  bubbleTimer = setTimeout(() => {
    const bubble = document.getElementById('saras-chat-bubble');
    if (bubble && !isOpen) {
      bubble.style.display = 'block';
      setTimeout(() => { if (!isOpen) bubble.style.display = 'none'; }, 5000);
    }
  }, 3000);

})();