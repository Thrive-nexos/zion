/** Pure, derived reads over demo state. These mirror the read-model queries a real API would expose. */
import type { AttendanceStatus, Booking, Course, LiveClass, Student, Tournament, WeeklyTest } from "@/lib/domain/types";
import type { DemoState } from "@/lib/seed";
import { COURSES, LIVE_CLASSES, WEEKLY_TESTS, courseById } from "@/lib/seed/learning";
import { classSubjects, CURRENT_TERM_ID, historicalAttendance, schoolDaysSoFar, TIMETABLE } from "@/lib/seed/school-ops";
import { DEMO_NOW } from "@/lib/time";
import { waecGrade } from "@/lib/utils";

export const TODAY = "2026-10-27";

export const studentById = (s: DemoState, id: string) => s.students.find((x) => x.id === id);
export const staffById = (s: DemoState, id: string | null) => (id ? s.staff.find((x) => x.id === id) : undefined);
export const classById = (s: DemoState, id: string | null) => (id ? s.classes.find((c) => c.id === id) : undefined);
export const tutorOf = (s: DemoState, id: string) => s.tutors.find((t) => t.id === id);
export const schoolById = (s: DemoState, id: string | null) => (id ? s.schools.find((x) => x.id === id) : undefined);

export function teacherFor(s: DemoState, classId: string | null, subjectId: string) {
  const c = classById(s, classId);
  return staffById(s, c?.subjectTeachers[subjectId] ?? null);
}

/** Host shown for a live class: for school classes it follows the live teacher assignment. */
export function liveHost(s: DemoState, lc: LiveClass) {
  if (lc.classId && lc.courseId) {
    const course = courseById(lc.courseId);
    const t = course ? teacherFor(s, lc.classId, course.subjectId) : undefined;
    if (t) return t.name;
  }
  return lc.host;
}

/** School-linked courses arrive automatically; others come from approved enrolments. */
export function coursesFor(s: DemoState, student: Student): { course: Course; via: "school" | "enrolled" }[] {
  const out: { course: Course; via: "school" | "enrolled" }[] = [];
  for (const c of COURSES) {
    if (c.provider.type === "school" && student.classId && c.provider.classIds.includes(student.classId) && c.provider.tenantId === student.tenantId) {
      out.push({ course: c, via: "school" });
    }
  }
  for (const e of s.enrollments.filter((e) => e.studentId === student.id)) {
    const c = courseById(e.courseId);
    if (c && !out.some((o) => o.course.id === c.id)) out.push({ course: c, via: "enrolled" });
  }
  return out;
}

export function liveClassesFor(s: DemoState, student: Student) {
  const courseIds = new Set(coursesFor(s, student).map((c) => c.course.id));
  return LIVE_CLASSES.filter((lc) => (lc.courseId && courseIds.has(lc.courseId)) || (lc.classId && lc.classId === student.classId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function testsFor(s: DemoState, student: Student): WeeklyTest[] {
  const courseIds = new Set(coursesFor(s, student).map((c) => c.course.id));
  return WEEKLY_TESTS.filter((t) => t.courseId && courseIds.has(t.courseId));
}

export function testIsOpen(t: WeeklyTest) {
  return new Date(t.opensAt).getTime() <= DEMO_NOW.getTime();
}

export function attemptLabel(testId: string) {
  const m = testId.match(/w(\d+)-(\d)$/);
  return m ? { week: Number(m[1]), slot: Number(m[2]) as 1 | 2 } : { week: 0, slot: 1 as const };
}

/** Two checks per week, newest first: [{week, slot1, slot2}] */
export function weeklySummary(s: DemoState, studentId: string) {
  const byWeek = new Map<number, { week: number; slot1?: { score: number; total: number }; slot2?: { score: number; total: number } }>();
  for (const a of s.attempts.filter((x) => x.studentId === studentId)) {
    const { week, slot } = attemptLabel(a.testId);
    const row = byWeek.get(week) ?? { week };
    row[slot === 1 ? "slot1" : "slot2"] = { score: a.score, total: a.total };
    byWeek.set(week, row);
  }
  return [...byWeek.values()].sort((a, b) => b.week - a.week);
}

export function lessonProgress(s: DemoState, studentId: string, course: Course) {
  const p = s.progress.find((x) => x.studentId === studentId && x.courseId === course.id);
  const done = p?.completedLessonIds.length ?? 0;
  return { done, total: course.lessons.length, pct: Math.round((done / course.lessons.length) * 100), completed: new Set(p?.completedLessonIds ?? []) };
}

export function attendanceFor(s: DemoState, studentId: string) {
  const days = schoolDaysSoFar();
  const counts: Record<AttendanceStatus, number> = { present: 0, late: 0, absent: 0, excused: 0 };
  const recent: { date: string; status: AttendanceStatus }[] = [];
  for (const d of days) {
    const live = s.attendance.find((a) => a.studentId === studentId && a.date === d);
    const st = live?.status ?? (d === TODAY ? null : historicalAttendance(studentId, d));
    if (!st) continue;
    counts[st]++;
    recent.push({ date: d, status: st });
  }
  const total = counts.present + counts.late + counts.absent + counts.excused;
  return { counts, total, rate: total ? Math.round(((counts.present + counts.late) / total) * 100) : 100, recent: recent.slice(-15) };
}

export function classAttendanceRate(s: DemoState, classId: string) {
  const kids = s.students.filter((x) => x.classId === classId);
  const rates = kids.map((k) => attendanceFor(s, k.id).rate);
  return rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
}

export function gradeRows(s: DemoState, studentId: string, termId = CURRENT_TERM_ID) {
  return s.grades
    .filter((g) => g.studentId === studentId && g.termId === termId)
    .map((g) => {
      const total = (g.ca1 ?? 0) + (g.ca2 ?? 0) + (g.exam ?? 0);
      const complete = g.ca1 !== null && g.ca2 !== null && g.exam !== null;
      return { ...g, total, complete, grade: complete ? waecGrade(total) : null, caPct: Math.round((((g.ca1 ?? 0) + (g.ca2 ?? 0)) / ((g.ca1 !== null ? 20 : 0) + (g.ca2 !== null ? 20 : 0) || 1)) * 100) };
    });
}

export function studentAverage(s: DemoState, studentId: string, termId = CURRENT_TERM_ID) {
  const rows = gradeRows(s, studentId, termId);
  if (!rows.length) return 0;
  const complete = rows.filter((r) => r.complete);
  if (complete.length === rows.length) return Math.round(complete.reduce((a, r) => a + r.total, 0) / complete.length);
  return Math.round(rows.reduce((a, r) => a + r.caPct, 0) / rows.length);
}

export function timetableFor(classId: string) {
  return TIMETABLE.filter((t) => t.classId === classId);
}

export function teacherClasses(s: DemoState, staffId: string) {
  return s.classes.filter((c) => Object.values(c.subjectTeachers).includes(staffId) || c.formTeacherId === staffId);
}

export function unassignedSubjects(s: DemoState) {
  return s.classes.flatMap((c) => classSubjects(c).filter((sub) => !c.subjectTeachers[sub]).map((sub) => ({ classId: c.id, subjectId: sub })));
}

// ── Tutors & bookings ──

export function ledgerFor(s: DemoState, tutorId: string) {
  const entries = s.ledger.filter((l) => l.tutorId === tutorId).sort((a, b) => b.at.localeCompare(a.at));
  const sum = (f: (l: (typeof entries)[number]) => boolean) => entries.filter(f).reduce((a, l) => a + l.amount, 0);
  return {
    entries,
    available: sum((l) => l.status === "available"),
    pending: sum((l) => l.status === "pending"),
    paidOut: -sum((l) => l.kind === "payout"),
    lifetimeGross: sum((l) => l.kind === "session_earning" || l.kind === "adjustment"),
  };
}

export function hoursTaught(bookings: Booking[]) {
  return bookings.filter((b) => b.status === "completed").reduce((a, b) => a + (b.attendance?.minutes ?? b.minutes) / 60, 0);
}

export function bookingsForStudent(s: DemoState, studentId: string) {
  return s.bookings.filter((b) => b.studentId === studentId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

// ── Competitions ──

export function leaderboard(s: DemoState, t: Tournament, divisionId: string, includeUnverified = false) {
  const rows = new Map<string, { schoolId: string; points: number; verified: boolean; rounds: number }>();
  for (const r of t.results.filter((x) => x.divisionId === divisionId)) {
    if (!includeUnverified && !r.verified) continue;
    const row = rows.get(r.schoolId) ?? { schoolId: r.schoolId, points: 0, verified: true, rounds: 0 };
    row.points += r.accuracy + r.speedBonus - r.penalties;
    row.verified = row.verified && r.verified;
    row.rounds++;
    rows.set(r.schoolId, row);
  }
  return [...rows.values()]
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1, school: schoolById(s, r.schoolId)! }));
}
