"use client";

import { getState } from "@/lib/demo/store";
import { completeSession, createBooking, joinSession, payForBooking } from "@/lib/services/booking";
import { joinLiveClass, submitTest } from "@/lib/services/learning";
import { assignTeacher } from "@/lib/services/school";
import { switchPersona } from "@/lib/services/session";
import { WEEKLY_TESTS } from "@/lib/seed/learning";
import { watISO } from "@/lib/time";

export interface TourStep {
  chapter: 1 | 2 | 3 | 4;
  persona: string;
  route: string | (() => string);
  title: string;
  body: string;
  target?: string;
  /** Performs the step's key action through the same services the UI uses. Returns an optional route to go to next. */
  action?: { label: string; run: () => Promise<string | void> };
  seconds: number;
}

export const CHAPTERS = {
  1: "A parent finds a vetted tutor",
  2: "A learner attends and completes a check",
  3: "A school assigns a teacher",
  4: "A tutor sees hourly earnings",
} as const;

const tourBookingId = () => getState().bookings.find((b) => b.tutorId === "tut-emeka" && b.reference.startsWith("LL-") && b.createdAt > "2026-10-27T10" && b.status !== "cancelled")?.id;

export const STEPS: TourStep[] = [
  {
    chapter: 1, persona: "p-adaeze", route: "/tutors?subject=math&age=teens", target: "tutor-filters", seconds: 15,
    title: "Mrs Okafor searches for a maths tutor",
    body: "She filters by subject and age group. Rates are hourly in naira, and every card shows the vetting status. Ratings are labelled as sample data.",
  },
  {
    chapter: 1, persona: "p-adaeze", route: "/tutors/emeka-nwosu", target: "vetting-record", seconds: 15,
    title: "She checks the vetting record",
    body: "Identity, qualifications, a subject test, a safeguarding test and an observed demo class. Identity checks are simulated in this demo.",
  },
  {
    chapter: 1, persona: "p-adaeze", route: "/book/emeka-nwosu", target: "slot-picker", seconds: 25,
    title: "She books a slot and pays (simulated)",
    body: "Slots show in her time zone. A slot during school hours is refused with a clear reason. Guardians book directly; if Chidera requested it herself, it would first need Mum's approval.",
    action: {
      label: "Book Thursday 17:00 for me",
      run: async () => {
        switchPersona("p-adaeze");
        const existing = tourBookingId();
        if (existing) return `/bookings/${existing}`;
        const b = await createBooking({ tutorId: "tut-emeka", studentId: "stu-chidera", subjectId: "math", startsAt: watISO(3, "17:00"), minutes: 60, isTrial: false, goals: "Word problems before BECE mocks" });
        await payForBooking(b.id, "demo_card");
        return `/bookings/${b.id}`;
      },
    },
  },
  {
    chapter: 2, persona: "p-chidera", route: "/learn", target: "live-next", seconds: 15,
    title: "Chidera's school lessons arrived automatically",
    body: "Because Iroko Gate enrolled her in JSS 3 Gold, her class courses, teachers, timetable and live classes appear without any setup.",
    action: {
      label: "Join the live class",
      run: async () => {
        switchPersona("p-chidera");
        await joinLiveClass("lc-jss3-math");
      },
    },
  },
  {
    chapter: 2, persona: "p-chidera", route: "/learn/tests/wt-math-w7-1", target: "quiz", seconds: 25,
    title: "She completes Tuesday's weekly check",
    body: "Every subject has two short checks a week, Tuesday and Friday. Answers are explained right after submitting.",
    action: {
      label: "Answer and submit for me",
      run: async () => {
        switchPersona("p-chidera");
        const t = WEEKLY_TESTS.find((x) => x.id === "wt-math-w7-1")!;
        await submitTest(t.id, t.questions.map((q, i) => (i === 4 ? (q.answer + 1) % q.options.length : q.answer)));
        return "/learn/tests/wt-math-w7-1?done=1";
      },
    },
  },
  {
    chapter: 2, persona: "p-adaeze", route: "/guardian", target: "weekly-checks", seconds: 12,
    title: "Mum sees the result straight away",
    body: "The guardian portal shows both weekly checks per subject, attendance, approvals, spending and every tutor message.",
  },
  {
    chapter: 3, persona: "p-coker", route: "/school/teachers", target: "unassigned", seconds: 15,
    title: "The school spots a gap",
    body: "JSS 3 Gold lost its maths teacher. The staffing board flags every unassigned subject.",
    action: {
      label: "Assign Ms Halima Sani",
      run: async () => {
        switchPersona("p-coker");
        await assignTeacher("cls-jss3", "math", "stf-halima");
      },
    },
  },
  {
    chapter: 3, persona: "p-coker", route: "/school/timetable?class=cls-jss3", target: "timetable", seconds: 12,
    title: "Everyone linked to the class updates at once",
    body: "The timetable, Chidera's live-class host and her course page now show Ms Sani. No re-enrolment, no spreadsheets.",
  },
  {
    chapter: 4, persona: "p-emeka", route: "/tutor", target: "today-sessions", seconds: 15,
    title: "Mr Emeka teaches today's session",
    body: "Attendance is logged when tutor and learner join. Completing the session releases his earnings.",
    action: {
      label: "Run & complete today's session",
      run: async () => {
        switchPersona("p-emeka");
        const b = getState().bookings.find((x) => x.id === "bk-upcoming-1");
        if (b && b.status !== "completed") {
          await joinSession(b.id, "tutor");
          await joinSession(b.id, "learner");
          await completeSession(b.id);
        }
        return "/tutor/earnings";
      },
    },
  },
  {
    chapter: 4, persona: "p-emeka", route: "/tutor/earnings", target: "earnings-summary", seconds: 20,
    title: "Hourly earnings, fully itemised",
    body: "₦12,500/hr gross, 15% platform commission, net available for payout. Payouts are simulated, no bank is contacted.",
  },
];

export const TOTAL_SECONDS = STEPS.reduce((a, s) => a + s.seconds, 0);

export const resolveRoute = (s: TourStep) => (typeof s.route === "function" ? s.route() : s.route);
