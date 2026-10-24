import { cn, hashString, initials } from "@/lib/utils";

/**
 * Generated geometric portrait. The demo never uses photos of real people for
 * fictional tutors, staff or learners — these are original, deterministic art.
 */
const SWATCHES = ["#FFC800", "#1F5BFF", "#00B85C", "#FF3D8B", "#FF6A13", "#8B5CF6", "#00B3C7"];

/**
 * Generated portrait tile. The demo never uses photos of real people for
 * fictional tutors, staff or learners — these are original, deterministic marks:
 * a flat swatch, an ink keyline and one geometric cut, like a printed name badge.
 */
export function Avatar({ name, hue, size = 40, className, ring }: { name: string; hue?: number; size?: number; className?: string; ring?: boolean }) {
  const seed = hashString(name);
  const bg = SWATCHES[(hue !== undefined ? Math.round(hue / 52) : seed) % SWATCHES.length];
  const darkText = bg === "#FFC800" || bg === "#00B85C" || bg === "#00B3C7" || bg === "#FF6A13";
  const shape = seed % 3;
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink", ring && "shadow-hard", className)}
      style={{ width: size, height: size, background: bg }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
        {shape === 0 && <circle cx="34" cy="6" r="10" fill="#fff" opacity="0.35" />}
        {shape === 1 && <path d="M0 31 L40 22 L40 40 L0 40Z" fill="#111" opacity="0.12" />}
        {shape === 2 && <rect x="26" y="-4" width="14" height="14" transform="rotate(20 33 3)" fill="#fff" opacity="0.35" />}
      </svg>
      <span className={cn("relative font-black", darkText ? "text-ink" : "text-white")} style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </span>
    </span>
  );
}
