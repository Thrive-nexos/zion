import type {
  Appeal, Approval, Assignment, AttendanceRecord, AuditEvent, BlockRecord, Booking, Branch, ClassGroup, ContentItem, Dispute, Expense,
  FeeInvoice, GradeEntry, Invitation, LearnerProgress, LedgerEntry, Message, MessageThread, Notice, ReportCard, SafetyReport, School,
  SchoolApplication, Staff, Student, TestAttempt, Tournament, Tutor, TutorApplication,
} from "@/lib/domain/types";
import { watISO } from "@/lib/time";
import { APPEALS, APPROVALS, AUDIT_SEED, CONTENT, DISPUTES, EXPENSES, MESSAGES, REPORTS, THREADS, TOURNAMENTS } from "./community";
import { EARNED_ACHIEVEMENTS, PROGRESS, TEST_ATTEMPTS } from "./learning";
import { STAFF, STUDENTS } from "./people";
import { BRANCHES, CLASSES, GRADES, INVITATIONS, INVOICES, NOTICES, REPORT_CARDS, SCHOOL_APPLICATIONS } from "./school-ops";
import { HOME_SCHOOL_ID, SCHOOLS } from "./schools";
import { BOOKINGS, PAYOUT_SEED, TUTOR_APPLICATIONS, TUTORS, ledgerFromBookings } from "./tutors";

export const STATE_VERSION = 3;

export interface FeePayment { id: string; invoiceId: string; amount: number; at: string; method: "demo_card" | "demo_transfer"; reference: string }
export interface LiveJoin { liveClassId: string; studentId: string; at: string }
export interface Enrollment { studentId: string; courseId: string; at: string; via: "school" | "guardian_approved" | "self" }
export interface TourState { active: boolean; step: number; startedAt: number | null; completed: boolean }

export interface DemoState {
  version: number;
  personaId: string;
  tick: number;
  schools: School[];
  schoolApplications: SchoolApplication[];
  branches: Branch[];
  classes: ClassGroup[];
  staff: Staff[];
  students: Student[];
  invitations: Invitation[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  grades: GradeEntry[];
  reportCards: ReportCard[];
  notices: Notice[];
  invoices: FeeInvoice[];
  feePayments: FeePayment[];
  progress: LearnerProgress[];
  attempts: TestAttempt[];
  liveJoins: LiveJoin[];
  earned: Record<string, string[]>;
  enrollments: Enrollment[];
  tutors: Tutor[];
  bookings: Booking[];
  ledger: LedgerEntry[];
  tutorApplications: TutorApplication[];
  myApplicationId: string | null;
  approvals: Approval[];
  expenses: Expense[];
  threads: MessageThread[];
  messages: Message[];
  reports: SafetyReport[];
  blocks: BlockRecord[];
  tournaments: Tournament[];
  appeals: Appeal[];
  content: ContentItem[];
  disputes: Dispute[];
  audit: AuditEvent[];
  onboarded: Partial<Record<string, { at: string; summary: string }>>;
  tour: TourState;
}

const T = HOME_SCHOOL_ID;

const ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-jss3-math-1", tenantId: T, classId: "cls-jss3", courseId: "c-jss3-math", subjectId: "math", title: "Elimination practice set A",
    brief: "Questions 1–10 on page 112. Show every step. Photos of written work are fine.", setBy: "stf-halima", dueAt: watISO(3, "18:00"), maxScore: 20,
    submissions: STUDENTS.filter((s) => s.classId === "cls-jss3").map((s, i) => ({
      studentId: s.id, submittedAt: i % 3 === 0 ? watISO(0, "19:00") : null, status: i % 3 === 0 ? "submitted" : "not_started", score: null, feedback: null,
    })),
  },
  {
    id: "asg-jss3-eng-1", tenantId: T, classId: "cls-jss3", courseId: null, subjectId: "eng", title: "Essay: a leader in my community",
    brief: "350–450 words. Plan, draft, then edit for concord.", setBy: "stf-seun", dueAt: watISO(-2, "18:00"), maxScore: 30,
    submissions: STUDENTS.filter((s) => s.classId === "cls-jss3").map((s, i) => ({
      studentId: s.id, submittedAt: watISO(-3, "20:00"), status: "graded", score: s.id === "stu-chidera" ? 27 : 16 + (i % 12), feedback: s.id === "stu-chidera" ? "Excellent structure and voice." : "Good effort, watch your tenses.",
    })),
  },
  {
    id: "asg-ss1-math-1", tenantId: T, classId: "cls-ss1", courseId: null, subjectId: "math", title: "Indices and logarithms worksheet",
    brief: "Complete all 12 questions. Calculators allowed for 9–12 only.", setBy: "stf-halima", dueAt: watISO(1, "18:00"), maxScore: 24,
    submissions: STUDENTS.filter((s) => s.classId === "cls-ss1").map((s, i) => ({
      studentId: s.id, submittedAt: i % 2 === 0 ? watISO(0, "21:00") : null, status: i % 2 === 0 ? "submitted" : "not_started", score: null, feedback: null,
    })),
  },
  {
    id: "asg-p5-num-1", tenantId: T, classId: "cls-p5", courseId: "c-p5-num", subjectId: "math", title: "Fraction pizza drawing",
    brief: "Draw a pizza and colour 3/4 of it. Ask a grown-up to help you upload a photo.", setBy: "stf-ronke", dueAt: watISO(2, "18:00"), maxScore: 10,
    submissions: STUDENTS.filter((s) => s.classId === "cls-p5").map((s) => ({ studentId: s.id, submittedAt: null, status: "not_started", score: null, feedback: null })),
  },
  {
    id: "asg-py-1", tenantId: "platform", classId: null, courseId: "c-py-ds", subjectId: "comp", title: "Implement a queue with two stacks",
    brief: "Submit a short Python file and a paragraph on its complexity.", setBy: "Dr Musa Abdullahi", dueAt: watISO(4, "23:59"), maxScore: 20,
    submissions: [{ studentId: "stu-ibrahim", submittedAt: null, status: "not_started", score: null, feedback: null }],
  },
];

export function buildSeed(): DemoState {
  const clone = <V,>(v: V): V => JSON.parse(JSON.stringify(v));
  return {
    version: STATE_VERSION,
    personaId: "p-adaeze",
    tick: 0,
    schools: clone(SCHOOLS),
    schoolApplications: clone(SCHOOL_APPLICATIONS),
    branches: clone(BRANCHES),
    classes: clone(CLASSES),
    staff: clone(STAFF),
    students: clone(STUDENTS),
    invitations: clone(INVITATIONS),
    attendance: [],
    assignments: clone(ASSIGNMENTS),
    grades: clone(GRADES),
    reportCards: clone(REPORT_CARDS),
    notices: clone(NOTICES),
    invoices: clone(INVOICES),
    feePayments: [],
    progress: clone(PROGRESS),
    attempts: clone(TEST_ATTEMPTS),
    liveJoins: [],
    earned: clone(EARNED_ACHIEVEMENTS),
    enrollments: [
      { studentId: "stu-tolu", courseId: "c-scratch", at: "2026-09-20T12:00:00+01:00", via: "guardian_approved" },
      { studentId: "stu-ibrahim", courseId: "c-py-ds", at: "2026-09-02T12:00:00+01:00", via: "self" },
      { studentId: "stu-ibrahim", courseId: "c-calc", at: "2026-09-02T12:00:00+01:00", via: "self" },
      { studentId: "stu-aisha", courseId: "c-med-safety", at: "2026-10-12T12:00:00+01:00", via: "self" },
      { studentId: "stu-aisha", courseId: "c-bls", at: "2026-10-12T12:00:00+01:00", via: "self" },
    ],
    tutors: clone(TUTORS),
    bookings: clone(BOOKINGS),
    ledger: [...ledgerFromBookings(BOOKINGS), ...PAYOUT_SEED],
    tutorApplications: clone(TUTOR_APPLICATIONS),
    myApplicationId: null,
    approvals: clone(APPROVALS),
    expenses: clone(EXPENSES),
    threads: clone(THREADS),
    messages: clone(MESSAGES),
    reports: clone(REPORTS),
    blocks: [],
    tournaments: clone(TOURNAMENTS),
    appeals: clone(APPEALS),
    content: clone(CONTENT),
    disputes: clone(DISPUTES),
    audit: clone(AUDIT_SEED),
    onboarded: {},
    tour: { active: false, step: 0, startedAt: null, completed: false },
  };
}

export { HOME_SCHOOL_ID };
