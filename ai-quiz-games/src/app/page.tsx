"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Already logged in → go straight to games
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/games");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <main className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--border-subtle)",
        maxWidth: "1200px", margin: "0 auto", width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🎯</span>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
            <span className="text-gradient-gold">AI Quiz</span> Games
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login" className="btn-ghost" style={{ padding: "8px 18px" }}>
            Sign in
          </Link>
          <Link href="/register" className="btn-gold" style={{ padding: "8px 20px" }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "80px 24px",
        maxWidth: "900px", margin: "0 auto",
      }}>
        <div className="animate-fade-in-up">
          <span className="badge badge-gold" style={{ marginBottom: "24px" }}>
            ✨ AI-Powered Learning
          </span>

          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
          }}>
            Turn any PDF into an{" "}
            <span className="text-gradient-gold">interactive</span>{" "}
            quiz game
          </h1>

          <p style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            maxWidth: "600px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}>
            Upload your study material, and our AI generates 15 tailored questions.
            Play in a <strong style={{ color: "var(--gold-400)" }}>Millionaire-style</strong> game
            with lifelines, a prize ladder, and increasing difficulty.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-gold" style={{ padding: "14px 32px", fontSize: "1rem" }}>
              🚀 Start Playing Free
            </Link>
            <Link href="/login" className="btn-ghost" style={{ padding: "14px 28px", fontSize: "1rem" }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "80px",
          width: "100%",
          maxWidth: "860px",
        }}>
          {[
            { icon: "📄", title: "Upload PDF", desc: "Drag and drop any study material — textbooks, notes, research papers." },
            { icon: "🤖", title: "AI Generates Questions", desc: "GPT-4 reads your PDF and crafts 15 questions with escalating difficulty." },
            { icon: "🏆", title: "Play & Win", desc: "Climb the prize ladder with lifelines: 50:50, Audience Poll, and Hints." },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-card animate-fade-in"
              style={{ padding: "24px", textAlign: "left", animationDelay: `${i * 0.1}s` }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
