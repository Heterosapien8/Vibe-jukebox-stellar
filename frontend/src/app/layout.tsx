import type { Metadata, Viewport } from "next";
import { Outfit, Righteous, Space_Mono, DotGothic16 } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-led",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIBE Jukebox — Vintage Neon Token-Curated Jukebox on Stellar & Soroban",
  description: "Experience the retro neon jukebox on Stellar Testnet: claim daily VIBE tokens, tip the node with XLM, and cast on-chain Soroban votes to rank tracks.",
  keywords: ["Stellar", "Soroban", "Smart Contracts", "Jukebox", "VIBE", "Web3", "Blockchain", "Freighter", "Rise In"],
  authors: [{ name: "Heterosapien8" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${righteous.variable} ${spaceMono.variable} ${dotGothic.variable}`}>
      <body className="bg-bg-base text-text-primary min-h-screen flex flex-col antialiased selection:bg-neon-pink/30 selection:text-neon-pink retro-bar-bg font-sans">
        {children}
      </body>
    </html>
  );
}
