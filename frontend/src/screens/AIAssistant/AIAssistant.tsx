import { useState } from 'react';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import styles from './AIAssistant.module.css';

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

// No real AI connected yet — this is a UI preview of the interaction pattern,
// not a working assistant. Wiring an actual model (with real access to the
// user's score/transactions, ideally via the backend rather than the client)
// is planned for a later sprint. Cycling a small pool of canned replies keeps
// that honest rather than pretending to understand what was typed.
const CANNED_REPLIES = [
  "I'm just a preview for now — I can't actually read your transactions yet. Once connected, I'll be able to answer things like this directly.",
  "Not live yet! When this is wired up, questions like that will pull from your real score and statement data.",
  "This is a placeholder response — the real assistant will reason over your actual signals and history once integrated.",
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'll eventually be able to answer questions about your transactions, spending patterns, and how to improve your score. For now, try sending a message to see how the chat will feel.",
    },
  ]);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const reply = CANNED_REPLIES[messages.length % CANNED_REPLIES.length];
    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: reply }]);
    setDraft('');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Assistant</h1>
        <span className={styles.previewBadge}>Preview — not live yet</span>
      </div>
      <p className={styles.subtitle}>Your financial assistant, coming in a future update.</p>

      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} className={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant].join(' ')}>
            {m.text}
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={draft}
          placeholder="Ask about your transactions…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!draft.trim()} aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
