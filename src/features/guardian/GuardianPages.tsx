"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Ban, CalendarDays, Check, Eye, Flag, Lock, ShieldCheck, Wallet, X } from "lucide-react";
import type { Approval, Student } from "@/lib/domain/types";
import { useDemo, usePersona } from "@/lib/demo/store";
import { decideApproval, reportConcern, unblockUser } from "@/lib/services/guardian";
import { cancelBooking } from "@/lib/services/booking";
import { run } from "@/lib/services/core";
import {
  attendanceFor, bookingsForStudent, classById, coursesFor, gradeRows, lessonProgress, liveClassesFor, liveHost, schoolById, studentAverage, testsFor, tutorOf, weeklySummary,
} from "@/lib/selectors";
import { subjectById } from "@/lib/seed/catalog";
import { DEMO_NOW, fmtDate, fmtDateTime, fmtDay } from "@/lib/time";
import { cn, naira } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Bars, Meter, Sparkline } from "@/components/ui/Charts";
import { EmptyState } from "@/components/ui/Misc";
import { Dialog } from "@/components/ui/Dialog";
import { SelectField, TextareaField } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";

function useGuardian() {
  const s = useDemo();
  const persona = usePersona();
  const guardian = persona.subjectId;
  const children = s.students.filter((x) => x.guardianIds.includes(guardian));
  return { s, persona, guardianId: guardian, children };
}

// ───────────────────────── Overview ─────────────────────────

export function GuardianHome() {
  const { s, persona, children } = useGuardian();
  const pending = s.approvals.filter((a) => a.guardianId === persona.subjectId && a.status === "pending");
  const payable = s.bookings.filter((b) => b.guardianId === persona.subjectId && b.status === "awaiting_payment");
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">{fmtDay(DEMO_NOW)} · Week 7 of First Term</p>
        <h1 className="text-4xl text-ink sm:text-5xl">Good morning, {persona.shortName}.</h1>
        <p className="max-w-2xl text-muted">Here&apos;s your family at a glance. You see every lesson, check and tutor message, nothing about your children is ever public.</p>
      </header>

      {(pending.length > 0 || payable.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {pending.map((a) => <ApprovalCard key={a.id} a={a} compact />)}
          {payable.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-gold/40 bg-gold-wash p-5">
              <Wallet className="size-6 text-gold-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">Payment needed: {tutorOf(s, b.tutorId)?.name}</p>
                <p className="text-sm text-muted">{fmtDateTime(b.startsAt)} WAT · {naira(b.price.total)}</p>
              </div>
              <ButtonLink href={`/bookings/${b.id}`} size="sm" variant="dark">Review & pay</ButtonLink>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {children.map((c) => <ChildLetter key={c.id} child={c} />)}
      </div>

      <section className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:grid-cols-3">
        {[
          { icon: Eye, t: "You read every message", b: "Tutors can only contact your children in threads you're part of." },
          { icon: Lock, t: "Nothing public", b: "No public profiles. Leaderboards show a pseudonym like “Orbit Chi”." },
          { icon: ShieldCheck, t: "One tap to report", b: "Reports reach a safeguarding lead; urgent ones within 4 hours." },
        ].map((x) => (
          <div key={x.t} className="flex gap-3">
            <x.icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
            <div><p className="font-semibold text-ink">{x.t}</p><p className="text-sm text-muted">{x.b}</p></div>
          </div>
        ))}
      </section>
    </div>
  );
}

function ChildLetter({ child }: { child: Student }) {
  const s = useDemo();
  const cls = classById(s, child.classId);
  const school = schoolById(s, child.tenantId);
  const att = attendanceFor(s, child.id);
  const weeks = weeklySummary(s, child.id);
  const thisWeek = weeks.find((w) => w.week === 7);
  const tests = testsFor(s, child).filter((t) => t.week === 7);
  const trend = [...weeks].reverse().flatMap((w) => [w.slot1, w.slot2].filter(Boolean).map((x) => Math.round((x!.score / x!.total) * 100)));
  const upcoming = [
    ...liveClassesFor(s, child).filter((l) => new Date(l.startsAt) >= DEMO_NOW).map((l) => ({ at: l.startsAt, label: l.title, who: liveHost(s, l), href: null as string | null })),
    ...bookingsForStudent(s, child.id).filter((b) => ["confirmed", "awaiting_payment", "pending_guardian"].includes(b.status)).map((b) => ({ at: b.startsAt, label: `Tutoring · ${subjectById(b.subjectId).short}`, who: tutorOf(s, b.tutorId)?.name ?? "", href: `/bookings/${b.id}` })),
  ].sort((a, b) => a.at.localeCompare(b.at)).slice(0, 3);

  return (
    <article className="grid gap-5 rounded-3xl border border-line bg-paper p-6 shadow-soft">
      <header className="flex items-center gap-4">
        <Avatar name={`${child.firstName} ${child.lastName}`} hue={child.avatarHue} size={56} />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl text-ink">{child.firstName}</h2>
          <p className="text-sm text-muted">{cls?.name} · {school?.name} · age {child.age}</p>
        </div>
        <ButtonLink href={`/guardian/children/${child.id}`} variant="outline" size="sm">Full view</ButtonLink>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Attendance</p>
          <p className="font-display text-3xl font-semibold text-ink tabular">{att.rate}%</p>
          <p className="text-xs text-muted">{att.counts.absent} absences this term</p>
        </div>
        <div data-tour={child.id === "stu-chidera" ? "weekly-checks" : undefined} className="rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">This week&apos;s checks</p>
          <p className="mt-1 flex gap-2">
            {tests.map((t) => {
              const r = t.slot === 1 ? thisWeek?.slot1 : thisWeek?.slot2;
              return <Badge key={t.id} tone={r ? (r.score / r.total >= 0.6 ? "leaf" : "amber") : "neutral"}>{t.slot === 1 ? "Tue" : "Fri"} {r ? `${r.score}/${r.total}` : "–"}</Badge>;
            })}
          </p>
          <div className="mt-2"><Sparkline values={trend.length > 1 ? trend : [0, 0]} label={`${child.firstName}'s check scores over time, percent`} color="var(--color-gold-600)" /></div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Term average</p>
          <p className="font-display text-3xl font-semibold text-ink tabular">{studentAverage(s, child.id)}%</p>
          <p className="text-xs text-muted">From First CA</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Coming up</p>
        <ul className="mt-2 grid gap-1.5">
          {upcoming.map((u) => (
            <li key={u.at + u.label} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted tabular">{fmtDay(u.at)} {fmtDateTime(u.at).split(", ")[1]}</span>
              {u.href ? <Link href={u.href} className="truncate font-semibold text-ink hover:text-iris-600">{u.label} · {u.who}</Link> : <span className="truncate text-ink">{u.label} · <span className="text-muted">{u.who}</span></span>}
            </li>
          ))}
          {upcoming.length === 0 && <li className="text-sm text-muted">Nothing scheduled.</li>}
        </ul>
      </div>
    </article>
  );
}

// ───────────────────────── Child detail ─────────────────────────

export function ChildDetail({ childId }: { childId: string }) {
  const { s, children } = useGuardian();
  const child = children.find((c) => c.id === childId);
  const [tab, setTab] = useState<"learning" | "checks" | "attendance" | "grades">("learning");
  if (!child) {
    return <EmptyState icon={<Lock className="size-5" />} title="Not one of your linked children" body="Guardians can only see children linked to them. This access check would run on the server for every request." action={<ButtonLink href="/guardian" size="sm">Back to overview</ButtonLink>} />;
  }
  const courses = coursesFor(s, child);
  const weeks = weeklySummary(s, child.id);
  const att = attendanceFor(s, child.id);
  const grades = gradeRows(s, child.id);
  const prev = gradeRows(s, child.id, "term-2526-3");
  const report = s.reportCards.find((r) => r.studentId === child.id && r.termId === "term-2526-3");

  return (
    <>
      <PageHeader
        eyebrow={classById(s, child.classId)?.name}
        title={`${child.firstName}'s learning`}
        description="Private to you, the school and assigned teachers."
        actions={<ButtonLink href={`/tutors?age=${child.ageBand}`} variant="outline" size="sm">Find a tutor for {child.firstName}</ButtonLink>}
      />
      <Tabs label="Child sections" value={tab} onChange={setTab} className="mb-6" tabs={[
        { id: "learning", label: "Courses" }, { id: "checks", label: "Weekly checks" }, { id: "attendance", label: "Attendance" }, { id: "grades", label: "Grades & reports" },
      ]} />

      {tab === "learning" && (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map(({ course, via }) => {
            const p = lessonProgress(s, child.id, course);
            return (
              <div key={course.id} className="rounded-3xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between gap-2"><h2 className="font-sans text-base font-bold text-ink">{course.title}</h2><Badge tone={via === "school" ? "azure" : "gold"}>{via === "school" ? "School" : "Approved by you"}</Badge></div>
                <Meter value={p.pct} className="mt-3" label={`${course.title} progress`} tone="gold" />
                <p className="mt-2 text-sm text-muted">{p.done} of {p.total} lessons</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "checks" && (
        <Panel title="Two checks a week, every week">
          <Bars
            label="Weekly check scores"
            max={100}
            format={(n) => `${n}%`}
            color="var(--color-gold-600)"
            data={[...weeks].reverse().flatMap((w) => [
              ...(w.slot1 ? [{ label: `W${w.week} Tue`, value: Math.round((w.slot1.score / w.slot1.total) * 100) }] : []),
              ...(w.slot2 ? [{ label: `W${w.week} Fri`, value: Math.round((w.slot2.score / w.slot2.total) * 100) }] : []),
            ])}
          />
          <table className="mt-6 w-full text-sm">
            <caption className="sr-only">Weekly check results</caption>
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Week</th><th>Tuesday check</th><th>Friday check</th></tr></thead>
            <tbody>{weeks.map((w) => <tr key={w.week} className="border-t border-hair"><td className="py-2 font-semibold text-ink">Week {w.week}</td><td className="tabular">{w.slot1 ? `${w.slot1.score}/${w.slot1.total}` : "Not yet"}</td><td className="tabular">{w.slot2 ? `${w.slot2.score}/${w.slot2.total}` : "Not yet"}</td></tr>)}</tbody>
          </table>
        </Panel>
      )}

      {tab === "attendance" && (
        <Panel title={`Attendance: ${att.rate}% this term`}>
          <div className="flex flex-wrap gap-1.5">
            {att.recent.map((r) => (
              <span key={r.date} className={cn("grid h-12 w-12 place-items-center rounded-xl text-[0.65rem] font-bold", r.status === "present" ? "bg-leaf-wash text-leaf" : r.status === "late" ? "bg-gold-wash text-gold-600" : r.status === "excused" ? "bg-azure-wash text-azure-600" : "bg-ember-wash text-ember")}>
                {fmtDate(r.date + "T12:00:00+01:00").slice(0, 6)}<span className="sr-only">: {r.status}</span>
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">{att.counts.present} present · {att.counts.late} late · {att.counts.absent} absent · {att.counts.excused} excused. Absence alerts are sent by 10:00 (SMS simulated).</p>
        </Panel>
      )}

      {tab === "grades" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="First Term 2026/2027 · in progress">
            <ul className="grid gap-2">
              {grades.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm"><span className="text-body">{subjectById(g.subjectId).name}</span><span className="font-semibold text-ink tabular">CA1 {g.ca1 ?? "–"}/20</span></li>
              ))}
            </ul>
          </Panel>
          <Panel title="Third Term 2025/2026 report card" action={report?.status === "published" ? <Badge tone="leaf">Published</Badge> : <Badge>Draft</Badge>}>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-1">Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
              <tbody>
                {prev.map((g) => (
                  <tr key={g.id} className="border-t border-hair tabular"><td className="py-1.5 text-body">{subjectById(g.subjectId).short}</td><td>{(g.ca1 ?? 0) + (g.ca2 ?? 0)}</td><td>{g.exam}</td><td className="font-semibold text-ink">{g.total}</td><td><Badge tone={g.total >= 65 ? "leaf" : g.total >= 50 ? "gold" : "ember"}>{g.grade}</Badge></td></tr>
                ))}
              </tbody>
            </table>
            {report && <p className="mt-4 rounded-xl bg-sand p-3 text-sm italic text-body">“{report.formTeacherComment}” — Form teacher</p>}
          </Panel>
        </div>
      )}
    </>
  );
}

// ───────────────────────── Approvals ─────────────────────────

function ApprovalCard({ a, compact }: { a: Approval; compact?: boolean }) {
  const s = useDemo();
  const [busy, setBusy] = useState<"yes" | "no" | null>(null);
  const child = s.students.find((x) => x.id === a.studentId);
  const decide = async (yes: boolean) => {
    setBusy(yes ? "yes" : "no");
    await run(() => decideApproval(a.id, yes));
    setBusy(null);
  };
  return (
    <div className={cn("grid gap-3 rounded-3xl border p-5", a.status === "pending" ? "border-iris/40 bg-iris-wash/50" : "border-line bg-paper")}>
      <div className="flex items-start gap-3">
        <BadgeCheck className="mt-0.5 size-6 shrink-0 text-iris" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-iris-600">{a.kind === "booking" ? "Tutor booking" : a.kind === "course" ? "Course request" : a.kind === "competition" ? "Competition" : "Contact"} · {child?.firstName}</p>
          <p className="font-semibold text-ink">{a.title}</p>
          <p className="text-sm text-muted">{a.detail}</p>
          {a.amountNGN !== null && <p className="mt-1 text-sm font-semibold text-ink">{naira(a.amountNGN)} <span className="font-normal text-muted">if approved</span></p>}
          {!compact && <p className="mt-1 text-xs text-muted">Requested {fmtDateTime(a.requestedAt)}{a.decidedAt ? ` · decided ${fmtDateTime(a.decidedAt)}` : ""}</p>}
        </div>
      </div>
      {a.status === "pending" ? (
        <div className="flex gap-2">
          <Button size="sm" loading={busy === "yes"} disabled={!!busy} onClick={() => decide(true)} icon={<Check className="size-4" />}>Approve</Button>
          <Button size="sm" variant="outline" loading={busy === "no"} disabled={!!busy} onClick={() => decide(false)} icon={<X className="size-4" />}>Decline</Button>
        </div>
      ) : (
        <Badge tone={a.status === "approved" ? "leaf" : "neutral"} className="w-fit">{a.status === "approved" ? "Approved" : "Declined"}</Badge>
      )}
    </div>
  );
}

export function Approvals() {
  const { s, persona } = useGuardian();
  const mine = s.approvals.filter((a) => a.guardianId === persona.subjectId);
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const list = mine.filter((a) => (tab === "pending" ? a.status === "pending" : a.status !== "pending"));
  return (
    <>
      <PageHeader eyebrow="Approvals" title="Nothing new happens without you" description="Tutors, paid courses, competition entries and new contacts for under-18s all need your approval. Requests from your children appear here instantly." />
      <Tabs label="Approval status" value={tab} onChange={setTab} className="mb-5" tabs={[{ id: "pending", label: "Waiting", count: mine.filter((a) => a.status === "pending").length }, { id: "history", label: "History" }]} />
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((a) => <ApprovalCard key={a.id} a={a} />)}
        {list.length === 0 && <EmptyState icon={<Check className="size-5" />} title={tab === "pending" ? "You're all caught up" : "No decisions yet"} body="Try it: switch to Chidera and ask to join a course from Discover." />}
      </div>
    </>
  );
}

// ───────────────────────── Schedule ─────────────────────────

export function Schedule() {
  const { s, children } = useGuardian();
  const [busy, setBusy] = useState<string | null>(null);
  const items = children.flatMap((c) => [
    ...liveClassesFor(s, c).map((l) => ({ key: l.id + c.id, at: l.startsAt, minutes: l.minutes, child: c.firstName, title: l.title, who: liveHost(s, l), kind: "Live class" as const, booking: null as null | (typeof s.bookings)[number] })),
    ...bookingsForStudent(s, c.id).filter((b) => !["cancelled", "declined"].includes(b.status) && new Date(b.startsAt) >= new Date("2026-10-20")).map((b) => ({
      key: b.id, at: b.startsAt, minutes: b.minutes, child: c.firstName, title: `${subjectById(b.subjectId).name} tutoring`, who: tutorOf(s, b.tutorId)?.name ?? "", kind: "Tutoring" as const, booking: b,
    })),
  ]).sort((a, b) => a.at.localeCompare(b.at));
  const byDay = new Map<string, typeof items>();
  items.forEach((i) => byDay.set(fmtDay(i.at), [...(byDay.get(fmtDay(i.at)) ?? []), i]));
  return (
    <>
      <PageHeader eyebrow="Schedule" title="The family week" description="School live classes and tutoring sessions, in West Africa Time." actions={<ButtonLink href="/tutors" size="sm" icon={<CalendarDays className="size-4" />}>Book a session</ButtonLink>} />
      <div className="grid gap-6">
        {[...byDay.entries()].map(([day, list]) => (
          <section key={day} aria-label={day}>
            <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wider text-muted">{day}</h2>
            <ul className="grid gap-2">
              {list.map((i) => (
                <li key={i.key} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper p-4">
                  <span className="w-14 font-display text-xl font-semibold text-ink tabular">{fmtDateTime(i.at).split(", ")[1]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{i.child} · {i.title}</p>
                    <p className="text-sm text-muted">{i.kind} · {i.minutes} min · {i.who}</p>
                  </div>
                  {i.booking && (
                    <div className="flex items-center gap-2">
                      <Badge tone={i.booking.status === "completed" ? "neutral" : i.booking.status === "confirmed" ? "leaf" : "amber"}>{i.booking.status.replace("_", " ")}</Badge>
                      <ButtonLink href={`/bookings/${i.booking.id}`} variant="outline" size="sm">Details</ButtonLink>
                      {["confirmed", "awaiting_payment"].includes(i.booking.status) && (
                        <Button size="sm" variant="ghost" loading={busy === i.booking.id} onClick={async () => { setBusy(i.booking!.id); await run(() => cancelBooking(i.booking!.id)); setBusy(null); }}>Cancel</Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

// ───────────────────────── Expenses ─────────────────────────

export function Expenses() {
  const { s, persona, children } = useGuardian();
  const list = s.expenses.filter((e) => e.guardianId === persona.subjectId).sort((a, b) => b.at.localeCompare(a.at));
  const total = (f: (e: (typeof list)[number]) => boolean) => list.filter(f).reduce((a, e) => a + e.amount, 0);
  const cats = ["School fees", "Tutoring", "Courses", "Competitions"] as const;
  return (
    <>
      <PageHeader eyebrow="Spending" title="Every naira, accounted for" description="School fees, tutoring and courses across your children. Items marked Simulated came from the demo checkout, no money moved." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-ink p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-gold">Paid this term</p><p className="mt-1 font-display text-3xl font-semibold tabular">{naira(total((e) => e.status !== "due"))}</p></div>
        <div className="rounded-3xl border border-line bg-paper p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted">Due soon</p><p className="mt-1 font-display text-3xl font-semibold text-ember tabular">{naira(total((e) => e.status === "due"))}</p></div>
        <div className="rounded-3xl border border-line bg-paper p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted">Tutoring this term</p><p className="mt-1 font-display text-3xl font-semibold text-ink tabular">{naira(total((e) => e.category === "Tutoring"))}</p></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Panel title="By category">
          <ul className="grid gap-3">
            {cats.map((c) => {
              const v = total((e) => e.category === c);
              return <li key={c}><div className="flex justify-between text-sm"><span className="text-body">{c}</span><span className="font-semibold text-ink tabular">{naira(v)}</span></div><Meter value={v} max={Math.max(1, total(() => true))} tone="gold" className="mt-1.5" label={`${c} share`} /></li>;
            })}
          </ul>
          <ul className="mt-6 grid gap-2 border-t border-hair pt-4 text-sm">
            {children.map((c) => <li key={c.id} className="flex justify-between"><span className="text-body">{c.firstName}</span><span className="font-semibold text-ink tabular">{naira(list.filter((e) => e.studentId === c.id).reduce((a, e) => a + e.amount, 0))}</span></li>)}
          </ul>
        </Panel>
        <Panel title="Transactions">
          <ul className="divide-y divide-hair">
            {list.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{e.label}</p>
                  <p className="text-xs text-muted">{e.category} · {s.students.find((x) => x.id === e.studentId)?.firstName} · {fmtDate(e.at)}</p>
                </div>
                {e.status === "simulated" ? <DemoBadge label="Simulated" /> : <Badge tone={e.status === "due" ? "ember" : "leaf"}>{e.status === "due" ? "Due" : "Paid"}</Badge>}
                <span className="w-28 text-right font-semibold text-ink tabular">{naira(e.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

// ───────────────────────── Safety ─────────────────────────

export function GuardianSafety() {
  const { s, persona } = useGuardian();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<"safeguarding" | "tutor_conduct" | "message" | "content" | "payment">("safeguarding");
  const [detail, setDetail] = useState("");
  const blocks = s.blocks.filter((b) => b.blockerId === persona.subjectId);
  const myReports = s.reports.filter((r) => r.reporterRole === "guardian").slice(0, 6);
  return (
    <>
      <PageHeader eyebrow="Safety" title="Report, block, and see what happened next" description="Every report goes to Lumen's Trust & Safety team. Safeguarding reports are escalated to a Designated Safeguarding Lead." actions={<Button variant="danger" size="sm" icon={<Flag className="size-4" />} onClick={() => setOpen(true)}>Report a concern</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Blocked accounts">
          {blocks.length ? (
            <ul className="grid gap-2">{blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-xl bg-sand px-3 py-2 text-sm">
                <span className="flex items-center gap-2"><Ban className="size-4 text-ember" aria-hidden />{tutorOf(s, b.blockedId)?.name ?? b.blockedId}</span>
                <Button size="sm" variant="ghost" onClick={() => run(() => unblockUser(b.blockedId))}>Unblock</Button>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-muted">You haven&apos;t blocked anyone. You can block a tutor from their profile or from any message thread.</p>}
        </Panel>
        <Panel title="Recent reports from guardians (platform-wide, anonymised)">
          <ul className="grid gap-2">
            {myReports.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 text-sm">
                <span><span className="font-semibold text-ink">{r.subject}</span><span className="block text-xs text-muted">{fmtDateTime(r.createdAt)}</span></span>
                <Badge tone={r.status === "resolved" ? "leaf" : r.status === "escalated" ? "ember" : "amber"}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Report a concern" description="If a child is in immediate danger, contact emergency services first (112).">
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const ok = await run(() => reportConcern({ category, subject: category === "safeguarding" ? "Guardian safeguarding concern" : `Guardian report: ${category.replace("_", " ")}`, detail, targetLabel: "Reported by guardian" }));
            setBusy(false);
            if (ok !== undefined) { setOpen(false); setDetail(""); }
          }}
        >
          <SelectField label="What is it about?" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            <option value="safeguarding">{"A child's safety or wellbeing"}</option>
            <option value="tutor_conduct">{"A tutor's behaviour"}</option>
            <option value="message">A message</option>
            <option value="content">Course content</option>
            <option value="payment">A payment</option>
          </SelectField>
          <TextareaField label="What happened?" value={detail} onChange={(e) => setDetail(e.target.value)} hint="Please don't include anyone's real personal details in this demo." />
          <Button type="submit" variant="danger" loading={busy}>Send report</Button>
        </form>
      </Dialog>
    </>
  );
}

