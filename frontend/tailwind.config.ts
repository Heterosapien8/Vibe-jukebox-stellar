import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0a10",
        "bg-base": "#0d0a10",
        "bg-panel": "#1a1220",
        "surface": "#1a1220",
        "surface-raised": "#24182e",
        "surface-card": "#160f1c",
        "border-glow": "rgba(49, 230, 224, 0.25)",
        "led-red": "#ff1a1a",
        "text-primary": "#f4ece8",
        "text-secondary": "#9a8a9e",
        neon: {
          pink: "#ff2d6d",
          magenta: "#ff2d6d",
          cyan: "#31e6e0",
          amber: "#ffb84d",
          purple: "#b83bf6",
          emerald: "#00ff9d",
          blue: "#31e6e0",
          red: "#ff1a1a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        led: ["var(--font-led)", "monospace"],
      },
      boxShadow: {
        "neon-pink": "0 0 14px rgba(255, 45, 109, 0.45), 0 0 28px rgba(255, 45, 109, 0.2)",
        "neon-cyan": "0 0 14px rgba(49, 230, 224, 0.45), 0 0 28px rgba(49, 230, 224, 0.2)",
        "neon-amber": "0 0 14px rgba(255, 184, 77, 0.45), 0 0 28px rgba(255, 184, 77, 0.2)",
        "neon-purple": "0 0 14px rgba(184, 59, 246, 0.45), 0 0 28px rgba(184, 59, 246, 0.2)",
        "neon-emerald": "0 0 14px rgba(0, 255, 157, 0.45), 0 0 28px rgba(0, 255, 157, 0.2)",
        "led-red": "0 0 10px rgba(255, 26, 26, 0.6), 0 0 22px rgba(255, 26, 26, 0.3)",
        "jukebox-dome": "0 0 35px rgba(255, 45, 109, 0.25), inset 0 0 25px rgba(49, 230, 224, 0.15)",
        "marquee-sign": "0 0 25px rgba(255, 184, 77, 0.5), inset 0 0 15px rgba(0, 0, 0, 0.6)",
        "neon-sign": "0 0 25px rgba(255, 45, 109, 0.6), inset 0 0 15px rgba(255, 45, 109, 0.2)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "checkerboard": "repeating-conic-gradient(#1a1220 0% 25%, #120b14 0% 50%) 50% / 20px 20px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-flow": "glow 3s ease-in-out infinite alternate",
        "equalizer-1": "equalizer 1.2s ease-in-out infinite alternate",
        "equalizer-2": "equalizer 0.9s ease-in-out infinite alternate-reverse",
        "equalizer-3": "equalizer 1.5s ease-in-out infinite alternate",
        "marquee": "marquee 45s linear infinite",
        "marquee-fast": "marquee 22s linear infinite",
        "column-glow": "columnPulse 4s ease-in-out infinite alternate",
        "disc-spin": "spin 12s linear infinite",
        "shimmer": "shimmer 2s infinite linear",
        "bulb-blink-1": "bulbBlink 1.2s ease-in-out infinite",
        "bulb-blink-2": "bulbBlink 1.2s ease-in-out 0.6s infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        columnPulse: {
          "0%": { opacity: "0.7", filter: "drop-shadow(0 0 8px #ff2d6d)" },
          "50%": { opacity: "1", filter: "drop-shadow(0 0 18px #31e6e0)" },
          "100%": { opacity: "0.7", filter: "drop-shadow(0 0 8px #ff2d6d)" },
        },
        equalizer: {
          "0%": { height: "15%" },
          "50%": { height: "85%" },
          "100%": { height: "40%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        bulbBlink: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 6px #ffb84d)" },
          "50%": { opacity: "0.45", filter: "none" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
