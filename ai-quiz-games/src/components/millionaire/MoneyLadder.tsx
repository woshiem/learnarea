"use client";

// Prize ladder values — fictional, Millionaire-inspired
export const PRIZE_LADDER = [
  { label: "$1,000,000", isSafe: false },  // Q15
  { label: "$750,000",   isSafe: false },  // Q14
  { label: "$500,000",   isSafe: false },  // Q13
  { label: "$250,000",   isSafe: false },  // Q12
  { label: "$100,000",   isSafe: false },  // Q11
  { label: "$64,000",    isSafe: true  },  // Q10 — safe haven
  { label: "$32,000",    isSafe: false },  // Q9
  { label: "$16,000",    isSafe: false },  // Q8
  { label: "$8,000",     isSafe: false },  // Q7
  { label: "$4,000",     isSafe: false },  // Q6
  { label: "$1,000",     isSafe: true  },  // Q5 — safe haven
  { label: "$500",       isSafe: false },  // Q4
  { label: "$300",       isSafe: false },  // Q3
  { label: "$200",       isSafe: false },  // Q2
  { label: "$100",       isSafe: false },  // Q1
];

type MoneyLadderProps = {
  currentQuestion: number; // 0-indexed (0 = Q1)
  isGameOver?: boolean;
};

export default function MoneyLadder({ currentQuestion, isGameOver }: MoneyLadderProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      width: "100%",
      padding: "4px 0",
    }}>
      <p style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "8px",
        textAlign: "center",
      }}>
        Prize Ladder
      </p>

      {/* Render from top (highest) to bottom (lowest) */}
      {PRIZE_LADDER.map((rung, reversedIndex) => {
        // reversedIndex 0 = Q15, 14 = Q1
        // questionIndex (0-based) = 14 - reversedIndex
        const questionIndex = 14 - reversedIndex;
        const isCurrent = questionIndex === currentQuestion && !isGameOver;
        const isCompleted = questionIndex < currentQuestion || isGameOver;

        let className = "ladder-rung";
        if (isCurrent) className += " current";
        else if (isCompleted) className += " completed";
        else if (rung.isSafe) className += " safe";

        return (
          <div key={reversedIndex} className={className}>
            <span style={{ fontWeight: isCurrent ? 700 : 500, color: "inherit" }}>
              Q{questionIndex + 1}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {rung.isSafe && !isCurrent && (
                <span style={{ fontSize: "0.7rem" }}>🛡️</span>
              )}
              {isCurrent && (
                <span style={{ fontSize: "0.75rem" }}>▶</span>
              )}
              {isCompleted && (
                <span style={{ fontSize: "0.75rem", color: "var(--green-400)" }}>✓</span>
              )}
              <span>{rung.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
