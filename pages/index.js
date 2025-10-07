import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';

const API_URL = '/api/monika-chat';

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: 'monika', text: "Hey there 😊 I'm Monika, your personal life coach! 💫 Tell me, what's one thing you'd love to improve or achieve today? 🌷" },
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
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });

      const data = await response.json();
      let monikaResponse = data.text || "I'm here with you 💖 Tell me more about how you're feeling!";

      // Clean up any unwanted symbols or code formatting
      monikaResponse = monikaResponse.replace(/[*_#`]/g, '');

      setMessages(prev => [...prev, { sender: 'monika', text: monikaResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'monika', text: "Oops 😅 something went wrong. Try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.chatBox}>
        <header className={styles.header}>
          <span>💬 Monika — Life Coach</span>
        </header>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : styles.monikaRow}`}>
              <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.monikaBubble}`}>
                <span className={styles.senderName}>
                  {msg.sender === 'monika' ? 'Monika' : 'You'}
                </span>
                <p className={styles.text}>{msg.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.messageRow} ${styles.monikaRow}`}>
              <div className={`${styles.messageBubble} ${styles.monikaBubble}`}>
                <span className={styles.senderName}>Monika</span>
                <div className={styles.typing}>...typing...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputForm} onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className={styles.sendButton}>
            <span className={styles.sendIcon}>📩</span>
          </button>
        </form>
      </div>
    </div>
  );
}
