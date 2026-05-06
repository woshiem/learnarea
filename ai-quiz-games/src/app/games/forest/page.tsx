"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProfile, getTreeStage } from "@/context/ProfileContext";

const DURATION_OPTIONS = [
  { label: "5 saniye", sublabel: "Demo", seconds: 5 },
  { label: "25 dakika", sublabel: "Klasik Pomodoro", seconds: 25 * 60 },
  { label: "30 dakika", sublabel: "Standart", seconds: 30 * 60 },
  { label: "45 dakika", sublabel: "Uzun Seans", seconds: 45 * 60 },
  { label: "1 saat", sublabel: "Derin Odak", seconds: 60 * 60 },
];

const MOTIVATIONAL = [
  "Odaklan, ağacın büyüyor 🌱",
  "Harika gidiyorsun! Devam et.",
  "Her dakika ağacına hayat katıyor.",
  "Konsantrasyonun güçlü, devam et.",
  "Bitiş çizgisine yaklaşıyorsun!",
  "Zihnin net, seans mükemmel.",
  "Telefonunu bıraktın, doğru seçim!",
];

type Phase = "idle" | "running" | "completed";

export default function ForestPage() {
  const router = useRouter();
  const { profile, addForestSession } = useProfile();

  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]); // default 5s demo
  const [sessionSeconds, setSessionSeconds] = useState(DURATION_OPTIONS[0].seconds);
  const [timeLeft, setTimeLeft] = useState(DURATION_OPTIONS[0].seconds);
  const [motivIdx, setMotivIdx] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const motivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tree = getTreeStage(profile.forestSessions);
  const completedTree = getTreeStage(profile.forestSessions + 1);

  const stopTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (motivRef.current) { clearInterval(motivRef.current); motivRef.current = null; }
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimers();
          addForestSession();
          setJustCompleted(true);
          setPhase("completed");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    motivRef.current = setInterval(() => {
      setMotivIdx((i) => (i + 1) % MOTIVATIONAL.length);
    }, 20_000);
    return stopTimers;
  }, [phase, stopTimers, addForestSession]);

  function startSession() {
    setTimeLeft(sessionSeconds);
    setJustCompleted(false);
    setPhase("running");
  }

  function cancelSession() {
    stopTimers();
    setTimeLeft(sessionSeconds);
    setPhase("idle");
  }

  function selectDuration(opt: typeof DURATION_OPTIONS[0]) {
    setSelectedDuration(opt);
    setSessionSeconds(opt.seconds);
    setTimeLeft(opt.seconds);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((sessionSeconds - timeLeft) / sessionSeconds) * 100;

  const R = 90;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - progress / 100);

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "1px solid rgba(74,222,128,0.2)",
        backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,30,15,0.9)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.3rem" }}>🌱</span>
          <span style={{ fontWeight: 800 }}><span style={{ color: "var(--green-400)" }}>Odak</span> Ormanı</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--green-400)", fontSize: "0.85rem", fontWeight: 600 }}>
            {profile.forestSessions} seans · {tree.emoji} {tree.label}
          </span>
          <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>✕</button>
        </div>
      </header>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px", textAlign: "center" }}>

        {/* IDLE */}
        {phase === "idle" && (
          <div className="animate-fade-in">
            {/* Tree display */}
            <div className="glass-card" style={{
              padding: "36px 24px", marginBottom: "28px",
              border: "1px solid rgba(74,222,128,0.2)",
              background: "linear-gradient(135deg, rgba(10,30,15,0.9), rgba(13,40,20,0.9))",
            }}>
              <div style={{ fontSize: "7rem", lineHeight: 1, marginBottom: "10px", filter: profile.forestSessions === 0 ? "grayscale(0.4)" : "none" }}>
                {tree.emoji}
              </div>
              <p style={{ color: "var(--green-400)", fontWeight: 700, fontSize: "1.05rem" }}>{tree.label}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>
                {profile.forestSessions === 0 ? "Henüz hiç seans tamamlamadın" : `${profile.forestSessions} seans tamamlandı`}
              </p>

              {/* Tree milestones */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
                {[
                  { sessions: 1, emoji: "🌱", label: "Tohum" },
                  { sessions: 3, emoji: "🌿", label: "Fide" },
                  { sessions: 6, emoji: "🌳", label: "Ağaç" },
                  { sessions: 10, emoji: "🌲", label: "Orman" },
                ].map((m) => (
                  <div key={m.sessions} style={{ textAlign: "center", opacity: profile.forestSessions >= m.sessions ? 1 : 0.3 }}>
                    <div style={{ fontSize: "1.6rem" }}>{m.emoji}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration picker */}
            <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "20px", border: "1px solid rgba(74,222,128,0.15)", textAlign: "left" }}>
              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--green-400)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ⏱️ Seans Süresi
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {DURATION_OPTIONS.map((opt) => {
                  const active = selectedDuration.seconds === opt.seconds;
                  return (
                    <button key={opt.seconds} onClick={() => selectDuration(opt)} style={{
                      padding: "9px 16px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit",
                      background: active ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? "var(--green-400)" : "rgba(255,255,255,0.1)"}`,
                      color: active ? "var(--green-400)" : "var(--text-secondary)",
                      fontWeight: active ? 700 : 500, fontSize: "0.85rem",
                      transition: "all 0.18s",
                    }}>
                      <span>{opt.label}</span>
                      <span style={{ display: "block", fontSize: "0.65rem", opacity: 0.7, marginTop: "1px" }}>{opt.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* How it works */}
            <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "24px", border: "1px solid rgba(74,222,128,0.1)", textAlign: "left" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {["📴 Telefonu bırak, dikkatin dağılmasın", "🌱 Her seans ağacını büyütür", "💰 Her tamamlanan seans = 300 puan", "🏅 Özel rozetler kazanabilirsin"].map((s, i) => (
                  <p key={i} style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{s}</p>
                ))}
              </div>
            </div>

            <button onClick={startSession} style={{
              width: "100%", padding: "16px", borderRadius: "14px",
              background: "linear-gradient(135deg,#166534,#15803d)",
              border: "1px solid rgba(74,222,128,0.35)", color: "#dcfce7",
              fontWeight: 800, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 6px 24px rgba(74,222,128,0.18)", transition: "all 0.2s",
            }}>
              🌱 Seansı Başlat — {selectedDuration.label}
            </button>
          </div>
        )}

        {/* RUNNING */}
        {phase === "running" && (
          <div className="animate-fade-in">
            <p style={{ color: "var(--green-400)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "28px" }}>
              ODAK ZAMANI · {selectedDuration.label}
            </p>

            <div style={{ position: "relative", width: "220px", height: "220px", margin: "0 auto 28px" }}>
              <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="8" />
                <circle cx="110" cy="110" r={R} fill="none" stroke="var(--green-400)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "2.8rem", fontWeight: 900, lineHeight: 1, color: "var(--green-400)" }}>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "4px" }}>kaldı</span>
              </div>
            </div>

            <div style={{ fontSize: "4.5rem", marginBottom: "8px" }}>{tree.emoji}</div>
            <p style={{ color: "var(--green-400)", fontWeight: 700, marginBottom: "6px" }}>{tree.label}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "28px", minHeight: "22px" }}>
              {MOTIVATIONAL[motivIdx]}
            </p>

            <div style={{ height: "5px", background: "rgba(74,222,128,0.1)", borderRadius: "999px", marginBottom: "28px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "var(--green-400)", borderRadius: "999px", transition: "width 1s linear" }} />
            </div>

            <button onClick={cancelSession} className="btn-ghost" style={{ color: "var(--red-400)", borderColor: "rgba(239,68,68,0.3)", padding: "10px 24px" }}>
              ✕ Seansı İptal Et
            </button>
            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "10px" }}>İptal edersen puan & büyüme kaydedilmez.</p>
          </div>
        )}

        {/* COMPLETED */}
        {phase === "completed" && (
          <div className="animate-scale-in">
            <div style={{ fontSize: "5.5rem", marginBottom: "16px" }}>🎉</div>
            <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)", fontWeight: 900, color: "var(--green-400)", marginBottom: "10px" }}>Seans Tamamlandı!</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "28px" }}>
              {selectedDuration.label} odaklandın. Harika iş!
            </p>

            <div className="glass-card" style={{ padding: "22px", border: "1px solid rgba(74,222,128,0.25)", marginBottom: "24px", display: "inline-block", minWidth: "260px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Puan kazandın</span>
                  <span style={{ color: "var(--gold-400)", fontWeight: 800 }}>+300 🏆</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Toplam seans</span>
                  <span style={{ fontWeight: 700 }}>{profile.forestSessions}</span>
                </div>
                {profile.forestStreak > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Gün serisi</span>
                    <span style={{ color: "var(--green-400)", fontWeight: 700 }}>{profile.forestStreak} gün 🔥</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid rgba(74,222,128,0.15)", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Ağacın</span>
                  <span style={{ fontWeight: 700 }}>{completedTree.emoji} {completedTree.label}</span>
                </div>
              </div>
            </div>

            {justCompleted && profile.forestSessions === 1 && (
              <div className="animate-fade-in" style={{ padding: "10px 18px", borderRadius: "10px", background: "rgba(74,222,128,0.1)", border: "1px solid var(--green-400)", marginBottom: "14px", color: "var(--green-400)", fontWeight: 700, fontSize: "0.9rem" }}>
                🌱 Rozet kazandın: Bahçıvan!
              </div>
            )}
            {justCompleted && profile.forestSessions === 5 && (
              <div className="animate-fade-in" style={{ padding: "10px 18px", borderRadius: "10px", background: "rgba(74,222,128,0.1)", border: "1px solid var(--green-400)", marginBottom: "14px", color: "var(--green-400)", fontWeight: 700, fontSize: "0.9rem" }}>
                🌳 Rozet kazandın: Kararlı!
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={startSession} style={{ padding: "13px 26px", borderRadius: "13px", background: "linear-gradient(135deg,#166534,#15803d)", border: "1px solid rgba(74,222,128,0.35)", color: "#dcfce7", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                🌱 Yeni Seans
              </button>
              <button onClick={() => router.push("/games")} className="btn-ghost" style={{ padding: "13px 22px" }}>
                ← Oyunlara Dön
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
