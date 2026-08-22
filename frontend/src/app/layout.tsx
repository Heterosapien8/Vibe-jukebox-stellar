import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIBE Jukebox — Token-Curated Jukebox on Stellar & Soroban",
  description: "Connect your Stellar wallet, claim daily testnet VIBE tokens, and curate the live lounge music queue on Soroban smart contracts.",
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
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col antialiased selection:bg-neon-cyan/30 selection:text-neon-cyan cyber-bg-overlay">
        {children}
      </body>
    </html>
  );
}
