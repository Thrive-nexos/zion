"use client";

import { z } from "zod";
import type { TutorApplication } from "@/lib/domain/types";
import { commit, getState, nowISO, toast, uid } from "@/lib/demo/store";
import { DemoError, guard, latency } from "./core";

export const RUBRIC = [
  "Clarity of explanation",
  "Checks for understanding",
  "Inclusive, age-appropriate language",
  "Safeguarding behaviours",
  "Session structure & timing",
] as const;

export const PASS_MARKS = { subject: 70, safeguarding: 80, rubricAverage: 3 } as const;

export const applicationSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name"),
  city: z.string().trim().min(2, "Enter your city"),
  subjects: z.array(z.string()).min(1, "Choose at least one subject").max(3, "Choose up to three subjects"),
  ageBands: z.array(z.string()).min(1, "Choose at least one age group"),
  rate: z.coerce.number().int().min(3000, "Minimum ₦3,000 per hour").max(60000, "Maximum ₦60,000 per hour"),
  experience: z.coerce.number().int().min(0).max(50),
  bio: z.string().trim().min(40, "Tell families a little more (40+ characters)").max(600),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

const EVIDENCE = [
  "Government ID: verified via provider (simulated)",
  "Degree / teaching certificate (reference recorded)",
  "Two professional references",
  "Background check consent",
];

/** Open to any visitor: applicants are not tutors yet. */
export async function startApplication(input: ApplicationInput) {
  const d = applicationSchema.parse(input);
  await latency(500, 800);
  const app: TutorApplication = {
    id: uid("tapp"), applicantName: d.fullName, subjects: d.subjects, stage: "evidence", submittedAt: nowISO(),
    evidence: EVIDENCE.map((label) => ({ label, provided: false })), subjectTestScore: null, safeguardingScore: null,
    rubric: [], reviewer: null, decisionNote: null, probation: null, appeal: null,
  };
  commit((s) => ({ ...s, tutorApplications: [app, ...s.tutorApplications], myApplicationId: app.id }), {
    action: "tutor_application.start", entity: `application:${app.id}`, summary: `${d.fullName} started a tutor application (${d.subjects.length} subjects)`,
  });
  return app;
}

function patch(id: string, fn: (a: TutorApplication) => TutorApplication, summary: string) {
  commit((s) => ({ ...s, tutorApplications: s.tutorApplications.map((a) => (a.id === id ? fn(a) : a)) }), {
    action: "tutor_application.update", entity: `application:${id}`, summary,
  });
}

export async function toggleEvidence(id: string, index: number) {
  await latency(150, 300);
  patch(id, (a) => ({ ...a, evidence: a.evidence.map((e, i) => (i === index ? { ...e, provided: !e.provided } : e)) }), "Updated evidence checklist (placeholders only)");
}

export async function submitEvidence(id: string) {
  const a = getState().tutorApplications.find((x) => x.id === id);
  if (!a || a.evidence.some((e) => !e.provided)) throw new DemoError("Confirm every evidence item first.");
  await latency();
  patch(id, (x) => ({ ...x, stage: "subject_test" }), "Evidence placeholders confirmed; subject test unlocked");
}

export async function recordTest(id: string, kind: "subject" | "safeguarding", score: number) {
  await latency(500, 900);
  const pass = kind === "subject" ? score >= PASS_MARKS.subject : score >= PASS_MARKS.safeguarding;
  patch(id, (a) => ({
    ...a,
    ...(kind === "subject" ? { subjectTestScore: score } : { safeguardingScore: score }),
    stage: pass ? (kind === "subject" ? "safeguarding_test" : "demo_class") : "rejected",
    decisionNote: pass ? a.decisionNote : `${kind === "subject" ? "Subject" : "Safeguarding"} test ${score}%, below the ${kind === "subject" ? PASS_MARKS.subject : PASS_MARKS.safeguarding}% pass mark. You may appeal or re-sit after 30 days.`,
    rubric: kind === "safeguarding" && pass ? RUBRIC.map((criterion) => ({ criterion, score: null })) : a.rubric,
  }), `${kind} test recorded: ${score}%`);
  return pass;
}

/** Applicant books a demo class; in the demo the reviewer step can be performed by the platform admin persona. */
export async function scoreDemoClass(id: string, scores: number[], note: string) {
  guard("admin.tutors");
  if (scores.some((s) => s < 1 || s > 4)) throw new DemoError("Score every criterion from 1 to 4.");
  await latency();
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  patch(id, (a) => ({ ...a, rubric: a.rubric.map((r, i) => ({ ...r, score: scores[i] })), stage: "decision", reviewer: "Kemi Lawal", decisionNote: note || null }),
    `Demo class scored (avg ${avg.toFixed(1)}/4)`);
  toast({ tone: "success", title: "Rubric saved", body: `Average ${avg.toFixed(1)} / 4. Ready for a decision.` });
}

export async function decideApplication(id: string, decision: "probation" | "rejected", note: string) {
  guard("admin.tutors");
  await latency();
  patch(id, (a) => ({
    ...a, stage: decision, decisionNote: note || (decision === "probation" ? "Approved on probation: 10 observed sessions." : "Not approved at this time."),
    probation: decision === "probation" ? { sessionsRequired: 10, sessionsDone: 0, reviewOn: "2026-12-15T12:00:00+01:00" } : null,
  }), `Decision: ${decision}`);
  toast({ tone: decision === "probation" ? "success" : "info", title: decision === "probation" ? "Approved on probation" : "Application declined", body: "Applicant notified (simulated email).", demo: true });
}

export async function submitAppeal(id: string, reason: string) {
  if (reason.trim().length < 20) throw new DemoError("Explain your appeal in at least 20 characters.");
  await latency();
  patch(id, (a) => ({ ...a, stage: "appeal", appeal: { reason: reason.trim(), status: "submitted", at: nowISO() } }), "Appeal submitted");
  toast({ tone: "success", title: "Appeal submitted", body: "A different reviewer decides appeals, usually within 5 working days." });
}

export async function decideAppeal(id: string, upheld: boolean) {
  guard("admin.tutors");
  await latency();
  patch(id, (a) => ({
    ...a, stage: upheld ? "safeguarding_test" : "rejected",
    appeal: a.appeal ? { ...a.appeal, status: upheld ? "upheld" : "dismissed" } : null,
    decisionNote: upheld ? "Appeal upheld: supervised re-sit of the safeguarding test granted." : "Appeal dismissed by second reviewer.",
  }), `Appeal ${upheld ? "upheld" : "dismissed"}`);
  toast({ tone: "success", title: upheld ? "Appeal upheld" : "Appeal dismissed" });
}

export async function resetMyApplication() {
  await latency(150, 250);
  commit((s) => ({ ...s, myApplicationId: null }));
}
