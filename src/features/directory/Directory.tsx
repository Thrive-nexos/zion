"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, Info, List, Map as MapIcon, Search, X } from "lucide-react";
import type { Curriculum, Facility, School, SchoolType } from "@/lib/domain/types";
import { useDemo } from "@/lib/demo/store";
import { compositeScore, SCORE_WEIGHTS } from "@/lib/seed/schools";
import { CITIES } from "@/lib/seed/catalog";
import { cn, nairaCompact } from "@/lib/utils";
import { NigeriaMap } from "@/components/NigeriaMap";
import { Badge, SampleLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Charts";
import { EmptyState } from "@/components/ui/Misc";

const CURRICULA: Curriculum[] = ["Nigerian (NERDC)", "British (Cambridge)", "American", "Montessori", "IB", "Blended"];
const TYPES: SchoolType[] = ["Nursery & Primary", "Primary", "Primary & Secondary", "Secondary"];
const FACILITIES: Facility[] = ["Science labs", "ICT lab", "Library", "Sports field", "Swimming pool", "Boarding", "School bus", "Sick bay & nurse", "Solar backup", "Accessible ramps"];

export function Directory({ initialCity }: { initialCity?: string }) {
  const s = useDemo();
  const [q, setQ] = useState("");
  const [city, setCity] = useState(initialCity ?? "");
  const [curr, setCurr] = useState<Curriculum | "">("");
  const [type, setType] = useState<SchoolType | "">("");
  const [maxFee, setMaxFee] = useState(4_000_000);
  const [fac, setFac] = useState<Facility[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<"score" | "fee" | "name">("score");
  const [view, setView] = useState<"list" | "map">("list");
  const [selected, setSelected] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return s.schools
      .filter((x) =>
        (!term || x.name.toLowerCase().includes(term) || x.city.toLowerCase().includes(term) || x.area.toLowerCase().includes(term)) &&
        (!city || x.city === city) && (!curr || x.curricula.includes(curr)) && (!type || x.type === type) && x.feeRangeNGN[0] <= maxFee &&
        fac.every((f) => x.facilities.includes(f)) && (!verifiedOnly || x.verification === "verified"))
      .sort((a, b) => (sort === "score" ? compositeScore(b) - compositeScore(a) : sort === "fee" ? a.feeRangeNGN[0] - b.feeRangeNGN[0] : a.name.localeCompare(b.name)));
  }, [s.schools, q, city, curr, type, maxFee, fac, verifiedOnly, sort]);

  const clear = () => { setQ(""); setCity(""); setCurr(""); setType(""); setMaxFee(4_000_000); setFac([]); setVerifiedOnly(false); };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-3xl border border-line bg-paper p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-[14rem] flex-1">
            <span className="sr-only">Search schools or cities</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a school, city or area, try “Lekki” or “Kano”" className="w-full rounded-xl border border-line bg-ivory py-2.5 pl-10 pr-3 text-sm focus:border-iris focus:outline-none focus:ring-4 focus:ring-iris/15" />
          </label>
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" className="rounded-xl border border-line bg-paper px-3 py-2.5 text-sm"><option value="">All cities</option>{Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}</select>
          <select value={curr} onChange={(e) => setCurr(e.target.value as Curriculum | "")} aria-label="Curriculum" className="rounded-xl border border-line bg-paper px-3 py-2.5 text-sm"><option value="">Any curriculum</option>{CURRICULA.map((c) => <option key={c}>{c}</option>)}</select>
          <select value={type} onChange={(e) => setType(e.target.value as SchoolType | "")} aria-label="School type" className="rounded-xl border border-line bg-paper px-3 py-2.5 text-sm"><option value="">Any level</option>{TYPES.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-sm text-body">Fees from up to <strong className="tabular text-ink">{nairaCompact(maxFee)}</strong>/term
            <input type="range" min={100_000} max={4_000_000} step={50_000} value={maxFee} onChange={(e) => setMaxFee(Number(e.target.value))} className="accent-iris" aria-label="Maximum starting fee per term" />
          </label>
          <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-iris" />Verified only</label>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" role="group" aria-label="Facilities">
          {FACILITIES.map((f) => {
            const on = fac.includes(f);
            return <button key={f} type="button" aria-pressed={on} onClick={() => setFac((x) => (on ? x.filter((y) => y !== f) : [...x, f]))} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", on ? "bg-ink text-ivory" : "bg-sand text-body hover:bg-iris-wash")}>{f}</button>;
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite"><strong className="text-ink">{list.length}</strong> schools · <SampleLabel>fictional schools, sample scores</SampleLabel></p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">Sort<select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"><option value="score">Lumen score</option><option value="fee">Lowest fees</option><option value="name">Name</option></select></label>
          <div className="flex rounded-full bg-sand p-0.5 lg:hidden" role="group" aria-label="View">
            <button aria-pressed={view === "list"} onClick={() => setView("list")} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold", view === "list" ? "bg-ink text-ivory" : "text-muted")}><List className="size-4" aria-hidden />List</button>
            <button aria-pressed={view === "map"} onClick={() => setView("map")} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold", view === "map" ? "bg-ink text-ivory" : "text-muted")}><MapIcon className="size-4" aria-hidden />Map</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className={cn("lg:sticky lg:top-24 lg:block lg:self-start", view === "map" ? "block" : "hidden")}>
          <div className="rounded-3xl border border-line bg-paper p-4">
            <NigeriaMap schools={list} selectedId={selected} onSelect={(id) => { setSelected(id); document.getElementById(`school-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }} />
            <p className="mt-2 text-xs text-muted">City-level positions on a stylised map. No third-party map service is loaded.</p>
          </div>
        </div>
        <ul className={cn("grid content-start gap-3 lg:grid", view === "list" ? "grid" : "hidden")}>
          {list.map((x, i) => <SchoolRow key={x.id} school={x} rank={sort === "score" ? i + 1 : null} active={x.id === selected} onHover={() => setSelected(x.id)} />)}
          {list.length === 0 && <EmptyState title="No schools match" action={<Button size="sm" onClick={clear} icon={<X className="size-4" />}>Clear filters</Button>} />}
        </ul>
      </div>
    </div>
  );
}

function SchoolRow({ school: x, rank, active, onHover }: { school: School; rank: number | null; active: boolean; onHover: () => void }) {
  const score = compositeScore(x);
  return (
    <li id={`school-${x.id}`} onMouseEnter={onHover} onFocus={onHover}>
      <Link href={`/schools/${x.slug}`} className={cn("grid gap-3 rounded-3xl border bg-paper p-4 transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center", active ? "border-iris" : "border-line hover:border-iris")}>
        <span className="grid size-12 place-items-center rounded-2xl font-display text-xl font-semibold text-white" style={{ background: x.accent }} aria-hidden>{x.name[0]}</span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{x.name}</span>
            {x.verification === "verified" ? <Badge tone="leaf" icon={<BadgeCheck className="size-3" aria-hidden />}>Verified</Badge> : <Badge tone="amber">Verification in progress</Badge>}
          </span>
          <span className="block text-sm text-muted">{x.area}, {x.city} · {x.type} · {x.curricula.join(", ")}</span>
          <span className="block text-xs text-muted">Fees {nairaCompact(x.feeRangeNGN[0])}–{nairaCompact(x.feeRangeNGN[1])} per term · {x.studentsPerTeacher}:1 learners per teacher</span>
        </span>
        <span className="text-left sm:text-right">
          <span className="font-display text-3xl font-semibold text-ink tabular">{score}</span>
          <span className="block text-xs text-muted">{rank ? `#${rank} · ` : ""}sample score</span>
        </span>
      </Link>
    </li>
  );
}

export function SchoolProfile({ slug }: { slug: string }) {
  const s = useDemo();
  const x = s.schools.find((y) => y.slug === slug);
  if (!x) return <EmptyState title="School not found" />;
  const score = compositeScore(x);
  const parts: { key: keyof typeof SCORE_WEIGHTS; label: string; source: string }[] = [
    { key: "academics", label: "Academics", source: "Sample exam-readiness data (fictional)" },
    { key: "safeguarding", label: "Safeguarding", source: "Verification checklist, policy review, incident handling" },
    { key: "teaching", label: "Teaching capacity", source: "Learners per teacher, staff training records" },
    { key: "facilities", label: "Facilities", source: "Verified facility list" },
    { key: "parentVoice", label: "Parent voice", source: "Sample guardian survey (fictional)" },
  ];
  const results = s.tournaments.flatMap((t) => t.results.filter((r) => r.schoolId === x.id && r.verified).map((r) => ({ t, r })));
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-3xl font-display text-3xl font-semibold text-white" style={{ background: x.accent }} aria-hidden>{x.name[0]}</span>
          <div>
            <h1 className="text-4xl text-ink sm:text-5xl">{x.name}</h1>
            <p className="text-muted"><em>“{x.motto}”</em> · {x.area}, {x.city}, {x.state} State · founded {x.founded}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {x.verification === "verified" ? <Badge tone="leaf" icon={<BadgeCheck className="size-3" aria-hidden />}>Verified on Lumen</Badge> : <Badge tone="amber">Verification in progress</Badge>}
          {x.onPlatform && <Badge tone="iris">Uses Lumen for school management</Badge>}
          {x.competitionOptIn && <Badge tone="gold">Competes in quiz leagues</Badge>}
        </div>
        <p className="text-lg leading-relaxed text-body">{x.description}</p>
        <dl className="grid gap-3 sm:grid-cols-3">
          {[["Level", x.type], ["Curricula", x.curricula.join(", ")], ["Fees per term", `${nairaCompact(x.feeRangeNGN[0])}–${nairaCompact(x.feeRangeNGN[1])}`], ["Learners", x.students.toLocaleString()], ["Learners per teacher", `${x.studentsPerTeacher}:1`], ["Founded", String(x.founded)]].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-paper p-4"><dt className="text-xs font-bold uppercase tracking-wider text-muted">{k}</dt><dd className="mt-1 font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
        <section>
          <h2 className="text-2xl text-ink">Facilities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{x.facilities.map((f) => <li key={f} className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-body">{f}</li>)}</ul>
        </section>
        {results.length > 0 && (
          <section>
            <h2 className="text-2xl text-ink">Competition record</h2>
            <ul className="mt-3 grid gap-2">{results.slice(0, 4).map(({ t, r }) => <li key={t.id + r.divisionId + r.round} className="flex justify-between rounded-xl bg-paper px-4 py-2 text-sm"><span>{t.title} · {t.divisions.find((d) => d.id === r.divisionId)?.name} · R{r.round}</span><span className="font-semibold tabular">{r.accuracy + r.speedBonus - r.penalties} pts</span></li>)}</ul>
          </section>
        )}
      </div>
      <aside className="grid content-start gap-4">
        <section className="rounded-3xl bg-ink p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">Lumen score (sample)</p>
          <p className="font-display text-6xl font-semibold tabular">{score}<span className="text-2xl text-iris-soft">/100</span></p>
          <ul className="mt-4 grid gap-3">
            {parts.map((p) => (
              <li key={p.key}>
                <div className="flex justify-between text-sm"><span>{p.label} <span className="text-white/50">× {SCORE_WEIGHTS[p.key] * 100}%</span></span><span className="font-semibold tabular">{x.scores[p.key]}</span></div>
                <Meter value={x.scores[p.key]} tone="gold" label={`${p.label} score`} className="mt-1 bg-white/10" />
                <p className="mt-0.5 text-[0.7rem] text-white/50">{p.source}</p>
              </li>
            ))}
          </ul>
          <Link href="/schools/methodology" className="mt-4 inline-block text-sm font-semibold text-gold hover:underline">How this is calculated →</Link>
        </section>
        <p className="flex gap-2 rounded-2xl border border-amber/40 bg-amber-wash p-4 text-sm text-amber"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />This school and its score are fictional sample data, not authoritative, not an endorsement, and not a substitute for visiting a school.</p>
        <div className="rounded-3xl border border-line bg-paper p-4"><NigeriaMap schools={[x]} selectedId={x.id} showCities /></div>
      </aside>
    </div>
  );
}
