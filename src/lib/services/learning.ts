"use client";

import { commit, getState, nowISO, toast, uid } from "@/lib/demo/store";
import { isMinor } from "@/lib/seed/people";
import { courseById, LIVE_CLASSES, WEEKLY_TESTS } from "@/lib/seed/learning";
import { studentById, testIsOpen } from "@/lib/selectors";
import { naira } from "@/lib/utils";
import { actor, DemoError, guard, latency } from "./core";

function me() {
  const p = guard("learning.consume");
  const st = studentById(getState(), p.subjectId);
  if (!st) throw new DemoError("Learner record not found");
  return st;
}

export async function completeLesson(courseId: string, lessonId: string) {
  const st = me();
  await latency(200, 400);
  commit((s) => {
    const existing = s.progress.find((p) => p.studentId === st.id && p.courseId === courseId);
    const progress = existing
      ? s.progress.map((p) => (p === existing ? { ...p, completedLessonIds: [...new Set([...p.completedLessonIds, lessonId])], lastOpenedAt: nowISO(s) } : p))
      : [...s.progress, { studentId: st.id, courseId, completedLessonIds: [lessonId], lastOpenedAt: nowISO(s) }];
    return { ...s, progress };
  }, { action: "lesson.complete", entity: `lesson:${lessonId}`, summary: `Completed a lesson in ${courseById(courseId)?.title}` });
  toast({ tone: "success", title: "Lesson complete", body: "Progress saved and shared with your guardian and teacher." });
}

export async function joinLiveClass(liveClassId: string) {
  const st = me();
  guard("live.join");
  const lc = LIVE_CLASSES.find((l) => l.id === liveClassId);
  if (!lc) throw new DemoError("Class not found");
  await latency(300, 600);
  const first = !getState().liveJoins.some((j) => j.studentId === st.id);
  commit((s) => ({
    ...s,
    liveJoins: [...s.liveJoins.filter((j) => !(j.liveClassId === liveClassId && j.studentId === st.id)), { liveClassId, studentId: st.id, at: nowISO(s) }],
    earned: first && !(s.earned[st.id] ?? []).includes("ach-first-live") ? { ...s.earned, [st.id]: [...(s.earned[st.id] ?? []), "ach-first-live"] } : s.earned,
  }), { action: "live.join", entity: `live:${liveClassId}`, summary: `Joined live class “${lc.title}” (attendance recorded)` });
  toast({ tone: "success", title: "Attendance recorded", body: "In production this opens the class in the provider's app. The demo link is a placeholder.", demo: true });
}

export async function submitTest(testId: string, answers: number[]) {
  const st = me();
  guard("tests.take");
  const t = WEEKLY_TESTS.find((x) => x.id === testId);
  if (!t) throw new DemoError("Test not found");
  if (!testIsOpen(t)) throw new DemoError("This check hasn't opened yet");
  if (answers.some((a) => a < 0)) throw new DemoError("Answer every question before submitting");
  await latency(500, 900);
  const score = t.questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const perfect = score === t.questions.length;
  commit((s) => ({
    ...s,
    attempts: [...s.attempts.filter((a) => !(a.testId === testId && a.studentId === st.id)), {
      id: uid("ta"), testId, studentId: st.id, score, total: t.questions.length, answers, completedAt: nowISO(s),
    }],
    earned: perfect && !(s.earned[st.id] ?? []).includes("ach-perfect") ? { ...s.earned, [st.id]: [...(s.earned[st.id] ?? []), "ach-perfect"] } : s.earned,
  }), { action: "test.submit", entity: `test:${testId}`, summary: `Submitted “${t.title}”: ${score}/${t.questions.length}` });
  return { score, total: t.questions.length };
}

/** Adults enrol directly (simulated checkout); minors raise a guardian approval instead. */
export async function requestCourse(courseId: string) {
  const st = me();
  const c = courseById(courseId);
  if (!c) throw new DemoError("Course not found");
  await latency();
  if (isMinor(st)) {
    const guardianId = st.guardianIds[0];
    if (!guardianId) throw new DemoError("No linked guardian to approve this request");
    if (getState().approvals.some((a) => a.refId === courseId && a.studentId === st.id && a.status === "pending")) {
      toast({ tone: "info", title: "Already waiting for your guardian" });
      return "pending" as const;
    }
    commit((s) => ({
      ...s,
      approvals: [{
        id: uid("apr"), kind: "course", studentId: st.id, guardianId, refId: courseId, title: `${st.firstName} wants to join “${c.title}”`,
        detail: `${c.provider.type === "platform" ? "Platform course" : "Course"} · ${c.weeks} weeks.`, amountNGN: c.priceNGN || null, status: "pending",
        requestedAt: nowISO(s), decidedAt: null,
      }, ...s.approvals],
    }), { action: "approval.request", entity: `course:${courseId}`, summary: `Requested guardian approval for “${c.title}”` });
    toast({ tone: "info", title: "Sent to your guardian", body: "You'll see the course here as soon as they approve it." });
    return "pending" as const;
  }
  commit((s) => ({ ...s, enrollments: [...s.enrollments, { studentId: st.id, courseId, at: nowISO(s), via: "self" }] }), {
    action: "course.enrol", entity: `course:${courseId}`, summary: `Enrolled in “${c.title}”${c.priceNGN ? ` (simulated payment ${naira(c.priceNGN)})` : ""}`,
  });
  toast({ tone: "success", title: "You're enrolled", body: c.priceNGN ? `Simulated payment of ${naira(c.priceNGN)}, no money moved.` : undefined, demo: !!c.priceNGN });
  return "enrolled" as const;
}

export async function submitAssignment(assignmentId: string) {
  const st = me();
  await latency(400, 700);
  commit((s) => ({
    ...s,
    assignments: s.assignments.map((a) => a.id !== assignmentId ? a : {
      ...a, submissions: a.submissions.map((sub) => (sub.studentId === st.id ? { ...sub, status: "submitted", submittedAt: nowISO(s) } : sub)),
    }),
  }), { action: "assignment.submit", entity: `assignment:${assignmentId}`, summary: `${actor().shortName} submitted an assignment` });
  toast({ tone: "success", title: "Submitted", body: "File upload is simulated: a placeholder 'work.pdf' was attached.", demo: true });
}
