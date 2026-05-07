// ═══════════════════════════════════════════════════════════════════════════
//  chatbot-engine.js — Smart Restaurant Chatbot with Navigation
//  Features: Menu database integration, navigation history, back button
// ═══════════════════════════════════════════════════════════════════════════

class SarasChatbotEngine {
  constructor() {
    this.conversationHistory = [];
    this.navigationHistory = [];
    this.currentPage = 'home';
    this.userProfile = { preferences: [] };
    this.API_BASE = 'http://localhost:5001/api';
    this.messageCount = 0;
  }

  // ─────────────────────────────────────────────────────────────────────
  //  Initialize Chatbot
  // ─────────────────────────────────────────────────────────────────────
  initialize() {
    this.conversationHistory = [];
    this.navigationHistory = ['home'];
    this.currentPage = 'home';

    this.addBotMessage(
      "👋 Welcome to <b>Saras Restaurant AI Assistant</b>!<br><br>" +
      "I'm here to help you explore our delicious menu and book your perfect dining experience.<br><br>" +
      "<b>What would you like to do?</b>",
      [
        '🍽️ View Full Menu',
        '💰 Budget Meals',
        '👑 Premium Dishes',
        '📍 Location & Hours'
      ]
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  //  Add messages to history
  // ─────────────────────────────────────────────────────────────────────
  addUserMessage(text) {
    this.conversationHistory.push({
      role: 'user',
      content: text
    });
    this.messageCount++;
  }

  addBotMessage(text, suggestedReplies = [], includeBackBtn = true) {
    const suggestions = includeBackBtn && this.navigationHistory.length > 1
      ? ['← Back', ...suggestedReplies]
      : suggestedReplies;

    this.conversationHistory.push({
      role: 'bot',
      content: text,
      suggestedReplies: suggestions
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  //  Main Response Handler
  // ─────────────────────────────────────────────────────────────────────
  async getResponse(userInput) {
    this.addUserMessage(userInput);

    // Handle back navigation
    if (userInput.toLowerCase().includes('← back') || userInput.toLowerCase() === 'back') {
      return this.goBack();
    }

    // Try local menu intelligence
    const localResponse = this.getLocalMenuResponse(userInput);
    if (localResponse) {
      this.addBotMessage(localResponse.text, localResponse.suggestions, localResponse.includeBack);
      return localResponse;
    }

    // Fallback to AI if available
    const aiResponse = await this.getAIResponse(userInput);
    if (aiResponse) {
      this.addBotMessage(aiResponse.text, aiResponse.suggestions, false);
      return aiResponse;
    }

    // Final fallback
    this.addBotMessage(
      "🤔 I didn't quite catch that.<br><br>" +
      "Try asking me about:<br>" +
      "• Menu items<br>" +
      "• Budget meals<br>" +
      "• Premium dishes<br>" +
      "• Family feast<br>" +
      "• Location & hours<br>" +
      "• Booking a table",
      ['View Full Menu', 'Help', 'Main Menu'],
      false
    );

    return { text: 'Unable to process', suggestions: [] };
  }

  // ─────────────────────────────────────────────────────────────────────
  //  Navigation: Go Back
  // ─────────────────────────────────────────────────────────────────────
  goBack() {
    if (this.navigationHistory.length <= 1) {
      this.initialize();
      return this.conversationHistory[this.conversationHistory.length - 1];
    }

    this.navigationHistory.pop();
    const previousPage = this.navigationHistory[this.navigationHistory.length - 1];
    this.currentPage = previousPage;

    // Return to home
    if (previousPage === 'home') {
      this.initialize();
      return this.conversationHistory[this.conversationHistory.length - 1];
    }

    return { text: 'Going back...', suggestions: [] };
  }

  pushNavigation(page) {
    if (!this.navigationHistory.includes(page)) {
      this.navigationHistory.push(page);
    }
    this.currentPage = page;
  }

  // ═════════════════════════════════════════════════════════════════════
  //  LOCAL MENU INTELLIGENCE — Main response handler
  // ═════════════════════════════════════════════════════════════════════
  getLocalMenuResponse(userInput) {
    const input = userInput.toLowerCase().trim();

    // ─ Full Menu
    if (this.matchKeywords(input, ['menu', 'full menu', 'show menu', 'all dishes', 'view menu', 'view full menu'])) {
      this.pushNavigation('menu');
      return this.getFullMenuResponse();
    }


    // ─ Non-Veg Menu
if (
  this.matchKeywords(input, [
    'non veg',
    'non-veg',
    'non vegetarian',
    'non-vegetarian',
    'non veg menu',
    'non-veg menu',
    'meat',
    'chicken',
    'mutton'
  ])
) {
  this.pushNavigation('nonveg_menu');
  return this.getNonVegMenuResponse();
}

// ─ Vegetarian Menu
if (
  !input.includes('non veg') &&
  !input.includes('non-veg') &&
  !input.includes('non vegetarian') &&
  !input.includes('non-vegetarian') &&
  this.matchKeywords(input, [
    'vegetarian',
    'veg',
    'veg menu',
    'veg dishes',
    'veg special',
    'vegetarian menu'
  ])
) {
  this.pushNavigation('veg_menu');
  return this.getVegetarianMenuResponse();
}

    // ─ Maharashtrian Special
    if (this.matchKeywords(input, ['maharashtrian', 'traditional', 'marathi', 'maharashtra food', 'local special'])) {
      this.pushNavigation('maharashtrian');
      return this.getMaharashtrianSpecialResponse();
    }

    // ─ Family Feast
    if (this.matchKeywords(input, ['family', 'feast', 'family feast', 'group meal', 'combo'])) {
      this.pushNavigation('family_feast');
      return this.getFamilyFeastResponse();
    }

    // ─ Budget Meals
    if (this.matchKeywords(input, ['budget', 'cheap', 'under', 'affordable', 'cheapest', '₹100', '₹150', '₹200'])) {
      this.pushNavigation('budget');
      return this.getBudgetResponse(userInput);
    }

    // ─ Premium/Best Dishes
    if (this.matchKeywords(input, ['best', 'premium', 'special', 'recommended', 'chef special', 'must try'])) {
      this.pushNavigation('premium');
      return this.getPremiumResponse();
    }

    // ─ Beverages & Desserts
if (
  this.matchKeywords(input, [
    'beverages',
    'desserts',
    'drinks',
    'juice',
    'lassi',
    'ice cream',
    'sweet',
    'cold drinks'
  ])
) {
  this.pushNavigation('beverages');
  return this.getBeveragesDessertsResponse();
}

    // ─ Spice Level
    if (this.matchKeywords(input, ['spicy', 'mild', 'medium', 'kids', 'less spice', 'no spice'])) {
      this.pushNavigation('spice_filter');
      return this.getSpiceFilterResponse(userInput);
    }

    // ─ Dish Details
    const dishMatch = this.findDishByName(userInput);
    if (dishMatch) {
      this.pushNavigation('dish_details');
      return this.getDishDetailsResponse(dishMatch);
    }

    // ─ Booking
    if (this.matchKeywords(input, ['book', 'booking', 'reservation', 'table', 'reserve'])) {
      this.pushNavigation('booking');
      return {
        text:
          "<b>📅 Book Your Table at Saras</b><br><br>" +
          "📞 <b>Call:</b> +91 8010476915<br>" +
          "💬 <b>WhatsApp:</b> Available 24/7<br>" +
          "📍 <b>Location:</b> Solapur, Maharashtra<br><br>" +
          "🕐 <b>Hours:</b> 8:00 AM - 10:00 PM (Daily)<br><br>" +
          "Click the WhatsApp button or call now!",
        suggestions: ['WhatsApp', 'Call Now', 'Location', 'Hours', 'Back'],
        includeBack: false
      };
    }

    // ─ Location
    if (this.matchKeywords(input, ['location', 'address', 'where', 'map', 'how to reach'])) {
      this.pushNavigation('location');
      return {
        text:
          "<b>📍 Saras Restaurant</b><br><br>" +
          "Gat No 76/2/A, Basaveshwar Nagar<br>" +
          "Belati, Solapur - 413002<br>" +
          "Maharashtra, India<br><br>" +
          "🕐 <b>Open Daily:</b> 8:00 AM - 10:00 PM<br>" +
          "📞 <b>Phone:</b> +91 8010476915",
        suggestions: ['Google Maps', 'Call Now', 'Book Table', 'Menu', 'Back'],
        includeBack: false
      };
    }

    // ─ Hours
    if (this.matchKeywords(input, ['hours', 'timing', 'open', 'close', 'time'])) {
      this.pushNavigation('hours');
      return {
        text:
          "<b>🕐 Saras Restaurant Hours</b><br><br>" +
          "Open Daily: 8:00 AM - 10:00 PM<br><br>" +
          "Lunch: 11:00 AM - 2:30 PM<br>" +
          "Dinner: 5:30 PM - 11:00 PM<br><br>" +
          "Closed on public holidays",
        suggestions: ['Book Table', 'Location', 'Call Now', 'Menu', 'Back'],
        includeBack: false
      };
    }

    // ─ Contact
    if (this.matchKeywords(input, ['contact', 'call', 'phone', 'whatsapp', 'reach', 'email'])) {
      this.pushNavigation('contact');
      return {
        text:
          "<b>📞 Contact Saras</b><br><br>" +
          "📱 <b>Phone:</b> +91 8010476915<br>" +
          "💬 <b>WhatsApp:</b> +91 8010476915<br>" +
          "📧 <b>Email:</b> sarasrestro@gmail.com<br><br>" +
          "Available 24/7 for booking and inquiries",
        suggestions: ['WhatsApp', 'Call Now', 'Book Table', 'Menu', 'Back'],
        includeBack: false
      };
    }

    // ─ Help
    if (this.matchKeywords(input, ['help', 'guide', 'commands', 'what can you do'])) {
      this.initialize();
      return this.conversationHistory[this.conversationHistory.length - 1];
    }

    return null;
  }

  // ═════════════════════════════════════════════════════════════════════
  //  MENU RESPONSE BUILDERS
  // ═════════════════════════════════════════════════════════════════════

  getFullMenuResponse() {
    let text = "<b>📖 Saras Restaurant Full Menu</b><br><br>";
    text += "We have <b>100+ dishes</b> across multiple categories:<br><br>";
    text += "🥬 <b>Vegetarian Dishes</b> (50+ items)<br>";
    text += "🍗 <b>Non-Vegetarian Dishes</b> (40+ items)<br>";
    text += "🌶️ <b>Maharashtrian Specials</b> (8 items)<br>";
    text += "👨‍👩‍👧‍👦 <b>Family Feast Combos</b> (5 combos)<br>";
    text += "🥤 <b>Beverages & Desserts</b> (8 items)<br><br>";
    text += "Select a category to explore!";

    return {
      text,
      suggestions: [
  'Vegetarian',
  'Non-Vegetarian',
  'Maharashtrian',
  'Family Feast',
  'Beverages & Desserts',
  'Budget'
],
      includeBack: true
    };
  }

  getVegetarianMenuResponse() {
    if (!SARAS_MENU || !SARAS_MENU.vegetarian) {
      return { text: 'Menu data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const starters = SARAS_MENU.vegetarian.starters || [];
    const mains = SARAS_MENU.vegetarian.mainCourse || [];
    const roti = SARAS_MENU.vegetarian.roti || [];
    const rice = SARAS_MENU.vegetarian.rice || [];

    let text = "<b>🥬 Vegetarian Menu</b> (" + (starters.length + mains.length + roti.length + rice.length) + " items)<br><br>";

    text += "<b>Starters (₹40-170):</b><br>";
    starters.slice(0, 5).forEach(d => {
      text += `• <b>${d.name}</b> — ₹${d.price}<br>`;
    });
    if (starters.length > 5) text += `... and ${starters.length - 5} more<br><br>`;
    else text += "<br>";

    text += "<b>Main Course (₹160-300):</b><br>";
    mains.slice(0, 5).forEach(d => {
      text += `• <b>${d.name}</b> — ₹${d.price}<br>`;
    });
    if (mains.length > 5) text += `... and ${mains.length - 5} more<br><br>`;
    else text += "<br>";

    text += "Ask for specific dishes, prices, or ingredients!";

    return {
      text,
      suggestions: ['Paneer Dishes', 'Breads', 'Rice', 'Main Course', 'Price List'],
      includeBack: true
    };
  }

  getNonVegMenuResponse() {
    if (!SARAS_MENU || !SARAS_MENU.nonVegetarian) {
      return { text: 'Menu data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const starters = SARAS_MENU.nonVegetarian.starters || [];
    const mains = SARAS_MENU.nonVegetarian.mainCourse || [];
    const biryani = SARAS_MENU.nonVegetarian.biryani || [];

    let text = "<b>🍗 Non-Vegetarian Menu</b> (" + (starters.length + mains.length + biryani.length) + " items)<br><br>";

    text += "<b>Starters (₹140-350):</b><br>";
    starters.slice(0, 5).forEach(d => {
      text += `• <b>${d.name}</b> — ₹${d.price}<br>`;
    });
    if (starters.length > 5) text += `... and ${starters.length - 5} more<br><br>`;
    else text += "<br>";

    text += "<b>Main Course (₹180-390):</b><br>";
    mains.slice(0, 5).forEach(d => {
      text += `• <b>${d.name}</b> — ₹${d.price}<br>`;
    });
    if (mains.length > 5) text += `... and ${mains.length - 5} more<br><br>`;
    else text += "<br>";

    text += "<b>Biryani (₹200-360):</b><br>";
    biryani.forEach(d => {
      text += `• <b>${d.name}</b> — ₹${d.price}<br>`;
    });

    return {
      text,
      suggestions: ['Chicken', 'Mutton', 'Biryani', 'Budget Non-Veg'],
      includeBack: true
    };
  }

  getMaharashtrianSpecialResponse() {
    if (!SARAS_MENU || !SARAS_MENU.vegetarian || !SARAS_MENU.vegetarian.maharashtrian) {
      return { text: 'Menu data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const items = SARAS_MENU.vegetarian.maharashtrian;
    let text = "<b>🌶️ Maharashtrian Specialties</b> (" + items.length + " items)<br><br>";
    text += "Traditional authentic flavors from Maharashtra!<br><br>";

    items.forEach(d => {
      const spice = '🌶️'.repeat(d.spiceLevel) + '⚪'.repeat(5 - d.spiceLevel);
      text += `<b>${d.name}</b> — ₹${d.price} ${spice}<br>`;
    });

    text += "<br><b>Try these combos:</b><br>";
    text += "• Veg Kolhapuri + Jowar Bhakri<br>";
    text += "• Baingan Masala + Butter Roti<br>";
    text += "• Channa Masala + Rice";

    return {
      text,
      suggestions: ['Spicy', 'Mild', 'With Rice', 'Details', 'Back'],
      includeBack: true
    };
  }

  getFamilyFeastResponse() {
    if (!SARAS_MENU || !SARAS_MENU.familyFeast) {
      return { text: 'Family Feast data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const combos = SARAS_MENU.familyFeast;
    let text = "<b>👨‍👩‍👧‍👦 Family Feast Special Combos</b><br><br>";
    text += "Perfect meal packages for your family!<br><br>";

    combos.forEach(combo => {
      text += `<b>${combo.name}</b> — ₹${combo.price}<br>`;
      text += `${combo.description}<br>`;
      text += `<u>Includes:</u> ${combo.components.slice(0, 15).join(', ')} ... and more<br><br>`;
    });

    return {
      text,
      suggestions: ['Family Combo (4P)', 'Vegetarian Pack', 'Biryani Feast', 'Kids Delight'],
      includeBack: true
    };
    
  }

  getBeveragesDessertsResponse() {
  if (!SARAS_MENU || !SARAS_MENU.beveragesAndDesserts) {
    return {
      text: 'Beverages & Desserts data unavailable',
      suggestions: ['Back'],
      includeBack: false
    };
  }

  const items = SARAS_MENU.beveragesAndDesserts;

  let text = "<b>🥤 Beverages & Desserts Menu</b><br><br>";
  text += "Refreshing drinks and sweet treats:<br><br>";

  items.forEach(d => {
    text += `• <b>${d.name}</b> — ₹${d.price}<br>`;
  });

  return {
    text,
    suggestions: ['Cold Drinks', 'Desserts', 'Budget', 'Main Menu'],
    includeBack: true
  };
}

  getBudgetResponse(userInput) {
    if (!SARAS_MENU) {
      return { text: 'Menu data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const budgetMatch = userInput.match(/₹?(\d+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : 150;

    const allDishes = this.getAllDishesFlat();
    const affordable = allDishes.filter(d => d.price <= budget).sort((a, b) => a.price - b.price);

    if (affordable.length === 0) {
      return {
        text: `❌ No dishes under ₹${budget}<br><br>Cheapest items:<br>` +
          `• Chapati — ₹20<br>` +
          `• Masala Papad — ₹40<br>` +
          `• Finger Fries — ₹120`,
        suggestions: ['Under ₹200', 'Under ₹300', 'Under ₹500'],
        includeBack: true
      };
    }

    let text = `<b>💰 Affordable Meals Under ₹${budget}</b><br><br>`;
    affordable.slice(0, 10).forEach(d => {
      text += `• <b>${d.name}</b> — ₹${d.price} (${d.category})<br>`;
    });

    if (affordable.length > 10) {
      text += `<br>... and ${affordable.length - 10} more options!`;
    }

    return {
      text,
      suggestions: [`Under ₹${budget + 50}`, `Under ₹${budget + 100}`, 'View All'],
      includeBack: true
    };
  }

  getPremiumResponse() {
    if (!SARAS_MENU) {
      return { text: 'Menu data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const premium = this.getAllDishesFlat().filter(d => d.isPremium);

    let text = "<b>👑 Premium & Chef Special Dishes</b><br><br>";
    text += "Our signature and specialty preparations:<br><br>";

    premium.slice(0, 10).forEach(d => {
      text += `<b>${d.name}</b> — ₹${d.price}<br>`;
      text += `${d.userFriendly}<br><br>`;
    });

    return {
      text,
      suggestions: ['Details', 'Family Combos', 'Best for 2', 'View All'],
      includeBack: true
    };
  }

  getSpiceFilterResponse(userInput) {
    if (!SARAS_MENU) {
      return { text: 'Menu data unavailable', suggestions: ['Back'], includeBack: false };
    }

    const input = userInput.toLowerCase();
    let spiceLevel;
    let heading;

    if (this.matchKeywords(input, ['kids', 'no spice', 'mild', 'zero'])) {
      spiceLevel = 0;
      heading = "😌 <b>Mild & No Spice Dishes</b>";
    } else if (this.matchKeywords(input, ['medium'])) {
      spiceLevel = 2;
      heading = "🌶️ <b>Medium Spice Dishes</b>";
    } else {
      spiceLevel = 4;
      heading = "🔥 <b>Spicy Dishes for Heat Lovers</b>";
    }

    const dishes = this.getAllDishesFlat().filter(d => d.spiceLevel === spiceLevel);

    let text = heading + "<br><br>";
    dishes.slice(0, 8).forEach(d => {
      const spice = '🌶️'.repeat(d.spiceLevel) + '⚪'.repeat(5 - d.spiceLevel);
      text += `• <b>${d.name}</b> — ₹${d.price} ${spice}<br>`;
    });

    return {
      text,
      suggestions: ['Mild', 'Medium', 'Spicy', 'View Details'],
      includeBack: true
    };
  }

  getDishDetailsResponse(dish) {
    const spice = '🌶️'.repeat(dish.spiceLevel) + '⚪'.repeat(5 - dish.spiceLevel);

    let text = `<b>🍽️ ${dish.name}</b><br><br>`;
    text += `<b>Price:</b> ₹${dish.price}<br>`;
    text += `<b>Category:</b> ${dish.category}<br>`;
    text += `<b>Cuisine:</b> ${dish.cuisineType}<br>`;
    text += `<b>Spice Level:</b> ${spice} (${dish.spiceLevel}/5)<br><br>`;
    text += `<b>Description:</b> ${dish.description}<br><br>`;
    text += `<b>Ingredients:</b> ${dish.ingredients.join(', ')}<br><br>`;
    text += `<b>Taste:</b> ${dish.taste}<br>`;
    text += `<b>Best Paired With:</b> ${dish.pairingWith.join(', ')}<br><br>`;
    text += `<b>Why try it?</b> ${dish.userFriendly}`;

    return {
      text,
      suggestions: ['See Similar', 'Order Now', 'More Details', 'Back'],
      includeBack: true
    };
  }

  // ═════════════════════════════════════════════════════════════════════
  //  HELPER FUNCTIONS
  // ═════════════════════════════════════════════════════════════════════

  matchKeywords(input, keywords) {
    return keywords.some(kw => input.includes(kw.toLowerCase()));
  }

  getAllDishesFlat() {
    const dishes = [];

    if (SARAS_MENU.vegetarian) {
      if (SARAS_MENU.vegetarian.starters) dishes.push(...SARAS_MENU.vegetarian.starters);
      if (SARAS_MENU.vegetarian.mainCourse) dishes.push(...SARAS_MENU.vegetarian.mainCourse);
      if (SARAS_MENU.vegetarian.roti) dishes.push(...SARAS_MENU.vegetarian.roti);
      if (SARAS_MENU.vegetarian.rice) dishes.push(...SARAS_MENU.vegetarian.rice);
      if (SARAS_MENU.vegetarian.maharashtrian) dishes.push(...SARAS_MENU.vegetarian.maharashtrian);
    }

    if (SARAS_MENU.nonVegetarian) {
      if (SARAS_MENU.nonVegetarian.starters) dishes.push(...SARAS_MENU.nonVegetarian.starters);
      if (SARAS_MENU.nonVegetarian.mainCourse) dishes.push(...SARAS_MENU.nonVegetarian.mainCourse);
      if (SARAS_MENU.nonVegetarian.biryani) dishes.push(...SARAS_MENU.nonVegetarian.biryani);
    }

    if (SARAS_MENU.beveragesAndDesserts) {
      dishes.push(...SARAS_MENU.beveragesAndDesserts);
    }

    return dishes;
  }

  findDishByName(input) {
    const allDishes = this.getAllDishesFlat();
    return allDishes.find(d => input.toLowerCase().includes(d.name.toLowerCase())) || null;
  }

  // ═════════════════════════════════════════════════════════════════════
  //  AI FALLBACK (optional)
  // ═════════════════════════════════════════════════════════════════════

  async getAIResponse(userInput) {
    try {
      const response = await fetch(`${this.API_BASE}/chatbot/ai-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          history: this.conversationHistory,
          menuData: SARAS_MENU
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        text: data.response || 'Unable to process',
        suggestions: data.suggestions || []
      };
    } catch {
      return null;
    }
  }
}

// Export
if (typeof window !== 'undefined') {
  window.SarasChatbotEngine = SarasChatbotEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SarasChatbotEngine;
}
