"use client";

import { useEffect, useState } from "react";

const ANALYZING_MESSAGES = [
  "📖 Reading your document…",
  "🔍 Identifying key concepts…",
  "🧠 Generating questions with AI…",
  "⚖️ Balancing difficulty levels…",
  "💡 Crafting hints and explanations…",
  "✅ Almost ready…",
];

type LoadingScreenProps = {
  fileName?: string;
};

export default function LoadingScreen({ fileName }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messageIndex >= ANALYZING_MESSAGES.length - 1) return;
    const timer = setTimeout(() => {
      setMessageIndex((i) => Math.min(i + 1, ANALYZING_MESSAGES.length - 1));
    }, 2200);
    return () => clearTimeout(timer);
  }, [messageIndex]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.1) 0%, var(--navy-950) 70%)",
      }}
    >
      {/* Pulsing orb */}
      <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "40px" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--gold-400), var(--gold-600))",
            animation: "pulse-gold 1.6s ease infinite, float 3s ease-in-out infinite",
            boxShadow: "0 0 60px var(--gold-glow)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "12px",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            animation: "spin 3s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          🤖
        </div>
      </div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
        AI is analyzing your PDF
      </h2>

      {fileName && (
        <p style={{
          color: "var(--gold-400)",
          fontSize: "0.875rem",
          marginBottom: "32px",
          padding: "6px 16px",
          background: "rgba(251,191,36,0.1)",
          borderRadius: "999px",
          border: "1px solid rgba(251,191,36,0.2)",
          maxWidth: "300px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          📄 {fileName}
        </p>
      )}

      {/* Animated status messages */}
      <div style={{
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "40px",
      }}>
        <p
          key={messageIndex}
          className="animate-fade-in"
          style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
        >
          {ANALYZING_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: "8px" }}>
        {ANALYZING_MESSAGES.map((_, i) => (
          <div
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: i <= messageIndex ? "var(--gold-400)" : "var(--border-mid)",
              transition: "background 0.4s ease",
              boxShadow: i === messageIndex ? "0 0 10px var(--gold-glow)" : "none",
            }}
          />
        ))}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "32px" }}>
        This usually takes 10–30 seconds
      </p>
    </div>
  );
}
