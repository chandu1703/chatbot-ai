"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Message } from "./Chat";
import { useTheme } from "@/context/ThemeContext";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 220); }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((p) => [...p, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages((p) => {
          const u = [...p];
          u[u.length - 1] = { role: "assistant", content: u[u.length - 1].content + chunk };
          return u;
        });
      }
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((p) => {
        const u = [...p];
        u[u.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
        return u;
      });
    } finally {
      setStreaming(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as FormEvent); }
  }

  const panelStyle: React.CSSProperties = {
    position: "fixed", bottom: "90px", right: "20px", zIndex: 50,
    width: "360px", maxWidth: "calc(100vw - 40px)", height: "540px",
    display: "flex", flexDirection: "column",
    borderRadius: "20px", overflow: "hidden",
    background: "var(--bg-chat)",
    border: "1px solid var(--border-chat)",
    boxShadow: "var(--shadow-chat)",
    animation: "slide-up 0.32s cubic-bezier(0.34,1.56,0.64,1) both",
    transition: "background 0.3s",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 18px", flexShrink: 0, position: "relative", overflow: "hidden",
    background: "linear-gradient(90deg, #4338ca, #6d28d9, #0e7490)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <>
      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={headerStyle} className="header-shimmer">
            <div style={{
              width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0,
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BotSVG />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>AI Assistant</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: streaming ? "#a5b4fc" : "#818cf8",
                  boxShadow: streaming ? "0 0 8px #818cf8" : "0 0 5px #6366f1",
                  animation: streaming ? "glow-pulse 1.2s ease-in-out infinite" : "none",
                }} />
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>
                  {streaming ? "Typing..." : "Online"}
                </span>
              </div>
            </div>
            {/* Theme toggle */}
            <button onClick={toggle} title={isDark ? "Light mode" : "Dark mode"} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.85)", transition: "all 0.15s", marginRight: "4px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >
              {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.7)", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              <CloseSVG />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-body" style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", textAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", inset: "-6px", borderRadius: "18px",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", filter: "blur(12px)", opacity: 0.5,
                  }} />
                  <div style={{
                    position: "relative", width: "60px", height: "60px", borderRadius: "16px",
                    background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "float 4s ease-in-out infinite",
                  }}>
                    <BotSVG size={28} />
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px" }}>Hi there!</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>Ask me anything. I am here to help.</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
                  {["Explain a concept", "Debug my code", "Write something"].map((s) => (
                    <button key={s} onClick={() => setInput(s)} style={{
                      padding: "6px 14px", borderRadius: "99px", fontSize: "12px", cursor: "pointer",
                      color: "rgba(165,180,252,0.9)", background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.3)", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.25)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const isLastAI = !isUser && i === messages.length - 1;
              return (
                <div key={i} className="animate-fade-in" style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                  {!isUser && (
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0,
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <BotSVG size={13} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "10px 14px", fontSize: "13.5px",
                    lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    ...(isUser ? {
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      borderRadius: "18px 18px 4px 18px",
                      color: "#fff",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                    } : {
                      background: "var(--bg-msg-ai)",
                      border: "1px solid var(--border)",
                      borderRadius: "18px 18px 18px 4px",
                      color: "var(--text-primary)",
                    }),
                  }}>
                    {msg.content === "" && streaming && isLastAI ? (
                      <span style={{ display: "flex", gap: "4px", alignItems: "center", height: "18px" }}>
                        <span className="dot1" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
                        <span className="dot2" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                        <span className="dot3" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#67e8f9", display: "inline-block" }} />
                      </span>
                    ) : msg.content}
                    {streaming && isLastAI && msg.content !== "" && (
                      <span className="animate-cursor" style={{ display: "inline-block", width: "2px", height: "14px", background: "#818cf8", marginLeft: "2px", verticalAlign: "text-bottom", borderRadius: "1px" }} />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: "12px", borderTop: "1px solid var(--border)", background: "var(--bg-chat)", flexShrink: 0, display: "flex", gap: "10px", alignItems: "flex-end", transition: "background 0.3s" }}>
            <textarea
              ref={inputRef} value={input} rows={1}
              onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Message AI Assistant..." disabled={streaming}
              style={{
                flex: 1, resize: "none", borderRadius: "14px", padding: "11px 14px",
                fontSize: "13.5px", color: "var(--text-primary)", background: "var(--bg-input)",
                border: "1px solid var(--border)", maxHeight: "112px",
                overflowY: "auto", transition: "border-color 0.2s, background 0.3s",
                caretColor: "#818cf8", lineHeight: 1.5, fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <button type="button" onClick={send as unknown as React.MouseEventHandler} disabled={!input.trim() || streaming}
              className="send-btn"
              style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <SendSVG />
            </button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="animate-glow"
        style={{
          position: "fixed", bottom: "20px", right: "20px", zIndex: 50,
          width: "60px", height: "60px", borderRadius: "18px", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          background: open ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
          transform: open ? "rotate(90deg) scale(0.92)" : "rotate(0deg) scale(1)",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.transform = "scale(1.1) translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = open ? "rotate(90deg) scale(0.92)" : "rotate(0deg) scale(1)"; }}
      >
        <span style={{ position: "absolute", inset: 0, borderRadius: "18px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", opacity: open ? 0 : 0.5, animation: "pulse-ring 2.2s ease-out infinite", pointerEvents: "none" }} />
        {open ? <CloseSVG size={22} /> : <BotSVG size={26} />}
        {!open && unread > 0 && (
          <span style={{
            position: "absolute", top: "-5px", right: "-5px",
            width: "20px", height: "20px", borderRadius: "50%",
            background: "linear-gradient(135deg,#f43f5e,#e11d48)",
            color: "#fff", fontSize: "10px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 10px rgba(244,63,94,0.6)",
          }}>
            {unread}
          </span>
        )}
      </button>
    </>
  );
}

function BotSVG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="15" x2="8" y2="15" strokeWidth={3} />
      <line x1="12" y1="15" x2="12" y2="15" strokeWidth={3} />
      <line x1="16" y1="15" x2="16" y2="15" strokeWidth={3} />
    </svg>
  );
}

function CloseSVG({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendSVG() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
