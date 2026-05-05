"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { QuizQuestion, GameState, LifelineState } from "@/types/question";

// Components
import QuestionCard from "@/components/millionaire/QuestionCard";
import MoneyLadder from "@/components/millionaire/MoneyLadder";
import JokerPanel from "@/components/millionaire/JokerPanel";
import AudienceChart, { generateAudiencePoll } from "@/components/millionaire/AudienceChart";
import GameResult from "@/components/millionaire/GameResult";
import LoadingScreen from "@/components/shared/LoadingScreen";
import ErrorMessage from "@/components/shared/ErrorMessage";

// ── Hint Modal ─────────────────────────────────────────────────────────────
function HintModal({ hint, onClose }: { hint: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(2,11,24,0.85)", backdropFilter: "blur(8px)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card-gold animate-scale-in"
        style={{ padding: "32px", maxWidth: "440px", width: "100%", textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💡</div>
        <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--gold-400)", marginBottom: "16px" }}>
          AI Hint
        </h3>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: "24px" }}>
          {hint}
        </p>
        <button onClick={onClose} className="btn-primary" style={{ width: "100%" }}>
          Got it!
        </button>
      </div>
    </div>
  );
}

// ── Upload Phase ───────────────────────────────────────────────────────────
function UploadPhase({
  onUpload,
  error,
  onClearError,
}: {
  onUpload: (file: File) => void;
  error: string | null;
  onClearError: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large. Maximum size is 20MB.");
      return;
    }
    onUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", padding: "40px 24px",
    }}>
      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>💰</div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Who Wants to Be a <span className="text-gradient-gold">Millionaire?</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Upload your study material and let AI create your quiz
          </p>
        </div>

        {/* Upload zone */}
        <div
          id="pdf-upload-zone"
          className={`upload-zone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          aria-label="Upload PDF file"
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>
            {dragOver ? "📂" : "📄"}
          </div>
          <p style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "8px" }}>
            {dragOver ? "Drop your PDF here" : "Drag & drop your PDF here"}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "20px" }}>
            or click to browse files
          </p>
          <span className="badge badge-blue">PDF only · Max 20MB</span>
          <input
            ref={fileInputRef}
            id="pdf-file-input"
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            style={{ display: "none" }}
            aria-label="Select PDF file"
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "12px",
            }}
          >
            <p style={{ color: "var(--red-400)", fontSize: "0.9rem", marginBottom: "8px" }}>
              😟 {error}
            </p>
            <button onClick={onClearError} className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
              Try again
            </button>
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: "40px", display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { step: "1", text: "Upload PDF" },
            { step: "2", text: "AI generates 15 questions" },
            { step: "3", text: "Play the quiz!" },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, var(--gold-600), var(--gold-400))",
                color: "var(--navy-900)", fontWeight: 800, fontSize: "0.75rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.step}
              </span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Game Page ─────────────────────────────────────────────────────────
export default function MillionairePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>("uploading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);             // 0-indexed
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [lifelines, setLifelines] = useState<LifelineState>({ fiftyFifty: false, audience: false, hint: false });
  const [showAudience, setShowAudience] = useState(false);
  const [audienceData, setAudienceData] = useState<ReturnType<typeof generateAudiencePoll>>([]);
  const [showHint, setShowHint] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [lastWrongAnswer, setLastWrongAnswer] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);

  // Protect route
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const question = questions[currentQ];

  // ── Upload & Generate ─────────────────────────────────────────────────
  async function handleUpload(file: File) {
    setUploadedFileName(file.name);
    setUploadError(null);
    setGameState("analyzing");

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate questions.");
      }

      if (!data.questions || data.questions.length !== 15) {
        throw new Error(
          "The AI couldn't generate 15 questions from this PDF. " +
          "Make sure the file has enough readable text content."
        );
      }

      setQuestions(data.questions);
      resetGameState();
      setGameState("playing");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setUploadError(msg);
      setGameState("uploading");
    }
  }

  function resetGameState() {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswerRevealed(false);
    setEliminatedOptions([]);
    setLifelines({ fiftyFifty: false, audience: false, hint: false });
    setShowAudience(false);
    setShowHint(false);
    setGameResult(null);
    setLastWrongAnswer("");
    setIsConfirming(false);
  }

  function handlePlayAgain() {
    resetGameState();
    setGameState("uploading");
    setUploadedFileName("");
  }

  // ── Answer Selection ──────────────────────────────────────────────────
  function handleSelectAnswer(answer: string) {
    if (answerRevealed || isConfirming) return;
    setSelectedAnswer(answer);
    setIsConfirming(true);
  }

  // ── Confirm/Lock-in Answer ────────────────────────────────────────────
  const handleConfirmAnswer = useCallback(() => {
    if (!selectedAnswer || !question || answerRevealed) return;

    setAnswerRevealed(true);
    setIsConfirming(false);
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Delay before advancing to show the answer state
    setTimeout(() => {
      if (isCorrect) {
        if (currentQ === 14) {
          // Won the game!
          setGameResult("win");
          setGameState("result");
        } else {
          // Next question
          setCurrentQ((q) => q + 1);
          setSelectedAnswer(null);
          setAnswerRevealed(false);
          setEliminatedOptions([]);
        }
      } else {
        // Game over
        setLastWrongAnswer(selectedAnswer);
        setGameResult("lose");
        setGameState("result");
      }
    }, 2000);
  }, [selectedAnswer, question, answerRevealed, currentQ]);

  function handleChangeAnswer() {
    setIsConfirming(false);
    setSelectedAnswer(null);
  }

  // ── Lifelines ─────────────────────────────────────────────────────────
  function handleFiftyFifty() {
    if (!question || lifelines.fiftyFifty) return;
    setLifelines((l) => ({ ...l, fiftyFifty: true }));

    // Remove 2 wrong answers randomly
    const wrongOptions = question.options.filter((o) => o !== question.correctAnswer);
    const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
    setEliminatedOptions(shuffled.slice(0, 2));

    // If selected answer was eliminated, clear it
    if (selectedAnswer && shuffled.slice(0, 2).includes(selectedAnswer)) {
      setSelectedAnswer(null);
      setIsConfirming(false);
    }
  }

  function handleAudience() {
    if (!question || lifelines.audience) return;
    setLifelines((l) => ({ ...l, audience: true }));
    const poll = generateAudiencePoll(question.options, question.correctAnswer, eliminatedOptions);
    setAudienceData(poll);
    setShowAudience(true);
  }

  function handleHint() {
    if (!question || lifelines.hint) return;
    setLifelines((l) => ({ ...l, hint: true }));
    setShowHint(true);
  }

  // ── Render ────────────────────────────────────────────────────────────
  if (isLoading || !user) return null;

  // Game over/win screen
  if (gameState === "result" && gameResult) {
    return (
      <div className="bg-game">
        <GameResult
          outcome={gameResult}
          finalQuestionIndex={gameResult === "win" ? 15 : currentQ}
          wrongAnswer={lastWrongAnswer || undefined}
          correctAnswer={question?.correctAnswer}
          explanation={question?.explanation}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  // Loading / analyzing
  if (gameState === "analyzing") {
    return (
      <div className="bg-game">
        <LoadingScreen fileName={uploadedFileName} />
      </div>
    );
  }

  // Upload phase
  if (gameState === "uploading") {
    return (
      <div className="bg-game">
        {/* Back link */}
        <header style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
            ← Back to games
          </button>
        </header>

        <UploadPhase
          onUpload={handleUpload}
          error={uploadError}
          onClearError={() => setUploadError(null)}
        />
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────
  if (gameState !== "playing" || !question) {
    return <div className="bg-game"><ErrorMessage message="Unexpected state. Please refresh." /></div>;
  }

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      {/* Modals */}
      {showAudience && (
        <AudienceChart data={audienceData} onClose={() => setShowAudience(false)} />
      )}
      {showHint && (
        <HintModal hint={question.hint} onClose={() => setShowHint(false)} />
      )}

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(2,11,24,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>💰</span>
          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
            <span className="text-gradient-gold">Millionaire</span> Quiz
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            👤 {user.name}
          </span>
          <button
            onClick={handlePlayAgain}
            className="btn-ghost"
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
          >
            ✕ Quit
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 220px",
        gap: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "28px 24px",
        alignItems: "start",
      }}>
        {/* Left — Question + Lifelines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Lifelines */}
          <JokerPanel
            fiftyFiftyUsed={lifelines.fiftyFifty}
            audienceUsed={lifelines.audience}
            hintUsed={lifelines.hint}
            onFiftyFifty={handleFiftyFifty}
            onAudience={handleAudience}
            onHint={handleHint}
            disabled={answerRevealed || isConfirming}
          />

          {/* Question card */}
          <QuestionCard
            questionNumber={currentQ + 1}
            questionText={question.question}
            options={question.options}
            eliminatedOptions={eliminatedOptions}
            selectedAnswer={selectedAnswer}
            answerState={
              !selectedAnswer
                ? "idle"
                : answerRevealed
                ? selectedAnswer === question.correctAnswer
                  ? "correct"
                  : "wrong"
                : "selected"
            }
            correctAnswer={question.correctAnswer}
            onSelectAnswer={handleSelectAnswer}
            disabled={answerRevealed}
          />

          {/* Confirm / Change answer controls */}
          {isConfirming && !answerRevealed && (
            <div
              className="animate-fade-in glass-card"
              style={{
                padding: "20px 24px",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                border: "1px solid var(--border-gold)",
              }}
            >
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", flex: "1 1 auto", textAlign: "center" }}>
                Is <strong style={{ color: "var(--gold-400)" }}>{selectedAnswer}</strong> your final answer?
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  id="change-answer-btn"
                  onClick={handleChangeAnswer}
                  className="btn-ghost"
                  style={{ padding: "8px 18px", fontSize: "0.875rem" }}
                >
                  Change
                </button>
                <button
                  id="confirm-answer-btn"
                  onClick={handleConfirmAnswer}
                  className="btn-gold"
                  style={{ padding: "8px 20px", fontSize: "0.875rem" }}
                >
                  Final Answer! ✓
                </button>
              </div>
            </div>
          )}

          {/* Revealing message */}
          {answerRevealed && (
            <div className="animate-fade-in" style={{ textAlign: "center" }}>
              {selectedAnswer === question.correctAnswer ? (
                <p style={{ color: "var(--green-400)", fontWeight: 700, fontSize: "1.1rem" }}>
                  ✅ Correct! Well done!
                </p>
              ) : (
                <p style={{ color: "var(--red-400)", fontWeight: 700, fontSize: "1.1rem" }}>
                  ❌ That&apos;s not right…
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right — Money ladder */}
        <aside>
          <div className="glass-card" style={{ padding: "16px 12px", position: "sticky", top: "80px" }}>
            <MoneyLadder currentQuestion={currentQ} />
          </div>
        </aside>
      </div>

      {/* Mobile: ladder below on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .game-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
