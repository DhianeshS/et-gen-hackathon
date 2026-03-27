document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const logoutBtn = document.getElementById('logout-btn');
  const notificationContainer = document.getElementById('notification-container');

  // User State
  let currentUser = null;

  // Render text to simple HTML (for chat)
  function parseMessageText(text) {
    let parsed = text
      .trim()
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return `<p>${parsed}</p>`;
  }

  // Show Toast Notification
  function showNotification(title, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';

    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="text-indigo"><path d="M22 11.08V12a10 10 10 0 1-1-5.93"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    notificationContainer.appendChild(toast);

    // Remove toast after 4s
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.4s ease-in reverse forwards';
      setTimeout(() => {
        if(toast.parentElement) toast.remove();
      }, 400);
    }, 4000);
  }

  // Update UI with User Data
  function updateDashboardUI(user) {
    document.getElementById('welcome-name').innerText = user.name;
    document.getElementById('sidebar-name').innerText = user.name;
    document.getElementById('sidebar-email').innerText = user.email;
    
    // Set Avatar initials
    document.getElementById('sidebar-avatar').innerText = user.name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  // Login Flow
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const btn = document.getElementById('login-btn');
    
    btn.innerHTML = `
      <span class="typing-indicator" style="display:inline-flex;">
        <span class="typing-dot" style="background:white;"></span>
        <span class="typing-dot" style="background:white;"></span>
        <span class="typing-dot" style="background:white;"></span>
      </span>
    `;
    btn.disabled = true;

    // Simulate backend call
    const response = await BackendAPI.login(name, email);
    
    if (response.status === 'success') {
      currentUser = response.user;
      
      // Setup Dashboard
      updateDashboardUI(currentUser);
      
      // Screen transition
      loginScreen.classList.remove('active');
      setTimeout(() => {
        dashboardScreen.classList.add('active');
        
        // Show the backend notification requested in prompt
        showNotification("Backend Success", `User ${currentUser.name} has logged in.`);
      }, 400);
    }
    
    btn.innerHTML = `
      Connect to Mentor
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
    `;
    btn.disabled = false;
  });

  // Chat Input Toggling
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = chatInput.value.trim() === '';
  });

  // Sending a Message
  function appendMessage(role, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.className = \`message \${role}-message\`;
    
    const avatar = document.createElement('div');
    avatar.className = \`avatar \${role}-avatar\`;
    
    if (role === 'user') {
       avatar.innerText = currentUser.name[0].toUpperCase();
    } else {
       avatar.innerText = 'AI';
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = htmlContent;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return msgDiv; // So we can manipulation it (e.g. for typing indicator)
  }

  // Handle Form Submission for Chat
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Append User Message
    appendMessage('user', parseMessageText(message));
    
    // Clear Input
    chatInput.value = '';
    sendBtn.disabled = true;

    // Add Mentor Typing Indicator
    const typingMsg = appendMessage('mentor', \`
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    \`);

    // Call Backend API
    const response = await BackendAPI.chat(message, currentUser);
    
    // Remove Typing Indicator & Add Real Message
    typingMsg.remove();
    appendMessage('mentor', parseMessageText(response.reply));
  });

  // Logout Workflow
  logoutBtn.addEventListener('click', () => {
    dashboardScreen.classList.remove('active');
    setTimeout(() => {
      loginScreen.classList.add('active');
      loginForm.reset();
      currentUser = null;
      // Clear chat messages (besides first)
      while (chatMessages.children.length > 1) {
        chatMessages.lastChild.remove();
      }
    }, 400);
  });
});
