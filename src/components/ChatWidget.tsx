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
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, open]);

  useEffect(() => {
    if (streaming) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streaming]);

  async function send(e: FormEvent) {
    e.preventDefault();

    const text = input.trim();
    if (!text || streaming) return;

    const next: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      if (!open) setUnread((n) => n + 1);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e as unknown as FormEvent);
    }
  }

  return (
    <>
      {/* CHAT WIDGET */}
      <div
        className={`fixed bottom-20 right-5 w-80 h-[540px] flex flex-col rounded-3xl overflow-hidden z-50 transition-all duration-500 ease-out backdrop-blur-xl ${
          open
            ? "opacity-100 scale-100 translate-y-0 shadow-2xl"
            : "opacity-0 scale-90 translate-y-8 pointer-events-none"
        } ${isDark ? "glass" : ""}`}
        style={{
          background: isDark ? "rgba(13,10,38,0.85)" : "var(--bg-chat)",
          border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "var(--border-chat)"}`,
          boxShadow: isDark
            ? "0 32px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)"
            : "var(--shadow-chat)",
        }}
      >
        {/* HEADER */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-lg header-shimmer overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                🤖
              </div>
              <span className="grad-text">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 p-4 overflow-y-auto chat-body space-y-3">
          {messages.length === 0 && (
            <div className="text-center mt-12 animate-slide-up">
              <div className="text-5xl mb-4 animate-float-gentle">👋</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Welcome to AI Assistant!
              </h3>
              <p className="text-sm opacity-75" style={{ color: "var(--text-secondary)" }}>
                I'm here to help you with anything you need. Ask me anything!
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end animate-message-right" : "justify-start animate-message-left"}`}
              style={{
                animationDelay: `${Math.min(i * 0.15, 1)}s`,
                animationFillMode: "both"
              }}
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 animate-pulse">
                    🤖
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl break-words shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white rounded-br-md ml-auto"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-md dark:from-gray-700 dark:to-gray-600 dark:text-white"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`text-xs mt-1 opacity-60 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ENHANCED TYPING INDICATOR */}
          {streaming && (
            <div className="flex justify-start animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  🤖
                </div>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full dot1"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full dot2"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full dot3"></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {isTyping ? "Typing..." : "Thinking"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={send}
          className="flex gap-2 p-3 border-t backdrop-blur-sm"
          style={{
            borderColor: isDark ? "rgba(99,102,241,0.2)" : "var(--border)",
            background: isDark ? "rgba(13,10,38,0.3)" : "rgba(255,255,255,0.8)"
          }}
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your message here..."
              rows={1}
              className="w-full resize-none px-3 py-2 pr-8 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-400 shadow-lg text-sm"
              style={{
                background: isDark ? "rgba(31,41,55,0.8)" : "var(--bg-input)",
                borderColor: isDark ? "rgba(75,85,99,0.5)" : "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-400 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                title="Clear message"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="send-btn px-4 py-2 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center gap-1 min-w-[60px] justify-center text-sm"
          >
            {streaming ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Sending</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <span className="text-base">🚀</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ENHANCED FLOATING ACTION BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 w-14 h-14 rounded-2xl border-none cursor-pointer z-50 transition-all duration-500 ease-out hover:scale-110 active:scale-95 group ${
          open ? "rotate-180 bg-gradient-to-r from-red-500 to-pink-500" : "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 animate-glow"
        } ${unread > 0 ? "animate-pulse-ring" : ""}`}
        style={{
          boxShadow: open
            ? "0 8px 32px rgba(239,68,68,0.4)"
            : "0 8px 32px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.1)",
        }}
        title={open ? "Close chat" : "Open chat"}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {unread > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg border-2 border-white">
              {unread > 9 ? "9+" : unread}
            </div>
          )}
          <div className="relative">
            <span className={`text-2xl transition-all duration-300 ${open ? "scale-75" : "group-hover:scale-110"}`}>
              {open ? "✕" : "💬"}
            </span>
            {!open && (
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
            )}
          </div>
        </div>
      </button>
    </>
  );
}