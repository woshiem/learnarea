"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/types/question";
import { usePDF } from "@/context/PDFContext";
import { useProfile } from "@/context/ProfileContext";
import LoadingScreen from "@/components/shared/LoadingScreen";

const TIME_PER_QUESTION = 7;
const LETTERS = ["A", "B", "C", "D"];

type Phase = "analyzing" | "countdown" | "playing" | "dead" | "win" | "error";

export default function DeathMatchPage() {
  const router = useRouter();
  const { pdfFile, pdfName } = usePDF();
  const { addPoints, updateHighScore, awardBadge, incrementGamesPlayed, markGamePlayed } = useProfile();

  const [phase, setPhase] = useState<Phase>("analyzing");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [streak, setStreak] = useState(0); // correct answers so far
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!pdfFile) { router.replace("/games"); return; }
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown before game
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("playing"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 900);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  // Timer tick
  useEffect(() => {
    if (phase !== "playing" || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Timeout = death
          stopTimer();
          setAnswered(true);
          setIsCorrect(false);
          updateHighScore("deathMatch", streak);
          setTimeout(() => setPhase("dead"), 800);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase, current, answered, stopTimer, streak, updateHighScore]);

  function handleAnswer(option: string) {
    if (answered || phase !== "playing") return;
    stopTimer();
    setSelectedAnswer(option);
    setAnswered(true);
    const correct = option === questions[current].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      addPoints(200);
      updateHighScore("deathMatch", newStreak);

      if (newStreak === questions.length) {
        // Won!
        addPoints(2000);
        awardBadge("deathmatch_win");
        awardBadge("perfect_any");
        setTimeout(() => setPhase("win"), 900);
      } else {
        setTimeout(() => {
          setCurrent((c) => c + 1);
          setTimeLeft(TIME_PER_QUESTION);
          setAnswered(false);
          setSelectedAnswer(null);
          setIsCorrect(null);
        }, 700);
      }
    } else {
      setTimeout(() => setPhase("dead"), 900);
    }
  }

  async function generate() {
    if (!pdfFile) return;
    setPhase("analyzing");
    try {
      const fd = new FormData(); fd.append("pdf", pdfFile);
      const res = await fetch("/api/generate-questions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sorular üretilemedi.");
      if (!data.questions || data.questions.length !== 15) throw new Error("Yeterli soru üretemedi.");
      setQuestions(data.questions);
      setCurrent(0); setStreak(0); setTimeLeft(TIME_PER_QUESTION);
      setAnswered(false); setSelectedAnswer(null); setIsCorrect(null);
      setCountdown(3); setPhase("countdown");
      incrementGamesPlayed();
      markGamePlayed("deathMatch");
    } catch (err) { setError(err instanceof Error ? err.message : "Hata oluştu."); setPhase("error"); }
  }

  if (phase === "analyzing") return <div className="bg-game"><LoadingScreen fileName={pdfName} /></div>;
  if (phase === "error") return (
    <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
      <p style={{ color: "var(--red-400)", marginBottom: "24px" }}>😟 {error}</p>
      <div style={{ display: "flex", gap: "12px" }}><button onClick={generate} className="btn-gold">Tekrar Dene</button><button onClick={() => router.push("/games")} className="btn-ghost">← Geri</button></div>
    </div>
  );

  if (phase === "countdown") {
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.2) 0%, var(--navy-950) 70%)" }}>
        <p style={{ color: "var(--red-400)", fontSize: "0.9rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>ÖLÜM KALIM</p>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Bir hata = Elenme • 7 saniye</p>
        <div className="animate-scale-in" style={{ fontSize: "10rem", fontWeight: 900, lineHeight: 1, color: countdown > 0 ? "var(--red-400)" : "var(--gold-400)" }}>
          {countdown > 0 ? countdown : "💀"}
        </div>
      </div>
    );
  }

  if (phase === "dead") {
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", background: "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.25) 0%, var(--navy-950) 70%)" }}>
        <div className="animate-scale-in">
          <div style={{ fontSize: "6rem", marginBottom: "20px" }}>💀</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "var(--red-400)", marginBottom: "12px" }}>Elendin!</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>
            {streak} soruyu doğru yanıtladın — {streak === 0 ? "ilk soruda elendin!" : `${current + 1}. soruda tökezledin.`}
          </p>
          <div className="glass-card" style={{ padding: "24px 40px", marginBottom: "24px", border: "1px solid rgba(239,68,68,0.3)", display: "inline-block" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Seri</p>
            <p style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--red-400)", lineHeight: 1 }}>{streak} / {questions.length}</p>
          </div>
          {selectedAnswer && questions[current] && (
            <div className="glass-card" style={{ padding: "16px 24px", maxWidth: "480px", marginBottom: "24px", border: "1px solid rgba(239,68,68,0.3)", textAlign: "left" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--red-400)", marginBottom: "8px" }}>✗ Senin cevabın</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "12px", fontSize: "0.9rem" }}>{selectedAnswer !== null ? selectedAnswer : "Süre doldu"}</p>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--green-400)", marginBottom: "8px" }}>✓ Doğru cevap</p>
              <p style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{questions[current].correctAnswer}</p>
            </div>
          )}
          <p style={{ color: "var(--gold-400)", fontSize: "0.9rem", marginBottom: "24px" }}>+{streak * 200} puan kazandın</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={generate} className="btn-gold" style={{ padding: "14px 28px" }}>🔄 Tekrar Dene</button>
            <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "14px 24px" }}>← Oyunlara Dön</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "win") {
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", background: "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.25) 0%, var(--navy-950) 70%)" }}>
        <div className="animate-float">
          <div style={{ fontSize: "6rem", marginBottom: "20px" }}>🏆</div>
          <h1 className="text-gradient-gold" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, marginBottom: "12px" }}>Ölümsüzsün!</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>Tüm {questions.length} soruyu tek hata yapmadan geçtin!</p>
          <div className="glass-card-gold" style={{ padding: "28px 48px", marginBottom: "24px", display: "inline-block" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Puan</p>
            <p className="text-gradient-gold" style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1 }}>+{questions.length * 200 + 2000}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>{questions.length * 200} + 2000 bonus</p>
          </div>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={generate} className="btn-gold" style={{ padding: "14px 28px" }}>🔄 Tekrar Oyna</button>
            <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "14px 24px" }}>← Oyunlara Dön</button>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  const q = questions[current];
  const timePct = (timeLeft / TIME_PER_QUESTION) * 100;
  const isDanger = timeLeft <= 3;

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: "1px solid rgba(239,68,68,0.3)",
        backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50,
        background: "rgba(20,5,5,0.9)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>💀</span>
          <span style={{ fontWeight: 900, color: "var(--red-400)" }}>ÖLÜM KALIM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--green-400)", fontWeight: 700 }}>{streak} ✓ seri</span>
          <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>✕</button>
        </div>
      </header>

      {/* Timer bar */}
      <div style={{ height: "5px", background: "rgba(239,68,68,0.1)" }}>
        <div style={{
          width: `${timePct}%`, height: "100%",
          background: isDanger ? "var(--red-400)" : timeLeft <= 4 ? "#f97316" : "var(--gold-400)",
          transition: "width 1s linear, background 0.3s ease",
          boxShadow: isDanger ? "0 0 12px var(--red-400)" : "none",
        }} />
      </div>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "28px 24px" }}>
        {/* Timer + question number */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Soru {current + 1} / {questions.length}</span>
          <span style={{ fontSize: "clamp(1.8rem, 6vw, 2.8rem)", fontWeight: 900, lineHeight: 1, color: isDanger ? "var(--red-400)" : timeLeft <= 4 ? "#f97316" : "var(--text-primary)", transition: "color 0.3s ease", textShadow: isDanger ? "0 0 20px var(--red-400)" : "none" }}>
            {timeLeft}
          </span>
        </div>

        {/* Question */}
        <div className={`glass-card${isDanger ? " danger-pulse" : ""}`} style={{ padding: "24px 28px", marginBottom: "20px", border: isDanger ? "1px solid rgba(239,68,68,0.5)" : "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)", fontWeight: 600, lineHeight: 1.6 }}>{q.question}</p>
        </div>

        {/* Options */}
        <div className="answers-grid" style={{ gap: "10px" }}>
          {q.options.map((option, i) => {
            let bg = "linear-gradient(135deg, rgba(20,5,5,0.9), rgba(40,10,10,0.9))";
            let borderColor = "rgba(239,68,68,0.3)";
            let color = "var(--text-primary)";
            if (answered) {
              if (option === q.correctAnswer) { bg = "rgba(34,197,94,0.2)"; borderColor = "var(--green-400)"; color = "var(--green-400)"; }
              else if (option === selectedAnswer && !isCorrect) { bg = "rgba(239,68,68,0.25)"; borderColor = "var(--red-400)"; color = "var(--red-400)"; }
            }
            return (
              <button key={option} className="answer-btn"
                style={{ background: bg, borderColor, color, cursor: answered ? "default" : "pointer", padding: "14px 16px" }}
                onClick={() => handleAnswer(option)} disabled={answered}
              >
                <span className="answer-letter" style={{ width: "28px", height: "28px", minWidth: "28px", background: "linear-gradient(135deg, var(--red-600,#991b1b), var(--red-400))" }}>{LETTERS[i]}</span>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{option}</span>
              </button>
            );
          })}
        </div>

        {answered && isCorrect && (
          <div className="animate-fade-in" style={{ textAlign: "center", marginTop: "16px" }}>
            <p style={{ color: "var(--green-400)", fontWeight: 700 }}>✅ Doğru! +200 puan — Devam et!</p>
          </div>
        )}
      </main>
    </div>
  );
}
