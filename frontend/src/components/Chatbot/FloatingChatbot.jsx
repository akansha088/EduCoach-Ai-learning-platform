import React, { useState } from 'react';
import ChatBot from './ChatBot';
import './FloatingChatbot.css';

const FloatingChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="floating-chat-overlay">
          <div className="floating-chat-container">
            <div className="floating-chat-header">
              <div className="chat-header-info">
                <span className="chat-title">AI Learning Assistant</span>
                <span className="chat-subtitle">Powered by Gemini - Ask anything!</span>
              </div>
              <button 
                className="close-chat-btn"
                onClick={closeChat}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <ChatBot user={user} onClose={closeChat} />
          </div>
        </div>
      )}
      
      <button 
        className={`floating-chat-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? '×' : '🤖'}
      </button>
    </>
  );
};

export default FloatingChatbot;