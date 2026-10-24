"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Circle, FileCheck2, Gavel, GraduationCap, RotateCcw, ShieldCheck, Video, XCircle } from "lucide-react";
import type { VettingStage } from "@/lib/domain/types";
import { useDemo } from "@/lib/demo/store";
import { applicationSchema, PASS_MARKS, RUBRIC, recordTest, resetMyApplication, startApplication, submitAppeal, submitEvidence, toggleEvidence, type ApplicationInput } from "@/lib/services/vetting";
import { switchPersona } from "@/lib/services/session";
import { run } from "@/lib/services/core";
import { AGE_BANDS, SUBJECTS, subjectById } from "@/lib/seed/catalog";
import { cn } from "@/lib/utils";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/Field";

const STAGES: { id: VettingStage; label: string; icon: typeof Circle }[] = [
  { id: "application", label: "Application", icon: GraduationCap },
  { id: "evidence", label: "Evidence", icon: FileCheck2 },
  { id: "subject_test", label: "Subject test", icon: CheckCircle2 },
  { id: "safeguarding_test", label: "Safeguarding & pedagogy", icon: ShieldCheck },
  { id: "demo_class", label: "Demo class", icon: Video },
  { id: "decision", label: "Decision", icon: Gavel },
];
const order = (s: VettingStage) => {
  const i = STAGES.findIndex((x) => x.id === s);
  return i >= 0 ? i : s === "probation" || s === "approved" || s === "rejected" || s === "appeal" ? STAGES.length : 0;
};

const SUBJECT_TEST = [
  { q: "A learner says 0.5 × 0.5 = 2.5. What is the most useful first response?", o: ["Tell them the right answer is 0.25", "Ask them to estimate: is the answer bigger or smaller than 0.5?", "Move on to the next topic", "Give them 20 similar questions"], a: 1 },
  { q: "Solve 2(x − 3) = 10", o: ["x = 8", "x = 6.5", "x = 2", "x = 13"], a: 0 },
  { q: "Which explanation best shows why a negative times a negative is positive?", o: ["It's a rule to memorise", "Patterns: 3×(−2)=−6, 2×(−2)=−4 … continue to (−1)×(−2)", "Calculators say so", "Two minuses cancel like words"], a: 1 },
  { q: "The mean of 4, 7, 7 and 10 is…", o: ["7", "6", "28", "7.5"], a: 0 },
  { q: "A BECE question asks for the gradient between (1, 2) and (3, 8). It is…", o: ["2", "3", "6", "4"], a: 1 },
];

const SAFEGUARDING_TEST = [
  { q: "A 13-year-old learner asks for your WhatsApp number “to send homework faster”.", o: ["Share it, it's for homework", "Decline and keep communication in the Lumen thread the guardian can see", "Give your email instead", "Ask the learner not to tell anyone"], a: 1 },
  { q: "During a session a learner discloses that an adult at home hurts them.", o: ["Promise to keep it secret", "Listen calmly, don't promise secrecy, and report to the Lumen safeguarding lead immediately", "Confront the parent", "Investigate yourself"], a: 1 },
  { q: "A guardian asks to pay you directly to avoid fees.", o: ["Accept if they're happy", "Politely decline and explain all payments go through the platform", "Accept half", "Ignore the message"], a: 1 },
  { q: "A learner's camera shows their bedroom. What do you do?", o: ["Nothing", "Suggest a shared family space for future sessions, and note it in your session log", "End the session without explanation", "Ask for a photo of the room"], a: 1 },
  { q: "Which is the best way to check understanding?", o: ["“Do you understand?”", "Ask the learner to explain a step back or try a similar question", "Repeat the explanation louder", "Move faster"], a: 1 },
  { q: "A learner is struggling and becoming upset.", o: ["Push through the plan", "Pause, acknowledge the feeling, simplify the task and celebrate a small win", "End the session early and bill in full", "Tell the guardian the learner is lazy"], a: 1 },
];

export function ApplyFlow() {
  const s = useDemo();
  const app = s.tutorApplications.find((a) => a.id === s.myApplicationId);
  const stageIdx = app ? order(app.stage) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <ol className="flex gap-2 overflow-x-auto lg:grid lg:content-start" aria-label="Qualification stages">
        {STAGES.map((st, i) => {
          const done = i < stageIdx;
          const current = i === stageIdx;
          return (
            <li key={st.id} aria-current={current ? "step" : undefined} className={cn("flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold", current ? "bg-ink text-ivory" : done ? "bg-leaf-wash text-leaf" : "bg-paper text-muted")}>
              <st.icon className="size-4" aria-hidden /> {st.label}
            </li>
          );
        })}
        <li className={cn("flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold", app && ["probation", "approved"].includes(app.stage) ? "bg-gold text-ink" : "bg-paper text-muted")}>Probation</li>
      </ol>

      <div className="min-w-0">
        {!app && <ApplicationStep />}
        {app?.stage === "evidence" && (
          <Card title="Identity & qualification evidence" lead="This demo never collects real documents. Confirm what you would provide; production would use an identity-verification provider and encrypted, virus-scanned uploads viewed only by vetting staff.">
            <ul className="grid gap-2">
              {app.evidence.map((e, i) => (
                <li key={e.label}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-paper p-3.5 has-[:checked]:border-iris has-[:checked]:bg-iris-wash/60">
                    <input type="checkbox" className="accent-iris" checked={e.provided} onChange={() => run(() => toggleEvidence(app.id, i))} />
                    <span className="flex-1 text-sm font-semibold text-ink">{e.label}</span>
                    <DemoBadge label="Placeholder" />
                  </label>
                </li>
              ))}
            </ul>
            <Button className="mt-4" disabled={app.evidence.some((e) => !e.provided)} onClick={() => run(() => submitEvidence(app.id))}>Submit evidence</Button>
          </Card>
        )}
        {app?.stage === "subject_test" && <Quiz key="subject" title="Subject test" lead={`Five questions on content knowledge and how you'd explain it. Pass mark ${PASS_MARKS.subject}%.`} items={SUBJECT_TEST} onDone={(score) => recordTest(app.id, "subject", score)} />}
        {app?.stage === "safeguarding_test" && <Quiz key="safe" title="Safeguarding & pedagogy" lead={`Six real-world scenarios. Pass mark ${PASS_MARKS.safeguarding}%, safeguarding is non-negotiable.`} items={SAFEGUARDING_TEST} onDone={(score) => recordTest(app.id, "safeguarding", score)} />}
        {app?.stage === "demo_class" && (
          <Card title="Observed demo class" lead="You teach a 20-minute mini-lesson to a Lumen reviewer playing a learner. They score you 1–4 on five criteria; an average of 3 passes.">
            <ul className="grid gap-2">{RUBRIC.map((r) => <li key={r} className="flex items-center gap-2 rounded-xl bg-ivory px-3 py-2 text-sm text-body"><Circle className="size-3.5 text-iris" aria-hidden />{r}</li>)}</ul>
            <p className="mt-4 rounded-2xl bg-iris-wash p-4 text-sm text-iris-600">Your demo class is booked for Thu 29 Oct, 16:00 WAT (simulated). The reviewer step happens in the platform admin console.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={`/admin/tutors?app=${app.id}`} onClick={() => switchPersona("p-kemi")}>Open the reviewer view (as Kemi)</ButtonLink>
            </div>
          </Card>
        )}
        {app?.stage === "decision" && (
          <Card title="Awaiting decision" lead="All checks are complete. A reviewer makes the final decision, usually within two working days.">
            <ScoreSummary />
            <ButtonLink href={`/admin/tutors?app=${app.id}`} className="mt-4" onClick={() => switchPersona("p-kemi")}>Decide as the reviewer (Kemi)</ButtonLink>
          </Card>
        )}
        {app && (app.stage === "probation" || app.stage === "approved") && (
          <Card title="Approved, on probation" lead={app.decisionNote ?? ""}>
            <ScoreSummary />
            <p className="mt-4 text-sm text-body">Your first {app.probation?.sessionsRequired ?? 10} sessions are observed. Families see an “On probation” label. Full approval is reviewed on {app.probation ? new Date(app.probation.reviewOn).toDateString() : "the review date"}.</p>
          </Card>
        )}
        {app && app.stage === "rejected" && <Rejected />}
        {app && app.stage === "appeal" && (
          <Card title="Appeal submitted" lead="A different reviewer will look at your case. You'll be notified (simulated email).">
            <p className="rounded-2xl bg-sand p-4 text-sm italic text-body">“{app.appeal?.reason}”</p>
            <ButtonLink href={`/admin/tutors?app=${app.id}`} className="mt-4" onClick={() => switchPersona("p-kemi")}>Review the appeal (as Kemi)</ButtonLink>
          </Card>
        )}
        {app && (
          <button onClick={() => run(resetMyApplication)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><RotateCcw className="size-4" aria-hidden /> Start a fresh demo application</button>
        )}
      </div>
    </div>
  );
}

function Card({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
      <h2 className="text-3xl text-ink">{title}</h2>
      <p className="mt-2 text-muted">{lead}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ApplicationStep() {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema) as never,
    defaultValues: { fullName: "", city: "", subjects: [], ageBands: [], rate: 8000, experience: 3, bio: "" },
  });
  return (
    <Card title="Apply to teach on Lumen" lead="Use made-up details. This walks through the real qualification workflow with simulated checks.">
      <form noValidate onSubmit={handleSubmit((v) => run(() => startApplication(v)))} className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
          <TextField label="City" error={errors.city?.message} {...register("city")} />
          <TextField label="Hourly rate (₦)" type="number" error={errors.rate?.message} {...register("rate")} />
          <TextField label="Years teaching" type="number" error={errors.experience?.message} {...register("experience")} />
        </div>
        <Controller control={control} name="subjects" render={({ field }) => (
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Subjects (up to 3)</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUBJECTS.map((x) => {
                const on = field.value.includes(x.id);
                return <button type="button" key={x.id} aria-pressed={on} onClick={() => field.onChange(on ? field.value.filter((v) => v !== x.id) : [...field.value, x.id])} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", on ? "bg-ink text-ivory" : "bg-sand text-body hover:bg-iris-wash")}>{x.name}</button>;
              })}
            </div>
            {errors.subjects?.message && <p role="alert" className="mt-1 text-xs font-medium text-ember">{errors.subjects.message}</p>}
          </fieldset>
        )} />
        <Controller control={control} name="ageBands" render={({ field }) => (
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Age groups</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {AGE_BANDS.map((b) => {
                const on = field.value.includes(b.id);
                return <button type="button" key={b.id} aria-pressed={on} onClick={() => field.onChange(on ? field.value.filter((v) => v !== b.id) : [...field.value, b.id])} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", on ? "bg-ink text-ivory" : "bg-sand text-body hover:bg-iris-wash")}>{b.label}</button>;
              })}
            </div>
            {errors.ageBands?.message && <p role="alert" className="mt-1 text-xs font-medium text-ember">{errors.ageBands.message}</p>}
          </fieldset>
        )} />
        <TextareaField label="About your teaching" hint="Shown to families. 40–600 characters." error={errors.bio?.message} {...register("bio")} />
        <Button type="submit" loading={isSubmitting} className="w-fit">Submit application <ArrowRight className="size-4" /></Button>
      </form>
    </Card>
  );
}

function Quiz({ title, lead, items, onDone }: { title: string; lead: string; items: { q: string; o: string[]; a: number }[]; onDone: (score: number) => Promise<boolean> }) {
  const [ans, setAns] = useState<number[]>(items.map(() => -1));
  const [busy, setBusy] = useState(false);
  return (
    <Card title={title} lead={lead}>
      <ol className="grid gap-4">
        {items.map((it, i) => (
          <li key={i}>
            <fieldset>
              <legend className="font-semibold text-ink">{i + 1}. {it.q}</legend>
              <div className="mt-2 grid gap-1.5">
                {it.o.map((o, k) => (
                  <label key={k} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm has-[:checked]:border-iris has-[:checked]:bg-iris-wash/60">
                    <input type="radio" name={`q${i}`} className="accent-iris" checked={ans[i] === k} onChange={() => setAns((x) => x.map((v, j) => (j === i ? k : v)))} />{o}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <Button className="mt-5" loading={busy} disabled={ans.some((a) => a < 0)} onClick={async () => {
        setBusy(true);
        const score = Math.round((ans.filter((a, i) => a === items[i].a).length / items.length) * 100);
        await run(() => onDone(score));
        setBusy(false);
      }}>Submit test</Button>
      <p className="mt-2 text-xs text-muted">Tip: to see the appeal path, answer some safeguarding questions wrongly.</p>
    </Card>
  );
}

function ScoreSummary() {
  const s = useDemo();
  const app = s.tutorApplications.find((a) => a.id === s.myApplicationId)!;
  const avg = app.rubric.filter((r) => r.score !== null).reduce((a, r, _, arr) => a + (r.score ?? 0) / arr.length, 0);
  return (
    <dl className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-2xl bg-ivory p-3"><dt className="text-xs font-bold uppercase text-muted">Subject test</dt><dd className="font-display text-2xl font-semibold text-ink">{app.subjectTestScore ?? "–"}%</dd></div>
      <div className="rounded-2xl bg-ivory p-3"><dt className="text-xs font-bold uppercase text-muted">Safeguarding</dt><dd className="font-display text-2xl font-semibold text-ink">{app.safeguardingScore ?? "–"}%</dd></div>
      <div className="rounded-2xl bg-ivory p-3"><dt className="text-xs font-bold uppercase text-muted">Demo class</dt><dd className="font-display text-2xl font-semibold text-ink">{avg ? `${avg.toFixed(1)}/4` : "–"}</dd></div>
      <div className="sm:col-span-3"><Badge tone="iris">{app.subjects.map((x) => subjectById(x).short).join(" · ")}</Badge></div>
    </dl>
  );
}

function Rejected() {
  const s = useDemo();
  const app = s.tutorApplications.find((a) => a.id === s.myApplicationId)!;
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Card title="Not approved this time" lead={app.decisionNote ?? "Your application did not meet the standard."}>
      <p className="flex items-center gap-2 text-sm text-ember"><XCircle className="size-4" aria-hidden /> You can appeal once, or re-apply after 30 days.</p>
      <form className="mt-4 grid gap-3" onSubmit={async (e) => { e.preventDefault(); setBusy(true); await run(() => submitAppeal(app.id, reason)); setBusy(false); }}>
        <TextareaField label="Your appeal" value={reason} onChange={(e) => setReason(e.target.value)} hint="Explain what went wrong or what the reviewer should reconsider (20+ characters)." />
        <Button type="submit" loading={busy} className="w-fit">Submit appeal</Button>
      </form>
      <p className="mt-4 text-xs text-muted">Appeals are decided by a different reviewer. <Link href="/safeguarding" className="font-semibold text-iris-600">Our standards</Link></p>
    </Card>
  );
}
