/**
 * Demo clock and timezone helpers.
 *
 * The demo runs on a fixed clock so seed data, schedules and server/client
 * rendering always agree. Production would use the real clock and store all
 * instants in UTC, rendering them in each viewer's timezone.
 */

export const LAGOS_TZ = "Africa/Lagos";

/** Tuesday of week 7, First Term 2026/2027. */
export const DEMO_NOW = new Date("2026-10-27T10:00:00+01:00");

/** Monday 00:00 WAT of the demo week. */
export const DEMO_WEEK_START = new Date("2026-10-26T00:00:00+01:00");

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEKDAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

/** Build an ISO timestamp in WAT (+01:00) from a demo-week day offset and "HH:MM". */
export function watISO(dayOffset: number, hhmm: string) {
  const d = new Date(DEMO_WEEK_START.getTime() + dayOffset * 86_400_000);
  const [h, m] = hhmm.split(":").map(Number);
  d.setTime(d.getTime() + (h * 60 + m) * 60_000);
  return toWAT(d);
}

/** Serialise a Date as an ISO string with the fixed +01:00 WAT offset. */
export function toWAT(d: Date) {
  const shifted = new Date(d.getTime() + 60 * 60_000);
  return shifted.toISOString().replace(/\.\d{3}Z$/, "+01:00");
}

export function addMinutes(iso: string, minutes: number) {
  return toWAT(new Date(new Date(iso).getTime() + minutes * 60_000));
}

export function fmtTime(iso: string | Date, tz = LAGOS_TZ) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date(iso));
}

export function fmtDay(iso: string | Date, tz = LAGOS_TZ) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date(iso));
}

export function fmtDate(iso: string | Date, tz = LAGOS_TZ) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: tz }).format(new Date(iso));
}

export function fmtDateTime(iso: string | Date, tz = LAGOS_TZ) {
  return `${fmtDay(iso, tz)}, ${fmtTime(iso, tz)}`;
}

export function tzAbbrev(tz: string, at: Date = DEMO_NOW) {
  if (tz === LAGOS_TZ) return "WAT";
  // Friendly names for the zones the diaspora tutors use; Intl often returns "GMT+0"/"GMT-4".
  const off = tzOffsetMinutes(tz, at);
  if (tz === "Europe/London") return off === 60 ? "BST" : "GMT";
  if (tz === "America/Toronto" || tz === "America/New_York") return off === -240 ? "EDT" : "EST";
  const part = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? tz;
}

/** Minutes a timezone is ahead of UTC at a given instant. */
export function tzOffsetMinutes(tz: string, at: Date = DEMO_NOW) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUTC - Math.floor(at.getTime() / 60_000) * 60_000) / 60_000);
}

/**
 * Convert a wall-clock time in `tz` on demo-week day `dayOffset` (0 = Monday)
 * into an absolute instant expressed in WAT.
 */
export function zonedToWAT(dayOffset: number, hhmm: string, tz: string) {
  const watGuess = new Date(watISO(dayOffset, hhmm));
  const diff = tzOffsetMinutes(tz, watGuess) - 60; // minutes tz is ahead of WAT
  return toWAT(new Date(watGuess.getTime() - diff * 60_000));
}

export function overlaps(aStart: string, aMin: number, bStart: string, bMin: number) {
  const a0 = new Date(aStart).getTime();
  const b0 = new Date(bStart).getTime();
  return a0 < b0 + bMin * 60_000 && b0 < a0 + aMin * 60_000;
}

export function relativeToDemo(iso: string) {
  const diffMin = Math.round((new Date(iso).getTime() - DEMO_NOW.getTime()) / 60_000);
  const abs = Math.abs(diffMin);
  const unit = abs < 60 ? `${abs} min` : abs < 1440 ? `${Math.round(abs / 60)} h` : `${Math.round(abs / 1440)} d`;
  if (abs < 1) return "now";
  return diffMin > 0 ? `in ${unit}` : `${unit} ago`;
}

export function dayOffsetOf(iso: string) {
  return Math.floor((new Date(iso).getTime() - DEMO_WEEK_START.getTime()) / 86_400_000);
}
