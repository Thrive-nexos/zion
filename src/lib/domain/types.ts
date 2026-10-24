/**
 * LUMEN LEARN domain model.
 *
 * These types mirror the planned PostgreSQL schema (see docs/ARCHITECTURE.md).
 * Every tenant-owned record carries `tenantId` so that row-level security can
 * scope it to one school; platform-wide records (tutors, tournaments) use the
 * platform tenant `"platform"`.
 */

export type ID = string;
export type ISODate = string; // ISO-8601 with offset, e.g. 2026-10-27T10:00:00+01:00
export type TenantId = ID | "platform";

// ───────────────────────── Identity & access ─────────────────────────

export type Role = "learner" | "guardian" | "school_admin" | "teacher" | "tutor" | "platform_admin";

export type AgeBand = "kids" | "teens" | "university" | "adults" | "professionals";

export interface Persona {
  id: ID;
  role: Role;
  name: string;
  shortName: string;
  title: string;
  tenantId: TenantId;
  /** Linked record id: student / guardian / staff / tutor / admin. */
  subjectId: ID;
  city: string;
  blurb: string;
}

// ───────────────────────── Schools (tenants) ─────────────────────────

export type Curriculum = "Nigerian (NERDC)" | "British (Cambridge)" | "American" | "Montessori" | "IB" | "Blended";
export type SchoolType = "Primary" | "Secondary" | "Primary & Secondary" | "Nursery & Primary";
export type Facility =
  | "Science labs" | "ICT lab" | "Library" | "Sports field" | "Swimming pool" | "Music studio"
  | "Art studio" | "Boarding" | "School bus" | "Sick bay & nurse" | "Solar backup" | "Accessible ramps";

export type SchoolVerification = "not_started" | "documents_submitted" | "site_visit_scheduled" | "verified" | "rejected";

export interface SchoolScores {
  academics: number; // 0–100, from sample exam-readiness data
  safeguarding: number;
  facilities: number;
  teaching: number;
  parentVoice: number;
}

export interface School {
  id: ID;
  tenantId: ID;
  slug: string;
  name: string;
  motto: string;
  city: string;
  state: string;
  area: string;
  type: SchoolType;
  curricula: Curriculum[];
  facilities: Facility[];
  feeRangeNGN: [number, number]; // per term
  founded: number;
  students: number;
  studentsPerTeacher: number;
  verification: SchoolVerification;
  scores: SchoolScores;
  /** Position on the stylised Nigeria map (0–100 viewBox units). */
  map: { x: number; y: number };
  accent: string;
  onPlatform: boolean;
  competitionOptIn: boolean;
  description: string;
}

export interface Branch {
  id: ID;
  tenantId: ID;
  schoolId: ID;
  name: string;
  area: string;
  city: string;
  principal: string;
  students: number;
}

export interface Term {
  id: ID;
  tenantId: ID;
  name: string;
  session: string;
  start: ISODate;
  end: ISODate;
  status: "planned" | "current" | "closed";
  weeks: number;
}

export interface Subject {
  id: ID;
  name: string;
  short: string;
  hue: number;
}

export interface ClassGroup {
  id: ID;
  tenantId: ID;
  branchId: ID;
  name: string; // e.g. "JSS 3 Gold"
  level: string; // e.g. "JSS 3"
  ageBand: AgeBand;
  formTeacherId: ID | null;
  /** subjectId → staffId (null when unassigned) */
  subjectTeachers: Record<ID, ID | null>;
  room: string;
}

export interface Staff {
  id: ID;
  tenantId: ID;
  name: string;
  title: string;
  subjects: ID[];
  status: "active" | "invited" | "on_leave";
  safeguardingTrained: boolean;
  joined: ISODate;
}

export interface Student {
  id: ID;
  tenantId: ID | null; // null = independent learner
  classId: ID | null;
  firstName: string;
  lastName: string;
  age: number;
  ageBand: AgeBand;
  guardianIds: ID[];
  /** Used anywhere other learners or the public could see them (leaderboards). */
  pseudonym: string;
  accountStatus: "active" | "invited" | "pending_guardian";
  avatarHue: number;
}

export interface Guardian {
  id: ID;
  name: string;
  relationship: string;
  childIds: ID[];
  city: string;
  phoneMasked: string;
}

export interface Invitation {
  id: ID;
  tenantId: ID;
  studentId: ID;
  guardianName: string;
  guardianContactMasked: string;
  channel: "email" | "sms";
  status: "draft" | "sent" | "accepted" | "expired";
  code: string;
  sentAt: ISODate | null;
  acceptedAt: ISODate | null;
}

export interface TimetableSlot {
  id: ID;
  tenantId: ID;
  classId: ID;
  day: 0 | 1 | 2 | 3 | 4; // Mon–Fri
  period: number;
  start: string; // "08:00" WAT
  end: string;
  subjectId: ID;
}

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface AttendanceRecord {
  id: ID;
  tenantId: ID;
  classId: ID;
  studentId: ID;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: ID;
}

export interface Assignment {
  id: ID;
  tenantId: TenantId;
  classId: ID | null;
  courseId: ID | null;
  subjectId: ID;
  title: string;
  brief: string;
  setBy: ID;
  dueAt: ISODate;
  maxScore: number;
  submissions: Submission[];
}

export interface Submission {
  studentId: ID;
  submittedAt: ISODate | null;
  status: "not_started" | "submitted" | "graded" | "late";
  score: number | null;
  feedback: string | null;
}

export interface GradeEntry {
  id: ID;
  tenantId: ID;
  studentId: ID;
  subjectId: ID;
  termId: ID;
  ca1: number | null; // /20
  ca2: number | null; // /20
  exam: number | null; // /60
}

export interface ReportCard {
  id: ID;
  tenantId: ID;
  studentId: ID;
  termId: ID;
  status: "draft" | "reviewed" | "published";
  formTeacherComment: string;
  principalComment: string;
}

export interface Notice {
  id: ID;
  tenantId: ID;
  audience: "everyone" | "guardians" | "staff" | "learners";
  title: string;
  body: string;
  publishedAt: ISODate;
  pinned: boolean;
  author: string;
}

export interface FeeInvoice {
  id: ID;
  tenantId: ID;
  studentId: ID;
  termId: ID;
  items: { label: string; amount: number }[];
  paid: number;
  dueDate: ISODate;
}

// ───────────────────────── Learning ─────────────────────────

export type LessonKind = "video" | "live" | "reading" | "practice";

export interface Lesson {
  id: ID;
  title: string;
  kind: LessonKind;
  minutes: number;
  summary: string;
  notes: string[];
}

export type CourseProvider =
  | { type: "school"; tenantId: ID; classIds: ID[] }
  | { type: "platform" }
  | { type: "tutor"; tutorId: ID };

export interface Course {
  id: ID;
  slug: string;
  title: string;
  subjectId: ID;
  ageBands: AgeBand[];
  level: string;
  provider: CourseProvider;
  summary: string;
  outcomes: string[];
  lessons: Lesson[];
  priceNGN: number; // 0 = included
  weeks: number;
  hue: number;
  /** Professional content is educational only — never credential-granting. */
  professional?: { field: string; disclaimer: string };
}

export type MeetingProvider = "zoom" | "google_meet" | "lumen_room";

export interface LiveClass {
  id: ID;
  tenantId: TenantId;
  courseId: ID | null;
  classId: ID | null;
  title: string;
  host: string;
  startsAt: ISODate;
  minutes: number;
  provider: MeetingProvider;
  /** Placeholder URL. No meeting is created in the demo. */
  link: string;
  recordingAvailable: boolean;
}

export interface Question {
  id: ID;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface WeeklyTest {
  id: ID;
  subjectId: ID;
  courseId: ID | null;
  ageBand: AgeBand;
  week: number;
  slot: 1 | 2; // two checks per week
  title: string;
  opensAt: ISODate;
  minutes: number;
  questions: Question[];
}

export interface TestAttempt {
  id: ID;
  testId: ID;
  studentId: ID;
  score: number;
  total: number;
  answers: number[];
  completedAt: ISODate;
}

export interface Achievement {
  id: ID;
  title: string;
  description: string;
  icon: "spark" | "streak" | "star" | "atom" | "book" | "trophy" | "compass";
}

export interface LearnerProgress {
  studentId: ID;
  courseId: ID;
  completedLessonIds: ID[];
  lastOpenedAt: ISODate | null;
}

// ───────────────────────── Tutors ─────────────────────────

export type VettingStage =
  | "application" | "evidence" | "subject_test" | "safeguarding_test"
  | "demo_class" | "decision" | "probation" | "approved" | "rejected" | "appeal";

export type CheckStatus = "not_started" | "pending" | "passed" | "failed" | "simulated_pass";

export interface TutorCredentials {
  identity: CheckStatus;
  qualification: CheckStatus;
  subjectTest: { status: CheckStatus; score: number | null };
  safeguarding: { status: CheckStatus; score: number | null };
  demoClass: { status: CheckStatus; score: number | null };
  backgroundCheck: CheckStatus;
}

export interface AvailabilityWindow {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Mon=0 … Sun=6 in the tutor's own timezone
  start: string; // "16:00"
  end: string;
}

export interface Tutor {
  id: ID;
  slug: string;
  name: string;
  pronoun: "she" | "he" | "they";
  headline: string;
  city: string;
  timezone: string; // IANA
  subjects: ID[];
  specialties: string[];
  ageBands: AgeBand[];
  ratePerHourNGN: number;
  trialRateNGN: number;
  rating: number;
  reviewCount: number;
  sessionsTaught: number;
  yearsExperience: number;
  languages: string[];
  responseHours: number;
  bio: string;
  credentials: TutorCredentials;
  stage: VettingStage;
  qualifications: string[];
  portfolio: { title: string; kind: "worksheet" | "lesson_plan" | "student_project" | "video_note"; summary: string }[];
  intro: { seconds: number; script: string[] };
  availability: AvailabilityWindow[];
  hue: number;
  featured?: boolean;
}

export interface TutorReview {
  id: ID;
  tutorId: ID;
  author: string; // role description, never a child's name
  rating: number;
  body: string;
  date: ISODate;
}

export type BookingStatus =
  | "pending_guardian" | "awaiting_payment" | "confirmed" | "in_session"
  | "completed" | "declined" | "cancelled";

export interface PriceBreakdown {
  hours: number;
  ratePerHour: number;
  subtotal: number;
  trialDiscount: number;
  platformFee: number; // charged to the payer
  vat: number; // on platform fee only
  total: number;
  tutorShare: number; // what the tutor earns
  commission: number; // platform commission retained from the tutor share
}

export interface Booking {
  id: ID;
  tutorId: ID;
  studentId: ID;
  guardianId: ID | null;
  subjectId: ID;
  startsAt: ISODate;
  minutes: number;
  isTrial: boolean;
  status: BookingStatus;
  price: PriceBreakdown;
  meetingLink: string | null;
  requestedBy: "learner" | "guardian";
  createdAt: ISODate;
  attendance: { tutorJoinedAt: ISODate | null; learnerJoinedAt: ISODate | null; minutes: number } | null;
  feedback: { rating: number; comment: string } | null;
  reference: string;
}

export interface LedgerEntry {
  id: ID;
  tutorId: ID;
  bookingId: ID | null;
  kind: "session_earning" | "commission" | "payout" | "adjustment" | "refund";
  amount: number; // NGN, signed
  at: ISODate;
  status: "pending" | "available" | "paid_out";
  memo: string;
}

export interface TutorApplication {
  id: ID;
  applicantName: string;
  subjects: ID[];
  stage: VettingStage;
  submittedAt: ISODate;
  evidence: { label: string; provided: boolean }[];
  subjectTestScore: number | null;
  safeguardingScore: number | null;
  rubric: { criterion: string; score: number | null }[];
  reviewer: string | null;
  decisionNote: string | null;
  probation: { sessionsRequired: number; sessionsDone: number; reviewOn: ISODate } | null;
  appeal: { reason: string; status: "submitted" | "upheld" | "dismissed"; at: ISODate } | null;
}

// ───────────────────────── Guardians & safeguarding ─────────────────────────

export type ApprovalKind = "booking" | "course" | "tutor_contact" | "competition";

export interface Approval {
  id: ID;
  kind: ApprovalKind;
  studentId: ID;
  guardianId: ID;
  refId: ID;
  title: string;
  detail: string;
  amountNGN: number | null;
  status: "pending" | "approved" | "declined";
  requestedAt: ISODate;
  decidedAt: ISODate | null;
}

export interface Expense {
  id: ID;
  guardianId: ID;
  studentId: ID;
  category: "School fees" | "Tutoring" | "Courses" | "Competitions";
  label: string;
  amount: number;
  at: ISODate;
  status: "paid" | "due" | "simulated";
}

export interface MessageThread {
  id: ID;
  subject: string;
  studentId: ID | null;
  participantIds: ID[];
  guardianVisible: boolean;
  status: "open" | "locked";
}

export type ModerationVerdict = "clean" | "held" | "blocked";

export interface Message {
  id: ID;
  threadId: ID;
  authorId: ID;
  authorName: string;
  authorRole: Role;
  body: string;
  at: ISODate;
  moderation: { verdict: ModerationVerdict; reasons: string[] };
}

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export interface SafetyReport {
  id: ID;
  category: "message" | "tutor_conduct" | "content" | "safeguarding" | "payment";
  severity: ReportSeverity;
  reporterRole: Role;
  subject: string;
  detail: string;
  targetLabel: string;
  status: "new" | "triaged" | "escalated" | "resolved";
  createdAt: ISODate;
  assignee: string | null;
  slaHours: number;
  notes: string[];
}

export interface BlockRecord {
  id: ID;
  blockerId: ID;
  blockedId: ID;
  at: ISODate;
}

// ───────────────────────── Competitions ─────────────────────────

export interface Division {
  id: ID;
  name: string;
  ages: string;
  ageBand: AgeBand;
}

export interface TournamentRegistration {
  schoolId: ID;
  divisionId: ID;
  status: "opted_in" | "verified" | "withdrawn";
  teamName: string;
  guardianConsents: number;
  teamSize: number;
}

export interface TournamentResult {
  schoolId: ID;
  divisionId: ID;
  round: number;
  accuracy: number; // points from correct answers
  speedBonus: number;
  penalties: number;
  verified: boolean;
}

export interface Tournament {
  id: ID;
  slug: string;
  title: string;
  season: string;
  status: "registration" | "live" | "completed";
  subjects: string[];
  divisions: Division[];
  rounds: { n: number; name: string; date: ISODate; format: string }[];
  registrations: TournamentRegistration[];
  results: TournamentResult[];
  hue: number;
}

export interface Appeal {
  id: ID;
  tournamentId: ID;
  schoolId: ID;
  round: number;
  reason: string;
  status: "submitted" | "under_review" | "upheld" | "dismissed";
  at: ISODate;
}

// ───────────────────────── Platform operations ─────────────────────────

export interface AuditEvent {
  id: ID;
  at: ISODate;
  actor: string;
  actorRole: Role | "system";
  action: string;
  entity: string;
  tenantId: TenantId;
  summary: string;
}

export interface ContentItem {
  id: ID;
  title: string;
  kind: "course" | "lesson" | "quiz" | "banner" | "article";
  owner: string;
  ageBands: AgeBand[];
  status: "draft" | "in_review" | "published" | "rejected";
  flags: string[];
  updatedAt: ISODate;
}

export interface Dispute {
  id: ID;
  bookingRef: string;
  raisedBy: "guardian" | "learner" | "tutor";
  reason: string;
  amountNGN: number;
  status: "open" | "awaiting_evidence" | "refunded" | "partial_refund" | "rejected";
  openedAt: ISODate;
  timeline: { at: ISODate; text: string }[];
}

export interface SchoolApplication {
  id: ID;
  schoolId: ID;
  submittedAt: ISODate;
  checklist: { label: string; done: boolean }[];
  status: "pending" | "site_visit" | "approved" | "rejected";
  note: string | null;
}

export interface Toast {
  id: ID;
  title: string;
  body?: string;
  tone: "info" | "success" | "warning" | "danger";
  demo?: boolean;
}
