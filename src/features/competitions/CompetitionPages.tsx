"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Camera, Clock, Eye, Gavel, Lock, Scale, ShieldCheck, Shuffle, Trophy } from "lucide-react";
import { useDemo, usePersona } from "@/lib/demo/store";
import { fileAppeal, optInTournament, withdrawTournament } from "@/lib/services/platform";
import { run } from "@/lib/services/core";
import { leaderboard, schoolById } from "@/lib/selectors";
import { HOME_SCHOOL_ID } from "@/lib/seed/schools";
import { fmtDate } from "@/lib/time";
import { cn } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/shell/PageHeader";
import { Badge, SampleLabel } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";

export function TournamentList() {
  const s = useDemo();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {s.tournaments.map((t) => (
        <Link key={t.id} href={`/competitions/${t.slug}`} className="group grid overflow-hidden rounded-3xl border border-line bg-paper transition-shadow hover:shadow-lift">
          <div className="relative h-36 border-b-2 border-ink" style={{ background: ["#1F5BFF", "#FF3D8B", "#00B85C"][s.tournaments.indexOf(t) % 3] }}>
            <Trophy className="absolute bottom-4 left-5 size-10 text-gold" aria-hidden />
            <Badge tone={t.status === "live" ? "gold" : t.status === "registration" ? "azure" : "neutral"} className="absolute right-4 top-4">{t.status === "live" ? "Live" : t.status === "registration" ? "Registration open" : "Completed"}</Badge>
          </div>
          <div className="grid gap-2 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{t.season}</p>
            <h2 className="font-display text-2xl text-ink group-hover:text-iris-600">{t.title}</h2>
            <p className="text-sm text-muted">{t.divisions.map((d) => `${d.name} ${d.ages}`).join(" · ")}</p>
            <p className="text-sm text-body">{t.registrations.filter((r) => r.status !== "withdrawn").length} teams · {t.subjects.slice(0, 3).join(", ")}{t.subjects.length > 3 ? "…" : ""}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-iris-600">Rules & leaderboard <ArrowRight className="size-4" aria-hidden /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function TournamentDetail({ slug }: { slug: string }) {
  const s = useDemo();
  const t = s.tournaments.find((x) => x.slug === slug);
  const [div, setDiv] = useState(t?.divisions[0].id ?? "");
  const [provisional, setProvisional] = useState(false);
  if (!t) return <EmptyState title="Tournament not found" action={<ButtonLink href="/competitions" size="sm">All tournaments</ButtonLink>} />;
  const rows = leaderboard(s, t, div, provisional);
  const appeals = s.appeals.filter((a) => a.tournamentId === t.id);
  const pendingVerification = t.results.some((r) => !r.verified && r.divisionId === div);

  return (
    <div className="grid gap-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="lb-title" className="rounded-3xl bg-ink p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="lb-title" className="text-2xl">Leaderboard</h2>
            <Tabs variant="dark" label="Division" value={div} onChange={setDiv} tabs={t.divisions.map((d) => ({ id: d.id, label: `${d.name} ${d.ages}` }))} />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-iris-soft"><input type="checkbox" checked={provisional} onChange={(e) => setProvisional(e.target.checked)} className="accent-gold" />Include provisional (unverified) results</label>
          {rows.length === 0 ? <p className="mt-6 text-iris-soft">{t.status === "registration" ? "No results yet, registration is open." : "No results for this division."}</p> : (
            <ol className="mt-4 grid gap-1.5">
              {rows.map((r) => (
                <li key={r.schoolId} className={cn("grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-2xl px-3 py-2.5", r.schoolId === HOME_SCHOOL_ID ? "bg-iris/30" : r.rank <= 3 ? "bg-white/10" : "bg-white/[0.04]")}>
                  <span className={cn("grid size-9 place-items-center rounded-full font-bold tabular", r.rank === 1 ? "bg-gold text-ink" : r.rank === 2 ? "bg-iris-soft text-ink" : r.rank === 3 ? "bg-[#d79a6b] text-ink" : "bg-white/10")}>{r.rank}</span>
                  <span className="min-w-0"><Link href={`/schools/${r.school.slug}`} className="block truncate font-semibold hover:underline">{r.school.name}</Link><span className="text-xs text-iris-soft">{r.school.city} · {r.rounds} round{r.rounds > 1 ? "s" : ""}{!r.verified && " · provisional"}</span></span>
                  <span className="font-display text-2xl tabular">{r.points}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-iris-soft">
            <SampleLabel className="text-iris-soft">Fictional schools and scores</SampleLabel>
            {pendingVerification && !provisional && <span>Some results await verification and are hidden.</span>}
          </div>
        </section>
        <section className="grid content-start gap-4">
          <Panel title="Rounds">
            <ol className="grid gap-3">
              {t.rounds.map((r) => (
                <li key={r.n} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-iris-wash text-sm font-bold text-iris-600">{r.n}</span><div><p className="font-semibold text-ink">{r.name} · {fmtDate(r.date)}</p><p className="text-sm text-muted">{r.format}</p></div></li>
              ))}
            </ol>
          </Panel>
          <Panel title="Privacy">
            <p className="flex gap-2 text-sm text-body"><Eye className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Only school names appear publicly. Individual learners are shown to their own school by a pseudonym (e.g. “Orbit Chi”). Every participant has recorded guardian consent.</p>
          </Panel>
        </section>
      </div>

      <section aria-labelledby="rules-title" className="grid gap-6 lg:grid-cols-3">
        <h2 id="rules-title" className="sr-only">Rules</h2>
        <Panel title="Scoring">
          <ul className="grid gap-2 text-sm text-body">
            <li className="flex gap-2"><Scale className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Accuracy: up to 100 points per round (team aggregate).</li>
            <li className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Speed bonus: capped at 12, accuracy always matters more.</li>
            <li className="flex gap-2"><Gavel className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Penalties: −5 for a confirmed integrity breach in a round.</li>
            <li className="flex gap-2"><Trophy className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Ties: fewer penalties, then higher accuracy, then a sudden-death question.</li>
          </ul>
        </Panel>
        <Panel title="Anti-cheating">
          <ul className="grid gap-2 text-sm text-body">
            <li className="flex gap-2"><Shuffle className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Questions drawn from a bank and shuffled per team.</li>
            <li className="flex gap-2"><Camera className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Each school appoints a named invigilator; rooms are shown on camera to the adjudicator (not recorded or stored in this demo).</li>
            <li className="flex gap-2"><Lock className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Full-screen lock and tab-switch logging on Lumen devices (planned).</li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />Statistical checks flag unusual answer patterns for human review, never automatic disqualification.</li>
          </ul>
        </Panel>
        <Panel title="Verification & appeals">
          <ol className="grid gap-2 text-sm text-body">
            <li>1. Results are provisional for 72 hours.</li>
            <li>2. An adjudicator verifies flagged rounds.</li>
            <li>3. Schools may appeal within 72 hours with reasons.</li>
            <li>4. A different adjudicator decides; upheld appeals void the question and recalculate.</li>
          </ol>
          {appeals.length > 0 && (
            <ul className="mt-3 grid gap-2 border-t border-hair pt-3">
              {appeals.map((a) => <li key={a.id} className="flex items-start justify-between gap-2 text-xs"><span><strong className="text-ink">{schoolById(s, a.schoolId)?.name}</strong> · round {a.round}: {a.reason}</span><Badge tone={a.status === "upheld" ? "leaf" : a.status === "dismissed" ? "neutral" : "amber"}>{a.status.replace("_", " ")}</Badge></li>)}
            </ul>
          )}
        </Panel>
      </section>
      <p className="text-center text-sm text-muted">Schools opt in from their portal. <Link href="/school/competitions" className="font-semibold text-iris-600">Enter as Iroko Gate →</Link></p>
    </div>
  );
}

export function SchoolCompetitions() {
  const s = useDemo();
  const persona = usePersona();
  const [tId, setTId] = useState(s.tournaments.find((t) => t.status !== "completed")!.id);
  const t = s.tournaments.find((x) => x.id === tId)!;
  const [divisionId, setDivisionId] = useState(t.divisions[0].id);
  const [team, setTeam] = useState("Iroko Gate Comets");
  const [size, setSize] = useState(4);
  const [consents, setConsents] = useState(4);
  const [appeal, setAppeal] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const mine = s.tournaments.flatMap((x) => x.registrations.filter((r) => r.schoolId === persona.tenantId).map((r) => ({ t: x, r })));
  return (
    <>
      <PageHeader eyebrow="Competitions" title="Opt in to school-versus-school tournaments" description="Participation is always opt-in. Every team member needs a recorded guardian consent, and learners appear publicly only as their school." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Register a team">
          <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); setBusy("opt"); await run(() => optInTournament(tId, divisionId, team, consents, size)); setBusy(null); }}>
            <SelectField label="Tournament" value={tId} onChange={(e) => { setTId(e.target.value); setDivisionId(s.tournaments.find((x) => x.id === e.target.value)!.divisions[0].id); }}>
              {s.tournaments.filter((x) => x.status !== "completed").map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
            </SelectField>
            <SelectField label="Division" value={divisionId} onChange={(e) => setDivisionId(e.target.value)}>
              {t.divisions.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.ages})</option>)}
            </SelectField>
            <TextField label="Team name" value={team} onChange={(e) => setTeam(e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Team size" type="number" min={2} max={6} value={size} onChange={(e) => setSize(Number(e.target.value))} />
              <TextField label="Guardian consents recorded" type="number" min={0} max={6} value={consents} onChange={(e) => setConsents(Number(e.target.value))} hint="Must equal team size" />
            </div>
            <Button type="submit" loading={busy === "opt"} disabled={consents < size}>Opt in</Button>
          </form>
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title="Our registrations">
            <ul className="grid gap-2">
              {mine.map(({ t: x, r }) => (
                <li key={x.id + r.divisionId} className="flex flex-wrap items-center gap-3 rounded-2xl bg-ivory p-3 text-sm">
                  <span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{r.teamName}</span><span className="text-xs text-muted">{x.title} · {x.divisions.find((d) => d.id === r.divisionId)?.name} · {r.guardianConsents}/{r.teamSize} consents</span></span>
                  <Badge tone={r.status === "verified" ? "leaf" : r.status === "withdrawn" ? "neutral" : "amber"}>{r.status.replace("_", " ")}</Badge>
                  {r.status !== "withdrawn" && x.status !== "completed" && <Button size="sm" variant="ghost" onClick={() => run(() => withdrawTournament(x.id, r.divisionId))}>Withdraw</Button>}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Appeal a result">
            <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); setBusy("ap"); const r = await run(() => fileAppeal("trn-harmattan", 1, appeal).then(() => true)); setBusy(null); if (r) setAppeal(""); }}>
              <TextareaField label="Harmattan League · Round 1" value={appeal} onChange={(e) => setAppeal(e.target.value)} hint="Describe the question or ruling you're appealing (15+ characters)." />
              <Button type="submit" variant="outline" loading={busy === "ap"} className="w-fit">File appeal</Button>
            </form>
            <p className="mt-3 text-xs text-muted">Appeals within 72 hours. <Link href="/competitions/harmattan-quiz-league-2026" className="font-semibold text-iris-600">Public rules</Link></p>
          </Panel>
        </div>
      </div>
    </>
  );
}

