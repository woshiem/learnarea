"use client";

type AnswerState = "idle" | "selected" | "correct" | "wrong" | "eliminated";

type QuestionCardProps = {
  questionNumber: number;          // 1-based
  questionText: string;
  options: string[];
  eliminatedOptions: string[];     // 50:50 removed options
  selectedAnswer: string | null;
  answerState: AnswerState;        // global state of this question
  correctAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled: boolean;
};

const LETTERS = ["A", "B", "C", "D"];

export default function QuestionCard({
  questionNumber,
  questionText,
  options,
  eliminatedOptions,
  selectedAnswer,
  answerState,
  correctAnswer,
  onSelectAnswer,
  disabled,
}: QuestionCardProps) {
  function getButtonState(option: string): AnswerState {
    if (eliminatedOptions.includes(option)) return "eliminated";
    if (answerState === "idle") {
      return selectedAnswer === option ? "selected" : "idle";
    }
    if (option === correctAnswer) return "correct";
    if (option === selectedAnswer) return "wrong";
    return "idle";
  }

  return (
    <div className="animate-scale-in">
      {/* Question number badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <span style={{
          background: "linear-gradient(135deg, var(--gold-600), var(--gold-400))",
          color: "var(--navy-900)",
          fontWeight: 800,
          fontSize: "0.8rem",
          padding: "4px 12px",
          borderRadius: "999px",
          letterSpacing: "0.05em",
        }}>
          SORU {questionNumber} / 15
        </span>
        <DifficultyBadge questionNumber={questionNumber} />
      </div>

      {/* Question text */}
      <div
        className="glass-card-gold"
        style={{ padding: "28px 32px", marginBottom: "28px" }}
      >
        <p style={{
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          fontWeight: 600,
          lineHeight: 1.6,
          color: "var(--text-primary)",
        }}>
          {questionText}
        </p>
      </div>

      {/* Answer options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {options.map((option, index) => {
          const btnState = getButtonState(option);
          return (
            <button
              key={option}
              id={`answer-${LETTERS[index]}`}
              className={`answer-btn ${btnState}`}
              onClick={() => !disabled && btnState !== "eliminated" && onSelectAnswer(option)}
              disabled={disabled || btnState === "eliminated"}
              aria-label={`Option ${LETTERS[index]}: ${option}`}
            >
              <span className="answer-letter">{LETTERS[index]}</span>
              <span style={{ flex: 1 }}>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DifficultyBadge({ questionNumber }: { questionNumber: number }) {
  let label: string;
  let color: string;
  let bg: string;

  if (questionNumber <= 5) {
    label = "Kolay";
    color = "var(--green-400)";
    bg = "rgba(74, 222, 128, 0.12)";
  } else if (questionNumber <= 10) {
    label = "Orta";
    color = "var(--gold-400)";
    bg = "rgba(251, 191, 36, 0.12)";
  } else {
    label = "Zor";
    color = "var(--red-400)";
    bg = "rgba(239, 68, 68, 0.12)";
  }

  return (
    <span style={{
      background: bg,
      color,
      fontSize: "0.72rem",
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: "999px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}
