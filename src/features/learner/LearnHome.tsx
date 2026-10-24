"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, Eye, NotebookPen, Compass, Star, Stethoscope } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/seed/learning";
import { subjectById } from "@/lib/seed/catalog";
import { attendanceFor, bookingsForStudent, classById, coursesFor, lessonProgress, liveClassesFor, testIsOpen, testsFor, tutorOf, weeklySummary } from "@/lib/selectors";
import { DEMO_NOW, fmtDateTime, fmtDay, relativeToDemo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Meter, ProgressRing } from "@/components/ui/Charts";
import { AchievementIcon } from "./AchievementIcon";
import { LiveClassCard } from "./LiveClassCard";
import { useLearner } from "./hooks";

export function LearnHome() {
  const { s, student, isKid, isMinor } = useLearner();
  const courses = coursesFor(s, student);
  const live = liveClassesFor(s, student).filter((l) => new Date(l.startsAt).getTime() + l.minutes * 60_000 >= DEMO_NOW.getTime());
  const nextLive = live[0];
  const tests = testsFor(s, student).filter((t) => t.week === 7);
  const attempts = s.attempts.filter((a) => a.studentId === student.id);
  const summary = weeklySummary(s, student.id);
  const due = s.assignments.filter((a) => a.submissions.some((x) => x.studentId === student.id && x.status === "not_started"));
  const earned = s.earned[student.id] ?? [];
  const cls = classById(s, student.classId);
  const tutoring = bookingsForStudent(s, student.id).filter((b) => ["confirmed", "in_session"].includes(b.status));
  const att = student.classId ? attendanceFor(s, student.id) : null;
  const pro = courses.some((c) => c.course.professional);

  if (isKid) {
    return (
      <div className="grid gap-6">
        <section className="relative overflow-hidden border-2 border-ink bg-azure p-6 text-ink shadow-lift sm:p-8">
          <p className="relative eyebrow text-ink/80">{fmtDay(DEMO_NOW)} · {cls?.name}</p>
          <h1 className="relative mt-2 text-4xl sm:text-5xl">Ẹ káàárọ̀, {student.firstName}!</h1>
          <p className="relative mt-2 max-w-lg text-lg font-medium">You have {earned.length} stars on your shelf. Ready for today&apos;s adventure?</p>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {earned.map((id) => <span key={id} className="grid size-11 place-items-center rounded-full border-2 border-ink bg-white"><Star className="size-6 fill-gold text-ink" aria-label={ACHIEVEMENTS.find((a) => a.id === id)?.title} /></span>)}
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-3">
          {tests.map((t) => {
            const done = attempts.find((a) => a.testId === t.id);
            const open = testIsOpen(t);
            return (
              <Link key={t.id} href={open ? `/learn/tests/${t.id}` : "/learn/tests"} className={cn("grid gap-2 rounded-3xl p-6 transition-transform hover:-translate-y-1", done ? "bg-leaf-wash" : open ? "bg-gold-wash" : "bg-sand")}>
                <ClipboardCheck className="size-8 text-gold-600" aria-hidden />
                <p className="font-display text-2xl font-semibold text-ink">{t.title}</p>
                <p className="text-sm font-semibold text-muted">{done ? `You got ${done.score} out of ${done.total}!` : open ? "Tap to play" : `Opens ${fmtDay(t.opensAt)}`}</p>
              </Link>
            );
          })}
          {courses.map(({ course }) => {
            const p = lessonProgress(s, student.id, course);
            return (
              <Link key={course.id} href={`/learn/courses/${course.id}`} className="grid gap-2 rounded-3xl bg-azure-wash p-6 transition-transform hover:-translate-y-1">
                <BookOpen className="size-8 text-azure-600" aria-hidden />
                <p className="font-display text-2xl font-semibold text-ink">{course.title}</p>
                <Meter value={p.pct} tone="azure" label={`${course.title} progress`} />
                <p className="text-sm font-semibold text-muted">{p.done} of {p.total} lessons</p>
              </Link>
            );
          })}
        </div>
        {nextLive && <div data-tour="live-next"><LiveClassCard lc={nextLive} studentId={student.id} featured /></div>}
        <p className="flex items-center gap-2 rounded-2xl bg-paper p-4 text-sm text-muted"><Eye className="size-4 shrink-0 text-iris" aria-hidden /> Your grown-up can see your lessons and scores. There&apos;s no chatting or shopping in your account.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-azure-600">{fmtDay(DEMO_NOW)} · Week 7{cls ? ` · ${cls.name}` : ""}</p>
          <h1 className="mt-1 text-4xl text-ink">Good morning, {student.firstName}.</h1>
          <p className="mt-1 text-muted">{cls ? "Your school lessons, teachers and timetable are linked automatically." : "Pick up where you left off."}</p>
        </div>
        <ButtonLink href="/learn/discover" variant="outline" size="sm" icon={<Compass className="size-4" />}>Discover courses</ButtonLink>
      </header>

      {pro && (
        <p className="flex items-start gap-3 rounded-2xl border border-azure-600/30 bg-azure-wash p-4 text-sm text-azure-600">
          <Stethoscope className="mt-0.5 size-5 shrink-0" aria-hidden />
          Professional courses here are educational refreshers. They don&apos;t grant a licence, certificate or CPD credit and never replace your institution&apos;s protocols.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-6">
          {nextLive ? (
            <div data-tour="live-next"><LiveClassCard lc={nextLive} studentId={student.id} featured /></div>
          ) : (
            <p className="rounded-3xl border border-dashed border-line p-6 text-sm text-muted">No live classes left this week.</p>
          )}

          <section aria-labelledby="checks-title" className="rounded-3xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <h2 id="checks-title" className="font-sans text-base font-bold text-ink">This week&apos;s checks</h2>
              <Link href="/learn/tests" className="text-sm font-semibold text-iris-600 hover:underline">All checks</Link>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tests.map((t) => {
                const done = attempts.find((a) => a.testId === t.id);
                const open = testIsOpen(t);
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-ivory p-3">
                    <span className={cn("grid size-10 place-items-center rounded-xl text-sm font-bold", done ? "bg-leaf-wash text-leaf" : open ? "bg-gold-wash text-gold-600" : "bg-sand text-muted")}>{t.slot === 1 ? "Tue" : "Fri"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{t.title}</p>
                      <p className="text-xs text-muted">{subjectById(t.subjectId).short} · {done ? `Scored ${done.score}/${done.total}` : open ? `${t.questions.length} questions · ${t.minutes} min` : `Opens ${fmtDateTime(t.opensAt)}`}</p>
                    </div>
                    {!done && open && <ButtonLink href={`/learn/tests/${t.id}`} size="sm">Start</ButtonLink>}
                  </li>
                );
              })}
            </ul>
            {summary.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                Recent: {summary.slice(0, 3).map((w) => (
                  <Badge key={w.week} tone="neutral">Wk {w.week}: {w.slot1 ? `${w.slot1.score}/${w.slot1.total}` : "–"} · {w.slot2 ? `${w.slot2.score}/${w.slot2.total}` : "–"}</Badge>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="courses-title">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="courses-title" className="font-sans text-base font-bold text-ink">Continue learning</h2>
              <Link href="/learn/courses" className="text-sm font-semibold text-iris-600 hover:underline">My courses</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {courses.slice(0, 4).map(({ course, via }) => {
                const p = lessonProgress(s, student.id, course);
                const nextLesson = course.lessons.find((l) => !p.completed.has(l.id));
                return (
                  <Link key={course.id} href={`/learn/courses/${course.id}`} className="group flex items-center gap-4 rounded-3xl border border-line bg-paper p-4 hover:border-iris">
                    <ProgressRing value={p.pct} label={`${course.title} progress`} color={`hsl(${course.hue} 70% 55%)`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink group-hover:text-iris-600">{course.title}</p>
                      <p className="truncate text-xs text-muted">{via === "school" ? "From your school" : "Enrolled"} · Next: {nextLesson?.title ?? "All done"}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted" aria-hidden />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="grid content-start gap-6">
          {att && (
            <section className="rounded-3xl border border-line bg-paper p-5">
              <h2 className="flex items-center gap-2 font-sans text-base font-bold text-ink"><CalendarCheck className="size-4 text-leaf" aria-hidden /> Attendance this term</h2>
              <p className="mt-2 font-display text-4xl font-semibold text-ink tabular">{att.rate}%</p>
              <div className="mt-3 flex gap-1" aria-hidden>
                {att.recent.map((r) => <span key={r.date} title={`${r.date}: ${r.status}`} className={cn("h-6 flex-1 rounded", r.status === "present" ? "bg-leaf" : r.status === "late" ? "bg-gold" : r.status === "excused" ? "bg-azure" : "bg-ember")} />)}
              </div>
              <p className="mt-2 text-xs text-muted">Last 15 school days · marked by your teachers</p>
            </section>
          )}

          <section className="rounded-3xl border border-line bg-paper p-5">
            <h2 className="flex items-center gap-2 font-sans text-base font-bold text-ink"><NotebookPen className="size-4 text-iris" aria-hidden /> Due soon</h2>
            {due.length ? (
              <ul className="mt-3 grid gap-2">
                {due.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link href="/learn/assignments" className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-sand">
                      <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{a.title}</span><span className="text-xs text-muted">{subjectById(a.subjectId).short}</span></span>
                      <Badge tone="amber">{relativeToDemo(a.dueAt)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">Nothing due. Nice.</p>}
          </section>

          {tutoring.length > 0 && (
            <section className="rounded-3xl border border-line bg-paper p-5">
              <h2 className="font-sans text-base font-bold text-ink">Tutoring</h2>
              <ul className="mt-3 grid gap-2">
                {tutoring.map((b) => (
                  <li key={b.id}>
                    <Link href={`/bookings/${b.id}`} className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-sand">
                      <span className="text-sm"><span className="block font-semibold text-ink">{tutorOf(s, b.tutorId)?.name}</span><span className="text-xs text-muted">{fmtDateTime(b.startsAt)} WAT · {b.minutes} min</span></span>
                      <ArrowRight className="size-4 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              {isMinor && <p className="mt-2 text-xs text-muted">Booked and approved by your guardian.</p>}
            </section>
          )}

          <section className="rounded-3xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-bold text-ink">Achievements</h2>
              <Link href="/learn/progress" className="text-sm font-semibold text-iris-600 hover:underline">All</Link>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ACHIEVEMENTS.map((a) => (
                <li key={a.id} title={a.description}>
                  <AchievementIcon icon={a.icon} earned={earned.includes(a.id)} label={a.title} />
                </li>
              ))}
            </ul>
          </section>

          {isMinor && <p className="flex items-start gap-2 text-xs text-muted"><Eye className="mt-0.5 size-4 shrink-0" aria-hidden /> Your guardian can see your progress, checks and any messages from tutors. That&apos;s how we keep everyone safe.</p>}
        </div>
      </div>
    </div>
  );
}
