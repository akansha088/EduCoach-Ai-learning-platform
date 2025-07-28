import React, { useState, useRef, useEffect } from 'react';
import './chatbot.css';

const Chatbot = ({ user, onClose }) => {
  const [messages, setMessages] = useState([
    {
      text: `Hi ${user?.name || 'there'}! I'm your AI learning assistant. I can help you with course questions, study tips, or anything related to your learning journey. How can I assist you today?`,
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          userContext: {
            name: user?.name,
            isAuth: true,
          }
        }),
      });

      const data = await response.json();
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again or contact support if the problem persists.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How do I access my courses?",
    "Tell me about course progress tracking",
    "What are the payment options?",
    "How do I reset my password?",
    "Study tips for better learning"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">
              {message.text}
            </div>
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
          placeholder="Ask me anything about your learning..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;