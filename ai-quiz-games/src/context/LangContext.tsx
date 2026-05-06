"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "tr" | "en";

const TR = {
  appName: "LearnArea",
  appTagline: "Alternatif Öğrenme",
  aiPowered: "✨ Geleneksel Ezbere Alternatif",
  heroTitle1: "Ders çalışmaya",
  heroTitle2: "farklı bir yol",
  heroDesc:
    "PDF'ini yükle, farklı yollarla öğrenmeye başla. Quiz oyunları ve odak seanslarıyla bilgiyi kalıcı hale getir.",
  startPlaying: "🚀 Hemen Başla",
  feature1Title: "PDF'den Sorular",
  feature1Desc: "Ders notunu, kitap bölümünü veya araştırma makalesini yükle — AI saniyeler içinde sorular üretir.",
  feature2Title: "Oynayarak Öğren",
  feature2Desc: "Milyoner, Flashcard, Zaman Yarışı ve Ölüm Kalım modlarıyla klasik çalışmaya veda et.",
  feature3Title: "Odaklan & Büyü",
  feature3Desc: "Pomodoro tarzı odak seanslarıyla ormanını büyüt. Çalıştıkça ağacın gelişir, puan kazanırsın.",
  gameSelection: "Oyun Seçimi",
  chooseMode: "Oyun modunu seç",
  modeDesc: "PDF yükle ve AI sınavını oluştursun. Daha fazla mod yakında!",
  playNow: "Oyna →",
  comingSoon: "Yakında",
  backToGames: "← Oyunlara Dön",
  darkMode: "Karanlık",
  lightMode: "Aydınlık",
  langSwitch: "EN",
  // Profile page
  profile: "Profil",
  overview: "📊 Genel",
  badgesTab: "🏅 Rozetler",
  shopTab: "🛒 Mağaza",
  level: "Seviye",
  points: "Puan",
  gamesPlayed: "Oyun",
  forestSessions: "Seans",
  highScores: "En Yüksek Skorlar",
  badges: "Rozetler",
  noBadges: "Henüz rozet kazanmadın",
  shopTitles: "Unvanlar",
  shopFonts: "Fontlar",
  shopThemes: "Renkler",
  shopBgs: "Arka Planlar",
  buy: "Satın Al",
  owned: "Sahip",
  active: "Aktif",
  activate: "Etkinleştir",
  notEnoughPoints: "Yetersiz puan",
  displayName: "Görünen Ad",
  editName: "Düzenle",
  saveName: "Kaydet",
  cancelEdit: "İptal",
  namePlaceholder: "Adınızı girin",
  forestStreak: "Gün serisi",
  resetProfile: "Profili Sıfırla",
  resetConfirm: "Emin misin? Tüm veriler silinecek.",
  backToHome: "← Ana Sayfa",
  unnamed: "İsimsiz",
  badgeLabel: "Rozet",
  focusSessions: "Odak Seansı",
  dayStreak: "Gün Serisi",
  totalPoints: "Toplam Puan",
  activeAppearance: "Aktif Görünüm",
  earned: "Kazanılanlar",
  locked: "Kilitli",
  balance: "Bakiye",
  selectBtn: "Seç",
  free: "Ücretsiz",
  boughtMsg: "✅ Satın alındı!",
  notEnoughMsg: "❌ Yetersiz puan!",
  yesReset: "Evet, Sıfırla",
  colorTheme: "Renk Teması",
  bgLabel: "Arka Plan",
  fontLabel: "Font",
  titleBadgeLabel: "İsim Rozeti",
  noneLabel: "Yok",
  goBack: "← Geri",
  titleEquipped: "✓ Takılı",
  titleActive: "✓ Aktif",
  deletesAll: "Tüm puan, skor, rozet ve orman verisini siler.",
  shopTitlePill: "✨ İsim Rozeti",
  shopFontPill: "🔤 Font",
  shopThemePill: "🎨 Renk",
  shopBgPill: "🌌 Arka Plan",
  titleHint: "İsminin yanında görünür. Aktif olanı tekrar tıklayarak kaldırırsın.",
  // Games page
  step1Label: "Adım 1 — Quiz Oyunları İçin",
  uploadTitle: "PDF'ini yükle,",
  uploadTitleHighlight: "oyuna başla",
  uploadSubtitle: "Bir kez yükle, tüm quiz oyunlarını aynı PDF ile oyna. Odak Ormanı PDF gerektirmez.",
  dropHere: "PDF'i buraya bırak",
  dragDrop: "PDF'ini sürükle & bırak",
  orClick: "veya tıklayarak dosya seç",
  pdfOnly: "Yalnızca PDF · Maks 20MB",
  loadedPdf: "Yüklü PDF",
  ready: "✓ Hazır",
  resetPdf: "🗑️ PDF'i Sıfırla",
  pointsUnit: "puan",
  alertPdfOnly: "Lütfen PDF yükleyin.",
  alertMaxSize: "Maksimum 20MB.",
  step2Label: "Adım 2 —",
  chooseGame: "Oyun Seç",
  gameTitlePart1: "Öğrenme modunu",
  gameTitlePart2: "seç",
  startGame: "Başla →",
  uploadFirst: "Önce PDF yükle",
  playBadge: "Oyna",
  startBadge: "Başla",
};

const EN = {
  appName: "LearnArea",
  appTagline: "Alternative Learning",
  aiPowered: "✨ An Alternative to Rote Learning",
  heroTitle1: "A different way",
  heroTitle2: "to study",
  heroDesc:
    "Upload your PDF and start learning in new ways. Master material through quiz games and focus sessions.",
  startPlaying: "🚀 Get Started",
  feature1Title: "Questions from PDF",
  feature1Desc: "Drop in your lecture notes, textbook chapters, or research papers — AI generates questions in seconds.",
  feature2Title: "Learn by Playing",
  feature2Desc: "Millionaire, Flashcard, Time Quiz, and Death Match modes replace passive reading.",
  feature3Title: "Focus & Grow",
  feature3Desc: "Grow your forest with Pomodoro-style focus sessions. Study more, watch your tree flourish.",
  gameSelection: "Game Selection",
  chooseMode: "Choose your game mode",
  modeDesc: "Upload a PDF and let AI generate your challenge. More modes coming soon!",
  playNow: "Play →",
  comingSoon: "Coming Soon",
  backToGames: "← Back to Games",
  darkMode: "Dark",
  lightMode: "Light",
  langSwitch: "TR",
  // Profile page
  profile: "Profile",
  overview: "📊 Overview",
  badgesTab: "🏅 Badges",
  shopTab: "🛒 Shop",
  level: "Level",
  points: "Points",
  gamesPlayed: "Games",
  forestSessions: "Sessions",
  highScores: "High Scores",
  badges: "Badges",
  noBadges: "No badges earned yet",
  shopTitles: "Titles",
  shopFonts: "Fonts",
  shopThemes: "Colors",
  shopBgs: "Backgrounds",
  buy: "Buy",
  owned: "Owned",
  active: "Active",
  activate: "Activate",
  notEnoughPoints: "Not enough points",
  displayName: "Display Name",
  editName: "Edit",
  saveName: "Save",
  cancelEdit: "Cancel",
  namePlaceholder: "Enter your name",
  forestStreak: "Day streak",
  resetProfile: "Reset Profile",
  resetConfirm: "Are you sure? All data will be deleted.",
  backToHome: "← Home",
  unnamed: "Unnamed",
  badgeLabel: "Badge",
  focusSessions: "Focus Sessions",
  dayStreak: "Day Streak",
  totalPoints: "Total Points",
  activeAppearance: "Active Appearance",
  earned: "Earned",
  locked: "Locked",
  balance: "Balance",
  selectBtn: "Select",
  free: "Free",
  boughtMsg: "✅ Purchased!",
  notEnoughMsg: "❌ Not enough points!",
  yesReset: "Yes, Reset",
  colorTheme: "Color Theme",
  bgLabel: "Background",
  fontLabel: "Font",
  titleBadgeLabel: "Name Badge",
  noneLabel: "None",
  goBack: "← Back",
  titleEquipped: "✓ Equipped",
  titleActive: "✓ Active",
  deletesAll: "Deletes all points, scores, badges and forest data.",
  shopTitlePill: "✨ Name Badge",
  shopFontPill: "🔤 Font",
  shopThemePill: "🎨 Color",
  shopBgPill: "🌌 Background",
  titleHint: "Appears next to your name. Click the active one again to remove it.",
  // Games page
  step1Label: "Step 1 — For Quiz Games",
  uploadTitle: "Upload your PDF,",
  uploadTitleHighlight: "start playing",
  uploadSubtitle: "Upload once, play all quiz games with the same PDF. Focus Forest doesn't require a PDF.",
  dropHere: "Drop PDF here",
  dragDrop: "Drag & drop your PDF",
  orClick: "or click to select a file",
  pdfOnly: "PDF only · Max 20MB",
  loadedPdf: "Loaded PDF",
  ready: "✓ Ready",
  resetPdf: "🗑️ Remove PDF",
  pointsUnit: "pts",
  alertPdfOnly: "Please upload a PDF file.",
  alertMaxSize: "Maximum 20MB.",
  step2Label: "Step 2 —",
  chooseGame: "Choose a Game",
  gameTitlePart1: "Pick your",
  gameTitlePart2: "learning mode",
  startGame: "Start →",
  uploadFirst: "Upload PDF first",
  playBadge: "Play",
  startBadge: "Start",
};

type Translations = typeof TR;

const LangContext = createContext<{
  lang: Lang;
  toggle: () => void;
  t: Translations;
}>({ lang: "tr", toggle: () => {}, t: TR });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aq_lang") as Lang | null;
      if (saved === "tr" || saved === "en") setLang(saved);
    } catch { /* ignore */ }
  }, []);

  function toggle() {
    setLang((l) => {
      const next = l === "tr" ? "en" : "tr";
      try { localStorage.setItem("aq_lang", next); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <LangContext.Provider value={{ lang, toggle, t: lang === "tr" ? TR : EN }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
