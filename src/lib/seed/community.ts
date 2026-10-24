import type {
  Appeal, Approval, AuditEvent, ContentItem, Dispute, Expense, Message, MessageThread, SafetyReport, Tournament,
} from "@/lib/domain/types";
import { watISO } from "@/lib/time";
import { hashString, prng } from "@/lib/utils";
import { SCHOOLS } from "./schools";

// ───────────── Guardian approvals & expenses ─────────────

export const APPROVALS: Approval[] = [
  {
    id: "apr-1", kind: "course", studentId: "stu-chidera", guardianId: "gdn-adaeze", refId: "c-waec-phy",
    title: "Chidera wants to join “WAEC Physics: Motion & Energy”", detail: "Platform course · 6 weeks · weekly live revision on Wednesdays at 17:00.",
    amountNGN: 18_000, status: "pending", requestedAt: watISO(0, "20:15"), decidedAt: null,
  },
  {
    id: "apr-2", kind: "competition", studentId: "stu-chidera", guardianId: "gdn-adaeze", refId: "trn-harmattan",
    title: "Quiz League team selection", detail: "Iroko Gate selected Chidera for the Intermediate division. Only a pseudonym appears on public leaderboards.",
    amountNGN: null, status: "approved", requestedAt: watISO(-12, "10:00"), decidedAt: watISO(-12, "19:40"),
  },
];

export const EXPENSES: Expense[] = [
  { id: "exp-1", guardianId: "gdn-adaeze", studentId: "stu-chidera", category: "School fees", label: "First Term fees: Iroko Gate (JSS 3)", amount: 990_000, at: "2026-09-08T10:00:00+01:00", status: "paid" },
  { id: "exp-2", guardianId: "gdn-adaeze", studentId: "stu-tolu", category: "School fees", label: "First Term fees: Iroko Gate (Primary 5), part payment", amount: 390_000, at: "2026-09-08T10:05:00+01:00", status: "paid" },
  { id: "exp-3", guardianId: "gdn-adaeze", studentId: "stu-tolu", category: "School fees", label: "First Term fees: balance due 30 Oct", amount: 260_000, at: "2026-10-30T23:59:00+01:00", status: "due" },
  { id: "exp-4", guardianId: "gdn-adaeze", studentId: "stu-chidera", category: "Tutoring", label: "Maths with Mr Emeka · 3 sessions", amount: 40_350, at: watISO(-7, "18:00"), status: "paid" },
  { id: "exp-5", guardianId: "gdn-adaeze", studentId: "stu-tolu", category: "Courses", label: "Scratch Storytellers", amount: 15_000, at: "2026-09-20T12:00:00+01:00", status: "paid" },
];

// ───────────── Moderated messaging ─────────────

export const THREADS: MessageThread[] = [
  { id: "th-emeka", subject: "Chidera · Maths sessions with Mr Emeka", studentId: "stu-chidera", participantIds: ["gdn-adaeze", "tut-emeka", "stu-chidera"], guardianVisible: true, status: "open" },
  { id: "th-school", subject: "Iroko Gate · JSS 3 Gold form teacher", studentId: "stu-chidera", participantIds: ["gdn-adaeze", "stf-seun"], guardianVisible: true, status: "open" },
  { id: "th-tolu", subject: "Tolu · Primary 5 Blue class teacher", studentId: "stu-tolu", participantIds: ["gdn-adaeze", "stf-ronke"], guardianVisible: true, status: "open" },
];

export const MESSAGES: Message[] = [
  { id: "m1", threadId: "th-emeka", authorId: "tut-emeka", authorName: "Mr Emeka Nwosu", authorRole: "tutor", at: watISO(-7, "18:05"), moderation: { verdict: "clean", reasons: [] },
    body: "Session note: Chidera solved 6 of 8 elimination questions on her own today. Next time: word problems. Practice set uploaded to her course page." },
  { id: "m2", threadId: "th-emeka", authorId: "gdn-adaeze", authorName: "Mrs Adaeze Okafor", authorRole: "guardian", at: watISO(-7, "20:30"), moderation: { verdict: "clean", reasons: [] },
    body: "Thank you! She said it finally made sense. Same time next Tuesday works for us." },
  { id: "m3", threadId: "th-emeka", authorId: "stu-chidera", authorName: "Chidera", authorRole: "learner", at: watISO(-1, "19:12"), moderation: { verdict: "clean", reasons: [] },
    body: "Sir, I've done questions 1–5 of the practice set. Number 4 was tricky." },
  { id: "m4", threadId: "th-emeka", authorId: "tut-emeka", authorName: "Mr Emeka Nwosu", authorRole: "tutor", at: watISO(-1, "19:40"), moderation: { verdict: "held", reasons: ["Off-platform contact detail detected (phone number)"] },
    body: "Well done! If you get stuck, message me on 0803 ••• ••••." },
  { id: "m5", threadId: "th-emeka", authorId: "system", authorName: "Lumen Safety", authorRole: "platform_admin", at: watISO(-1, "19:41"), moderation: { verdict: "clean", reasons: [] },
    body: "A message was held because it contained a personal phone number. Tutors and learners communicate only in logged threads that guardians can read. The tutor has been reminded of the policy." },
  { id: "m6", threadId: "th-school", authorId: "stf-seun", authorName: "Mr Oluwaseun Adebayo", authorRole: "teacher", at: watISO(-3, "14:20"), moderation: { verdict: "clean", reasons: [] },
    body: "Good afternoon. Chidera's essay on community leadership was one of the best in the class. She's been nominated for the quiz team too." },
  { id: "m7", threadId: "th-tolu", authorId: "stf-ronke", authorName: "Mrs Ronke Balogun", authorRole: "teacher", at: watISO(-2, "15:05"), moderation: { verdict: "clean", reasons: [] },
    body: "Tolu read aloud beautifully today. Please remember the reading log for Thursday." },
];

// ───────────── Safety reports ─────────────

export const REPORTS: SafetyReport[] = [
  { id: "rep-1", category: "message", severity: "medium", reporterRole: "platform_admin", subject: "Held message: phone number shared by tutor", detail: "Automated hold in thread th-emeka. Tutor has 0 prior incidents.", targetLabel: "Tutor · Mr Emeka Nwosu", status: "triaged", createdAt: watISO(-1, "19:41"), assignee: "Kemi Lawal", slaHours: 24, notes: ["Policy reminder sent to tutor (template TS-04)."] },
  { id: "rep-2", category: "safeguarding", severity: "high", reporterRole: "guardian", subject: "Tutor asked to move lessons to WhatsApp", detail: "Guardian reports a tutor suggested continuing on WhatsApp to avoid fees. Learner is 13.", targetLabel: "Tutor · (sample) T-0419", status: "escalated", createdAt: watISO(0, "08:30"), assignee: "Designated Safeguarding Lead", slaHours: 4, notes: ["Tutor account restricted pending review.", "Guardian contacted by phone (simulated)."] },
  { id: "rep-3", category: "content", severity: "low", reporterRole: "teacher", subject: "Outdated past question in WAEC Physics lesson 2", detail: "Question references an old syllabus unit.", targetLabel: "Course · WAEC Physics", status: "new", createdAt: watISO(0, "09:10"), assignee: null, slaHours: 72, notes: [] },
  { id: "rep-4", category: "tutor_conduct", severity: "medium", reporterRole: "learner", subject: "Tutor repeatedly late", detail: "Adult learner reports three late starts in two weeks.", targetLabel: "Tutor · (sample) T-0233", status: "new", createdAt: watISO(-1, "21:00"), assignee: null, slaHours: 48, notes: [] },
  { id: "rep-5", category: "payment", severity: "low", reporterRole: "guardian", subject: "Charged twice for one session (demo)", detail: "Simulated duplicate charge in the mock checkout.", targetLabel: "Booking · LL-9K2PD", status: "resolved", createdAt: watISO(-6, "11:00"), assignee: "Finance Ops", slaHours: 48, notes: ["Duplicate voided in mock ledger."] },
];

// ───────────── Competitions ─────────────

const OPTED = SCHOOLS.filter((s) => s.competitionOptIn);
const DIVISIONS = [
  { id: "div-jr", name: "Junior", ages: "9–11", ageBand: "kids" as const },
  { id: "div-int", name: "Intermediate", ages: "12–14", ageBand: "teens" as const },
  { id: "div-sr", name: "Senior", ages: "15–17", ageBand: "teens" as const },
];

function results(tournamentId: string, rounds: number) {
  const out: Tournament["results"] = [];
  for (const s of OPTED) {
    for (const d of DIVISIONS) {
      const rand = prng(hashString(tournamentId + s.id + d.id));
      if (rand() < 0.2) continue;
      for (let r = 1; r <= rounds; r++) {
        const strength = s.id === "sch-northstar-kites" ? 0.12 : s.id === "sch-iroko" ? 0.08 : 0;
        out.push({
          schoolId: s.id, divisionId: d.id, round: r,
          accuracy: Math.round((0.55 + strength + rand() * 0.38) * 100),
          speedBonus: Math.round(rand() * 12),
          penalties: rand() < 0.08 ? 5 : 0,
          verified: !(tournamentId === "trn-harmattan" && r === rounds && rand() < 0.25),
        });
      }
    }
  }
  return out;
}

export const TOURNAMENTS: Tournament[] = [
  {
    id: "trn-harmattan", slug: "harmattan-quiz-league-2026", title: "Harmattan Inter-School Quiz League", season: "2026/2027 · Season 1", status: "live",
    subjects: ["Mathematics", "English", "Science", "Civic & Current Affairs", "Nigerian History & Culture"],
    divisions: DIVISIONS, hue: 258,
    rounds: [
      { n: 1, name: "Qualifier", date: watISO(-10, "11:00"), format: "40 questions · 30 min · individual then team aggregate" },
      { n: 2, name: "Group stage", date: watISO(4, "11:00"), format: "Live head-to-head buzzer rounds, proctored on camera by own school" },
      { n: 3, name: "National final", date: "2026-12-05T11:00:00+01:00", format: "In-person at a neutral venue (planned)" },
    ],
    registrations: OPTED.flatMap((s, i) => DIVISIONS.filter((_, k) => (i + k) % 3 !== 2).map((d) => ({
      schoolId: s.id, divisionId: d.id, status: (i % 7 === 6 ? "opted_in" : "verified") as "opted_in" | "verified",
      teamName: `${s.name.split(" ")[0]} ${d.name}`, guardianConsents: 4, teamSize: 4,
    }))),
    results: results("trn-harmattan", 1),
  },
  {
    id: "trn-numeracy", slug: "junior-numeracy-bee-2026", title: "Junior Numeracy & Spelling Bee", season: "November 2026", status: "registration",
    subjects: ["Mental maths", "Spelling", "Logic puzzles"], divisions: [DIVISIONS[0]], hue: 38,
    rounds: [
      { n: 1, name: "School heats", date: "2026-11-14T10:00:00+01:00", format: "Untimed practice, then 20-minute heat" },
      { n: 2, name: "Final", date: "2026-11-28T10:00:00+01:00", format: "Live, guardians welcome to watch" },
    ],
    registrations: OPTED.slice(0, 5).map((s) => ({ schoolId: s.id, divisionId: "div-jr", status: "opted_in" as const, teamName: `${s.name.split(" ")[0]} Juniors`, guardianConsents: 2, teamSize: 3 })),
    results: [],
  },
  {
    id: "trn-stem", slug: "stem-challenge-2026", title: "STEM Challenge 2026", season: "Completed · June 2026", status: "completed",
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computing"], divisions: DIVISIONS.slice(1), hue: 180,
    rounds: [
      { n: 1, name: "Qualifier", date: "2026-05-16T11:00:00+01:00", format: "Online, 45 min" },
      { n: 2, name: "Final", date: "2026-06-20T11:00:00+01:00", format: "Online, proctored" },
    ],
    registrations: OPTED.map((s) => ({ schoolId: s.id, divisionId: "div-int", status: "verified" as const, teamName: `${s.name.split(" ")[0]} STEM`, guardianConsents: 4, teamSize: 4 })),
    results: results("trn-stem", 2).filter((r) => r.divisionId !== "div-jr").map((r) => ({ ...r, verified: true })),
  },
];

export const APPEALS: Appeal[] = [
  { id: "apl-1", tournamentId: "trn-harmattan", schoolId: "sch-sahel-star", round: 1, reason: "Question 31 had two defensible answers (rounding).", status: "under_review", at: watISO(-8, "15:00") },
];

// ───────────── Platform operations ─────────────

export const CONTENT: ContentItem[] = [
  { id: "cnt-1", title: "WAEC Physics: Motion & Energy: Lesson 2", kind: "lesson", owner: "Lumen Faculty", ageBands: ["teens"], status: "published", flags: ["Reported: outdated question"], updatedAt: watISO(-20, "10:00") },
  { id: "cnt-2", title: "Algebra Confidence Clinic", kind: "course", owner: "Mr Emeka Nwosu", ageBands: ["teens"], status: "published", flags: [], updatedAt: watISO(-30, "10:00") },
  { id: "cnt-3", title: "Scratch Storytellers: Project gallery banner", kind: "banner", owner: "Marketing", ageBands: ["kids"], status: "in_review", flags: ["Child-directed: no ads, no external links"], updatedAt: watISO(0, "09:00") },
  { id: "cnt-4", title: "Paediatric Medication Safety: Check 2", kind: "quiz", owner: "Lumen Health Faculty", ageBands: ["professionals"], status: "in_review", flags: ["Clinical reviewer sign-off required"], updatedAt: watISO(-1, "16:00") },
  { id: "cnt-5", title: "How we vet tutors", kind: "article", owner: "Trust & Safety", ageBands: ["adults"], status: "published", flags: [], updatedAt: watISO(-40, "10:00") },
  { id: "cnt-6", title: "Igbo proverbs for kids", kind: "lesson", owner: "Mrs Ngozi Eze", ageBands: ["kids"], status: "draft", flags: [], updatedAt: watISO(-2, "18:00") },
  { id: "cnt-7", title: "Crypto trading for teens", kind: "course", owner: "(sample) External creator", ageBands: ["teens"], status: "rejected", flags: ["Financial risk content targeted at minors"], updatedAt: watISO(-5, "12:00") },
];

export const DISPUTES: Dispute[] = [
  {
    id: "dsp-1", bookingRef: "LL-7H2QA", raisedBy: "guardian", reason: "Tutor did not join; learner waited 25 minutes.", amountNGN: 13_450, status: "open", openedAt: watISO(-1, "18:30"),
    timeline: [{ at: watISO(-1, "18:30"), text: "Guardian opened dispute" }, { at: watISO(-1, "18:31"), text: "Attendance log attached automatically: tutor never joined" }],
  },
  {
    id: "dsp-2", bookingRef: "LL-2M9XC", raisedBy: "tutor", reason: "Learner left after 10 minutes; tutor requests partial payment.", amountNGN: 9_200, status: "awaiting_evidence", openedAt: watISO(-3, "20:00"),
    timeline: [{ at: watISO(-3, "20:00"), text: "Tutor opened dispute" }, { at: watISO(-2, "09:00"), text: "Guardian asked for their account of events" }],
  },
  {
    id: "dsp-3", bookingRef: "LL-9K2PD", raisedBy: "guardian", reason: "Duplicate charge in mock checkout.", amountNGN: 13_450, status: "refunded", openedAt: watISO(-6, "11:00"),
    timeline: [{ at: watISO(-6, "11:00"), text: "Opened" }, { at: watISO(-6, "15:00"), text: "Mock refund issued" }],
  },
];

export const AUDIT_SEED: AuditEvent[] = [
  { id: "aud-1", at: watISO(-1, "19:41"), actor: "Moderation engine", actorRole: "system", action: "message.hold", entity: "message:m4", tenantId: "platform", summary: "Held message containing a phone number" },
  { id: "aud-2", at: watISO(-1, "20:02"), actor: "Kemi Lawal", actorRole: "platform_admin", action: "report.triage", entity: "report:rep-1", tenantId: "platform", summary: "Triaged report, sent policy reminder TS-04" },
  { id: "aud-3", at: watISO(0, "08:31"), actor: "Kemi Lawal", actorRole: "platform_admin", action: "tutor.restrict", entity: "tutor:T-0419", tenantId: "platform", summary: "Restricted tutor pending safeguarding review" },
  { id: "aud-4", at: watISO(0, "08:55"), actor: "Mr Babatunde Coker", actorRole: "school_admin", action: "notice.publish", entity: "notice:ntc-1", tenantId: "sch-iroko", summary: "Published notice to everyone" },
  { id: "aud-5", at: watISO(0, "09:20"), actor: "Ms Halima Sani", actorRole: "teacher", action: "attendance.mark", entity: "class:cls-ss1", tenantId: "sch-iroko", summary: "Marked SS 1 Science attendance (15 learners)" },
  { id: "aud-6", at: watISO(0, "09:40"), actor: "Mrs Adaeze Okafor", actorRole: "guardian", action: "messages.read", entity: "thread:th-emeka", tenantId: "platform", summary: "Guardian read tutor thread" },
];
