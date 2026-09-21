import type { Config } from "tailwindcss";

/**
 * Every colour resolves to a CSS variable declared in app/globals.css, so the
 * light/dark schemes swap without a class-name fork anywhere in the components.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        raised: "var(--raised)",
        sunken: "var(--sunken)",
        slab: "var(--slab)",
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        film: { DEFAULT: "var(--ink-slab)", muted: "var(--ink-slab-2)" },
        line: { DEFAULT: "var(--line)", strong: "var(--line-2)", slab: "var(--line-slab)" },
        info: "var(--blue)",
        normal: "var(--green)",
        pneumonia: "var(--red)",
        uncertain: "var(--amber)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: { spill: "var(--spill)" },
      borderRadius: { slab: "4px", ctl: "3px" },
      transitionTimingFunction: { reveal: "cubic-bezier(.16,1,.3,1)" },
      keyframes: {
        sweep: { "0%": { top: "-120px" }, "100%": { top: "100%" } },
        reveal: {
          from: { opacity: "0", letterSpacing: ".06em", filter: "blur(5px)" },
          to: { opacity: "1", letterSpacing: "-.02em", filter: "none" },
        },
        shim: { to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        sweep: "sweep 2.1s cubic-bezier(.45,0,.55,1) infinite",
        reveal: "reveal .5s cubic-bezier(.16,1,.3,1) both",
        shim: "shim 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
