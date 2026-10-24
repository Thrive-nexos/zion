"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertOctagon, ArrowRight, Building2, Check, Download, Flag, GraduationCap, Inbox, Lock, Search, ShieldAlert, Unlock, X } from "lucide-react";
import type { ReportSeverity, SafetyReport } from "@/lib/domain/types";
import { useDemo } from "@/lib/demo/store";
import { run } from "@/lib/services/core";
import {
  decideSchool, decideTournamentAppeal, moderateMessage, resolveDispute, setContentStatus, toggleSchoolChecklist, unlockThread, updateReport, verifyResults,
} from "@/lib/services/platform";
import { decideAppeal, decideApplication, RUBRIC, scoreDemoClass } from "@/lib/services/vetting";
import { schoolById } from "@/lib/selectors";
import { subjectById } from "@/lib/seed/catalog";
import { fmtDateTime, relativeToDemo } from "@/lib/time";
import { cn, naira } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bars } from "@/components/ui/Charts";
import { EmptyState } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Tabs";

const SEV: Record<ReportSeverity, { tone: "ember" | "amber" | "azure" | "neutral"; rank: number }> = {
  critical: { tone: "ember", rank: 0 }, high: { tone: "ember", rank: 1 }, medium: { tone: "amber", rank: 2 }, low: { tone: "azure", rank: 3 },
};

const darkInput = "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none";

// ───────────────────────── Overview ─────────────────────────

export function AdminOverview() {
  const s = useDemo();
  const openReports = s.reports.filter((r) => r.status !== "resolved");
  const held = s.messages.filter((m) => m.moderation.verdict !== "clean");
  const queues = [
    { href: "/admin/safety", label: "Safety reports", n: openReports.length, sub: `${openReports.filter((r) => r.severity === "critical" || r.severity === "high").length} high/critical`, icon: ShieldAlert, hot: openReports.some((r) => r.severity === "critical") },
    { href: "/admin/moderation", label: "Moderation queue", n: held.filter((m) => m.moderation.verdict === "held").length, sub: `${s.threads.filter((t) => t.status === "locked").length} locked threads`, icon: Inbox },
    { href: "/admin/tutors", label: "Tutor vetting", n: s.tutorApplications.filter((a) => !["approved", "rejected", "probation"].includes(a.stage)).length, sub: "applications in progress", icon: GraduationCap },
    { href: "/admin/schools", label: "School approvals", n: s.schoolApplications.filter((a) => a.status === "pending" || a.status === "site_visit").length, sub: "awaiting decision", icon: Building2 },
    { href: "/admin/disputes", label: "Disputes", n: s.disputes.filter((d) => d.status === "open" || d.status === "awaiting_evidence").length, sub: "open", icon: Flag },
  ];
  const completed = s.bookings.filter((b) => b.status === "completed");
  return (
    <>
      <PageHeader dark eyebrow="Platform console · Trust & Safety" title="Mission control" description="Everything that needs a human decision, sorted by urgency. Every action here is written to the audit log." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {queues.map((q) => (
          <Link key={q.href} href={q.href} className={cn("group rounded-3xl border p-5 transition-colors", q.hot ? "border-ember/60 bg-ember/10" : "border-white/10 bg-white/[0.04] hover:border-gold/60")}>
            <q.icon className={cn("size-5", q.hot ? "text-ember" : "text-gold")} aria-hidden />
            <p className="mt-3 font-display text-4xl font-semibold text-white tabular">{q.n}</p>
            <p className="font-semibold text-white">{q.label}</p>
            <p className="text-xs text-iris-soft">{q.sub}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel dark title="Platform at a glance (sample)">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Schools on Lumen", s.schools.filter((x) => x.onPlatform).length], ["Verified schools", s.schools.filter((x) => x.verification === "verified").length],
              ["Active tutors", s.tutors.filter((t) => ["approved", "probation"].includes(t.stage)).length], ["Sessions completed", completed.length],
            ].map(([k, v]) => <div key={k as string}><dt className="text-xs text-iris-soft">{k}</dt><dd className="font-display text-3xl font-semibold text-white tabular">{v}</dd></div>)}
          </dl>
          <p className="mt-4 text-xs text-white/50">Counts come from the demo dataset only.</p>
        </Panel>
        <Panel dark title="Latest audit events" action={<Link href="/admin/audit" className="text-sm font-semibold text-gold hover:underline">Audit log</Link>}>
          <ul className="grid gap-2 text-sm">
            {s.audit.slice(0, 6).map((a) => <li key={a.id} className="flex justify-between gap-3"><span className="text-white/90">{a.summary}</span><span className="shrink-0 text-xs text-white/50">{relativeToDemo(a.at)}</span></li>)}
          </ul>
        </Panel>
      </div>
    </>
  );
}

// ───────────────────────── Schools ─────────────────────────

export function AdminSchools() {
  const s = useDemo();
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <>
      <PageHeader dark eyebrow="School approvals" title="Verify before anyone enrols" description="References are recorded, never real documents, in this demo. Approval switches on the directory badge, invitations and competitions." />
      <div className="grid gap-4 lg:grid-cols-2">
        {s.schoolApplications.map((a) => {
          const sch = schoolById(s, a.schoolId)!;
          const done = a.checklist.filter((c) => c.done).length;
          const decided = a.status === "approved" || a.status === "rejected";
          return (
            <article key={a.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h2 className="font-sans text-lg font-bold text-white">{sch.name}</h2><p className="text-sm text-iris-soft">{sch.area}, {sch.city} · submitted {fmtDateTime(a.submittedAt)}</p></div>
                <Badge tone={a.status === "approved" ? "leaf" : a.status === "rejected" ? "ember" : "amber"}>{a.status.replace("_", " ")}</Badge>
              </div>
              <ul className="mt-4 grid gap-1.5">
                {a.checklist.map((c, i) => (
                  <li key={c.label}><label className="flex cursor-pointer items-center gap-2 text-sm text-white/90"><input type="checkbox" checked={c.done} disabled={decided} onChange={() => run(() => toggleSchoolChecklist(a.id, i))} className="accent-gold" />{c.label}</label></li>
                ))}
              </ul>
              {a.note && <p className="mt-3 text-xs text-iris-soft">Note: {a.note}</p>}
              {!decided && (
                <div className="mt-4 grid gap-2">
                  <input aria-label={`Decision note for ${sch.name}`} placeholder="Decision note (optional)" value={notes[a.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))} className={darkInput} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="gold" disabled={done < a.checklist.length} onClick={() => run(() => decideSchool(a.id, true, notes[a.id] ?? ""))} icon={<Check className="size-4" />}>Approve ({done}/{a.checklist.length})</Button>
                    <Button size="sm" variant="light" onClick={() => run(() => decideSchool(a.id, false, notes[a.id] ?? "Incomplete verification"))} icon={<X className="size-4" />}>Reject</Button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

// ───────────────────────── Tutor vetting ─────────────────────────

export function AdminTutors() {
  const s = useDemo();
  const params = useSearchParams();
  const [sel, setSel] = useState<string | null>(params.get("app"));
  const [scores, setScores] = useState<number[]>(RUBRIC.map(() => 3));
  const [note, setNote] = useState("");
  const app = s.tutorApplications.find((a) => a.id === sel);
  const columns = [
    { label: "Evidence & tests", stages: ["application", "evidence", "subject_test", "safeguarding_test"] },
    { label: "Demo class", stages: ["demo_class"] },
    { label: "Decision", stages: ["decision"] },
    { label: "Appeals", stages: ["appeal"] },
    { label: "Closed", stages: ["probation", "approved", "rejected"] },
  ];
  return (
    <>
      <PageHeader dark eyebrow="Tutor vetting" title="Six stages, two reviewers for appeals" description="Pass marks: subject 70%, safeguarding 80%, demo-class rubric average 3/4. Every decision is logged with the reviewer's name." />
      <div className="grid gap-3 overflow-x-auto pb-2 lg:grid-cols-5">
        {columns.map((c) => (
          <div key={c.label} className="min-w-[14rem] rounded-3xl border border-white/10 bg-white/[0.03] p-3">
            <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-gold">{c.label}</p>
            <ul className="grid gap-2">
              {s.tutorApplications.filter((a) => c.stages.includes(a.stage)).map((a) => (
                <li key={a.id}>
                  <button onClick={() => { setSel(a.id); setScores(RUBRIC.map(() => 3)); setNote(""); }} className={cn("w-full rounded-2xl p-3 text-left", sel === a.id ? "bg-gold text-ink" : "bg-white/5 text-white hover:bg-white/10")}>
                    <p className="font-semibold">{a.applicantName}</p>
                    <p className={cn("text-xs", sel === a.id ? "text-ink/70" : "text-iris-soft")}>{a.subjects.map((x) => subjectById(x).short).join(", ")} · {a.stage.replace("_", " ")}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {app ? (
        <section className="mt-6 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-2" aria-label={`Application from ${app.applicantName}`}>
          <div className="grid content-start gap-3">
            <h2 className="text-2xl text-white">{app.applicantName}</h2>
            <p className="text-sm text-iris-soft">Submitted {fmtDateTime(app.submittedAt)} · {app.subjects.map((x) => subjectById(x).name).join(", ")}</p>
            <ul className="grid gap-1.5 text-sm">
              {app.evidence.map((e) => <li key={e.label} className="flex items-center gap-2 text-white/90">{e.provided ? <Check className="size-4 text-leaf" aria-hidden /> : <X className="size-4 text-ember" aria-hidden />}{e.label}</li>)}
            </ul>
            <div className="flex flex-wrap gap-2"><Badge tone={(app.subjectTestScore ?? 0) >= 70 ? "leaf" : "neutral"}>Subject {app.subjectTestScore ?? "–"}%</Badge><Badge tone={(app.safeguardingScore ?? 0) >= 80 ? "leaf" : app.safeguardingScore === null ? "neutral" : "ember"}>Safeguarding {app.safeguardingScore ?? "–"}%</Badge></div>
            {app.decisionNote && <p className="text-sm text-iris-soft">Note: {app.decisionNote}</p>}
            {app.appeal && <p className="rounded-2xl bg-white/5 p-3 text-sm text-white/90">Appeal ({app.appeal.status}): “{app.appeal.reason}”</p>}
            <DemoBadge label="Identity & documents simulated" />
          </div>
          <div className="grid content-start gap-3">
            {app.stage === "demo_class" && (
              <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); run(() => scoreDemoClass(app.id, scores, note)); }}>
                <h3 className="font-sans text-base font-bold text-white">Demo-class rubric (1–4)</h3>
                {RUBRIC.map((r, i) => (
                  <fieldset key={r} className="flex flex-wrap items-center justify-between gap-2">
                    <legend className="sr-only">{r}</legend>
                    <span className="text-sm text-white/90">{r}</span>
                    <span className="flex gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <label key={n} className={cn("grid size-9 cursor-pointer place-items-center rounded-lg text-sm font-bold", scores[i] === n ? "bg-gold text-ink" : "bg-white/10 text-white")}>
                          <input type="radio" name={`r${i}`} className="sr-only" checked={scores[i] === n} onChange={() => setScores((x) => x.map((v, j) => (j === i ? n : v)))} />{n}
                        </label>
                      ))}
                    </span>
                  </fieldset>
                ))}
                <input aria-label="Reviewer note" placeholder="Reviewer note" value={note} onChange={(e) => setNote(e.target.value)} className={darkInput} />
                <Button type="submit" variant="gold" size="sm">Save rubric (avg {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)})</Button>
              </form>
            )}
            {app.stage === "decision" && (
              <div className="grid gap-3">
                <h3 className="font-sans text-base font-bold text-white">Decision</h3>
                <p className="text-sm text-iris-soft">Rubric average: {(app.rubric.reduce((a, r) => a + (r.score ?? 0), 0) / Math.max(1, app.rubric.length)).toFixed(1)} / 4</p>
                <input aria-label="Decision note" placeholder="Decision note" value={note} onChange={(e) => setNote(e.target.value)} className={darkInput} />
                <div className="flex gap-2">
                  <Button size="sm" variant="gold" onClick={() => run(() => decideApplication(app.id, "probation", note))}>Approve on probation</Button>
                  <Button size="sm" variant="light" onClick={() => run(() => decideApplication(app.id, "rejected", note))}>Decline</Button>
                </div>
              </div>
            )}
            {app.stage === "appeal" && (
              <div className="grid gap-3">
                <h3 className="font-sans text-base font-bold text-white">Appeal decision (second reviewer)</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="gold" onClick={() => run(() => decideAppeal(app.id, true))}>Uphold, allow re-sit</Button>
                  <Button size="sm" variant="light" onClick={() => run(() => decideAppeal(app.id, false))}>Dismiss</Button>
                </div>
              </div>
            )}
            {["application", "evidence", "subject_test", "safeguarding_test"].includes(app.stage) && <p className="text-sm text-iris-soft">Waiting on the applicant to finish this stage.</p>}
            {["probation", "approved", "rejected"].includes(app.stage) && <p className="text-sm text-iris-soft">Closed: {app.stage}. {app.probation && `Probation: ${app.probation.sessionsDone}/${app.probation.sessionsRequired} observed sessions.`}</p>}
            <Link href="/become-a-tutor" className="text-sm font-semibold text-gold hover:underline">Applicant&apos;s view →</Link>
          </div>
        </section>
      ) : <div className="mt-6"><EmptyState title="Select an application" body="Pick a card above to review it." /></div>}
    </>
  );
}

// ───────────────────────── Safety ─────────────────────────

export function AdminSafety() {
  const s = useDemo();
  const [tab, setTab] = useState<"open" | "resolved">("open");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const list = s.reports.filter((r) => (tab === "open" ? r.status !== "resolved" : r.status === "resolved")).sort((a, b) => SEV[a.severity].rank - SEV[b.severity].rank || b.createdAt.localeCompare(a.createdAt));
  const act = (r: SafetyReport, status: SafetyReport["status"]) => run(() => updateReport(r.id, status, notes[r.id]));
  return (
    <>
      <PageHeader dark eyebrow="Safety reports" title="Safeguarding queue" description="Sorted by severity. SLAs: critical 1h, high 4h, medium 24h, low 72h. Escalation routes to the Designated Safeguarding Lead." />
      <Tabs variant="dark" label="Report status" value={tab} onChange={setTab} className="mb-4" tabs={[{ id: "open", label: "Open", count: s.reports.filter((r) => r.status !== "resolved").length }, { id: "resolved", label: "Resolved" }]} />
      <ul className="grid gap-3">
        {list.map((r) => (
          <li key={r.id} className={cn("rounded-3xl border p-5", r.severity === "critical" ? "border-ember/60 bg-ember/10" : "border-white/10 bg-white/[0.04]")}>
            <div className="flex flex-wrap items-start gap-3">
              {r.severity === "critical" ? <AlertOctagon className="size-6 text-ember" aria-hidden /> : <ShieldAlert className="size-6 text-gold" aria-hidden />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Badge tone={SEV[r.severity].tone}>{r.severity}</Badge><Badge tone="neutral">{r.category.replace("_", " ")}</Badge><span className="text-xs text-iris-soft">{fmtDateTime(r.createdAt)} · SLA {r.slaHours}h · reporter: {r.reporterRole.replace("_", " ")}</span></div>
                <h2 className="mt-1 font-sans text-base font-bold text-white">{r.subject}</h2>
                <p className="text-sm text-white/80">{r.detail}</p>
                <p className="mt-1 text-xs text-iris-soft">Target: {r.targetLabel} · Assignee: {r.assignee ?? "unassigned"} · Status: {r.status}</p>
                {r.notes.length > 0 && <ul className="mt-2 grid gap-1 text-xs text-white/70">{r.notes.map((n) => <li key={n}>• {n}</li>)}</ul>}
              </div>
            </div>
            {r.status !== "resolved" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <input aria-label="Case note" placeholder="Add a case note" value={notes[r.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} className={cn(darkInput, "min-w-[12rem] flex-1")} />
                {r.status === "new" && <Button size="sm" variant="light" onClick={() => act(r, "triaged")}>Triage</Button>}
                {r.status !== "escalated" && <Button size="sm" variant="danger" onClick={() => act(r, "escalated")}>Escalate to DSL</Button>}
                <Button size="sm" variant="gold" onClick={() => act(r, "resolved")}>Resolve</Button>
              </div>
            )}
          </li>
        ))}
        {list.length === 0 && <EmptyState title="Nothing here" />}
      </ul>
    </>
  );
}

// ───────────────────────── Moderation ─────────────────────────

export function AdminModeration() {
  const s = useDemo();
  const flagged = s.messages.filter((m) => m.moderation.verdict !== "clean");
  const locked = s.threads.filter((t) => t.status === "locked");
  return (
    <>
      <PageHeader dark eyebrow="Moderation queue" title="Held and blocked messages" description="Held messages never reach the learner. Reviewers can release a false positive or reject it and warn the sender." />
      {locked.length > 0 && (
        <Panel dark title="Locked threads" className="mb-4">
          <ul className="grid gap-2">{locked.map((t) => <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-white"><Lock className="size-4 text-ember" aria-hidden />{t.subject}</span><Button size="sm" variant="light" icon={<Unlock className="size-4" />} onClick={() => run(() => unlockThread(t.id))}>Unlock after review</Button></li>)}</ul>
        </Panel>
      )}
      <ul className="grid gap-3">
        {flagged.map((m) => {
          const thread = s.threads.find((t) => t.id === m.threadId);
          return (
            <li key={m.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-center gap-2"><Badge tone={m.moderation.verdict === "blocked" ? "ember" : "amber"}>{m.moderation.verdict}</Badge><span className="text-xs text-iris-soft">{thread?.subject} · {m.authorName} ({m.authorRole}) · {fmtDateTime(m.at)}</span></div>
              <p className="mt-2 rounded-2xl bg-white/5 p-3 text-sm text-white">“{m.body}”</p>
              <p className="mt-2 text-xs text-iris-soft">Reasons: {m.moderation.reasons.join("; ")}</p>
              {m.moderation.verdict === "held" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="light" onClick={() => run(() => moderateMessage(m.id, true))}>Release (false positive)</Button>
                  <Button size="sm" variant="danger" onClick={() => run(() => moderateMessage(m.id, false))}>Reject & warn sender</Button>
                </div>
              )}
            </li>
          );
        })}
        {flagged.length === 0 && <EmptyState title="Queue is clear" />}
      </ul>
    </>
  );
}

// ───────────────────────── Disputes ─────────────────────────

export function AdminDisputes() {
  const s = useDemo();
  return (
    <>
      <PageHeader dark eyebrow="Disputes" title="Booking disputes" description="Attendance logs are attached automatically. Refunds are mock ledger entries." />
      <ul className="grid gap-3 lg:grid-cols-2">
        {s.disputes.map((d) => (
          <li key={d.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-white">{d.bookingRef} · {naira(d.amountNGN)}</p><Badge tone={d.status === "open" ? "amber" : d.status === "awaiting_evidence" ? "azure" : "leaf"}>{d.status.replace("_", " ")}</Badge></div>
            <p className="mt-1 text-sm text-white/80">Raised by {d.raisedBy}: {d.reason}</p>
            <ol className="mt-3 grid gap-1 border-l border-white/15 pl-3 text-xs text-iris-soft">{d.timeline.map((t) => <li key={t.at + t.text}>{fmtDateTime(t.at)}, {t.text}</li>)}</ol>
            {(d.status === "open" || d.status === "awaiting_evidence") && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="gold" onClick={() => run(() => resolveDispute(d.id, "refunded"))}>Full refund</Button>
                <Button size="sm" variant="light" onClick={() => run(() => resolveDispute(d.id, "partial_refund"))}>Partial</Button>
                <Button size="sm" variant="light" onClick={() => run(() => resolveDispute(d.id, "rejected"))}>Reject</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

// ───────────────────────── Content ─────────────────────────

export function AdminContent() {
  const s = useDemo();
  return (
    <>
      <PageHeader dark eyebrow="Content" title="Content review" description="Anything shown to under-18s is reviewed. Child-directed content cannot carry ads or external links; clinical content needs a qualified reviewer." />
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[48rem] text-sm">
          <caption className="sr-only">Content items</caption>
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-iris-soft"><tr><th className="px-4 py-3">Item</th><th>Type</th><th>Owner</th><th>Audience</th><th>Flags</th><th>Status</th><th /></tr></thead>
          <tbody>
            {s.content.map((c) => (
              <tr key={c.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-3 font-semibold text-white">{c.title}</td>
                <td>{c.kind}</td><td>{c.owner}</td><td>{c.ageBands.join(", ")}</td>
                <td className="max-w-[14rem] text-xs text-amber">{c.flags.join("; ") || "—"}</td>
                <td><Badge tone={c.status === "published" ? "leaf" : c.status === "rejected" ? "ember" : c.status === "in_review" ? "amber" : "neutral"}>{c.status.replace("_", " ")}</Badge></td>
                <td className="pr-3">
                  <select aria-label={`Status for ${c.title}`} value={c.status} onChange={(e) => run(() => setContentStatus(c.id, e.target.value as typeof c.status))} className="rounded-lg border border-white/15 bg-[#161616] px-2 py-1 text-xs text-white">
                    <option value="draft">Draft</option><option value="in_review">In review</option><option value="published">Published</option><option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ───────────────────────── Competitions ─────────────────────────

export function AdminCompetitions() {
  const s = useDemo();
  return (
    <>
      <PageHeader dark eyebrow="Competitions" title="Verification & appeals" description="Provisional results stay hidden from the public leaderboard until verified." />
      <div className="grid gap-4 lg:grid-cols-2">
        {s.tournaments.map((t) => {
          const pending = t.results.filter((r) => !r.verified).length;
          const regs = t.registrations.filter((r) => r.status === "opted_in").length;
          return (
            <Panel dark key={t.id} title={t.title} action={<Badge tone={t.status === "live" ? "gold" : "neutral"}>{t.status}</Badge>}>
              <p className="text-sm text-white/80">{pending} provisional results · {regs} registrations awaiting eligibility check</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="gold" disabled={pending + regs === 0} onClick={() => run(() => verifyResults(t.id))}>Verify all pending</Button>
                <Link href={`/competitions/${t.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">Public page <ArrowRight className="size-4" aria-hidden /></Link>
              </div>
            </Panel>
          );
        })}
      </div>
      <Panel dark title="Appeals" className="mt-6">
        <ul className="grid gap-3">
          {s.appeals.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 text-white/90"><strong className="text-white">{schoolById(s, a.schoolId)?.name}</strong> · round {a.round}: {a.reason}</span>
              <Badge tone={a.status === "upheld" ? "leaf" : a.status === "dismissed" ? "neutral" : "amber"}>{a.status.replace("_", " ")}</Badge>
              {(a.status === "submitted" || a.status === "under_review") && (
                <span className="flex gap-2"><Button size="sm" variant="gold" onClick={() => run(() => decideTournamentAppeal(a.id, true))}>Uphold</Button><Button size="sm" variant="light" onClick={() => run(() => decideTournamentAppeal(a.id, false))}>Dismiss</Button></span>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

// ───────────────────────── Analytics ─────────────────────────

export function AdminAnalytics() {
  const s = useDemo();
  const byCity = useMemo(() => {
    const m = new Map<string, number>();
    s.schools.forEach((x) => m.set(x.city, (m.get(x.city) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label: label.split(" ")[0], value }));
  }, [s.schools]);
  const bySubject = useMemo(() => {
    const m = new Map<string, number>();
    s.tutors.forEach((t) => t.subjects.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, value]) => ({ label: subjectById(k).short, value }));
  }, [s.tutors]);
  const reportsByCat = ["message", "tutor_conduct", "content", "safeguarding", "payment"].map((c) => ({ label: c.split("_")[0], value: s.reports.filter((r) => r.category === c).length }));
  return (
    <>
      <PageHeader dark eyebrow="Analytics" title="Platform analytics (sample)" description="Aggregates only, no individual learner appears in platform analytics." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel dark title="Schools by city"><Bars label="Schools by city" data={byCity} color="var(--color-gold)" /></Panel>
        <Panel dark title="Tutors by subject"><Bars label="Tutors by subject" data={bySubject} color="var(--color-azure)" /></Panel>
        <Panel dark title="Reports by category"><Bars label="Reports by category" data={reportsByCat} color="var(--color-iris)" /></Panel>
      </div>
    </>
  );
}

// ───────────────────────── Finance (mock) ─────────────────────────

export function AdminFinance() {
  const s = useDemo();
  const paid = s.bookings.filter((b) => ["confirmed", "in_session", "completed"].includes(b.status));
  const gmv = paid.reduce((a, b) => a + b.price.total, 0);
  const serviceFees = paid.reduce((a, b) => a + b.price.platformFee, 0);
  const vat = paid.reduce((a, b) => a + b.price.vat, 0);
  const commission = s.ledger.filter((l) => l.kind === "commission").reduce((a, l) => a - l.amount, 0);
  const payouts = s.ledger.filter((l) => l.kind === "payout").reduce((a, l) => a - l.amount, 0);
  const owed = s.ledger.filter((l) => l.status === "available").reduce((a, l) => a + l.amount, 0);
  const schoolFees = s.feePayments.reduce((a, p) => a + p.amount, 0);
  const exportCsv = () => {
    const rows = [["id", "tutor", "kind", "amount_ngn", "status", "at", "memo"], ...s.ledger.map((l) => [l.id, l.tutorId, l.kind, String(l.amount), l.status, l.at, `"${l.memo.replace(/"/g, "'")}"`])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lumen-demo-tutor-ledger.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <PageHeader dark eyebrow="Finance" title="Mock financial reports" description="Derived from the demo ledger. No payment provider is connected; nothing here represents real money." actions={<Button size="sm" variant="light" icon={<Download className="size-4" />} onClick={exportCsv}>Export ledger CSV</Button>} />
      <div className="mb-4"><DemoBadge label="Mock data, not accounting records" /></div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tutoring GMV (paid bookings)", gmv], ["Service fees", serviceFees], ["VAT collected on fees (7.5%)", vat], ["Commission earned (15%)", commission],
          ["Tutor payouts (simulated)", payouts], ["Owed to tutors (available)", owed], ["School fee payments recorded", schoolFees], ["Platform revenue (fees + commission)", serviceFees + commission],
        ].map(([k, v]) => <div key={k as string} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><dt className="text-xs text-iris-soft">{k}</dt><dd className="mt-1 font-display text-2xl font-semibold text-white tabular">{naira(v as number)}</dd></div>)}
      </dl>
    </>
  );
}

// ───────────────────────── Audit ─────────────────────────

export function AdminAudit() {
  const s = useDemo();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const list = s.audit.filter((a) => (!role || a.actorRole === role) && (!q || `${a.summary} ${a.action} ${a.actor} ${a.entity}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHeader dark eyebrow="Audit log" title="Every action, attributed" description="Append-only in production (write-once storage, retained for 7 years). Includes demo persona switches so you can follow the walkthrough." />
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-[14rem] flex-1"><span className="sr-only">Search audit log</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actions, actors, entities" className={cn(darkInput, "w-full pl-9")} /></label>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Actor role" className="rounded-xl border border-white/15 bg-[#161616] px-3 py-2 text-sm text-white">
          <option value="">All roles</option>{["learner", "guardian", "school_admin", "teacher", "tutor", "platform_admin", "system"].map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[52rem] text-sm">
          <caption className="sr-only">Audit events</caption>
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-iris-soft"><tr><th className="px-4 py-3">When (WAT)</th><th>Actor</th><th>Action</th><th>Entity</th><th>Tenant</th><th>Summary</th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t border-white/10 align-top text-white/90">
                <td className="whitespace-nowrap px-4 py-2.5 tabular">{fmtDateTime(a.at)}</td>
                <td><span className="block text-white">{a.actor}</span><span className="text-xs text-iris-soft">{a.actorRole.replace("_", " ")}</span></td>
                <td className="font-mono text-xs text-gold">{a.action}</td>
                <td className="font-mono text-xs">{a.entity}</td>
                <td className="text-xs">{a.tenantId}</td>
                <td>{a.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
