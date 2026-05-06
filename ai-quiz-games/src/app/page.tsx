"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";

export default function HomePage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { t, toggle: toggleLang } = useLang();

  return (
    <main className="bg-game" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "1px solid var(--border-subtle)",
        maxWidth: "1200px", margin: "0 auto", width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🎯</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
              <span className="text-gradient-gold">{t.appName}</span>
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "8px" }}>{t.appTagline}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={toggleTheme} className="btn-ghost" style={{ padding: "7px 14px", fontSize: "0.85rem" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={toggleLang} className="btn-ghost" style={{ padding: "7px 14px", fontSize: "0.85rem", fontWeight: 700 }}>
            {t.langSwitch}
          </button>
          <Link href="/games" className="btn-gold" style={{ padding: "8px 20px" }}>
            {t.startPlaying}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "80px 24px",
        maxWidth: "900px", margin: "0 auto",
      }}>
        <div className="animate-fade-in-up">
          <span className="badge badge-gold" style={{ marginBottom: "24px" }}>
            {t.aiPowered}
          </span>

          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            fontWeight: 900, lineHeight: 1.1,
            letterSpacing: "-0.03em", marginBottom: "24px",
          }}>
            {t.heroTitle1}{" "}
            <span className="text-gradient-gold">{t.heroTitle2}</span>
          </h1>

          <p style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            maxWidth: "600px", margin: "0 auto 16px", lineHeight: 1.7,
          }}>
            {t.heroDesc}
          </p>

          <Link href="/games" className="btn-gold" style={{ padding: "14px 36px", fontSize: "1.05rem" }}>
            {t.startPlaying}
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px", marginTop: "80px", width: "100%", maxWidth: "860px",
        }}>
          {[
            { icon: "📄", title: t.feature1Title, desc: t.feature1Desc },
            { icon: "🎮", title: t.feature2Title, desc: t.feature2Desc },
            { icon: "🌱", title: t.feature3Title, desc: t.feature3Desc },
          ].map((f, i) => (
            <div key={i} className="glass-card animate-fade-in" style={{ padding: "24px", textAlign: "left", animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
