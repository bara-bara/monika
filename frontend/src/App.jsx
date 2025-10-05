import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Vercel path: uses the relative path to the serverless function /api/chat.js
const API_URL = '/api/chat';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'monika', text: "Hello! I'm Monika, your AI life coach. What's one thing you'd like to unlock in your life today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let monikaResponse;

      if (data.function_call) {
        const { name, args } = data.function_call;
        const formattedArgs = JSON.stringify(args, null, 2);
        
        monikaResponse = {
          sender: 'monika',
          text: (
            <>
              **Function Call Requested:** `{name}`
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
                {formattedArgs}
              </pre>
              *(This is the function call payload. In a real application, a system would execute this action.)*
            </>
          ),
          isFunctionCall: true,
        };
      } else {
        monikaResponse = { sender: 'monika', text: data.text };
      }

      setMessages(prev => [...prev, monikaResponse]);

    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages(prev => [...prev, { sender: 'monika', text: "Oops! I ran into an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>Monika AI Life Coach 🧘‍♀️</h1>
      <div className="chat-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              <div className="message-sender">
                **{msg.sender === 'monika' ? 'Monika' : 'You'}**
              </div>
              <div className="message-text">
                {msg.isFunctionCall ? msg.text : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className={`message-row monika`}>
                <div className={`message-bubble monika`}>
                    <div className="message-sender">**Monika**</div>
                    <div className="message-text">...typing...</div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Monika for a motivational boost or a new goal..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
      <p style={{marginTop: '10px', fontSize: '0.8em', color: '#666'}}>
        **Try asking:** "I want to schedule a session next Tuesday about my career" or "I want to achieve a better work-life balance in 60 days."
      </p>
    </div>
  );
}

export default App;
