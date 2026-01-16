import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface AIChatWidgetProps {
    webhookUrl?: string;
    initialMessage?: string;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({
    webhookUrl = '',
    initialMessage = 'Hello! 👋 I\'m the OX Services virtual assistant. How can I help you today? What type of service are you looking for?'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Add initial message when chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: `msg_${Date.now()}`,
                text: initialMessage,
                sender: 'ai',
                timestamp: new Date()
            }]);
        }
    }, [isOpen, initialMessage, messages.length]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            text: inputValue.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            if (webhookUrl) {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId,
                        message: userMessage.text,
                        timestamp: userMessage.timestamp.toISOString(),
                        history: messages.map(m => ({
                            text: m.text,
                            sender: m.sender,
                            timestamp: m.timestamp.toISOString()
                        }))
                    })
                });

                const data = await response.json();

                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: `msg_${Date.now()}`,
                    text: data.response || data.message || 'Sorry, I could not process your message.',
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            } else {
                // Fallback response when no webhook is configured
                setTimeout(() => {
                    setIsTyping(false);
                    setMessages(prev => [...prev, {
                        id: `msg_${Date.now()}`,
                        text: getDefaultResponse(userMessage.text),
                        sender: 'ai',
                        timestamp: new Date()
                    }]);
                }, 1000);
            }
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: `msg_${Date.now()}`,
                text: 'Sorry, an error occurred. Please try again or contact us via WhatsApp.',
                sender: 'ai',
                timestamp: new Date()
            }]);
        }
    };

    const getDefaultResponse = (userText: string): string => {
        const lowerText = userText.toLowerCase();

        if (lowerText.includes('solar') || lowerText.includes('energia') || lowerText.includes('painel')) {
            return 'Ótimo! Trabalhamos com sistemas de energia solar fotovoltaica. Poderia me informar:\n\n1. É para residência ou empresa?\n2. Qual o consumo médio mensal de energia (em kWh)?\n3. Qual a localização do projeto?';
        }
        if (lowerText.includes('alumínio') || lowerText.includes('aluminio') || lowerText.includes('janela') || lowerText.includes('porta') || lowerText.includes('vidro')) {
            return 'Excelente! Somos especialistas em esquadrias de alumínio e vidros. Para elaborar um orçamento, preciso saber:\n\n1. Quantas janelas/portas você precisa?\n2. São medidas padrão ou sob medida?\n3. Qual o endereço da obra?';
        }
        if (lowerText.includes('móvel') || lowerText.includes('movel') || lowerText.includes('móveis') || lowerText.includes('moveis') || lowerText.includes('mobília') || lowerText.includes('mobilia')) {
            return 'Perfeito! Fabricamos móveis sob medida. Para um orçamento personalizado:\n\n1. Que tipo de móvel você precisa (armário, mesa, estante, etc.)?\n2. Quais as dimensões aproximadas?\n3. Tem preferência de material ou acabamento?';
        }
        if (lowerText.includes('telhado') || lowerText.includes('cobertura') || lowerText.includes('epdm') || lowerText.includes('impermeabiliza')) {
            return 'Trabalhamos com impermeabilização EPDM de alta durabilidade. Para um orçamento:\n\n1. Qual a área aproximada em m²?\n2. É um telhado plano ou inclinado?\n3. Há problemas de infiltração atualmente?';
        }
        if (lowerText.includes('orçamento') || lowerText.includes('orcamento') || lowerText.includes('preço') || lowerText.includes('preco') || lowerText.includes('valor')) {
            return 'Ficarei feliz em ajudar com um orçamento! Para isso, preciso de algumas informações:\n\n1. Qual serviço você precisa?\n2. Qual a localização da obra?\n3. Qual seu nome e melhor contato?';
        }

        return 'Got it! We offer the following services:\n\n• **Aluminum Joinery** - Windows and doors\n• **Solar Energy** - PV systems\n• **Bespoke Furniture** - Custom design\n• **EPDM Roofing** - Waterproofing\n\nWhich of these services interests you? Or tell me more about your project!';
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="ai-chat-button fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
                aria-label={isOpen ? 'Close chat' : 'Open AI chat'}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                        <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                    </svg>
                )}
            </button>

            {/* Notification Badge */}
            {!isOpen && messages.length === 0 && (
                <div className="fixed bottom-[72px] left-6 z-50 animate-bounce">
                    <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-gray-700 max-w-[200px]">
                        💬 Need help?
                    </div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="ai-chat-window fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-150px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    style={{
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 text-white"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">OX Services Assistant</h3>
                            <p className="text-xs opacity-80">Online now</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                                        ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-br-md'
                                        : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    <p className={`text-[10px] mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                                        {formatTime(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                                disabled={isTyping}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || isTyping}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatWidget;
