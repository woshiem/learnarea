"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/types/question";
import { usePDF } from "@/context/PDFContext";
import { useProfile } from "@/context/ProfileContext";
import LoadingScreen from "@/components/shared/LoadingScreen";

const TIME_PER_QUESTION = 20;
const LETTERS = ["A", "B", "C", "D"];
type Phase = "analyzing" | "playing" | "result" | "error";
type AnswerState = "idle" | "correct" | "wrong" | "timeout";

export default function TimeQuizPage() {
  const router = useRouter();
  const { pdfFile, pdfName } = usePDF();
  const { addPoints, updateHighScore, awardBadge, incrementGamesPlayed, markGamePlayed } = useProfile();

  const [phase, setPhase] = useState<Phase>("analyzing");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<AnswerState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!pdfFile) { router.replace("/games"); return; }
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const advanceQuestion = useCallback((state: AnswerState, isCorrect: boolean) => {
    stopTimer();
    setAnswerState(state);
    setResults((r) => [...r, state]);
    if (isCorrect) { setScore((s) => s + 1); addPoints(100); }
    setTimeout(() => {
      setCurrent((c) => {
        const next = c + 1;
        if (next >= 15) return c; // will trigger result via useEffect
        setTimeLeft(TIME_PER_QUESTION); setAnswerState("idle"); setSelectedAnswer(null);
        return next;
      });
    }, 1200);
  }, [stopTimer, addPoints]);

  // Detect game end
  useEffect(() => {
    if (phase !== "playing" || results.length < 15) return;
    const finalScore = results.filter((r) => r === "correct").length;
    const pct = Math.round((finalScore / 15) * 100);
    updateHighScore("timeQuiz", finalScore);
    if (pct === 100) { awardBadge("timequiz_perfect"); awardBadge("perfect_any"); if (finalScore === 15) addPoints(500); }
    setPhase("result");
  }, [results, phase, updateHighScore, awardBadge, addPoints]);

  useEffect(() => {
    if (phase !== "playing" || answerState !== "idle") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { advanceQuestion("timeout", false); return 0; } return t - 1; });
    }, 1000);
    return stopTimer;
  }, [phase, current, answerState, advanceQuestion, stopTimer]);

  async function generate() {
    if (!pdfFile) return;
    setPhase("analyzing");
    try {
      const fd = new FormData(); fd.append("pdf", pdfFile);
      const res = await fetch("/api/generate-questions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sorular üretilemedi.");
      if (!data.questions || data.questions.length !== 15) throw new Error("Yeterli soru üretemedi.");
      setQuestions(data.questions); setCurrent(0); setTimeLeft(TIME_PER_QUESTION);
      setAnswerState("idle"); setSelectedAnswer(null); setScore(0); setResults([]);
      setPhase("playing"); incrementGamesPlayed(); markGamePlayed("timeQuiz");
    } catch (err) { setError(err instanceof Error ? err.message : "Hata oluştu."); setPhase("error"); }
  }

  function handleAnswer(option: string) {
    if (answerState !== "idle") return;
    setSelectedAnswer(option);
    advanceQuestion(option === questions[current].correctAnswer ? "correct" : "wrong", option === questions[current].correctAnswer);
  }

  if (phase === "analyzing") return <div className="bg-game"><LoadingScreen fileName={pdfName} /></div>;
  if (phase === "error") return (
    <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
      <p style={{ color: "var(--red-400)", marginBottom: "24px" }}>😟 {error}</p>
      <div style={{ display: "flex", gap: "12px" }}><button onClick={generate} className="btn-gold">Tekrar Dene</button><button onClick={() => router.push("/games")} className="btn-ghost">← Geri</button></div>
    </div>
  );

  if (phase === "result") {
    const pct = Math.round((score / 15) * 100);
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div className="animate-scale-in">
          <div style={{ fontSize: "5rem", marginBottom: "20px" }}>{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900, marginBottom: "12px" }}>{pct >= 80 ? "Mükemmel!" : pct >= 50 ? "İyi İş!" : "Daha Çok Çalış!"}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "8px" }}>15 sorudan <strong style={{ color: "var(--gold-400)" }}>{score}</strong> tanesini doğru yanıtladın.</p>
          <p style={{ color: "var(--gold-400)", fontSize: "0.9rem", marginBottom: "32px" }}>+{score * 100} puan kazandın!</p>
          <div className="glass-card-gold" style={{ padding: "28px 48px", marginBottom: "24px", display: "inline-block" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Başarı Oranı</p>
            <p className="text-gradient-gold" style={{ fontSize: "4rem", fontWeight: 900, lineHeight: 1 }}>%{pct}</p>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", maxWidth: "400px", marginBottom: "32px" }}>
            {results.map((r, i) => (
              <div key={i} style={{ width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, background: r === "correct" ? "rgba(74,222,128,0.2)" : r === "timeout" ? "rgba(100,116,139,0.2)" : "rgba(239,68,68,0.2)", border: `1px solid ${r === "correct" ? "var(--green-400)" : r === "timeout" ? "var(--text-muted)" : "var(--red-400)"}`, color: r === "correct" ? "var(--green-400)" : r === "timeout" ? "var(--text-muted)" : "var(--red-400)" }}>
                {r === "correct" ? "✓" : r === "timeout" ? "⌛" : "✗"}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={generate} className="btn-gold" style={{ padding: "14px 28px" }}>🔄 Tekrar Oyna</button>
            <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "14px 24px" }}>← Oyunlara Dön</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const timePct = (timeLeft / TIME_PER_QUESTION) * 100;
  const isDanger = timeLeft <= 5;

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span>⏱️</span><span style={{ fontWeight: 800 }}><span className="text-gradient-gold">Zaman</span> Yarışı</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--gold-400)", fontWeight: 700 }}>{score}/{questions.length}</span>
          <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>✕</button>
        </div>
      </header>
      <div style={{ height: "6px", background: "var(--border-subtle)" }}>
        <div style={{ width: `${timePct}%`, height: "100%", background: isDanger ? "var(--red-400)" : timeLeft <= 10 ? "var(--gold-400)" : "var(--green-400)", transition: "width 1s linear, background 0.3s ease" }} />
      </div>
      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1, color: isDanger ? "var(--red-400)" : timeLeft <= 10 ? "var(--gold-400)" : "var(--text-primary)", transition: "color 0.3s ease" }}>{timeLeft}</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginLeft: "4px" }}>sn</span>
        </div>
        <div className="glass-card-gold" style={{ padding: "28px 32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ background: "linear-gradient(135deg, var(--gold-600), var(--gold-400))", color: "var(--navy-900)", fontWeight: 800, fontSize: "0.8rem", padding: "4px 12px", borderRadius: "999px" }}>SORU {current + 1} / {questions.length}</span>
          </div>
          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)", fontWeight: 600, lineHeight: 1.6 }}>{q.question}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {q.options.map((option, i) => {
            let bg = "linear-gradient(135deg, rgba(13,31,60,0.9), rgba(18,40,80,0.9))";
            let border = "var(--border-gold)";
            let color = "var(--text-primary)";
            if (answerState !== "idle") {
              if (option === q.correctAnswer) { bg = "rgba(34,197,94,0.2)"; border = "var(--green-400)"; color = "var(--green-400)"; }
              else if (option === selectedAnswer) { bg = "rgba(239,68,68,0.2)"; border = "var(--red-400)"; color = "var(--red-400)"; }
            }
            return (
              <button key={option} className="answer-btn" style={{ background: bg, borderColor: border, color, cursor: answerState !== "idle" ? "default" : "pointer" }} onClick={() => handleAnswer(option)} disabled={answerState !== "idle"}>
                <span className="answer-letter">{LETTERS[i]}</span>
                <span style={{ flex: 1 }}>{option}</span>
              </button>
            );
          })}
        </div>
        {answerState !== "idle" && (
          <div className="animate-fade-in" style={{ textAlign: "center", marginTop: "20px" }}>
            {answerState === "correct" && <p style={{ color: "var(--green-400)", fontWeight: 700 }}>✅ Doğru! +100 puan</p>}
            {answerState === "wrong" && <p style={{ color: "var(--red-400)", fontWeight: 700 }}>❌ Yanlış!</p>}
            {answerState === "timeout" && <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>⌛ Süre Doldu!</p>}
          </div>
        )}
      </main>
    </div>
  );
}
