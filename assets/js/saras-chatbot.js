// ═══════════════════════════════════════════════════════════════════════════
//  saras-chatbot.js — UI Controller for Saras AI Chatbot
//  Handles: DOM rendering, animations, user interactions
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {

  console.log('=== Saras Chatbot Initializing ===');
  console.log('Menu loaded:', typeof SARAS_MENU !== 'undefined' ? '✓' : '✗');
  console.log('Engine loaded:', typeof SarasChatbotEngine !== 'undefined' ? '✓' : '✗');

  // Check dependencies
  if (typeof SARAS_MENU === 'undefined') {
    console.error('❌ SARAS_MENU not loaded. Check menu-data.js');
    return;
  }

  if (typeof SarasChatbotEngine === 'undefined') {
    console.error('❌ SarasChatbotEngine not loaded. Check chatbot-engine.js');
    return;
  }

  // ─────────────────────────────────────────────────────────────────────
  //  STYLES
  // ─────────────────────────────────────────────────────────────────────

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Forum&family=DM+Sans:wght@300;400;500;600&display=swap');

    #saras-chat-btn {
      position: fixed; bottom: 30px; left: 30px;
      width: 70px; height: 70px;
      background: linear-gradient(135deg, #c9a96e, #a07840);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9998;
      box-shadow: 0 4px 20px rgba(201, 169, 110, 0.4);
      transition: all 0.3s ease;
      border: none;
      font-size: 28px;
    }

    #saras-chat-btn:hover {
      transform: scale(1.15);
      box-shadow: 0 6px 28px rgba(201, 169, 110, 0.6);
    }

    #saras-chat-bubble {
      position: fixed;
      bottom: 105px;
      left: 30px;
      background: #c9a96e;
      color: #111;
      padding: 10px 16px;
      border-radius: 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      z-index: 9997;
      white-space: nowrap;
      animation: slideUp 0.4s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #saras-chat-window {
      position: fixed;
      bottom: 100px;
      left: 30px;
      width: 420px;
      height: 600px;
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      border-top: 3px solid #c9a96e;
      border-radius: 16px;
      display: none;
      flex-direction: column;
      z-index: 9999;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      font-family: 'DM Sans', sans-serif;
      animation: slideUpWindow 0.3s ease;
    }

    @keyframes slideUpWindow {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #saras-chat-window.open {
      display: flex;
    }

    .chat-header {
      background: linear-gradient(135deg, #141414, #1a1a1a);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #222;
    }

    .chat-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #c9a96e, #a07840);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #111;
      font-weight: bold;
      flex-shrink: 0;
    }

    .chat-header-info {
      flex: 1;
    }

    .chat-header-name {
      color: #c9a96e;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }

    .chat-header-status {
      color: #4caf7d;
      font-size: 11px;
      margin: 0;
    }

    .chat-close {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chat-close:hover {
      color: #999;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: #1a1a1a;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .msg {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .msg.user {
      flex-direction: row-reverse;
    }

    .msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }

    .msg.bot .msg-avatar {
      background: linear-gradient(135deg, #c9a96e, #a07840);
      color: #111;
    }

    .msg.user .msg-avatar {
      background: #222;
      color: #c9a96e;
    }

    .msg-bubble {
      max-width: 80%;
      padding: 11px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.6;
      word-wrap: break-word;
    }

    .msg.bot .msg-bubble {
      background: #1a1a1a;
      color: #e0e0e0;
      border: 1px solid #2a2a2a;
    }

    .msg.user .msg-bubble {
      background: linear-gradient(135deg, #c9a96e, #a07840);
      color: #111;
    }

    .quick-btns {
      padding: 8px 14px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 100px;
      overflow-y: auto;
    }

    .quick-btn {
      background: #1a1a1a;
      border: 1px solid #c9a96e;
      color: #c9a96e;
      padding: 7px 12px;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .quick-btn:hover {
      background: #2a2a2a;
      transform: translateY(-2px);
    }

    .chat-input-row {
      padding: 12px 14px;
      border-top: 1px solid #1a1a1a;
      display: flex;
      gap: 8px;
      background: #0d0d0d;
    }

    .chat-input {
      flex: 1;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 24px;
      padding: 10px 16px;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
    }

    .chat-input:focus {
      outline: none;
      border-color: #c9a96e;
      background: #222;
    }

    .chat-input::placeholder {
      color: #666;
    }

    .chat-send {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a96e, #a07840);
      color: #111;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
      font-size: 16px;
    }

    .chat-send:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(201, 169, 110, 0.3);
    }

    .typing-bubble {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .typing-dot {
      width: 8px;
      height: 8px;
      background: #c9a96e;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        opacity: 0.3;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-10px);
      }
    }

    @media (max-width: 480px) {
      #saras-chat-window {
        width: calc(100vw - 20px);
        height: 70vh;
        bottom: 100px;
        left: 10px;
      }
    }
  `;
  document.head.appendChild(style);

  // ─────────────────────────────────────────────────────────────────────
  //  HTML STRUCTURE
  // ─────────────────────────────────────────────────────────────────────

  const html = `
    <div id="saras-chat-bubble">💬 Ask me anything!</div>
    <button id="saras-chat-btn" aria-label="Open chat">🤖</button>

    <div id="saras-chat-window">
      <div class="chat-header">
        <div class="chat-avatar">S</div>
        <div class="chat-header-info">
          <p class="chat-header-name">Saras Assistant</p>
          <p class="chat-header-status">● Online & Ready</p>
        </div>
        <button class="chat-close" id="saras-chat-close" aria-label="Close chat">✕</button>
      </div>

      <div class="chat-messages" id="saras-chat-messages"></div>

      <div class="quick-btns" id="saras-quick-btns"></div>

      <div class="chat-input-row">
        <input 
          class="chat-input" 
          id="saras-chat-input" 
          placeholder="Type your question..."
          autocomplete="off"
        />
        <button class="chat-send" id="saras-chat-send" aria-label="Send message">↗</button>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  console.log('✓ DOM elements created');

  // ─────────────────────────────────────────────────────────────────────
  //  Initialize Chatbot Engine
  // ─────────────────────────────────────────────────────────────────────

  const sarasEngine = new SarasChatbotEngine();
  console.log('✓ ChatBot engine initialized');

  // ─────────────────────────────────────────────────────────────────────
  //  DOM Elements
  // ─────────────────────────────────────────────────────────────────────

  const chatBtn     = document.getElementById('saras-chat-btn');
  const chatWindow  = document.getElementById('saras-chat-window');
  const chatClose   = document.getElementById('saras-chat-close');
  const chatInput   = document.getElementById('saras-chat-input');
  const chatSend    = document.getElementById('saras-chat-send');
  const messages    = document.getElementById('saras-chat-messages');
  const quickBtns   = document.getElementById('saras-quick-btns');
  const bubble      = document.getElementById('saras-chat-bubble');

  let isOpen = false;

  // ─────────────────────────────────────────────────────────────────────
  //  MESSAGE RENDERING
  // ─────────────────────────────────────────────────────────────────────

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML = `<div class="msg-avatar">👤</div><div class="msg-bubble">${escapeHtml(text)}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    // Convert HTML tags properly for display
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  function updateQuickReplies(suggestions) {
    quickBtns.innerHTML = '';
    if (!suggestions || suggestions.length === 0) return;

    suggestions.forEach(suggestion => {
      const btn = document.createElement('button');
      btn.className = 'quick-btn';
      btn.textContent = suggestion;
      btn.onclick = () => handleUserMessage(suggestion);
      quickBtns.appendChild(btn);
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  //  MESSAGE HANDLING
  // ─────────────────────────────────────────────────────────────────────

  async function handleUserMessage(userText) {
    if (!userText.trim()) return;

    addUserMessage(userText);
    chatInput.value = '';

    addTypingIndicator();

    // Small delay for better UX
    setTimeout(async () => {
      const response = await sarasEngine.getResponse(userText);
      removeTypingIndicator();

      addBotMessage(response.text);
      updateQuickReplies(response.suggestedReplies || []);
    }, 800);
  }

  // ─────────────────────────────────────────────────────────────────────
  //  CHAT TOGGLE
  // ─────────────────────────────────────────────────────────────────────

  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      chatWindow.classList.add('open');
      bubble.style.display = 'none';

      // Initialize on first open
      if (messages.children.length === 0) {
        sarasEngine.initialize();
        const welcome = sarasEngine.conversationHistory[0];
        addBotMessage(welcome.content);
        updateQuickReplies(welcome.suggestedReplies || []);
      }

      chatInput.focus();
    } else {
      chatWindow.classList.remove('open');
      bubble.style.display = 'block';
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  //  EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────

  chatBtn.addEventListener('click', toggleChat);
  chatClose.addEventListener('click', toggleChat);

  chatSend.addEventListener('click', () => {
    handleUserMessage(chatInput.value.trim());
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage(chatInput.value.trim());
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  //  HELPER FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  console.log('✓ Saras Chatbot Ready!');
});
