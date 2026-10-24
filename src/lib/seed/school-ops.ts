import type {
  AttendanceStatus, Branch, ClassGroup, FeeInvoice, GradeEntry, Invitation, Notice, ReportCard, SchoolApplication, Term, TimetableSlot,
} from "@/lib/domain/types";
import { hashString, prng } from "@/lib/utils";
import { STUDENTS } from "./people";
import { HOME_SCHOOL_ID } from "./schools";

const T = HOME_SCHOOL_ID;

export const BRANCHES: Branch[] = [
  { id: "br-lekki", tenantId: T, schoolId: T, name: "Lekki Campus", area: "Lekki Phase 1", city: "Lagos", principal: "Mrs Funke Adewale", students: 610 },
  { id: "br-yaba", tenantId: T, schoolId: T, name: "Yaba Campus", area: "Sabo, Yaba", city: "Lagos", principal: "Mr Uduak Bassey", students: 330 },
];

export const TERMS: Term[] = [
  { id: "term-2526-3", tenantId: T, name: "Third Term", session: "2025/2026", start: "2026-04-27T08:00:00+01:00", end: "2026-07-24T14:00:00+01:00", status: "closed", weeks: 13 },
  { id: "term-2627-1", tenantId: T, name: "First Term", session: "2026/2027", start: "2026-09-14T08:00:00+01:00", end: "2026-12-18T14:00:00+01:00", status: "current", weeks: 14 },
  { id: "term-2627-2", tenantId: T, name: "Second Term", session: "2026/2027", start: "2027-01-11T08:00:00+01:00", end: "2027-04-09T14:00:00+01:00", status: "planned", weeks: 13 },
];

export const CURRENT_TERM_ID = "term-2627-1";
export const PREVIOUS_TERM_ID = "term-2526-3";
export const CURRENT_WEEK = 7;

const PRIMARY_SUBJECTS = ["math", "eng", "bsc", "yor", "civ", "art", "comp"];
const JUNIOR_SUBJECTS = ["math", "eng", "bsc", "comp", "yor", "fre", "civ", "art"];
const SENIOR_SUBJECTS = ["math", "eng", "phy", "chem", "bio", "comp", "econ", "civ"];

export const CLASSES: ClassGroup[] = [
  {
    id: "cls-p4", tenantId: T, branchId: "br-yaba", name: "Primary 4 Coral", level: "Primary 4", ageBand: "kids", formTeacherId: "stf-ese", room: "Y-12",
    subjectTeachers: { math: "stf-ese", eng: "stf-ese", bsc: "stf-ese", yor: "stf-bisi", civ: "stf-ese", art: "stf-femi", comp: "stf-yakubu" },
  },
  {
    id: "cls-p5", tenantId: T, branchId: "br-lekki", name: "Primary 5 Blue", level: "Primary 5", ageBand: "kids", formTeacherId: "stf-ronke", room: "L-08",
    subjectTeachers: { math: "stf-ronke", eng: "stf-ronke", bsc: "stf-ronke", yor: "stf-bisi", civ: "stf-ronke", art: "stf-femi", comp: "stf-yakubu" },
  },
  {
    id: "cls-jss1", tenantId: T, branchId: "br-lekki", name: "JSS 1 Green", level: "JSS 1", ageBand: "teens", formTeacherId: "stf-kelechi", room: "L-21",
    subjectTeachers: { math: "stf-halima", eng: "stf-seun", bsc: "stf-ifeoma", comp: "stf-yakubu", yor: "stf-bisi", fre: "stf-chiamaka", civ: "stf-kelechi", art: "stf-femi" },
  },
  {
    // Mathematics is unassigned after a staff change — the guided walkthrough fixes it.
    id: "cls-jss3", tenantId: T, branchId: "br-lekki", name: "JSS 3 Gold", level: "JSS 3", ageBand: "teens", formTeacherId: "stf-seun", room: "L-27",
    subjectTeachers: { math: null, eng: "stf-seun", bsc: "stf-ifeoma", comp: "stf-yakubu", yor: "stf-bisi", fre: "stf-chiamaka", civ: "stf-kelechi", art: "stf-femi" },
  },
  {
    id: "cls-ss1", tenantId: T, branchId: "br-lekki", name: "SS 1 Science", level: "SS 1", ageBand: "teens", formTeacherId: "stf-grace", room: "L-33",
    subjectTeachers: { math: "stf-halima", eng: "stf-seun", phy: "stf-tunde", chem: "stf-grace", bio: "stf-ifeoma", comp: "stf-yakubu", econ: "stf-kelechi", civ: "stf-kelechi" },
  },
];

export const classSubjects = (c: ClassGroup) => Object.keys(c.subjectTeachers);

const PERIODS = [
  ["08:00", "08:40"], ["08:40", "09:20"], ["09:20", "10:00"], ["10:20", "11:00"],
  ["11:00", "11:40"], ["11:40", "12:20"], ["12:50", "13:30"], ["13:30", "14:10"],
] as const;

export const PERIOD_TIMES = PERIODS;

function buildTimetable(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  for (const c of CLASSES) {
    const subjects = c.level.startsWith("Primary") ? PRIMARY_SUBJECTS : c.level.startsWith("JSS") ? JUNIOR_SUBJECTS : SENIOR_SUBJECTS;
    const rand = prng(hashString(c.id));
    for (let day = 0 as TimetableSlot["day"]; day < 5; day = (day + 1) as TimetableSlot["day"]) {
      const periods = c.level.startsWith("Primary") ? 7 : 8;
      for (let p = 0; p < periods; p++) {
        // Maths and English every day in the first two periods; the rest rotate.
        const subjectId = p === 0 ? "math" : p === 1 ? "eng" : subjects[2 + Math.floor(rand() * (subjects.length - 2))];
        slots.push({ id: `tt-${c.id}-${day}-${p}`, tenantId: T, classId: c.id, day, period: p, start: PERIODS[p][0], end: PERIODS[p][1], subjectId });
      }
    }
  }
  return slots;
}

export const TIMETABLE = buildTimetable();

/** School days (Mon–Fri) from the start of term up to the demo date, excluding the mid-term break. */
export function schoolDaysSoFar(): string[] {
  const days: string[] = [];
  const start = new Date("2026-09-14T12:00:00+01:00");
  const end = new Date("2026-10-27T12:00:00+01:00");
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    const iso = d.toISOString().slice(0, 10);
    if (wd === 0 || wd === 6) continue;
    if (iso === "2026-10-01") continue; // Independence Day
    if (iso >= "2026-10-15" && iso <= "2026-10-16") continue; // mid-term break
    days.push(iso);
  }
  return days;
}

/** Deterministic historical attendance; the current day is recorded in the live store instead. */
export function historicalAttendance(studentId: string, date: string): AttendanceStatus {
  const r = prng(hashString(studentId + date))();
  const reliability = studentId === "stu-chidera" ? 0.985 : studentId === "stu-tolu" ? 0.97 : 0.93;
  if (r < reliability) return r < reliability - 0.04 ? "present" : "late";
  return r > 0.995 ? "excused" : "absent";
}

function buildGrades(): GradeEntry[] {
  const out: GradeEntry[] = [];
  for (const s of STUDENTS.filter((x) => x.tenantId === T)) {
    const cls = CLASSES.find((c) => c.id === s.classId)!;
    const rand = prng(hashString(s.id + "grades"));
    const ability = s.id === "stu-chidera" ? 0.74 : s.id === "stu-tolu" ? 0.8 : 0.45 + rand() * 0.45;
    for (const subjectId of classSubjects(cls)) {
      const lift = s.id === "stu-chidera" && subjectId === "math" ? -0.12 : 0; // the reason for a tutor
      const a = Math.max(0.25, Math.min(0.98, ability + lift + (rand() - 0.5) * 0.18));
      const prev = {
        ca1: Math.round(20 * Math.min(1, a + (rand() - 0.5) * 0.15)),
        ca2: Math.round(20 * Math.min(1, a + (rand() - 0.5) * 0.15)),
        exam: Math.round(60 * Math.min(1, a + (rand() - 0.5) * 0.12)),
      };
      out.push({ id: `gr-${s.id}-${subjectId}-prev`, tenantId: T, studentId: s.id, subjectId, termId: PREVIOUS_TERM_ID, ...prev });
      out.push({
        id: `gr-${s.id}-${subjectId}-cur`, tenantId: T, studentId: s.id, subjectId, termId: CURRENT_TERM_ID,
        ca1: Math.round(20 * Math.min(1, a + 0.04 + (rand() - 0.5) * 0.15)),
        ca2: null,
        exam: null,
      });
    }
  }
  return out;
}

export const GRADES = buildGrades();

export const REPORT_CARDS: ReportCard[] = STUDENTS.filter((s) => s.tenantId === T).flatMap((s) => [
  {
    id: `rc-${s.id}-prev`, tenantId: T, studentId: s.id, termId: PREVIOUS_TERM_ID, status: "published" as const,
    formTeacherComment: s.id === "stu-chidera"
      ? "Chidera is a thoughtful, articulate student. Algebra needs steady practice; strong leadership in group work."
      : "A steady term with good participation. Keep reading every day.",
    principalComment: "Promoted. Well done.",
  },
  {
    id: `rc-${s.id}-cur`, tenantId: T, studentId: s.id, termId: CURRENT_TERM_ID, status: "draft" as const,
    formTeacherComment: "", principalComment: "",
  },
]);

export const FEE_SCHEDULE: Record<string, { label: string; amount: number }[]> = {
  primary: [
    { label: "Tuition", amount: 520_000 },
    { label: "Learning resources & devices", amount: 45_000 },
    { label: "Lunch programme", amount: 85_000 },
  ],
  secondary: [
    { label: "Tuition", amount: 780_000 },
    { label: "Lab & ICT levy", amount: 60_000 },
    { label: "Learning resources & devices", amount: 55_000 },
    { label: "Lunch programme", amount: 95_000 },
  ],
};

function buildInvoices(): FeeInvoice[] {
  return STUDENTS.filter((s) => s.tenantId === T).map((s) => {
    const items = s.classId?.startsWith("cls-p") ? FEE_SCHEDULE.primary : FEE_SCHEDULE.secondary;
    const total = items.reduce((a, b) => a + b.amount, 0);
    const r = prng(hashString(s.id + "fees"))();
    const paid = s.id === "stu-chidera" ? total : s.id === "stu-tolu" ? Math.round(total * 0.6) : r < 0.68 ? total : r < 0.88 ? Math.round(total * 0.5) : 0;
    return { id: `inv-${s.id}`, tenantId: T, studentId: s.id, termId: CURRENT_TERM_ID, items, paid, dueDate: "2026-10-30T23:59:00+01:00" };
  });
}

export const INVOICES = buildInvoices();

export const NOTICES: Notice[] = [
  {
    id: "ntc-1", tenantId: T, audience: "everyone", title: "Inter-school quiz: Round 2 this Friday",
    body: "Our JSS 3 and SS 1 teams compete online from the ICT lab at 11:00. Guardians have consented for all 8 team members. Results are verified before publication.",
    publishedAt: "2026-10-26T08:10:00+01:00", pinned: true, author: "Mr Babatunde Coker",
  },
  {
    id: "ntc-2", tenantId: T, audience: "guardians", title: "Mid-term reports are ready",
    body: "First CA scores for all subjects are now visible in the guardian portal. Second CA runs in week 9.",
    publishedAt: "2026-10-22T15:00:00+01:00", pinned: false, author: "Academic Office",
  },
  {
    id: "ntc-3", tenantId: T, audience: "staff", title: "Safeguarding refresher: Thursday 14:30",
    body: "All staff, including new hires, attend the termly safeguarding refresher in the Lekki hall. 45 minutes.",
    publishedAt: "2026-10-21T09:00:00+01:00", pinned: false, author: "Designated Safeguarding Lead",
  },
  {
    id: "ntc-4", tenantId: T, audience: "learners", title: "Coding club moves to Wednesdays",
    body: "Scratch (Primary) and Python (JSS) clubs now meet on Wednesdays after school, 14:20–15:20.",
    publishedAt: "2026-10-19T12:00:00+01:00", pinned: false, author: "Mr Yakubu Danjuma",
  },
];

export const INVITATIONS: Invitation[] = [
  {
    id: "inv-001", tenantId: T, studentId: "stu-jss3-17", guardianName: "Guardian of new JSS 3 learner", guardianContactMasked: "o•••••@mail.example",
    channel: "email", status: "sent", code: "IRK-7Q4M", sentAt: "2026-10-23T10:00:00+01:00", acceptedAt: null,
  },
];

export const SCHOOL_APPLICATIONS: SchoolApplication[] = [
  {
    id: "sapp-coral", schoolId: "sch-coral-bay", submittedAt: "2026-10-12T11:00:00+01:00", status: "site_visit",
    checklist: [
      { label: "Approval to operate (state ministry) (reference recorded)", done: true },
      { label: "CAC registration (reference recorded)", done: true },
      { label: "Safeguarding policy reviewed", done: true },
      { label: "Designated Safeguarding Lead named", done: true },
      { label: "Site visit (simulated)", done: false },
    ],
    note: "Site visit booked for 29 Oct (simulated).",
  },
  {
    id: "sapp-brass", schoolId: "sch-brass-compass", submittedAt: "2026-10-20T09:30:00+01:00", status: "pending",
    checklist: [
      { label: "Approval to operate (state ministry) (reference recorded)", done: true },
      { label: "CAC registration (reference recorded)", done: true },
      { label: "Safeguarding policy reviewed", done: false },
      { label: "Designated Safeguarding Lead named", done: true },
      { label: "Site visit (simulated)", done: false },
    ],
    note: null,
  },
  {
    id: "sapp-ember", schoolId: "sch-ember-oak", submittedAt: "2026-10-24T16:45:00+01:00", status: "pending",
    checklist: [
      { label: "Approval to operate (state ministry) (reference recorded)", done: true },
      { label: "CAC registration (reference recorded)", done: false },
      { label: "Safeguarding policy reviewed", done: false },
      { label: "Designated Safeguarding Lead named", done: false },
      { label: "Site visit (simulated)", done: false },
    ],
    note: null,
  },
  {
    id: "sapp-lakeshore", schoolId: "sch-lakeshore-light", submittedAt: "2026-10-18T13:15:00+01:00", status: "pending",
    checklist: [
      { label: "Approval to operate (state ministry) (reference recorded)", done: true },
      { label: "CAC registration (reference recorded)", done: true },
      { label: "Safeguarding policy reviewed", done: true },
      { label: "Designated Safeguarding Lead named", done: true },
      { label: "Site visit (simulated)", done: false },
    ],
    note: "Remote verification requested due to travel advisories.",
  },
];
