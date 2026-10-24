"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Clock, Plus, Trash2, Video, Wallet } from "lucide-react";
import type { AvailabilityWindow } from "@/lib/domain/types";
import { useDemo, usePersona } from "@/lib/demo/store";
import { completeSession, joinSession, requestPayout, updateAvailability } from "@/lib/services/booking";
import { run } from "@/lib/services/core";
import { hoursTaught, ledgerFor, studentById, tutorOf } from "@/lib/selectors";
import { subjectById } from "@/lib/seed/catalog";
import { DEMO_NOW, fmtDate, fmtDateTime, fmtDay, fmtTime, tzAbbrev, WEEKDAYS_LONG } from "@/lib/time";
import { cn, naira } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Bars } from "@/components/ui/Charts";
import { EmptyState } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Tabs";

function useTutor() {
  const s = useDemo();
  const persona = usePersona();
  const tutor = tutorOf(s, persona.subjectId)!;
  const bookings = s.bookings.filter((b) => b.tutorId === tutor.id);
  return { s, tutor, bookings };
}

/** Learners appear to tutors by first name only; minors are always marked. */
function learnerLabel(s: ReturnType<typeof useDemo>, id: string) {
  const st = studentById(s, id);
  if (!st) return "Learner (outside demo school)";
  return `${st.firstName}${st.age < 18 ? ` · age ${st.age}` : ""}`;
}

export function TutorToday() {
  const { s, tutor, bookings } = useTutor();
  const [busy, setBusy] = useState<string | null>(null);
  const today = bookings.filter((b) => fmtDay(b.startsAt) === fmtDay(DEMO_NOW) && b.status !== "cancelled");
  const upcoming = bookings.filter((b) => new Date(b.startsAt) > DEMO_NOW && ["confirmed", "awaiting_payment", "pending_guardian"].includes(b.status) && !today.includes(b));
  const led = ledgerFor(s, tutor.id);
  const weekHours = hoursTaught(bookings.filter((b) => new Date(b.startsAt) >= new Date("2026-10-19T00:00:00+01:00")));
  const act = async (k: string, fn: () => Promise<unknown>) => { setBusy(k); await run(fn); setBusy(null); };

  return (
    <>
      <PageHeader eyebrow={`${fmtDay(DEMO_NOW)} · ${tzAbbrev(tutor.timezone)}`} title={`Welcome back, ${tutor.name.split(" ")[1]}.`} description={`${naira(tutor.ratePerHourNGN)}/hr · ${tutor.stage === "probation" ? "on probation" : "fully vetted"} · ${tutor.sessionsTaught.toLocaleString()} sessions taught`} />
      <div className="mb-6 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-3">
        <div className="bg-[#111111] p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-gold">Available to pay out</p><p className="mt-1 font-display text-3xl font-semibold tabular">{naira(led.available)}</p></div>
        <div className="bg-[#111111] p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-gold">Hours since last Monday</p><p className="mt-1 font-display text-3xl font-semibold tabular">{weekHours.toFixed(1)} h</p></div>
        <div className="bg-[#111111] p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-gold">Upcoming sessions</p><p className="mt-1 font-display text-3xl font-semibold tabular">{upcoming.length + today.filter((b) => b.status === "confirmed").length}</p></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section data-tour="today-sessions" className="rounded-3xl border border-line bg-paper p-5">
          <h2 className="font-sans text-base font-bold text-ink">Today</h2>
          {today.length === 0 ? <p className="mt-2 text-sm text-muted">No sessions today.</p> : (
            <ul className="mt-3 grid gap-3">
              {today.map((b) => (
                <li key={b.id} className="rounded-2xl bg-iris-wash/60 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-2xl font-semibold text-ink tabular">{fmtTime(b.startsAt, tutor.timezone)}</span>
                    <div className="min-w-0 flex-1"><p className="font-semibold text-ink">{subjectById(b.subjectId).name} · {learnerLabel(s, b.studentId)}</p><p className="text-xs text-muted">{b.minutes} min · {b.reference} · guardian-approved</p></div>
                    <Badge tone={b.status === "completed" ? "leaf" : b.status === "in_session" ? "gold" : "iris"}>{b.status.replace("_", " ")}</Badge>
                  </div>
                  {b.status !== "completed" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!b.attendance?.tutorJoinedAt && <Button size="sm" icon={<Video className="size-4" />} loading={busy === "j" + b.id} onClick={() => act("j" + b.id, () => joinSession(b.id, "tutor"))}>Start session</Button>}
                      <Button size="sm" variant="outline" loading={busy === "c" + b.id} onClick={() => act("c" + b.id, async () => { await joinSession(b.id, "learner"); await completeSession(b.id); })}>Complete (simulate learner attended)</Button>
                    </div>
                  )}
                  {b.status === "completed" && <p className="mt-2 text-sm text-leaf">Completed, {naira(b.price.tutorShare)} added to your available balance.</p>}
                </li>
              ))}
            </ul>
          )}
          {upcoming.length > 0 && (
            <>
              <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">Coming up</h3>
              <ul className="mt-2 grid gap-2">
                {upcoming.map((b) => (
                  <li key={b.id}><Link href={`/bookings/${b.id}`} className="flex flex-wrap items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-sand">
                    <span className="w-32 text-muted tabular">{fmtDay(b.startsAt, tutor.timezone)} {fmtTime(b.startsAt, tutor.timezone)}</span>
                    <span className="flex-1 font-semibold text-ink">{subjectById(b.subjectId).short} · {learnerLabel(s, b.studentId)}</span>
                    <Badge tone={b.status === "confirmed" ? "leaf" : "amber"}>{b.status.replace("_", " ")}</Badge>
                  </Link></li>
                ))}
              </ul>
            </>
          )}
        </section>
        <div className="grid content-start gap-6">
          <Panel title="Safeguarding reminders">
            <ul className="grid gap-2 text-sm text-body">
              <li>• Keep all contact inside Lumen threads, guardians can read them.</li>
              <li>• Never share phone numbers, social handles or meet in person.</li>
              <li>• Sessions with under-18s start only after guardian approval.</li>
            </ul>
          </Panel>
          <Panel title="Quick links">
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/tutor/earnings" size="sm" variant="outline" icon={<Wallet className="size-4" />}>Earnings</ButtonLink>
              <ButtonLink href="/tutor/schedule" size="sm" variant="outline" icon={<Clock className="size-4" />}>Availability</ButtonLink>
              <ButtonLink href={`/tutors/${tutor.slug}`} size="sm" variant="outline">Public profile</ButtonLink>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function TutorSchedule() {
  const { tutor } = useTutor();
  const [rows, setRows] = useState<AvailabilityWindow[]>(tutor.availability);
  const [busy, setBusy] = useState(false);
  const update = (i: number, patch: Partial<AvailabilityWindow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      <PageHeader eyebrow="Availability" title="When you teach" description={`Set hours in your own time zone (${tutor.timezone}, ${tzAbbrev(tutor.timezone)}). Families see them converted to theirs, and school hours are blocked automatically for school-linked learners.`} />
      <Panel title="Weekly windows">
        <ul className="grid gap-2">
          {rows.map((w, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 rounded-2xl bg-ivory p-3">
              <select aria-label="Day" value={w.day} onChange={(e) => update(i, { day: Number(e.target.value) as AvailabilityWindow["day"] })} className="rounded-lg border border-line bg-paper px-2 py-1.5 text-sm">
                {WEEKDAYS_LONG.map((d, k) => <option key={d} value={k}>{d}</option>)}
              </select>
              <input aria-label="Start time" type="time" step={1800} value={w.start} onChange={(e) => update(i, { start: e.target.value })} className="rounded-lg border border-line bg-paper px-2 py-1.5 text-sm" />
              <span className="text-muted">to</span>
              <input aria-label="End time" type="time" step={1800} value={w.end} onChange={(e) => update(i, { end: e.target.value })} className={cn("rounded-lg border bg-paper px-2 py-1.5 text-sm", w.end <= w.start ? "border-ember" : "border-line")} />
              <Button size="sm" variant="ghost" aria-label="Remove window" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} icon={<Trash2 className="size-4" />} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={<Plus className="size-4" />} onClick={() => setRows((r) => [...r, { day: 5, start: "10:00", end: "12:00" }])}>Add window</Button>
          <Button size="sm" loading={busy} disabled={rows.some((w) => w.end <= w.start)} onClick={async () => { setBusy(true); await run(() => updateAvailability(tutor.id, rows)); setBusy(false); }}>Save availability</Button>
        </div>
      </Panel>
    </>
  );
}

export function TutorSessions() {
  const { s, tutor, bookings } = useTutor();
  const [tab, setTab] = useState<"upcoming" | "history">("history");
  const list = bookings.filter((b) => (tab === "history" ? b.status === "completed" : !["completed", "cancelled", "declined"].includes(b.status))).sort((a, b) => (tab === "history" ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt)));
  return (
    <>
      <PageHeader eyebrow="Sessions" title="Session history" description={`${hoursTaught(bookings).toFixed(1)} hours taught on Lumen in this demo period. Attendance is logged automatically when you and the learner join.`} />
      <Tabs label="Session list" value={tab} onChange={setTab} className="mb-4" tabs={[{ id: "history", label: "Completed" }, { id: "upcoming", label: "Upcoming" }]} />
      <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">Sessions</caption>
          <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">When ({tzAbbrev(tutor.timezone)})</th><th>Learner</th><th>Subject</th><th>Length</th><th>Attendance</th><th>Feedback</th><th>Net</th></tr></thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className="border-t border-hair">
                <td className="px-4 py-2.5"><Link href={`/bookings/${b.id}`} className="font-semibold text-ink hover:text-iris-600">{fmtDateTime(b.startsAt, tutor.timezone)}</Link></td>
                <td>{learnerLabel(s, b.studentId)}</td>
                <td>{subjectById(b.subjectId).short}</td>
                <td className="tabular">{b.minutes} min</td>
                <td>{b.attendance ? <Badge tone="leaf">Both joined</Badge> : <Badge>—</Badge>}</td>
                <td>{b.feedback ? "★".repeat(b.feedback.rating) : "—"}</td>
                <td className="font-semibold tabular">{naira(b.price.tutorShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="p-6"><EmptyState title="Nothing here yet" /></div>}
      </div>
    </>
  );
}

export function TutorEarnings() {
  const { s, tutor, bookings } = useTutor();
  const [busy, setBusy] = useState(false);
  const led = ledgerFor(s, tutor.id);
  const completed = bookings.filter((b) => b.status === "completed");
  const hours = hoursTaught(bookings);
  const gross = completed.reduce((a, b) => a + b.price.subtotal - b.price.trialDiscount, 0);
  const commission = completed.reduce((a, b) => a + b.price.commission, 0);
  const weeks = [-3, -2, -1, 0].map((w) => {
    const start = new Date(new Date("2026-10-26T00:00:00+01:00").getTime() + w * 7 * 86_400_000);
    const end = new Date(start.getTime() + 7 * 86_400_000);
    const inWeek = completed.filter((b) => new Date(b.startsAt) >= start && new Date(b.startsAt) < end);
    return { label: `w/c ${fmtDate(start).slice(0, 6)}`, value: inWeek.reduce((a, b) => a + b.price.tutorShare, 0), highlight: w === 0 };
  });
  return (
    <>
      <PageHeader eyebrow="Earnings" title="Hourly earnings, itemised" description="Every completed session credits your gross hourly rate, minus Lumen's 15% commission. Guardians pay the service fee and VAT separately, it never comes out of your rate." />
      <section data-tour="earnings-summary" className="mb-6 overflow-hidden rounded-3xl bg-[#111111] text-white">
        <div className="grid gap-px bg-white/10 sm:grid-cols-4">
          {[
            { k: "Hourly rate", v: naira(tutor.ratePerHourNGN) },
            { k: "Hours taught", v: `${hours.toFixed(1)} h` },
            { k: "Gross earned", v: naira(gross) },
            { k: "Net (after 15%)", v: naira(gross - commission) },
          ].map((x) => <div key={x.k} className="bg-[#111111] p-5"><p className="text-xs font-bold uppercase tracking-wider text-gold">{x.k}</p><p className="mt-1 font-display text-3xl font-semibold tabular">{x.v}</p></div>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div><p className="text-sm text-iris-soft">Available now</p><p className="font-display text-4xl font-semibold tabular text-gold">{naira(led.available)}</p><p className="text-xs text-white/60">Pending (sessions not yet taught): {naira(led.pending)} · Paid out to date: {naira(led.paidOut)}</p></div>
          <div className="grid gap-1 text-right">
            <Button variant="gold" loading={busy} disabled={led.available <= 0} onClick={async () => { setBusy(true); await run(() => requestPayout(tutor.id, led.available)); setBusy(false); }}>Request payout</Button>
            <DemoBadge label="Simulated bank transfer" className="justify-self-end" />
          </div>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <Panel title="Net earnings by week">
          <Bars label="Net earnings by week" data={weeks} format={(n) => naira(n)} color="var(--color-iris)" />
          <p className="mt-3 text-xs text-muted">Example: a 60-minute session at {naira(tutor.ratePerHourNGN)} → {naira(tutor.ratePerHourNGN * 0.15)} commission → {naira(tutor.ratePerHourNGN * 0.85)} to you.</p>
        </Panel>
        <Panel title="Ledger">
          <ul className="divide-y divide-hair">
            {led.entries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                {e.amount >= 0 ? <ArrowDownRight className="size-4 text-leaf" aria-hidden /> : <ArrowUpRight className="size-4 text-muted" aria-hidden />}
                <div className="min-w-0 flex-1"><p className="font-semibold text-ink">{e.kind.replace("_", " ")}</p><p className="truncate text-xs text-muted">{e.memo} · {fmtDate(e.at)}</p></div>
                <Badge tone={e.status === "available" ? "leaf" : e.status === "pending" ? "amber" : "neutral"}>{e.status.replace("_", " ")}</Badge>
                <span className={cn("w-28 text-right font-semibold tabular", e.amount >= 0 ? "text-ink" : "text-muted")}>{e.amount >= 0 ? "+" : "−"}{naira(Math.abs(e.amount))}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

export function TutorProfileAdmin() {
  const { tutor } = useTutor();
  const c = tutor.credentials;
  const rows = [
    ["Identity", c.identity], ["Qualifications", c.qualification], ["Subject test", `${c.subjectTest.status} · ${c.subjectTest.score ?? "–"}%`],
    ["Safeguarding test", `${c.safeguarding.status} · ${c.safeguarding.score ?? "–"}%`], ["Observed demo class", `${c.demoClass.status} · ${c.demoClass.score ?? "–"}%`], ["Background check", c.backgroundCheck],
  ];
  return (
    <>
      <PageHeader eyebrow="Profile & vetting" title="How families see you" actions={<ButtonLink href={`/tutors/${tutor.slug}`} size="sm">View public profile</ButtonLink>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Vetting record">
          <ul className="grid gap-2 text-sm">{rows.map(([k, v]) => <li key={k} className="flex justify-between gap-3 rounded-xl bg-ivory px-3 py-2"><span className="text-body">{k}</span><span className="font-semibold text-ink">{String(v).replace("simulated_pass", "verified (simulated)")}</span></li>)}</ul>
          <p className="mt-3 text-xs text-muted">Re-checks: safeguarding refresher every 12 months; background check every 3 years.</p>
        </Panel>
        <Panel title="Listing">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Rate</dt><dd className="font-semibold">{naira(tutor.ratePerHourNGN)}/hr</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Trial</dt><dd className="font-semibold">{naira(tutor.trialRateNGN)} / 30 min</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Subjects</dt><dd className="font-semibold">{tutor.subjects.map((x) => subjectById(x).short).join(", ")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Time zone</dt><dd className="font-semibold">{tutor.timezone}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">Rate changes apply to new bookings only and are logged. Want to see how new tutors qualify? <Link href="/become-a-tutor" className="font-semibold text-iris-600">Try the application flow</Link>.</p>
        </Panel>
      </div>
    </>
  );
}
