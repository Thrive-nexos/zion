import type { Tutor } from "@/lib/domain/types";
import { DEMO_NOW, zonedToWAT } from "@/lib/time";

export interface Slot {
  startsAt: string; // ISO in WAT
  tutorLocal: string; // "17:00" in the tutor's own timezone
}

/**
 * Expands a tutor's weekly availability (expressed in their own timezone) into
 * concrete one-hour slots for the next `days` days, as absolute instants.
 */
export function slotsFor(t: Tutor, days = 14, minutes = 60): Slot[] {
  const out: Slot[] = [];
  for (let d = 0; d < days; d++) {
    const weekday = d % 7;
    for (const w of t.availability.filter((x) => x.day === weekday)) {
      const [sh, sm] = w.start.split(":").map(Number);
      const [eh, em] = w.end.split(":").map(Number);
      for (let m = sh * 60 + sm; m + minutes <= eh * 60 + em; m += 60) {
        const hhmm = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
        const startsAt = zonedToWAT(d, hhmm, t.timezone);
        if (new Date(startsAt).getTime() > DEMO_NOW.getTime() + 2 * 3_600_000) out.push({ startsAt, tutorLocal: hhmm });
      }
    }
  }
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
