import React, { useState, useEffect, useRef } from 'react';

// Path to the Next.js API Route (assuming it's set up)
const API_URL = '/api/monika-chat';

export default function Home() {
  // تم تحديث الرسالة الترحيبية لتكون ودودة مع إيموجي (بدون رموز Markdown)
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
              {/* إزالة رموز ** لـ Function Call */}
              **Function Call Requested:** `{name}`
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflowX: 'auto', fontSize: '0.9em' }}>
                {formattedArgs}
              </pre>
              <p style={{ color: '#888', marginTop: '10px', fontSize: '0.8em' }}>
                *(This is the function call payload. In a real application, a system would execute this action.)*
              </p>
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
      setMessages(prev => [...prev, { sender: 'monika', text: "Oops! I ran into an error. Please try again. 😔" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <style jsx global>{`
        /* GLOBAL MODERN STYLES */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #eef1f5; /* خلفية عصرية فاتحة جداً */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        
        /* CHAT CONTAINER - الحاوية الأساسية */
        .chat-container {
            background: #ffffff;
            border-radius: 16px; /* حواف أكثر استدارة */
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            width: 100%;
            max-width: 700px; /* زيادة العرض للمظهر الاحترافي */
            height: 85vh; /* تحديد ارتفاع مناسب */
            display: flex;
            flex-direction: column;
            padding: 25px;
        }

        h1 {
            text-align: center;
            color: #1e3a8a; /* أزرق داكن (احترافي) */
            margin-bottom: 25px;
            font-size: 2em;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 15px;
        }

        /* CHAT AREA - منطقة الدردشة (الحديثة) */
        .chat-area {
            flex-grow: 1; /* يأخذ المساحة المتبقية */
            overflow-y: auto;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        /* SCROLLBAR STYLE */
        .chat-area::-webkit-scrollbar { width: 8px; }
        .chat-area::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 4px; }
        .chat-area::-webkit-scrollbar-track { background: #f0f0f0; }


        .message-row {
            display: flex;
            margin-bottom: 10px;
        }

        .message-row.user { justify-content: flex-end; }
        .message-row.monika { justify-content: flex-start; }

        /* MESSAGE BUBBLES - فقاعات الدردشة */
        .message-bubble {
            padding: 12px 16px;
            border-radius: 18px;
            max-width: 85%;
            line-height: 1.5;
            font-size: 1em;
            white-space: pre-wrap;
            position: relative;
        }

        .message-bubble.user {
            background-color: #4f46e5; /* أزرق بنفسجي عصري */
            color: white;
            border-bottom-right-radius: 4px; /* زاوية مربعة قليلاً */
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
        }

        .message-bubble.monika {
            background-color: #ffffff; 
            color: #333;
            border: 1px solid #e0e0e0;
            border-bottom-left-radius: 4px; /* زاوية مربعة قليلاً */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        /* إخفاء اسم المرسل في الفقاعة للحصول على مظهر أنظف */
        .message-sender {
            display: none; 
        }

        /* INPUT FORM - شريط الإدخال */
        .chat-input-form {
            display: flex;
            gap: 10px;
        }

        .chat-input-form input {
            flex-grow: 1;
            padding: 14px 20px;
            border: 1px solid #ccc;
            border-radius: 28px; /* حواف أكثر استدارة */
            font-size: 16px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .chat-input-form input:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
            outline: none;
        }

        .chat-input-form button {
            padding: 12px 25px;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 28px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.2s, transform 0.1s;
        }

        .chat-input-form button:hover:not(:disabled) {
            background-color: #4338ca;
        }
        
        .chat-input-form button:active:not(:disabled) {
            transform: scale(0.98);
        }

        .chat-input-form button:disabled {
            background-color: #a5b4fc;
            cursor: not-allowed;
        }
        
        /* Loading State (Typing...) */
        .message-text.typing-dots::after {
            content: '...';
            animation: dot-loading 1s infinite steps(3);
        }
        @keyframes dot-loading {
            0% { content: '.'; }
            33% { content: '..'; }
            66% { content: '...'; }
        }
        
      `}</style>

      <h1>Monika AI Life Coach 🧠</h1>
      <div className="chat-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              {/* تمت إزالة div.message-sender للحصول على مظهر أنظف، حيث يظهر المرسل من خلال موضع الفقاعة */}
              <div className="message-text">
                {msg.isFunctionCall ? msg.text : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className={`message-row monika`}>
                <div className={`message-bubble monika`}>
                    {/* إخفاء اسم Monika في حالة الكتابة للمظهر العصري */}
                    <div className="message-text typing-dots">Monika is thinking</div>
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
      {/* تم تعديل التوجيهات لتكون في سطر واحد دون رموز ** */}
      <p style={{marginTop: '15px', fontSize: '0.9em', color: '#6b7280', textAlign: 'center'}}>
        **Try asking:** "I want to schedule a session next Tuesday about my career" or "I want to achieve a better work-life balance in 60 days."
      </p>
    </div>
  );
}
