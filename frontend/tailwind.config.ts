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
        background: "#08090e",
        surface: "#0f121d",
        "surface-raised": "#161b2a",
        "surface-card": "#1a2133",
        "border-glow": "rgba(0, 240, 255, 0.2)",
        neon: {
          cyan: "#00f0ff",
          magenta: "#ff007f",
          purple: "#a855f7",
          emerald: "#00ff9d",
          amber: "#ffb300",
          blue: "#38bdf8",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(0, 240, 255, 0.4)",
        "neon-magenta": "0 0 20px -3px rgba(255, 0, 127, 0.4)",
        "neon-purple": "0 0 20px -3px rgba(168, 85, 247, 0.4)",
        "neon-emerald": "0 0 20px -3px rgba(0, 255, 157, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-flow": "glow 3s ease-in-out infinite alternate",
        "equalizer-1": "equalizer 1.2s ease-in-out infinite alternate",
        "equalizer-2": "equalizer 0.9s ease-in-out infinite alternate-reverse",
        "equalizer-3": "equalizer 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        equalizer: {
          "0%": { height: "15%" },
          "50%": { height: "85%" },
          "100%": { height: "40%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
