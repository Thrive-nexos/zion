import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * LUMEN design tokens — "Danfo & Chalk".
 *
 * Derived from Lagos street colour rather than a template palette: danfo-bus yellow
 * and ink black as the brand pair, with Ankara-print brights (electric blue, Naija
 * green, hot pink, tangerine) on pure white. Shapes are sharp: small radii, ink
 * outlines and hard offset shadows instead of blur, glass or gradients.
 *
 * Token *names* are kept stable (iris, gold, azure…) so components didn't need to
 * change when the palette did; the values below are the source of truth. Tailwind
 * utilities use the hex values (so opacity modifiers work) and the same tokens are
 * emitted as CSS variables for inline SVG and canvas use.
 *
 * Tailwind v3 is used deliberately: v4's native engine is blocked by Windows
 * Application Control on the development machine, and v3 is pure JavaScript.
 */
const colors = {
  ink: "#111111",
  night: "#111111",
  "indigo-deep": "#1F5BFF",
  // primary action / link colour: electric blue
  iris: { DEFAULT: "#1F5BFF", 600: "#0A3FD6", soft: "#D2D2D2", wash: "#E7EDFF" },
  // learner accent: Naija green
  azure: { DEFAULT: "#00B85C", 600: "#007A3D", wash: "#DDF7E8" },
  // brand: danfo yellow
  gold: { DEFAULT: "#FFC800", 600: "#8A6400", wash: "#FFF3BF" },
  pink: { DEFAULT: "#FF3D8B", 600: "#C4135C", wash: "#FFE3EF" },
  tangerine: { DEFAULT: "#FF6A13", 600: "#B84200", wash: "#FFE8D9" },
  ivory: "#FFFFFF",
  paper: "#FFFFFF",
  sand: "#F2F2EF",
  line: "#111111",
  hair: "#E3E3DE",
  muted: "#55555A",
  body: "#1C1C1E",
  leaf: { DEFAULT: "#00994D", wash: "#DDF7E8" },
  ember: { DEFAULT: "#E5173F", wash: "#FFE1E6" },
  amber: { DEFAULT: "#A35200", wash: "#FFEBD1" },
};

function flatVars(obj: Record<string, string | Record<string, string>>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out[`--color-${k}`] = v;
    else for (const [s, c] of Object.entries(v)) out[s === "DEFAULT" ? `--color-${k}` : `--color-${k}-${s}`] = c;
  }
  return out;
}

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: ["var(--font-archivo)", "Arial Black", "system-ui", "sans-serif"],
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      // Sharp, deliberate corners. Pills (rounded-full) stay round.
      borderRadius: {
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
        xl: "6px",
        "2xl": "8px",
        "3xl": "10px",
      },
      boxShadow: {
        soft: "3px 3px 0 0 #111111",
        lift: "6px 6px 0 0 #111111",
        glow: "6px 6px 0 0 #FFC800",
        hard: "4px 4px 0 0 #111111",
      },
      transitionTimingFunction: { "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(255 200 0 / 0.9)" },
          "70%": { boxShadow: "0 0 0 12px rgb(255 200 0 / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(255 200 0 / 0)" },
        },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        float: { "0%, 100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(-8px) rotate(2deg)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        rise: "rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        float: "float 7s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
      },
      opacity: { 8: "0.08", 12: "0.12" },
    },
  },
  plugins: [
    plugin(({ addBase, addUtilities, addComponents }) => {
      addBase({ ":root": { ...flatVars(colors), "--ease-out-soft": "cubic-bezier(0.22, 1, 0.36, 1)" } });
      addUtilities({
        ".tabular": { fontVariantNumeric: "tabular-nums" },
        ".no-scrollbar": { scrollbarWidth: "none" },
        ".no-scrollbar::-webkit-scrollbar": { display: "none" },
        ".font-wide": { fontStretch: "118%" },
        ".press": { transition: "transform .12s ease, box-shadow .12s ease" },
        ".press:hover": { transform: "translate(-2px,-2px)", boxShadow: "6px 6px 0 0 #111111" },
        ".press:active": { transform: "translate(1px,1px)", boxShadow: "1px 1px 0 0 #111111" },
      });
      addComponents({
        ".container-page": {
          width: "100%", maxWidth: "80rem", marginInline: "auto", paddingInline: "1rem",
          "@media (min-width: 640px)": { paddingInline: "1.5rem" },
          "@media (min-width: 1024px)": { paddingInline: "2rem" },
        },
        // Formerly frosted glass; now a flat sticker panel — no blur.
        ".glass": { background: "#FFFFFF", border: "2px solid #111111", boxShadow: "4px 4px 0 0 #111111" },
        ".glass-dark": { background: "#1A1A1A", border: "2px solid rgb(255 255 255 / 0.18)" },
        ".skeleton": {
          background: `linear-gradient(90deg, ${colors.sand} 0%, #FAFAF7 50%, ${colors.sand} 100%)`,
          backgroundSize: "200% 100%", animation: "shimmer 1.6s linear infinite", borderRadius: "4px",
        },
        ".eyebrow": {
          fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontSize: "0.72rem", fontWeight: "600",
          letterSpacing: "0.08em", textTransform: "uppercase",
        },
      });
    }),
  ],
};

export default config;
