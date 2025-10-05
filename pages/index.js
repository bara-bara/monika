import React, { useState, useEffect, useRef } from 'react';

// Path to the Next.js API Route we created: /api/monika-chat
const API_URL = '/api/monika-chat';

export default function Home() {
  // تم تحديث الرسالة الترحيبية لتكون ودودة مع إيموجي
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
        /* GLOBAL STYLES */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6; /* خلفية فاتحة وناعمة */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        
        /* CHAT CONTAINER */
        .chat-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 650px; /* زيادة قليلة للعرض */
            display: flex;
            flex-direction: column;
            padding: 25px;
        }

        h1 {
            text-align: center;
            color: #4a90e2; /* أزرق هادئ */
            margin-bottom: 25px;
            font-size: 1.8em;
        }

        /* CHAT AREA - منطقة الدردشة */
        .chat-area {
            height: 450px; /* زيادة ارتفاع المنطقة */
            overflow-y: auto;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        /* SCROLLBAR STYLE (لجعل شريط التمرير أنظف) */
        .chat-area::-webkit-scrollbar {
          width: 8px;
        }
        .chat-area::-webkit-scrollbar-thumb {
          background-color: #c9c9c9;
          border-radius: 4px;
        }

        .message-row {
            display: flex;
            margin-bottom: 5px;
        }

        .message-row.user {
            justify-content: flex-end;
        }

        .message-row.monika {
            justify-content: flex-start;
        }

        /* MESSAGE BUBBLES - فقاعات الدردشة */
        .message-bubble {
            padding: 12px 18px;
            border-radius: 20px;
            max-width: 80%;
            line-height: 1.6;
            word-wrap: break-word;
            font-size: 1em;
            white-space: pre-wrap; /* يحافظ على تنسيق السطور الجديدة من Gemini */
        }

        .message-bubble.user {
            background-color: #4a90e2; /* أزرق أساسي */
            color: white;
            border-bottom-right-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .message-bubble.monika {
            background-color: #e6f3ff; /* أزرق فاتح جداً */
            color: #333;
            border: 1px solid #d0e8ff;
            border-bottom-left-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .message-sender {
            font-weight: bold;
            margin-bottom: 5px;
            color: #2c3e50;
            text-transform: capitalize;
            font-size: 0.9em;
        }
        
        .message-row.user .message-sender {
            color: white; 
        }

        /* INPUT FORM - شريط الإدخال */
        .chat-input-form {
            display: flex;
            gap: 10px;
        }

        .chat-input-form input {
            flex-grow: 1;
            padding: 12px 18px;
            border: 1px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        
        .chat-input-form input:focus {
            border-color: #4a90e2;
            outline: none;
        }

        .chat-input-form button {
            padding: 12px 25px;
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
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
      <p style={{marginTop: '15px', fontSize: '0.9em', color: '#666', textAlign: 'center'}}>
        Try asking: "I want to schedule a session next Tuesday about my career" or "I want to achieve a better work-life balance in 60 days."
      </p>
    </div>
  );
}
