import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css'; // استدعاء الأنماط الجديدة

// Path to the Next.js API Route (assuming it's set up)
const API_URL = '/api/monika-chat';

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: 'monika', text: "Hello there! I'm Monika, your AI life coach. I'm here to help you on your journey to a more fulfilling life. To start, what's one thing you'd like to achieve or improve in your life? ✨" },
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
        headers: { 'Content-Type': 'application/json' },
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
              <strong>Function Call Requested:</strong> <code>{name}</code>
              <pre className={styles.codeBlock}>
                {formattedArgs}
              </pre>
              <p className={styles.hintText}>
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
    <div className={styles.pageWrapper}>
      <div className={styles.chatContainer}>
        {/* العنوان أصبح أكثر أناقة */}
        <h1 className={styles.header}>
          Monika AI Life Coach <span className={styles.headerIcon}>🧘‍♀️</span>
        </h1>
        <div className={styles.chatArea}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : styles.monikaRow}`}>
              <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.monikaBubble}`}>
                <strong className={styles.messageSender}>
                  {msg.sender === 'monika' ? 'Monika' : 'You'}
                </strong>
                <div className={styles.messageText}>
                  {msg.isFunctionCall ? msg.text : msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
              <div className={`${styles.messageRow} ${styles.monikaRow}`}>
                  <div className={`${styles.messageBubble} ${styles.monikaBubble}`}>
                      <strong className={styles.messageSender}>Monika</strong>
                      <div className={styles.typingIndicator}>...typing...</div>
                </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className={styles.chatInputForm} onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Monika..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className={styles.sendButton}>
            {/* استخدام أيقونة بدلاً من كلمة 'Send' على الهاتف لتقليد تطبيقات الدردشة */}
            <span className={styles.sendText}>Send</span>
            <span className={styles.sendIcon}>⬆️</span> 
          </button>
        </form>
        
        <p className={styles.suggestionText}>
          **Try asking:** "I want to schedule a session next Tuesday about my career" or "I want to achieve a better work-life balance in 60 days."
        </p>
      </div>
    </div>
  );
}
