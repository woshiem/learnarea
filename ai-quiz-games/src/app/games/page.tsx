"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";
import { usePDF } from "@/context/PDFContext";
import { useProfile } from "@/context/ProfileContext";

type GameCard = {
  id: string;
  titleTR: string; titleEN: string;
  subtitleTR: string; subtitleEN: string;
  icon: string;
  descTR: string; descEN: string;
  href: string;
  gradient: string;
  needsPdf: boolean;
};

const GAME_MODES: GameCard[] = [
  {
    id: "millionaire",
    titleTR: "Kim Milyoner Olmak İster?", titleEN: "Who Wants to Be a Millionaire?",
    subtitleTR: "15 Soru · Jokerler · Puan Basamağı", subtitleEN: "15 Questions · Lifelines · Points Ladder",
    icon: "💰",
    descTR: "AI'nın ürettiği 15 soruyu cevapla. Jokerleri akıllıca kullan ve puan basamağını tırman!",
    descEN: "Answer 15 AI-generated questions. Use lifelines wisely and climb the points ladder!",
    href: "/games/millionaire",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.95), rgba(26,58,107,0.9))",
    needsPdf: true,
  },
  {
    id: "flashcard",
    titleTR: "Flashcard Savaşı", titleEN: "Flashcard Battle",
    subtitleTR: "Çevir · Gör · Öğren", subtitleEN: "Flip · See · Learn",
    icon: "⚡",
    descTR: "Kartı çevir, cevabı gör. Kaç soruyu biliyorsun? Ezber yerine aktif hatırlama ile öğren!",
    descEN: "Flip the card, see the answer. Active recall instead of passive memorization!",
    href: "/games/flashcard",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.95), rgba(30,20,60,0.9))",
    needsPdf: true,
  },
  {
    id: "time-quiz",
    titleTR: "Zaman Yarışı", titleEN: "Time Quiz",
    subtitleTR: "Sayaçla Yarış · 20 Saniye", subtitleEN: "Race the Clock · 20 Seconds",
    icon: "⏱️",
    descTR: "Baskı altında öğren! Süre dolmadan soruları yanıtla — hız ve doğruluğu dengele.",
    descEN: "Learn under pressure! Balance speed and accuracy before time runs out.",
    href: "/games/time-quiz",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.95), rgba(10,30,20,0.9))",
    needsPdf: true,
  },
  {
    id: "speed-round",
    titleTR: "Ölüm Kalım", titleEN: "Death Match",
    subtitleTR: "7 Saniye · Bir Hata = Elenme", subtitleEN: "7 Seconds · One Wrong = Out",
    icon: "💀",
    descTR: "Soru başına 7 saniye. Tek bir yanlış cevap seni eler. Tüm soruları geçebilir misin?",
    descEN: "7 seconds per question. One wrong answer and you're eliminated. Can you survive?",
    href: "/games/speed-round",
    gradient: "linear-gradient(135deg, rgba(40,10,10,0.95), rgba(60,13,13,0.9))",
    needsPdf: true,
  },
  {
    id: "forest",
    titleTR: "Odak Ormanı", titleEN: "Focus Forest",
    subtitleTR: "Pomodoro · 30 Dakika · Ağacın Büyür", subtitleEN: "Pomodoro · 30 Minutes · Grow Your Tree",
    icon: "🌱",
    descTR: "30 dakika odaklan, ağacın büyüsün. Her seans 300 puan. Telefonunu bırak, ormanı inşa et.",
    descEN: "Focus for 30 minutes, grow your tree. 300 points per session. Put the phone down, build the forest.",
    href: "/games/forest",
    gradient: "linear-gradient(135deg, rgba(10,30,15,0.95), rgba(13,40,20,0.9))",
    needsPdf: false,
  },
  {
    id: "coming-soon",
    titleTR: "Yakında Geliyor", titleEN: "Coming Soon",
    subtitleTR: "Yeni Mod · Sürpriz", subtitleEN: "New Mode · Surprise",
    icon: "🔮",
    descTR: "Yeni bir oyun modu geliyor. Takipte kalın!",
    descEN: "A new game mode is on the way. Stay tuned!",
    href: "#",
    gradient: "linear-gradient(135deg, rgba(13,31,60,0.7), rgba(30,15,50,0.7))",
    needsPdf: false,
  },
];

export default function GamesPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, t, toggle: toggleLang } = useLang();
  const { pdfFile, pdfName, setPdf, clearPdf } = usePDF();
  const { profile } = useProfile();
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (file.type !== "application/pdf") { alert(t.alertPdfOnly); return; }
    if (file.size > 20 * 1024 * 1024) { alert(t.alertMaxSize); return; }
    setPdf(file);
  }

  function handleGameClick(game: GameCard) {
    if (game.href === "#") return;
    if (game.needsPdf && !pdfFile) return;
    router.push(game.href);
  }

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border-subtle)", padding: "14px clamp(14px, 4vw, 32px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span style={{ fontSize: "1.4rem" }}>🎯</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              <span className="text-gradient-gold">{t.appName}</span>
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginLeft: "8px" }}>{t.appTagline}</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/profile" style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: "10px",
            border: "1px solid var(--border-mid)", color: "var(--text-secondary)",
            textDecoration: "none", fontSize: "0.85rem", transition: "all 0.2s",
          }}>
            👤 <span style={{ color: "var(--gold-400)", fontWeight: 700 }}>{profile.points.toLocaleString("tr-TR")} {t.pointsUnit}</span>
          </Link>
          <button onClick={toggleTheme} className="btn-ghost" style={{ padding: "7px 12px", fontSize: "0.85rem" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={toggleLang} className="btn-ghost" style={{ padding: "7px 12px", fontSize: "0.85rem", fontWeight: 700 }}>
            {t.langSwitch}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>

        {/* PDF Section */}
        {!pdfFile ? (
          <div className="animate-fade-in" style={{ marginBottom: "48px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                {t.step1Label}
              </p>
              <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "8px" }}>
                {t.uploadTitle} <span className="text-gradient-gold">{t.uploadTitleHighlight}</span>
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                {t.uploadSubtitle}
              </p>
            </div>
            <div
              className={`upload-zone${dragOver ? " drag-over" : ""}`}
              style={{ maxWidth: "600px", margin: "0 auto" }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              role="button" tabIndex={0}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>{dragOver ? "📂" : "📄"}</div>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>
                {dragOver ? t.dropHere : t.dragDrop}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "20px" }}>{t.orClick}</p>
              <span className="badge badge-blue">{t.pdfOnly}</span>
              <input ref={fileInputRef} type="file" accept="application/pdf"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                style={{ display: "none" }} />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in glass-card" style={{
            marginBottom: "40px", padding: "16px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid var(--border-gold)", flexWrap: "wrap", gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.8rem" }}>📄</span>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>{t.loadedPdf}</p>
                <p style={{ fontWeight: 700, color: "var(--gold-400)", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdfName}</p>
              </div>
              <span className="badge badge-green">{t.ready}</span>
            </div>
            <button onClick={() => clearPdf()} className="btn-ghost" style={{ padding: "8px 16px", fontSize: "0.85rem", color: "var(--red-400)", borderColor: "rgba(239,68,68,0.3)" }}>
              {t.resetPdf}
            </button>
          </div>
        )}

        {/* Game heading */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            {pdfFile ? `${t.step2Label} ` : ""}{t.chooseGame}
          </p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            {t.gameTitlePart1}{" "}
            <span className="text-gradient-gold">{t.gameTitlePart2}</span>
          </h2>
        </div>

        {/* Game Grid */}
        <div className="game-cards-grid">
          {GAME_MODES.map((game, index) => {
            const isAvailable = game.href !== "#";
            const isReady = isAvailable && (!game.needsPdf || !!pdfFile);
            const title = lang === "tr" ? game.titleTR : game.titleEN;
            const subtitle = lang === "tr" ? game.subtitleTR : game.subtitleEN;
            const desc = lang === "tr" ? game.descTR : game.descEN;

            return (
              <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
                <div
                  style={{
                    background: game.gradient,
                    border: isReady ? "1px solid var(--border-gold)" : "1px solid var(--border-subtle)",
                    borderRadius: "20px", padding: "24px", height: "100%",
                    display: "flex", flexDirection: "column", gap: "14px",
                    transition: "all 0.3s ease",
                    opacity: isAvailable ? (isReady ? 1 : 0.7) : 0.5,
                    cursor: isReady ? "pointer" : "default",
                    boxShadow: isReady ? "0 0 30px rgba(251, 191, 36, 0.06)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (isReady) {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(251, 191, 36, 0.16)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = isReady ? "0 0 30px rgba(251, 191, 36, 0.06)" : "none";
                  }}
                  onClick={() => handleGameClick(game)}
                >
                  <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>{game.icon}</div>
                  <span className={`badge ${isAvailable ? "badge-gold" : "badge-coming-soon"}`} style={{ alignSelf: "flex-start" }}>
                    {!isAvailable ? t.comingSoon : `${game.icon} ${game.id === "forest" ? t.startBadge : t.playBadge}`}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "4px", lineHeight: 1.3 }}>{title}</h3>
                    <p style={{ color: "var(--gold-500)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>{subtitle}</p>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, flex: 1 }}>{desc}</p>

                  {isAvailable ? (
                    <div
                      className={isReady ? "btn-gold" : "btn-ghost"}
                      style={{
                        textAlign: "center", padding: "10px", borderRadius: "10px",
                        fontSize: "0.9rem", fontWeight: 700,
                        cursor: isReady ? "pointer" : "not-allowed",
                        opacity: isReady ? 1 : 0.5,
                      }}
                    >
                      {isReady
                        ? t.startGame
                        : (game.needsPdf ? t.uploadFirst : t.startGame)}
                    </div>
                  ) : (
                    <div className="btn-ghost" style={{ textAlign: "center", padding: "10px", opacity: 0.5, cursor: "not-allowed" }}>
                      {t.comingSoon}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
