import React, { useState, useEffect, useRef } from 'react';

// Path to the Next.js API Route we created: /api/monika-chat
const API_URL = '/api/monika-chat';

export default function Home() {
  // تم حذف رموز ** من الرسالة الترحيبية لتجنب ظهورها
  const [messages, setMessages] = useState([
    { sender: 'monika', text: "Hello! I'm Monika, your AI life coach. What's one thing you'd like to unlock in your life today? ✨" },
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
              { /* تم حذف ** حول Function Call Requested */ }
              Function Call Requested: `{name}`
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
      <style jsx global>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7f6;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .chat-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #4a90e2;
            margin-bottom: 20px;
        }
        .chat-area {
            height: 400px;
            overflow-y: auto;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            flex-direction: column;
        }
        .message-row {
            display: flex;
            margin-bottom: 15px;
        }
        .message-row.user {
            justify-content: flex-end;
        }
        .message-row.monika {
            justify-content: flex-start;
        }
        .message-bubble {
            padding: 10px 15px;
            border-radius: 20px;
            max-width: 75%;
            line-height: 1.5;
            word-wrap: break-word;
        }
        .message-bubble.user {
            background-color: #4a90e2;
            color: white;
            border-bottom-right-radius: 5px;
        }
        .message-bubble.monika {
            background-color: #e6f3ff;
            color: #333;
            border: 1px solid #d0e8ff;
            border-bottom-left-radius: 5px;
        }
        .message-sender {
            font-weight: bold;
            margin-bottom: 5px;
            color: #2c3e50;
            text-transform: capitalize;
        }
        .message-row.user .message-sender {
            color: white;
        }
        .chat-input-form {
            display: flex;
            gap: 10px;
        }
        .chat-input-form input {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 20px;
            font-size: 16px;
        }
        .chat-input-form button {
            padding: 10px 20px;
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        .chat-input-form button:hover:not(:disabled) {
            background-color: #357ab8;
        }
        .chat-input-form button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
      `}</style>

      <h1>Monika AI Life Coach 🧘‍♀️</h1>
      <div className="chat-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              <div className="message-sender">
                {msg.sender === 'monika' ? 'Monika' : 'You'}
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
                    <div className="message-sender">Monika</div>
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
        Try asking: "I want to schedule a session next Tuesday about my career" or "I want to achieve a better work-life balance in 60 days."
      </p>
    </div>
  );
}
