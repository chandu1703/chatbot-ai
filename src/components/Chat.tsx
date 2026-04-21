"use client";

import { useRef, useState, useEffect, FormEvent } from "react";
import MessageBubble from "./MessageBubble";
import { useTheme } from "@/context/ThemeContext";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || isStreaming) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Placeholder for the assistant reply
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as FormEvent);
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      width: "100%", maxWidth: "768px", height: "90vh",
      background: "var(--bg-chat)",
      borderRadius: "20px",
      boxShadow: "var(--shadow-chat)",
      overflow: "hidden",
      border: "1px solid var(--border-chat)",
      transition: "background 0.3s, box-shadow 0.3s",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(90deg, #4338ca, #6d28d9, #0e7490)",
        flexShrink: 0,
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
          background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "13px", color: "#fff",
        }}>
          AI
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>AI Assistant</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", marginTop: "1px" }}>
            {isStreaming ? <span style={{ color: "#a5b4fc" }}>Typing…</span> : "Online"}
          </div>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "10px", width: "36px", height: "36px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", transition: "background 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="chat-body" style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", color: "var(--text-secondary)", gap: "8px" }}>
            <span style={{ fontSize: "2.5rem" }}>💬</span>
            <p style={{ fontSize: "14px", margin: 0 }}>Ask me anything. I&apos;m here to help.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{
          display: "flex", alignItems: "flex-end", gap: "10px",
          padding: "14px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-chat)",
          flexShrink: 0,
          transition: "background 0.3s",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message AI Assistant… (Enter to send, Shift+Enter for newline)"
          disabled={isStreaming}
          style={{
            flex: 1, resize: "none",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            borderRadius: "14px", padding: "12px 16px",
            fontSize: "14px", border: "1px solid var(--border)",
            maxHeight: "144px", overflowY: "auto",
            outline: "none", lineHeight: "1.5",
            transition: "border-color 0.2s, background 0.3s",
            fontFamily: "inherit",
            opacity: isStreaming ? 0.6 : 1,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="send-btn"
          style={{
            flexShrink: 0, color: "#fff", borderRadius: "14px",
            padding: "12px 20px", fontSize: "14px", fontWeight: 600,
            border: "none", cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
