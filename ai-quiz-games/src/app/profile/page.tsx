"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useProfile, COLOR_THEMES, BACKGROUNDS, FONTS, TITLE_BADGES, ALL_BADGES,
  getLevelInfo, getTreeStage,
} from "@/context/ProfileContext";
import { useLang } from "@/context/LangContext";

/* ── helpers ── */
const LEVEL_GRADIENT: Record<string, string> = {
  "Acemi":       "135deg, #1e293b, #334155",
  "Amatör":      "135deg, #052e16, #166534",
  "Profesyonel": "135deg, #1e3a5f, #1d4ed8",
  "Uzman":       "135deg, #2e1065, #7c3aed",
  "Şampiyon":    "135deg, #451a03, #d97706",
  "Efsane":      "135deg, #431407, #ea580c",
};
const LEVEL_COLOR: Record<string, string> = {
  "Acemi": "#94a3b8", "Amatör": "#4ade80", "Profesyonel": "#60a5fa",
  "Uzman": "#c084fc", "Şampiyon": "#fbbf24", "Efsane": "#f97316",
};
const GAME_META: Record<string, { label: string; icon: string; unit: string; color: string; max: number }> = {
  millionaire: { label: "Milyoner",     icon: "💰", unit: "soru",    color: "#fbbf24", max: 15 },
  flashcard:   { label: "Flashcard",    icon: "⚡", unit: "% başarı", color: "#c084fc", max: 100 },
  timeQuiz:    { label: "Zaman Yarışı", icon: "⏱️", unit: "doğru",   color: "#4ade80", max: 15 },
  deathMatch:  { label: "Ölüm Kalım",  icon: "💀", unit: "seri",    color: "#f87171", max: 15 },
};
const FONT_FAMILY: Record<string, string> = {
  inter:   "var(--font-inter),sans-serif",
  poppins: "var(--font-poppins),sans-serif",
  mono:    "var(--font-mono),monospace",
  serif:   "var(--font-serif),serif",
};
const BG_PREVIEW: Record<string, string> = {
  classic: "linear-gradient(135deg,#0d1f3c,#020b18)",
  mesh:    "linear-gradient(135deg,#0d1f3c,#1a0d3c)",
  aurora:  "linear-gradient(135deg,#0d1f3c,#003322)",
  stars:   "linear-gradient(135deg,#020b18,#0a0a2e)",
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLang();
  const { profile, buyItem, setActiveTheme, setActiveBackground, setActiveFont, setActiveTitle, setDisplayName, resetProfile } = useProfile();

  const [tab, setTab] = useState<"overview" | "badges" | "shop">("overview");
  const [shopSec, setShopSec] = useState<"titles" | "fonts" | "themes" | "bgs">("titles");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(profile.displayName);

  const level = getLevelInfo(profile.points);
  const lc = LEVEL_COLOR[level.name] ?? "#fbbf24";
  const lg = LEVEL_GRADIENT[level.name] ?? "135deg,#0d1f3c,#020b18";
  const pct = level.next ? Math.min(100, Math.round((profile.points / level.next) * 100)) : 100;
  const tree = getTreeStage(profile.forestSessions);
  const nextTree = getTreeStage(profile.forestSessions + 1);
  const titleBadge = TITLE_BADGES.find(tb => tb.id === profile.activeTitle);
  const avatar = profile.points >= 20000 ? "👑" : profile.points >= 8000 ? "🦁" : profile.points >= 4000 ? "🦊" : profile.points >= 1500 ? "🐺" : profile.points >= 500 ? "🐢" : "🐣";

  function showToast(ok: boolean, msg: string) {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 2200);
  }

  function doBuy(type: "theme" | "background" | "font" | "title", id: string, cost: number, cb?: () => void) {
    if (buyItem(type, id, cost)) { showToast(true, t.boughtMsg); cb?.(); }
    else showToast(false, t.notEnoughMsg);
  }

  function saveName() { setDisplayName(nameVal); setEditName(false); }

  /* ── tiny reusable shop button ── */
  function Btn({ owned, active, afford, cost, onBuy, onSel, activeLabel = "✓ Aktif" }: {
    owned: boolean; active: boolean; afford: boolean; cost: number;
    onBuy(): void; onSel(): void; activeLabel?: string;
  }) {
    if (active) return <p style={{ fontSize: "0.75rem", fontWeight: 700, color: lc, textAlign: "center", marginTop: "2px" }}>{activeLabel}</p>;
    if (owned)  return <button onClick={onSel} style={ghostSmall}>{t.selectBtn}</button>;
    return <button onClick={onBuy} disabled={!afford} style={afford ? goldSmall : disabledSmall}>{cost === 0 ? t.free : `${cost.toLocaleString("tr-TR")} pt`}</button>;
  }

  const ghostSmall: React.CSSProperties   = { width: "100%", padding: "6px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-mid)", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" };
  const goldSmall: React.CSSProperties    = { width: "100%", padding: "6px", borderRadius: "8px", background: "linear-gradient(135deg,var(--gold-600),var(--gold-400))", border: "none", color: "var(--navy-900)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" };
  const disabledSmall: React.CSSProperties = { width: "100%", padding: "6px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", cursor: "not-allowed", fontFamily: "inherit" };

  /* ── shop sub-tab pill ── */
  function ShopPill({ id, label }: { id: typeof shopSec; label: string }) {
    const active = shopSec === id;
    return <button onClick={() => setShopSec(id)} style={{ padding: "7px 15px", borderRadius: "999px", background: active ? `${lc}20` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? lc + "60" : "rgba(255,255,255,0.08)"}`, color: active ? lc : "var(--text-secondary)", fontWeight: active ? 700 : 500, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>{label}</button>;
  }

  return (
    <div className="bg-game" style={{ minHeight: "100vh" }}>

      {/* ─── COVER ─── */}
      <div style={{ position: "relative", height: "120px", background: `linear-gradient(${lg})` }}>
        {/* clipped decorative rings — contained inside cover */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {[80, 140, 200, 260].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: `1px solid ${lc}25`, top: "50%", left: `${15 + i * 22}%`, transform: "translateY(-50%)", pointerEvents: "none" }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, var(--navy-950) 100%)" }} />
        <button onClick={() => router.push("/games")} className="btn-ghost"
          style={{ position: "absolute", top: 14, right: 18, padding: "6px 13px", fontSize: "0.78rem", backdropFilter: "blur(8px)" }}>
          {t.goBack}
        </button>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 28px 60px" }}>

        {/* ─── IDENTITY ROW ─── */}
        {/* paddingTop gives room above so edit inputs never get clipped by cover */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", marginTop: "-44px", marginBottom: "20px", flexWrap: "wrap", paddingTop: "48px" }}>

          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: `linear-gradient(${lg})`, border: `4px solid var(--navy-950)`, outline: `3px solid ${lc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", boxShadow: `0 0 24px ${lc}40` }}>
              {avatar}
            </div>
            <div style={{ position: "absolute", bottom: 2, right: 0, background: lc, borderRadius: "999px", padding: "2px 8px", fontSize: "0.58rem", fontWeight: 800, color: "#000", whiteSpace: "nowrap" }}>
              {level.name}
            </div>
          </div>

          {/* Name block */}
          <div style={{ flex: 1, paddingBottom: "6px", minWidth: "180px" }}>
            {editName ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditName(false); }}
                  maxLength={20}
                  placeholder={t.namePlaceholder}
                  style={{ flex: 1, maxWidth: "200px", padding: "8px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.09)", border: `1px solid ${lc}70`, color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "inherit", outline: "none" }}
                />
                <button onClick={saveName} style={{ ...goldSmall, width: "auto", padding: "8px 14px", fontSize: "0.82rem" }}>{t.saveName}</button>
                <button onClick={() => setEditName(false)} style={{ ...ghostSmall, width: "auto", padding: "8px 12px", fontSize: "0.82rem" }}>{t.cancelEdit}</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "1.65rem", fontWeight: 900, lineHeight: 1, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {profile.displayName || t.unnamed}
                </h1>
                {titleBadge && <span title={titleBadge.name} style={{ fontSize: "1.4rem" }}>{titleBadge.emoji}</span>}
                <button onClick={() => { setNameVal(profile.displayName); setEditName(true); }}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "3px 9px", color: "var(--text-muted)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit" }}>
                  ✏️ {t.editName}
                </button>
              </div>
            )}
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              {profile.gamesPlayed} {t.gamesPlayed} &nbsp;·&nbsp; {profile.badges.length}/{ALL_BADGES.length} {t.badgeLabel} &nbsp;·&nbsp; {tree.emoji} {tree.label}
            </p>
          </div>

          {/* Points card */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${lc}30`, borderRadius: "16px", padding: "14px 22px", textAlign: "center", flexShrink: 0, marginBottom: "6px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>{t.totalPoints}</p>
            <p style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1, color: lc }}>{profile.points.toLocaleString("tr-TR")}</p>
          </div>
        </div>

        {/* ─── PROGRESS BAR ─── */}
        {level.next && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>
                {level.name} &rarr; {getLevelInfo(level.next + 1).name} &nbsp;
                <span style={{ color: "var(--text-secondary)" }}>{profile.points.toLocaleString("tr-TR")} / {level.next.toLocaleString("tr-TR")}</span>
              </span>
              <span style={{ fontWeight: 700, fontSize: "0.74rem", color: lc }}>{pct}%</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${lc}88,${lc})`, borderRadius: "999px", transition: "width 0.8s ease" }} />
            </div>
          </div>
        )}

        {/* ─── TAB BAR ─── */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "28px" }}>
          {(["overview", "badges", "shop"] as const).map((tabId) => {
            const labels = { overview: t.overview, badges: t.badgesTab, shop: t.shopTab };
            const a = tab === tabId;
            return (
              <button key={tabId} onClick={() => setTab(tabId)} style={{ padding: "11px 22px", background: "transparent", border: "none", borderBottom: `2px solid ${a ? lc : "transparent"}`, color: a ? "var(--text-primary)" : "var(--text-muted)", fontWeight: a ? 700 : 500, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s", marginBottom: "-1px" }}>
                {labels[tabId]}
              </button>
            );
          })}
        </div>

        {/* ═══════════════ OVERVIEW ═══════════════ */}
        {tab === "overview" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Stat pills row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
              {[
                { icon: "🎮", val: String(profile.gamesPlayed), label: t.gamesPlayed,    color: "#60a5fa" },
                { icon: "🏅", val: `${profile.badges.length}`,  label: t.badgeLabel,   color: lc },
                { icon: "🌿", val: String(profile.forestSessions), label: t.focusSessions, color: "#4ade80" },
                { icon: "🔥", val: `${profile.forestStreak}g`,   label: t.dayStreak,    color: "#f97316" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* High scores */}
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "12px" }}>{t.highScores}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(profile.highScores).map(([id, score]) => {
                  const m = GAME_META[id]; if (!m) return null;
                  const barPct = Math.min(100, Math.round((score / m.max) * 100));
                  return (
                    <div key={id} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{m.label}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: m.color, fontSize: "1.05rem" }}>
                          {id === "flashcard" ? `%${score}` : `${score} ${m.unit}`}
                        </span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${barPct}%`, height: "100%", background: `linear-gradient(90deg,${m.color}66,${m.color})`, borderRadius: "999px", transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipped */}
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "12px" }}>{t.activeAppearance}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                {[
                  { label: t.colorTheme, val: COLOR_THEMES.find(ct => ct.id === profile.activeColorTheme)?.name ?? "—", preview: <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLOR_THEMES.find(ct => ct.id === profile.activeColorTheme)?.preview ?? "#fbbf24" }} /> },
                  { label: t.bgLabel,   val: BACKGROUNDS.find(b => b.id === profile.activeBackground)?.name ?? "—", preview: <div style={{ width: 20, height: 14, borderRadius: "4px", background: BG_PREVIEW[profile.activeBackground] }} /> },
                  { label: t.fontLabel,        val: FONTS.find(f => f.id === profile.activeFont)?.name ?? "—", preview: <span style={{ fontFamily: FONT_FAMILY[profile.activeFont], fontWeight: 700, fontSize: "1rem" }}>Aa</span> },
                  { label: t.titleBadgeLabel, val: titleBadge ? titleBadge.name : t.noneLabel, preview: <span style={{ fontSize: "1.2rem" }}>{titleBadge ? titleBadge.emoji : "—"}</span> },
                ].map((item, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flexShrink: 0 }}>{item.preview}</div>
                    <div>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</p>
                      <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "2px" }}>{t.resetProfile}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{t.deletesAll}</p>
              </div>
              {!confirmReset
                ? <button onClick={() => setConfirmReset(true)} style={{ padding: "8px 16px", borderRadius: "9px", background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: "var(--red-400)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>🗑️ {t.resetProfile}</button>
                : <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setConfirmReset(false)} style={ghostSmall}>{t.cancelEdit}</button>
                    <button onClick={() => { resetProfile(); setConfirmReset(false); setNameVal(""); }} style={{ padding: "8px 14px", borderRadius: "9px", background: "rgba(239,68,68,0.15)", border: "1px solid var(--red-400)", color: "var(--red-400)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}>{t.yesReset}</button>
                  </div>
              }
            </div>
          </div>
        )}

        {/* ═══════════════ BADGES ═══════════════ */}
        {tab === "badges" && (
          <div className="animate-fade-in">
            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${Math.round((profile.badges.length / ALL_BADGES.length) * 100)}%`, height: "100%", background: `linear-gradient(90deg,${lc}88,${lc})`, borderRadius: "999px", transition: "width 0.6s" }} />
              </div>
              <span style={{ color: lc, fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{profile.badges.length} / {ALL_BADGES.length}</span>
            </div>

            {/* Earned first */}
            {profile.badges.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "12px" }}>{t.earned}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "10px" }}>
                  {ALL_BADGES.filter(b => profile.badges.includes(b.id)).map(badge => (
                    <div key={badge.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: `${lc}0d`, border: `1px solid ${lc}30`, borderRadius: "14px" }}>
                      <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>{badge.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.88rem", color: lc, marginBottom: "2px" }}>{badge.name}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.4 }}>{badge.desc}</p>
                      </div>
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>✅</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "12px" }}>{t.locked}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "10px" }}>
                {ALL_BADGES.filter(b => !profile.badges.includes(b.id)).map(badge => (
                  <div key={badge.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", opacity: 0.45 }}>
                    <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0, filter: "grayscale(1)" }}>{badge.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "2px" }}>{badge.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.4 }}>{badge.desc}</p>
                    </div>
                    <span style={{ fontSize: "0.9rem", flexShrink: 0, color: "var(--text-muted)" }}>🔒</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ SHOP ═══════════════ */}
        {tab === "shop" && (
          <div className="animate-fade-in">
            {/* Balance + toast */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: `${lc}12`, border: `1px solid ${lc}35`, borderRadius: "12px", padding: "10px 18px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{t.balance}</span>
                <span style={{ fontWeight: 900, fontSize: "1.1rem", color: lc }}>{profile.points.toLocaleString("tr-TR")} puan</span>
              </div>
              {toast && (
                <div style={{ padding: "9px 15px", borderRadius: "10px", background: toast.ok ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${toast.ok ? "#4ade80" : "#f87171"}`, color: toast.ok ? "#4ade80" : "#f87171", fontWeight: 700, fontSize: "0.82rem" }}>
                  {toast.msg}
                </div>
              )}
            </div>

            {/* Shop sub-tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "22px", flexWrap: "wrap" }}>
              <ShopPill id="titles"  label={t.shopTitlePill} />
              <ShopPill id="fonts"   label={t.shopFontPill} />
              <ShopPill id="themes"  label={t.shopThemePill} />
              <ShopPill id="bgs"     label={t.shopBgPill} />
            </div>

            {/* ── Titles ── */}
            {shopSec === "titles" && (
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "16px" }}>{t.titleHint}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "10px" }}>
                  {TITLE_BADGES.map(tb => {
                    const owned = profile.unlockedTitles.includes(tb.id);
                    const active = profile.activeTitle === tb.id;
                    return (
                      <div key={tb.id} style={{ background: active ? `${lc}10` : "rgba(255,255,255,0.02)", border: `1px solid ${active ? lc + "40" : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", padding: "18px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>{tb.emoji}</div>
                        <p style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: "10px" }}>{tb.name}</p>
                        <Btn owned={owned} active={active} afford={profile.points >= tb.cost} cost={tb.cost}
                          onBuy={() => doBuy("title", tb.id, tb.cost, () => setActiveTitle(tb.id))}
                          onSel={() => setActiveTitle(tb.id)} activeLabel={t.titleEquipped} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Fonts ── */}
            {shopSec === "fonts" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: "12px" }}>
                {FONTS.map(font => {
                  const owned = profile.unlockedFonts.includes(font.id);
                  const active = profile.activeFont === font.id;
                  return (
                    <div key={font.id} style={{ background: active ? `${lc}08` : "rgba(255,255,255,0.02)", border: `1px solid ${active ? lc + "35" : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", padding: "20px 16px", textAlign: "center" }}>
                      <p style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "6px", fontFamily: FONT_FAMILY[font.id] }}>{font.preview}</p>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "3px", fontFamily: FONT_FAMILY[font.id] }}>{font.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "14px" }}>{font.desc}</p>
                      <Btn owned={owned} active={active} afford={profile.points >= font.cost} cost={font.cost}
                        onBuy={() => doBuy("font", font.id, font.cost, () => setActiveFont(font.id))}
                        onSel={() => setActiveFont(font.id)} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Color themes ── */}
            {shopSec === "themes" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: "12px" }}>
                {COLOR_THEMES.map(theme => {
                  const owned = profile.unlockedThemes.includes(theme.id);
                  const active = profile.activeColorTheme === theme.id;
                  return (
                    <div key={theme.id} style={{ background: active ? `${theme.preview}0e` : "rgba(255,255,255,0.02)", border: `1px solid ${active ? theme.preview + "50" : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", padding: "20px 14px", textAlign: "center" }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", background: theme.preview, margin: "0 auto 12px", boxShadow: active ? `0 0 22px ${theme.preview}60` : "none", transition: "box-shadow 0.3s" }} />
                      <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "3px" }}>{theme.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "14px" }}>{theme.desc}</p>
                      <Btn owned={owned} active={active} afford={profile.points >= theme.cost} cost={theme.cost}
                        onBuy={() => doBuy("theme", theme.id, theme.cost, () => setActiveTheme(theme.id))}
                        onSel={() => setActiveTheme(theme.id)} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Backgrounds ── */}
            {shopSec === "bgs" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: "12px" }}>
                {BACKGROUNDS.map(bg => {
                  const owned = profile.unlockedBackgrounds.includes(bg.id);
                  const active = profile.activeBackground === bg.id;
                  return (
                    <div key={bg.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${active ? lc + "35" : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", padding: "20px 14px", textAlign: "center" }}>
                      <div style={{ height: 60, borderRadius: "10px", marginBottom: "12px", background: BG_PREVIEW[bg.id], boxShadow: active ? `0 0 18px ${lc}40` : "none", transition: "box-shadow 0.3s" }} />
                      <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "3px" }}>{bg.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "14px" }}>{bg.desc}</p>
                      <Btn owned={owned} active={active} afford={profile.points >= bg.cost} cost={bg.cost}
                        onBuy={() => doBuy("background", bg.id, bg.cost, () => setActiveBackground(bg.id))}
                        onSel={() => setActiveBackground(bg.id)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
