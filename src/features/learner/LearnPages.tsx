"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, Lock, PlayCircle, Radio, Upload, UserRound } from "lucide-react";
import type { Course } from "@/lib/domain/types";
import { COURSES, ACHIEVEMENTS, courseById, LIVE_CLASSES } from "@/lib/seed/learning";
import { ageBandLabel, subjectById } from "@/lib/seed/catalog";
import {
  attendanceFor, attemptLabel, coursesFor, gradeRows, lessonProgress, liveClassesFor, studentAverage, teacherFor, testIsOpen, testsFor, weeklySummary,
} from "@/lib/selectors";
import { completeLesson, requestCourse, submitAssignment } from "@/lib/services/learning";
import { run } from "@/lib/services/core";
import { DEMO_NOW, fmtDateTime, fmtDay, relativeToDemo } from "@/lib/time";
import { cn, naira } from "@/lib/utils";
import { PageHeader } from "@/components/shell/PageHeader";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Bars, Meter, ProgressRing } from "@/components/ui/Charts";
import { EmptyState } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Tabs";
import { LessonBoard } from "@/components/illustrations";
import { CourseCard } from "@/components/CourseCard";
import { AchievementIcon } from "./AchievementIcon";
import { LiveClassCard } from "./LiveClassCard";
import { useLearner } from "./hooks";

// ───────────────────────── Courses ─────────────────────────

export function MyCourses() {
  const { s, student } = useLearner();
  const list = coursesFor(s, student);
  return (
    <>
      <PageHeader eyebrow="My courses" title="Everything you're learning" description={student.classId ? "Courses marked “From your school” were added automatically when your school enrolled you." : "Courses you've enrolled in."} actions={<ButtonLink href="/learn/discover" variant="outline" size="sm">Discover more</ButtonLink>} />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(({ course, via }) => {
          const p = lessonProgress(s, student.id, course);
          const teacher = course.provider.type === "school" ? teacherFor(s, student.classId, course.subjectId) : undefined;
          return (
            <Link key={course.id} href={`/learn/courses/${course.id}`} className="group grid gap-4 rounded-3xl border border-line bg-paper p-5 hover:border-iris">
              <div className="flex items-start gap-4">
                <ProgressRing value={p.pct} size={64} label={`${course.title} progress`} color={`hsl(${course.hue} 70% 55%)`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={via === "school" ? "azure" : "iris"}>{via === "school" ? "From your school" : "Enrolled"}</Badge>
                    {course.professional && <Badge tone="amber">Educational only</Badge>}
                  </div>
                  <h2 className="mt-1.5 font-sans text-lg font-bold text-ink group-hover:text-iris-600">{course.title}</h2>
                  <p className="text-sm text-muted">{course.level} · {p.done}/{p.total} lessons</p>
                </div>
              </div>
              {course.provider.type === "school" && (
                <p className="flex items-center gap-2 text-xs text-muted"><UserRound className="size-3.5" aria-hidden />Teacher: <strong className="text-ink">{teacher?.name ?? "Being assigned by your school"}</strong></p>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function CourseView({ courseId }: { courseId: string }) {
  const { s, student } = useLearner();
  const course = courseById(courseId);
  const mine = course && coursesFor(s, student).some((c) => c.course.id === course.id);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!course) return <EmptyState title="Course not found" action={<ButtonLink href="/learn/courses" size="sm">Back to my courses</ButtonLink>} />;
  if (!mine) {
    return <EmptyState icon={<Lock className="size-5" />} title="You're not enrolled in this course" body="School courses are added by your school; other courses need enrolment (and guardian approval for under-18s)." action={<ButtonLink href={`/courses/${course.slug}`} size="sm">View course details</ButtonLink>} />;
  }
  const p = lessonProgress(s, student.id, course);
  const lesson = course.lessons.find((l) => l.id === (lessonId ?? course.lessons.find((x) => !p.completed.has(x.id))?.id)) ?? course.lessons[0];
  const teacher = course.provider.type === "school" ? teacherFor(s, student.classId, course.subjectId) : undefined;
  const liveForCourse = LIVE_CLASSES.filter((l) => l.courseId === course.id);

  return (
    <>
      <Link href="/learn/courses" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden /> My courses</Link>
      <PageHeader eyebrow={`${subjectById(course.subjectId).name} · ${course.level}`} title={course.title} description={course.summary} />
      {course.professional && <p className="mb-6 rounded-2xl border border-amber/40 bg-amber-wash p-4 text-sm text-amber"><strong>{course.professional.field}:</strong> {course.professional.disclaimer}</p>}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid content-start gap-4">
          <div className="overflow-hidden rounded-3xl border border-line bg-ink">
            <div className="relative aspect-video">
              <LessonBoard title={lesson.title} hue={course.hue} />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white">
                {lesson.kind === "live" ? <Radio className="size-3.5" aria-hidden /> : lesson.kind === "reading" ? <FileText className="size-3.5" aria-hidden /> : <PlayCircle className="size-3.5" aria-hidden />}
                {lesson.kind === "video" ? "Recorded lesson" : lesson.kind === "live" ? "Live lesson" : lesson.kind === "reading" ? "Reading" : "Practice"} · {lesson.minutes} min
              </span>
              <span className="absolute right-3 top-3"><DemoBadge label="Video placeholder" /></span>
            </div>
          </div>
          <article className="rounded-3xl border border-line bg-paper p-5">
            <h2 className="text-2xl text-ink">{lesson.title}</h2>
            <p className="mt-1 text-muted">{lesson.summary}</p>
            {lesson.notes.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-sm font-bold uppercase tracking-wider text-iris-600">Lesson notes</h3>
                <ul className="mt-2 grid gap-2 text-[0.95rem] text-body">
                  {lesson.notes.map((n) => <li key={n} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-iris" />{n}</li>)}
                </ul>
              </>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {p.completed.has(lesson.id) ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-leaf"><CheckCircle2 className="size-4" aria-hidden /> Completed</span>
              ) : (
                <Button loading={busy} onClick={async () => { setBusy(true); await run(() => completeLesson(course.id, lesson.id)); setBusy(false); }}>Mark lesson complete</Button>
              )}
              {lesson.kind === "live" && <Link href="/learn/live" className="text-sm font-semibold text-iris-600 hover:underline">See live class times →</Link>}
            </div>
          </article>
        </div>
        <aside className="grid content-start gap-4">
          <section className="rounded-3xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-bold text-ink">Lessons</h2>
              <span className="text-sm text-muted tabular">{p.done}/{p.total}</span>
            </div>
            <Meter value={p.pct} className="mt-3" label="Course progress" />
            <ol className="mt-4 grid gap-1">
              {course.lessons.map((l, i) => (
                <li key={l.id}>
                  <button onClick={() => setLessonId(l.id)} aria-current={l.id === lesson.id ? "true" : undefined} className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm", l.id === lesson.id ? "bg-iris-wash" : "hover:bg-sand")}>
                    {p.completed.has(l.id) ? <CheckCircle2 className="size-4 shrink-0 text-leaf" aria-label="completed" /> : <Circle className="size-4 shrink-0 text-muted" aria-label="not completed" />}
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-ink">{i + 1}. {l.title}</span><span className="text-xs text-muted">{l.kind} · {l.minutes} min</span></span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
          {course.provider.type === "school" && (
            <section className="rounded-3xl border border-line bg-paper p-5 text-sm">
              <h2 className="font-sans text-base font-bold text-ink">Your teacher</h2>
              <p className="mt-2 text-body">{teacher?.name ?? "Your school is assigning a teacher. Lessons and checks continue as normal."}</p>
              <p className="mt-1 text-xs text-muted">Updates automatically when your school changes assignments.</p>
            </section>
          )}
          {liveForCourse.length > 0 && <LiveClassCard lc={liveForCourse[0]} studentId={student.id} compact />}
        </aside>
      </div>
    </>
  );
}

// ───────────────────────── Live ─────────────────────────

export function LiveClasses() {
  const { s, student } = useLearner();
  const list = liveClassesFor(s, student);
  const upcoming = list.filter((l) => new Date(l.startsAt).getTime() + l.minutes * 60_000 >= DEMO_NOW.getTime());
  const past = list.filter((l) => !upcoming.includes(l));
  return (
    <>
      <PageHeader eyebrow="Live classes" title="Join on time, learn together" description="Links are created by the school or course provider. In this demo, Zoom and Google Meet links are placeholders and joining records your attendance." />
      <div className="grid gap-8">
        <section aria-labelledby="up-title">
          <h2 id="up-title" className="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-muted">Upcoming</h2>
          {upcoming.length ? <div className="grid gap-4 lg:grid-cols-2">{upcoming.map((l, i) => <LiveClassCard key={l.id} lc={l} studentId={student.id} featured={i === 0} />)}</div> : <EmptyState title="No upcoming live classes" />}
        </section>
        {past.length > 0 && (
          <section aria-labelledby="past-title">
            <h2 id="past-title" className="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-muted">Earlier this week</h2>
            <div className="grid gap-4 lg:grid-cols-2">{past.map((l) => <LiveClassCard key={l.id} lc={l} studentId={student.id} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}

// ───────────────────────── Tests ─────────────────────────

export function TestsList() {
  const { s, student, isKid } = useLearner();
  const tests = testsFor(s, student);
  const attempts = s.attempts.filter((a) => a.studentId === student.id);
  const summary = weeklySummary(s, student.id);
  return (
    <>
      <PageHeader eyebrow="Weekly checks" title={isKid ? "Treasure hunts & puzzle trails" : "Two short checks every week"} description="Each subject has a Tuesday check and a Friday check. They're short, explained straight after, and shared with your guardian and teacher." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="grid content-start gap-3" aria-label="This week">
          {tests.map((t) => {
            const done = attempts.find((a) => a.testId === t.id);
            const open = testIsOpen(t);
            return (
              <div key={t.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-paper p-4">
                <span className={cn("grid size-12 place-items-center rounded-2xl font-bold", done ? "bg-leaf-wash text-leaf" : open ? "bg-gold-wash text-gold-600" : "bg-sand text-muted")}>{t.slot === 1 ? "Tue" : "Fri"}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{t.title}</p>
                  <p className="text-sm text-muted">{subjectById(t.subjectId).name} · Week {t.week} · {t.questions.length} questions · {t.minutes} min</p>
                </div>
                {done ? (
                  <ButtonLink href={`/learn/tests/${t.id}`} variant="outline" size="sm">Review {done.score}/{done.total}</ButtonLink>
                ) : open ? (
                  <ButtonLink href={`/learn/tests/${t.id}`} size="sm">Start check</ButtonLink>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-muted"><Clock className="size-4" aria-hidden /> Opens {fmtDateTime(t.opensAt)}</span>
                )}
              </div>
            );
          })}
        </section>
        <section className="rounded-3xl border border-line bg-paper p-5" aria-labelledby="hist-title">
          <h2 id="hist-title" className="font-sans text-base font-bold text-ink">Your recent weeks</h2>
          <table className="mt-3 w-full text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-1.5 font-semibold">Week</th><th className="font-semibold">Tuesday</th><th className="font-semibold">Friday</th></tr></thead>
            <tbody>
              {summary.map((w) => (
                <tr key={w.week} className="border-t border-hair">
                  <td className="py-2 font-semibold text-ink">Week {w.week}</td>
                  <td className="tabular">{w.slot1 ? `${w.slot1.score}/${w.slot1.total}` : "—"}</td>
                  <td className="tabular">{w.slot2 ? `${w.slot2.score}/${w.slot2.total}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

// ───────────────────────── Assignments ─────────────────────────

export function Assignments() {
  const { s, student } = useLearner();
  const [busy, setBusy] = useState<string | null>(null);
  const mine = s.assignments.filter((a) => a.submissions.some((x) => x.studentId === student.id));
  const [tab, setTab] = useState<"todo" | "done">("todo");
  const list = mine.filter((a) => {
    const sub = a.submissions.find((x) => x.studentId === student.id)!;
    return tab === "todo" ? sub.status === "not_started" : sub.status !== "not_started";
  });
  return (
    <>
      <PageHeader eyebrow="Assignments" title="Work set by your teachers" />
      <Tabs label="Assignment status" value={tab} onChange={setTab} tabs={[{ id: "todo", label: "To do" }, { id: "done", label: "Submitted & graded" }]} className="mb-5" />
      <div className="grid gap-3">
        {list.length === 0 && <EmptyState title={tab === "todo" ? "Nothing to do right now" : "Nothing submitted yet"} />}
        {list.map((a) => {
          const sub = a.submissions.find((x) => x.studentId === student.id)!;
          return (
            <article key={a.id} className="rounded-3xl border border-line bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-iris-600">{subjectById(a.subjectId).name}</p>
                  <h2 className="font-sans text-lg font-bold text-ink">{a.title}</h2>
                  <p className="mt-1 text-sm text-body">{a.brief}</p>
                  <p className="mt-2 text-xs text-muted">Due {fmtDateTime(a.dueAt)} WAT ({relativeToDemo(a.dueAt)}) · {a.maxScore} marks</p>
                </div>
                {sub.status === "not_started" ? (
                  <Button size="sm" icon={<Upload className="size-4" />} loading={busy === a.id} onClick={async () => { setBusy(a.id); await run(() => submitAssignment(a.id)); setBusy(null); }}>Submit work</Button>
                ) : sub.status === "graded" ? (
                  <div className="text-right"><p className="font-display text-3xl font-semibold text-ink tabular">{sub.score}<span className="text-base text-muted">/{a.maxScore}</span></p>{sub.feedback && <p className="max-w-xs text-xs text-muted">“{sub.feedback}”</p>}</div>
                ) : (
                  <Badge tone="leaf">Submitted {sub.submittedAt ? fmtDay(sub.submittedAt) : ""}</Badge>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

// ───────────────────────── Progress ─────────────────────────

export function Progress() {
  const { s, student } = useLearner();
  const earned = s.earned[student.id] ?? [];
  const summary = [...weeklySummary(s, student.id)].reverse();
  const att = student.classId ? attendanceFor(s, student.id) : null;
  const grades = student.classId ? gradeRows(s, student.id) : [];
  return (
    <>
      <PageHeader eyebrow="Progress" title="How far you've come" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-paper p-5">
          <h2 className="font-sans text-base font-bold text-ink">Weekly check scores</h2>
          <Bars
            className="mt-4"
            label="Weekly check scores, percent"
            format={(n) => `${n}%`}
            max={100}
            data={summary.flatMap((w) => [
              ...(w.slot1 ? [{ label: `W${w.week} Tue`, value: Math.round((w.slot1.score / w.slot1.total) * 100), highlight: w.week === 7 }] : []),
              ...(w.slot2 ? [{ label: `W${w.week} Fri`, value: Math.round((w.slot2.score / w.slot2.total) * 100), highlight: w.week === 7 }] : []),
            ])}
          />
        </section>
        <section className="rounded-3xl border border-line bg-paper p-5">
          <h2 className="font-sans text-base font-bold text-ink">Achievements</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACHIEVEMENTS.map((a) => (
              <li key={a.id} className="flex flex-col items-center gap-2 rounded-2xl bg-ivory p-3 text-center">
                <AchievementIcon icon={a.icon} earned={earned.includes(a.id)} label={a.title} size="lg" />
                <span className="text-sm font-semibold text-ink">{a.title}</span>
                <span className="text-xs text-muted">{a.description}</span>
              </li>
            ))}
          </ul>
        </section>
        {att && (
          <section className="rounded-3xl border border-line bg-paper p-5">
            <h2 className="font-sans text-base font-bold text-ink">Attendance</h2>
            <p className="mt-2 font-display text-4xl font-semibold text-ink">{att.rate}%</p>
            <p className="text-sm text-muted">{att.counts.present} present · {att.counts.late} late · {att.counts.absent} absent · {att.counts.excused} excused</p>
          </section>
        )}
        {grades.length > 0 && (
          <section className="rounded-3xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-bold text-ink">First CA scores</h2>
              <span className="text-sm text-muted">Average {studentAverage(s, student.id)}%</span>
            </div>
            <ul className="mt-3 grid gap-2">
              {grades.map((g) => (
                <li key={g.id} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm">
                  <span className="truncate text-body">{subjectById(g.subjectId).short}</span>
                  <Meter value={g.ca1 ?? 0} max={20} label={`${subjectById(g.subjectId).name} CA1`} tone={(g.ca1 ?? 0) >= 14 ? "leaf" : (g.ca1 ?? 0) >= 10 ? "gold" : "ember"} />
                  <span className="text-right font-semibold text-ink tabular">{g.ca1}/20</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

// ───────────────────────── Discover ─────────────────────────

export function Discover() {
  const { s, student, isMinor } = useLearner();
  const mine = new Set(coursesFor(s, student).map((c) => c.course.id));
  const pending = new Set(s.approvals.filter((a) => a.studentId === student.id && a.status === "pending").map((a) => a.refId));
  const list = COURSES.filter((c) => c.provider.type !== "school" && c.ageBands.includes(student.ageBand));
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (c: Course) => {
    setBusy(c.id);
    await run(() => requestCourse(c.id));
    setBusy(null);
  };
  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title={`Courses for ${ageBandLabel(student.ageBand).toLowerCase()}`}
        description={isMinor ? "Ask to join a course and your guardian gets a request to approve. Nothing is charged without them." : "Enrol directly. Payments are simulated in this demo."}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="grid gap-3">
            <CourseCard course={c} href={`/courses/${c.slug}`} />
            {mine.has(c.id) ? (
              <ButtonLink href={`/learn/courses/${c.id}`} variant="outline" size="sm">Open course</ButtonLink>
            ) : pending.has(c.id) ? (
              <Badge tone="amber" className="justify-center py-2">Waiting for guardian approval</Badge>
            ) : (
              <Button size="sm" loading={busy === c.id} onClick={() => act(c)}>{isMinor ? "Ask my guardian" : c.priceNGN ? `Enrol · ${naira(c.priceNGN)}` : "Enrol free"}</Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export { attemptLabel };
