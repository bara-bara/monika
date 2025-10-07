import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css'; // استيراد ملف التنسيق الجديد

// Path to the Next.js API Route (assuming it's set up)
const API_URL = '/api/monika-chat';

export default function Home() {
  // الرسالة الترحيبية
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
    <div className={styles.pageWrapper}> {/* Wrapper for full-page background */}
      <div className={styles.chatContainer}>
        <h1 className={styles.header}>Monika AI Life Coach 🧘‍♀️</h1>
        <div className={styles.chatArea}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : styles.monikaRow}`}>
              <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.monikaBubble}`}>
                {/* نستخدم "strong" لعرض نص المرسل بشكل واضح داخل الفقاعة النظيفة */}
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
            placeholder="Ask Monika for a motivational boost or a new goal..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
        <p className={styles.suggestionText}>
          **Try asking:** "I want to schedule a session next Tuesday about my career" or "I want to achieve a better work-life balance in 60 days."
        </p>
      </div>
    </div>
  );
}
