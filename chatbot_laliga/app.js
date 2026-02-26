// Configuración
const CHAT_API_URL = 'https://unodox.app.n8n.cloud/webhook/chat';

// Función para mostrar mensajes en el chat
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para enviar mensajes al chatbot de n8n
async function sendToN8N(message) {
    try {
        const response = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return {
            answer: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo más tarde.',
            items: []
        };
    }
}

// Función para manejar el envío de mensajes
async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message === '') return;

    // Mostrar mensaje del usuario
    addMessage(message, 'user');
    userInput.value = '';

    // Mostrar indicador de escritura
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'flex';
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

    try {
        // Enviar mensaje a n8n
        const response = await sendToN8N(message);
        
        // Ocultar indicador de escritura
        typingIndicator.style.display = 'none';
        
        // Mostrar respuesta del bot
        if (response.answer) {
            addMessage(response.answer, 'bot');
        }
        
        // Mostrar items adicionales si existen
        if (response.items && response.items.length > 0) {
            response.items.forEach(item => {
                const itemText = `${item.title || ''}: ${item.description || ''}`.trim();
                if (itemText) {
                    addMessage(itemText, 'bot');
                }
            });
        }
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessage('Lo siento, hubo un error al obtener la respuesta. Por favor, inténtalo de nuevo.', 'bot');
    }
}

// Inicialización del chat
function initChatbot() {
    const chatWindow = document.getElementById('chatbot-window');
    const chatButton = document.getElementById('chatbot-button');
    const closeButton = document.getElementById('chatbot-close');
    const sendButton = document.getElementById('send-message');
    const userInput = document.getElementById('user-input');

    // Mostrar/ocultar el chat
    chatButton.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            userInput.focus();
        }
    });

    closeButton.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Enviar mensaje al presionar Enter
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Enviar mensaje al hacer clic en el botón
    sendButton.addEventListener('click', handleSendMessage);
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar la fecha automáticamente
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    
    const currentDateElement = document.getElementById('current-date');
    const currentYearElement = document.getElementById('current-year');
    
    if (currentDateElement) currentDateElement.textContent = formattedDate;
    if (currentYearElement) currentYearElement.textContent = today.getFullYear();
    
    // Inicializar el chatbot
    initChatbot();
});