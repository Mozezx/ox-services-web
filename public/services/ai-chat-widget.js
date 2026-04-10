// OX Services AI Chat Widget
// Add this script to static HTML pages to enable the AI chat

(function () {
    'use strict';

    const WEBHOOK_URL = 'https://n8n.oxservices.org/webhook/oxchat';

    // Get current language from localStorage or default to 'en'
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';

    // Translations
    const translations = {
        en: {
            assistantName: 'OX Services Assistant',
            onlineStatus: 'Online now',
            inputPlaceholder: 'Type your message...',
            needHelp: '💬 Need help?',
            openChat: 'Open AI chat',
            closeChat: 'Close chat',
            initialMessage: "Hello! 👋 I'm the OX Services virtual assistant. How can I help you today? What type of service are you looking for?",
            errorMessage: 'Sorry, an error occurred. Please try again or contact us via WhatsApp.'
        },
        nl: {
            assistantName: 'OX Services Assistent',
            onlineStatus: 'Nu online',
            inputPlaceholder: 'Typ uw bericht...',
            needHelp: '💬 Hulp nodig?',
            openChat: 'Open AI chat',
            closeChat: 'Chat sluiten',
            initialMessage: 'Hallo! 👋 Ik ben de virtuele assistent van OX Services. Hoe kan ik u vandaag helpen? Welk type dienst zoekt u?',
            errorMessage: 'Sorry, er is een fout opgetreden. Probeer het opnieuw of neem contact met ons op via WhatsApp.'
        },
        es: {
            assistantName: 'Asistente OX Services',
            onlineStatus: 'En línea ahora',
            inputPlaceholder: 'Escribe tu mensaje...',
            needHelp: '💬 ¿Necesitas ayuda?',
            openChat: 'Abrir chat de IA',
            closeChat: 'Cerrar chat',
            initialMessage: '¡Hola! 👋 Soy el asistente virtual de OX Services. ¿Cómo puedo ayudarte hoy? ¿Qué tipo de servicio estás buscando?',
            errorMessage: 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo o contáctanos por WhatsApp.'
        },
        fr: {
            assistantName: 'Assistant OX Services',
            onlineStatus: 'En ligne maintenant',
            inputPlaceholder: 'Tapez votre message...',
            needHelp: "💬 Besoin d'aide?",
            openChat: 'Ouvrir le chat IA',
            closeChat: 'Fermer le chat',
            initialMessage: "Bonjour! 👋 Je suis l'assistant virtuel d'OX Services. Comment puis-je vous aider aujourd'hui? Quel type de service recherchez-vous?",
            errorMessage: "Désolé, une erreur s'est produite. Veuillez réessayer ou nous contacter via WhatsApp."
        }
    };

    const t = translations[currentLang] || translations.en;
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    let isOpen = false;
    let messages = [];

    // Create styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .ox-chat-button {
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        .ox-chat-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        .ox-chat-badge {
            position: fixed;
            bottom: 90px;
            left: 24px;
            z-index: 9998;
            background: white;
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 14px;
            color: #333;
            animation: bounce 2s infinite;
        }
        .ox-chat-window {
            position: fixed;
            bottom: 96px;
            left: 24px;
            z-index: 9999;
            width: 360px;
            max-width: calc(100vw - 48px);
            height: 500px;
            max-height: calc(100vh - 150px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease-out;
        }
        .ox-chat-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .ox-chat-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ox-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .ox-chat-message {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
        }
        .ox-chat-message.user {
            align-self: flex-end;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }
        .ox-chat-message.ai {
            align-self: flex-start;
            background: white;
            color: #333;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-bottom-left-radius: 4px;
        }
        .ox-chat-typing {
            align-self: flex-start;
            background: white;
            padding: 12px 16px;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            gap: 4px;
        }
        .ox-chat-typing span {
            width: 8px;
            height: 8px;
            background: #9ca3af;
            border-radius: 50%;
            animation: bounce 1s infinite;
        }
        .ox-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
        .ox-chat-typing span:nth-child(3) { animation-delay: 0.3s; }
        .ox-chat-input-area {
            padding: 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
        }
        .ox-chat-input {
            flex: 1;
            padding: 10px 16px;
            border: none;
            background: #f3f4f6;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
            color: #333;
        }
        .ox-chat-input:focus {
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }
        .ox-chat-send {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .ox-chat-send:hover { transform: scale(1.05); }
        .ox-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .ox-chat-close {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ox-chat-close:hover { background: rgba(255,255,255,0.2); }
    `;
    document.head.appendChild(style);

    // Create widget HTML
    function createWidget() {
        // Button
        const button = document.createElement('button');
        button.className = 'ox-chat-button';
        button.setAttribute('aria-label', t.openChat);
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z"/>
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z"/>
        </svg>`;
        document.body.appendChild(button);

        // Badge
        const badge = document.createElement('div');
        badge.className = 'ox-chat-badge';
        badge.textContent = t.needHelp;
        document.body.appendChild(badge);

        button.addEventListener('click', () => {
            if (isOpen) {
                closeChat();
            } else {
                openChat();
            }
        });
    }

    function openChat() {
        isOpen = true;
        document.querySelector('.ox-chat-badge').style.display = 'none';
        document.querySelector('.ox-chat-button').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd"/>
        </svg>`;

        const chatWindow = document.createElement('div');
        chatWindow.className = 'ox-chat-window';
        chatWindow.id = 'ox-chat-window';
        chatWindow.innerHTML = `
            <div class="ox-chat-header">
                <div class="ox-chat-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                </div>
                <div style="flex:1">
                    <h3 style="font-weight:600;font-size:14px;margin:0">${t.assistantName}</h3>
                    <p style="font-size:12px;opacity:0.8;margin:0">${t.onlineStatus}</p>
                </div>
                <button class="ox-chat-close" onclick="window.oxChatClose()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
            <div class="ox-chat-messages" id="ox-chat-messages"></div>
            <div class="ox-chat-input-area">
                <input type="text" class="ox-chat-input" id="ox-chat-input" placeholder="${t.inputPlaceholder}">
                <button class="ox-chat-send" id="ox-chat-send" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Add initial message
        if (messages.length === 0) {
            addMessage(t.initialMessage, 'ai');
        } else {
            renderMessages();
        }

        // Setup input handlers
        const input = document.getElementById('ox-chat-input');
        const sendBtn = document.getElementById('ox-chat-send');

        input.addEventListener('input', () => {
            sendBtn.disabled = !input.value.trim();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                sendMessage(input.value.trim());
                input.value = '';
                sendBtn.disabled = true;
            }
        });

        sendBtn.addEventListener('click', () => {
            if (input.value.trim()) {
                sendMessage(input.value.trim());
                input.value = '';
                sendBtn.disabled = true;
            }
        });

        input.focus();
    }

    function closeChat() {
        isOpen = false;
        const chatWindow = document.getElementById('ox-chat-window');
        if (chatWindow) chatWindow.remove();
        document.querySelector('.ox-chat-button').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z"/>
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z"/>
        </svg>`;
    }

    // Make close function globally accessible
    window.oxChatClose = closeChat;

    function addMessage(text, sender) {
        messages.push({ text, sender, time: new Date() });
        renderMessages();
    }

    function renderMessages() {
        const container = document.getElementById('ox-chat-messages');
        if (!container) return;

        container.innerHTML = messages.map(msg => `
            <div class="ox-chat-message ${msg.sender}">
                ${msg.text.replace(/\n/g, '<br>')}
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('ox-chat-messages');
        if (!container) return;

        const typing = document.createElement('div');
        typing.className = 'ox-chat-typing';
        typing.id = 'ox-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('ox-typing');
        if (typing) typing.remove();
    }

    async function sendMessage(text) {
        addMessage(text, 'user');
        showTyping();

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionId,
                    message: text,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            hideTyping();
            addMessage(data.response || data.message || t.errorMessage, 'ai');
        } catch (error) {
            hideTyping();
            addMessage(t.errorMessage, 'ai');
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
