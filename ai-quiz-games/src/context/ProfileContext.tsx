"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type GameId = "millionaire" | "flashcard" | "timeQuiz" | "deathMatch";

export type Profile = {
  points: number;
  gamesPlayed: number;
  highScores: Record<GameId, number>;
  badges: string[];
  unlockedThemes: string[];
  unlockedBackgrounds: string[];
  unlockedTitles: string[];
  unlockedFonts: string[];
  activeColorTheme: string;
  activeBackground: string;
  activeFont: string;
  activeTitle: string;   // emoji title id displayed next to name
  displayName: string;
  forestSessions: number;
  forestLastDate: string;
  forestStreak: number;
};

// ── Shop Catalogues ────────────────────────────────────────────────────────
export const COLOR_THEMES = [
  { id: "classic", name: "Klasik Altın",   cost: 0,    preview: "#fbbf24", desc: "Varsayılan altın tema" },
  { id: "ocean",   name: "Okyanus",        cost: 500,  preview: "#60a5fa", desc: "Mavi vurgu rengi" },
  { id: "forest",  name: "Orman",          cost: 500,  preview: "#4ade80", desc: "Yeşil vurgu rengi" },
  { id: "purple",  name: "Mor Gece",       cost: 1000, preview: "#c084fc", desc: "Mor vurgu rengi" },
  { id: "red",     name: "Kızıl Fırtına",  cost: 1500, preview: "#f87171", desc: "Kırmızı vurgu rengi" },
] as const;

export const BACKGROUNDS = [
  { id: "classic", name: "Klasik",          cost: 0,    desc: "Varsayılan arka plan" },
  { id: "mesh",    name: "Mesh",            cost: 300,  desc: "Geometrik ağ deseni" },
  { id: "aurora",  name: "Kuzey Işıkları",  cost: 800,  desc: "Aurora efekti" },
  { id: "stars",   name: "Yıldızlar",       cost: 1200, desc: "Yıldız patikası" },
] as const;

export const FONTS = [
  { id: "inter",   name: "Inter",            cost: 0,    preview: "Aa",  desc: "Modern, varsayılan" },
  { id: "poppins", name: "Poppins",          cost: 300,  preview: "Aa",  desc: "Yuvarlak, arkadaş canlısı" },
  { id: "mono",    name: "Fira Code",        cost: 500,  preview: "</>", desc: "Monospace, teknolojik" },
  { id: "serif",   name: "Playfair Display", cost: 700,  preview: "Aa",  desc: "Zarif, klasik serif" },
] as const;

export const TITLE_BADGES = [
  { id: "star",    emoji: "🌟", name: "Yıldız",    cost: 500  },
  { id: "fire",    emoji: "🔥", name: "Ateş",      cost: 750  },
  { id: "thunder", emoji: "⚡", name: "Şimşek",    cost: 500  },
  { id: "diamond", emoji: "💎", name: "Elmas",     cost: 1000 },
  { id: "alien",   emoji: "👾", name: "Uzaylı",    cost: 800  },
  { id: "robot",   emoji: "🤖", name: "Robot",     cost: 800  },
  { id: "skull",   emoji: "💀", name: "Kafatası",  cost: 1500 },
  { id: "lion",    emoji: "🦁", name: "Aslan",     cost: 1500 },
  { id: "crown",   emoji: "👑", name: "Taç",       cost: 2000 },
  { id: "dragon",  emoji: "🐉", name: "Ejder",     cost: 3000 },
] as const;

// ── Badges ─────────────────────────────────────────────────────────────────
export const ALL_BADGES = [
  { id: "first_game",          icon: "🎮", name: "Yolculuk Başladı",    desc: "İlk oyunu oynadın" },
  { id: "games_10",            icon: "🔥", name: "Bağımlı",             desc: "10 oyun oynadın" },
  { id: "triple_threat",       icon: "🎯", name: "Çok Yönlü",           desc: "3 farklı oyun modunu oyadın" },
  { id: "millionaire_halfway", icon: "💼", name: "Yarı Yolda",          desc: "Milyoner'de 10. soruya ulaştın" },
  { id: "millionaire_win",     icon: "💰", name: "Milyoner",            desc: "Milyoner oyununu kazandın" },
  { id: "flashcard_perfect",   icon: "⚡", name: "Flaş Kart Ustası",    desc: "Flashcard'da tüm kartları bildin" },
  { id: "timequiz_perfect",    icon: "⏱️", name: "Zaman Avcısı",        desc: "Zaman Yarışı'nda mükemmel skor" },
  { id: "deathmatch_win",      icon: "💀", name: "Ölümsüz",             desc: "Ölüm Kalım'ı sıfır hata ile bitirdin" },
  { id: "forest_grower",       icon: "🌱", name: "Bahçıvan",            desc: "İlk odak seansını tamamladın" },
  { id: "forest_dedicated",    icon: "🌳", name: "Kararlı",             desc: "5 odak seansı tamamladın" },
  { id: "forest_streak",       icon: "🌿", name: "Düzenli",             desc: "3 gün arka arkaya odak seansı yaptın" },
  { id: "points_1000",         icon: "🏆", name: "Hızlı Parmaklar",     desc: "1.000 puan kazandın" },
  { id: "points_5000",         icon: "💎", name: "Para Babası",          desc: "5.000 puan kazandın" },
  { id: "points_20000",        icon: "👑", name: "Efsane",              desc: "20.000 puan kazandın" },
  { id: "perfect_any",         icon: "⭐", name: "Mükemmeliyetçi",      desc: "Herhangi bir oyunda tam puan" },
  { id: "collector",           icon: "🎨", name: "Koleksiyoner",         desc: "Bir tema veya arka plan satın aldın" },
];

export function getLevelInfo(points: number) {
  if (points < 500)    return { name: "Acemi",       next: 500 };
  if (points < 1_500)  return { name: "Amatör",      next: 1_500 };
  if (points < 4_000)  return { name: "Profesyonel", next: 4_000 };
  if (points < 8_000)  return { name: "Uzman",       next: 8_000 };
  if (points < 20_000) return { name: "Şampiyon",    next: 20_000 };
  return { name: "Efsane", next: null };
}

export function getTreeStage(sessions: number) {
  if (sessions === 0) return { emoji: "🪨", label: "Henüz başlamadı" };
  if (sessions === 1) return { emoji: "🌱", label: "Tohum" };
  if (sessions <= 3)  return { emoji: "🌿", label: "Fide" };
  if (sessions <= 6)  return { emoji: "🌳", label: "Genç Ağaç" };
  if (sessions <= 10) return { emoji: "🌲", label: "Büyük Ağaç" };
  return { emoji: "🏔️", label: "Orman" };
}

// ── Default Profile ────────────────────────────────────────────────────────
const DEFAULT_PROFILE: Profile = {
  points: 5000, // demo default
  gamesPlayed: 0,
  highScores: { millionaire: 0, flashcard: 0, timeQuiz: 0, deathMatch: 0 },
  badges: [],
  unlockedThemes: ["classic"],
  unlockedBackgrounds: ["classic"],
  unlockedTitles: [],
  unlockedFonts: ["inter"],
  activeColorTheme: "classic",
  activeBackground: "classic",
  activeFont: "inter",
  activeTitle: "",
  displayName: "",
  forestSessions: 0,
  forestLastDate: "",
  forestStreak: 0,
};

// ── Context ────────────────────────────────────────────────────────────────
type ProfileContextValue = {
  profile: Profile;
  addPoints: (n: number) => void;
  updateHighScore: (gameId: GameId, score: number) => void;
  awardBadge: (id: string) => void;
  incrementGamesPlayed: () => void;
  addForestSession: () => void;
  buyItem: (type: "theme" | "background" | "font" | "title", id: string, cost: number) => boolean;
  setActiveTheme: (id: string) => void;
  setActiveBackground: (id: string) => void;
  setActiveFont: (id: string) => void;
  setActiveTitle: (id: string) => void;
  setDisplayName: (name: string) => void;
  resetProfile: () => void;
  markGamePlayed: (gameId: string) => void;
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: DEFAULT_PROFILE,
  addPoints: () => {},
  updateHighScore: () => {},
  awardBadge: () => {},
  incrementGamesPlayed: () => {},
  addForestSession: () => {},
  buyItem: () => false,
  setActiveTheme: () => {},
  setActiveBackground: () => {},
  setActiveFont: () => {},
  setActiveTitle: () => {},
  setDisplayName: () => {},
  resetProfile: () => {},
  markGamePlayed: () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [playedModes, setPlayedModes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aq_profile_v5");
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
      const modes = localStorage.getItem("aq_played_modes_v5");
      if (modes) setPlayedModes(new Set(JSON.parse(modes)));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("aq_profile_v5", JSON.stringify(profile));
  }, [profile]);

  // Apply theme / bg / font data attributes
  useEffect(() => {
    document.documentElement.setAttribute("data-color-theme", profile.activeColorTheme);
    document.documentElement.setAttribute("data-bg", profile.activeBackground);
    document.documentElement.setAttribute("data-font", profile.activeFont);
  }, [profile.activeColorTheme, profile.activeBackground, profile.activeFont]);

  function update(fn: (p: Profile) => Profile) {
    setProfile((prev) => fn(prev));
  }

  function addPoints(n: number) {
    update((p) => {
      const next = { ...p, points: p.points + n };
      if (next.points >= 1_000  && !next.badges.includes("points_1000"))  next.badges = [...next.badges, "points_1000"];
      if (next.points >= 5_000  && !next.badges.includes("points_5000"))  next.badges = [...next.badges, "points_5000"];
      if (next.points >= 20_000 && !next.badges.includes("points_20000")) next.badges = [...next.badges, "points_20000"];
      return next;
    });
  }

  function updateHighScore(gameId: GameId, score: number) {
    update((p) => ({ ...p, highScores: { ...p.highScores, [gameId]: Math.max(p.highScores[gameId] ?? 0, score) } }));
  }

  function awardBadge(id: string) {
    update((p) => p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id] });
  }

  function incrementGamesPlayed() {
    update((p) => {
      const next = { ...p, gamesPlayed: p.gamesPlayed + 1 };
      if (next.gamesPlayed === 1 && !next.badges.includes("first_game")) next.badges = [...next.badges, "first_game"];
      if (next.gamesPlayed >= 10 && !next.badges.includes("games_10"))   next.badges = [...next.badges, "games_10"];
      return next;
    });
  }

  function markGamePlayed(gameId: string) {
    setPlayedModes((prev) => {
      const next = new Set(prev);
      next.add(gameId);
      localStorage.setItem("aq_played_modes_v5", JSON.stringify([...next]));
      if (next.size >= 3) {
        update((p) => p.badges.includes("triple_threat") ? p : { ...p, badges: [...p.badges, "triple_threat"] });
      }
      return next;
    });
  }

  function addForestSession() {
    const today = new Date().toISOString().slice(0, 10);
    update((p) => {
      const sessions = p.forestSessions + 1;
      let streak = p.forestStreak;
      if (!p.forestLastDate) {
        streak = 1;
      } else {
        const diff = Math.floor((Date.now() - new Date(p.forestLastDate).getTime()) / 86_400_000);
        if (diff === 0) streak = p.forestStreak;
        else if (diff === 1) streak = p.forestStreak + 1;
        else streak = 1;
      }
      const next: Profile = { ...p, forestSessions: sessions, forestLastDate: today, forestStreak: streak };
      if (sessions === 1 && !next.badges.includes("forest_grower"))  next.badges = [...next.badges, "forest_grower"];
      if (sessions >= 5  && !next.badges.includes("forest_dedicated")) next.badges = [...next.badges, "forest_dedicated"];
      if (streak >= 3    && !next.badges.includes("forest_streak"))  next.badges = [...next.badges, "forest_streak"];
      return next;
    });
    addPoints(300);
  }

  function buyItem(type: "theme" | "background" | "font" | "title", id: string, cost: number): boolean {
    const keyMap = { theme: "unlockedThemes", background: "unlockedBackgrounds", font: "unlockedFonts", title: "unlockedTitles" } as const;
    const key = keyMap[type];
    // Synchronous check against current profile snapshot — avoids async updater pitfall
    if (profile.points < cost || (profile[key] as string[]).includes(id)) return false;
    update((p) => {
      if (p.points < cost || (p[key] as string[]).includes(id)) return p;
      const next = { ...p, points: p.points - cost, [key]: [...(p[key] as string[]), id] };
      if (!next.badges.includes("collector")) next.badges = [...next.badges, "collector"];
      return next;
    });
    return true;
  }

  function setActiveTheme(id: string)      { update((p) => ({ ...p, activeColorTheme: id })); }
  function setActiveBackground(id: string) { update((p) => ({ ...p, activeBackground: id })); }
  function setActiveFont(id: string)       { update((p) => ({ ...p, activeFont: id })); }
  function setActiveTitle(id: string)      { update((p) => ({ ...p, activeTitle: p.activeTitle === id ? "" : id })); }
  function setDisplayName(name: string)    { update((p) => ({ ...p, displayName: name.trim().slice(0, 20) })); }

  function resetProfile() {
    setProfile(DEFAULT_PROFILE);
    setPlayedModes(new Set());
    localStorage.removeItem("aq_played_modes_v5");
  }

  return (
    <ProfileContext.Provider value={{
      profile, addPoints, updateHighScore, awardBadge, incrementGamesPlayed,
      addForestSession, buyItem, setActiveTheme, setActiveBackground,
      setActiveFont, setActiveTitle, setDisplayName, resetProfile, markGamePlayed,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
