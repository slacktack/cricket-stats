/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-ink": "rgb(var(--accent-ink) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        live: "rgb(var(--live) / <alpha-value>)",
        win: "rgb(var(--win) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        header: "rgb(var(--header) / <alpha-value>)",
        "header-ink": "rgb(var(--header-ink) / <alpha-value>)",
        "header-muted": "rgb(var(--header-muted) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "panel-ink": "rgb(var(--panel-ink) / <alpha-value>)",
        "panel-muted": "rgb(var(--panel-muted) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        pop: "rgb(var(--pop) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        aqua: "rgb(var(--aqua) / <alpha-value>)",
        sun: "rgb(var(--sun) / <alpha-value>)",
        sage: "rgb(var(--sage) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.5rem",
        "2xl": "0.625rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(12, 20, 35, 0.04), 0 16px 36px -34px rgba(12, 20, 35, 0.4)",
        lift: "0 18px 46px -30px rgba(12, 20, 35, 0.4)",
        glow: "0 0 0 3px rgb(var(--accent) / 0.14)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "70%": { transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-7px) rotate(2deg)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "live-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--live) / 0.45)" },
          "70%": { boxShadow: "0 0 0 7px rgb(var(--live) / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(var(--live) / 0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "fade-up": "fade-up 0.3s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
        "slide-in": "slide-in 0.2s ease-out both",
        rise: "rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        pop: "pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 5s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "live-ring": "live-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};
