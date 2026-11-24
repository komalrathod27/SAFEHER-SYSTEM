import { useState, useRef, useEffect } from "react";
import "../safeher-css/chatbot.css";
import ReactMarkdown from "react-markdown";

const API_URL = "/api/chatbot/chat"; // change to full URL if you don't use a proxy

const QUICK_QUESTIONS = [
  "How does SOS work?",
  "How do I report an incident?",
  "What is the Safety Map?",
  "Helpline numbers in India",
];

export default function ChatBot({ onClose, onSOS }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm SafeHer Assistant. Ask me about safety tips, your legal rights, or helplines.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (quickText) => {
    const text = (typeof quickText === "string" ? quickText : input).trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // skip the greeting so history starts with a user message
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.reply ||
            "Sorry, something went wrong. If you're in danger, call 112.",
          emergency: data.emergency,
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Network error. If you're in danger, call 112.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>SafeHer AI Assistant</span>
        <button className="chat-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === "assistant" ? (
              <ReactMarkdown>{m.content}</ReactMarkdown>
            ) : (
              m.content
            )}
            {m.emergency && (
              <div className="sos-actions">
                {onSOS && (
                  <button type="button" className="sos-btn" onClick={onSOS}>
                    Send SOS Alert
                  </button>
                )}
                <a className="sos-btn sos-call" href="tel:112">
                  Call 112
                </a>
              </div>
            )}
          </div>
        ))}
        {messages.length === 1 && (
          <div className="quick-replies">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        {loading && <div className="msg assistant">Typing…</div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about safety, rights, helplines…"
        />
        <button onClick={() => send()} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
