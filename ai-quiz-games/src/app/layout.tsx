import type { Metadata } from "next";
import { Inter, Poppins, Fira_Code, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { LangProvider } from "@/context/LangContext";
import { PDFProvider } from "@/context/PDFContext";
import { ProfileProvider } from "@/context/ProfileContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnArea — Alternatif Öğrenme",
  description: "Geleneksel ezbere alternatif: PDF'ini yükle, AI sorular üretsin, oyunlarla öğren. Quiz modları ve odak seanslarıyla bilgiyi kalıcı hale getir.",
  keywords: ["alternatif öğrenme", "AI quiz", "PDF sınav", "oyunla öğren", "pomodoro", "flashcard", "learnarea"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = `${inter.variable} ${poppins.variable} ${firaCode.variable} ${playfair.variable}`;
  return (
    <html lang="tr" className={fontVars} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LangProvider>
            <ProfileProvider>
              <PDFProvider>{children}</PDFProvider>
            </ProfileProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
