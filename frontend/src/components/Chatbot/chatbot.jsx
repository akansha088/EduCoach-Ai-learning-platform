// src/components/chatbot/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import { generateResponse } from '../../services/GeminiChat';

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const ChatBot = ({ user, onClose }) => {
  const [messages, setMessages] = useState([
    {
      text: `Hi ${user?.name || 'there'}! I'm your AI learning assistant powered by Gemini. I can help you with course questions, study tips, or anything related to your learning journey. How can I assist you today?`,
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  // Remove theme logic and theme switcher UI

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    const userMessage = { text: currentInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to Gemini:', currentInput);

      const userContext = {
        name: user?.name,
        isAuth: !!user,
        userId: user?.id || null
      };

      const response = await generateResponse(currentInput, userContext);

      if (response) {
        const botMessage = { text: response, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response received from Gemini API');
      }

    } catch (error) {
      console.error('ChatBot Error:', error);

      let errorText = 'Sorry, I encountered an error. ';
      if (error.message.includes('API key not found')) {
        errorText += 'API configuration issue. Please contact support.';
      } else if (error.message) {
        errorText += error.message;
      } else {
        errorText += 'Please try again or contact support.';
      }

      const errorMessage = { text: errorText, sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const quickQuestions = [
    "How do I access my courses?",
    "Tell me about course progress tracking",
    "What are effective study techniques?",
    "How do I reset my password?",
    "Tips for online learning success"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="chatbot-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0 20px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.01em' }}>AI Tutor</h2>
        {/* Remove theme switcher UI */}
      </div>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="quick-questions">
          <p className="quick-questions-title">Quick questions you can ask:</p>
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-question-btn"
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading && input.trim()) {
                sendMessage(e);
              }
            }
          }}
          placeholder="Ask me anything about your learning..."
          disabled={isLoading}
          maxLength={500}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          <span>{isLoading ? '...' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;