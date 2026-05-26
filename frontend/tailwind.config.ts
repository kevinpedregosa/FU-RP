import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "text-primary": "var(--text-primary)",
        "text-dim": "var(--text-dim)",
        "text-ghost": "var(--text-ghost)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        border: "var(--border)",
        ink: "var(--background)",
        data: "var(--text-primary)",
        "data-dim": "var(--text-dim)",
        "data-ghost": "var(--text-ghost)",
        chlorophyll: "var(--accent)",
        "chlorophyll-dim": "var(--accent-dim)",
        "chlorophyll-glow": "var(--accent-dim)",
        "border-dim": "var(--border)",
        "border-bright": "var(--border)",
        "amber-signal": "var(--amber-signal)",
        "red-signal": "var(--red-signal)",
        "blue-signal": "var(--blue-signal)",
      },
      fontFamily: {
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "cursor-blink": "cursorBlink 500ms steps(1, end) infinite",
        "fade-fast": "fadeInFast 150ms ease-out both",
      },
      keyframes: {
        cursorBlink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        fadeInFast: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
