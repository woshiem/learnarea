"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ── Game Card Config ───────────────────────────────────────────────────────
// Add new game modes here — they'll appear automatically on this page.

type GameCard = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  href: string;
  available: boolean;
  badge?: string;
  gradient: string;
};

const GAME_MODES: GameCard[] = [
  {
    id: "millionaire",
    title: "Who Wants to Be a Millionaire?",
    subtitle: "15 Questions · Lifelines · Prize Ladder",
    icon: "💰",
    description:
      "Upload a PDF and answer 15 AI-generated questions. Use lifelines wisely and climb to $1,000,000!",
    href: "/games/millionaire",
    available: true,
    badge: "🔥 Play Now",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.95), rgba(26,58,107,0.9))",
  },
  {
    id: "flashcard",
    title: "Flashcard Battle",
    subtitle: "Speed · Memory · Streaks",
    icon: "⚡",
    description:
      "Race against the clock to flip and match flashcards generated from your PDF. Build streaks for bonus points.",
    href: "#",
    available: false,
    badge: "Coming Soon",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.7), rgba(30,20,60,0.7))",
  },
  {
    id: "timed-quiz",
    title: "Timed Quiz",
    subtitle: "Race the clock",
    icon: "⏱️",
    description:
      "Answer as many questions as possible before time runs out. Every second counts!",
    href: "#",
    available: false,
    badge: "Coming Soon",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.7), rgba(10,30,20,0.7))",
  },
  {
    id: "true-false",
    title: "True or False",
    subtitle: "Quick fire · Reaction speed",
    icon: "🎯",
    description:
      "Snap decisions — True or False? Generated from your PDF content. Fast and addictive.",
    href: "#",
    available: false,
    badge: "Coming Soon",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.7), rgba(40,10,10,0.7))",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    subtitle: "Pairs · Concentration",
    icon: "🃏",
    description:
      "Find matching concept pairs extracted from your PDF. Tests recall in a fun card-flip format.",
    href: "#",
    available: false,
    badge: "Coming Soon",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.7), rgba(10,30,40,0.7))",
  },
  {
    id: "speed-round",
    title: "Speed Round",
    subtitle: "30 questions · No hints",
    icon: "🚀",
    description:
      "30 rapid-fire questions, 10 seconds each. No lifelines — pure knowledge and speed.",
    href: "#",
    available: false,
    badge: "Coming Soon",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.7), rgba(40,20,0,0.7))",
  },
];

export default function GamesPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Protect this route
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border-subtle)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(2, 11, 24, 0.9)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🎯</span>
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
            <span className="text-gradient-gold">AI Quiz</span> Games
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Signed in as</p>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--gold-400)" }}>
              {user.name}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div className="animate-fade-in" style={{ marginBottom: "48px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Game Selection
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Choose your <span className="text-gradient-gold">game mode</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Upload a PDF and let AI generate your challenge. More modes coming soon!
          </p>
        </div>

        {/* Game Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}>
          {GAME_MODES.map((game, index) => (
            <GameModeCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

function GameModeCard({ game, index }: { game: GameCard; index: number }) {
  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div
        style={{
          background: game.gradient,
          border: game.available ? "1px solid var(--border-gold)" : "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "28px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          opacity: game.available ? 1 : 0.65,
          boxShadow: game.available ? "0 0 40px rgba(251, 191, 36, 0.08)" : "none",
        }}
        onMouseEnter={(e) => {
          if (game.available) {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 48px rgba(251, 191, 36, 0.18)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = game.available ? "0 0 40px rgba(251, 191, 36, 0.08)" : "none";
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "2.8rem", lineHeight: 1 }}>{game.icon}</div>

        {/* Badge */}
        <span className={`badge ${game.available ? "badge-gold" : "badge-coming-soon"}`} style={{ alignSelf: "flex-start" }}>
          {game.badge}
        </span>

        {/* Title */}
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "4px", lineHeight: 1.3 }}>
            {game.title}
          </h2>
          <p style={{ color: "var(--gold-500)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em" }}>
            {game.subtitle}
          </p>
        </div>

        {/* Description */}
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, flex: 1 }}>
          {game.description}
        </p>

        {/* CTA */}
        {game.available ? (
          <Link href={game.href} className="btn-gold" id={`play-${game.id}`} style={{ textAlign: "center" }}>
            Play Now →
          </Link>
        ) : (
          <button disabled className="btn-ghost" style={{ cursor: "not-allowed", opacity: 0.5 }}>
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
}
