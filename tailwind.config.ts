import type { Config } from "tailwindcss";

/**
 * Tokens are CSS custom properties scoped per [data-theme] (see
 * src/styles/tokens.css). Mapping them here lets utilities like `bg-surface`,
 * `text-primary`, `border-hairline`, and `bg-accent` resolve to the correct
 * value inside whichever <ThemeZone> they render in.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // semantic roles (resolve per theme scope)
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        hairline: "var(--color-hairline)",
        accent: "var(--color-accent)",
        "accent-contrast": "var(--color-accent-contrast)",

        // flavor accents (precision line)
        "blue-razz": "var(--brand-blue-razz)",
        grape: "var(--brand-grape)",
        lemon: "var(--brand-lemon)",
        peach: "var(--brand-peach)",
        strawberry: "var(--brand-strawberry)",

        // raw brand palette (escape hatch — prefer semantic roles)
        brand: {
          obsidian: "var(--brand-obsidian)",
          carbon: "var(--brand-carbon)",
          platinum: "var(--brand-platinum)",
          silver: "var(--brand-silver)",
          "acid-lime": "var(--brand-acid-lime)",
          "soft-white": "var(--brand-soft-white)",
          "mist-gray": "var(--brand-mist-gray)",
          "satin-silver": "var(--brand-satin-silver)",
          graphite: "var(--brand-graphite)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        body: ["var(--font-body)"],
      },
      fontSize: {
        "2xs": ["var(--text-2xs)", { lineHeight: "var(--leading-normal)" }],
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-normal)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-normal)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-snug)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-snug)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-tight)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--leading-tight)" }],
        "5xl": ["var(--text-5xl)", { lineHeight: "var(--leading-tight)" }],
        "6xl": ["var(--text-6xl)", { lineHeight: "var(--leading-tight)" }],
      },
      letterSpacing: {
        kicker: "var(--tracking-kicker)",
        display: "var(--tracking-display)",
        wide: "var(--tracking-wide)",
      },
      lineHeight: {
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      transitionTimingFunction: {
        "out-brand": "var(--ease-out)",
        standard: "var(--ease-standard)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        slow: "var(--motion-slow)",
      },
      borderWidth: {
        hairline: "var(--hairline-width)",
      },
    },
  },
  plugins: [],
};

export default config;
