"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/types/question";
import { usePDF } from "@/context/PDFContext";
import { useProfile } from "@/context/ProfileContext";
import LoadingScreen from "@/components/shared/LoadingScreen";

type Phase = "analyzing" | "playing" | "result" | "error";

export default function FlashcardPage() {
  const router = useRouter();
  const { pdfFile, pdfName } = usePDF();
  const { addPoints, updateHighScore, awardBadge, incrementGamesPlayed, markGamePlayed } = useProfile();

  const [phase, setPhase] = useState<Phase>("analyzing");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfFile) { router.replace("/games"); return; }
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    if (!pdfFile) return;
    setPhase("analyzing");
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);
      const res = await fetch("/api/generate-questions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sorular üretilemedi.");
      if (!data.questions || data.questions.length !== 15) throw new Error("Yeterli soru üretemedi.");
      setQuestions(data.questions);
      setCurrent(0); setIsFlipped(false); setKnownSet(new Set());
      setPhase("playing");
      incrementGamesPlayed();
      markGamePlayed("flashcard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu.");
      setPhase("error");
    }
  }

  function handleKnown(known: boolean) {
    const newKnown = new Set(knownSet);
    if (known) { newKnown.add(current); addPoints(50); }
    setKnownSet(newKnown);

    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setIsFlipped(false);
    } else {
      // Game finished
      const score = newKnown.size;
      const pct = Math.round((score / questions.length) * 100);
      updateHighScore("flashcard", pct);
      if (pct === 100) { awardBadge("flashcard_perfect"); awardBadge("perfect_any"); }
      setPhase("result");
    }
  }

  if (phase === "analyzing") return <div className="bg-game"><LoadingScreen fileName={pdfName} /></div>;

  if (phase === "error") {
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😟</div>
        <p style={{ color: "var(--red-400)", marginBottom: "24px" }}>{error}</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={generate} className="btn-gold">Tekrar Dene</button>
          <button onClick={() => router.push("/games")} className="btn-ghost">← Oyunlara Dön</button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const known = knownSet.size;
    const total = questions.length;
    const pct = Math.round((known / total) * 100);
    return (
      <div className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div className="animate-scale-in">
          <div style={{ fontSize: "5rem", marginBottom: "20px" }}>{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, marginBottom: "12px" }}>{pct >= 80 ? "Mükemmel!" : pct >= 50 ? "İyi İş!" : "Daha Çok Çalış!"}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>
            {total} karttan <strong style={{ color: "var(--gold-400)" }}>{known}</strong> tanesini biliyordun.
          </p>
          <div className="glass-card-gold" style={{ padding: "28px 48px", marginBottom: "24px", display: "inline-block" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Başarı Oranı</p>
            <p className="text-gradient-gold" style={{ fontSize: "4rem", fontWeight: 900, lineHeight: 1 }}>%{pct}</p>
          </div>
          <p style={{ color: "var(--gold-400)", fontSize: "0.9rem", marginBottom: "32px" }}>+{known * 50} puan kazandın!</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={generate} className="btn-gold" style={{ padding: "14px 28px" }}>🔄 Tekrar Oyna</button>
            <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "14px 24px" }}>← Oyunlara Dön</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>⚡</span>
          <span style={{ fontWeight: 800 }}><span className="text-gradient-gold">Flashcard</span> Savaşı</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{current + 1} / {questions.length}</span>
          <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>✕ Çıkış</button>
        </div>
      </header>

      <div style={{ height: "4px", background: "var(--border-subtle)" }}>
        <div style={{ width: `${(current / questions.length) * 100}%`, height: "100%", background: "var(--gold-400)", transition: "width 0.3s ease" }} />
      </div>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
        <div style={{ display: "flex", gap: "24px" }}>
          <span style={{ color: "var(--green-400)", fontSize: "0.9rem", fontWeight: 600 }}>✓ {knownSet.size} Biliniyor</span>
          <span style={{ color: "var(--red-400)", fontSize: "0.9rem", fontWeight: 600 }}>✗ {current - knownSet.size} Bilinmiyor</span>
        </div>

        <div className="flashcard-scene" style={{ height: "300px", cursor: isFlipped ? "default" : "pointer" }} onClick={() => !isFlipped && setIsFlipped(true)}>
          <div className={`flashcard-inner${isFlipped ? " flipped" : ""}`} style={{ height: "300px" }}>
            <div className="flashcard-face glass-card-gold" style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", borderRadius: "20px" }}>
              <span className="badge badge-gold" style={{ marginBottom: "20px" }}>Soru {current + 1}</span>
              <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 600, lineHeight: 1.6, textAlign: "center" }}>{q.question}</p>
              {!isFlipped && <p style={{ marginTop: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>👆 Cevabı görmek için tıkla</p>}
            </div>
            <div className="flashcard-face back glass-card" style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", borderRadius: "20px", border: "1px solid var(--green-400)" }}>
              <span className="badge badge-green" style={{ marginBottom: "16px" }}>Doğru Cevap</span>
              <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)", fontWeight: 700, lineHeight: 1.5, textAlign: "center", color: "var(--green-400)" }}>{q.correctAnswer}</p>
              {q.explanation && <p style={{ marginTop: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, textAlign: "center" }}>💡 {q.explanation}</p>}
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="animate-fade-in" style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "400px" }}>
            <button onClick={() => handleKnown(false)} style={{ flex: 1, padding: "16px", borderRadius: "14px", background: "rgba(239,68,68,0.12)", border: "1px solid var(--red-400)", color: "var(--red-400)", fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}>
              ✗ Bilmiyorum
            </button>
            <button onClick={() => handleKnown(true)} style={{ flex: 1, padding: "16px", borderRadius: "14px", background: "rgba(74,222,128,0.12)", border: "1px solid var(--green-400)", color: "var(--green-400)", fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}>
              ✓ Biliyorum
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
