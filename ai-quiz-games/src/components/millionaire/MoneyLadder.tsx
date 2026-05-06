"use client";

// Points ladder — replaces the old money ladder
export const POINTS_LADDER = [
  { pts: 30_000, label: "30.000 puan", isSafe: false }, // Q15
  { pts: 20_000, label: "20.000 puan", isSafe: false }, // Q14
  { pts: 15_000, label: "15.000 puan", isSafe: false }, // Q13
  { pts: 10_000, label: "10.000 puan", isSafe: false }, // Q12
  { pts:  7_500, label: "7.500 puan",  isSafe: false }, // Q11
  { pts:  5_000, label: "5.000 puan",  isSafe: true  }, // Q10 — güvenli
  { pts:  4_000, label: "4.000 puan",  isSafe: false }, // Q9
  { pts:  3_000, label: "3.000 puan",  isSafe: false }, // Q8
  { pts:  2_000, label: "2.000 puan",  isSafe: false }, // Q7
  { pts:  1_500, label: "1.500 puan",  isSafe: false }, // Q6
  { pts:  1_000, label: "1.000 puan",  isSafe: true  }, // Q5 — güvenli
  { pts:    600, label: "600 puan",    isSafe: false }, // Q4
  { pts:    400, label: "400 puan",    isSafe: false }, // Q3
  { pts:    250, label: "250 puan",    isSafe: false }, // Q2
  { pts:    100, label: "100 puan",    isSafe: false }, // Q1
];

// Points awarded per question (incremental, not cumulative)
export const PER_QUESTION_POINTS = [100, 150, 150, 200, 400, 500, 500, 1000, 1000, 1000, 2500, 2500, 5000, 5000, 5000];

export function getSafePts(questionIndex: number): number {
  if (questionIndex < 5) return 0;
  if (questionIndex < 10) return 1_000;
  return 5_000;
}

type MoneyLadderProps = {
  currentQuestion: number; // 0-indexed (0 = Q1)
  isGameOver?: boolean;
};

export default function MoneyLadder({ currentQuestion, isGameOver }: MoneyLadderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", width: "100%", padding: "4px 0" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", textAlign: "center" }}>
        Puan Basamağı
      </p>

      {POINTS_LADDER.map((rung, reversedIndex) => {
        const questionIndex = 14 - reversedIndex;
        const isCurrent = questionIndex === currentQuestion && !isGameOver;
        const isCompleted = questionIndex < currentQuestion || isGameOver;

        let className = "ladder-rung";
        if (isCurrent) className += " current";
        else if (isCompleted) className += " completed";
        else if (rung.isSafe) className += " safe";

        return (
          <div key={reversedIndex} className={className}>
            <span style={{ fontWeight: isCurrent ? 700 : 500, color: "inherit" }}>Q{questionIndex + 1}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {rung.isSafe && !isCurrent && <span style={{ fontSize: "0.7rem" }}>🛡️</span>}
              {isCurrent && <span style={{ fontSize: "0.75rem" }}>▶</span>}
              {isCompleted && <span style={{ fontSize: "0.75rem", color: "var(--green-400)" }}>✓</span>}
              <span>{rung.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
