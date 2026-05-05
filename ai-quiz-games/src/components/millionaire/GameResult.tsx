"use client";

import Link from "next/link";
import { PRIZE_LADDER } from "./MoneyLadder";

type GameResultProps = {
  outcome: "win" | "lose";
  finalQuestionIndex: number;   // 0-indexed question they stopped at
  wrongAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  onPlayAgain: () => void;
};

export default function GameResult({
  outcome,
  finalQuestionIndex,
  wrongAnswer,
  correctAnswer,
  explanation,
  onPlayAgain,
}: GameResultProps) {
  // Safe haven prize: if you lose before Q5 you get $0, after Q5 you keep $1000, after Q10 you keep $64,000
  function getSafePrize(): string {
    if (finalQuestionIndex < 5) return "$0";
    if (finalQuestionIndex < 10) return "$1,000";
    return "$64,000";
  }

  // Prize at the question they reached (0-indexed → ladder is reversed)
  const ladderIndex = 14 - finalQuestionIndex;
  const prizeLabelAtQ = PRIZE_LADDER[ladderIndex]?.label ?? "$0";

  const isWin = outcome === "win";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px 24px",
        textAlign: "center",
        background: isWin
          ? "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.2) 0%, var(--navy-950) 70%)"
          : "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.15) 0%, var(--navy-950) 70%)",
      }}
    >
      {/* Big icon */}
      <div
        className={isWin ? "animate-float" : "animate-scale-in"}
        style={{ fontSize: "5rem", marginBottom: "24px", lineHeight: 1 }}
      >
        {isWin ? "🏆" : "💔"}
      </div>

      {/* Title */}
      <h1
        className={isWin ? "text-gradient-gold" : ""}
        style={{
          fontSize: "clamp(1.8rem, 5vw, 3rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "12px",
          color: isWin ? undefined : "var(--red-400)",
        }}
      >
        {isWin ? "You're a Millionaire! 🎉" : "Game Over"}
      </h1>

      {/* Subtitle */}
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>
        {isWin
          ? "Outstanding! You answered all 15 questions correctly!"
          : `You answered ${finalQuestionIndex} question${finalQuestionIndex !== 1 ? "s" : ""} correctly.`}
      </p>

      {/* Prize card */}
      <div
        className="glass-card-gold animate-scale-in"
        style={{ padding: "28px 40px", marginBottom: "32px", minWidth: "280px" }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
          {isWin ? "Final Prize" : "You walk away with"}
        </p>
        <p
          className={isWin ? "text-gradient-gold" : ""}
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            color: isWin ? undefined : "var(--gold-400)",
          }}
        >
          {isWin ? prizeLabelAtQ : getSafePrize()}
        </p>
        {!isWin && finalQuestionIndex > 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            You had reached: <strong style={{ color: "var(--text-primary)" }}>{prizeLabelAtQ}</strong>
          </p>
        )}
      </div>

      {/* Wrong answer explanation */}
      {!isWin && wrongAnswer && correctAnswer && (
        <div
          className="glass-card"
          style={{
            padding: "20px 24px",
            maxWidth: "540px",
            marginBottom: "32px",
            border: "1px solid rgba(239,68,68,0.3)",
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--red-400)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ✗ Your answer
          </p>
          <p style={{ color: "var(--text-secondary)", marginBottom: "14px", fontSize: "0.9rem" }}>
            {wrongAnswer}
          </p>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--green-400)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ✓ Correct answer
          </p>
          <p style={{ color: "var(--text-primary)", marginBottom: explanation ? "14px" : "0", fontSize: "0.9rem" }}>
            {correctAnswer}
          </p>
          {explanation && (
            <>
              <div className="section-divider" style={{ margin: "14px 0" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                💡 {explanation}
              </p>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          id="play-again-btn"
          onClick={onPlayAgain}
          className="btn-gold"
          style={{ padding: "14px 32px", fontSize: "1rem" }}
        >
          🔄 Play Again
        </button>
        <Link
          href="/games"
          className="btn-ghost"
          style={{ padding: "14px 28px", fontSize: "1rem" }}
        >
          ← Game Selection
        </Link>
      </div>
    </div>
  );
}
