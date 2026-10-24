"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Building2, CalendarRange, CheckCircle2, Circle, ClipboardCheck, Coins, Megaphone, UserPlus, Users } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { acceptStaffInvite, assignTeacher, setFormTeacher } from "@/lib/services/school";
import { run } from "@/lib/services/core";
import { attendanceFor, classAttendanceRate, classById, staffById, studentAverage, timetableFor, TODAY, unassignedSubjects } from "@/lib/selectors";
import { classSubjects, PERIOD_TIMES } from "@/lib/seed/school-ops";
import { HOME_SCHOOL_ID } from "@/lib/seed/schools";
import { subjectById } from "@/lib/seed/catalog";
import { fmtDate, fmtDateTime, WEEKDAYS_LONG } from "@/lib/time";
import { cn, naira, pct } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Charts";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/Misc";

export function useSchool() {
  const s = useDemo();
  const school = s.schools.find((x) => x.id === HOME_SCHOOL_ID)!;
  const students = s.students.filter((x) => x.tenantId === HOME_SCHOOL_ID);
  return { s, school, students };
}

// ───────────────────────── Overview ─────────────────────────

export function SchoolOverview() {
  const { s, school, students } = useSchool();
  const invoices = s.invoices.filter((i) => i.tenantId === HOME_SCHOOL_ID);
  const billed = invoices.reduce((a, i) => a + i.items.reduce((x, y) => x + y.amount, 0), 0);
  const collected = invoices.reduce((a, i) => a + i.paid, 0);
  const gaps = unassignedSubjects(s);
  const invites = s.invitations.filter((i) => i.status === "sent");
  const pendingStaff = s.staff.filter((x) => x.status === "invited");
  const markedToday = new Set(s.attendance.filter((a) => a.date === TODAY).map((a) => a.classId));

  return (
    <>
      <PageHeader
        eyebrow={`${school.name} · First Term 2026/2027 · Week 7`}
        title="Good morning, Mr Coker."
        description="Two campuses, five demo classes and every learner's lessons flowing from one timetable."
        actions={<ButtonLink href="/school/enrolment" size="sm" icon={<UserPlus className="size-4" />}>Enrol a learner</ButtonLink>}
      />
      <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Learners on Lumen", value: students.length, sub: `${students.filter((x) => x.accountStatus === "invited").length} invitations pending`, icon: Users },
          { label: "Attendance this term", value: `${Math.round(s.classes.reduce((a, c) => a + classAttendanceRate(s, c.id), 0) / s.classes.length)}%`, sub: `${markedToday.size}/${s.classes.length} classes marked today`, icon: ClipboardCheck },
          { label: "Fees collected", value: `${pct(collected, billed)}%`, sub: `${naira(collected)} of ${naira(billed)}`, icon: Coins },
          { label: "Unassigned subjects", value: gaps.length, sub: gaps.length ? "Needs attention" : "Fully staffed", icon: AlertTriangle },
        ].map((k) => (
          <div key={k.label} className="bg-paper p-5">
            <k.icon className="size-5 text-indigo-deep" aria-hidden />
            <p className="mt-3 font-display text-4xl font-semibold text-ink tabular">{k.value}</p>
            <p className="text-sm font-semibold text-ink">{k.label}</p>
            <p className="text-xs text-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Today across classes" action={<Link href="/school/attendance" className="text-sm font-semibold text-iris-600 hover:underline">Take attendance</Link>}>
          <ul className="grid gap-3">
            {s.classes.map((c) => {
              const n = students.filter((x) => x.classId === c.id).length;
              const rate = classAttendanceRate(s, c.id);
              return (
                <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr_6rem_6rem]">
                  <Link href={`/school/classes/${c.id}`} className="font-semibold text-ink hover:text-iris-600">{c.name}</Link>
                  <Meter value={rate} label={`${c.name} attendance`} tone={rate > 93 ? "leaf" : "gold"} className="col-span-2 sm:col-span-1" />
                  <span className="text-sm text-muted tabular">{rate}% · {n}</span>
                  {markedToday.has(c.id) ? <Badge tone="leaf">Marked</Badge> : <Badge tone="amber">Not marked</Badge>}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Needs your attention">
          <ul className="grid gap-2 text-sm">
            {gaps.map((g) => (
              <li key={g.classId + g.subjectId}>
                <Link href="/school/teachers" className="flex items-center gap-3 rounded-xl bg-ember-wash px-3 py-2.5 text-ember hover:opacity-90">
                  <AlertTriangle className="size-4 shrink-0" aria-hidden /><span className="flex-1"><strong>{classById(s, g.classId)?.name}</strong> has no {subjectById(g.subjectId).name} teacher</span><ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            ))}
            {pendingStaff.map((p) => (
              <li key={p.id}><Link href="/school/teachers" className="flex items-center gap-3 rounded-xl bg-amber-wash px-3 py-2.5 text-amber"><UserPlus className="size-4" aria-hidden /><span className="flex-1">{p.name} hasn&apos;t accepted their staff invite</span><ArrowRight className="size-4" aria-hidden /></Link></li>
            ))}
            {invites.map((i) => (
              <li key={i.id}><Link href="/school/enrolment" className="flex items-center gap-3 rounded-xl bg-iris-wash px-3 py-2.5 text-iris-600"><Users className="size-4" aria-hidden /><span className="flex-1">Invitation {i.code} awaiting guardian</span><ArrowRight className="size-4" aria-hidden /></Link></li>
            ))}
            {gaps.length + pendingStaff.length + invites.length === 0 && <li className="text-muted">All clear.</li>}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Latest notices" action={<Link href="/school/notices" className="text-sm font-semibold text-iris-600 hover:underline">All notices</Link>}>
          <ul className="grid gap-3">
            {s.notices.slice(0, 3).map((n) => (
              <li key={n.id} className="flex gap-3"><Megaphone className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden /><div><p className="font-semibold text-ink">{n.title}</p><p className="text-xs text-muted">{n.audience} · {fmtDateTime(n.publishedAt)}</p></div></li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent activity (audit)">
          <ul className="grid gap-2 text-sm">
            {s.audit.filter((a) => a.tenantId === HOME_SCHOOL_ID).slice(0, 5).map((a) => (
              <li key={a.id} className="flex justify-between gap-3"><span className="text-body">{a.summary}</span><span className="shrink-0 text-xs text-muted">{fmtDateTime(a.at)}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

// ───────────────────────── Verification ─────────────────────────

export function Verification() {
  const { school } = useSchool();
  const steps = [
    { label: "Application submitted", date: "2 Mar 2026", detail: "School profile, curricula, campuses and fee bands." },
    { label: "References recorded", date: "4 Mar 2026", detail: "Approval-to-operate and CAC references (placeholders in this demo, no documents collected)." },
    { label: "Safeguarding review", date: "11 Mar 2026", detail: "Policy reviewed; Designated Safeguarding Lead named; staff training plan agreed." },
    { label: "Site visit", date: "19 Mar 2026", detail: "Simulated visit by a Lumen verification officer." },
    { label: "Verified", date: "21 Mar 2026", detail: "Badge shown in the directory. Re-verified every 12 months." },
  ];
  return (
    <>
      <PageHeader eyebrow="Verification" title={school.verification === "verified" ? "Iroko Gate is verified" : "Verification in progress"} description="Verification protects families: only verified schools can invite learners, enter competitions or appear with a badge in the directory." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Verification timeline">
          <ol className="grid gap-4">
            {steps.map((st) => (
              <li key={st.label} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
                <div><p className="font-semibold text-ink">{st.label} <span className="ml-1 text-xs font-normal text-muted">{st.date}</span></p><p className="text-sm text-muted">{st.detail}</p></div>
              </li>
            ))}
            <li className="flex gap-3"><Circle className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden /><div><p className="font-semibold text-ink">Annual re-verification</p><p className="text-sm text-muted">Due March 2027</p></div></li>
          </ol>
        </Panel>
        <div className="grid content-start gap-4">
          <Panel title="Public badge preview">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-ivory p-4">
              <span className="grid size-12 place-items-center rounded-2xl text-white" style={{ background: school.accent }}><Building2 className="size-6" aria-hidden /></span>
              <div><p className="font-semibold text-ink">{school.name}</p><p className="flex items-center gap-1 text-xs font-semibold text-leaf"><BadgeCheck className="size-4" aria-hidden /> Verified on Lumen · Mar 2026</p></div>
            </div>
            <p className="mt-3 text-xs text-muted">Verification confirms a school is real, registered and meets our safeguarding standards. It is not a ranking or an endorsement of quality.</p>
          </Panel>
          <Panel title="What we never collect in this demo">
            <p className="text-sm text-body">Real certificates, IDs or staff records. In production, documents are uploaded to private, encrypted storage, virus-scanned, viewed only by verification officers, and every view is logged. <DemoBadge /></p>
          </Panel>
        </div>
      </div>
    </>
  );
}

// ───────────────────────── Branches & terms ─────────────────────────

export function Setup() {
  const { s } = useSchool();
  const terms = [
    { id: "term-2526-3", name: "Third Term", session: "2025/2026", start: "2026-04-27", end: "2026-07-24", status: "closed" },
    { id: "term-2627-1", name: "First Term", session: "2026/2027", start: "2026-09-14", end: "2026-12-18", status: "current" },
    { id: "term-2627-2", name: "Second Term", session: "2026/2027", start: "2027-01-11", end: "2027-04-09", status: "planned" },
  ];
  return (
    <>
      <PageHeader eyebrow="Setup" title="Branches & terms" description="Every class, timetable, invoice and report card belongs to a branch and a term, so records never mix across campuses or years." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Campuses">
          <ul className="grid gap-3">
            {s.branches.map((b) => (
              <li key={b.id} className="rounded-2xl bg-ivory p-4">
                <p className="font-semibold text-ink">{b.name}</p>
                <p className="text-sm text-muted">{b.area}, {b.city} · Principal: {b.principal}</p>
                <p className="mt-2 text-xs text-muted">{b.students} learners · {s.classes.filter((c) => c.branchId === b.id).length} classes on Lumen (demo)</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Academic terms">
          <ul className="grid gap-3">
            {terms.map((t) => (
              <li key={t.id} className="flex items-center gap-4 rounded-2xl bg-ivory p-4">
                <CalendarRange className="size-5 text-iris" aria-hidden />
                <div className="flex-1"><p className="font-semibold text-ink">{t.name} {t.session}</p><p className="text-sm text-muted">{fmtDate(t.start + "T12:00:00+01:00")} – {fmtDate(t.end + "T12:00:00+01:00")}</p></div>
                <Badge tone={t.status === "current" ? "leaf" : t.status === "closed" ? "neutral" : "azure"}>{t.status}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Mid-term break: 15–16 Oct 2026. Public holiday: 1 Oct (Independence Day).</p>
        </Panel>
      </div>
    </>
  );
}

// ───────────────────────── Classes ─────────────────────────

export function Classes() {
  const { s, students } = useSchool();
  return (
    <>
      <PageHeader eyebrow="Classes" title="Classes & rosters" description="A learner's class decides their lessons, teachers, timetable and live classes, automatically." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {s.classes.map((c) => {
          const kids = students.filter((x) => x.classId === c.id);
          const subjects = classSubjects(c);
          const covered = subjects.filter((x) => c.subjectTeachers[x]).length;
          return (
            <Link key={c.id} href={`/school/classes/${c.id}`} className="group grid gap-3 rounded-3xl border border-line bg-paper p-5 hover:border-iris">
              <div className="flex items-start justify-between">
                <div><h2 className="font-sans text-lg font-bold text-ink group-hover:text-iris-600">{c.name}</h2><p className="text-sm text-muted">{s.branches.find((b) => b.id === c.branchId)?.name} · Room {c.room}</p></div>
                <Badge tone={covered === subjects.length ? "leaf" : "ember"}>{covered}/{subjects.length} subjects staffed</Badge>
              </div>
              <p className="text-sm text-body">Form teacher: <strong>{staffById(s, c.formTeacherId)?.name ?? "—"}</strong></p>
              <div className="flex -space-x-2">{kids.slice(0, 8).map((k) => <Avatar key={k.id} name={`${k.firstName} ${k.lastName}`} hue={k.avatarHue} size={30} ring />)}{kids.length > 8 && <span className="grid size-[30px] place-items-center rounded-full bg-sand text-[0.65rem] font-bold text-muted ring-2 ring-white">+{kids.length - 8}</span>}</div>
              <p className="text-xs text-muted">{kids.length} learners · attendance {classAttendanceRate(s, c.id)}%</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function ClassDetail({ classId }: { classId: string }) {
  const { s, students } = useSchool();
  const c = classById(s, classId);
  if (!c) return <EmptyState title="Class not found" action={<ButtonLink href="/school/classes" size="sm">All classes</ButtonLink>} />;
  const roster = students.filter((x) => x.classId === c.id);
  return (
    <>
      <PageHeader eyebrow="Class roster" title={c.name} description={`Form teacher: ${staffById(s, c.formTeacherId)?.name ?? "—"} · Room ${c.room}`} actions={<><ButtonLink href={`/school/timetable?class=${c.id}`} variant="outline" size="sm">Timetable</ButtonLink><ButtonLink href={`/school/attendance?class=${c.id}`} size="sm">Attendance</ButtonLink></>} />
      <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">Learners in {c.name}</caption>
          <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Learner</th><th>Age</th><th>Account</th><th>Guardian linked</th><th>Attendance</th><th>Average</th></tr></thead>
          <tbody>
            {roster.map((k) => (
              <tr key={k.id} className="border-t border-hair">
                <td className="px-4 py-2.5"><span className="flex items-center gap-2"><Avatar name={`${k.firstName} ${k.lastName}`} hue={k.avatarHue} size={28} /><span className="font-semibold text-ink">{k.firstName} {k.lastName}</span></span></td>
                <td className="tabular">{k.age}</td>
                <td><Badge tone={k.accountStatus === "active" ? "leaf" : "amber"}>{k.accountStatus}</Badge></td>
                <td>{k.accountStatus === "active" ? "Yes" : "Invite sent"}</td>
                <td className="tabular">{attendanceFor(s, k.id).rate}%</td>
                <td className="tabular">{studentAverage(s, k.id)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Staff see full names inside their own school only. Outside the school, learners appear by pseudonym.</p>
    </>
  );
}

// ───────────────────────── Teachers (staffing board) ─────────────────────────

export function Teachers() {
  const { s } = useSchool();
  const [busy, setBusy] = useState<string | null>(null);
  const teachers = s.staff.filter((x) => x.id !== "stf-coker");
  const gaps = unassignedSubjects(s);
  return (
    <>
      <PageHeader eyebrow="Teachers" title="Staffing board" description="Assign a teacher once, every learner in that class sees the change in their timetable, live classes and course page immediately." />
      {gaps.length > 0 && (
        <div data-tour="unassigned" className="mb-6 grid gap-2 rounded-3xl border border-ember/30 bg-ember-wash p-5">
          <p className="flex items-center gap-2 font-bold text-ember"><AlertTriangle className="size-5" aria-hidden /> {gaps.length} unassigned subject{gaps.length > 1 ? "s" : ""}</p>
          {gaps.map((g) => {
            const c = classById(s, g.classId)!;
            const candidates = teachers.filter((t) => t.subjects.includes(g.subjectId));
            return (
              <div key={g.classId + g.subjectId} className="flex flex-wrap items-center gap-2 rounded-2xl bg-paper p-3">
                <span className="flex-1 text-sm text-ink"><strong>{c.name}</strong> · {subjectById(g.subjectId).name}</span>
                {candidates.map((t) => (
                  <Button key={t.id} size="sm" variant={t.status === "active" ? "primary" : "outline"} disabled={t.status !== "active"} loading={busy === t.id + g.classId} onClick={async () => { setBusy(t.id + g.classId); await run(() => assignTeacher(g.classId, g.subjectId, t.id)); setBusy(null); }}>
                    Assign {t.name}{t.status !== "active" ? " (invite pending)" : ""}
                  </Button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
        <table className="w-full min-w-[56rem] text-sm">
          <caption className="sr-only">Subject teacher assignments by class</caption>
          <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Class</th><th>Form teacher</th>{["math", "eng", "bsc", "phy", "chem", "bio", "comp", "yor", "fre", "civ", "econ", "art"].map((sub) => <th key={sub} className="px-2">{subjectById(sub).short}</th>)}</tr>
          </thead>
          <tbody>
            {s.classes.map((c) => (
              <tr key={c.id} className="border-t border-hair align-top">
                <td className="px-4 py-3 font-semibold text-ink">{c.name}</td>
                <td className="py-2 pr-2">
                  <select aria-label={`Form teacher for ${c.name}`} value={c.formTeacherId ?? ""} onChange={(e) => run(() => setFormTeacher(c.id, e.target.value))} className="w-36 rounded-lg border border-line bg-paper px-2 py-1.5 text-xs">
                    {teachers.filter((t) => t.status === "active").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                {["math", "eng", "bsc", "phy", "chem", "bio", "comp", "yor", "fre", "civ", "econ", "art"].map((sub) => {
                  if (!(sub in c.subjectTeachers)) return <td key={sub} className="px-2 py-3 text-center text-muted/40">·</td>;
                  const current = c.subjectTeachers[sub];
                  return (
                    <td key={sub} className="px-1 py-2">
                      <select
                        aria-label={`${subjectById(sub).name} teacher for ${c.name}`}
                        value={current ?? ""}
                        onChange={(e) => run(() => assignTeacher(c.id, sub, e.target.value || null))}
                        className={cn("w-28 rounded-lg border px-1.5 py-1.5 text-xs", current ? "border-line bg-paper" : "border-ember bg-ember-wash text-ember")}
                      >
                        <option value="">Unassigned</option>
                        {teachers.filter((t) => t.status === "active" && t.subjects.includes(sub)).map((t) => <option key={t.id} value={t.id}>{t.name.replace(/^(Mr|Mrs|Ms|Mme)\s/, "")}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 font-sans text-base font-bold text-ink">Staff</h2>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {teachers.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4">
            <Avatar name={t.name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{t.name}</p>
              <p className="truncate text-xs text-muted">{t.title} · {s.classes.filter((c) => Object.values(c.subjectTeachers).includes(t.id)).length} classes</p>
            </div>
            {t.status === "invited" ? (
              <Button size="sm" variant="outline" loading={busy === t.id} onClick={async () => { setBusy(t.id); await run(() => acceptStaffInvite(t.id)); setBusy(null); }}>Simulate accept</Button>
            ) : t.safeguardingTrained ? <Badge tone="leaf">Safeguarding ✓</Badge> : <Badge tone="amber">Training due</Badge>}
          </li>
        ))}
      </ul>
    </>
  );
}

// ───────────────────────── Timetable ─────────────────────────

export function Timetable({ initialClass }: { initialClass?: string }) {
  const { s } = useSchool();
  const [classId, setClassId] = useState(initialClass && s.classes.some((c) => c.id === initialClass) ? initialClass : "cls-jss3");
  const c = classById(s, classId)!;
  const slots = timetableFor(classId);
  const periods = Math.max(...slots.map((x) => x.period)) + 1;
  return (
    <>
      <PageHeader eyebrow="Timetable" title={`${c.name} · weekly timetable`} description="Times in WAT. Teacher names update the moment an assignment changes."
        actions={<select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold">{s.classes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>} />
      <div data-tour="timetable" className="overflow-x-auto rounded-3xl border border-line bg-paper">
        <table className="w-full min-w-[52rem] table-fixed text-sm">
          <caption className="sr-only">{c.name} timetable</caption>
          <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted"><tr><th className="w-24 px-3 py-3">Period</th>{WEEKDAYS_LONG.slice(0, 5).map((d) => <th key={d} className="px-2">{d}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: periods }, (_, p) => (
              <tr key={p} className="border-t border-hair">
                <th scope="row" className="px-3 py-2 text-left text-xs font-semibold text-muted tabular">{PERIOD_TIMES[p][0]}–{PERIOD_TIMES[p][1]}</th>
                {[0, 1, 2, 3, 4].map((d) => {
                  const sl = slots.find((x) => x.day === d && x.period === p);
                  if (!sl) return <td key={d} />;
                  const sub = subjectById(sl.subjectId);
                  const teacher = staffById(s, c.subjectTeachers[sl.subjectId] ?? null);
                  return (
                    <td key={d} className="p-1">
                      <div className="rounded-xl px-2.5 py-2" style={{ background: `hsl(${sub.hue} 70% 95%)`, borderLeft: `3px solid hsl(${sub.hue} 60% 50%)` }}>
                        <p className="truncate font-semibold text-ink">{sub.short}</p>
                        <p className={cn("truncate text-xs", teacher ? "text-muted" : "font-semibold text-ember")}>{teacher?.name ?? "Unassigned"}</p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Break 10:00–10:20 · Lunch 12:20–12:50. Tutor bookings for learners in this class are automatically blocked during these hours.</p>
    </>
  );
}
