import React, { useState } from 'react';
import Chatbot from './chatbot/';  // Note: Component name starts with capital

import './FloatingChatbot.css';

const FloatingChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="floating-chat-overlay">
          <div className="floating-chat-container">
            <div className="floating-chat-header">
              <div className="chat-header-info">
                <span className="chat-title">AI Learning Assistant</span>
                <span className="chat-subtitle">Ask me about courses, lectures, or anything!</span>
              </div>
              <button 
                className="close-chat-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <Chatbot user={user} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
      
      <button 
        className={`floating-chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
      >
        {isOpen ? '×' : '🤖'}
      </button>
    </>
  );
};

export default FloatingChatbot;