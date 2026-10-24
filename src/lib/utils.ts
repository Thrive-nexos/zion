/** Small shared helpers. Everything here is pure and deterministic. */

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const ngnCompact = new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 });

export function naira(amount: number) {
  return ngn.format(Math.round(amount)).replace("NGN", "₦").replace(/\s/g, "");
}

export function nairaCompact(amount: number) {
  return `₦${ngnCompact.format(amount)}`;
}

/** Mulberry32 — deterministic PRNG so seed data is identical on server and client. */
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function initials(name: string) {
  return name
    .replace(/^(Mr|Mrs|Ms|Dr|Prof|Engr)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** WAEC-style grade letter for a total out of 100. */
export function waecGrade(total: number) {
  if (total >= 75) return "A1";
  if (total >= 70) return "B2";
  if (total >= 65) return "B3";
  if (total >= 60) return "C4";
  if (total >= 55) return "C5";
  if (total >= 50) return "C6";
  if (total >= 45) return "D7";
  if (total >= 40) return "E8";
  return "F9";
}
