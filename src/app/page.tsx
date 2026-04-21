import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, var(--bg-page-from) 0%, var(--bg-page-mid) 40%, var(--bg-page-to) 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.3s",
      }}
    >
      {/* Animated background orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-15%", left: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          animation: "float 7s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          animation: "float 9s ease-in-out infinite 2s",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite 1s",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
      </div>

      {/* Hero content */}
      <div style={{ position: "relative", textAlign: "center", padding: "0 1.5rem", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "2rem" }}>
          <div style={{
            position: "absolute", inset: "-8px", borderRadius: "24px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            filter: "blur(16px)", opacity: 0.5,
          }} />
          <div style={{
            position: "relative", width: "80px", height: "80px", borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))",
            border: "1px solid rgba(165,180,252,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "float 5s ease-in-out infinite",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#pg)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="100%" stopColor="#67e8f9" />
                </linearGradient>
              </defs>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <line x1="12" y1="7" x2="12" y2="11" />
              <line x1="8" y1="15" x2="8" y2="15" strokeWidth={3} />
              <line x1="12" y1="15" x2="12" y2="15" strokeWidth={3} />
              <line x1="16" y1="15" x2="16" y2="15" strokeWidth={3} />
            </svg>
          </div>
        </div>

        <h1 className="grad-text" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 800, margin: "0 0 1rem", letterSpacing: "-0.02em" }}>
          AI Assistant
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "420px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
          Real-time AI powered by Groq. Fast, accurate, and always ready to help.
        </p>

        {/* Feature badges */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.6rem", marginBottom: "2.5rem" }}>
          {["Real-time streaming", "Context-aware", "Multi-turn memory"].map((label) => (
            <span key={label} style={{
              padding: "0.4rem 1rem", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 500,
              color: "rgba(99,102,241,0.9)",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}>
              {label}
            </span>
          ))}
        </div>

        <p style={{ color: "rgba(99,102,241,0.7)", fontSize: "0.85rem", animation: "float 3s ease-in-out infinite" }}>
          Click the button in the bottom-right corner to start
        </p>
      </div>

      <ChatWidget />
    </main>
  );
}
