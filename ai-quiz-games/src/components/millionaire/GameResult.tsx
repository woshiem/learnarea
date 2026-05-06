"use client";

import Link from "next/link";
import { POINTS_LADDER, getSafePts } from "./MoneyLadder";

type GameResultProps = {
  outcome: "win" | "lose";
  finalQuestionIndex: number; // index of the question that ended the game (0-based)
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
  const isWin = outcome === "win";

  // The prize at the level reached (display label from ladder)
  const ladderIndex = 14 - finalQuestionIndex;
  const prizeAtQ = POINTS_LADDER[ladderIndex]?.label ?? "0 puan";

  // Safe prize if eliminated before safe zone
  const safePts = getSafePts(finalQuestionIndex);
  const safePrize = safePts === 0 ? "0 puan" : `${safePts.toLocaleString("tr-TR")} puan`;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", padding: "40px 24px",
      textAlign: "center",
      background: isWin
        ? "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.2) 0%, var(--navy-950) 70%)"
        : "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.15) 0%, var(--navy-950) 70%)",
    }}>
      <div className={isWin ? "animate-float" : "animate-scale-in"} style={{ fontSize: "5rem", marginBottom: "24px", lineHeight: 1 }}>
        {isWin ? "🏆" : "💔"}
      </div>

      <h1 className={isWin ? "text-gradient-gold" : ""} style={{
        fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 900,
        letterSpacing: "-0.02em", marginBottom: "12px",
        color: isWin ? undefined : "var(--red-400)",
      }}>
        {isWin ? "Büyük Ödül! 🎉" : "Oyun Bitti"}
      </h1>

      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>
        {isWin
          ? "Muhteşem! 15 soruyu da doğru yanıtladın!"
          : `${finalQuestionIndex} soruyu doğru yanıtladın.`}
      </p>

      <div className="glass-card-gold animate-scale-in" style={{ padding: "28px 40px", marginBottom: "32px", minWidth: "280px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
          {isWin ? "Kazanılan Puan" : "Güvenli Puan"}
        </p>
        <p className={isWin ? "text-gradient-gold" : ""}
          style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, color: isWin ? undefined : "var(--gold-400)" }}>
          {isWin ? prizeAtQ : safePrize}
        </p>
        {!isWin && finalQuestionIndex > 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Ulaştığın basamak: <strong style={{ color: "var(--text-primary)" }}>{prizeAtQ}</strong>
          </p>
        )}
      </div>

      {!isWin && wrongAnswer && correctAnswer && (
        <div className="glass-card" style={{
          padding: "20px 24px", maxWidth: "540px", marginBottom: "32px",
          border: "1px solid rgba(239,68,68,0.3)", textAlign: "left",
        }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--red-400)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ✗ Senin cevabın
          </p>
          <p style={{ color: "var(--text-secondary)", marginBottom: "14px", fontSize: "0.9rem" }}>{wrongAnswer}</p>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--green-400)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ✓ Doğru cevap
          </p>
          <p style={{ color: "var(--text-primary)", marginBottom: explanation ? "14px" : "0", fontSize: "0.9rem" }}>{correctAnswer}</p>
          {explanation && (
            <>
              <div className="section-divider" style={{ margin: "14px 0" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>💡 {explanation}</p>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onPlayAgain} className="btn-gold" style={{ padding: "14px 32px", fontSize: "1rem" }}>
          🔄 Tekrar Oyna
        </button>
        <Link href="/games" className="btn-ghost" style={{ padding: "14px 28px", fontSize: "1rem" }}>
          ← Oyun Seçimi
        </Link>
      </div>
    </div>
  );
}
