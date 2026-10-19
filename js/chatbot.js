/**
 * FinTrack — On-Demand AI Finance Assistant Controller
 * Operates purely on-demand when the user opens the panel.
 * Never continuously polls or leaks keys.
 */

function initChatbot() {
  const chatToggleBtn = document.getElementById('floatingChatBtn');
  const chatPanel = document.getElementById('aiChatPanel');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatMessagesContainer = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const promptChips = document.querySelectorAll('.chat-prompt-chip');

  if (!chatPanel) return;

  const toggleChat = (show) => {
    const isVisible = chatPanel.style.display === 'flex';
    const shouldShow = show !== undefined ? show : !isVisible;
    chatPanel.style.display = shouldShow ? 'flex' : 'none';
    if (shouldShow && chatInput) {
      setTimeout(() => chatInput.focus(), 150);
      scrollToBottom();
    }
  };

  if (chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => toggleChat());
  }

  // Sidebar link trigger
  const sidebarAiLink = document.getElementById('sidebarAiLink');
  if (sidebarAiLink) {
    sidebarAiLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleChat(true);
    });
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', () => toggleChat(false));
  }

  const scrollToBottom = () => {
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  };

  const appendMessage = (role, text, timestamp) => {
    if (!chatMessagesContainer) return;
    const isUser = role === 'USER';
    const time = timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const msgHtml = `
      <div class="message-bubble ${isUser ? 'message-user' : 'message-assistant'}">
        <div>${text}</div>
        <div class="text-[10px] mt-1 opacity-60 text-end">${time}</div>
      </div>
    `;
    chatMessagesContainer.insertAdjacentHTML('beforeend', msgHtml);
    scrollToBottom();
  };

  // Render initial history from storage
  const renderHistory = () => {
    if (!chatMessagesContainer) return;
    const msgs = window.FT_STORAGE?.getChatMessages() || [];
    chatMessagesContainer.innerHTML = '';
    msgs.forEach(m => appendMessage(m.role, m.content, m.timestamp));
  };
  renderHistory();

  // Send message action
  const handleSendMessage = async () => {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // Append user message
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    appendMessage('USER', text, now);
    window.FT_STORAGE?.addChatMessage({ role: 'USER', content: text, timestamp: now });

    chatInput.value = '';
    chatInput.disabled = true;
    if (chatSendBtn) chatSendBtn.disabled = true;

    // Show typing skeleton
    const typingId = 'typing_' + Date.now();
    const typingHtml = `
      <div id="${typingId}" class="message-bubble message-assistant text-muted">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        <span>Analyzing October INR finances...</span>
      </div>
    `;
    chatMessagesContainer.insertAdjacentHTML('beforeend', typingHtml);
    scrollToBottom();

    try {
      const response = await window.ftApi.sendChatMessage(text);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      appendMessage('ASSISTANT', response.message, response.timestamp);
      window.FT_STORAGE?.addChatMessage({
        role: 'ASSISTANT',
        content: response.message,
        timestamp: response.timestamp
      });
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      appendMessage('ASSISTANT', 'Sorry, I am unable to connect to the finance advisory service right now. Please check if your Spring Boot backend is running or retry shortly.', now);
    } finally {
      chatInput.disabled = false;
      if (chatSendBtn) chatSendBtn.disabled = false;
      chatInput.focus();
    }
  };

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleSendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // Example Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.textContent.trim();
        chatInput.focus();
      }
    });
  });
}

window.initChatbot = initChatbot;
