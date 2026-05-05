import { useEffect, useRef, useState } from "react";
import { chatAPI } from "../api";

const BLUE = "#378ADD";
const TEAL = "#1D9E75";

const Avatar = ({ role }) => (
  <div style={{
    width: 28, height: 28, borderRadius: 9, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    background: role === "assistant" ? "#378ADD18" : "#1D9E7520",
    color: role === "assistant" ? BLUE : TEAL,
    fontSize: 10, fontWeight: 700, letterSpacing: "0.02em",
  }}>
    {role === "assistant" ? "AI" : "ME"}
  </div>
);

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
    <Avatar role="assistant" />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <p style={{ fontSize: 10, color: "#888780", margin: "0 0 4px" }}>AI Assistant</p>
      <div style={{
        background: "#F1EFE8", borderRadius: "4px 14px 14px 14px",
        padding: "12px 16px", display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 150, 300].map((delay) => (
          <div key={delay} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#888780",
            animation: "bounce 1s infinite",
            animationDelay: `${delay}ms`,
          }} />
        ))}
      </div>
    </div>
  </div>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 8,
      flexDirection: isUser ? "row-reverse" : "row",
    }}>
      <Avatar role={message.role} />
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        <p style={{ fontSize: 10, color: "#888780", margin: "0 0 4px" }}>
          {isUser ? "You" : "AI Assistant"}
        </p>
        <div style={{
          maxWidth: "68%", padding: "10px 14px",
          background: isUser ? BLUE : "#F1EFE8",
          color: isUser ? "#fff" : "#2C2C2A",
          borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
          fontSize: 13, lineHeight: 1.55,
        }}>
          {message.content.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const PROMPT_CHIPS = [
  "What are my top selling products?",
  "Which region has the highest revenue?",
  "Show customer trends this month",
  "What's my revenue growth rate?",
];

const EmptyState = ({ onChipClick }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem",
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 16,
      background: "#378ADD15", display: "flex",
      alignItems: "center", justifyContent: "center", marginBottom: 14,
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7.03 3 3 6.58 3 11c0 2.07.85 3.96 2.25 5.4L4 21l5.1-1.5A9.5 9.5 0 0012 20c4.97 0 9-3.58 9-8s-4.03-9-9-9z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", margin: "0 0 6px" }}>
      Sales AI Assistant
    </p>
    <p style={{ fontSize: 13, color: "#888780", margin: "0 0 20px", lineHeight: 1.6 }}>
      Ask anything about your sales data,<br />customers, or business insights.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320 }}>
      {PROMPT_CHIPS.map((chip) => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          style={{
            padding: "8px 12px", background: "#FAFAF8",
            border: "1px solid #EEECEA", borderRadius: 10,
            fontSize: 12, color: "#5F5E5A", cursor: "pointer",
            textAlign: "left", fontFamily: "inherit",
            transition: "all 0.12s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = BLUE;
            e.currentTarget.style.color = BLUE;
            e.currentTarget.style.background = "#E6F1FB";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#EEECEA";
            e.currentTarget.style.color = "#5F5E5A";
            e.currentTarget.style.background = "#FAFAF8";
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  </div>
);

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { if (currentSession) fetchMessages(currentSession); }, [currentSession]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await chatAPI.getSessions();
      setSessions(res.data);
      if (res.data.length > 0 && !currentSession) setCurrentSession(res.data[0]._id);
    } catch (err) {
      console.error("Chat sessions fetch error:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const res = await chatAPI.getSession(sessionId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Chat messages fetch error:", err);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.createSession();
      const newSession = res.data;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession._id);
      setMessages([]);
    } catch (err) {
      console.error("Create chat session error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const content = (text || question).trim();
    if (!content || !currentSession) return;

    const userMessage = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");

    try {
      setLoading(true);
      const res = await chatAPI.sendMessage(currentSession, content);
      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

  return (
    <div style={{ ...s, height: "100%", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .session-item:hover { background: #F1EFE8 !important; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #D3D1C7; border-radius: 3px; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 268, minWidth: 268, display: "flex", flexDirection: "column",
        background: "#FAFAF8", borderRight: "1px solid #EEECEA",
        borderRadius: "16px 0 0 16px",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #EEECEA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL }} />
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888780", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              AI Assistant
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1C1B19", margin: 0 }}>Conversations</h2>
          </div>
          <button
            onClick={createNewSession}
            disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 7, padding: "9px 14px", background: BLUE, color: "#fff",
              border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1,
              transition: "background 0.15s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            New chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {sessionsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                border: "2px solid #E6F1FB", borderTopColor: BLUE,
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#888780" }}>
              <p style={{ fontSize: 13, margin: "0 0 4px" }}>No sessions yet</p>
              <p style={{ fontSize: 11, margin: 0 }}>Start a new conversation</p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session._id}
                className="session-item"
                onClick={() => setCurrentSession(session._id)}
                style={{
                  padding: "10px 16px", cursor: "pointer",
                  borderLeft: `3px solid ${currentSession === session._id ? BLUE : "transparent"}`,
                  background: currentSession === session._id ? "#E6F1FB" : "transparent",
                  transition: "all 0.12s",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {session.title || "New Conversation"}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#888780" }}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500,
                    background: currentSession === session._id ? "#378ADD22" : "#EEECEA",
                    color: currentSession === session._id ? "#185FA5" : "#888780",
                  }}>
                    {session.messages?.length || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "#fff", borderRadius: "0 16px 16px 0",
        boxShadow: "0 1px 12px 0 rgba(44,44,42,0.07)",
      }}>
        {currentSession ? (
          <>
            {/* Topbar */}
            <div style={{
              padding: "14px 20px", borderBottom: "1px solid #EEECEA",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: "#378ADD12", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="10" rx="3" stroke={BLUE} strokeWidth="1.4" />
                  <path d="M5 14l3-3 3 3" stroke={BLUE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1B19", margin: 0 }}>Sales Intelligence</p>
                <p style={{ fontSize: 11, color: TEAL, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: TEAL, display: "inline-block" }} />
                  Ready to assist
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="scrollbar-thin" style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.length === 0
                ? <EmptyState onChipClick={(chip) => sendMessage(chip)} />
                : messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
              }
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: "14px 16px", borderTop: "1px solid #EEECEA", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your sales data…"
                disabled={loading}
                style={{
                  flex: 1, padding: "10px 14px",
                  border: "1px solid #D3D1C7", borderRadius: 12,
                  fontSize: 13, fontFamily: "inherit",
                  background: "#FAFAF8", color: "#2C2C2A",
                  outline: "none", transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = "#D3D1C7"}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !question.trim()}
                style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: loading || !question.trim() ? "#D3D1C7" : BLUE,
                  border: "none", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: loading || !question.trim() ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  flexShrink: 0,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" fill="white" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", margin: 0 }}>Select a conversation</p>
            <p style={{ fontSize: 13, color: "#888780", margin: 0 }}>Choose one from the sidebar or start fresh</p>
            <button
              onClick={createNewSession}
              style={{
                marginTop: 8, padding: "9px 20px", background: BLUE,
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}