"use client";

import { useEffect, useRef } from "react";

type AudienceData = {
  option: string;
  percentage: number;
  isCorrect: boolean;
}[];

type AudienceChartProps = {
  data: AudienceData;
  onClose: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

export default function AudienceChart({ data, onClose }: AudienceChartProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 11, 24, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="glass-card-gold animate-scale-in"
        style={{ padding: "32px", maxWidth: "480px", width: "100%" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>👥</div>
          <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--gold-400)" }}>
            Seyirci Yoklaması
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            Seyirci oy verdi!
          </p>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", height: "180px", marginBottom: "20px" }}>
          {data.map((item, index) => (
            <div
              key={item.option}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              {/* Percentage label */}
              <span style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: item.isCorrect ? "var(--green-400)" : "var(--text-primary)",
              }}>
                {item.percentage}%
              </span>

              {/* Bar */}
              <div
                style={{
                  width: "100%",
                  height: `${item.percentage}%`,
                  minHeight: "4px",
                  background: item.isCorrect
                    ? "linear-gradient(to top, var(--green-500), var(--green-400))"
                    : "linear-gradient(to top, var(--navy-500), var(--blue-400))",
                  borderRadius: "6px 6px 0 0",
                  animation: `bar-grow 0.8s ease-out ${index * 0.1}s both`,
                  boxShadow: item.isCorrect ? "0 0 12px var(--green-glow)" : "none",
                }}
              />

              {/* Letter label */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                background: "linear-gradient(135deg, var(--gold-600), var(--gold-400))",
                borderRadius: "50%",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--navy-900)",
              }}>
                {LETTERS[index]}
              </span>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: "100%" }}>
          Anladım, teşekkürler!
        </button>
      </div>
    </div>
  );
}

/**
 * Generates fake audience poll data with correct answer weighted higher.
 */
export function generateAudiencePoll(
  options: string[],
  correctAnswer: string,
  eliminatedOptions: string[]
): AudienceData {
  const activeOptions = options.filter((o) => !eliminatedOptions.includes(o));

  // Correct answer gets 55-80% of votes among active options
  const correctPct = Math.floor(Math.random() * 25) + 55;
  const remaining = 100 - correctPct;

  const wrongOptions = activeOptions.filter((o) => o !== correctAnswer);
  let remainingPct = remaining;
  const wrongPcts: number[] = [];

  for (let i = 0; i < wrongOptions.length - 1; i++) {
    const pct = Math.floor(Math.random() * (remainingPct / (wrongOptions.length - i)));
    wrongPcts.push(pct);
    remainingPct -= pct;
  }
  wrongPcts.push(remainingPct);

  let wrongIdx = 0;
  return options.map((option) => {
    if (eliminatedOptions.includes(option)) {
      return { option, percentage: 0, isCorrect: false };
    }
    if (option === correctAnswer) {
      return { option, percentage: correctPct, isCorrect: true };
    }
    return { option, percentage: wrongPcts[wrongIdx++] ?? 0, isCorrect: false };
  });
}
