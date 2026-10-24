"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ClipboardCheck, NotebookPen, Plus } from "lucide-react";
import { useDemo, usePersona } from "@/lib/demo/store";
import { assignmentSchema, createAssignment, gradeSubmission } from "@/lib/services/school";
import { run } from "@/lib/services/core";
import { classById, teacherClasses, timetableFor, TODAY } from "@/lib/selectors";
import { subjectById } from "@/lib/seed/catalog";
import { DEMO_NOW, fmtDateTime, fmtDay } from "@/lib/time";
import { cn } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/Misc";

export function TeacherToday() {
  const s = useDemo();
  const persona = usePersona();
  const classes = teacherClasses(s, persona.subjectId);
  const lessons = classes.flatMap((c) =>
    timetableFor(c.id).filter((t) => t.day === 1 && c.subjectTeachers[t.subjectId] === persona.subjectId).map((t) => ({ ...t, cls: c })),
  ).sort((a, b) => a.start.localeCompare(b.start));
  const toGrade = s.assignments.filter((a) => a.setBy === persona.subjectId).flatMap((a) => a.submissions.filter((x) => x.status === "submitted").map((x) => ({ a, x })));
  const marked = new Set(s.attendance.filter((a) => a.date === TODAY).map((a) => a.classId));
  const nowHHMM = "10:00";
  return (
    <>
      <PageHeader eyebrow={`${fmtDay(DEMO_NOW)} · Iroko Gate`} title={`Good morning, ${persona.shortName}.`} description={`You teach ${classes.length} classes. ${lessons.length} lessons today.`} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Today's lessons">
          {lessons.length === 0 ? <EmptyState title="No lessons today" body="If you were just assigned a class, your timetable updates immediately." /> : (
            <ol className="relative grid gap-3 border-l-2 border-leaf/30 pl-5">
              {lessons.map((l) => {
                const past = l.end <= nowHHMM;
                const nowL = l.start <= nowHHMM && l.end > nowHHMM;
                return (
                  <li key={l.id} className="relative">
                    <span className={cn("absolute -left-[1.6rem] top-3 size-3 rounded-full ring-4 ring-paper", nowL ? "bg-gold" : past ? "bg-leaf" : "bg-line")} />
                    <div className={cn("flex flex-wrap items-center gap-3 rounded-2xl p-3", nowL ? "bg-gold-wash" : "bg-ivory")}>
                      <span className="w-24 text-sm font-semibold text-ink tabular">{l.start}–{l.end}</span>
                      <span className="flex-1"><span className="block font-semibold text-ink">{subjectById(l.subjectId).name}</span><span className="text-xs text-muted">{l.cls.name} · Room {l.cls.room}</span></span>
                      {nowL && <Badge tone="gold">Now</Badge>}
                      {!marked.has(l.cls.id) && <ButtonLink href={`/teacher/attendance?class=${l.cls.id}`} size="sm" variant="outline" icon={<ClipboardCheck className="size-4" />}>Register</ButtonLink>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title="Waiting for grading" action={<Link href="/teacher/assignments" className="text-sm font-semibold text-iris-600 hover:underline">Assignments</Link>}>
            <p className="font-display text-4xl font-semibold text-ink tabular">{toGrade.length}</p>
            <p className="text-sm text-muted">submissions across {new Set(toGrade.map((t) => t.a.id)).size} assignments</p>
          </Panel>
          <Panel title="My classes">
            <ul className="grid gap-2">
              {classes.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-xl bg-ivory px-3 py-2 text-sm">
                  <span className="font-semibold text-ink">{c.name}</span>
                  <span className="text-xs text-muted">{Object.entries(c.subjectTeachers).filter(([, t]) => t === persona.subjectId).map(([sub]) => subjectById(sub).short).join(", ")}{c.formTeacherId === persona.subjectId ? " · form teacher" : ""}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function TeacherAssignments() {
  const s = useDemo();
  const persona = usePersona();
  const classes = teacherClasses(s, persona.subjectId);
  const mine = s.assignments.filter((a) => a.setBy === persona.subjectId);
  const [open, setOpen] = useState(false);
  const [grading, setGrading] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const form = useForm({ resolver: zodResolver(assignmentSchema), defaultValues: { classId: classes[0]?.id ?? "", subjectId: "math", title: "", brief: "", dueDay: 3, maxScore: 20 } });
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = form;
  const selClass = classById(s, watch("classId"));
  const subjects = selClass ? Object.entries(selClass.subjectTeachers).filter(([, t]) => t === persona.subjectId).map(([sub]) => sub) : [];
  const g = mine.find((a) => a.id === grading);

  return (
    <>
      <PageHeader eyebrow="Assignments" title="Set work, grade work" actions={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => setOpen(true)} disabled={!classes.length}>New assignment</Button>} />
      <ul className="grid gap-3">
        {mine.length === 0 && <EmptyState icon={<NotebookPen className="size-5" />} title="No assignments yet" />}
        {mine.map((a) => {
          const submitted = a.submissions.filter((x) => x.status !== "not_started").length;
          const graded = a.submissions.filter((x) => x.status === "graded").length;
          return (
            <li key={a.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-paper p-5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-leaf">{classById(s, a.classId)?.name} · {subjectById(a.subjectId).short}</p>
                <p className="font-semibold text-ink">{a.title}</p>
                <p className="text-sm text-muted">Due {fmtDateTime(a.dueAt)} · {submitted}/{a.submissions.length} submitted · {graded} graded</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setGrading(a.id); setScores({}); }} disabled={submitted === 0}>Grade</Button>
            </li>
          );
        })}
      </ul>

      <Dialog open={open} onClose={() => setOpen(false)} title="New assignment" description="Learners in the class see it on their dashboard immediately.">
        <form noValidate className="grid gap-4" onSubmit={handleSubmit(async (v) => { const r = await run(() => createAssignment(v).then(() => true)); if (r) { reset(); setOpen(false); } })}>
          <SelectField label="Class" error={errors.classId?.message} {...register("classId")}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectField>
          <SelectField label="Subject" error={errors.subjectId?.message} {...register("subjectId")}>{subjects.map((x) => <option key={x} value={x}>{subjectById(x).name}</option>)}</SelectField>
          <TextField label="Title" error={errors.title?.message} {...register("title")} />
          <TextareaField label="Instructions" error={errors.brief?.message} {...register("brief")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Due" {...register("dueDay")}>{[1, 2, 3, 4, 7, 8].map((d) => <option key={d} value={d}>{fmtDay(new Date(new Date("2026-10-26T12:00:00+01:00").getTime() + d * 86_400_000))}</option>)}</SelectField>
            <TextField label="Marks" type="number" error={errors.maxScore?.message} {...register("maxScore")} />
          </div>
          <Button type="submit" loading={isSubmitting}>Set assignment</Button>
        </form>
      </Dialog>

      <Dialog open={!!g} onClose={() => setGrading(null)} title={g ? `Grade: ${g.title}` : ""} description={g ? `Out of ${g.maxScore}. Learners and guardians see the score and comment.` : ""} wide>
        {g && (
          <ul className="grid gap-2">
            {g.submissions.filter((x) => x.status !== "not_started").map((sub) => {
              const st = s.students.find((x) => x.id === sub.studentId)!;
              return (
                <li key={sub.studentId} className="flex flex-wrap items-center gap-3 rounded-2xl bg-ivory p-3">
                  <span className="min-w-0 flex-1 font-semibold text-ink">{st.firstName} {st.lastName}</span>
                  <span className="text-xs text-muted">work.pdf (placeholder)</span>
                  {sub.status === "graded" ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-leaf"><CheckCircle2 className="size-4" aria-hidden />{sub.score}/{g.maxScore}</span>
                  ) : (
                    <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); run(() => gradeSubmission(g.id, st.id, Number(scores[st.id] ?? -1), "Good work, see comments in class.")); }}>
                      <input aria-label={`Score for ${st.firstName}`} inputMode="numeric" value={scores[st.id] ?? ""} onChange={(e) => setScores((x) => ({ ...x, [st.id]: e.target.value.replace(/[^\d]/g, "") }))} className="w-16 rounded-lg border border-line bg-paper px-2 py-1.5 text-center tabular" />
                      <Button type="submit" size="sm" disabled={!scores[st.id]}>Save</Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Dialog>
    </>
  );
}
