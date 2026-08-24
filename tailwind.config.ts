import type { Config } from "tailwindcss";

/**
 * Website-only Tailwind configuration.
 * The desktop app remains independent; this config scans only this website's
 * entry document and src tree.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,css}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-light": "var(--paper-light)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        quiet: "var(--quiet)",
        muted: "var(--muted)",
        signal: "var(--orange)",
        "signal-dark": "var(--orange-dark)",
        cream: "var(--cream)",
        line: "var(--line)",
      },
      fontFamily: {
        display: "var(--display)",
        serif: "var(--serif)",
        mono: "var(--mono)",
      },
      fontWeight: {
        normal: "var(--weight-normal)",
        semibold: "var(--weight-semibold)",
        bold: "var(--weight-bold)",
        black: "var(--weight-black)",
      },
      maxWidth: {
        rail: "var(--rail)",
      },
    },
  },
} satisfies Config;
