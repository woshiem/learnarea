"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion, GameState, LifelineState } from "@/types/question";
import { usePDF } from "@/context/PDFContext";
import { useProfile } from "@/context/ProfileContext";

import QuestionCard from "@/components/millionaire/QuestionCard";
import MoneyLadder from "@/components/millionaire/MoneyLadder";
import JokerPanel from "@/components/millionaire/JokerPanel";
import AudienceChart, { generateAudiencePoll } from "@/components/millionaire/AudienceChart";
import GameResult from "@/components/millionaire/GameResult";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { PER_QUESTION_POINTS, getSafePts } from "@/components/millionaire/MoneyLadder";

function HintModal({ hint, onClose }: { hint: string; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,11,24,0.85)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <div className="glass-card-gold animate-scale-in" style={{ padding: "32px", maxWidth: "440px", width: "100%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💡</div>
        <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--gold-400)", marginBottom: "16px" }}>AI İpucu</h3>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: "24px" }}>{hint}</p>
        <button onClick={onClose} className="btn-primary" style={{ width: "100%" }}>Anladım!</button>
      </div>
    </div>
  );
}

export default function MillionairePage() {
  const router = useRouter();
  const { pdfFile, pdfName } = usePDF();
  const { addPoints, updateHighScore, awardBadge, incrementGamesPlayed, markGamePlayed } = useProfile();

  const [gameState, setGameState] = useState<GameState>("analyzing");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [lifelines, setLifelines] = useState<LifelineState>({ fiftyFifty: false, audience: false, hint: false });
  const [showAudience, setShowAudience] = useState(false);
  const [audienceData, setAudienceData] = useState<ReturnType<typeof generateAudiencePoll>>([]);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [lastWrongAnswer, setLastWrongAnswer] = useState<string>("");

  useEffect(() => {
    if (!pdfFile) { router.replace("/games"); return; }
    generateQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateQuestions() {
    if (!pdfFile) return;
    setGameState("analyzing");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);
      const res = await fetch("/api/generate-questions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sorular üretilemedi.");
      if (!data.questions || data.questions.length !== 15) throw new Error("AI yeterli soru üretemedi.");
      setQuestions(data.questions);
      resetGameState();
      setGameState("playing");
      incrementGamesPlayed();
      markGamePlayed("millionaire");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
      setGameState("error" as GameState);
    }
  }

  function resetGameState() {
    setCurrentQ(0); setSelectedAnswer(null); setAnswerRevealed(false);
    setEliminatedOptions([]); setLifelines({ fiftyFifty: false, audience: false, hint: false });
    setShowAudience(false); setShowHint(false); setGameResult(null);
    setLastWrongAnswer("");
  }

  function handleAnswer(answer: string) {
    if (answerRevealed) return;
    const question = questions[currentQ];
    setSelectedAnswer(answer);
    setAnswerRevealed(true);
    const isCorrect = answer === question.correctAnswer;

    if (isCorrect) {
      // Award per-question points
      const pts = PER_QUESTION_POINTS[currentQ] ?? 150;
      addPoints(pts);
    }

    setTimeout(() => {
      if (isCorrect) {
        const nextQ = currentQ + 1;
        updateHighScore("millionaire", nextQ);
        // Award milestone badges
        if (nextQ === 10) awardBadge("millionaire_halfway");
        if (nextQ === 15) {
          addPoints(5_000); // grand prize bonus
          awardBadge("millionaire_win");
          awardBadge("perfect_any");
          setGameResult("win");
          setGameState("result");
        } else {
          setCurrentQ(nextQ);
          setSelectedAnswer(null);
          setAnswerRevealed(false);
          setEliminatedOptions([]);
        }
      } else {
        // Award safe prize points
        const safePts = getSafePts(currentQ);
        if (safePts > 0) addPoints(safePts);
        setLastWrongAnswer(answer);
        setGameResult("lose");
        setGameState("result");
      }
    }, 1800);
  }

  function handleFiftyFifty() {
    const question = questions[currentQ];
    if (!question || lifelines.fiftyFifty) return;
    setLifelines((l) => ({ ...l, fiftyFifty: true }));
    const wrong = question.options.filter((o) => o !== question.correctAnswer).sort(() => Math.random() - 0.5);
    setEliminatedOptions(wrong.slice(0, 2));
    if (selectedAnswer && wrong.slice(0, 2).includes(selectedAnswer)) setSelectedAnswer(null);
  }

  function handleAudience() {
    const question = questions[currentQ];
    if (!question || lifelines.audience) return;
    setLifelines((l) => ({ ...l, audience: true }));
    setAudienceData(generateAudiencePoll(question.options, question.correctAnswer, eliminatedOptions));
    setShowAudience(true);
  }

  function handleHint() {
    if (!questions[currentQ] || lifelines.hint) return;
    setLifelines((l) => ({ ...l, hint: true }));
    setShowHint(true);
  }

  const question = questions[currentQ];

  if ((gameState as string) === "error") {
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😟</div>
        <p style={{ color: "var(--red-400)", marginBottom: "24px" }}>{error}</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={generateQuestions} className="btn-gold">Tekrar Dene</button>
          <button onClick={() => router.push("/games")} className="btn-ghost">← Oyunlara Dön</button>
        </div>
      </div>
    );
  }

  if (gameState === "result" && gameResult) {
    return (
      <div className="bg-game">
        <GameResult
          outcome={gameResult}
          finalQuestionIndex={gameResult === "win" ? 15 : currentQ}
          wrongAnswer={lastWrongAnswer || undefined}
          correctAnswer={question?.correctAnswer}
          explanation={question?.explanation}
          onPlayAgain={generateQuestions}
        />
      </div>
    );
  }

  if (gameState === "analyzing") return <div className="bg-game"><LoadingScreen fileName={pdfName} /></div>;

  if (gameState !== "playing" || !question) return null;

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      {showAudience && <AudienceChart data={audienceData} onClose={() => setShowAudience(false)} />}
      {showHint && <HintModal hint={question.hint} onClose={() => setShowHint(false)} />}

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>💰</span>
          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}><span className="text-gradient-gold">Milyoner</span> Sınavı</span>
        </div>
        <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>✕ Çıkış</button>
      </header>

      <div className="millionaire-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <JokerPanel
            fiftyFiftyUsed={lifelines.fiftyFifty}
            audienceUsed={lifelines.audience}
            hintUsed={lifelines.hint}
            onFiftyFifty={handleFiftyFifty}
            onAudience={handleAudience}
            onHint={handleHint}
            disabled={answerRevealed}
          />
          <QuestionCard
            questionNumber={currentQ + 1}
            questionText={question.question}
            options={question.options}
            eliminatedOptions={eliminatedOptions}
            selectedAnswer={selectedAnswer}
            answerState={
              !selectedAnswer ? "idle"
              : answerRevealed
                ? selectedAnswer === question.correctAnswer ? "correct" : "wrong"
                : "selected"
            }
            correctAnswer={question.correctAnswer}
            onSelectAnswer={handleAnswer}
            disabled={answerRevealed}
          />
          {answerRevealed && (
            <div className="animate-fade-in" style={{ textAlign: "center" }}>
              {selectedAnswer === question.correctAnswer
                ? <p style={{ color: "var(--green-400)", fontWeight: 700, fontSize: "1.1rem" }}>✅ Doğru! Harika!</p>
                : <p style={{ color: "var(--red-400)", fontWeight: 700, fontSize: "1.1rem" }}>❌ Yanlış cevap…</p>}
            </div>
          )}
        </div>
        <aside className="millionaire-sidebar">
          <div className="glass-card" style={{ padding: "16px 12px", position: "sticky", top: "80px" }}>
            <MoneyLadder currentQuestion={currentQ} />
          </div>
        </aside>
      </div>
    </div>
  );
}
