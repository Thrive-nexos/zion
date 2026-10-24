"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Check, CheckCheck, Pin, Printer, Send, UserPlus } from "lucide-react";
import type { AttendanceStatus } from "@/lib/domain/types";
import { useDemo, usePersona } from "@/lib/demo/store";
import {
  acceptInvitation, enrolLearner, enrolSchema, markAttendance, noticeSchema, postNotice, publishReportCards, recordFeePayment, resendInvitation, saveGrades, sendFeeReminders, type EnrolInput,
} from "@/lib/services/school";
import { run } from "@/lib/services/core";
import { classAttendanceRate, classById, gradeRows, staffById, studentAverage, teacherClasses, TODAY, weeklySummary } from "@/lib/selectors";
import { classSubjects, CURRENT_TERM_ID, historicalAttendance, PREVIOUS_TERM_ID } from "@/lib/seed/school-ops";
import { HOME_SCHOOL_ID } from "@/lib/seed/schools";
import { subjectById } from "@/lib/seed/catalog";
import { fmtDate, fmtDateTime } from "@/lib/time";
import { cn, naira, pct, waecGrade } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bars, Meter } from "@/components/ui/Charts";
import { CheckboxField, SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Tabs";

// ───────────────────────── Enrolment ─────────────────────────

export function Enrolment() {
  const s = useDemo();
  const [busy, setBusy] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EnrolInput>({
    resolver: zodResolver(enrolSchema) as never,
    defaultValues: { channel: "email", classId: "", consent: false as unknown as true },
  });
  const onSubmit = handleSubmit(async (v) => {
    const r = await run(() => enrolLearner(v));
    if (r) reset({ channel: "email", classId: "", consent: false as unknown as true, firstName: "", lastName: "", guardianName: "", guardianContact: "", age: undefined as unknown as number });
  });
  const invites = [...s.invitations].reverse();
  return (
    <>
      <PageHeader eyebrow="Enrolment" title="Enrol a learner & invite their guardian" description="The learner's account activates when the guardian accepts. Once active, they automatically receive their class's lessons, teachers, timetable and checks." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="New enrolment">
          <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="First name" error={errors.firstName?.message} {...register("firstName")} />
              <TextField label="Last name" error={errors.lastName?.message} {...register("lastName")} />
              <TextField label="Age" type="number" inputMode="numeric" error={errors.age?.message} {...register("age")} />
              <SelectField label="Class" error={errors.classId?.message} {...register("classId")}>
                <option value="" disabled>Choose…</option>
                {s.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectField>
              <TextField label="Guardian's name" error={errors.guardianName?.message} {...register("guardianName")} />
              <TextField label="Guardian's email or phone" placeholder="Use made-up details" error={errors.guardianContact?.message} {...register("guardianContact")} />
            </div>
            <fieldset className="flex flex-wrap gap-4 text-sm">
              <legend className="mb-1 text-sm font-semibold text-ink">Send invitation by</legend>
              <label className="flex items-center gap-2"><input type="radio" value="email" className="accent-iris" {...register("channel")} />Email</label>
              <label className="flex items-center gap-2"><input type="radio" value="sms" className="accent-iris" {...register("channel")} />SMS</label>
              <DemoBadge label="Not sent, simulated" />
            </fieldset>
            <CheckboxField label="The guardian above is the learner's parent or legal carer" description="Required: only a guardian can activate an under-18 account." error={errors.consent?.message} {...register("consent")} />
            <Button type="submit" loading={isSubmitting} icon={<UserPlus className="size-4" />}>Enrol & send invitation</Button>
          </form>
        </Panel>
        <Panel title="Invitations">
          <ul className="divide-y divide-hair">
            {invites.map((i) => {
              const st = s.students.find((x) => x.id === i.studentId);
              return (
                <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{st ? `${st.firstName} ${st.lastName}` : "Learner"} · <span className="font-mono text-sm">{i.code}</span></p>
                    <p className="text-xs text-muted">{classById(s, st?.classId ?? null)?.name} · {i.guardianName} · {i.guardianContactMasked} · {i.channel.toUpperCase()} {i.sentAt ? `· sent ${fmtDateTime(i.sentAt)}` : ""}</p>
                  </div>
                  <Badge tone={i.status === "accepted" ? "leaf" : i.status === "sent" ? "amber" : "neutral"}>{i.status}</Badge>
                  {i.status === "sent" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" loading={busy === "r" + i.id} onClick={async () => { setBusy("r" + i.id); await run(() => resendInvitation(i.id)); setBusy(null); }}>Resend</Button>
                      <Button size="sm" variant="outline" loading={busy === "a" + i.id} onClick={async () => { setBusy("a" + i.id); await run(() => acceptInvitation(i.id)); setBusy(null); }}>Simulate guardian accept</Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}

// ───────────────────────── Attendance ─────────────────────────

const ATT: { id: AttendanceStatus; label: string; cls: string }[] = [
  { id: "present", label: "Present", cls: "bg-leaf text-white" },
  { id: "late", label: "Late", cls: "bg-gold text-ink" },
  { id: "absent", label: "Absent", cls: "bg-ember text-white" },
  { id: "excused", label: "Excused", cls: "bg-azure-600 text-white" },
];

export function Attendance({ scope, initialClass }: { scope: "school" | "teacher"; initialClass?: string }) {
  const s = useDemo();
  const persona = usePersona();
  const classes = scope === "teacher" ? teacherClasses(s, persona.subjectId) : s.classes;
  const [classId, setClassId] = useState(initialClass && classes.some((c) => c.id === initialClass) ? initialClass : classes[0]?.id ?? "");
  const roster = s.students.filter((x) => x.classId === classId);
  const existing = s.attendance.filter((a) => a.classId === classId && a.date === TODAY);
  const [edits, setEdits] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [busy, setBusy] = useState(false);
  const marks: Record<string, AttendanceStatus> = Object.fromEntries(
    roster.map((k) => [k.id, edits[classId]?.[k.id] ?? existing.find((e) => e.studentId === k.id)?.status ?? "present"]),
  );
  const setMark = (studentId: string, status: AttendanceStatus) => setEdits((e) => ({ ...e, [classId]: { ...e[classId], [studentId]: status } }));

  if (!classes.length) return <EmptyState title="No classes assigned to you yet" />;
  const counts = ATT.map((a) => ({ ...a, n: Object.values(marks).filter((m) => m === a.id).length }));

  return (
    <>
      <PageHeader eyebrow={`Attendance · ${fmtDate(TODAY + "T12:00:00+01:00")}`} title="Take the register" description="Everyone starts as present, tap only the exceptions. Guardians of absent learners get an alert (simulated)."
        actions={<select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold">{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>} />
      {existing.length > 0 && <p className="mb-4 flex items-center gap-2 rounded-2xl bg-leaf-wash p-3 text-sm text-leaf"><CheckCheck className="size-4" aria-hidden /> Already submitted today. Changes will update the record and the audit log.</p>}
      <div className="mb-4 flex flex-wrap gap-2">{counts.map((c) => <Badge key={c.id} tone={c.id === "present" ? "leaf" : c.id === "late" ? "gold" : c.id === "absent" ? "ember" : "azure"}>{c.label}: {c.n}</Badge>)}</div>
      <ul className="grid gap-2">
        {roster.map((k) => {
          const recent = ["2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-26"].map((d) => historicalAttendance(k.id, d));
          return (
            <li key={k.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper p-3">
              <Avatar name={`${k.firstName} ${k.lastName}`} hue={k.avatarHue} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{k.firstName} {k.lastName}</p>
                <p className="flex gap-0.5" aria-label="Last five school days">{recent.map((r, i) => <span key={i} className={cn("size-2 rounded-full", r === "present" ? "bg-leaf" : r === "late" ? "bg-gold" : r === "absent" ? "bg-ember" : "bg-azure")} />)}</p>
              </div>
              <div role="radiogroup" aria-label={`Attendance for ${k.firstName}`} className="flex gap-1">
                {ATT.map((a) => (
                  <button key={a.id} role="radio" aria-checked={marks[k.id] === a.id} onClick={() => setMark(k.id, a.id)} className={cn("rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors", marks[k.id] === a.id ? a.cls : "bg-sand text-muted hover:bg-line")}>
                    {a.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-20 mt-4 flex justify-end lg:bottom-4">
        <Button size="lg" loading={busy} icon={<Check className="size-5" />} onClick={async () => { setBusy(true); await run(() => markAttendance(classId, TODAY, marks)); setBusy(false); }}>Save register ({roster.length})</Button>
      </div>
    </>
  );
}

// ───────────────────────── Grades ─────────────────────────

export function Gradebook({ scope }: { scope: "school" | "teacher" }) {
  const s = useDemo();
  const persona = usePersona();
  const classes = scope === "teacher" ? teacherClasses(s, persona.subjectId) : s.classes;
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const cls = classById(s, classId);
  const subjects = cls ? classSubjects(cls).filter((sub) => scope === "school" || cls.subjectTeachers[sub] === persona.subjectId) : [];
  const [subjectPick, setSubjectId] = useState(subjects[0] ?? "");
  const subjectId = subjects.includes(subjectPick) ? subjectPick : subjects[0] ?? "";
  const [term, setTerm] = useState(CURRENT_TERM_ID);
  const roster = s.students.filter((x) => x.classId === classId);
  const rows = s.grades.filter((g) => g.termId === term && g.subjectId === subjectId && roster.some((r) => r.id === g.studentId));
  const [edits, setEdits] = useState<Record<string, { ca1: string; ca2: string; exam: string }>>({});
  const [busy, setBusy] = useState(false);
  const str = (n: number | null) => (n === null ? "" : String(n));
  const draft: Record<string, { ca1: string; ca2: string; exam: string }> = Object.fromEntries(
    rows.map((g) => [g.id, edits[g.id] ?? { ca1: str(g.ca1), ca2: str(g.ca2), exam: str(g.exam) }]),
  );

  if (!classes.length) return <EmptyState title="No classes assigned to you yet" />;
  const num = (v: string) => (v.trim() === "" ? null : Number(v));
  const invalid = (v: string, max: number) => v.trim() !== "" && (isNaN(Number(v)) || Number(v) < 0 || Number(v) > max);
  const anyInvalid = Object.values(draft).some((d) => invalid(d.ca1, 20) || invalid(d.ca2, 20) || invalid(d.exam, 60));
  const readOnly = term !== CURRENT_TERM_ID;

  return (
    <>
      <PageHeader eyebrow="Gradebook" title="Continuous assessment & exams" description="CA1 and CA2 are out of 20, the exam out of 60. Totals map to WAEC-style grades (A1–F9)."
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold">{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} aria-label="Subject" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold">{subjects.map((x) => <option key={x} value={x}>{subjectById(x).name}</option>)}</select>
            <select value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Term" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold"><option value={CURRENT_TERM_ID}>First Term 26/27</option><option value={PREVIOUS_TERM_ID}>Third Term 25/26 (closed)</option></select>
          </div>
        } />
      {subjects.length === 0 ? <EmptyState title="You don't teach a subject in this class" /> : (
        <>
          <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
            <table className="w-full min-w-[36rem] text-sm">
              <caption className="sr-only">{subjectById(subjectId).name} grades for {cls?.name}</caption>
              <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Learner</th><th>CA1 /20</th><th>CA2 /20</th><th>Exam /60</th><th>Total</th><th>Grade</th></tr></thead>
              <tbody>
                {rows.map((g) => {
                  const d = draft[g.id] ?? { ca1: "", ca2: "", exam: "" };
                  const st = roster.find((r) => r.id === g.studentId)!;
                  const total = (num(d.ca1) ?? 0) + (num(d.ca2) ?? 0) + (num(d.exam) ?? 0);
                  const complete = d.ca1 && d.ca2 && d.exam;
                  return (
                    <tr key={g.id} className="border-t border-hair">
                      <td className="px-4 py-2 font-semibold text-ink">{st.firstName} {st.lastName}</td>
                      {(["ca1", "ca2", "exam"] as const).map((k) => (
                        <td key={k} className="py-1.5 pr-2">
                          <input
                            aria-label={`${k.toUpperCase()} for ${st.firstName}`}
                            inputMode="numeric"
                            value={d[k]}
                            disabled={readOnly}
                            onChange={(e) => setEdits((x) => ({ ...x, [g.id]: { ...d, [k]: e.target.value } }))}
                            aria-invalid={invalid(d[k], k === "exam" ? 60 : 20) || undefined}
                            className="w-16 rounded-lg border border-line bg-ivory px-2 py-1.5 text-center tabular disabled:opacity-70 aria-[invalid=true]:border-ember aria-[invalid=true]:bg-ember-wash"
                          />
                        </td>
                      ))}
                      <td className="font-semibold text-ink tabular">{total}</td>
                      <td>{complete ? <Badge tone={total >= 65 ? "leaf" : total >= 50 ? "gold" : "ember"}>{waecGrade(total)}</Badge> : <span className="text-xs text-muted">In progress</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {anyInvalid && <p role="alert" className="mt-3 text-sm font-semibold text-ember">Some scores are out of range (CA 0–20, exam 0–60).</p>}
          {!readOnly && (
            <div className="mt-4 flex justify-end">
              <Button loading={busy} disabled={anyInvalid} onClick={async () => {
                setBusy(true);
                await run(() => saveGrades(rows.map((g) => ({ id: g.id, ca1: num(draft[g.id]?.ca1 ?? ""), ca2: num(draft[g.id]?.ca2 ?? ""), exam: num(draft[g.id]?.exam ?? "") }))));
                setBusy(false);
              }}>Save scores</Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ───────────────────────── Report cards ─────────────────────────

export function ReportCards() {
  const s = useDemo();
  const [classId, setClassId] = useState("cls-jss3");
  const [term, setTerm] = useState(PREVIOUS_TERM_ID);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const roster = s.students.filter((x) => x.classId === classId);
  const cards = s.reportCards.filter((r) => r.termId === term && roster.some((k) => k.id === r.studentId));
  const published = cards.filter((c) => c.status === "published").length;
  const pv = preview ? roster.find((k) => k.id === preview) : null;
  const pvRows = pv ? gradeRows(s, pv.id, term) : [];
  const pvCard = pv ? cards.find((c) => c.studentId === pv.id) : null;
  return (
    <>
      <PageHeader eyebrow="Report cards" title="Generate, review, publish" description="Report cards compile CA, exam scores, attendance and comments. Publishing makes them visible to guardians instantly."
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold">{s.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Term" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold"><option value={PREVIOUS_TERM_ID}>Third Term 25/26</option><option value={CURRENT_TERM_ID}>First Term 26/27 (in progress)</option></select>
          </div>
        } />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
        <p className="text-sm text-body"><strong>{published}</strong> of {cards.length} published</p>
        <Button size="sm" loading={busy} disabled={published === cards.length || term === CURRENT_TERM_ID} onClick={async () => { setBusy(true); await run(() => publishReportCards(classId, term)); setBusy(false); }}>
          {term === CURRENT_TERM_ID ? "Available after exams" : published === cards.length ? "All published" : "Publish all to guardians"}
        </Button>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {roster.map((k) => {
          const card = cards.find((c) => c.studentId === k.id);
          return (
            <li key={k.id} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3">
              <Avatar name={`${k.firstName} ${k.lastName}`} hue={k.avatarHue} size={32} />
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{k.firstName} {k.lastName}</span>
              <span className="text-sm text-muted tabular">{studentAverage(s, k.id, term)}%</span>
              <Badge tone={card?.status === "published" ? "leaf" : "neutral"}>{card?.status ?? "—"}</Badge>
              <Button size="sm" variant="ghost" onClick={() => setPreview(k.id)}>Preview</Button>
            </li>
          );
        })}
      </ul>
      <Dialog open={!!pv} onClose={() => setPreview(null)} title={pv ? `${pv.firstName} ${pv.lastName}` : ""} description={`${classById(s, classId)?.name} · ${term === PREVIOUS_TERM_ID ? "Third Term 2025/2026" : "First Term 2026/2027"}`} wide>
        <div className="grid gap-4">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted"><tr><th className="py-1">Subject</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
            <tbody>{pvRows.map((g) => <tr key={g.id} className="border-t border-hair tabular"><td className="py-1.5">{subjectById(g.subjectId).name}</td><td>{g.ca1 ?? "–"}</td><td>{g.ca2 ?? "–"}</td><td>{g.exam ?? "–"}</td><td className="font-semibold">{g.total}</td><td>{g.grade ?? "–"}</td></tr>)}</tbody>
          </table>
          {pvCard?.formTeacherComment && <p className="rounded-xl bg-sand p-3 text-sm italic">“{pvCard.formTeacherComment}” — {staffById(s, classById(s, classId)?.formTeacherId ?? null)?.name}</p>}
          {pvCard?.principalComment && <p className="text-sm">Principal: {pvCard.principalComment}</p>}
          <Button variant="outline" size="sm" icon={<Printer className="size-4" />} onClick={() => window.print()}>Print</Button>
        </div>
      </Dialog>
    </>
  );
}

// ───────────────────────── Notices ─────────────────────────

export function Notices({ canPost = true }: { canPost?: boolean }) {
  const s = useDemo();
  const form = useForm({ resolver: zodResolver(noticeSchema), defaultValues: { title: "", body: "", audience: "everyone" as const, pinned: false } });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;
  const list = s.notices.filter((n) => n.tenantId === HOME_SCHOOL_ID).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <PageHeader eyebrow="Notices" title="School notices" description="Targeted by audience. Learners never see staff notices; guardians see guardian and everyone notices." />
      <div className={cn("grid gap-6", canPost && "xl:grid-cols-[1fr_1.2fr]")}>
        {canPost && (
          <Panel title="New notice">
            <form noValidate onSubmit={handleSubmit(async (v) => { const r = await run(() => postNotice(v).then(() => true)); if (r) reset(); })} className="grid gap-4">
              <TextField label="Title" error={errors.title?.message} {...register("title")} />
              <TextareaField label="Message" rows={5} error={errors.body?.message} {...register("body")} />
              <SelectField label="Audience" {...register("audience")}>
                <option value="everyone">Everyone</option><option value="guardians">Guardians</option><option value="staff">Staff</option><option value="learners">Learners</option>
              </SelectField>
              <CheckboxField label="Pin to the top" {...register("pinned")} />
              <Button type="submit" loading={isSubmitting} icon={<Send className="size-4" />}>Publish notice</Button>
            </form>
          </Panel>
        )}
        <ul className="grid content-start gap-3">
          {list.map((n) => (
            <li key={n.id} className="rounded-3xl border border-line bg-paper p-5">
              <div className="flex flex-wrap items-center gap-2"><Badge tone="iris">{n.audience}</Badge>{n.pinned && <Badge tone="gold" icon={<Pin className="size-3" aria-hidden />}>Pinned</Badge>}<span className="text-xs text-muted">{fmtDateTime(n.publishedAt)} · {n.author}</span></div>
              <h2 className="mt-2 font-sans text-lg font-bold text-ink">{n.title}</h2>
              <p className="mt-1 text-sm text-body">{n.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ───────────────────────── Fees ─────────────────────────

export function Fees() {
  const s = useDemo();
  const [tab, setTab] = useState<"all" | "unpaid" | "part" | "paid">("all");
  const [pay, setPay] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = s.invoices.filter((i) => i.tenantId === HOME_SCHOOL_ID).map((i) => {
    const total = i.items.reduce((a, b) => a + b.amount, 0);
    const status = i.paid >= total ? "paid" : i.paid > 0 ? "part" : "unpaid";
    return { ...i, total, status, student: s.students.find((x) => x.id === i.studentId)! };
  });
  const list = rows.filter((r) => tab === "all" || r.status === tab);
  const billed = rows.reduce((a, r) => a + r.total, 0);
  const collected = rows.reduce((a, r) => a + r.paid, 0);
  const owing = rows.filter((r) => r.status !== "paid");
  const current = rows.find((r) => r.id === pay);
  return (
    <>
      <PageHeader eyebrow="Fees · First Term 2026/2027" title="Fees & payments" description="Invoices per learner, part-payments and reminders. Payments here are recorded in a mock ledger, no payment provider is connected." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-night p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-azure">Collected</p><p className="mt-1 font-display text-3xl font-semibold tabular">{naira(collected)}</p><Meter value={pct(collected, billed)} className="mt-3 bg-white/10" label="Collection rate" tone="azure" /></div>
        <div className="rounded-3xl border border-line bg-paper p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted">Outstanding</p><p className="mt-1 font-display text-3xl font-semibold text-ember tabular">{naira(billed - collected)}</p><p className="text-xs text-muted">{owing.length} families</p></div>
        <div className="rounded-3xl border border-line bg-paper p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted">Due date</p><p className="mt-1 font-display text-3xl font-semibold text-ink">30 Oct</p><Button size="sm" variant="outline" className="mt-2" icon={<Bell className="size-4" />} disabled={!owing.length} onClick={() => run(() => sendFeeReminders(owing.length))}>Remind {owing.length} families</Button></div>
      </div>
      <Tabs label="Invoice status" value={tab} onChange={setTab} className="mb-4" tabs={[
        { id: "all", label: "All", count: rows.length }, { id: "unpaid", label: "Unpaid", count: rows.filter((r) => r.status === "unpaid").length },
        { id: "part", label: "Part-paid", count: rows.filter((r) => r.status === "part").length }, { id: "paid", label: "Paid", count: rows.filter((r) => r.status === "paid").length },
      ]} />
      <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">Fee invoices</caption>
          <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Learner</th><th>Class</th><th>Invoice</th><th>Paid</th><th>Balance</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t border-hair">
                <td className="px-4 py-2.5 font-semibold text-ink">{r.student.firstName} {r.student.lastName}</td>
                <td className="text-muted">{classById(s, r.student.classId)?.name}</td>
                <td className="tabular">{naira(r.total)}</td>
                <td className="tabular">{naira(r.paid)}</td>
                <td className="font-semibold tabular text-ink">{naira(r.total - r.paid)}</td>
                <td><Badge tone={r.status === "paid" ? "leaf" : r.status === "part" ? "gold" : "ember"}>{r.status === "part" ? "part-paid" : r.status}</Badge></td>
                <td className="pr-3 text-right">{r.status !== "paid" && <Button size="sm" variant="ghost" onClick={() => { setPay(r.id); setAmount(String(r.total - r.paid)); }}>Record payment</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!current} onClose={() => setPay(null)} title="Record a payment" description={current ? `${current.student.firstName} ${current.student.lastName} · balance ${naira(current.total - current.paid)}` : ""}>
        {current && (
          <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); const r = await run(() => recordFeePayment(current.id, Number(amount), "demo_transfer").then(() => true)); setBusy(false); if (r) setPay(null); }}>
            <ul className="grid gap-1 rounded-2xl bg-ivory p-3 text-sm">{current.items.map((it) => <li key={it.label} className="flex justify-between"><span className="text-muted">{it.label}</span><span className="tabular">{naira(it.amount)}</span></li>)}</ul>
            <TextField label="Amount received (₦)" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
            <p className="text-xs text-muted">Recorded as a simulated bank transfer. <DemoBadge /></p>
            <Button type="submit" loading={busy} disabled={!Number(amount)}>Record {amount ? naira(Number(amount)) : ""}</Button>
          </form>
        )}
      </Dialog>
    </>
  );
}

// ───────────────────────── Analytics ─────────────────────────

export function Analytics() {
  const s = useDemo();
  const roster = s.students.filter((x) => x.tenantId === HOME_SCHOOL_ID);
  const subjectAvg = useMemo(() => {
    const ids = ["math", "eng", "bsc", "comp", "yor", "civ", "phy", "chem"];
    return ids.map((id) => {
      const rows = s.grades.filter((g) => g.termId === CURRENT_TERM_ID && g.subjectId === id && g.ca1 !== null);
      return { label: subjectById(id).short, value: rows.length ? Math.round((rows.reduce((a, g) => a + (g.ca1 ?? 0), 0) / rows.length / 20) * 100) : 0, highlight: id === "math" };
    });
  }, [s.grades]);
  const checks = weeklySummary(s, "stu-chidera");
  return (
    <>
      <PageHeader eyebrow="Analytics" title="How the school is doing" description="Sample analytics from fictional data. Production analytics are aggregated, tenant-scoped and never expose individual learners outside the school." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Attendance by class (term to date)">
          <Bars label="Attendance by class" max={100} format={(n) => `${n}%`} color="var(--color-indigo-deep)" data={s.classes.map((c) => ({ label: c.name.split(" ").slice(0, 2).join(" "), value: classAttendanceRate(s, c.id) }))} />
        </Panel>
        <Panel title="First CA average by subject">
          <Bars label="Average CA1 by subject" max={100} format={(n) => `${n}%`} data={subjectAvg} />
          <p className="mt-3 text-xs text-muted">Mathematics (gold) is the lowest, and JSS 3 Gold lost its maths teacher this term.</p>
        </Panel>
        <Panel title="Fee collection by class">
          <ul className="grid gap-3">
            {s.classes.map((c) => {
              const inv = s.invoices.filter((i) => roster.some((k) => k.id === i.studentId && k.classId === c.id));
              const billed = inv.reduce((a, i) => a + i.items.reduce((x, y) => x + y.amount, 0), 0);
              const paid = inv.reduce((a, i) => a + i.paid, 0);
              return <li key={c.id}><div className="flex justify-between text-sm"><span className="text-body">{c.name}</span><span className="font-semibold tabular">{pct(paid, billed)}%</span></div><Meter value={pct(paid, billed)} className="mt-1" label={`${c.name} fees collected`} tone="iris" /></li>;
            })}
          </ul>
        </Panel>
        <Panel title="Weekly check participation (JSS 3 example learner)">
          <Bars label="Weekly check results" max={100} format={(n) => `${n}%`} color="var(--color-leaf)" data={[...checks].reverse().flatMap((w) => [w.slot1, w.slot2].filter(Boolean).map((x, i) => ({ label: `W${w.week}${i ? "F" : "T"}`, value: Math.round((x!.score / x!.total) * 100) })))} />
        </Panel>
      </div>
    </>
  );
}
