/**
 * Design Tokens — Single source of truth for the entire design system.
 * Import as `import { T } from '@/config/tokens'` or relative path.
 */
export const T = {
  // ── Brand oranges ──
  orange900: "#5f250f",
  orange800: "#7c2d12",
  orange700: "#9a3412",
  orange600: "#c2410c",
  orange500: "#ea580c",
  orange400: "#fb923c",
  orange300: "#fdba74",
  orange200: "#fed7aa",
  orange100: "#ffedd5",
  orange50: "#fff7ed",

  // ── Warm creams ──
  cream50: "#fffdf9",
  cream100: "#fffaf5",
  cream200: "#fff4ea",
  cream300: "#fff1e6",
  cream400: "#ffe4cf",
  cream500: "#fde2cc",
  cream600: "#fde4d3",
  cream700: "#fdc9a3",

  // ── Text ──
  text: "#5b4d43",
  textDark: "#7c2d12",
  textMuted: "#7c6f64",
  white: "#ffffff",
  black: "#111827",

  // ── Semantic status ──
  red500: "#dc2626",
  red100: "#fee2e2",
  redBorder: "#ef4444",
  redText: "#991b1b",

  yellow500: "#d97706",
  yellow100: "#fef3c7",
  yellowBorder: "#f59e0b",
  yellowText: "#92400e",

  green500: "#65a30d",
  green100: "#ecfccb",
  greenBorder: "#84cc16",
  greenText: "#3f6212",

  // ── Typography ──
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",

  // ── Border radius ──
  r: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "22px",
    xl: "28px",
    pill: "999px",
  },

  // ── Shadows ──
  s: {
    xxs: "0 1px 2px rgba(124,45,18,.02)",
    xs: "0 1px 4px rgba(124,45,18,.04)",
    sm: "0 3px 10px rgba(124,45,18,.05)",
    md: "0 8px 28px rgba(124,45,18,.07)",
    lg: "0 18px 52px rgba(124,45,18,.09)",
    xl: "0 28px 72px rgba(194,65,12,.14)",
    glow: "0 0 0 3px rgba(234,88,12,.12)",
    inner: "inset 0 2px 4px rgba(124,45,18,.05)",
    glass: "0 8px 32px rgba(0,0,0,.12)",
  },
};
